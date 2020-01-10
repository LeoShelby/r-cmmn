# R-CMMN

Tool for Modeling Resilient-Aware CMMN Processes.  
The project is developed as an extension of the open-source tool cmmn-js: https://bpmn.io/toolkit/cmmn-js

## Requirements

The [latest versions](./rcmmn_modules/guide_node.md) of **nodejs** and **npm** are needed.   
For running the tool, latest version of Chrome is recommended, altough it is possibile to use also Firefox and Edge.

## Build and Run
Clone the repository
```
git clone https://github.com/LeoShelby/r-cmmn.git
```
Perform the following steps to build the library, and running the tool on your default browser.  
Choose the argument of the last command depending on the operative system you are using.
```
cd r-cmmn
npm install
npm run build
npm run [linux|windows|macOS]
```
In the case you get some errors, you can [manually bundling and running](./rcmmn_modules/guide_manual.md) the project.

## License

Use under the terms of the [bpmn.io license](http://bpmn.io/license).
