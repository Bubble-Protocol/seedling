import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ArticleSummary } from "./components/ArticleSummary";
import { Footer } from "../../components/Footer";

export const HomeScreen = ({setSelectedArticle}) => {

  const content = stateManager.useStateData("latest-content")();
  console.debug('content', content);

  return (
    <div className="home-screen app-content" >
      <div className="left-column">
        <div className="filter-menu">
          <div className="filter-button-selected">Latest</div>
        </div>
      </div>
      <div className="summary-content">
        {content.map(article => <ArticleSummary key={article.id} article={article} onClick={() => setSelectedArticle(article)} />)}
        <Footer/>
      </div>
      <div className="right-column"></div>
    </div>
  );

};

HomeScreen.propTypes = {
  setSelectedArticle: PropTypes.func.isRequired
};