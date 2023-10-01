import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ArticleSummary } from "./components/ArticleSummary/ArticleSummary";
import { Footer } from "../Footer";

const LOAD_BATCH_SIZE = 10;

export const ContentList = ({contentType, user, displayUser}) => {

  const navigate = useNavigate();
  const { getUserContent, getLatestContent, getFollowingContent } = stateManager.useStateData("content-functions")();
  const [content, setContent] = useState([]);
  const [fetchAmount, setFetchAmount] = useState(LOAD_BATCH_SIZE);
  const [fetchedAll, setFetchedAll] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState('timer');
  const timerRef = useRef(null);

  useEffect(() => {
    setError(null);
    setContent([]);
    setFetchAmount(LOAD_BATCH_SIZE);
    setFetchedAll(false);
  }, [user]);


  useEffect(() => {

    if (fetchAmount === 0) return;
    
    clearTimeout(timerRef.current);
    setLoading(fetchAmount > LOAD_BATCH_SIZE ? true : 'timer');

    timerRef.current = setTimeout(() => {
      setLoading(true);
    }, 1000);

    let promise;

    switch (contentType) {

      case 'following': 
        const following = user && user.followingFunctions ? user.followingFunctions.followers().map(f => f.username) : [];
        if (following.length > 0) promise = getFollowingContent(following, fetchAmount, fetchAmount - LOAD_BATCH_SIZE);
        else promise = Promise.reject({code: 'following-none', message: "You are not following anyone"});
        break;

      case 'user':
        promise = getUserContent(user.id, fetchAmount, fetchAmount - LOAD_BATCH_SIZE);
        break;
      
      case 'latest':
      default:
        promise = getLatestContent(fetchAmount, fetchAmount - LOAD_BATCH_SIZE);

    }

    promise
      .then(results => {
        if (results.length === 0) setFetchedAll(true);
        else {
          setContent(content.concat(results));
        }
      })
      .catch(error => {
        console.warn(error);
        if (error.code === 'following-none') setError(error);
        else setError('Content not available. Try again later');
      })
      .finally(() => {
        clearTimeout(timerRef.current);
        setLoading(false);
      });

  }, [user, fetchAmount]);

  return (
    <div className="content-list">
      {error && <div className="info-text">{error.message || error}</div>}
      {content.map(article => 
        <ArticleSummary key={article.id} 
          article={article}
          displayUser={displayUser}
          onClick={() => navigate(`/article/${article.id}`)}
          onUserClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}
        />)}
      {!error && loading === false && !fetchedAll && <div className="more-button" onClick={() => setFetchAmount(fetchAmount+LOAD_BATCH_SIZE)}>Load More...</div>}
      {loading === true && <div className="loader"></div>}
      <Footer/>
    </div>
  );

}