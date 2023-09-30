import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ContentList } from "../../components/ContentList";

export const HomeScreen = () => {

  const navigate = useNavigate();
  const user = stateManager.useStateData("user")();
  const [filter, setFilter] = useState('latest');
  const renderFollowing = useRef(false);
  
  if (filter === 'following') renderFollowing.current = true;

  const following = user.followingFunctions ? user.followingFunctions.followers() : [];

  return (
    <div className="home-screen" >
      <div className="left-column">
        <div className="filter-menu">
          <div className={"filter-button" + (filter === 'latest' ? '-selected' : '')} onClick={() => setFilter('latest')}>Latest</div>
          <div className={"filter-button" + (filter === 'following' ? '-selected' : '')} onClick={() => setFilter('following')}>Following</div>
          {following.map((f, i) => 
            <div key={f.username} className={"indent1 filter-button" + (filter === i+2 ? '-selected' : '')} onClick={() => navigate('/user/'+f.username.replace(':','/'))}>{formatName(f.username)}</div>)
          }
        </div>
      </div>
      <div className="content-column">
        <ContentList contentType={filter} visible={filter === 'latest'} />
        {renderFollowing.current && <ContentList contentType={filter} user={user} visible={filter === 'following'} />}
      </div>
      <div className="right-column"></div>
    </div>
  );

};


function formatName(username) {
  const accountName = username.replace(/^[^:]*:/, '');
  return accountName.replace('-', ' ');
}

