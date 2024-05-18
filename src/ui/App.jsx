import React, { useEffect, useRef, useState } from "react";
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
import { MobileMenu } from "./components/MobileMenu";
import { OrgLoginScreen } from "./screens/OrgLoginScreen";
import { PublishGithub } from "./screens/Publish/Hosts/Github";

export const App = () => {

  const { isConnected } = useAccount()
  const user = stateManager.useStateData("user")();
  const { getUser } = stateManager.useStateData("content-functions")();
  const { disconnect } = stateManager.useStateData("account-functions")();
  const [userDetails, setUserDetails] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.username) {
      getUser(user.username).then(setUserDetails).catch(console.warn);
    }
  }, [user]);

  return (
    <div className="App">

      {/* Mobile Menu */}
      <MobileMenu visible={menuVisible} onCompletion={() => setMenuVisible(false)} />

      {/* Header */}
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => window.innerWidth >= 910 ? navigate('/') : setMenuVisible(!menuVisible)} ></img>
        <span className="expander"></span>
        {isConnected && <span className="header-link" onClick={() => navigate('/publish')}>Publish</span>}
        {!user.username && <ConnectButton className="test" showBalance={false} />}
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

      {/* Content */}
      <div className="app-content">
        <Routes>
          <Route path='/following' element={<HomeScreen key="following" filter="following" />} />
          <Route path='/user/:platform/:username' element={<UserHome/>} />
          <Route path='/login' element={<LoginScreen/>} />
          <Route path='/org-login' element={<OrgLoginScreen/>} />
          <Route path='/article/:id' element={<Article />} />
          <Route path='/preview/:preview' element={<Article />} />
          <Route path='/publish' element={<Publish />} />
          <Route path='/publish-github' element={<PublishGithub />} />
          <Route path='*' element={<HomeScreen key="latest" />} />
        </Routes>
      </div>
    </div>
  );
};

