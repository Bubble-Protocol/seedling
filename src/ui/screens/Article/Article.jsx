import PropTypes from "prop-types";
import React, { useMemo } from "react";
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

export const Article = ({article}) => {

  const components = {
    a: ({node, ...props}) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

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
          <span className="tips">{article.tips || 0}</span>
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
          <span className="tips">{article.tips || 0}</span>
          <div className="expander"></div>
          <img className="icon-button" src={shareIcon}></img>
          <img className="icon-button" src={moreIcon}></img>
        </div>
        <Footer/>
      </div>
    </div>
  );

};

Article.propTypes = {
  article: PropTypes.object.isRequired
};