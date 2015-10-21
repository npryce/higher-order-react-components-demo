
var React = require('react');
var Country = require('./country');
var R = require('ramda');

var CountryChooser = ({countries, onSelect}) =>
	<ul className="country-chooser">{ 
		countries.map(c => 
			<li key={c.iso} onClick={() => onSelect(c.iso)}>
				<Country {...c}/>
			</li>)
	}</ul>;

module.exports = CountryChooser;
