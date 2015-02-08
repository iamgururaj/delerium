angular-backstrech
==================

A simple AngularJS directive to use jQuery backstretch plugin (http://srobbin.com/jquery-plugins/backstretch/)

# How-to use it?

## Installation

Install angular-backstrectch via bower: `bower install angular-backstretch`

## Setup

1. Include `angular-backstretch.js` in your project
2. Add it as a dependency of your main module: `angular.module('app', ['ngBackstretch'])`
3. Create an object in your controller with the desired configuration. For example:

	$scope.backstretch = {
		options: { fade: 750, duration: 3000, bodyBackground: true },
		images: [
	   		"img/bg_1.png",
	   		"img/bg_2.png",
	   		"img/bg_3.png"
	   	]
	};

4. Declare an HTML element using the directive: `<my-backstretch configuration="backstretch"></my-backstretch>`

Version 0.1.0
