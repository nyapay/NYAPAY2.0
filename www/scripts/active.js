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

/* ACTIVE CARD */ 
function ActiveScanCard(){
	var amount = Number($("#modal-card-amount").val());
	
	if ( amount < 0 )
	{
		notification_error('Merci de verifier le montant');
		return;
	}
	
	$("#scan-card-message").html( amount + ' ' + currency );

	nfc.addTagDiscoveredListener(ActiveNfcCard);
	nfc.addNdefListener(ActiveNfcCard);
	
	$('#card-details').hideMenu();
	$('#scan-card').showMenu();
	
}

function CancelActiveScanCard()
{
	nfc.removeTagDiscoveredListener(ActiveNfcCard);
	nfc.removeNdefListener(ActiveNfcCard);	
	$('#scan-card').hideMenu();
}


function CloseActiveInfoCard(){
	
	$('.app-page-info').hide();
	$('.app-page-active').show();
	
}

function ActiveNfcCard(nfcEvent) {
	var tag_id 		= nfc.bytesToHexString(nfcEvent.tag.id);
	
	var scan_card_previous_message = $("#scan-card-message").html();
	$("#scan-card-message").html('Lecture en cours ...');
		
	// MASTER KEY
	var UseMasterKey= function(results)
	{
		var MasterKey 		= 	results.rows.item(0).name;
		var card_id			= 	$("#modal-card-id").val();
		var card_name 		= 	$("#modal-card-name").html();
		var card_firstname 	= 	$("#modal-card-firstname").html();
		var card_number 	= 	$("#modal-card-number").html();
		var card_amount		= 	$("#modal-card-amount").val();
		var card_state		=  	'Active';
		var card_grant		=  	$("#modal-card-grant").val();
		
		amount 			= Number(card_amount);
		card_name	 	= card_name.toUpperCase();
		card_firstname 	= card_firstname.charAt(0).toUpperCase() + card_firstname.slice(1);
		card_number		= card_number.toUpperCase();
		type			= 2;
		
		
		var card_content = 
		{
			"tag_id"		:tag_id, 
			"card_amount"	:amount, 
			"card_number"	:card_number, 
			"card_name"		:card_name, 
			"card_firstname":card_firstname, 
			"card_state"	:card_state, 
			"card_grant"	:card_grant
		};
			
		var card_content_encoded = CryptoJS.AES.encrypt(JSON.stringify(card_content), MasterKey).toString();

		var message = [
		  ndef.textRecord(card_content_encoded)
		];		
	
		function ActiveNfcCardSuccess()
		{
			
			AddLogSql('INFO', 'Card', 'Activation de la carte '+ card_number);
				
			if (amount > 0)
			{
			
				var key = MasterKey.substr(0,3)+ 'XXXXXXXXXX'+ MasterKey.substr(MasterKey.length - 4);
				var card_amount = amount;
				
				PayTransactionsHandler.addTransactions(card_number, terminal_number, terminal_user, amount, 0, 0, type, key, card_amount, card_grant);

			}
			// Change state_id to 1 in Database
			PayTransactionsHandler.ActiveCard(card_id);
			
			$('#search-results-card-list').empty();
			PayTransactionsHandler.loadCards(displayCards);
			
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
			ss.set(function(key){}, function(error){},"App-Resume-Total-Credit", resume_total_credit.toFixed(2));
							
		
			
			$('#scan-card').hideMenu();
			navigator.vibrate(1000);
			
			$('.app-page-active').hide();
			$('.app-page-info').show();

			
			// reinit input
			$("#init_card_number").val("");
			$("#init_card_amount").val("");
			$("#init_card_grant").val('0');
			
			//Remove Nfc
			nfc.removeTagDiscoveredListener(InitNfcCard);
			nfc.removeNdefListener(InitNfcCard);

		}
		
		function ActiveNfcCardFailure()
		{
			$("#scan-card-message").html(scan_card_previous_message);
			notification_error("Erreur d'écriture, rescanner la carte");
		}
		
		// write
		nfc.write(message, success => ActiveNfcCardSuccess(), error => ActiveNfcCardFailure());

	}
	GetMasterKey(UseMasterKey);	
}


