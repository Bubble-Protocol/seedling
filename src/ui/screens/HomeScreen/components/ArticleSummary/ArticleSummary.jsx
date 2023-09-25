import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultArticleImage from '../../../../../assets/img/article-image.png';
import anonymousUserIcon from '../../../../../assets/img/user.png';
import tipButtonIcon from '../../../../../assets/img/tip-button.png';
import { formatArticleDate } from "../../../../utils/date-utils";

export const ArticleSummary = ({article}) => {

  return (
    <div className="article-summary" >
      <div className="summary">
        <img className="summary-image" src={article.image || defaultArticleImage}></img>
        <div className="summary-content">
          <div className="summary-title">{article.title}</div>
          <div className="summary-description">{article.description}</div>
        </div>
      </div>
      <div className="summary-author-bar">
      <img className="contact-icon" src={article.author.icon || anonymousUserIcon}></img>
        <div className="summary-bar">
          <div className="summary-bar-name">{article.author.name}</div>
          <div className="summary-bar-date">{formatArticleDate(article.publishedAt)}</div>
          <div className="expander"></div>
          <img className="summary-bar-tip-button" src={tipButtonIcon}></img>
          <div className="summary-bar-tips">{article.tips || 0}</div>
        </div>
      </div>
    </div>
  );
};

ArticleSummary.propTypes = {
  article: PropTypes.object.isRequired
};

