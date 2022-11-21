/** START - COMMON **/


var nfc_try_debit = 0;
var nfc_try_credit = 0;
var currency = window.localStorage.getItem("App-Currency");

var percentage_debit_commission = window.localStorage.getItem("App-Percentage-Debit-Commission");
var percentage_credit_commission = window.localStorage.getItem("App-Percentage-Credit-Commission");

var terminal_user = window.localStorage.getItem("App-Terminal-User");
var terminal_number = window.localStorage.getItem("App-Terminal-Number");
var user_mode = window.localStorage.getItem("App-User-Mode");

var resume_total_debit = window.localStorage.getItem("App-Resume-Total-Debit");
var resume_total_commission_debit = window.localStorage.getItem("App-Resume-Total-Commission-Debit");

var resume_total_credit = window.localStorage.getItem("App-Resume-Total-Credit");
var resume_total_commission_credit = window.localStorage.getItem("App-Resume-Total-Commission-Credit");

function CloseInfoCard(){
	
	$('.app-page-info').hide();
	$('.app-page-calc').show();
	
}


function PayScanCard(){
	
	var calc_amount = $(".calc_total_preview").html();
	

	//check if number
	if (calc_amount.match(/^\d*\.?\d+$/) == null)
	{
		notification_error('Merci de verifier votre calcul');
		return false ;
	};

	
	if ( !calc_amount || calc_amount <= 0 )
	{
		notification_error('Merci de verifier votre calcul');
		return false ;
	}
	
	if ( user_mode == 'debit')
	{
		var commission_percentage = percentage_debit_commission;
		var commission = Number(calc_amount) * (Number(commission_percentage)/100);
		var amount_with_com =  Number(calc_amount) + Number(commission);
		
		nfc.addTagDiscoveredListener(DebitNfcCard);
		nfc.addNdefListener(DebitNfcCard);
	}
	else if ( user_mode == 'credit')
	{
		var commission_percentage = percentage_credit_commission;
		var commission = Number(calc_amount) * (Number(commission_percentage)/100);
		var amount_with_com =  Number(calc_amount) - Number(commission);
		
		nfc.addTagDiscoveredListener(CreditNfcCard);
		nfc.addNdefListener(CreditNfcCard);
	}	

	
	
	$("#scan-card-message").html( amount_with_com + ' ' + currency );
	$(".calc_total").html(amount_with_com);
	$(".calc_total_commission").html(commission);
	$(".calc_total_commission_percentage").html(commission_percentage);
	$('#scan-card').showMenu();

}

function CancelPayScanCard(){
	
	var nfc_try_debit = 0; // remet à 0 nfc_try

	nfc.removeTagDiscoveredListener(DebitNfcCard);
	nfc.removeNdefListener(DebitNfcCard);
	
	nfc.removeTagDiscoveredListener(CreditNfcCard);
	nfc.removeNdefListener(CreditNfcCard);
	
	$(".calc_total_preview").html('0.00');
	$(".calc_total").html('0.00');
	$(".calc_total_commission").html('0.00');
	$(".calc_total_commission_percentage").html('0%');
	calc_debit_result = '';
	
	$('#scan-card').hideMenu();
}

/** END - COMMON **/


/** INFO CARD ***/

function InfoScanCard(){
	
	nfc.addTagDiscoveredListener(InfoNfcCard);
	nfc.addNdefListener(InfoNfcCard);
	$("#scan-card-message").html('Verification de la carte');
	$('#scan-card').showMenu();
}


