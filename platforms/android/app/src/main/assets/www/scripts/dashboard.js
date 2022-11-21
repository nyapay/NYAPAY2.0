var DrawChart= function(results)
{
				
	var length = results.rows.length;
	var DebitLabels = [];
	var DebitCommissionData = [];
	var CreditLabels = [];
	var CreditCommissionData = [];
	
	for(var i = 0; i< length; i++)
	{
		var item = results.rows.item(i);
		
		if (item.chart_type == 'Debit')
		{
			DebitLabels.push('Transactions vente');
			DebitLabels.push('Commission vente');
			
			DebitCommissionData.push(item.total);
			DebitCommissionData.push(item.commission);

		}
		if (item.chart_type == 'Credit')
		{
			CreditLabels.push('Transactions vente');
			CreditLabels.push('Commission vente');
			
			CreditCommissionData.push(item.total);
			CreditCommissionData.push(item.commission);

		}

		
	}
	
	if($('.chart').length > 0){
		
		var loadJS = function(url, implementationCode, location){
			var scriptTag = document.createElement('script');
			scriptTag.src = url;
			scriptTag.onload = implementationCode;
			scriptTag.onreadystatechange = implementationCode;
			location.appendChild(scriptTag);
		};
		
		var call_charts_to_page = function(){
			
			var DebitChart = $('#debit-chart');
			var CreditChart = $('#credit-chart');
			
			
			if(DebitChart.length){
				var DebitChart = new Chart(DebitChart, {
					type: 'doughnut',
					data: {
					  labels: DebitLabels,
					  datasets: [{
						backgroundColor: ["#4A89DC", "#DA4453","#CCD1D9"],
						borderColor:"rgba(255,255,255,0.5)",
						data: DebitCommissionData
					  }]
					},
					options: {
						responsive: true, maintainAspectRatio:false,
						legend: {display: true, position:'bottom', labels:{fontSize:13, padding:15,boxWidth:12},},
						tooltips:{enabled:true}, animation:{duration:500}, layout:{ padding: {bottom: 30}}
					}
				});		
			}
			
			if(CreditChart.length){
				var CreditChart = new Chart(CreditChart, {
					type: 'doughnut',
					data: {
					  labels: CreditLabels,
					  datasets: [{
						backgroundColor: ["#8CC152", "#E9573F","#CCD1D9"],
						borderColor:"rgba(255,255,255,0.5)",
						data: CreditCommissionData
					  }]
					},
					options: {
						responsive: true, maintainAspectRatio:false,
						legend: {display: true, position:'bottom', labels:{fontSize:13, padding:15,boxWidth:12},},
						tooltips:{enabled:true}, animation:{duration:500}, layout:{ padding: {bottom: 30}}
					}
				});		
			}
		}
		loadJS('scripts/charts.js', call_charts_to_page, document.body);
	}
}