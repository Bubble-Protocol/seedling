import React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { stateManager } from "../../../state-context";
import logo from "../../../assets/img/logo.png";

export const MobileMenu = ({visible, onCompletion}) => {

  const navigate = useNavigate();
  const user = stateManager.useStateData("user")();
  const following = user.followingFunctions ? user.followingFunctions.followers() : [];

  function go(urlStr) {
    navigate(urlStr);
    onCompletion();
  }

  return (
    <>
      <div className={"tinted-screen-overlay" + (visible ? '' : ' hide')} onClick={onCompletion}></div>
      <div className={"mobile-menu" + (visible ? ' visible' : '')}>
        <img className="logo clickable" src={logo} onClick={onCompletion} ></img>
        <div className="menu">
          <div className="menu-option" onClick={() => go('/')}>Latest</div>
          <div className="menu-option" onClick={() => go('/following')}>Following</div>
          {following.map((f, i) => 
            <div key={f.username} className="indent1 menu-option" onClick={() => go('/user/'+f.username.replace(':','/'))}>{formatName(f.username)}</div>)
          }
        </div>
      </div>
    </>
  );
};


function formatName(username) {
  const accountName = username.replace(/^[^:]*:/, '');
  return accountName.replace('-', ' ');
}

