/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either calc_resultess or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 calculator  : https://code.sololearn.com/WDZ2ZOsC22hj/#html
 */
 
 
 
 var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		document.addEventListener("offline", onOffline, false);
		document.addEventListener("online", onOnline, false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
		//navigator.splashscreen.hide(); // !!! ATTENTION A ENLEVER A LA FIN DES DEVS !!!
		document.addEventListener("backbutton", onBackKeyDown, false);
				
		//playAudio('audio/bip.mp3');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
    }
};

app.initialize();

// Path of the current page 
var full_path_page  =   $(location).attr('pathname');
var last_path_page  = full_path_page.substring(full_path_page.lastIndexOf('/') + 1);


function exitFromApp()
{
	navigator.app.exitApp();
}
// BackButton
function onBackKeyDown() {
    
	/*if ( last_path_page == 'index.html')
	{
		navigator.app.exitApp();
	} 
	else
	{
		window.location.href = "../index.html";

	}*/
	// Do nothing on click bacj
	return;
}






/* NETWORK */

function onOffline() {
	$('#cloud_online').hide();
	$('#cloud_offline').show();
	
	$('#connection_status').html('');
	$('#connection_status').html('Hors ligne');
    
}

function onOnline() {
	$('#cloud_offline').hide();
	$('#cloud_online').show();
	
	$('#connection_status').html('');
	$('#connection_status').html('En ligne');
}

/* NETWORK */

/* Recupérer les informations d'un utilisateur sur le serveur*/					
var GetInformationFromServer= function(results)
{	
	
	$("#spinner-loader").show();
	
	var terminal_user = results.rows.item(0).terminal_user;
	var terminal_number = results.rows.item(0).terminal_number;
	
	$.ajax({
		url: "https://pay.jegere.eu/backoffice/mobil/synchro/get/information",
		type: 'GET',
		data: 'terminal_user='+terminal_user+'&terminal_number='+terminal_number,
		dataType: "json",
		success:function(data)
		{	
			
			if (data.success === 'found')
			{
				credit_commission 			= data.credit_commission;
				debit_commission  			= data.debit_commission;
				terminal_mode  				= data.terminal_mode;
				terminal_name  				= data.terminal_name;
				terminal_username  			= data.terminal_username;
				terminal_currency  			= data.terminal_currency;
				terminal_currency_symbol  	= data.terminal_currency_symbol;
				terminal_version  			= data.terminal_version;
				new_keys  					=  data.keys;
				
				if (new_keys)
				{
					PayTransactionsHandler.DeleteKeySql(); 
					$.each(new_keys, function(key, value){
					  new_key_name = value['name'];
					  new_key_state = value['state_id'];
					  PayTransactionsHandler.AddNewKeySql(new_key_name, new_key_state);
					});
					
				}	

				
				PayTransactionsHandler.UpdateTerminalInformationSql(terminal_user, terminal_username, terminal_name, terminal_mode, credit_commission, debit_commission, terminal_currency, terminal_currency_symbol, terminal_version);

			}
			else
			{
				toastr.clear();
				toastr.error("Aucune information n'a été trouvé", "Information");	
			
			}
		},
		error: function(xhr, status, error){
			toastr.clear();
			toastr.error("Problèmes lors de la récupération des informations", "Information");		
		},
		complete: function(data)
		{
			//récupérer le nom en BDD
			var ShowWelcome= function(results)
			{
	
				var terminal_name = results.rows.item(0).terminal_name;
				var terminal_currency = results.rows.item(0).terminal_currency;
				var terminal_currency_symbol = results.rows.item(0).terminal_currency_symbol;
				

					
				$('#company_name').html(terminal_name);
				
				//
				$('#preloadwelcomepage').hide(); 
				$('#welcomepage').toggle(1);
				
				setTimeout(function()
				{					
					$("#spinner-loader").hide();	
				}, 2000);
				
				
				cordova.getAppVersion.getVersionNumber().then(function (version) {
					//https://github.com/whiteoctober/cordova-plugin-app-version
					$("#version_app").html('Version '+version);
				});
				
				//verifier mise à jour
				checkAppUpdate();
				
				// Set currency in Local Storage
				window.localStorage.setItem("Storage_currency", terminal_currency);
				window.localStorage.setItem("Storage_currency_symbol", terminal_currency_symbol);
				
			}
			InforTerminal(ShowWelcome);	

		}
	});
};

