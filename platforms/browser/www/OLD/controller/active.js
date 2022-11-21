function ActiveNfcCard(nfcEvent) {

	// MASTER KEY
	var UseMasterKey= function(results)
	{
		var MasterKey 		= results.rows.item(0).name;
		var card_id			= 	$("#detail_active_card_id").val();
		var card_name 		= 	$("#detail_active_name").val();
		var card_firstname 	= 	$("#detail_active_firstname").val();
		var card_number 	= 	$("#detail_active_card").val();
		var card_amount		= 	$("#detail_active_amount").val();
		var card_state		=  	'Active';
		var card_grant		=  	$("#detail_active_grant").val();
		
		amount 			= Number(card_amount);
		card_name	 	= card_name.toUpperCase();
		card_firstname 	= card_firstname.charAt(0).toUpperCase() + card_firstname.slice(1);
		card_number		= card_number.toUpperCase();
		type			= 2;

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
	
		function ActiveNfcCardSuccess()
		{
			
			AddLogSql('INFO', 'Card', 'Activation de la carte '+ card_number);
				
			if (amount > 0)
			{
				
				var ActiveTransaction = function(results){
					
					var terminal_number = results.rows.item(0).terminal_number;
					var terminal_user = results.rows.item(0).terminal_user;
					
					var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
					var card_amount = amount;
					
					PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, amount, 0, 0, type, key, card_amount);
				};
				
				//add terminal_number in transaction
				InforTerminal(ActiveTransaction);
			}
			

			// Change state_id to 1 in Database
			PayTransactionsHandler.ActiveCard(card_id);
			
			navigator.vibrate(1000);	
			//if class danger in the text
			$("#info_amount").removeClass("text-danger");
			// add color badge
			$("#info_state").removeClass("badge-primary badge-danger");	
			$("#info_state").addClass("badge-primary");	

			
			$('.page').hide();
			$("#info_user").html(card_name + ' ' + card_firstname);
			$("#info_card_number").html(card_number);
			$("#info_amount").html(amount.toFixed(2) + ' Montant  ' );
			$("#info_state").html('Carte '+card_state);
			$('#infopage').toggle(1);
			
			
			var back = document.getElementById('info_back'); //or grab it by tagname etc
			back.href = "#activepage"
			
			//Remove Tag Discovered
			nfc.removeTagDiscoveredListener(ActiveNfcCard);
			nfc.removeNdefListener(ActiveNfcCard);

		}
		
		function ActiveNfcCardFailure()
		{
			toastr.warning("Erreur d'écriture, rescanner la carte", "Initialisation");
		}
		
		// write
		nfc.write(message, success => ActiveNfcCardSuccess(), error => ActiveNfcCardFailure());

	}
	GetMasterKey(UseMasterKey);	
}

/* ACTIVE CARD */ 
function ScanActiveCard(){
	
	if ($("#detail_active_name").val()  && $("#detail_active_firstname").val() && $("#detail_active_card").val())
	{
		
		var amount = $("#detail_active_amount").val();
		
		if ( amount < 0 )
		{
			toastr.warning("Verifier le montant", "Activation");
			return;
		}
	
		$('.page').hide();
		$("#active_amount_recap").html(amount);
		nfc.addTagDiscoveredListener(ActiveNfcCard);
		nfc.addNdefListener(ActiveNfcCard);
		$('#scanactivepage').toggle(1);
	}
	else
	{
	toastr.warning("Verifier si le nom, le prénom et le numéro de carte sont complétés", "Activation");
	}

}

function CancelActiveCard()
{
	$('.page').hide();
	nfc.removeTagDiscoveredListener(ActiveNfcCard);
	nfc.removeNdefListener(ActiveNfcCard);
	$('#activepage').toggle(1);
}


