import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./style.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../assets/img/logo.png";
import { HomeScreen } from "./screens/HomeScreen";
import { useAccount } from "wagmi";
import { Article } from "./screens/Article";
import { LoginScreen } from "./screens/LoginScreen";
import { stateManager } from "../state-context";
import { Publish } from "./screens/Publish";

export const App = () => {

  const { isConnected } = useAccount()
  const user = stateManager.useStateData("user")();
  const navigate = useNavigate();

  console.debug('user', user)

  return (
    <div className="App" >
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => navigate('/')} ></img>
        <span className="expander"></span>
        {isConnected && <span className="header-link" onClick={() => {return !user.username ? navigate('/login') : navigate('/publish') }}>Publish</span>}
        <ConnectButton showBalance={false} chainStatus="none" />
      </div>
      <Routes>
        <Route path='/' element={<HomeScreen/>} />
        <Route path='/login' element={<LoginScreen/>} />
        <Route path='/article/:id' element={<Article />} />
        <Route path='/preview/:preview' element={<Article />} />
        <Route path='/publish' element={<Publish />} />
      </Routes>
    </div>
  );
};

