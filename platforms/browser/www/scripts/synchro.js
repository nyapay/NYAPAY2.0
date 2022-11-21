var full_path_page = $(location).attr('pathname');
var last_path_page = full_path_page.substring(full_path_page.lastIndexOf('/') + 1);

$("#synchro").on("click", function () {
	AddLogSql('INFO', 'Synchronisation', 'Demande de synchronisation des données');

	// envoyer les cartes actives sur le serveur
	PayTransactionsHandler.SynchroActiveCards(SynchroActiveCardsToServer);

	//$("#spinner-loader").show();
	PayTransactionsHandler.SynchroTransactions(SynchroTransactionsToServer);

	//synchroniser aussi les logs
	PayTransactionsHandler.SynchroLog(SynchroLogToServer);

	// récuperer les cartes depuis le serveur
	SynchroCardFromServer();
});

/* Recupérer les informations d'un utilisateur sur le serveur*/
var GetInformationFromServer = function (results) {

	// rediriger sie le terminal n'est pas configuré
	if (results.rows.length === 0) {
		window.location.href = 'page-install.html';
	}

	var terminal_user = results.rows.item(0).terminal_user;
	var terminal_number = results.rows.item(0).terminal_number;
	var terminal_url = results.rows.item(0).terminal_url;


	if (!terminal_url || terminal_url === 'undefined' || terminal_url === undefined || terminal_url === null) {
		var terminal_url = 'backoffice.nyapay.fr'
		notification_warning("Mise à jour de l'url du terminal par l'url par défaut");
	}

	$.ajax({
		url: "https://" + terminal_url + "/backoffice/mobil/synchro/get/information",
		type: 'GET',
		data: 'terminal_user=' + terminal_user + '&terminal_number=' + terminal_number,
		dataType: "json",
		success: function (data) {

			if (data.success === 'found') {

				var credit_commission = data.credit_commission;
				var debit_commission = data.debit_commission;
				var terminal_url = data.terminal_url;
				var terminal_mode = data.terminal_mode;
				var terminal_name = data.terminal_name;
				var terminal_username = data.terminal_username;
				var terminal_currency = data.terminal_currency;
				var terminal_currency_symbol = data.terminal_currency_symbol;
				var terminal_version = data.terminal_version;
				var new_keys = data.keys;

				var terminal_welcome_text = data.terminal_welcome_text;


				if (new_keys) {
					PayTransactionsHandler.DeleteKeySql();
					$.each(new_keys, function (key, value) {
						var new_key_name = value['name'];
						var new_key_state = value['state_id'];
						PayTransactionsHandler.AddNewKeySql(new_key_name, new_key_state);
					});

				}

				PayTransactionsHandler.UpdateTerminalSql(terminal_number, terminal_user, terminal_username, terminal_name, terminal_mode, credit_commission, debit_commission, terminal_currency, terminal_currency_symbol, terminal_version, terminal_url);

				if (terminal_welcome_text != '') {
					PayTransactionsHandler.CreateUpdateTerminalInformationSql(terminal_number, terminal_welcome_text);
				}
			}
			else {

				notification_error("Aucune information n'a été trouvé");

			}
		},
		error: function (xhr, status, error) {

			notification_error("Problèmes lors de la récupération des informations");
		},
		complete: function (data) {
			//récupérer les infos en BDD
			var SetLocalVariable = function (results) {


				var terminal_number = results.rows.item(0).terminal_number;
				var terminal_name = results.rows.item(0).terminal_name;
				var terminal_url = results.rows.item(0).terminal_url;
				var terminal_mode = results.rows.item(0).terminal_mode;
				var terminal_currency = results.rows.item(0).terminal_currency;
				var terminal_currency_symbol = results.rows.item(0).terminal_currency_symbol;

				var percentage_credit_commission = results.rows.item(0).credit_commission;
				var percentage_debit_commission = results.rows.item(0).debit_commission;


				var terminal_user = results.rows.item(0).terminal_user;
				var terminal_username = results.rows.item(0).terminal_username;


				var terminal_welcome_text = results.rows.item(0).terminal_welcome_text;

				$('#terminal_name').html(terminal_name);
				$('#terminal_welcome_text').html(terminal_welcome_text);

				// Set Local Storage
				window.localStorage.setItem("App-Currency", terminal_currency);
				window.localStorage.setItem("App-Currency-Symbol", terminal_currency_symbol);

				window.localStorage.setItem("App-Percentage-Debit-Commission", percentage_debit_commission);
				window.localStorage.setItem("App-Percentage-Credit-Commission", percentage_credit_commission);

				window.localStorage.setItem("App-Terminal-User", terminal_user);
				window.localStorage.setItem("App-Terminal-UserName", terminal_username);


				window.localStorage.setItem("App-Terminal-Number", terminal_number);
				window.localStorage.setItem("App-Terminal-Name", terminal_name);
				window.localStorage.setItem("App-Terminal-Url", terminal_url);
				window.localStorage.setItem("App-Terminal-Mode", terminal_mode);

				window.localStorage.setItem("App-User-Mode", '');

				window.localStorage.setItem("App-Resume-Total-Debit", '0');
				window.localStorage.setItem("App-Resume-Total-Commission-Debit", '0');

				window.localStorage.setItem("App-Resume-Total-Credit", '0');
				window.localStorage.setItem("App-Resume-Total-Commission-Credit", '0');

				$("#grant-scan-card").html("Démarrer l' authentification");
				$("#grant-scan-card").attr('disabled', false);

			}
			InforTerminal(SetLocalVariable);

		}
	});
};