/* Recupérer les informations d'un utilisateur sur le serveur*/
function AddInfoTerminal(terminal_number, terminal_user, terminal_pin, terminal_url)
{		
	$.ajax({
		url: terminal_url + "/backoffice/mobil/synchro/active/terminal",
		type: 'GET',
		data: 'terminal_number='+terminal_number+'&terminal_user='+terminal_user+'&terminal_pin='+terminal_pin,
		dataType: "json",
		success:function(data)
		{	
				
			if (data.success == 'terminal exist')
			{	
				PayTransactionsHandler.AddInfoTerminalSql(terminal_number, terminal_user, terminal_pin, terminal_url);
			}
			else
			{
				toastr.clear();
				toastr.error("Le terminal n'existe pas", "Configuration");					
			}
		},
		error: function(xhr, status, error){
			toastr.error("Erreur lors de la configuration du terminal, verifier l ' url/ip", "Configuration");
		}
	});
};

function ConfirmBackToIndex(buttonIndex)
{	
	if (buttonIndex == '1')
	{	
		window.location.href = "file:///android_asset/www/index.html";
	}
}


function BackToIndex(mode)
{
	navigator.notification.confirm(
    "Vous êtes sur le point de quitter le mode "+ mode +"\n\n" + "Etes vous sur d'effectuer cette action ?\n", // message
    ConfirmBackToIndex, // callback to invoke with index of button pressed
    'Sortie', // title
    ['VALIDER','ANNULER'] // buttonLabels
	);
};
	
// Actions quand tu arrives sur une page
$(document).ready(function(){ 
	
	databaseHandler.createDatabase();
	
	$('.page').hide();
	calc_result = '';
	//$('#loadpage').toggle(1);	
	

	if ( last_path_page == 'debit.html')
	{
		PayTransactionsHandler.loadTransactions(displayTransactions, 1);
		$('#debitpage').toggle(1);

	} 
	else if ( last_path_page == 'credit.html')
	{
		PayTransactionsHandler.loadTransactions(displayTransactions, 2);
		$('#creditpage').toggle(1);
	}
	else if ( last_path_page == 'admin.html')
	{

		/* Recupérer les informations les informations du terminal*/					
		var GetTerminalName= function(results)
		{	
			var terminal_name = results.rows.item(0).terminal_name;
			$('#company_name').html(terminal_name);
			$('#welcomepage').toggle(1);
		}
		
		InforTerminal(GetTerminalName);
	}
	else if ( last_path_page == 'install.html')
	{

		
		$('#installpage').toggle(1);

		$('#valid_info_terminal').on('click',function () {
			var terminal_number = $('#terminal_number').val();
			var terminal_user 	= $('#terminal_user').val();
			var terminal_pin 	= $('#terminal_pin').val();
			var terminal_url	= $('#terminal_url').val();
			
			terminal_number = terminal_number.toUpperCase(); 

			
			if ( !terminal_number || !terminal_user || !terminal_url || !terminal_pin)
			{
				toastr.error("Tous les champs ne sont pas complets", "Configuration");	
				return false;	
			}
			AddInfoTerminal(terminal_number, terminal_user, terminal_pin, terminal_url);
		});
		
	}
	
	else if ( last_path_page == 'index.html')
	{
		window.location.href = "pages/install.html";
		
		var ConfigurationTerminal = function(results){
			
			if (results.rows.length==0){
				// montrer la page d'installation
				window.location.href = "pages/install.html";
			}
			else 
			{	
				$('#preloadwelcomepage').toggle(1); 
				// recuperer les informations et montrer la section definit
				InforTerminal(GetInformationFromServer);
			
			}
		}
		//load configuration page or  login page 
		InforTerminal(ConfigurationTerminal);
	}
	else
	{
		window.location.href = "index.html";
	}
	
	
	
	// SCHEDULE EVERY 15 minutes
	if ( last_path_page != 'index.html' && last_path_page != 'install.html') 
	{
		setInterval(function () {
			
			AddLogSql('INFO', 'Scheduler', 'Demande de synchronisation des données' );
			
			// envoyer les cartes actives sur le serveur
			PayTransactionsHandler.SynchroActiveCards(SynchroActiveCardsToServer);
			
			//$("#spinner-loader").toggle(1);
			 PayTransactionsHandler.SynchroTransactions(SynchroTransactionsToServer);
			 
			 //synchroniser aussi les logs
			PayTransactionsHandler.SynchroLog(SynchroLogToServer);
			
			// récuperer les cartes depuis le serveur
			SynchroCardFromServer();
			
		}, 1000 * 60 * 15);
	}
	


	 
	setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
	$(".sync-error").hide();
	//SpinnerDialog.show('ok','ok');

	toastr.options = {
	  "closeButton": false,
	  "debug": false,
	  "newestOnTop": false,
	  "progressBar": false,
	  "positionClass": "toast-bottom-full-width",
	  "preventDuplicates": false,
	  "onclick": null,
	  "showDuration": "300",
	  "hideDuration": "1000",
	  "timeOut": "5000",
	  "extendedTimeOut": "1000",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut"
	};
});

