import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ArticleSummary } from "./components/ArticleSummary";
import anonymousUserIcon from '../../../assets/img/user.png';
import { formatArticleDate } from "../../utils/date-utils";
import { Footer } from "../../components/Footer";

export const UserHome = () => {
  const { platform, username } = useParams();

  const navigate = useNavigate();
  const { getUserContent, getUser } = stateManager.useStateData("content-functions")();
  const [user, setUser] = useState();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState('timer');
  const [error, setError] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {

    timerRef.current = setTimeout(() => {
      setLoading(true);
    }, 1000);

    getUser(platform+':'+username)
      .then(userData => {
        setUser(userData);
        return getUserContent(userData.id);
      })
      .then(setContent)
      .catch(error => {
        console.warn(error);
        setError('Content not available. Try again later');
      })
      .finally(() => {
        clearTimeout(timerRef.current);
        setLoading(false);
      });

  }, []);


  return (
    <div className="user-home" >
      <div className="left-column"></div>
      <div className="summary-content">

        {/* Author Section */}
        <div className="author-section">
          <img className="contact-icon" src={ (user && user.icon) || anonymousUserIcon}></img>
          <div className="selector-content">
            <div className="selector-title-row">
              {user && <span className="selector-title author-name">{user.name}</span>}
            </div>
            <div className="selector-title-row">
              {user && <span className="selector-time">Member Since: {formatArticleDate(user.registeredAt)}</span>}
            </div>
          </div>
          {user && <span className="selector-follow-link">Follow</span>}
        </div>
        <div></div>

        {/* Content Section */}
        {loading === true && <div className="loader"></div>}
        {error && <div className="info-text">{error.message || error}</div>}
        {!error && !loading && content.length === 0 && <div className="info-text">User hasn't published anything yet</div>}
        {content.map(article => <ArticleSummary key={article.id} article={article} onClick={() => navigate(`/article/${article.id}`)} />)}

        <Footer/>

      </div>
      <div className="right-column"></div>
    </div>
  );

};
