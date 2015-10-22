
var React = require('react');
var R = require('ramda');

var Promised = Decorated => class Promised extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    loading: true,
	    error: null,
	    value: null
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
	    var propsWithoutThePromise = R.dissoc('promise', this.props);
	    return <Decorated {...propsWithoutThePromise} {...this.state.value}/>;
	}
    }
    
    componentDidMount() {
	this.props.promise.then(
	    value => this.setState({loading: false, value: value}),
	    error => this.setState({loading: false, error: error}));
    }
};


module.exports = Promised;
