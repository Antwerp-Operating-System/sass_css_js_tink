# Tink Framework #

## v<!--@@-->0.4.2<!--@--> ##

## This documentation is temporary outdated

### What is this repository for? ###

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

### Setup

#### Prerequisites
* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* grunt-cli : `npm install -g grunt-cli`
* bower: `npm install -g bower`

#### Fetch latest version
* Clone this repo to your hard drive
  * via SSH `git pull git@bitbucket.org:digipolis/sass_css_js_tink.git`
  * or HTTPS `git pull https://`your-bitbucket-user-name`@bitbucket.org/digipolis/sass_css_js_tink.git`
* Navigate to your local Tink directory: `cd sass_css_js_tink`
* install dependencies: `npm install`

### Development cycle ###

* Start you development server `npm start`

### Contribution guidelines ###

* If you don't have access to the repo, contact one of the people mentioned below
* Create a branch from the development branch (feature/branch-name or bugfix/branch-name)
* Commit your changes
* Merge the latest version of the development branch into your branch
* Create a pull request

### Build and release ###
* commit all your code `git commit -m "my funky contribution"`
* create new patch version + tag in git
* `npm version patch -m "released version %s"`
* ( you can update via  `minor` or `major` too)


### Who do I talk to? ###

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)