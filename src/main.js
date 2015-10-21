"use strict";

var R = require('ramda');
var React = require('react');
var ReactDOM = require('react-dom');
var Country = require('./country');
var CountryChooser = require('./country-chooser');
var Promised = require('./promised');

var AsyncCountry = Promised(Country);
var AsyncCountryChooser = Promised(CountryChooser);

var checkStatus = (response) => {
	if (response.status != 200) {
		throw Error(response.statusText);
	}
	else {
		return response;
	}
}

var fetchJson = url =>
	fetch(url)
		.then(checkStatus)
		.then(response => response.json());

var changeCountry = iso => {
	window.location.search = '?'+iso;
}


module.exports.start = function() {
	var countryIso = (window.location.search || "?gb").substring(1);
	
    ReactDOM.render(
		<AsyncCountry promise={fetchJson('data/'+countryIso+'.json')}/>,
		document.getElementById("country"));
	
	ReactDOM.render(
		<AsyncCountryChooser promise={fetchJson('data/countries.json').then(R.objOf('countries'))} 
							 onSelect={changeCountry}/>,
		document.getElementById("countries"));
};
