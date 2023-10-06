import PropTypes from "prop-types";
import React, { useState } from "react";
import "./style.css";
import defaultArticleImage from '../../../../../assets/img/article-image.png';
import anonymousUserIcon from '../../../../../assets/img/user.png';
import tipButtonIcon from '../../../../../assets/img/tip-button.png';
import { formatArticleDate } from "../../../../utils/date-utils";
import { formatTip } from "../../../../utils/tip-utils";
import { TipModal } from "../../../../components/TipModal";
import { stateManager } from "../../../../../state-context";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const ArticleSummary = ({article, displayUser=true, onClick, onUserClick}) => {

  const { openConnectModal } = useConnectModal();
  const walletConnected = stateManager.useStateData("wallet-connected")();
  const [tipModal, setTipModal] = useState();

  function openTipModal(event) {
    if (!walletConnected) return openConnectModal();
    const rect = event.target.getBoundingClientRect();
    setTipModal({y: rect.top, x: rect.right + 8});
  }

  return (
    <div className="article-summary">
      {tipModal && <TipModal x={tipModal.x} y={tipModal.y} article={article} onClose={() => setTipModal(null)} /> }
      <div className="summary no-mobile" onClick={onClick}>
        <img className="summary-image" src={article.image.url || defaultArticleImage}></img>
        <div className="summary-content">
          <div className="summary-title">{article.title}</div>
          <div className="summary-description">{article.description}</div>
        </div>
      </div>
      <div className="summary mobile" onClick={onClick}>
        <div className="summary-image-title-row">
          <img className="summary-image" src={article.image.url || defaultArticleImage}></img>
          <div className="summary-title">{article.title}</div>
        </div>
        <div className="summary-content">
          <div className="summary-description">{article.description}</div>
        </div>
      </div>
      <div className="summary-author-bar">
        {displayUser && <img className="contact-icon" src={article.author.icon || anonymousUserIcon} onClick={onUserClick}></img>}
        <div className="summary-bar">
          {displayUser && <div className="summary-bar-name" onClick={onUserClick}>{article.author.name}</div>}
          <div className="summary-bar-date">{formatArticleDate(article.publishedAt)}</div>
          <div className="expander"></div>
          <img className="summary-bar-tip-button" src={tipButtonIcon} onClick={openTipModal}></img>
          <div className="summary-bar-tips">{formatTip(article.totalTips)}</div>
        </div>
      </div>
    </div>
  );
};

ArticleSummary.propTypes = {
  article: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

