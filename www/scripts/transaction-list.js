function displayTransactions(results){
	

	var user_mode = window.localStorage.getItem("App-User-Mode");
    var length = results.rows.length;
	
    for(var i = 0; i< length; i++){
        var item = results.rows.item(i);
		
		if (item.sync == '1'){

			var sync_color 	= 'green';
			var sync_text  	= 'Oui';
		}
		else if (item.sync == '0'){

			var sync_color 	= 'red';
			var sync_text 	= 'Non';
		}
		
		if (user_mode == 'debit')
		{
			var transaction_mode = 'Vente';
			var transaction_icon = 'fa fa-shopping-bag';
		}
		
		if (user_mode == 'credit')
		{
			var transaction_mode = 'Recharge';
			var transaction_icon = 'fas fa-coins';
			
		}
		
		if (user_mode == 'admin')
		{
			
			if (item.type_id == '1'){

				var transaction_mode = 'Vente';
				var transaction_icon = 'fa fa-shopping-bag';
			}
		
			if (item.type_id == '2'){

				var transaction_mode = 'Recharge';
				var transaction_icon = 'fas fa-coins';
			}
			
		}
		
		
		$('#search-results-transaction-list').append(' '+
				'<a href="#" onclick="ShowTransactionDetails('+item.id+',`'+item.date+'`, `'+item.card+'`, `'+item.amount+'`, `'+item.commission+'`, `'+item.percentage+'`, `'+sync_text+'`)" class="mb-2" data-filter-item data-filter-name="'+item.amount+" "+transaction_mode+" "+sync_text+" "+item.card+" "+item.date+'"> '+
					'<div class="content mb-0">'+
						'<div class="d-flex mb-n1">'+
							'<div>'+
								'<h3 class="font-15 font-700"><i class="'+transaction_icon+' font-18 mr-2"></i>'+transaction_mode+'  '+item.amount+'</h3>'+
								'<p class="mb-0 font-11 opacity-70"><i class="fa fa-clock pr-2"></i>'+item.date+' <i class="fas fa-plus pl-3 pr-2"></i>Commission '+item.commission+' </p>'+
							'</div>'+
							'<div class="ml-auto text-center">'+
								'<i class="fas fa-circle color-'+sync_color+'-dark"></i>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</a>'+
		
		' ');

    }
	//remove loader
	$('#preloader').addClass('preloader-hide');

};

function ShowTransactionDetails(id, date, card, amount, commission, percentage, sync )
{

	$("#modal-transaction-id").html(id);
	$("#modal-transaction-date").html(date);
	$("#modal-transaction-card-number").html(card);
	$("#modal-transaction-amount").html(amount);
	$("#modal-transaction-commission").html(commission);
	$("#modal-transaction-percentage").html(percentage + ' %');
	$("#modal-transaction-sync").html(sync);
	
	$("#transaction-details").showMenu();
	
};