function InfoNfcCard(nfcEvent) {
	var tag_id = nfc.bytesToHexString(nfcEvent.tag.id);
	
	var scan_card_previous_message = $("#scan-card-message").html();
	$("#scan-card-message").html('Lecture en cours ...');
	
	var UseKey= function(results)
	{
	
		var PayloadCardContent		= nfcEvent.tag.ndefMessage[0]["payload"];
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
	
		// VERIF
		if (!card_content_decrypted || card_content_decrypted  == '')
		{
			notification_error("Problème de clé");
			$("#scan-card-message").html(scan_card_previous_message);
			return; //stop process
		}
		
		
		
		//if class in the text amount
		$("#info_amount").removeClass( "text-danger text-success text-dark" );
		
		var card_content_decrypted = jQuery.parseJSON(card_content_decrypted);
		
		var card_amount = card_content_decrypted['card_amount'];
		var card_number = card_content_decrypted['card_number'];
		var card_name = card_content_decrypted['card_name'];
		var card_firstname = card_content_decrypted['card_firstname'];
		var card_state = card_content_decrypted['card_state'];
		var card_grant = card_content_decrypted['card_grant'];
		
		
		var amount = Number(card_amount);
		
		// TAG ID VERIF 
		if (tag_id != tag_id_in_card)
		{
			notification_error("Cette carte à surement été copié");
			AddLogSql('ERROR', 'NFC', 'La carte ' + card_number +  ' a surement été copié. [ID dans data: '+ tag_id_in_card +'] [ID détécté: ' + tag_id +']' );	
			nfc_try_debit = 0;
			$("#scan-card-message").html(scan_card_previous_message);
			return; //stop process
		}
		
		$("#info-scan-amount").html('0.00 ' + currency);
		
		$("#info-scan-result").addClass( "color-blue-dark" );
		$("#info-scan-result").html('Scan terminé');
		$("#info-scan-result-more").html('Carte lue avec succès');
		
		$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
		$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
		$("#info-scan-card-number").html(card_number);
		$("#info-scan-card-grant").html(card_grant);
		$("#info-scan-card-state").html(card_state);	
		
		$('#scan-card').hideMenu();
		navigator.vibrate(1000);
		
		$('.app-page-calc').hide();
		$('.app-page-info').show();
		
		nfc_try_debit = 0; // remet à 0 nfc_try

		nfc.removeTagDiscoveredListener(InfoNfcCard);
		nfc.removeNdefListener(InfoNfcCard);
	}
	Getkey(UseKey);
}

/*** CREDIT CARD ***/

