## Manual building

Install node modules for bundling JS code

```
npm install -g webpack
npm install -g webpack-cli

npm install webpack
npm install webpack-cli
npm install webpack-jquery-ui
```
## Bundle & Run
Bundle **app.js** file in *cmmn-js-thesis/src* for using it in the browser
```
webpack src/app.js -o public/app.bundled.js
```
The script file **app.bundled.js** is generated in *cmmn-js-thesis/public*.  
