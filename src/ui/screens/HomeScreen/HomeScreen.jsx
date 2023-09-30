import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ArticleSummary } from "./components/ArticleSummary";
import { Footer } from "../../components/Footer";

const LOAD_BATCH_SIZE = 10;

export const HomeScreen = () => {

  const navigate = useNavigate();
  const user = stateManager.useStateData("user")();
  const { getLatestContent, getFollowingContent } = stateManager.useStateData("content-functions")();
  const [content, setContent] = useState([]);
  const [fetchAmount, setFetchAmount] = useState(LOAD_BATCH_SIZE);
  const [fetchedAll, setFetchedAll] = useState(false);
  const [filter, setFilter] = useState(0);
  const [error, setError] = useState();
  const [loading, setLoading] = useState('timer');
  const timerRef = useRef(null);

  useEffect(() => {
    
    clearTimeout(timerRef.current);
    setLoading(fetchAmount > LOAD_BATCH_SIZE ? true : 'timer');

    timerRef.current = setTimeout(() => {
      setLoading(true);
    }, 1000);

    let promise;

    switch (filter) {

      case 0: 
        promise = getLatestContent(fetchAmount, fetchAmount - LOAD_BATCH_SIZE);
        break;

      case 1: 
        const following = user.followingFunctions ? user.followingFunctions.followers().map(f => f.username) : [];
        if (following.length > 0) promise = getFollowingContent(following, fetchAmount, fetchAmount - LOAD_BATCH_SIZE);
        else promise = Promise.reject({code: 'following-none', message: "You are not following anyone"});
        break;
    }

    promise
      .then(results => {
        console.debug(results);
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
  }, [filter, fetchAmount]);

  function filterContent(filterIndex) {
    if (filterIndex !== filter) {
      setContent([]);
      setError(null);
      setFetchAmount(LOAD_BATCH_SIZE);
      setFetchedAll(false);
      setFilter(filterIndex);
    }
  }

  const following = user.followingFunctions ? user.followingFunctions.followers() : [];

  return (
    <div className="home-screen" >
      <div className="left-column">
        <div className="filter-menu">
          <div className={"filter-button" + (filter === 0 ? '-selected' : '')} onClick={() => filterContent(0)}>Latest</div>
          <div className={"filter-button" + (filter === 1 ? '-selected' : '')} onClick={() => filterContent(1)}>Following</div>
          {following.map((f, i) => 
            <div key={f.username} className={"indent1 filter-button" + (filter === i+2 ? '-selected' : '')} onClick={() => navigate('/user/'+f.username.replace(':','/'))}>{formatName(f.username)}</div>)
          }
        </div>
      </div>
      <div className="content-column">
        {error && <div className="info-text">{error.message || error}</div>}
        {content.map(article => 
          <ArticleSummary key={article.id} 
            article={article} 
            onClick={() => navigate(`/article/${article.id}`)}
            onUserClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}
          />)}
        {!error && loading === false && !fetchedAll && <div className="more-button" onClick={() => setFetchAmount(fetchAmount+LOAD_BATCH_SIZE)}>Load More...</div>}
        {loading === true && <div className="loader"></div>}
        <Footer/>
      </div>
      <div className="right-column"></div>
    </div>
  );

};


function formatName(username) {
  const accountName = username.replace(/^[^:]*:/, '');
  return accountName.replace('-', ' ');
}