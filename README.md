Prerequisites
-------------

* Node.js
* npm
* Java (for the closure compiler)

Then install calcdeps.js:

    > sudo npm install -g calcdeps

Development
-----------

To use the development version you'll have to build a dependency file first, which can be done with:

    > make build/deps.js

Then, for example, load examples/flatland/index.html

Production
----------

Make a production build with:

    > make

Make a production debug build with:

    > make build/tpo-debug.js
