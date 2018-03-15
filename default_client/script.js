var ShowPassword = (function(my) {

	my.toggle = function(selector) {
		let elem = document.querySelector(selector);
		elem.type = (elem.type === 'password') ? 'text' : 'password';
	};

	return my;

}) ({});

var Display = (function(my) {

	my.toggle = function(selector) {
		let elems = document.querySelectorAll(selector);
		elems.forEach(elem => {
			elem.style.display = (elem.style.display === 'none') ? 'block' : 'none';
		})
	};

	return my;

}) ({});