# Automic AWI dashboard to png screenshots

This small node based application allows you to create PNG screenshots of public and private AWI dashboards, supporting all types of widgets.
It uses Pupeteer and chromium to:

* login into awi
* open a dashboard and
* create screenshot of the full dashboard as well as the individual widgets

## Run as node application

Requires node 12, but will automatically download the required chromium!

First install the dependecies 

```bash
npm install
```

### Configuration

We need to configure the AWI url and AE user / client.

All params can be passed as cli parameters, check help by calling "node index.js"
or via Enviroment Variables or a .env file containing those.
Only `WAIT_FOR_WIDGET` is optional.

Currently supports AWI version v12 and next release v21 

```bash
#set in .env file or as environment variables
AE_VERSION=12  #12 for 12.0 - 12.3, 21 for next release
AE_CONNECTION=AUTOMIC
AE_CLIENT=100
AE_USERNAME=AUTOMIC
AE_DEPARTMENT=AUTOMIC
AE_PASSWORD=<your password>
AE_AWI_URL=https://<your-company-url>/awi/
WAIT_FOR_WIDGET=5
```

### Run the application with

```bash
node index.js <DASHBOARD>
```

## Build and use binaries

To build the application we use PKG, the chromuim browser will not be part of the created package and must be downloaded and the path to it provided.
Pupeteer requires a specifc version of chromium as listed below, it might work with other versions but that is not guranteed.

```bash
npm run-script build
```

## Use binaries

If you want to use the binaries you need to get a specific chromium version and extract it.

Requires a specific Chromium version: 88.0.4298.0 (Revision Number: chromium: '818858' for pupeteer 5.5) because of pupeteer.

Download and extract the binaries, choose corresponding to your OS!

Linux 64 bit: 
<https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Linux_x64%2F818858%2Fchrome-linux.zip?generation=1603194363265668&alt=media>

Extract and use `/<target_path>/chrome`

Window 64 bit 
<https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Win_x64%2F818858%2Fchrome-win.zip?generation=1603195674572762&alt=media>

Extract and use `/<target_path>/Chromium.app/Contents/MacOS/Chromium`
Make sure that you can start chromium, i had to allow because the developer was not trusted on my mac... 

Mac 64 bit: <https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Mac%2F818858%2Fchrome-mac.zip?generation=1603196376298049&alt=media>
Extract and use `C:\<target_path>\chrome.exe`

To configure the path to chromium add this to your `.env` file or create an environment variable with the name `CHROME`

`CHROME=<path to chromium or chrome>`