// compteur
var access_mode_admin = 0;

function alertDismissed() {
    // do something
}

// verifier les droits
$("#check_grant").on("click", function() {
	$('.page').hide();
	$('#scangrantpage').toggle(1);
	nfc.addNdefListener(ReadGrantNfcCard);
});


function ChooseMode(mode) {
	
	window.location.href = 'pages/'+mode+'.html';
}


// verification des droits
function ReadGrantNfcCard(nfcEvent) {
	
	var UseKey= function(results)
	{
		var PayloadCard_grant = nfcEvent.tag.ndefMessage[6]["payload"];
		card_grant_encoded = nfc.bytesToString(PayloadCard_grant).substring(3);
		
		var PayloadCard_number = nfcEvent.tag.ndefMessage[2]["payload"];
		card_number_encoded    = nfc.bytesToString(PayloadCard_number).substring(3);
		
		
		var len = results.rows.length; 
		
		for (var i=0; i<len; i++){
			
			key_name = results.rows.item(i).name
			key_state = results.rows.item(i).state 

			card_grant_decrypted = CryptoJS.AES.decrypt(card_grant_encoded, key_name);
			card_number_decrypted = CryptoJS.AES.decrypt(card_number_encoded, key_name);
			
						// Sortir de la boucle si clé ok
			if (card_grant_decrypted && card_grant_decrypted  != '')
			{
				i = len + 1;
			}
			
		}
		
		if (!card_grant_decrypted || card_grant_decrypted  == '')
		{
			toastr.warning("Problème de clé", "Sécurité");
			return; //stop process
		}
						
		card_grant = card_grant_decrypted.toString(CryptoJS.enc.Utf8);
		card_number = card_number_decrypted.toString(CryptoJS.enc.Utf8);
		
		
		
		
		var CheckTerminalMode = function(results){
			

			var terminal_mode = results.rows.item(0).terminal_mode;
		
			if (card_grant == '1') //debit 
			{
				if (terminal_mode == 'debit' || terminal_mode == 'all')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode debit');
					location.href = 'pages/debit.html';
				}
				else{
					AddLogSql('ERROR', 'Login', 'Authentification : Terminal bloqué sur le mode ' + terminal_mode + ' - Accès refusé pour la carte ' + card_number);
					$('.page').hide();
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					$('#TerminalBlockedPage').toggle(1);					
				}

			}
			
			else if (card_grant == '2' ) //credit 
			{
				if (terminal_mode == 'credit' || terminal_mode == 'all')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode credit');
					location.href = 'pages/credit.html';
				}
				else{
					AddLogSql('ERROR', 'Login', 'Authentification : Terminal bloqué sur le mode ' + terminal_mode + ' - Accès refusé pour la carte ' + card_number);
					$('.page').hide();
					navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
					$('#TerminalBlockedPage').toggle(1);					
				}
			}
			
			else if (card_grant == '3' ) //choose debit,credit,admin 
			{
				
				// remove class disabled
				$("#credit_mode").prop('disabled', false);
				$("#debit_mode").prop('disabled', false);
				
				
				if (terminal_mode == 'debit')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode debit ');
					$("#credit_mode").prop('disabled', true);
					$('.page').hide();
					$('#modepage').toggle(1);
				}
				
				else if (terminal_mode == 'credit')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour le mode credit ');
					$("#debit_mode").prop('disabled', true);
					$('.page').hide();
					$('#modepage').toggle(1);
				}
				
				else if (terminal_mode == 'all')
				{
					AddLogSql('INFO', 'Login', 'Authentification : Accès authorisé pour la carte ' + card_number + ' pour tous les modes ');
					$('.page').hide();
					$('#modepage').toggle(1);
				}
			}
			
			else 
			{
				AddLogSql('ERROR', 'Login', 'Authentification : Accès refusé pour la carte ' + card_number);
				$('.page').hide();
				navigator.vibrate([500, 500, 500, 500, 500, 500, 500]);
				$('#GrantErrorPage').toggle(1);
			}
		
		};
		InforTerminal(CheckTerminalMode);
	}
	Getkey(UseKey);
}

