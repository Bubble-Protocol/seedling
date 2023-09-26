import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ArticleSummary } from "./components/ArticleSummary";
import { Footer } from "../../components/Footer";

export const HomeScreen = () => {

  const navigate = useNavigate();
  const content = stateManager.useStateData("latest-content")();

  return (
    <div className="home-screen app-content" >
      <div className="left-column">
        <div className="filter-menu">
          <div className="filter-button-selected">Latest</div>
        </div>
      </div>
      <div className="summary-content">
        {content.map(article => <ArticleSummary key={article.id} article={article} onClick={() => navigate(`/article/${article.id}`)} />)}
        <Footer/>
      </div>
      <div className="right-column"></div>
    </div>
  );

};
