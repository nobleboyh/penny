var global = {
    mobileClient: false,
    savePermit: true,
    usd: 0,
    eur: 0
};

/**
 * Oauth2
 */

function requestOauthToken(username, password, callback) {
	$.ajax({
		url: 'uaa/oauth/token',
		datatype: 'json',
		type: 'post',
		headers: {'Authorization': 'Basic YnJvd3Nlcjo='},
		data: {
			scope: 'ui',
			username: username,
			password: password,
			grant_type: 'password'
		},
		success: function (data) {
			localStorage.setItem('token', data.access_token);
			callback(true);
		},
		error: function () {
			removeOauthTokenFromStorage();
			callback(false);
		}
	});
}

function getOauthTokenFromStorage() {
	return localStorage.getItem('token');
}

function removeOauthTokenFromStorage() {
    return localStorage.removeItem('token');
}

/**
 * Current account
 */

function getCurrentAccount(callback) {

	var token = getOauthTokenFromStorage();

	if (token) {
		$.ajax({
			url: 'accounts/current',
			datatype: 'json',
			type: 'get',
			headers: {'Authorization': 'Bearer ' + token},
			success: function (data) {
				callback(data);
			},
			error: function () {
				removeOauthTokenFromStorage();
				callback(null);
			}
		});
	} else {
		callback(null);
	}
}

$(window).load(function(){

	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		FastClick.attach(document.body);
        global.mobileClient = true;
	}

	//TODO: move to statistics service
    // $.getJSON("https://api.exchangeratesapi.io/latest?base=RUB&symbols=EUR,USD", function( data ) {
    //     global.eur = 1 / data.rates.EUR;
    //     global.usd = 1 / data.rates.USD;
    // });

	global.eur = 1;
	global.usd = 1;

	var account = getCurrentAccount(function(account) {
		if (account) {
			showGreetingPage(account);
		} else {
			showLoginForm();
		}
	});
});

function showGreetingPage(account) {
    initAccount(account);
	var userAvatar = $("<img />").attr("src","images/userpic.jpg");
	$(userAvatar).load(function() {
		setTimeout(initGreetingPage, 500);
	});
}

function showLoginForm() {
	$("#loginpage").show();
	$("#frontloginform").focus();
	setTimeout(initialShaking, 700);
}