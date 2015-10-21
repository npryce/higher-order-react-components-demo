
var React = require('react');
var Promised = require('./promised');

var Country = ({name, iso}) => 
	<span className="country">
	    <span className={"flag-icon flag-icon-"+iso}/>
		<span className="country-name">{name}</span>
	</span>;

module.exports = Country;
