import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { TipModal } from "../../components/TipModal";

export const Article = () => {
  const { id, preview } = useParams();
  const navigate = useNavigate();

  const { getArticleById, getPreview } = stateManager.useStateData("content-functions")();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [tipModal, setTipModal] = useState();

  useEffect(() => {
    const fetchArticle = async asPreview => {
      try {
        const fetchedArticle = asPreview ? await getPreview(decodeURIComponent(preview)) : await getArticleById(id);
        setArticle(fetchedArticle);
      }
      catch(error) {
        console.warn('Failed to fetch article:', error);
        if (error.code === 'content-not-found') setError('Article Not Found!');
        else setError('Article Unavailable');
      }
    };
    fetchArticle(!!preview);
  }, [id]);

  const components = {
    a: ({node, ...props}) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  function openTipModal(event) {
    if (!id) return; // preview only
    const rect = event.target.getBoundingClientRect();
    setTipModal({y: rect.top, x: rect.right + 8});
  }

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
      {tipModal && <TipModal x={tipModal.x} y={tipModal.y} article={article} onClose={() => setTipModal(null)} /> }
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
          <img className="contact-icon" src={article.author.icon || anonymousUserIcon} onClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}></img>
          <div className="selectorContent">
            <div className="selector-title-row">
              <span className="selector-title author-name" onClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}>{article.author.name}</span>
              <span className="selector-follow-link">Follow</span>
            </div>
            <div className="selector-title-row">
              <span className="selector-time">{formatArticleDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>

        <div className="activity-bar">
          <img className="tip-button" src={tipButtonIcon} onClick={openTipModal}></img>
          <span className="tips">{tip} mETH</span>
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
          <img className="tip-button" src={tipButtonIcon} onClick={openTipModal}></img>
          <span className="tips">{tip} mETH</span>
          <div className="expander"></div>
          <img className="icon-button" src={shareIcon}></img>
          <img className="icon-button" src={moreIcon}></img>
        </div>
        <Footer/>
      </div>
    </div>
  );

};
