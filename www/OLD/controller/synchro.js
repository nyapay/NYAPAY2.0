$(document).ready(function(){
	
	$("#synchro").on("click", function() {
		AddLogSql('INFO', 'Synchronisation', 'Demande de synchronisation des données' );
		
		// envoyer les cartes actives sur le serveur
		PayTransactionsHandler.SynchroActiveCards(SynchroActiveCardsToServer);
		
		//$("#spinner-loader").show();
		PayTransactionsHandler.SynchroTransactions(SynchroTransactionsToServer);
		 
		//synchroniser aussi les logs
		PayTransactionsHandler.SynchroLog(SynchroLogToServer);
		
		// récuperer les cartes depuis le serveur
		SynchroCardFromServer();
	});
	
	
	window.SynchroLogToServer= function(results){
		
		$("#spinner-loader").show();
		
		if (results === undefined){

			//toastr.warning("Aucune donnée à synchroniser", "Synchronisation");
			setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
			
			//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
		}
		else 
		{
			
			var len = results.rows.length;
			if (len == 0)
			{
				setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
			}
			else 
			{
				
				for (var i=0; i<len; i++){
					line = JSON.stringify(results.rows.item(i), undefined, 2);

					var host = $("#sync_host").val();
					$.ajax({
						url: "https://pay.jegere.eu/backoffice/mobil/synchro/log",
						type: 'POST',
						dataType: "json",
						data:  {'line' : line},
						success:function(data)
						{

							if (data.success == 'sync log')
							{
												
								//toastr.success("Toutes vos transactions ont été synchronisées", "Synchronisation");
								//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
								var internal_id = data.internal_id;
								PayTransactionsHandler.ChangeLogSync(internal_id);
							}
							else
							{
								
								//toastr.error("Une erreur est survenue lors de la synchronisation des transactions", "Synchronisation");
								//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);

													
							}
						},
						error: function(data, status, error){							
							// nothing
		
						},
						complete: function (data) {
							
							/* Reload Log Table */
							
							//PayTransactionsHandler.loadLogs();
							setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
						}
					});
				};
			}
		}	
	};
	
	window.SynchroCardFromServer = function(action){	
	$("#spinner-loader").show();
	$.ajax({
		url: "https://pay.jegere.eu/backoffice/mobil/synchro/card",
		type: 'GET',
		dataType: "json",
		success:function(data)
		{	
			if (data.success == 'synchro card')
			{
				$("#spinner-loader").show();
				var list_card = data.card;				
				//sync_card

				var AddNewCard= function(results){
					$.each( list_card, function( key, value ) {
						
						var name = value.name;
						var firstname = value.firstname;
						var number = value.number;
						var card_id = value.id;
						var user_id = value.user_id;
						var state_id = value.state_id;

						if (results.rows.length==0) //PASS 
						{
							AddCardSql(name, firstname, number, card_id, user_id, state_id);
						}
	
					});
					
					// If action = ReloadDataTableCard : you want to reload DataTable Card
					if (action=='ReloadDataTableCard')
					{
						PayTransactionsHandler.loadCards(displayCards); 		                
					}
				}
				DeleteCardSql(AddNewCard);				
			}
			else
			{
				//toastr.error("Erreur lors de la synchronisatation des cartes", "Synchronisation");					
			}
		},
		error: function(xhr, status, error){
			toastr.error("La synchronisatation des cartes à échouée", "Synchronisation");
		},
		complete: function(data)
		{
			setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);  
		}
	});
	};




	
window.SynchroTransactionsToServer = function(results){		
		$("#spinner-loader").show();
		if (results === undefined){

			//toastr.warning("Aucune donnée à synchroniser", "Synchronisation");
			//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
			
			setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
		}
		else 
		{

			var len = results.rows.length;
			if (len == 0)
			{
				setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
			}
			else 
			{
				
				var success_sync =  0;
				var error_sync = 0;
				
				for (var i=0; i<len; i++){
					line = JSON.stringify(results.rows.item(i), undefined, 2);

					var host = $("#sync_host").val();
					$.ajax({
						url: "https://pay.jegere.eu/backoffice/mobil/synchro/transaction",
						type: 'POST',
						dataType: "json",
						data:  {'line' : line},
						success:function(data)
						{
							if (data.success == 'sync transaction')
							{
												
								//toastr.success("Toutes vos transactions ont été synchronisées", "Synchronisation");
								//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
								var internal_id = data.internal_id;
								PayTransactionsHandler.ChangeTransactionsSync(internal_id);
								success_sync = success_sync + 1;
							}
							else
							{
								
								//toastr.error("Une erreur est survenue lors de la synchronisation des transactions", "Synchronisation");
								//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
								error_sync = error_sync + 1;

													
							}
						},
						error: function(data, status, error){							
							AddLogSql('ERROR', 'Transaction', 'Synchronisatation - ' + line );
		
						},
						complete: function (data) {
							
							/* Reload Transaction Table */
							
							var full_path_page  =   $(location).attr('pathname');
							var last_path_page  = full_path_page.substring(full_path_page.lastIndexOf('/') + 1);
							
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

							setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
						}
					});
				};
				/* A faire plus tard avec du temps.. Voir async/awit/promise
				// CHECK SYNCHRO
				if (error_sync > 0)
				{
					toastr.error("Erreur lors de la synchronisation : " + error_sync + " echouée et " + success_sync + " validée", "Synchronisation");
				}
				else
				{
					toastr.success("Synchronisation des transactions : " + success_sync + " validée", "Synchronisation");
				};
				*/
			}
		}	
	};
	
window.SynchroActiveCardsToServer = function(results){		
	//list = returnJsonFromSqlResultSet(results);
	$("#spinner-loader").show();
	if (results === undefined){
		
		//toastr.warning("Aucune donnée à synchroniser", "Synchronisation");
		//setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);

	}
	else 
	{

		var len = results.rows.length;
		
		if (len == 0)
		{
			setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
		}
		else 
		{
			for (var i=0; i<len; i++){
				line = JSON.stringify(results.rows.item(i), undefined, 2);
		
				$.ajax({
					url: "https://pay.jegere.eu/backoffice/mobil/synchro/active/card",
					type: 'POST',
					dataType: "json",
					data:  {'line' : line},
					success:function(data)
					{
						if (data.success == 'sync card ended')
						{
											
							//toastr.success("Synchronisation de la carte", "Synchronisation");
						}
						else
						{
							
							toastr.error("Une erreur est survenue lors de la synchronisation des cartes actives", "Synchronisation");
												
						}
					},
					error: function(xhr, status, error){
						toastr.error("La synchronisatation des cartes actives à échouée", "Synchronisation");
					},
					complete: function (data) {
						/* Reload card Table */
						setTimeout(function(){ $("#spinner-loader").hide(); }, 2000);
					}
				});
			
			}
		}			
	}	
};

if ( last_path_page != 'index.html')
{
	//spinner
	$("#spinner-loader").show();
		
	// récuperer les cartes depuis le serveur
	SynchroCardFromServer();
		
	// envoyer les cartes actives sur le serveur
	PayTransactionsHandler.SynchroActiveCards(SynchroActiveCardsToServer);
	
	// envoyer les transactions sur le serveur
	PayTransactionsHandler.SynchroTransactions(SynchroTransactionsToServer);
	
	// envoyer les transactions sur le serveur
	PayTransactionsHandler.SynchroLog(SynchroLogToServer);
} 


});

