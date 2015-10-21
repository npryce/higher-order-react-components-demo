
var React = require('react');

class Country extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: null,
			country: null
		};
	}
 	
	render() {
		if (this.state.loading) {
			return <span>Loading...</span>;
		}
		else if (this.state.error !== null) {
			return <span>Error: {this.state.error.message}</span>;
		}
		else {
			var iso = this.state.country.iso;
			var name = this.state.country.name;
		
			return (
				<span className="country">
			    	<span className={"flag-icon flag-icon-"+iso}/>
					<span className="country-name">{name}</span>
				</span>
			);
		}
	}
	
	componentDidMount() {
		this.props.promise.then(
			value => this.setState({loading: false, country: value}),
			error => this.setState({loading: false, error: error}));
	}	
}

module.exports = Country;
