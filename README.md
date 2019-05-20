# Lontar

## Description
Lontar is minimalist static site generator. It use [Gulp](https://gulpjs.com/) as task runner, and [handlebars](https://handlebarsjs.com/) for templating.

## Directory Structure

```
├── pages           // templates and html content
│   ├── data           // global variable that will be used on page templates
│   ├── layouts        // layout can have different html header, css, or js
│   ├── pages          // main content page
│   └── partials       // partials that used pages
│       ├── includes       // partials that used in layouts or pages
│       └── layouts        // partials that used as layouts
├── src             // assets
│   ├── images         // images
│   ├── js             // JavaScript entries and modules
│   └── scss           // scss entries ant partials
└── www             // output of static generated html content
```
##