function CloseGrant() {
	$('.page').hide();
	nfc.removeNdefListener(ReadGrantNfcCard);
	$('#welcomepage').toggle(1);
}	
			
			
function NfcSuccess(result) {

}

function NfcFailure(reason) {
	toastr.warning("Rescanner la carte", "Activation");
	
}


function displayTransactions(results){
	
	// desttroy dataTable if exist
	if ( $.fn.DataTable.isDataTable('#transaction_list_table') ) {
	  $('#transaction_list_table').DataTable().destroy();
	}
	
    var length = results.rows.length;
    var lstTransactions = $("#lstTransactions");
	
	// make empty the table
	$("#transaction_list_table > tbody").empty();
	
    for(var i = 0; i< length; i++){
        var item = results.rows.item(i);
		if (item.type_id == '2'){ var type = 'Recharge'};
		if (item.type_id == '1'){ var type = 'Vente'};
		
		if (item.sync == '1'){ 
		$('#transaction_list_table > tbody:last').append('<tr> <td>'+item.date+'</td>   <td>'+item.amount+'</td>  <td>' +
		'<button id="ShowTransactionsDetails" name="ShowTransactionsDetails" data-date="'+item.date+'" data-card='+item.card+'  data-sync='+item.sync+' data-amount='+item.amount+'  data-type='+type+' class="btn bg-grey btn-sm"> syn </button> </td> </tr>'
		)
		};
		
		if (item.sync == '0'){ 
		$('#transaction_list_table > tbody:last').append('<tr class="text-dark"> <td>'+item.date+'</td>   <td>'+item.amount+'</td>  <td>' +
		'<button id="ShowTransactionsDetails" name="ShowTransactionsDetails" data-date="'+item.date+'" data-card='+item.card+'  data-sync='+item.sync+' data-amount='+item.amount+'  data-type='+type+' class="btn bg-dark btn-sm"> voir </button> </td> </tr>'
		)
		};
    }
	
	// create or re-create dataTable
    $('#transaction_list_table').DataTable({
		language: { 
			processing:     "Traitement en cours...",
			search:         "",  
			lengthMenu:    "Afficher _MENU_ &eacute;l&eacute;ments",
			info:           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
			infoEmpty:      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
			infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
			infoPostFix:    "",
			loadingRecords: "Chargement en cours...",
			zeroRecords:    "Aucune transaction trouvée",
			emptyTable:     "Aucune transaction",
			paginate: {
				first:      "<<",
				previous:   "<",
				next:       ">",
				last:       ">>"
			},
			aria: {
				sortAscending:  ": activer pour trier la colonne par ordre croissant",
				sortDescending: ": activer pour trier la colonne par ordre décroissant"
			}
		},
		"lengthMenu": 
		[
		  [10, 25, 50, -1],
		  [10, 25, 50, "Tous"]
		],
		"pagingType": "simple",
		"pageLength": 5,
		"searching": true,
		"dom": '<"top">rt<"bottom"p>',
		"order": [[ 0, "desc" ]],
		"columnDefs": [
			{ "width": "70%", "targets": 0 },
			{ "width": "20%", "targets": 1 },
			{ "width": "10%", "targets": 2 }
		 ]
	});
	
	Table = $('#transaction_list_table').DataTable(); 
	$('#transaction_search').keyup(function(){
		  Table.search($(this).val()).draw() ;
	})
}

