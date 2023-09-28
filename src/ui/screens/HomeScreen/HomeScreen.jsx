import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ArticleSummary } from "./components/ArticleSummary";
import { Footer } from "../../components/Footer";

export const HomeScreen = () => {

  const navigate = useNavigate();
  const { getLatestContent } = stateManager.useStateData("content-functions")();
  const [content, setContent] = useState([]);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState('timer');
  const timerRef = useRef(null);

  useEffect(() => {

    timerRef.current = setTimeout(() => {
      setLoading(true);
    }, 1000);

    getLatestContent(10, 0)
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
    <div className="home-screen" >
      <div className="left-column">
        <div className="filter-menu">
          <div className="filter-button-selected">Latest</div>
        </div>
      </div>
      <div className="content-column">
        {loading === true && <div className="loader"></div>}
        {error && <div className="info-text">{error.message || error}</div>}
        {content.map(article => 
          <ArticleSummary key={article.id} 
            article={article} 
            onClick={() => navigate(`/article/${article.id}`)}
            onUserClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}
          />)}
        <Footer/>
      </div>
      <div className="right-column"></div>
    </div>
  );

};
