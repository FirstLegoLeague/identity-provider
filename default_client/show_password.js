var ShowPassword = (function(my) {

	my.toggle = function(selector) {
		let elem = document.querySelector(selector);
		elem.type = (elem.type === 'password') ? 'text' : 'password';
	};

	return my;

}) ({});