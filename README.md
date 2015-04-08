Story CRM (Compile)
===================

Story CRM is a next generation customer relationship management system and this is the compile microservice. This module has only one job: combine JSON input with a LaTeX template and let LaTeX (in our case XeTeX) render it as a PDF. That's it.

## How to run it
Story CRM is written in JavaScript and is based on NodeJS. So you will need to install the following software to get started:

* Git (GitHub has a nice article on [how to set up Git](https://help.github.com/articles/set-up-git/)
* NodeJS 0.12.X (IO.JS should work aswell)
* NPM (the Node package manager; comes together with Node in a nice bag)
* A LaTeX distribution that includes XeTeX
  * Windows: [MiKTeX](http://miktex.org/) is a distribution with a visual installer
  * Linux: texlive-full
  * Mac: [XeLaTeX Mac](https://www.google.de/search?q=mac+xelatex)
* If you want to pretty print the console logs you should install bunyan from NPM globally
  `npm install -g bunyan`

1) Clone this repository
   `$ git clone git@github.com:StoryCRM/compile.git`
2) Change directory to your newly created folder
   `$ cd compile`
3) Install JavaScript dependencies
   `$ npm install`
4) Run it
   `$ gulp` or if you installed bunyan globally `$ gulp | bunyan`

Story CRM and all it's microservices are currently under active developement and this is our first prototype so everthing may change from one to the next commit. So you've been warned. Userfriendly documentation will be written as soon as we have a stable base.
