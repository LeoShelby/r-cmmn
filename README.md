# cmmn-js-extended

Extension for cmmn-js : https://bpmn.io/toolkit/cmmn-js

## Installation

First of all you need to have installed the latest versions of **nodejs** and **npm**
```
sudo apt-get install nodejs
sudo apt-get install nodejs-legacy
sudo apt-get install npm


sudo apt-get update
sudo apt-get install build-essential checkinstall libssl-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash 
nvm install 12.13.0
```

Install cmmn-js
```
npm install
```
Install node modules needed for cmmn-js-extended
```
npm install file-saver
npm install prettify-xml
npm install xml2js
```

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
<br/>
Now you can run cmmn-js by opening *cmmn-js-thesis/public/**index.html*** with a browser.
</br>
Use the **latest version** of Chrome or Firefox.


## License

Use under the terms of the [bpmn.io license](http://bpmn.io/license).
