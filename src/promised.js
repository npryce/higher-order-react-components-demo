
var React = require('react');

function Promised(Decorated) {
	return React.createClass({
		displayName: "Promised",
		
		getInitialState() {
			return {loading: true, error: null, value: null};
		},
		
		render() {
			if (this.state.loading) {
				return <span>Loading...</span>;
			}
			else if (this.state.error !== null) {
				return <span>Error: {this.state.error.message}</span>;
			}
			else {
				return <Decorated {...this.props} {...this.state.value}/>;
			}
		},
		
		componentDidMount() {
			this.props.promise.then(
				(value) => this.setState({loading: false, value: value}),
				(error) => this.setState({loading: false, error: error}));
		}
	});
}


module.exports = Promised;
