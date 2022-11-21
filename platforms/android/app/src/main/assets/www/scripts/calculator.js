/* START - CALCULATOR */

var calc_result = "";
const chr  	= n => exp(calc_result + n);

const ce 	= () => exp(calc_result.substr(0, calc_result.length-1));
const exp  	= e => $('.calc').html((calc_result = e));
const exp_total  = e => $('.calc_total_preview').html((calc_result = e));

const c 	= () => (exp_total('0.00'),exp('')) ;

function eq() {
	
    try {
		if (eval(calc_result) === undefined){
			exp('');
		}
		else{
			
			if (eval(calc_result) > 100000)
			{
				$('#notification-error-text').html('le montant calculé est supérieur à 100000');
				$('#notification-error').toast('show');
			}
			else if (eval(calc_result) < 0)
			{
				$('#notification-error-text').html('le montant ne peut pas être inférieur à 0');
				$('#notification-error').toast('show');
			}
			else
			{
				exp_total('' + eval(calc_result).toFixed(2));
				exp('');
			}

		}
        
    } catch(e) {
		$('#notification-error-text').html('Merci de verifier votre calcul');
		$('#notification-error').toast('show');
    }
}

/* END - CALCULATOR */