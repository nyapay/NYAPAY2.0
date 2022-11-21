
//choix du mode par l'administrateur
function SelectMode(mode) {
	
	window.localStorage.setItem("App-User-Mode", mode);
	
	if ( mode == 'debit' || mode == 'credit')
	{
		window.location.href = 'page-user.html';
	}
	if ( mode == 'admin' )
	{
		window.location.href = 'page-admin-dashboard.html';
	}
	
}


// verifier les droits
function GrantScanCard(){
	 var user_mode = window.localStorage.getItem("App-User-Mode");
	 var terminal_mode = results.rows.item(0).terminal_mode;
	 
	//if class in the scan message
	$("#scan-card-message").removeClass( "color-red-dark color-blue-dark" );
	
	
	// **** Mode test Terminal *** //
	var terminalTestMode = function(results){
			var terminal_mode = results.rows.item(0).terminal_mode;
			
			if (terminal_mode == 'test') 
			{
				notification_success("Mode test");
				$("#div-mode-credit").removeClass('d-none');
				$("#div-mode-debit").removeClass('d-none');
				AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé en mode Test pour tous les modes');
				$('#scan-card').hideMenu();
				$('#mode-card').showMenu();
				
			}
		
		};
		InforTerminal(terminalTestMode);
	
	
	nfc.addNdefListener(ReadGrantNfcCard);
	$("#scan-card-message").html('Scanner la carte');
	$('#scan-card').showMenu();
};


function CancelGrantScanCard() {
	
	nfc.removeNdefListener(ReadGrantNfcCard);
	$('#scan-card').hideMenu();
}

function CancelSelectMode() {
	
	$('#mode-card').hideMenu();
}

				
			
function NfcSuccess(result) {

}

function NfcFailure(reason) {
	notification_error("Rescanner la carte");
	
}


// verification des droits
function ReadGrantNfcCard(nfcEvent) {
	var tag_id 		= nfc.bytesToHexString(nfcEvent.tag.id);
	
	var scan_card_previous_message = $("#scan-card-message").html();
	$("#scan-card-message").html('Lecture en cours ...');
	
	var UseKey= function(results)
	{
		

		if (!nfcEvent.tag.ndefMessage || !nfcEvent.tag.ndefMessage[0])
		{
			notification_error("Une carte vide à été utilisée");
			AddLogSql('ERROR', 'Security', 'Grant: une carte vide à été utilisée');
			$("#scan-card-message").html(scan_card_previous_message);				
			return; //stop process
		}
		
		var PayloadCardContent = nfcEvent.tag.ndefMessage[0]["payload"];
		var card_content_encoded 	= nfc.bytesToString(PayloadCardContent).substring(3);	

		var len = results.rows.length; 
		
		for (var i=0; i<len; i++){
			
			var key_name = results.rows.item(i).name		

			var card_content_decrypted = CryptoJS.AES.decrypt(card_content_encoded, key_name);
			
			try {
			  var card_content_decrypted = card_content_decrypted.toString(CryptoJS.enc.Utf8);
			} catch (e) {
			  var card_content_decrypted = '';
			}
			
			// Sortir de la boucle si clé ok
			if (card_content_decrypted && card_content_decrypted  != '')
			{
				i = len + 1;
			}
			
		}
		
		// CHECK
		if (!card_content_decrypted || card_content_decrypted  == '')
		{
			notification_error("Problème de clé");
			$("#scan-card-message").html(scan_card_previous_message);
			return; //stop process
		}
		
		var card_content_decrypted = jQuery.parseJSON(card_content_decrypted);
						
		var tag_id_in_card 	= card_content_decrypted['tag_id'];
		var card_grant 		= card_content_decrypted['card_grant'];
		var card_number 	= card_content_decrypted['card_number'];
		
		// TAG ID VERIF 
		if (tag_id != tag_id_in_card)
		{
			notification_error("Cette carte à surement été copié");
			AddLogSql('ERROR', 'NFC', 'La carte ' + card_number +  ' a surement été copié. [ID dans data: '+ tag_id_in_card +'] [ID détécté: ' + tag_id +']' );	
			nfc_try_debit = 0;
			$("#scan-card-message").html(scan_card_previous_message);
			return; //stop process
		}

		
		/*FORCE PASS 
		
		var card_grant = '3';
		var card_number = 'TEST FORCE';
		*/
		
		var CheckTerminalMode = function(results){
			

			var terminal_mode = results.rows.item(0).terminal_mode;
			
			
			// **** Mode Normal *** //
			
		
			if (card_grant == '1') //debit 
			{
				if (terminal_mode == 'debit' || terminal_mode == 'all')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode debit');
					window.localStorage.setItem("App-User-Mode", 'debit');
					location.href = 'page-user.html';
				}
				else{
					AddLogSql('ERROR', 'Login', 'Authentification : Terminal bloqué sur le mode ' + terminal_mode + ' - Accès refusé pour la carte ' + card_number);
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					$("#scan-card-message").addClass( "color-red-dark" );					
					$("#scan-card-message").html("Vous n'avez pas de droit sur ce mode");					
				}

			}
			
			else if (card_grant == '2' ) //credit 
			{
				if (terminal_mode == 'credit' || terminal_mode == 'all')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode credit');
					window.localStorage.setItem("App-User-Mode", 'credit');
					location.href = 'page-user.html';
				}
				else{
					AddLogSql('ERROR', 'Login', 'Authentification : Terminal bloqué sur le mode ' + terminal_mode + ' - Accès refusé pour la carte ' + card_number);
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					$("#scan-card-message").addClass( "color-red-dark" );					
					$("#scan-card-message").html("Vous n'avez pas de droit sur ce mode");							
				}
			}
			
			else if (card_grant == '3' ) //choose debit,credit,admin 
			{
				
				
				$("#div-mode-credit").addClass('d-none');
				$("#div-mode-debit").addClass('d-none');
				
				if (terminal_mode == 'debit')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode debit ');
					$("#div-mode-debit").removeClass('d-none');
					$('#scan-card').hideMenu();
					$('#mode-card').showMenu();
				}
				
				else if (terminal_mode == 'credit')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode credit ');
					$("#div-mode-credit").removeClass('d-none');
					$('#scan-card').hideMenu();
					$('#mode-card').showMenu();

				}
				
				else if (terminal_mode == 'all')
				{
					$("#div-mode-credit").removeClass('d-none');
					$("#div-mode-debit").removeClass('d-none');
				
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour tous les modes ');
					$('#scan-card').hideMenu();
					$('#mode-card').showMenu();

				}
			}
			
			else 
			{
				AddLogSql('ERROR', 'Login', 'Authentification : Accès refusé pour la carte ' + card_number);
				navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
				window.localStorage.setItem("App-User-Mode", '');
				$("#scan-card-message").addClass( "color-red-dark" );					
				$("#scan-card-message").html("vous n'avez aucun droit");
			}
		
		};
		InforTerminal(CheckTerminalMode);
	}
	Getkey(UseKey);
}

