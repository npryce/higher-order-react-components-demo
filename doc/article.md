Higher Order React Components
=============================

In React, “higher-order components” is a technique for defining common functionality that can be predictably composed with existing component classes to augment their behaviour. They are a superior alternative to JavaScript prototypes, [ES6 class inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Sub_classing_with_extends) and [React mixins](https://facebook.github.io/react/docs/reusable-components.html#mixins).  Prototype and ES6 class inheritance (which are the same thing under the hood) are limited to single inheritance, so a component class cannot inherit behaviour from multiple superclasses. React mixins are not supported in ES6 classes and look likely to be dropped from the React API in a future release.  Higher-order components, on the other hand, let you compose multiple behaviours into a component class, even if written as ES6 class.  They can also be used with components written with the old ES5 syntax.

Let’s look at why we might want to use higher-order components.

An Example Problem
------------------

Imagine we’re writing an international e-commerce site. Each customer has a preferred country that the site uses to calculate shipping costs and determine the currency in which to display prices.  The site displays the customer’s preferred country in the navigation bar at the top of each page.  If the user is travelling, they can select their preferred country from a menu of countries supported by the site.

Both the country associated with the user’s session and the list of all countries supported by the application are fetched by HTTP from the server in JSON format and displayed by React components.  For example, the user's preferred country is returned as:

~~~~~~~~~~~~~~~json
{"iso": "GB", "name": "United Kingdom"}
~~~~~~~~~~~~~~~

And the list of supported countries is returned as:

~~~~~~~~~~~~~~~json
[
  {"iso": "FR", "name": "France"},
  {"iso": "GB", "name": "United Kingdom"},
  ...
]
~~~~~~~~~~~~~~~

The Country component below displays the user’s preferred country.  Because country data is received asynchronously, it receives a *promise* of the country information.  While the promise is pending, the component displays a loading indicator. When the promise is resolved successfully, the component displays the country information as a flag icon and name.  If the promise is rejected, the component displays an error message.

~~~~~~~~~~~~~~~~~~~javascript
class Country extends React.Component {
    constructor(props) {
	super(props);
	this.state = {loading: true, error: null, country: null};
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
~~~~~~~~~~~~~~~~~~~

It can be used like this (assuming fetchJson loads JSON from a relative URL and returns a promise of the JSON):

~~~~~~~~~~~~~~~~~~~html
<Country promise={fetchJson('api/country.json')}/>
~~~~~~~~~~~~~~~~~~~

The CountryChooser component below displays the list of available countries, which are also passed to it as a promise:

~~~~~~~~~~~~~~~~~~~javascript
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
		        <li key={c.iso} 
                        onClick={() => this.props.onSelect(c.iso)}>
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
~~~~~~~~~~~~~~~~~~~

It can be used like this (assuming the same fetchJson function and a changeUsersPreferredCountry function that sends the change of country to the server):

~~~~~~~~~~~~~~~~~~~html
<CountryChooser promise={fetchJson('api/countries.json')} 
                onSelect={changeUsersPreferredCountry}/>
~~~~~~~~~~~~~~~~~~~

There’s a lot of duplication between the two components.  

They duplicate the state machine required to receive and render data obtained asynchronously from a promise.  These are not the only React components in the application that need to display data loaded asynchronously from the server, so addressing that duplication will shrink the code significantly.

The `CountryChooser` component cannot use the `Country` component to display the countries in the list because the event handling is intermingled with the presentation of the data. It therefore duplicates the code to render a country as HTML.  We don't want these HTML fragments diverging, because that will then create further duplication in our CSS stylesheets.

What can we do?

We could extract the promise event handling into a base class. But JavaScript only supports single inheritance, so we if our components inherit event handling for promises, they cannot inherit base classes that provide event handling for other things, such as user interaction [^for example, in recent project we used higher-order components to compose live updates, drag-source and drop-target behaviour into stateless rendering components]. And although it disentangles the promise event handling from the rendering, it doesn't disentangle the rendering from the promise event handling, so we still couldn't use the 'Country' component within the 'CountryChooser'.

It sounds like a job for mixins, but React's mixins don’t work with ES6 classes and are going to be dropped from the API.

Higher-order components to the rescue!

What is a Higher-Order Component?
---------------------------------

A higher-order component is merely a function from component class to component class. The function takes a component class as a parameter and returns a new component class that wraps useful functionality around the class passed in [^actually, a higher-order component could take more than one components as parameters, but we only need one in this example].  If you’re familiar with the "Gang of Four" design patterns and are thinking "Decorator pattern", you’re pretty much bang on.

As a shorthand, in the rest of this article I'm going to call class passed to the function the "decorated class", the class returned by the function the "decorator class", and the function itself as the “higher-order component”.  I’ll use “decorated component” and “decorator component” to mean instances of the decorated and decorator classes.

A decorator component usually handles events on behalf of the decorated component. It maintains some state and communicates with the decorated component by passing state values and callbacks to the decorated component via its props.

Let's assume we have a higher-order component called `Promised` that translates a promise of a value into props for a decorated component. The decorator component performs all the state management required to use the promise. This means that decorated components can be stateless, only concerned with presentation. 

The `Country` component now only needs to display to country information:

~~~~~~~~~~~~~~javascript
var Country = ({name, iso}) => 
    <span className="country">
        <span className={"flag-icon flag-icon-"+iso}/>
        <span className="country-name">{name}</span>
    </span>;
~~~~~~~~~~~~~~

To define a component that receives the country information asynchronously as a promise, we decorate it with the `Promised` higher-order component:

~~~~~~~~~~~~~~javascript
var AsyncCountry = Promised(Country);
~~~~~~~~~~~~~~

The `CountryChooser` can also be written as a stateless component, and can now use the Country component to display each country:

~~~~~~~~~~~~~~javascript
var CountryChooser = ({countries, onSelect}) =>
    <ul className="country-chooser">
    { 
        countries.map(c => 
            <li key={c.iso} onClick={() => onSelect(c.iso)}>
                <Country {...c}/>
            </li>)
    }
    </ul>;
~~~~~~~~~~~~~~

And can also be decorated with `Promised` to receive the list of countries as a promise:

~~~~~~~~~~~~~~javascript
var AsyncCountryChooser = Promised(CountryChooser);
~~~~~~~~~~~~~~

By moving state management into a generic higher-order component, we have made our application-specific components both simpler and more useful, in that they can be used in more contexts.

Implementing the Higher-Order Component
---------------------------------------

The `Promised` function takes a component class to be decorated as a parameter and returns a new decorator class.  Like functions, classes in ES6 are first-class values.

One of the props of the decorator class is a promise of props for the decorated component. It passes all other props through to the decorated component unchanged. This lets you configure a `Promised(X)` component with the same props you would use to configure an undecorated `X` component. For example, you could initialise the decorator with event callbacks that get passed to the decorated component when it is rendered.

~~~~~~~~~~~~~~~javascript
var React = require('react');
var R = require('ramda');

var Promised = Decorated => class Promised extends React.Component { // (1)
    constructor(props) {
	super(props);
	this.state = {loading: true, error: null, value: null};
    }
    
    render() {
	if (this.state.loading) {
	    return <span>Loading...</span>;
	}
	else if (this.state.error !== null) {
	    return <span>Error: {this.state.error.message}</span>;
	}
	else {
	    var propsWithoutThePromise = R.dissoc('promise', this.props); // (2)
	    return <Decorated {...propsWithoutThePromise}
                            {...this.state.value}/>;
	}
    }
    
    componentDidMount() {
	this.props.promise.then(
	    value => this.setState({loading: false, value: value}),
	    error => this.setState({loading: false, error: error}));
    }
};
~~~~~~~~~~~~~~~

A few noteworthy points...

The parameter name for the decorated component (`Decorated` in this function) must start with a with a capital letter so that the JSX compiler recognises it as a React component, rather than an HTML DOM element.

When the decorator renders the decorated component, it creates the props for decorated component by merging its own properties, except for the promise, with the properties of the promise value.  The code above uses a [utility function from the Ramda library](http://ramdajs.com/docs/#dissoc) to remove the promise from the decorator component's props, and uses ES6 "spread" syntax to remove merge the props with the properties of the promise value.

Massaging Props to Avoid Name Clash
-----------------------------------

The eagle eyed reader will have noticed that the AsyncCountryChooser has a slightly different API from the original CountryChooser component above.  The original accepted a promise of an *array* of country objects.  But the Promised decorator uses the fields of the promised value as the props of the decorated component, so the promised value must be an object, not an array.

We can address that by wrapping the array in an object in the promise chain, like this:

~~~~~~~~~~~~~~~
<AsyncCountryChooser 
    promise={fetchJson('data/countries.json')
                   .then(list => {countries: list})} 
    onSelect={changeCountry}/>,
~~~~~~~~~~~~~~~

But what about the name of the "promise" prop?  Suppose we want to decorate a component that already has a prop named "promise" that we need to pass through the Promised decorator?  As it currently stands, we cannot do this.

To make the Promised function truly context independent, we need to give the caller control over the prop name used to pass the promise to the decorator, by letting them pass it as a parameter:

~~~~~~~~~~~~~~~javascript
var Promised = (promiseProp, Decorated) => class extends React.Component {
    constructor(props) {
	super(props);
	this.state = {loading: true, error: null, value: null};
    }
    
    render() {
	if (this.state.loading) {
	    return <span>Loading...</span>;
	}
	else if (this.state.error !== null) {
	    return <span>Error: {this.state.error.message}</span>;
	}
	else {
	    var propsWithoutThePromise = R.dissoc(promiseProp, this.props);
	    return <Decorated {...propsWithoutThePromise} {...this.state.value}/>;
	}
    }
    
    componentDidMount() {
	this.props[promiseProp].then(
	    value => this.setState({loading: false, value: value}),
	    error => this.setState({loading: false, error: error}));
    }
};
~~~~~~~~~~~~~~~

We now have to name the promises when we apply the higher-order component and instantiate the decorated components.  But this lets us introduce better names into the code, which is a good thing.

~~~~~~~~~~~~~~~javascript
var AsyncCountry = Promised("country", Country);
var AsyncCountryChooser = Promised("countries", CountryChooser);

...
<AsyncCountry country={fetchJson('data/'+countryIso+'.json')}/>
...
<AsyncCountryChooser    
    countries={fetchJson('data/countries.json').then(R.objOf('countries'))} 
    onSelect={changeCountry}/>
~~~~~~~~~~~~~~~

If it is to be compatible with arbitrary components, a higher-order component must provide a way to control the interface between the decorator and decorated components to avoid name clash and map the data provided by the decorator to the props expected by the decorated component.


Higher-Order Components as Decorators
-------------------------------------

A future version of EcmaScript may add syntax for [function and class decorators].  We can make our higher order component a decorator by making it return a function of one parameter that is applied to the decorated component class:

~~~~~~~~~~~~~~~javascript
var Promised = promiseProp => Decorated => class extends React.Component {
   ...
};
~~~~~~~~~~~~~~~

We can then decorate classes to compose in asynchronous loading at class definition time.

~~~~~~~~~~~~~~~javascript
@Promised("stockLevel")
class StockLevelIndicator extends React.Component {
    ...
}
~~~~~~~~~~~~~~~

But when used as a function, our higher-order component is rather clumsy to invoke:

~~~~~~~~~~~~~~~javascript
var AsyncCountry = Promised("country")(Country);
~~~~~~~~~~~~~~~

If we use Ramda's `curry` function, we can support both uses, as a decorator and as a function:

~~~~~~~~~~~~~~~javascript
var Promised = R.curry((promiseProp, Decorated) => class extends React.Component {
    ...
});

@Promised("stockLevel")
class StockLevelIndicator extends React.Component {
    ...
}

var AsyncCountry = Promised("country", Country);
~~~~~~~~~~~~~~~


