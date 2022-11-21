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

/* INIT CARD */ 
function InitScanCard(){
	var amount = Number($("#init_card_amount").val());
	
	if ( amount < 0 )
	{
		notification_error('Merci de verifier le montant');
		return;
	}
	
	$("#scan-card-message").html( amount + ' ' + currency );

	nfc.addTagDiscoveredListener(InitNfcCard);
	nfc.addNdefListener(InitNfcCard);
	
	$('#scan-card').showMenu();
	
	
}

function CancelInitScanCard()
{
	nfc.removeTagDiscoveredListener(InitNfcCard);
	nfc.removeNdefListener(InitNfcCard);
	
	$("#init_card_number").val("");
	$("#init_card_amount").val("");
	$("#init_card_grant").val("0");
	
	$('#scan-card').hideMenu();
}

function CloseInitInfoCard(){
	
	$('.app-page-info').hide();
	$('.app-page-init').show();
	
}
	
function InitNfcCard(nfcEvent) {
	
		var tag_id 		= nfc.bytesToHexString(nfcEvent.tag.id);
		
		var scan_card_previous_message = $("#scan-card-message").html();
		$("#scan-card-message").html('Lecture en cours ...');
		
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
			
			
			var amount			= 	Number($("#init_card_amount").val());
			var type  			= 	2; // credit_type
			var card_state		=  'Active';
			var card_grant		=  $("#init_card_grant").val();
			

			
			card_name	 	= card_name.toUpperCase();
			card_firstname 	= card_firstname.charAt(0).toUpperCase() + card_firstname.slice(1);
			card_number		= card_number.toUpperCase();		
			
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

			
			function InitNfcCardSuccess() {
			
				if (amount > 0)
				{
					
					var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
					var card_amount = amount;
					
					PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, amount, 0, 0, type, key, card_amount, card_grant);

				}
				
				
				$("#info-scan-amount").html(amount + ' ' + currency);
							
				$("#info-scan-result").addClass( "color-blue-dark" );
				$("#info-scan-result").html('Transaction reussie');
				$("#info-scan-result-more").html('Carte debitée');
				
				$("#info-scan-card-user").html(card_name + ' ' + card_firstname);
				$("#info-scan-card-amount").html(amount.toFixed(2)+ ' ' + currency);
				$("#info-scan-card-number").html(card_number);
				$("#info-scan-card-grant").html(card_grant);
				$("#info-scan-card-state").html(card_state);	
				


				resume_total_credit = Number(resume_total_credit) + Number(amount);							
				window.localStorage.setItem("App-Resume-Total-Credit", resume_total_credit.toFixed(2));
								
			
				
				$('#scan-card').hideMenu();
				navigator.vibrate(1000);
				
				$('.app-page-init').hide();
				$('.app-page-info').show();

				
				// reinit input
				$("#init_card_number").val("");
				$("#init_card_amount").val("");
				$("#init_card_grant").val('0');
				
				//Remove Nfc
				nfc.removeTagDiscoveredListener(InitNfcCard);
				nfc.removeNdefListener(InitNfcCard);
			}
			
			function InitNfcCardFailure()
			{
				notification_error("Erreur d'écriture, rescanner la carte");
			}
			
			// write
			nfc.write(message, success => InitNfcCardSuccess(), error => InitNfcCardFailure());
		
		}
		GetMasterKey(UseMasterKey);	


}

