## Install last version of NodeJS

Visit the official website and download the installer for your operative system: https://nodejs.org/it/download  
The installer includes also the last version of npm.

## Update you NodeJS version of Linux

If you already have an old version of NodeJS on Linux, you can update it with the commands
```
sudo apt-get update
sudo apt-get install build-essential checkinstall libssl-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash 
nvm install 12.13.0
```
The version 12.13.0 of NodeJS is now installed.
