import React from "react";
import "./style.css";
import { Footer } from "../../components/Footer";
import githubLogo from "./images/github-host-logo.png";
import bubbleLogo from "./images/bubble-host-logo.png";
import protonLogo from "./images/proton-host-logo.png";
import ipfsLogo from "./images/ipfs-host-logo.png";
import googleDriveLogo from "./images/google-drive-host-logo.png";
import amazonS3Logo from "./images/amazon-s3-host-logo.png";
import dropboxLogo from "./images/dropbox-host-logo.png";
import { useNavigate } from "react-router-dom";
import { stateManager } from "../../../state-context";
import { useAccount } from "wagmi";
import { useConnectModal, ConnectButton } from "@rainbow-me/rainbowkit";


export const Publish = () => {

  const user = stateManager.useStateData("user")();
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal();

  const navigate = useNavigate();

  return (
    <div className="publish-screen" >
      <div className="title-section">
        <div className="summary-title">Publish {window.innerWidth < 410 && <br/>} a New Article</div>
        <div className="help-link" onClick={() => navigate('/article/0x16919da1e9ef808fe7bd016697a1b2b2869185ca266bc1ebd763bdd899b33614')}>How to Write and Publish Seedling Articles</div>
      </div>
      <div className="summary-content">
        <div className="host-list">
          {!isConnected && <ConnectButton className="test" showBalance={false} label="Connect wallet to begin" />}
          {!isConnected && <span className="coming-soon-text">Supported Hosts</span>}
          {isConnected && <h3>Choose a host</h3>}
          <img className={isConnected ? "host" : "host-disabled"} src={githubLogo} alt="github" onClick={!isConnected ? null : () => { return !user.username ? navigate('/login') : navigate('/publish-github') }}></img>
          <span className="coming-soon-text">Coming Soon...</span>
          <img className="host-disabled" src={bubbleLogo} alt="Bubble Protocol"></img>
          <img className="host-disabled" src={protonLogo} alt="Proton Drive"></img>
          <img className="host-disabled" src={ipfsLogo} alt="IPFS"></img>
          <img className="host-disabled" src={googleDriveLogo} alt="Google Drive"></img>
          <img className="host-disabled" src={amazonS3Logo} alt="Amazon S3"></img>
          <img className="host-disabled" src={dropboxLogo} alt="Dropbox"></img>
        </div>
      </div>
      <Footer/>
    </div>
  );

};
