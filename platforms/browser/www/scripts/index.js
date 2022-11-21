var app = {
	// Application Constructor
	initialize: function () {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},

	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function () {
		this.receivedEvent('deviceready');
		//navigator.splashscreen.hide(); // !!! ATTENTION A ENLEVER A LA FIN DES DEVS !!!
		document.addEventListener("backbutton", onBackKeyDown, false);

		//playAudio('audio/bip.mp3');
	},

	// Update DOM on a Received Event
	receivedEvent: function (id) {
		var parentElement = document.getElementById(id);
	}
};

app.initialize();


function onBackKeyDown() {

	var full_path_page = $(location).attr('pathname');
	var last_path_page = full_path_page.substring(full_path_page.lastIndexOf('/') + 1);

	// PAGE WELCOME


	// PAGE USER
	if (last_path_page != 'page-presentation.html' && last_path_page != 'welcome.html' && last_path_page != 'page-install.html') {

		var resume_total_debit = Number(window.localStorage.getItem("App-Resume-Total-Debit"));
		var resume_total_commission_debit = Number(window.localStorage.getItem("App-Resume-Total-Commission-Debit"));

		var resume_total_credit = Number(window.localStorage.getItem("App-Resume-Total-Credit"));
		var resume_total_commission_credit = Number(window.localStorage.getItem("App-Resume-Total-Commission-Credit"));


		if (user_mode == 'debit') {
			$("#resume-activity").html('Vote total des ventes est de ' + resume_total_debit + ' et votre total de commission est de ' + resume_total_commission_debit);
			$("#close-session").showMenu();
		}

		if (user_mode == 'credit') {
			$("#resume-activity").html('Vote total des recharges est de ' + resume_total_credit + ' et votre total de commission est de ' + resume_total_commission_credit);
			$("#close-session").showMenu();
		}

		if (user_mode == 'admin') {
			$("#resume-activity").html('Vote total des recharges est de ' + resume_total_credit + ' et votre total de commission est de ' + resume_total_commission_credit);
			$("#close-session").showMenu();
		}

	}
	else if (last_path_page == 'welcome.html' || last_path_page == 'page-install.html') {
		window.location.href = 'page-presentation.html';
	}
	else {
		$("#close-app").showMenu();
	}

}

/* START - NOTIFICATION */

function notification_error(info) {

	$('#notification-error-text').html(info);
	$('#notification-error').toast('show');
}

function notification_warning(info) {

	$('#notification-warning-text').html(info);
	$('#notification-warning').toast('show');
}

function notification_success(info) {

	$('#notification-success-text').html(info);
	$('#notification-success').toast('show');
}

function CloseSession() {

	if (user_mode == 'debit') {

		$("#resume-activity").html('Vote total des ventes est de ' + resume_total_debit + ' et votre total de commission est de ' + resume_total_commission_debit);
		$("#close-session").showMenu();
	}

	if (user_mode == 'credit') {
		$("#resume-activity").html('Vote total des recharges est de ' + resume_total_credit + ' et votre total de commission est de ' + resume_total_commission_credit);
		$("#close-session").showMenu();

	}
	$("#close-session").showMenu();
}

function ConfirmCloseSession() {
	$("#close-session").hideMenu();
	window.location.href = 'welcome.html';
}

function CloseApp() {
	navigator.app.exitApp();
}