function displayLogs(results){

	// desttroy dataTable if exist
	if ( $.fn.DataTable.isDataTable('#logs_list_table') ) {
	  $('#logs_list_table').DataTable().destroy();
	}
	
    var length = results.rows.length;
    var lstLogs = $("#lstLogs");
	
	// make empty the table
	$("#logs_list_table > tbody").empty();
	
    for(var i = 0; i< length; i++){ 
		
        var item = results.rows.item(i);
		
		if (item.level == 'INFO'){
			$('#logs_list_table > tbody:last').append('<tr> <td>'+item.id+'</td>  <td>'+item.message+'</td> <td>' + 
			'<button id="ShowLogsDetails" name="ShowLogsDetails" data-date="'+item.date+'" data-level="'+item.level+'" data-message="'+item.message+'" class="btn bg-grey btn-sm"> voir </button> </td> </tr>'
			);
		}
		else{
			$('#logs_list_table > tbody:last').append('<tr class="text-danger"> <td>'+item.id+'</td>  <td>'+item.message+'</td> <td>' + 
			'<button id="ShowLogsDetails" name="ShowLogsDetails" data-date="'+item.date+'" data-level="'+item.level+'" data-message="'+item.message+'" class="btn bg-grey btn-sm"> voir </button> </td> </tr>'
			);
		}

    }
	
	// create or re-create dataTable
    $('#logs_list_table').DataTable({
		language: {
			processing:     "Traitement en cours...",
			search:         "",
			lengthMenu:    "Afficher _MENU_ &eacute;l&eacute;ments",
			info:           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
			infoEmpty:      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
			infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
			infoPostFix:    "",
			loadingRecords: "Chargement en cours...",
			zeroRecords:    "Aucun log trouvé",
			emptyTable:     "Aucun log",
			paginate: {
				first:      "<<",
				previous:   "<",
				next:       ">",
				last:       ">>"
			},
			aria: {
				sortAscending:  ": activer pour trier la colonne par ordre croissant",
				sortDescending: ": activer pour trier la colonne par ordre décroissant"
			}
		},
		"lengthMenu": 
		[
		  [10, 25, 50, -1],
		  [10, 25, 50, "Tous"]
		],
		"pagingType": "simple", 
		"pageLength": 5,
		"searching": true,
		"searching": true,
		"dom": '<"top">rt<"bottom"p>',
		"order": [[ 0, "desc" ]]
		
	});
	
	Table = $('#logs_list_table').DataTable(); 
	$('#logs_search').keyup(function(){
		  Table.search($(this).val()).draw() ;
	});
	
}

function displayCards(results){
	
	// desttroy dataTable if exist
	if ( $.fn.DataTable.isDataTable('#cards_list_table') ) {
	  $('#cards_list_table').DataTable().destroy();
	}
	
    var length = results.rows.length;
    var lstCards = $("#lstCards");
	
	// make empty the table
	$("#cards_list_table > tbody").empty();
	
	
	
	
    for(var i = 0; i< length; i++){ 
        var item = results.rows.item(i);
		
		
		var information  = item.state_id;
		
		if ( information == '2')
		{
			information = 'Bloquée';
			$('#cards_list_table > tbody:last').append('<tr class="text-danger"> <td>'+item.number+'</td> <td>'+information+'</td> <td>' + 
			'<button id="ShowCardsDetails" name="ShowCardsDetails" data-card_id='+item.card_id+' data-name="'+item.name+'" data-firstname="'+item.firstname+'" data-number='+item.number+' data-state_id='+item.state_id+' class="btn bg-grey btn-sm"> voir </button> </td> </tr>'
			);
		}
		else if ( information == '4')
		{
			information = 'Activer';
			$('#cards_list_table > tbody:last').append('<tr class="text-dark"> <td>'+item.number+'</td> <td>'+information+'</td> <td>' + 
			'<button id="ShowCardsDetails" name="ShowCardsDetails" data-card_id='+item.card_id+' data-name="'+item.name+'" data-firstname="'+item.firstname+'" data-number='+item.number+' data-state_id='+item.state_id+' class="btn bg-grey btn-sm"> voir </button> </td> </tr>'
			);
		}
		else if ( information == '1')
		{
			information = 'Déjà activée';
			$('#cards_list_table > tbody:last').append('<tr> <td>'+item.number+'</td> <td>'+information+'</td> <td>' + 
			'<button id="ShowCardsDetails" name="ShowCardsDetails" data-card_id='+item.card_id+' data-name="'+item.name+'" data-firstname="'+item.firstname+'" data-number='+item.number+' data-state_id='+item.state_id+' class="btn bg-grey btn-sm"> voir </button> </td> </tr>'
			);
		}
		else
		{
			information = 'Inconnue';
			
			$('#cards_list_table > tbody:last').append('<tr> <td>'+item.number+'</td> <td>'+information+'</td> <td>' + 
			'<button id="ShowCardsDetails" name="ShowCardsDetails" data-card_id='+item.card_id+' data-name="'+item.name+'" data-firstname="'+item.firstname+'" data-number='+item.number+' data-state_id='+item.state_id+' class="btn bg-grey btn-sm"> voir </button> </td> </tr>'
			);
			
		}
    }
	
	// create or re-create dataTable
    $('#cards_list_table').DataTable({
		language: {
			processing:     "Traitement en cours...",
			search:         "",
			lengthMenu:    "Afficher _MENU_ &eacute;l&eacute;ments",
			info:           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
			infoEmpty:      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
			infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
			infoPostFix:    "",
			loadingRecords: "Chargement en cours...",
			zeroRecords:    "Aucune carte trouvée",
			emptyTable:     "Aucune carte",
			paginate: {
				first:      "<<",
				previous:   "<",
				next:       ">",
				last:       ">>"
			},
			aria: {
				sortAscending:  ": activer pour trier la colonne par ordre croissant",
				sortDescending: ": activer pour trier la colonne par ordre décroissant"
			}
		},
		"lengthMenu": 
		[
		  [10, 25, 50, -1],
		  [10, 25, 50, "Tous"]
		],
		"pagingType": "simple", 
		"pageLength": 5,
		"searching": true,
		"searching": true,
		"dom": '<"top">rt<"bottom"p>',
		"order": [[ 2, "desc" ]]
		
	});
	
	Table = $('#cards_list_table').DataTable(); 
	$('#cards_search').keyup(function(){
		  Table.search($(this).val()).draw() ;
	});
	
}

