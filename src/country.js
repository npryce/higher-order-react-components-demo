
var React = require('react');
var Promised = require('./promised');

class Country extends React.Component {
	render() {
		var flagClass = "flag-icon flag-icon-"+this.props.iso
		return <span className="country">
		    <span className={flagClass}/>
			<span className="country-name">{this.props.name}</span>
		</span>;
	}
}

module.exports = Country;
