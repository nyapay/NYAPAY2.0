function ConfirmInstallTerminal()
{
	$('#confirm-install-terminal').attr('disabled', true);
	$('#confirm-install-terminal').html('Configuration en cours ..  <div class="spinner-border2 font-10" role="status"></div>');
	
	var terminal_number = $('#install-terminal-number').val();
	var terminal_user 	= $('#install-terminal-user').val();
	var terminal_pin 	= $('#install-terminal-pin').val();
	var terminal_url	= $('#install-terminal-url').val();
	
	if ( !terminal_number || !terminal_user || !terminal_url || !terminal_pin)
	{
		$('#confirm-install-terminal').attr('disabled', false);		
		$('#confirm-install-terminal').html('Configurer le terminal')
		notification_error("Tous les champs ne sont pas complets");
		return false;	
	}

	terminal_number = terminal_number.toUpperCase(); 
	
	
	
	/* Enregisterer le terminal*/
	function RegisterTerminal(terminal_number, terminal_user, terminal_pin, terminal_url)
	{		
		$.ajax({
			url: "https://"+terminal_url+"/backoffice/mobil/synchro/get/information",
			type: 'GET',
			data: 'terminal_number='+terminal_number+'&terminal_user='+terminal_user+'&terminal_pin='+terminal_pin,
			dataType: "json",
			success:function(data)
			{	
					
				if (data.success == 'found')
				{	
					PayTransactionsHandler.AddInfoTerminalSql(terminal_number, terminal_user, terminal_pin, terminal_url);
				}
				else
				{
					$('#confirm-install-terminal').attr('disabled', false);		
					$('#confirm-install-terminal').html('Configurer le terminal')
					notification_error("Le terminal n'existe pas", "Configuration");
					return false;					
				}
			},
			error: function(xhr, status, error){
				$('#confirm-install-terminal').attr('disabled', false);		
				$('#confirm-install-terminal').html('Configurer le terminal')
				notification_error("Erreur lors de la configuration du terminal, verifier l ' url/ip", "Configuration");
				return false;
			}
		});
	};
	
	
	RegisterTerminal(terminal_number, terminal_user, terminal_pin, terminal_url);
};