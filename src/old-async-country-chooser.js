
var React = require('react');
var Country = require('./country');
var R = require('ramda');

class CountryChooser extends React.Component {
    constructor(props) {
	super(props);
	this.state = {loading: true, error: null, countries: null};
    }
    
    render() {
	if (this.state.loading) {
	    return <span>Loading...</span>;
	}
	else if (this.state.error !== null) {
	    return <span>Error: {this.state.error.message}</span>;
	}
	else {
	    return (
	        <ul className="country-chooser">
		    {this.state.countries.map(c => 
		        <li key={c.iso} onClick={() => this.props.onSelect(c.iso)}>
			    <span className="country">
			        <span className={"flag-icon flag-icon-"+c.iso}/>
				<span className="country-name">{c.name}</span>
			    </span>
			</li>)
		    }
		</ul>
	    );
	}
    }
    
    componentDidMount() {
        this.props.promise.then(
            value => this.setState({loading: false, countries: value}),
            error => this.setState({loading: false, error: error}));
    }
}

module.exports = CountryChooser;
