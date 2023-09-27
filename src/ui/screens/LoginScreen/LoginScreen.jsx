import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import tickIcon from "../../../assets/img/tick-icon.png";
import { useNavigate } from "react-router-dom";

export const LoginScreen = () => {

  const navigate = useNavigate();
  const username = stateManager.useStateData("username")();
  const userId = stateManager.useStateData("userId")();
  const { connectToGithub, createAccount } = stateManager.useStateData("account-functions")();
  const [connecting, setConnecting] = useState(false);
  const [creating, setCreating] = useState(false);

  function connect() {
    setConnecting(true);
    connectToGithub().then(() => setConnecting(false));
  }

  function create() {
    setCreating(true);
    createAccount()
      .then(() => {
        setCreating(false);
        navigate('/');
      });
  }

  return (
    <div className="app-content" >
      <div className="login-screen" >
        <div className="summary-title">Create Your Account</div>
        <p>
          To publish articles, create publications, and access other app features you must first create a Seedling account. 
        </p>
        <div className="summary-content">
          <div className="step-title">Step 1. Connect your GitHub account</div>
          {connecting && <div className="loader"></div>}
          {!connecting && !username && <div className="text-link" onClick={connect}>Connect</div>}
          {username && <img className="tick" src={tickIcon}></img>}
          {/* TODO {username && <div className="text-link">Disconnect</div>} */}
        </div>
        <div className="summary-content">
          <div className="step-title">Step 2. Create your Seedling account</div>
          {creating && <div className="loader"></div>}
          {!creating && !userId && <div className="text-link" onClick={create}>Create Account</div>}
          {userId && <img className="tick" src={tickIcon}></img>}
        </div>
      </div>
    </div>
  );

};
