import React, { useState } from "react";
import "./style.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../assets/img/logo.png";
import { HomeScreen } from "./screens/HomeScreen";

export const App = () => {

  const [screen, setScreen] = useState('home');

  return (
    <div className="App" >
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => setScreen('home')} ></img>
        <span className="expander"></span>
        <ConnectButton showBalance={false} chainStatus="none" />
      </div>
      {screen === 'home' && <HomeScreen></HomeScreen>}
    </div>
  );
};

