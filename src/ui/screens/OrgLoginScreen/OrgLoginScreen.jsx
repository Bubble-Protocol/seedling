import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Footer } from "../../components/Footer";
import { CheckBox } from "../../components/CheckBox";

const VALID_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
export const OrgLoginScreen = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountParam = searchParams.get('account');
  const orgListParam = searchParams.get('orgs') || [];
  const errorParam = searchParams.get('error');
  const walletConnected = stateManager.useStateData("wallet-connected")();
  const { deployOrganisation, setUsername } = stateManager.useStateData("account-functions")();
  const { isUserRegistered } = stateManager.useStateData("content-functions")();
  const [orgs, setOrgs] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState();
  const [error, setError] = useState(errorParam);
  const checkedRegistered = useRef(false);
  
  let orgUsernames;
  try {
    orgUsernames = JSON.parse(decodeURIComponent(orgListParam));
  }
  catch(_){}

  const valid = VALID_ADDRESS_REGEX.test(accountParam) && Array.isArray(orgUsernames) && orgUsernames.length !== 0;
  const selectedOrgAlreadyRegistered = selectedOrg && selectedOrg.alreadyRegistered;

  useEffect(() => {
    if (valid) {
      setOrgs(orgUsernames.map(u => { return {username: u, alreadyRegistered: false}}));
      if (walletConnected) checkIfOrgsRegistered();
    }
  }, []);

  // check if orgs have been registered
  useEffect(() => {
    if (walletConnected && !checkedRegistered.current) checkIfOrgsRegistered();
  }, [walletConnected]);

  // auto select org if the only one not registered
  useEffect(() => {
    const unregisteredOrgs = orgs.filter(o => !o.alreadyRegistered);
    if (unregisteredOrgs.length === 1) setSelectedOrg(unregisteredOrgs[0]);
  }, [orgs]);

  function checkIfOrgsRegistered() {
    if (valid) {
      orgUsernames.forEach(username => {
        isUserRegistered(username)
          .then(registered => {
            if (registered) setOrgs(orgs.map(org => {
              if (org.username === username) org.alreadyRegistered = true;
              return org;
            }))
          })
          .catch(console.warn);
      })
    }
    checkedRegistered.current = true;
  }

  function deploy() {
    if (!valid || !selectedOrg || selectedOrgAlreadyRegistered) return;
    setDeploying(true);
    deployOrganisation(accountParam, selectedOrg.username)
      .catch(error => {
        setError(error);
        setDeploying(false)
      });
  }

  function reconnect() {
    if (!valid || !selectedOrg || !selectedOrgAlreadyRegistered) return;
    setUsername(accountParam, selectedOrg.username, 'org');
    navigate('/');
  }


  return (
    <div className="org-login-screen" >
      <div className="summary-title">Deploy Your Seedling Organisation</div>
      <p>
        A Seedling Org account links your GitHub organisation to Seedling, enabling you to grant publishing rights to other users.
        It is an on-chain smart contract owned by you.
      </p>
      {!valid && <span className="org-name">You are not an owner or administrator of any GitHub organisations.</span>}
      {valid && orgs.length > 1 && <p>Which organisation do you want to deploy?</p>}
      <div className="org-list">
        {valid && orgs.map(org => 
          <div key={org.username} className="org-selector">
            {orgs.length > 1 && <CheckBox selected={org === selectedOrg} setSelected={() => setSelectedOrg(org)} />}
            <span className={"org-name" + (org.alreadyRegistered ? ' org-already-registered' : '')}>{formatName(org.username)}</span>
            {org.alreadyRegistered && <span className="label">(already registered)</span>}
          </div>
        )}
      </div>
      {valid && !selectedOrgAlreadyRegistered &&
        <p>
          Deploying your organisation requires a blockchain transaction.<br/>
          There's a one-time fee of $20 to establish your Seedling Org account.
        </p>
      }
      <div className="summary-content">
        {error && <div className="error-text">{error.message || error}</div>}
        {deploying && <div className="loader"></div>}
        {!deploying && valid && !selectedOrgAlreadyRegistered && <div className={"text-link" + (selectedOrg ? '' : ' disabled')} onClick={() => selectedOrg !== undefined && deploy()}>Deploy Your Organisation</div>}
        {!deploying && valid && selectedOrgAlreadyRegistered && <div className="text-link" onClick={reconnect}>Just Reconnect Me</div>}
        {!deploying && !valid && <div className="text-link" onClick={() => navigate('/')}>Cancel</div>}
      </div>
      <Footer/>
    </div>
  );

};


function formatName(username) {
  const accountName = username.replace(/^[^:]*:/, '');
  return accountName.replace('-', ' ');
}