window.SynchroLogToServer = function (results) {

	var terminal_url = window.localStorage.getItem("App-Terminal-Url");

	$("#spinner-loader").show();

	if (results === undefined) {

		//toastr.warning("Aucune donnée à synchroniser");
		setTimeout(function () { $("#spinner-loader").hide(); }, 2000);

		//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
	}
	else {

		var len = results.rows.length;
		if (len == 0) {
			setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
		}
		else {

			for (var i = 0; i < len; i++) {
				line = JSON.stringify(results.rows.item(i), undefined, 2);


				var host = $("#sync_host").val();
				$.ajax({
					url: "https://" + terminal_url + "/backoffice/mobil/synchro/log",
					type: 'POST',
					dataType: "json",
					data: { 'line': line },
					success: function (data) {
						if (data.success == 'sync log') {

							//toastr.success("Toutes vos transactions ont été synchronisées");
							//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
							var internal_id = data.internal_id;
							PayTransactionsHandler.ChangeLogSync(internal_id);
						}
						else {

							//notification_error("Une erreur est survenue lors de la synchronisation des transactions");
							//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);


						}
					},
					error: function (data, status, error) {
						// nothing
					},
					complete: function (data) {

						/* Reload Log Table */

						//PayTransactionsHandler.loadLogs();
						setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
					}
				});
			};
		}
	}
};

window.SynchroCardFromServer = function (action) {

	var terminal_url = window.localStorage.getItem("App-Terminal-Url");
	$("#spinner-loader").show();

	$.ajax({
		url: "https://" + terminal_url + "/backoffice/mobil/synchro/card",
		type: 'GET',
		dataType: "json",
		success: function (data) {
			if (data.success == 'synchro card') {
				$("#spinner-loader").show();
				var list_card = data.card;
				//sync_card

				var AddNewCard = function (results) {
					$.each(list_card, function (key, value) {

						var name = value.name;
						var firstname = value.firstname;
						var number = value.number;
						var card_id = value.id;
						var user_id = value.user_id;
						var state_id = value.state_id;

						if (results.rows.length == 0) //PASS 
						{
							AddCardSql(name, firstname, number, card_id, user_id, state_id);
						}

					});

					// If action = ReloadDataTableCard : you want to reload DataTable Card
					if (action == 'ReloadDataTableCard') {
						PayTransactionsHandler.loadCards(displayCards);
					}
				}
				DeleteCardSql(AddNewCard);
			}
			else {
				//notification_error("Erreur lors de la synchronisatation des cartes");					
			}
		},
		error: function (xhr, status, error) {
			notification_error("La synchronisatation des cartes à échouée");
		},
		complete: function (data) {
			setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
		}
	});
};





window.SynchroTransactionsToServer = function (results) {

	var terminal_url = window.localStorage.getItem("App-Terminal-Url");

	$("#spinner-loader").show();
	if (results === undefined) {

		//toastr.warning("Aucune donnée à synchroniser");
		//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);

		setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
	}
	else {

		var len = results.rows.length;
		if (len == 0) {
			setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
		}
		else {

			var success_sync = 0;
			var error_sync = 0;

			for (var i = 0; i < len; i++) {
				line = JSON.stringify(results.rows.item(i), undefined, 2);

				var host = $("#sync_host").val();
				$.ajax({
					url: "https://" + terminal_url + "/backoffice/mobil/synchro/transaction",
					type: 'POST',
					dataType: "json",
					data: { 'line': line },
					success: function (data) {
						if (data.success == 'sync transaction') {

							//toastr.success("Toutes vos transactions ont été synchronisées");
							//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
							var internal_id = data.internal_id;
							PayTransactionsHandler.ChangeTransactionsSync(internal_id);
							success_sync = success_sync + 1;
						}
						else {

							//notification_error("Une erreur est survenue lors de la synchronisation des transactions");
							//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
							error_sync = error_sync + 1;


						}
					},
					error: function (data, status, error) {
						AddLogSql('ERROR', 'Transaction', 'Synchronisatation - ' + line);

					},
					complete: function (data) {

						/* Reload Transaction Table 
						
						if ( last_path_page == 'debit.html')
						{
							PayTransactionsHandler.loadTransactions(displayTransactions, 1);
							//$('#debitpage').show();		
						} 
						else if ( last_path_page == 'credit.html')
						{
							PayTransactionsHandler.loadTransactions(displayTransactions, 2);
							//$('#creditpage').show();
						}
						else if ( last_path_page == 'admin.html')
						{
							PayTransactionsHandler.loadTransactions(displayTransactions, 1 , 2 );
						}
						*/
						setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
					}
				});
			};
		}
	}
};

window.SynchroActiveCardsToServer = function (results) {

	var terminal_url = window.localStorage.getItem("App-Terminal-Url");

	//list = returnJsonFromSqlResultSet(results);
	$("#spinner-loader").show();
	if (results === undefined) {

		//toastr.warning("Aucune donnée à synchroniser");
		//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);

	}
	else {

		var len = results.rows.length;

		if (len == 0) {
			setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
		}
		else {
			for (var i = 0; i < len; i++) {
				line = JSON.stringify(results.rows.item(i), undefined, 2);
				card_id = results.rows.item(i).card_id;

				$.ajax({
					url: "https://" + terminal_url + "/backoffice/mobil/synchro/active/card",
					type: 'POST',
					dataType: "json",
					data: { 'line': line },
					success: function (data) {
						if (data.success == 'sync card ended') {

							//toastr.success("Synchronisation de la carte");
							DeleteCardIdSql(card_id);
						}
						else {

							notification_error("Une erreur est survenue lors de la synchronisation des cartes actives");

						}
					},
					error: function (xhr, status, error) {
						notification_error("La synchronisatation des cartes actives à échouée");
					},
					complete: function (data) {
						/* Reload card Table */
						setTimeout(function () { $("#spinner-loader").hide(); }, 2000);
					}
				});

			}
		}
	}
};




