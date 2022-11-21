
var nfc_try_debit = 0;
var currency_symbol = window.localStorage.getItem("Storage_currency");


function DebitNfcCard(nfcEvent) {
	
	//console.log(JSON.stringify(nfcEvent.tag));
	
	nfc_try_debit ++;
	//console.log('nfc_try '+ nfc_try_debit);
	
	var UseKey= function(results)
	{
		
		if (nfc_try_debit == 1) //1er esaie on essaye de décrypter
		{
			//console.log('nfc decryptage ' + JSON.stringify(nfcEvent.tag.ndefMessage));
			
			if (!nfcEvent.tag.ndefMessage || !nfcEvent.tag.ndefMessage[2])
			{
				toastr.warning("Une carte vide à été utilisée", "Sécurité");
				AddLogSql('ERROR', 'Security', 'Debit: une carte vide à été utilisée');
				nfc_try_debit = 0;				
				return; //stop process
			}
			
			var PayloadUrl = nfcEvent.tag.ndefMessage[0]["payload"];
			var PayloadAmount = nfcEvent.tag.ndefMessage[1]["payload"];
			var PayloadCard_number = nfcEvent.tag.ndefMessage[2]["payload"];
			var PayloadCard_name = nfcEvent.tag.ndefMessage[3]["payload"];
			var PayloadCard_firstname = nfcEvent.tag.ndefMessage[4]["payload"];
			var PayloadCard_state = nfcEvent.tag.ndefMessage[5]["payload"];
			var PayloadCard_grant = nfcEvent.tag.ndefMessage[6]["payload"];
			
			url = nfc.bytesToString(PayloadUrl);
			card_amount_encoded 	= nfc.bytesToString(PayloadAmount).substring(3);
			card_number_encoded 	= nfc.bytesToString(PayloadCard_number).substring(3);
			card_name_encoded 		= nfc.bytesToString(PayloadCard_name).substring(3);
			card_firstname_encoded 	= nfc.bytesToString(PayloadCard_firstname).substring(3);
			card_state_encoded 		= nfc.bytesToString(PayloadCard_state).substring(3);
			card_grant_encoded 		= nfc.bytesToString(PayloadCard_grant).substring(3);
			
			//console.log('nfc lecture carte');
			
			
			var len = results.rows.length; 
			
			for (var i=0; i<len; i++){
				
				key_name = results.rows.item(i).name		
				
				card_amount_decrypted = CryptoJS.AES.decrypt(card_amount_encoded, key_name);
				card_number_decrypted = CryptoJS.AES.decrypt(card_number_encoded, key_name);
				card_name_decrypted = CryptoJS.AES.decrypt(card_name_encoded, key_name);
				card_firstname_decrypted = CryptoJS.AES.decrypt(card_firstname_encoded, key_name);
				card_state_decrypted = CryptoJS.AES.decrypt(card_state_encoded, key_name);			
				card_grant_decrypted = CryptoJS.AES.decrypt(card_grant_encoded, key_name);
				
				// Sortir de la boucle si clé ok
				if (card_grant_decrypted && card_grant_decrypted  != '')
				{
					//console.log('nfc clé trouvé');
					i = len + 1;
				}
				
			}
			
			// VERIF
			if (!card_grant_decrypted || card_grant_decrypted  == '')
			{
				nfc_try_debit = 0; // remet à 0 nfc_try
				toastr.warning("Problème de clé", "Sécurité");
				return; //stop process
			}
			
			card_amount = card_amount_decrypted.toString(CryptoJS.enc.Utf8);
			card_number = card_number_decrypted.toString(CryptoJS.enc.Utf8);
			card_name = card_name_decrypted.toString(CryptoJS.enc.Utf8);
			card_firstname = card_firstname_decrypted.toString(CryptoJS.enc.Utf8);
			card_state = card_state_decrypted.toString(CryptoJS.enc.Utf8);
			card_grant = card_grant_decrypted.toString(CryptoJS.enc.Utf8);
		}
		
		if (nfc_try_debit > 1) //verifier si la carte est bien vide
		{
			PayloadCard_number = nfcEvent.tag.ndefMessage[2]["payload"];
			if (PayloadCard_number)
			{
				
				toastr.warning("Cette carte contient des données", "Sécurité");
				AddLogSql('ERROR', 'Security', "Debit: la carte utilisée contient des données" );
				nfc_try_debit = 0;				
				return; //stop process
				
			}
		}

		var debit_amount = $("#debit_amount_scan").val();
		var debit_commission = $("#debit_amount_commission_scan").val();
		var debit_percentage = $("#debit_percentage_scan").val();
		
		var type = $("#debit_type").val();
		
		
		
		//if class in the text amount
		$("#info_amount").removeClass( "text-danger text-success text-dark" );
		
		
		function DebitNfcCardFailure(info)
		{
			toastr.warning("Erreur d'écriture (1), rescanner la carte", "Vente");
			AddLogSql('ERROR', 'NFC', 'Echec de lecture pour debiter ' + info);	
			
		}
		
		var AddDebitTransaction = function(results){
		
			if (results.rows.length==0) //PASS 
			{
				// on devrait avoir un numero de carte, si ce n'est pas le cas, infromer l'opérateur
				if(!card_number)
				{
					toastr.warning("Une carte vide à été utilisée (2)", "Sécurité");
					AddLogSql('ERROR', 'Security', 'Forcage ecriture : une carte vide à été utilisée');
					nfc_try_debit = 0;				
					return; //stop process
				}
				
				// force Active
				card_state = 'Active'
				amount = Number(card_amount) - Number(debit_amount);
				
				if (amount < 0){
					
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					
					amount = Number(card_amount);
					$("#info_amount").addClass( "text-danger" );
					$("#info_amount").html(amount.toFixed(2) + ' ' + currency_symbol + ' Refusée');
					$("#info_state").html('Carte '+card_state);					

					/* reset and show info*/
					$("#debit_amount").attr('value', '');
					calc_debit_result = '';
					$('.page').hide();
					$("#info_user").html(card_name + ' ' + card_firstname);
					$("#info_card_number").html(card_number);

					var back = document.getElementById('info_back'); //or grab it by tagname etc
					back.href = "#debitpage"
					$('#infopage').toggle(1);
					
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
						
						  amount_encoded 		= 	CryptoJS.AES.encrypt(amount.toString(), MasterKey);
						  card_number_encoded 	= 	CryptoJS.AES.encrypt(card_number.toString(), MasterKey);
						  card_name_encoded 	= 	CryptoJS.AES.encrypt(card_name.toString(), MasterKey);
						  card_firstname_encoded= 	CryptoJS.AES.encrypt(card_firstname.toString(), MasterKey);
						  card_state_encoded 	=	CryptoJS.AES.encrypt(card_state.toString(), MasterKey);
						  card_grant_encoded 	=	CryptoJS.AES.encrypt(card_grant.toString(), MasterKey);				
						
						
						var message = [
						  ndef.uriRecord("https://pay.jegere.eu"),
						  ndef.textRecord(amount_encoded),
						  ndef.textRecord(card_number_encoded),
						  ndef.textRecord(card_name_encoded),
						  ndef.textRecord(card_firstname_encoded),
						  ndef.textRecord(card_state_encoded),
						  ndef.textRecord(card_grant_encoded)
						  
						];						
						
						//Write on TAG
						nfc.write(message, success => InforTerminal(DebitTransaction), error => DebitNfcCardFailure('[Carte :' + card_number + '] [Montant Carte :' + card_amount + ']'));
						
						//console.log('nfc ecriture de nouvelles données sur la carte');
						
						var DebitTransaction = function(results)
						{
							
							var terminal_number = results.rows.item(0).terminal_number;
							var terminal_user = results.rows.item(0).terminal_user;

							
							var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
							var card_amount = amount.toFixed(2);

							PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, debit_amount, debit_commission, debit_percentage, type, key, card_amount);
							//console.log('nfc insertion des données en BDD');
							
							navigator.vibrate(1000);
							$("#info_amount").addClass( "text-success" );							
							$("#info_amount").html(amount.toFixed(2) + ' ' + currency_symbol + ' Acceptée');
							$("#info_state").html('Carte '+card_state);
							
							// add color badge
								
							

							/* reset and show info*/
							$("#debit_amount").attr('value', '');
							calc_debit_result = '';
							$('.page').hide();
							$("#info_user").html(card_name + ' ' + card_firstname);
							$("#info_card_number").html(card_number);

							var back = document.getElementById('info_back'); //or grab it by tagname etc
							back.href = "#debitpage"
							$('#infopage').toggle(1);
							//console.log('nfc affichage des infos');
							
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
					
					  amount_encoded 		= 	CryptoJS.AES.encrypt(amount.toString(), MasterKey);
					  card_number_encoded 	= 	CryptoJS.AES.encrypt(card_number.toString(), MasterKey);
					  card_name_encoded 	= 	CryptoJS.AES.encrypt(card_name.toString(), MasterKey);
					  card_firstname_encoded= 	CryptoJS.AES.encrypt(card_firstname.toString(), MasterKey);
					  card_state_encoded 	=	CryptoJS.AES.encrypt(card_state.toString(), MasterKey);
					  card_grant_encoded 	=	CryptoJS.AES.encrypt(card_grant.toString(), MasterKey);				
					
					
					var message = [
					  ndef.uriRecord("https://pay.jegere.eu"),
					  ndef.textRecord(amount_encoded),
					  ndef.textRecord(card_number_encoded),
					  ndef.textRecord(card_name_encoded),
					  ndef.textRecord(card_firstname_encoded),
					  ndef.textRecord(card_state_encoded),
					  ndef.textRecord(card_grant_encoded)
					  
					];

					//Write on TAG
					nfc.write(message, success => NfcSuccess, error => NfcFailure);
					
					$("#info_amount").addClass( "text-danger" );
					$("#info_amount").html(amount.toFixed(2) + ' ' + currency_symbol + ' Refusée');
					$("#info_state").html('Carte '+card_state);
					
					// add color badge
						
					$("#info_state").addClass("badge-danger");	
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					
					/* reset and show info*/
					$("#debit_amount").attr('value', '');
					calc_debit_result = '';
					$('.page').hide();
					$("#info_user").html(card_name + ' ' + card_firstname);
					$("#info_card_number").html(card_number);

					var back = document.getElementById('info_back'); //or grab it by tagname etc
					back.href = "#debitpage"
					$('#infopage').toggle(1);
					
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



/* DEBIT */ 
function ScanDebitCard(){
	var check_amount = $("#debit_amount").val();
	
	//check if number
	if (check_amount.match(/^\d*\.?\d+$/) == null)
	{
		toastr.warning("Verifiez votre calcul", "Calculatrice");	
		return false ;
	};


	if ( !check_amount || check_amount <= 0 )
	{
		return false ;
	}
	

	var RecalculateWithCom = function(results){	
		
		var debit_commission = results.rows.item(0).debit_commission;	
		// Recalculate With Com
		var debit_amount_without_com = $("#debit_amount").val();
		var commission = debit_amount_without_com * (debit_commission/100);
		var debit_amount_with_com =  debit_amount_without_com - commission;
		
		
		$("#debit_amount_recap").html( debit_amount_with_com + ' ' + currency_symbol);
		
		$("#debit_amount_scan").val( debit_amount_with_com );
		$("#debit_amount_commission_scan").val( commission );
		$("#debit_percentage_scan").val( debit_commission );
		
		$('.page').hide();
		nfc.addTagDiscoveredListener(DebitNfcCard);
		nfc.addNdefListener(DebitNfcCard);
		$('#scandebitpage').toggle(1);
	};

	GetCommissionSql(RecalculateWithCom);
	

}

function CancelDebitCard(){
	
	nfc_try_debit = 0; // remet à 0 nfc_try
	
	nfc.removeTagDiscoveredListener(DebitNfcCard);
	nfc.removeNdefListener(DebitNfcCard);
	
	$('.page').hide();
	$("#debit_amount").attr('value', '');
	calc_debit_result = '';
	$('#debitpage').toggle(1);
}