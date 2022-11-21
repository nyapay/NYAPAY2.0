function displayLogs(results){
	
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
		
		
		$('#search-results-log-list').append(' '+
				'<a href="#" onclick="ShowLogDetails('+item.id+',`'+item.date+'`, `'+item.user+'`, `'+item.category+'`, `'+item.level+'`, `'+item.message+'`, `'+sync_text+'`)" class="mb-2" data-filter-item data-filter-name="'+item.amount+" "+item.message+" "+sync_text+" "+item.card+" "+item.date+'"> '+
					'<div class="content mb-0">'+
						'<div class="d-flex mb-n1">'+
							'<div>'+
								'<h3 class="font-15 font-700">'+item.small_message+'</h3>'+
								'<p class="mb-0 font-11 opacity-70"><i class="fa fa-clock pr-2"></i>'+item.date+' <i class="fas fa-folder pl-3 pr-2"></i>'+item.category+' </p>'+
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

function ShowLogDetails(id, date, user, category, level, message, sync_text )
{
	$("#modal-log-date").html(date);
	$("#modal-log-user").html(user);
	$("#modal-log-category").html(category);
	$("#modal-log-level").html(level);
	$("#modal-log-message").html(message);
	$("#modal-log-sync").html(sync_text);
	$("#log-details").showMenu();
};


