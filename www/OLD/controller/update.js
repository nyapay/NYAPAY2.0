$(document).ready(function(){
//https://github.com/vaenow/cordova-plugin-app-update		

	window.checkAppUpdate = function() {
		var updateUrl = "https://public.jegere.eu/apk/version.xml";
		window.AppUpdate.checkAppUpdate(onSuccess, onFail, updateUrl);

		var me = this;
		function onFail() {console.log('fail', JSON.stringify(arguments), arguments);}
		function onSuccess() {
			console.log('success', JSON.stringify(arguments), arguments);
			me.innerHTML+="<br/>request-completed";
		}
	}
});
