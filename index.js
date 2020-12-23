#!/usr/bin/env node
require('dotenv').config();
const puppeteer = require('puppeteer');
const env = require('env-var');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage')
const path = require('path');
const isPkg = typeof process.pkg !== 'undefined';


//we require the basic connection to the ae to be set in the environment (or via .env file)


const optionDefinitions = [
  {
    name: 'commands',
    type: String,
    defaultOption: true,
    multiple: true,
    defaultValue: 'screenshot',
    description: 'The commands to execute, {underline capture <dashboard name>} or {underline show-config}',
    typeLabel: '{underline string[]}'
  },
  {
    name: 'dashboard',
    type: String,
    alias: 'd',
    description: 'The name of the dashbopard object to process.',
    typeLabel: '{underline string}'
  },
  {
    name: 'connection',
    type: String,
    alias: 'n',
    defaultValue: '',
    description: 'The ae connection name.',
    typeLabel: '{underline string}'
  },
  { name: 'client', 
    alias: 'c', 
    type: String, 
    defaultValue: '',
    description: 'The ae client.',
    typeLabel: '{underline string}' 
  },
  { name: 'username', 
    alias: 'u', 
    type: String, 
    defaultValue: '',
    description: 'The username of the ae user.',
    typeLabel: '{underline string}' 
  },
  { name: 'department', 
    alias: 'e', 
    type: String, 
    defaultValue: '',
    description: 'The department of the ae user.',
    typeLabel: '{underline string}' 
  },
  { name: 'password', 
    alias: 'p', 
    type: String, 
    defaultValue: '',
    description: 'The password of the ae user',
    typeLabel: '{underline string}' 
  },
  { name: 'url', 
    type: String, 
    defaultValue: '',
    description: 'The url to the awi',
    typeLabel: '{underline url}' 
  },
  { name: 'ae_version', 
    type: String, 
    alias: 'v',
    defaultValue: '12.3',
    description: 'The ae/awi version 12.3 or 21',
    typeLabel: '{underline string}' 
  },
  { name: 'waitForWidgets', 
    alias: 'w', 
    type: Number, 
    defaultValue: 5,
    description: 'The time after the dashboard is loaded before taking the snapshots (time to load widget data!)',
    typeLabel: '{underline seconds}' 
  }
]
const options = commandLineArgs(optionDefinitions);

let ae = {}
let chromiumExecutablePath = '';
try{
  chromiumExecutablePath = env.get('CHROME').example('/path/to/chrome or chromium executable').asString();
  ae = {
    version: env.get('AE_VERSION').example('12.3').default(options.ae_version).required().asString(),
    connection: env.get('AE_CONNECTION').example('AUTOMIC').default(options.connection).required().asString(),
    client: env.get('AE_CLIENT').example('100').required().default(options.client).asString(),
    username: env.get('AE_USERNAME').example('AUTOMIC').default(options.username).required().asString(),
    department: env.get('AE_DEPARTMENT').example('AUTOMIC').default(options.department).required().asString(),
    password: env.get('AE_PASSWORD').example('<your automic password>').default(options.password).required().asString(),
    url: env.get('AE_AWI_URL').example('https://awi.my-company.com/awi').default(options.url).required().asUrlString(),
    dashboard: env.get('DASHBOARD').asString(),
    waitForWidgets: env.get('WAIT_FOR_WIDGET').default(10).asInt()
  }
}catch(EnvVarError){
  console.log(EnvVarError.message);
  return;
}

ae.dashboard = options.dashboard;

const sections = [
  {
    header: 'AWI capture dashboard',
    content: 'This application makes a screenshot of the content of an AWI dashboard and saves it as png'
  },
  {
    header: 'Synopsis',
    content: [
      'automic-awi-dashboard-screenhots {underline capture} {underline <dashboard name>} <options> ',
      'automic-awi-dashboard-screenhots {underline show-config}'
    ]
  },
  {
    header: 'Configuration',
    content: [
      'To configure the connection to the ae and the awi as well as the user credentials you have to setup the follwing environment variables:',
      'AE_CONNECTION=AUTOMIC',
      'AE_CLIENT=100',
      'AE_USERNAME=AUTOMIC',
      'AE_DEPARTMENT=AUTOMIC',
      'AE_PASSWORD=<your pw here>',
      'AE_AWI_URL=http://awi.my-company-automic.com/awi/',
      'or create a `.env` file with the same content. The password is optional and can also be set via cli parameter'
    ]
  },
  {
    header: 'Options',
    optionList: optionDefinitions

  }
]
let showUsage = true;
if(options.commands && options.commands.length>0){
  let command = options.commands[0];
  if(command == 'capture' && options.commands.length==2){
    ae.dashboard = options.commands[1];
    showUsage = false;
  }
  if(command == 'show-config'){
    let c = {...ae};
    c.password = c.password.length>0?'***':'';
    console.log(c);
    return;
  }
}



