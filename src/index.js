import React from "react";
import ReactDOMClient from "react-dom/client";
import { rainbowKitConfig } from "./ui/utils/rainbow-kit";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { BrowserRouter } from "react-router-dom";
import { App } from "./ui/App";
import { Model } from "./model/Model";
import { initialiseLocalStorage } from "./model/utils/LocalStorage";

// Basic Config
const APP_ID = 'Seedling-DApp';
const TRACE_ON = true;
const DEBUG_ON = true;

// Console trace and debug functions
console.stackTrace = console.trace;
console.trace = TRACE_ON ? Function.prototype.bind.call(console.info, console, "[trace]") : function() {};
console.debug = DEBUG_ON ? Function.prototype.bind.call(console.info, console, "[debug]") : function() {};

// Fix BigInt JSON issue
/* global BigInt */
BigInt.prototype.toJSON = function() {       
  return this.toString()
}


//
// Application
//

await initialiseLocalStorage(APP_ID);

const model = new Model();
model.initialise()
  .catch(console.error);


//
// UI
//

const app = document.getElementById("app");
const root = ReactDOMClient.createRoot(app);

function render(params={}) { 
  root.render(
    <WagmiConfig config={rainbowKitConfig.wagmiConfig}>
      <RainbowKitProvider chains={rainbowKitConfig.chains} theme={lightTheme({borderRadius: 'small'})} >
        <BrowserRouter>
          <App connect={params.connect} />
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

render();