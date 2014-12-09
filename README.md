# Tink Framework

v0.5.7

## What is this repository for?

Tink is an in-house developed easy-to-use front end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

## Getting started

1. Type the following command in your Terminal
   `bower install tink --save`

2. Then include the necessary files in your project. Here is a basic template to start from:
   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8">
       <title>Tink</title>
       <link rel="stylesheet" href="bower_components/tink/framework/styles/tink.min.css">
     </head>
     <body>
       <div class="container-fluid">
         <h1 class="text-center">Hello, Tink!</h1>
       </div>
     </body>
   </html>
   ```

3. On http://tink.digipolis.be you will find the necessary documentation

## Development

### Dev prerequisites

* grunt-cli : `npm install -g grunt-cli`
* bundler: `gem install bundler` (or `sudo gem install bundler` if your setup requires it)

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
