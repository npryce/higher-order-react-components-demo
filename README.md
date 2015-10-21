A demonstration of Higher-Order React components
================================================

The components Country and CountryChooser display data synchronously -- it is passed to their props.

The higher order component Promised decorates a component class to load props asynchronously from a promise.

These are combined in the main.js entry point to load country information from HTTP+JSON APIs.


Building
--------

Prerequisites:

 * node and npm
 * Gnu Make & the standard Unix command-line utilities
 * jq

On MacOS X these can all be installed with Homebrew.


To build:

    % make

To run:

Execute the command: 
    % make available
	
Then open [http://localhost:8000/](http://localhost:8000/) in a modern web browser.

