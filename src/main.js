"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var Country = require('./country');
var Promised = require('./promised');

var AsyncCountry = Promised(Country);

module.exports.start = function() {
	var countryIso = (window.location.search || "?gb").substring(1);
	
	function checkStatus(response) {
		if (response.status != 200) {
			throw Error(response.statusText);
		}
		else {
			return response;
		}
	}
	
    var app = ReactDOM.render(
		<AsyncCountry promise={
			fetch('data/'+countryIso+'.json')
				.then(checkStatus)
				.then(response => response.json())
		}/>,
		document.getElementById("country"));
};
