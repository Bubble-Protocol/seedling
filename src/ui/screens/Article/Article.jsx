import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const Article = ({article}) => {

  return (
    <div className="article app-content" >
      {/* <MarkdownPreview source={article.content} /> */}
    </div>
  );

};

Article.propTypes = {
  article: PropTypes.object.isRequired
};