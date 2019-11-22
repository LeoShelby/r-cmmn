## Manual Building

The tool uses Webpack for bundling the **app.js** file in *r-cmmn/src*, for using it in the browser.  
Install the Webpack modules needed
```
cd r-cmmn
npm install -g webpack
npm install -g webpack-cli

npm install webpack
npm install webpack-cli
npm install webpack-jquery-ui
```
Run webpack command for bundling the code
```
webpack src/app.js -o public/app.bundled.js
```
The script file **app.bundled.js** is generated in *r-cmmn/public*.

## Manual Running

You just need to open **index.html** in *r-cmmn/public* with a browser for running the tool in it.