if(showUsage){
  const usage = commandLineUsage(sections);
  console.log(usage);
  return;
}

if(isPkg && (!chromiumExecutablePath || chromiumExecutablePath!='')){
  console.log("You need to define the path to chromium in version 88.0.4298.0 (Revision Number: chromium: '818858' for pupeteer 5.5)");
  console.log("Define 'CHROME' as enviroment variable or in .env file and point to chromium")
  return;
}

(async () => {
  try {

    let browserConfig = {
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage'
      ]
    }

    if(chromiumExecutablePath && chromiumExecutablePath!=''){
      console.log("Using external chromium from: "+chromiumExecutablePath);
      browserConfig.executablePath = chromiumExecutablePath
    }

    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();
    await page.setViewport({
      width: 2560,
      height: 1600,
      deviceScaleFactor: 1,
    });
    const clientPad = ae.client.padStart(4, "0");



    let version = ae.version;

    if(version=="12.3"){
      const urlv12 = `${ae.url}#${ae.connection}:${clientPad}@home/dashboards/${ae.dashboard}`;
    
      console.log(`Login to '${ae.url}' to get dashboard from: ${urlv12}`);
      await page.goto(urlv12);
      const loginFormv12 = await page.waitForSelector('div.uc4_framework_login_dataArea');
      console.log("login found!");
      const inputs = await loginFormv12.$$('input');
      await inputs[0].type(ae.connection);
      await inputs[1].click({clickCount:2});
      await inputs[1].type(ae.client);
      await inputs[2].click({clickCount:2});
      await inputs[2].type(ae.username);
      await inputs[3].click({clickCount:2});
      await inputs[3].type(ae.department);
      await inputs[4].click({clickCount:2});
      await inputs[4].type(ae.password);
      await page.waitForTimeout(1000);
      const loginButtonv12 = 'div.uc4_framework_login_loginButton';
      await page.waitForSelector(loginButtonv12);
      await page.click(loginButtonv12);
    }
    //v12.3



    //v21 login version
    if(version=="21"){
          //v21
      const url = `${ae.url}${ae.connection}/${clientPad}/@home/dashboards/${ae.dashboard}`;
      console.log(`Login to '${ae.url}' to get dashboard from: ${url}`);
      await page.goto(url);
      const loginForm = 'ecc-form-layout#EccFormLayout_2';
      await page.waitForSelector(loginForm);
      await page.type('ecc-form-field[label="Client"] ecc-spinner', ae.client);
      await page.type('ecc-form-field[label="Name"] ecc-textfield', ae.username);
      await page.type('ecc-form-field[label="Department"] ecc-textfield', ae.department);
      await page.type('ecc-form-field[label="Password"] ecc-passwordfield', ae.password);
      await page.waitForTimeout(1000);
      const loginButton = 'ecc-button[caption="Login"]';
      await page.waitForSelector(loginButton);
      await page.click(loginButton);
    
    // await page.waitForSelector('ecc-header-button[caption="Home"]');
      
      // let dashboard = await page.waitForSelector('ecc-layout-entry[slot="center"] div.uc4-dashboard-layout');
    }
    console.log("Login done, loading dashboard now...");

    let dashboard = await page.waitForSelector('div.uc4-dashboard-layout');
    console.log(`Dashboard loading, waiting now for ${ae.waitForWidgets} sec before making screenshot`);
    //move mouse out of the way!
    await page.mouse.move(0, 0);

    await page.waitForTimeout(ae.waitForWidgets * 1000);

    console.log("Snapshot dashboard now...");
    await dashboard.screenshot({
      path: `${ae.dashboard}.png`
    });
    const widgets = await page.$$('div.uc4-dashboard-layout > div.v-gridlayout-slot > div.v-widgetcontainer');
    const wl = widgets.length;
    console.log(`Found ${wl} widgets, creating snaps now...`);
    for(let i = 0;i<widgets.length;i++){
      let widget = widgets[i];
      await widget.screenshot({
        path: `${ae.dashboard}_widget_${i}.png`
      });
      console.log(`Widget ${i+1} / ${wl} done.`)
    };
    await browser.close();
    
  } catch (err) {
    console.log(err);
    return process.abort();
  }
})();