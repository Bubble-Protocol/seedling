import React, { useEffect, useState } from "react";
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
import { UserHome } from "./screens/UserHome";
import anonymousUserIcon from '../assets/img/user.png';
import { DropdownMenu } from "./components/DropdownMenu/DropdownMenu";

export const App = () => {

  const { isConnected } = useAccount()
  const user = stateManager.useStateData("user")();
  const { getUser } = stateManager.useStateData("content-functions")();
  const { disconnect } = stateManager.useStateData("account-functions")();
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.username) {
      getUser(user.username).then(setUserDetails).catch(console.warn);
    }
  }, [user]);

  return (
    <div className="App" >
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => navigate('/')} ></img>
        <span className="expander"></span>
        {isConnected && <span className="header-link" onClick={() => {return !user.username ? navigate('/login') : navigate('/publish') }}>Publish</span>}
        {!user.username && <ConnectButton showBalance={false} chainStatus="none" />}
        {user.username && 
          <DropdownMenu direction="bottom-left" options={[
            {name: user.name},
            {type: 'line'},
            {name: "My Profile", onClick: () => navigate('/user/'+user.username.replace(':','/'))},
            {name: "Disconnect", onClick: disconnect}
          ]}>
            <img className="user-icon" src={userDetails.icon || anonymousUserIcon}></img>
          </DropdownMenu>   
        }     
      </div>
      <div className="app-content">
        <Routes>
          <Route path='/' element={<HomeScreen/>} />
          <Route path='/user/:platform/:username' element={<UserHome/>} />
          <Route path='/login' element={<LoginScreen/>} />
          <Route path='/article/:id' element={<Article />} />
          <Route path='/preview/:preview' element={<Article />} />
          <Route path='/publish' element={<Publish />} />
        </Routes>
      </div>
    </div>
  );
};

