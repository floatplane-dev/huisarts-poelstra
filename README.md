# Sitcheff

#### What
The [website](http://huisartspoelstra.nl) of a GP in Rotterdam, Netherlands.

#### Highlights
* Built with Gulp 4, Nunchucks (HTML), SASS (CSS), jQuery (JS), Atom & Git
* Mobile responsive & retina-ready
* Served on SSD Ubuntu Nginx servers
* Originally built in 2011 in Joomla :facepalm:
* Revamped with Gulp 4 May 2017

### Setup
First make sure you have [NPM](https://nodejs.org/en/download/), [Yarn](https://yarnpkg.com/en/), [Bower](https://bower.io/) and [Gulp](http://gulpjs.com/):
```
brew update
brew install yarn;
npm install -g bower;
npm install --g gulp-cli;
npm rebuild node-sass;
```
Then clone, install, build, watch and serve the project:
```
repo=janwerkhoven/huisartspoelstra.nl
git clone git@github.com:$REPO.git ~/$REPO;
cd ~/$REPO;
bower install;
yarn install;
atom .;
gulp
```
Open [http://localhost:9000/](http://localhost:9000/)

### Gulp commands
```
gulp
gulp serve
gulp build
gulp build --env staging
gulp build --env production
```
Each sub task in Gulp can be run individually as well: `gulp someTask`. Look in the `gulpfile.babel.js` for all available tasks.

#### Contact
Get in touch on [LinkedIn](https://au.linkedin.com/pub/jan-werkhoven/10/64/b30), [GitHub](https://github.com/janwerkhoven) or <a href="mailto:jw@nabu.io" target="_blank">jw@nabu.io</a>.

--------------

**Jan Werkhoven**  
Web Developer  
& UI Designer
