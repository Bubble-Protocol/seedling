import React from "react";
import ReactDOMClient from "react-dom/client";
import { rainbowKitConfig } from "./ui/utils/rainbow-kit";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { BrowserRouter } from "react-router-dom";
import { App } from "./ui/App";
import { Model } from "./model/Model";

//
// Application
//

const TRACE_ON = true;
const DEBUG_ON = true;

console.stackTrace = console.trace;
console.trace = TRACE_ON ? Function.prototype.bind.call(console.info, console, "[trace]") : function() {};
console.debug = DEBUG_ON ? Function.prototype.bind.call(console.info, console, "[debug]") : function() {};

// await initialiseLocalStorage('SeedlingDApp');

// stateManager.register('url-params');

// const model = new MessengerApp(stateManager);
// model.initialise()
//   .then(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const params = {
//       article: urlParams.get('article')
//     }
//     stateManager.dispatch('url-params', params);
//   })
//   .catch(console.error);


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