// Disable validation Button if input (amount) is empty

$(document).ready(function(){
    
	// creditpage
	$('#credit_valid_transaction').attr('disabled',true);
    $('#credit_amount').keyup(function(){
        if($(this).val() > 0)
            $('#credit_valid_transaction').attr('disabled', false);            
        else
            $('#credit_valid_transaction').attr('disabled',true);
    });
	
	// debitpage
	$('#debit_valid_transaction').attr('disabled',true);
    $('#debit_amount').keyup(function(){
        if($(this).val() > 0)
            $('#debit_valid_transaction').attr('disabled', false);    
        else
            $('#debit_valid_transaction').attr('disabled',true);
    });
	
});