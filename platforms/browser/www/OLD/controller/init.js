function getDate() {
	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth() + 1;
	var y = date.getFullYear();
	var dateOfDay = (d <= 9 ? '0' + d : d) + "" +(m <= 9 ? '0' + m : m) + "" + y;
	return dateOfDay;
}



function RandomId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < 12; i++)
	text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
	
function InitNfcCard(nfcEvent) {
	
	var InitCard = function(results){
		
		var terminal_number = results.rows.item(0).terminal_number;
		var terminal_user = results.rows.item(0).terminal_user;
		
		// MASTER KEY
		var UseMasterKey= function(results)
		{
		
			var MasterKey = results.rows.item(0).name;
			
			var card_name 		= 	'Carte';
			var card_firstname 	= 	'Temporaire';
			
			if ($("#init_card_number").val().length > 1 )
			{
				var card_number 	= 	getDate() + terminal_number + $("#init_card_number").val();
			}
			else
			{
				var card_number 	= 	getDate() + terminal_number + RandomId();
			}
			
			
			var amount			= 	Number($("#init_amount").val());
			var type  			= 	2; // credit_type
			var card_state		=  'Active';
			var card_grant		=  $("#init_grant").val();
			

			
			card_name	 	= card_name.toUpperCase();
			card_firstname 	= card_firstname.charAt(0).toUpperCase() + card_firstname.slice(1);
			card_number		= card_number.toUpperCase();
			
			
			
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
			
			function InitNfcCardSuccess() {
			
				if (amount > 0)
				{
					
					var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
					var card_amount = amount;
					
					PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, amount, 0, 0, type, key, card_amount);

				}
				
				
				navigator.vibrate(1000);	
				//if class in the text amount
				$("#info_amount").removeClass( "text-danger text-success text-dark" );
				
				// add color badge
				$("#info_state").removeClass("badge-primary badge-danger");	
				$("#info_state").addClass("badge-primary");	
				
				// reinit input
				$("#init_name").val("");
				$("#init_firstname").val("");
				$("#init_card_number").val("");
				$("#init_amount").val("");
				$("#init_grant").val('0');
				
				$('.page').hide();
				$("#info_user").html(card_name + ' ' + card_firstname);
				$("#info_card_number").html(card_number);
				$("#info_amount").addClass( "text-dark" );
				$("#info_amount").html(amount.toFixed(2) + ' Montant  ' );
				$("#info_state").html('Carte '+card_state);
				$('#infopage').toggle(1);
				
				var back = document.getElementById('info_back'); //or grab it by tagname etc
				back.href = "#initpage"
				
				//Remove Tag Discovered
				nfc.removeTagDiscoveredListener(InitNfcCard);
			}
			
			function InitNfcCardFailure()
			{
				toastr.warning("Erreur d'écriture, rescanner la carte", "Initialisation");
			}
			
			// write
			nfc.write(message, success => InitNfcCardSuccess(), error => InitNfcCardFailure());
		
		}
		GetMasterKey(UseMasterKey);	
	}					
	//add terminal_number in transaction
	InforTerminal(InitCard);

}

/* INIT CARD */ 
function ScanInitCard(){
	var amount = Number($("#init_amount").val());
	
	if ( amount < 0 )
	{
		toastr.warning("Verifier le montant", "Activation");
		return;
	}
	
	$('.page').hide();
	$("#init_amount_recap").html(amount);
	nfc.addTagDiscoveredListener(InitNfcCard);
	nfc.addNdefListener(InitNfcCard);
	$('#scaninitpage').toggle(1);
}

function CancelInitCard()
{
	$('.page').hide();
	nfc.removeTagDiscoveredListener(InitNfcCard);
	nfc.removeNdefListener(InitNfcCard);
	
	$("#init_name").val("");
	$("#init_firstname").val("");
	$("#init_card_number").val("");
	$("#init_amount").val("");
	$("#init_grant").val("0");
	$('#initpage').toggle(1);
}