$( document).ready(function() {
	// TRANSACTIONS
	$('#transaction_list_table tbody').on('click', '#ShowTransactionsDetails', function () {		
		document.getElementById("detail_date").value = $(this).data('date');
		document.getElementById("detail_card_number").value = $(this).data('card');
		document.getElementById("detail_amount").value = $(this).data('amount');
		document.getElementById("detail_type").value = $(this).data('type');
		
		var sync = $(this).data('sync');
		
		if ( sync == '1')
		{
			sync = 'Synchronisé'
		}
		else
		{
			sync = 'Non Synchronisé'
		}
		
		document.getElementById("detail_sync").value = sync;
		document.getElementById("detail_type").value = $(this).data('type');
		$('#TransactionsDetails').modal('show');
	});
	
	// CARDS
	$('#cards_list_table tbody').on('click', '#ShowCardsDetails', function () {
		document.getElementById("detail_active_card_id").value = $(this).data('card_id');
		document.getElementById("detail_active_name").value = $(this).data('name');
		document.getElementById("detail_active_firstname").value = $(this).data('firstname');
		document.getElementById("detail_active_card").value = $(this).data('number');
		document.getElementById("detail_active_amount").value = 0;
		document.getElementById("detail_active_grant").value = 0;
		
		var state_id = $(this).data('state_id');
		
		$('#valid_active_card').hide();	
		
		if (state_id == '4') {
			$('#valid_active_card').toggle(1);	
			event.preventDefault();
   			$("#detail_active_amount").prop("disabled", false); 
   			$("#detail_active_grant").prop("disabled", false); 
		} 
		
	
		$('#CardsDetails').modal('show'); 

	});
	
	// SCAN ACTIVE CARD
	$('#valid_active_card').on('click',function () {
		ScanActiveCard();
	});
	
	// LOGS
	$('#logs_list_table tbody').on('click', '#ShowLogsDetails', function () 
	{
		document.getElementById("detail_log_date").value = $(this).data('date');
		document.getElementById("detail_log_level").value = $(this).data('level');
		document.getElementById("detail_log_message").value = $(this).data('message');
		$('#LogsDetails').modal('show'); 
	});
	

});


/* Reload Transaction Table */
$( "#tab_credit_transaction_list").click(function() {
  PayTransactionsHandler.loadTransactions(displayTransactions, 2);
});

