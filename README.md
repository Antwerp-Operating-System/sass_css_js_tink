# Tink Framework

v1.2.5

## What is this repository for?

Tink is an in-house developed easy-to-use front end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

## Getting started using Tink

1. Go to the root of your project and type the following command in your terminal:
   `bower install tink --save`

2. Include the `tink.min.css` file in your project.

3. If you want to use the Angular flavor of Tink, you'll also need to:
    * include the `tink-directives.min.js` file in your project
    * declare the Tink module as a dependency: `angular.module('yourModule', ['Tink']);`

4. On http://tink.digipolis.be you will find all necessary documentation.

## Development

### Dev prerequisites

* grunt-cli : `npm install -g grunt-cli`

### Dev Cycle

* Clone this repo to your hard drive:
    * BitBucket:
        * via SSH `git pull git@bitbucket.org:digipolis/sass_css_js_tink.git`
        * or HTTPS `git pull https://`your-bitbucket-user-name`@bitbucket.org/digipolis/sass_css_js_tink.git`
    * GitHub:
        * via SSH `git@github.com:Antwerp-Operating-System/sass_css_js_tink.git`
        * or HTTPS `https://github.com/Antwerp-Operating-System/sass_css_js_tink.git`
* Navigate to your local Tink directory: `cd /path/to/sass_css_js_tink`
* Install or update dependencies: `npm install`
* Start you development server: `npm start`

### Contribution guidelines

* If you don't have access to the repo, contact one of the people mentioned below
* Create a branch from the development branch (feature/branch-name or bugfix/branch-name)
* Commit your changes
* Merge the latest version of the development branch into your branch
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)

## License

The MIT License (MIT)

Copyright (c) 2014 Stad Antwerpen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