function CreditNfcCard(nfcEvent) {
	var tag_id = nfc.bytesToHexString(nfcEvent.tag.id);
	
	var scan_card_previous_message = $("#scan-card-message").html();
	$("#scan-card-message").html('Lecture en cours ...');
	
	nfc_try_credit ++;
	
	var UseKey= function(results)
	{
		if (nfc_try_credit == 1) //1er esaie on essaye de décrypter
		{
			//console.log('nfc decryptage ' + JSON.stringify(nfcEvent.tag.ndefMessage));
			
			if (!nfcEvent.tag.ndefMessage || !nfcEvent.tag.ndefMessage[0])
			{
				notification_error("Une carte vide à été utilisée");
				AddLogSql('ERROR', 'Security', 'Debit: une carte vide à été utilisée');
				nfc_try_credit = 0;
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
		
			// VERIF
			if (!card_content_decrypted || card_content_decrypted  == '')
			{
				notification_error("Problème de clé");
				nfc_try_credit = 0;
				$("#scan-card-message").html(scan_card_previous_message);
				return; //stop process
			}
			
			//if class in the text amount
			$("#info_amount").removeClass( "text-danger text-success text-dark" );
			
			var card_content_decrypted = jQuery.parseJSON(card_content_decrypted);
			
			var tag_id_in_card 	= card_content_decrypted['tag_id'];
			var card_amount 	= card_content_decrypted['card_amount'];
			var card_number 	= card_content_decrypted['card_number'];
			var card_name 		= card_content_decrypted['card_name'];
			var card_firstname 	= card_content_decrypted['card_firstname'];
			var card_state 		= card_content_decrypted['card_state'];
			var card_grant		= card_content_decrypted['card_grant'];
			
			// TAG ID VERIF 
			if (tag_id != tag_id_in_card)
			{
				notification_error("Cette carte à surement été copié");
				AddLogSql('ERROR', 'NFC', 'La carte ' + card_number +  ' a surement été copié. [ID dans data: '+ tag_id_in_card +'] [ID détécté: ' + tag_id +']' );	
				nfc_try_debit = 0;
				$("#scan-card-message").html(scan_card_previous_message);
				return; //stop process
			}
		}
		
		if (nfc_try_credit > 1) //verifier si la carte est bien vide
		{
			PayloadCardContent = nfcEvent.tag.ndefMessage[0]["payload"];
			if (PayloadCardContent)
			{
				
				notification_error("Cette carte contient des données");
				AddLogSql('ERROR', 'Security', "Debit: la carte utilisée contient des données" );
				nfc_try_credit = 0;
				$("#scan-card-message").html(scan_card_previous_message);				
				return; //stop process
				
			}
		}
		
		var credit_amount = $(".calc_total").html();
		var credit_commission = $(".calc_total_commission").html();
		var credit_percentage = $(".calc_total_commission_percentage").html();
		
		var type = 2; 
		
		
		
		function NfcCardFailure(info)
		{
			notification_error("Erreur d'écriture (1), rescanner la carte");
			AddLogSql('ERROR', 'NFC', 'Echec de lecture pour crediter ' + info);	
		}
	
		//if class in the text amount
		$("#info-scan-result").removeClass( "color-red-dark color-blue-dark" );
			
		var AddCreditTransaction = function (results){

			if (results.rows.length==0) //PASS 
			{
				
				// on devrait avoir un numero de carte, si ce n'est pas le cas, infromer l'opérateur
				if(!card_number)
				{
					notification_error("Une carte vide à été utilisée (2)");
					AddLogSql('ERROR', 'Security', 'Forcage ecriture : une carte vide à été utilisée');
					nfc_try_credit = 0;
					$("#scan-card-message").html(scan_card_previous_message);					
					return; //stop process
				}
				
				// force Active
				card_state = 'Active'
				
				// MASTER KEY
				var UseMasterKey= function(results)
				{
					var MasterKey = results.rows.item(0).name;
					var amount = Number(card_amount) + Number(credit_amount);
					
					var card_content = 
					{
						"tag_id":tag_id, 
						"card_amount":amount, 
						"card_number":card_number, 
						"card_name":card_name, 
						"card_firstname":card_firstname, 
						"card_state":card_state, 
						"card_grant":card_grant
					};
					
					var card_content_encoded = CryptoJS.AES.encrypt(JSON.stringify(card_content), MasterKey).toString();
					
					
					var message = [
					  ndef.textRecord(card_content_encoded)
					];

				
					function CreditTransaction(){
						
						var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
						var card_amount = amount.toFixed(2);
						
						PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, credit_amount, credit_commission, credit_percentage, type, key, card_amount, card_grant);
						
						
						$("#info-scan-amount").html(credit_amount + ' ' + currency);
							
						$("#info-scan-result").addClass( "color-blue-dark" );
						$("#info-scan-result").html('Transaction reussie');
						$("#info-scan-result-more").html('Carte creditée');
						
						$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
						$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
						$("#info-scan-card-number").html(card_number);
						$("#info-scan-card-grant").html(card_grant);
						$("#info-scan-card-state").html(card_state);	
						

						resume_total_credit = Number(resume_total_credit) + Number(credit_amount);
						window.localStorage.setItem("App-Resume-Total-Credit", resume_total_credit.toFixed(2));
						
						
						resume_total_commission_credit 	= Number(resume_total_commission_credit) + Number(credit_commission);
						window.localStorage.setItem("App-Resume-Total-Commission-Credit", resume_total_commission_credit.toFixed(2));						 
						

						/* reset and show info*/
						$(".calc_total_preview").html('0.00');
						$(".calc_total").html('0.00');
						$(".calc_total_commission").html('0.00');
						$(".calc_total_commission_percentage").html('0%');
						calc_credit_result = '';
						
						$('#scan-card').hideMenu();
						navigator.vibrate(1000);
						
						$('.app-page-calc').hide();
						$('.app-page-info').show();

						/*
						// remettre les valeurs à vide
						card_amount 	= undefined;
						card_number 	= undefined;
						card_name 		= undefined;
						card_firstname 	= undefined;
						card_state 		= undefined;
						card_grant 		= undefined;*/
						
						nfc_try_credit = 0; // remet à 0 nfc_try

						nfc.removeTagDiscoveredListener(CreditNfcCard);
						nfc.removeNdefListener(CreditNfcCard);
				
					};
					
					//Write on TAG
					nfc.write(message, success => CreditTransaction(), error => NfcCardFailure('[Carte :' + card_number + '] [Montant Carte :' + card_amount + ']'));	
		
				}
				GetMasterKey(UseMasterKey);	
			}
			else
			{

				//Change State of the card And Write on the NFC Card
				card_state = 'Suspendu';
				amount = Number(card_amount);
				
				// MASTER KEY
				var UseMasterKey= function(results)
				{
					var MasterKey = results.rows.item(0).name;
					var amount = Number(card_amount) + Number(credit_amount);
					
					var card_content = 
					{
						"tag_id":tag_id,
						"card_amount":amount, 
						"card_number":card_number, 
						"card_name":card_name, 
						"card_firstname":card_firstname, 
						"card_state":card_state, 
						"card_grant":card_grant
					};
					
					var card_content_encoded = CryptoJS.AES.encrypt(JSON.stringify(card_content), MasterKey).toString();
					
					
					var message = [
					  ndef.textRecord(card_content_encoded)
					];
				}
				GetMasterKey(UseMasterKey);	
				
				function ShowInfoSuspendCard()
				{
					
					$("#info-scan-result").addClass( "color-red-dark" );
					$("#info-scan-result").html('Transaction refusée');
					$("#info-scan-result-more").html('Carte bloquée');
					
					$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
					$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
					$("#info-scan-card-number").html(card_number);
					$("#info-scan-card-state").html(card_state);					

					/* reset and show info*/
					$(".calc_total_preview").html('0.00');
					$(".calc_total").html('0.00');
					$(".calc_total_commission").html('0.00');
					$(".calc_total_commission_percentage").html('0%');
					calc_debit_result = '';
					
					$('#scan-card').hideMenu();
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					
					$('.app-page-calc').hide();
					$('.app-page-info').show();
					
					
					nfc_try_credit = 0; // remet à 0 nfc_try
					nfc.removeTagDiscoveredListener(CreditNfcCard);
					nfc.removeNdefListener(CreditNfcCard);				
				}
	
				//Write on TAG
				nfc.write(message, success => ShowInfoSuspendCard, error => NfcCardFailure('[Carte :' + card_number + '] [Montant Carte :' + card_amount + ']'));		
			}
			
		};
		
		// check card blocked before play transaction
		CheckCardBlocked(card_number, AddCreditTransaction);
	}
	Getkey(UseKey);
}


