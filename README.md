# Automic AWI dashboard to png screenshots

This small node based application allows you to create PNG screenshots of public and private AWI dashboards, supporting all types of widgets.
It uses Pupeteer and chromium to:

* login into awi
* open a dashboard and
* create screenshot of the full dashboard as well as the individual widgets

## Run as node application

Requires node 12, but will automatically download the required chromium!

Install globally with npm, make sure your user is allowed to install global npm packages.

```bash
npm install -g automic-awi-dashboard-screenhots
```

### Configuration

Currently supports AWI version v12 and next release v21.

We need to configure the AWI url and AE user / client.
The best way is to create a `.env` file in the folder where you will call 
`automic-awi-dashboard-screenhots capture DASH.WELCOME`
You can also create multiple .env files for each ae you want to use and use the --env options to choose
`automic-awi-dashboard-screenhots capture DASH.WELCOME --env /path/to/custom/.env-ae21`

```bash
#Create a .env file or create environment variables
AE_VERSION=12.3  #12.3 for 12.0 - 12.3, 21 for next release
AE_CONNECTION=AUTOMIC
AE_CLIENT=100
AE_USERNAME=AUTOMIC
AE_DEPARTMENT=AUTOMIC
AE_PASSWORD=<your password>
AE_AWI_URL=https://<your-company-url>/awi/
WAIT_FOR_WIDGET=5
```

All parameters are required, except `WAIT_FOR_WIDGET` is optional and 5 sec by default

They can also be passed as cli parameters,
check help by calling `automic-awi-dashboard-screenhots` 

### Run the application with

```bash
automic-awi-dashboard-screenhots capture <DASHBOARD-NAME>
#show options
automic-awi-dashboard-screenhots 
#show configuration
automic-awi-dashboard-screenhots show-config
```
