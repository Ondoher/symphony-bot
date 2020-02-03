# Command line tool to generate Symphony applications.

Use this command line tool to generate necessary boiler plate for a Symphony Extenstions 
API application. The application generated will use the [Sapphire](https://github.com/Ondoher/sapphire) 
framework.

Use the tool to:
* Create a new Sapphire instance. It is from this location that your applications will be created.
* Create the controller for your Symphony application.
* Create a view (called a module) for your Symphony application.
* Add a new service to your application or module
* Create pages, dialogs and features for your application. See the Sapphire documentation for more info.

## How to use

To use this CLI install the npm module symphony-app globally:
```
npm install -g symphony-app
```
Now run `sapp` from the command line, you should see the instructions for using the CLI

### install
```
sapp install
```

Use this command to create the sapphire installation and the default configuration files necessary
to create a Symphony app.

First create the directory where you want your application to live and cd into it. Then you can execute the
command above. This will create a config directory, a server.js file and install some default modules.

For now, you'll want to run using the devloper configuration. To do this, set the environment variable node_env=dev.

### controller
```
sapp controller <name>
```

Use this command to create the controller for your application. Replace \<name\> with the name
of your application. This name will be a sapphire application uder the apps directory. It will also 
be the appId of your Symphony application.

This creates a number of things. First it creates a bundle file in apps/\<name\>/assets/bundles/bundle.json.
Use this bundle file in developer mode.

It also creates a Sapphire feature called `services`. It is in this feature that all generated 
Symphony services will be created. In this feature it adds a default Service called 'bootstrap'.
This will handle the necessary `hello` handshake and Symphony application registration. Because this 
is handled automatically, this service exposes two methods to controll the services to be imported and exported
To the Symphony web client.

```
importService : function(serviceName)
```
Call this method to add a service to be imported.

```
exportService : function(serviceName)
```
Call this method to add a service to be exported.

Services created using the CLI will call this methods automatically.

### module
```
sapp module <app> (<name>)
 ```

Use this command to create a view for your application. Replace \<app\> with 
the name of your application used in sapp controller. Replace \<name\> with the name of your module.
If you leave this blank, it will use the name "\<app\>-module".

This command is very similar to controller, but adds some things specific to views. 
Like controller it creates a bootstrap service with the `importService` and `exportService` methods and 
that handles the `hello` and `connect`. The default service also handles theme changes.

### service
```
sapp service <what> <name> <import>
```

Use this command to create a new service. Replace \<what\> with the name of the Sapphire application, not the
controller name. So, for instance, this might be myapp or myapp-module. Replace \<name\> with the name of the service.
and replace \<import\> with a comma separated list of services to import. 
For insance you may want to import "application-nav" and "module". Do not put spaces before or after the comma.

```
sapp service myapp new-service "application-nav,module"
```

The rest of the available commands act the same as their Sapphire counterparts.

# Sapphire TL;DR

The full documentation of the Sapphire framework is linked to above. Here are a few
key concepts to understand the code.

## Server Side and Client Side

A Sapphire application exists on both the server side as well as the client side.
The server side builds the application that will be sent to the user's browser.
This is done by specifying all the different parts of an application, for
example the HTML, JavaScript and CSS files.

The Sapphire framework takes this description of your application and generates the
HTML that is sent to your browser.

Also done on the server:

* "features" are encapsulated descriptions of parts of an application. For example, the
header of an application could be implemented as a feature. In a feature, all the
markup, javascript, css and other pieces of an application are all located
within the feature subdirectory. Features have the advantage of being reusable.
* minification of css and html based on configuration or a query string parameter.
Using a query string to turn minification on and off makes it easier to diagnose
problems in a production environment.
* gzipping of server responses
* built in CSRF protection.

---

The client side of an application is all the code that runs in the browser. The
Sapphire framework has a number of features for building browser based applications.

For example:

* Pages are pieces of user interface that can be swapped out for different
application states. For instance, in an application with tabs, each tab would be
implemented in a different page.

* Dialogs are pieces of user interface that present a modal state that must be
completed before the application can continue.

* Models are classes that communicate with the server using an AJAX interface.

* Hot loading of pages and dialogs

* Templates are reusable HTML elements that are managed by the framework. For example,
in a list of news items, a single item would be represented as a template that would
be cloned and added to the DOM for each unique news article.

## Directory Structure

At the top level of a Sapphire installation is a directory named `apps`. All
applications served by Sapphire will be here, with one directory per application.
The name of the directory will be the url to reach it. For example, if running
the server on localhost:8080, to access the application under `apps/ticker` use
the url `http://localhost:8080/ticker`.

Inside each application directory is a js file with the same name. So for the ticker
app there would be a file named `apps/ticker/ticker.js`. This file exports a single
function named `getApplication`. This function takes http request and response
parameters and returns a Q promise will be resolved with an Application object.
See the [Sapphire](https://github.com/Ondoher/sapphire) documentation for more details.

In Sapphire all the files that can be downloaded to a browser are in a directory
named `/assets`. This directory is usually further broken down into asset types,
for example, `css`, `js` and `images`.

However, the top level `assets` directory is not the only place where
application assets might be. Features, pages and dialogs exist in their own
subdirectories of the application and have their own `assets` folders.

All features are in a directory named `features`, each subdirectory of this is a
single feature. Similarly pages are in `pages` and dialogs are in `dialogs`.
