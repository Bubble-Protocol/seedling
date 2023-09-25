import React, { useState } from "react";
import "./style.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../assets/img/logo.png";
import { HomeScreen } from "./screens/HomeScreen";
import { useAccount } from "wagmi";
import { Article } from "./screens/Article";

export const App = () => {

  const { isConnected } = useAccount()
  const [screen, setScreen] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState();

  return (
    <div className="App" >
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => setScreen('home') | setSelectedArticle(null)} ></img>
        <span className="expander"></span>
        {isConnected && <span className="header-link">Publish</span>}
        <ConnectButton showBalance={false} chainStatus="none" />
      </div>
      {screen === 'home' && !selectedArticle && <HomeScreen setSelectedArticle={setSelectedArticle}/>}
      {screen === 'home' && selectedArticle && <Article />}
    </div>
  );
};

