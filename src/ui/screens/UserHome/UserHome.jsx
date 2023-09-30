import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import anonymousUserIcon from '../../../assets/img/user.png';
import { formatArticleDate } from "../../utils/date-utils";
import { ContentList } from "../../components/ContentList";

export const UserHome = () => {
  const { platform, username } = useParams();

  const localUser = stateManager.useStateData("user")();
  const { getUser } = stateManager.useStateData("content-functions")();
  const [user, setUser] = useState();
  const [notMember, setNotMember] = useState(false);
  const [error, setError] = useState();
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    getUser(platform+':'+username)
      .then(userData => {
        setUser(userData);
        if (localUser.followingFunctions) setFollowing(localUser.followingFunctions.isFollowing(userData.username));
      })
      .catch(error => {
        console.warn(error);
        if (error.code === 'not-a-user') setNotMember(true);
        setError('Content not available. Try again later');
      });
  }, []);


  // Set following status if user changes
  useEffect(() => {
    if (user && localUser.followingFunctions) setFollowing(localUser.followingFunctions.isFollowing(user.username));
    else setFollowing(false);
  }, [localUser]);

  const canFollow = user && !!localUser.followingFunctions;

  function follow() {
    if (canFollow) {
      localUser.followingFunctions.follow(user.username);
      setFollowing(true);
    }
  }

  function unfollow() {
    if (canFollow) {
      localUser.followingFunctions.unfollow(user.username);
      setFollowing(false);
    }
  }


  return (
    <div className="user-home" >
      <div className="content-column">

        {/* Author Section */}
        <div className="author-section">
          <img className="contact-icon" src={ (user && user.icon) || anonymousUserIcon}></img>
          <div className="selector-content">
            <div className="selector-title-row">
              <span className="selector-title author-name">{user ? user.name : username}</span>
            </div>
            <div className="selector-title-row">
              {user && <span className="selector-time">Member Since: {formatArticleDate(user.registeredAt)}</span>}
              {!user && notMember && <span className="selector-time">Not A Member</span>}
            </div>
          </div>
          {!following && <span className={"selector-follow-link" + (canFollow ? '' : ' disabled')} onClick={follow}>Follow</span>}
          {following && <span className="selector-follow-link" onClick={unfollow}>Unfollow</span>}
        </div>
        <div></div>

        {/* Content Section */}
        {error && <div className="info-text">{error.message || error}</div>}
        {!error && user && <ContentList contentType='user' user={user} displayUser={false} />}

      </div>
    </div>
  );

};