$( "#tab_debit_transaction_list").click(function() {
  PayTransactionsHandler.loadTransactions(displayTransactions, 1);
});

/* PANNEL PAGE */
$(document).ready(function(){
	$('.navigation').click(function(e){
		
	calc_result = '';
	
	 $('.page').hide();
	var dest = $(this).attr('href');
	
	if (dest == '#listpage')
	{
		 PayTransactionsHandler.loadTransactions(displayTransactions, 1, 2); // not so good CHECK AFTER ALL DEV
	};
	if (dest == '#logpage')
	{
		PayTransactionsHandler.loadLogs(displayLogs);
	};
	if (dest == '#activepage')
	{
		 PayTransactionsHandler.loadCards(displayCards);
	};
	if (dest == '#creditpage' || dest == '#debitpage')
	{
		nfc.removeNdefListener(InfoNfcCard);
	}
	if (dest == '#scaninfopage')
	{
		nfc.addNdefListener(InfoNfcCard);
	}
	if (dest == '#terminalpage')
	{
		
		var ConfigTerminal = function(results){
			
			var terminal_name = results.rows.item(0).terminal_name;
			var terminal_number = results.rows.item(0).terminal_number;
			var terminal_user = results.rows.item(0).terminal_user;
			var terminal_username = results.rows.item(0).terminal_username;
			var terminal_version = results.rows.item(0).terminal_version;
			var terminal_date = results.rows.item(0).date;
			
			document.getElementById("terminal_name").value = terminal_name;
			document.getElementById("terminal_number").value = terminal_number;
			document.getElementById("terminal_user").value = terminal_user;
			document.getElementById("terminal_username").value = terminal_username;
			
			cordova.getAppVersion.getVersionNumber().then(function (version) {
				//https://github.com/whiteoctober/cordova-plugin-app-version
				document.getElementById("terminal_version").value = version;
			});
			

			
		};
		
		//prepare configuration or login
		InforTerminal(ConfigTerminal);
		
	};
	if (dest == '#adminterminalpage')
	{
		
		var ConfigTerminal = function(results){
			
			
			var terminal_id = results.rows.item(0).id;
			var terminal_name = results.rows.item(0).terminal_name;
			var terminal_number = results.rows.item(0).terminal_number;
			var terminal_user = results.rows.item(0).terminal_user;
			var terminal_username = results.rows.item(0).terminal_username;
			var terminal_version = results.rows.item(0).terminal_version;
			var terminal_url = results.rows.item(0).terminal_url;
			var terminal_mode = results.rows.item(0).terminal_mode;
			var terminal_date = results.rows.item(0).date;
			
			
			document.getElementById("terminal_id").value = terminal_id;
			document.getElementById("terminal_name").value = terminal_name;
			document.getElementById("terminal_number").value = terminal_number;
			document.getElementById("terminal_user").value = terminal_user;
			document.getElementById("terminal_username").value = terminal_username;
			document.getElementById("terminal_url").value = terminal_url;
			
			$('#terminal_mode option[value="'+terminal_mode+'"]').prop('selected', true);
			
			cordova.getAppVersion.getVersionNumber().then(function (version) {
				//https://github.com/whiteoctober/cordova-plugin-app-version
				document.getElementById("terminal_version").value = version;
			});
			
			$("#terminal_date").text(' Installation du lecteur le ' + terminal_date);
			
		};
		
		//prepare configuration or login
		InforTerminal(ConfigTerminal);
		
		
		$('#terminal_valid').on('click',function () {
		var terminal_id = $('#terminal_id').val();	
		var terminal_mode = $('#terminal_mode').val();
		var terminal_url	= $('#terminal_url').val();

		PayTransactionsHandler.UpdateTerminalSql(terminal_id, terminal_mode, terminal_url);
		});
		
	};
	
	$(dest).toggle(1);

	//$(dest).slideToggle();
	$('#sidebarPanel').modal('hide')
	});
});

/* TRANSACTION TEST 

INSERT INTO transactions (date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES ('2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES ('2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);

INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
INSERT INTO transactions (id, date, terminal_number, terminal_user, card, card_amount, key, type_id, amount, commission, percentage, sync, state_id) 
VALUES (1,'2020-12-19 15:34', '0', '50', 'TEST', 4, 'TESTKEY', 1, 6, 0, 0.0, 0, 1);
