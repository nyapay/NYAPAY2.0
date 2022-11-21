function displayCards(results){
	

	var user_mode = window.localStorage.getItem("App-User-Mode");
    var length = results.rows.length;
    for(var i = 0; i< length; i++){
        
		var item = results.rows.item(i);
		var information_id  = item.state_id;
		

		if ( information_id == '2')
		{
			information = 'Bloquée';
			state_color = 'orange';
		}
		else if ( information_id == '4')
		{
			information = 'Activer';
			state_color = 'blue';
		}
		else if ( information_id == '1')
		{
			information = 'Déjà activée';
			state_color = 'dark';
		}
		else
		{
			information = 'Inconnue';
		}
		
		$('#search-results-card-list').append(' '+
		'<a href="#" onclick="ShowCardDetails('+item.card_id+',`'+item.name+'`, `'+item.firstname+'`, `'+item.number+'`, `'+item.state_id+'`, `'+information+'`, `'+information_id+'`)" class="mb-2" data-filter-item data-filter-name="'+item.name+" "+item.firstname+" "+information+" "+item.number+'"> '+
			'<div class="content mb-0">'+
				'<div class="d-flex mb-n1">'+
					'<div>'+
						'<h3 class="font-15 font-700"><i class="fas fa-credit-card font-18 mr-2"></i>'+item.number+'</h3>'+
						'<p class="mb-0 font-11 opacity-70"><i class="fa fa-info-circle pr-2"></i> Etat : '+information+' </p>'+
					'</div>'+
					'<div class="ml-auto text-center">'+
						'<i class="fas fa-circle color-'+state_color+'-dark"></i>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</a>'+
		' ');
    }
	//remove loader
	$('#preloader').addClass('preloader-hide');

};

function ShowCardDetails(card_id, name, firstname, number, state_id, information, information_id)
{
	
	$("#modal-card-amount").val('0');
	$("#modal-card-grant").val('0');
		
	if (information_id == '4')
	{
		$("#confirm-active-card").show();
		$("#modal-card-state").hide();
		$("#modal-label-card-state").hide();
		
		$("#modal-card-amount").attr('disabled', false);
		$("#modal-card-grant").attr('disabled', false); 		
	}
	else
	{
		$("#confirm-active-card").hide();
		$("#modal-card-state").show();
		$("#modal-label-card-state").show();

		$("#modal-card-amount").attr('disabled', true); 
		$("#modal-card-grant").attr('disabled', true); 
	}

		
	$("#modal-card-id").val(card_id);
	$("#modal-card-name").html(name);
	$("#modal-card-firstname").html(firstname);
	$("#modal-card-number").html(number);
	$("#modal-card-state").html(information);
	$("#card-details").showMenu();
	
};