/*** DEBIT CARD ***/

function DebitNfcCard(nfcEvent) {
	
	var tag_id = nfc.bytesToHexString(nfcEvent.tag.id);
	
	var scan_card_previous_message = $("#scan-card-message").html();
	$("#scan-card-message").html('Lecture en cours ...');
	
	nfc_try_debit ++;
	//console.log('nfc_try '+ nfc_try_debit);
	
	var UseKey= function(results)
	{
		
		if (nfc_try_debit == 1) //1er esaie on essaye de décrypter
		{
			//console.log('nfc decryptage ' + JSON.stringify(nfcEvent.tag.ndefMessage));
			
			if (!nfcEvent.tag.ndefMessage || !nfcEvent.tag.ndefMessage[0])
			{
				notification_error("Une carte vide à été utilisée");
				AddLogSql('ERROR', 'Security', 'Debit: une carte vide à été utilisée');
				nfc_try_debit = 0;
				$("#scan-card-message").html(scan_card_previous_message);				
				return; //stop process
			}
			
			var PayloadCardContent = nfcEvent.tag.ndefMessage[0]["payload"];
			var card_content_encoded 	= nfc.bytesToString(PayloadCardContent).substring(3);	
			
			//console.log('nfc lecture carte');
			
			
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
		
			// VERIF
			if (!card_content_decrypted || card_content_decrypted  == '')
			{
				notification_error("Problème de clé");
				nfc_try_debit = 0;
				$("#scan-card-message").html(scan_card_previous_message);
				return; //stop process
			}
			

			
			//if class in the text amount
			$("#info_amount").removeClass( "text-danger text-success text-dark" );
			
			var card_content_decrypted = jQuery.parseJSON(card_content_decrypted);
			
			var tag_id_in_card 	= card_content_decrypted['tag_id'];
			var card_amount 	= card_content_decrypted['card_amount'];
			var card_number 	= card_content_decrypted['card_number'];
			var card_name 		= card_content_decrypted['card_name'];
			var card_firstname 	= card_content_decrypted['card_firstname'];
			var card_state 		= card_content_decrypted['card_state'];
			var card_grant 		= card_content_decrypted['card_grant'];
			
			
			// TAG ID VERIF 
			if (tag_id != tag_id_in_card)
			{
				notification_error("Cette carte à surement été copié");
				AddLogSql('ERROR', 'NFC', 'La carte ' + card_number +  ' a surement été copié. [ID dans data: '+ tag_id_in_card +'] [ID détécté: ' + tag_id +']' );	
				nfc_try_debit = 0;
				$("#scan-card-message").html(scan_card_previous_message);
				return; //stop process
			}
		}
		
		if (nfc_try_debit > 1) //verifier si la carte est bien vide
		{
			PayloadCardContent = nfcEvent.tag.ndefMessage[0]["payload"];
			if (PayloadCardContent)
			{
				
				notification_error("Cette carte contient des données, rescannez pour effectuer le paiement");
				AddLogSql('ERROR', 'Security', "Debit: la carte utilisée contient des données" );
				nfc_try_debit = 0;
				$("#scan-card-message").html(scan_card_previous_message);				
				return; //stop process
				
			}
		}

		var debit_amount = Number($(".calc_total").html());
		var debit_commission = $(".calc_total_commission").html();
		var debit_amount_without_com = Number(debit_amount) - Number(debit_commission);
		var debit_percentage = $(".calc_total_commission_percentage").html();
		
		var type = 1; //a changer
		
		
		
		//if class in the scan result
		$("#info-scan-result").removeClass( "color-red-dark color-blue-dark" );
		
		function NfcCardFailure(info)
		{
			notification_error("Erreur d'écriture (1), rescanner la carte");
			AddLogSql('ERROR', 'NFC', 'Echec de lecture pour debiter ' + info);	
			
		}
		
		var AddDebitTransaction = function(results){
		
			if (results.rows.length==0) //PASS 
			{
				// on devrait avoir un numero de carte, si ce n'est pas le cas, infromer l'opérateur
				if(!card_number)
				{
					notification_error("Une carte vide à été utilisée (2)");
					AddLogSql('ERROR', 'Security', 'Forcage ecriture : une carte vide à été utilisée');
					nfc_try_debit = 0;
					$("#scan-card-message").html(scan_card_previous_message);					
					return; //stop process
				}
				
				// force Active
				card_state = 'Active'
				amount = Number(card_amount) - Number(debit_amount);
				
				if (amount < 0){
					
					
					
					amount = Number(card_amount);
					$("#info-scan-amount").html(debit_amount + ' ' + currency);
					
					
					$("#info-scan-result").addClass( "color-red-dark" );
					$("#info-scan-result").html('Transaction refusée');
					$("#info-scan-result-more").html('Solde insuffisant');
					
					$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
					$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
					$("#info-scan-card-number").html(card_number);
					$("#info-scan-card-state").html(card_state);					

					/* reset and show info*/
					$(".calc_total_preview").html('0.00');
					$(".calc_total").html('0.00');
					$(".calc_total_commission").html('0.00');
					$(".calc_total_commission_percentage").html('0%');
					calc_debit_result = '';
					
					$('#scan-card').hideMenu();
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					
					$('.app-page-calc').hide();
					$('.app-page-info').show();
					
					
					nfc_try_debit = 0; // remet à 0 nfc_try
					nfc.removeTagDiscoveredListener(DebitNfcCard);
					nfc.removeNdefListener(DebitNfcCard);
					
										
					
				}
				else
				{	
					// MASTER KEY
					var UseMasterKey= function(results)
					{
						var MasterKey = results.rows.item(0).name;
						var amount = Number(card_amount) - Number(debit_amount);
						
						var card_content = 
						{
							"tag_id":tag_id,
							"card_amount":amount, 
							"card_number":card_number, 
							"card_name":card_name, 
							"card_firstname":card_firstname, 
							"card_state":card_state, 
							"card_grant":card_grant
						};
						
						var card_content_encoded = CryptoJS.AES.encrypt(JSON.stringify(card_content), MasterKey).toString();
						
						
						var message = [
						  ndef.textRecord(card_content_encoded)
						];					
							

						//console.log('nfc ecriture de nouvelles données sur la carte');
						
						function DebitTransaction()
						{

							
							var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
							var card_amount = amount.toFixed(2);

							PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, debit_amount_without_com, debit_commission, debit_percentage, type, key, card_amount, card_grant);
							//console.log('nfc insertion des données en BDD');
							

							$("#info-scan-amount").html(debit_amount + ' ' + currency);
							
							$("#info-scan-result").addClass( "color-blue-dark" );
							$("#info-scan-result").html('Transaction reussie');
							$("#info-scan-result-more").html('Carte debitée');
							
							$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
							$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
							$("#info-scan-card-number").html(card_number);
							$("#info-scan-card-grant").html(card_grant);
							$("#info-scan-card-state").html(card_state);	
							


							resume_total_debit = Number(resume_total_debit) + Number(debit_amount_without_com);							
							window.localStorage.setItem("App-Resume-Total-Debit", resume_total_debit.toFixed(2));
							

							resume_total_commission_debit = Number(resume_total_commission_debit) + Number(debit_commission);
							window.localStorage.setItem("App-Resume-Total-Commission-Debit", resume_total_commission_debit.toFixed(2));							
						
							/* reset and show info*/
							$(".calc_total_preview").html('0.00');
							$(".calc_total").html('0.00');
							$(".calc_total_commission").html('0.00');
							$(".calc_total_commission_percentage").html('0%');
							calc_debit_result = '';
							
							$('#scan-card').hideMenu();
							navigator.vibrate(1000);
							
							$('.app-page-calc').hide();
							$('.app-page-info').show();

							
							// remettre les valeurs à vide
							card_amount 	= undefined;
						  	card_number 	= undefined;
						 	card_name 		= undefined;
						  	card_firstname 	= undefined;
						  	card_state 		= undefined;
						  	card_grant 		= undefined;
							
							nfc_try_debit = 0; // remet à 0 nfc_try

							nfc.removeTagDiscoveredListener(DebitNfcCard);
							nfc.removeNdefListener(DebitNfcCard);
						
						};

						//Write on TAG
						nfc.write(message, success => DebitTransaction(), error => NfcCardFailure('[Carte :' + card_number + '] [Montant Carte :' + card_amount + ']'));						

					}
					GetMasterKey(UseMasterKey);					
				}
		
			}
			else
			{
				// MASTER KEY
				var UseMasterKeySuspendCard= function(results)
				{
					// force Suspended
					card_state = 'Suspendue'
					amount = Number(card_amount);
				
					var MasterKey = results.rows.item(0).name;
					var amount = Number(card_amount) + Number(credit_amount);
					
					var card_content = 
					{
						"tag_id":tag_id,
						"card_amount":amount, 
						"card_number":card_number, 
						"card_name":card_name, 
						"card_firstname":card_firstname, 
						"card_state":card_state, 
						"card_grant":card_grant
					};
					
					var card_content_encoded = CryptoJS.AES.encrypt(JSON.stringify(card_content), MasterKey).toString();
					
					
					var message = [
					  ndef.textRecord(card_content_encoded)
					];

					//Write on TAG
					nfc.write(message, success => NfcSuccess, error => NfcFailure);
					
					
					$("#info-scan-amount").html(debit_amount + ' ' + currency);
					
					$("#info-scan-result").addClass( "color-red-dark" );
					$("#info-scan-result").html('Transaction refusée');
					$("#info-scan-result-more").html('Carte bloquée');
					
					$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
					$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
					$("#info-scan-card-number").html(card_number);
					$("#info-scan-card-grant").html(card_grant);
					$("#info-scan-card-state").html(card_state);	
										
					
					/* reset and show info*/
					$(".calc_total_preview").html('0.00');
					$(".calc_total").html('0.00');
					$(".calc_total_commission").html('0.00');
					$(".calc_total_commission_percentage").html('0%');
					calc_debit_result = '';
					
					$('#scan-card').hideMenu();
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					
					$('.app-page-calc').hide();
					$('.app-page-info').show();
					
					nfc_try_debit = 0; // remet à 0 nfc_try
					
					nfc.removeTagDiscoveredListener(DebitNfcCard);
					nfc.removeNdefListener(DebitNfcCard);
				}
				GetMasterKey(UseMasterKeySuspendCard);	
				
			}
		};
		// check card blocked before play transaction
		CheckCardBlocked(card_number, AddDebitTransaction);

	}
	Getkey(UseKey);
}





