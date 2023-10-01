import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ContentList } from "../../components/ContentList";

export const HomeScreen = ({filter}) => {

  const navigate = useNavigate();
  const user = stateManager.useStateData("user")();
  
  const following = (user && user.followingFunctions) ? user.followingFunctions.followers() : [];

  return (
    <div className="home-screen" >
      <div className="left-column">
        <div className="filter-menu">
          <div className={"filter-button" + (filter === undefined ? '-selected' : '')} onClick={() => navigate('/')}>Latest</div>
          <div className={"filter-button" + (filter === 'following' ? '-selected' : '')} onClick={() => navigate('/following')}>Following</div>
          {following.map((f, i) => 
            <div key={f.username} className={"indent1 filter-button" + (filter === i+2 ? '-selected' : '')} onClick={() => navigate('/user/'+f.username.replace(':','/'))}>{formatName(f.username)}</div>)
          }
        </div>
      </div>
      <div className="content-column">
        <ContentList contentType={filter} user={user} />
      </div>
      <div className="right-column"></div>
    </div>
  );

};


function formatName(username) {
  const accountName = username.replace(/^[^:]*:/, '');
  return accountName.replace('-', ' ');
}

