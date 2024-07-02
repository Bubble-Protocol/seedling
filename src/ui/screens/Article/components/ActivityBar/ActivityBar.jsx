import React from "react";
import tipButtonIcon from '../../../../../assets/img/tip-button.png';
import shareIcon from '../../../../../assets/img/share-icon.png';
import moreIcon from '../../../../../assets/img/more-icon.png';
import { DropdownMenu } from "../../../../components/DropdownMenu/DropdownMenu";
import { formatTip } from "../../../../utils/tip-utils";
import "./style.css";
import { stateManager } from "../../../../../state-context";

export const ActivityBar = ({ article, isAuthor, openTipModal, unpublish }) => {

  const exchangeRate = stateManager.useStateData("exchange-rate")();

  const tip = formatTip(article.totalTips, exchangeRate);
  const authorActions = !isAuthor ? [] : [
    {name: "Unpublish", onClick: unpublish}
  ];

  return (
    <div className="activity-bar">
      <img className="tip-button" src={tipButtonIcon} onClick={openTipModal}></img>
      <span className="tips">${tip}</span>
      <div className="expander"></div>
      <DropdownMenu direction="bottom-left" options={[
        {name: "Copy Link", onClick: () => navigator.clipboard.writeText(window.location.href)}
      ]}>
        <img className="icon-button" src={shareIcon}></img>
      </DropdownMenu>   
      <DropdownMenu direction="bottom-left" options={[
        {name: "Open Source", onClick: () => window.open(article.sourceUrl, '_blank')},
        {name: "Open Raw Source", onClick: () => window.open(article.expandedUrl, '_blank')},
        ...authorActions
      ]}>
        <img className="icon-button" src={moreIcon}></img>
      </DropdownMenu>   
    </div>
  );

};
