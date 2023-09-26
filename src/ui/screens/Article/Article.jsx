import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./style.css";
import "./markdown.css";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm';
import { Footer } from "../../components/Footer";
import anonymousUserIcon from '../../../assets/img/user.png';
import tipButtonIcon from '../../../assets/img/tip-button.png';
import shareIcon from '../../../assets/img/share-icon.png';
import moreIcon from '../../../assets/img/more-icon.png';
import { formatArticleDate } from "../../utils/date-utils";
import { stateManager } from "../../../state-context";
import { formatTip } from "../../utils/tip-utils";

export const Article = () => {
  const { id } = useParams();

  const { getArticleById } = stateManager.useStateData("query-functions")();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const fetchedArticle = await getArticleById(id);
        setArticle(fetchedArticle);
      }
      catch(error) {
        console.warn('Failed to fetch article:', error);
        if (error.code === 'content-not-found') setError('Article Not Found!');
        else setError('Article Unavailable');
      }
    };
    fetchArticle();
  }, [id]);

  const components = {
    a: ({node, ...props}) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  if (!article) {
    return (
      <div className="app-content" >
        <div className="article-loading">
          {!error && <div className="loader"></div>}
          {error && <div className="error-text">{error.message || error}</div>}
        </div>
      </div>
    )
  }

  const tip = formatTip(article.totalTips);

  return (
    <div className="app-content" >
      <div className="article">

        {/* Image & Title */}
        {article.image && 
          <div className="image-box">
            <img src={article.image.url}></img>
            {article.image.caption && <span className="caption">{article.image.caption}</span>}
          </div>
        }
        <span className="title">{article.title}</span>

        {/* Author Section */}
        <div className="author-section">
          <img className="contact-icon" src={article.author.icon || anonymousUserIcon}></img>
          <div className="selectorContent">
            <div className="selector-title-row">
              <span className="selector-title">{article.author.name}</span>
              <span className="selector-follow-link">Follow</span>
            </div>
            <div className="selector-title-row">
              <span className="selector-time">{formatArticleDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>

        <div className="activity-bar">
          <img className="tip-button" src={tipButtonIcon}></img>
          <span className="tips">{tip}</span>
          <div className="expander"></div>
          <img className="icon-button" src={shareIcon}></img>
          <img className="icon-button" src={moreIcon}></img>
        </div>

        {/* Markdown */}
        <ReactMarkdown className="markdown" remarkPlugins={[gfm]} components={components}>
          {article.markdown}
        </ReactMarkdown>

        {/* Footer Section */}
        <div className="activity-bar">
          <img className="tip-button" src={tipButtonIcon}></img>
          <span className="tips">{tip}</span>
          <div className="expander"></div>
          <img className="icon-button" src={shareIcon}></img>
          <img className="icon-button" src={moreIcon}></img>
        </div>
        <Footer/>
      </div>
    </div>
  );

};
