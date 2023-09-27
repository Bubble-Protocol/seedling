import React, { useEffect, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { useNavigate, useSearchParams } from "react-router-dom";

export const LoginScreen = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const usernameParam = searchParams.get('username');
  const accountParam = searchParams.get('account');
  const errorParam = searchParams.get('error');
  const user = stateManager.useStateData("user")();
  const { connectToGithub, setUsername } = stateManager.useStateData("account-functions")();
  const [connecting, setConnecting] = useState(!!usernameParam);
  const [error, setError] = useState(errorParam);

  
  useEffect(() => {
    if (user.account && user.account === accountParam && usernameParam) {
      try {
        setUsername(accountParam, usernameParam);
        navigate('/');
      }
      catch(error) {
        setError(error);
      }
    }
  }, [user]);

  function connect() {
    setConnecting(true);
    connectToGithub()
      .catch(error => setError(error))
      .finally(() => setConnecting(false));
  }

  return (
    <div>
      <div className="login-screen" >
        <div className="summary-title">Connect Your GitHub Account</div>
        <p>
        To publish articles, create publications, and unlock other app features you must link your GitHub account. 
        This action will publicly associate your wallet account with your GitHub account. 
        Please choose a wallet account that you are comfortable being linked to your identity.
        </p>
        <div className="summary-content">
          {error && <div className="error-text">{error.message || error}</div>}
          {connecting && <div className="loader"></div>}
          {!connecting && <div className="text-link" onClick={connect}>Connect</div>}
        </div>
      </div>
    </div>
  );

};