import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./style.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../assets/img/logo.png";
import { HomeScreen } from "./screens/HomeScreen";
import { useAccount } from "wagmi";
import { Article } from "./screens/Article";

export const App = () => {

  const { isConnected } = useAccount()
  const navigate = useNavigate();


  return (
    <div className="App" >
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => navigate('/')} ></img>
        <span className="expander"></span>
        {isConnected && <span className="header-link">Publish</span>}
        <ConnectButton showBalance={false} chainStatus="none" />
      </div>
      <Routes>
        <Route path='/' element={<HomeScreen/>} />
        <Route path='/article/:id' element={<Article />} />
      </Routes>
    </div>
  );
};

