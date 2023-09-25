import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import "./markdown.css";
import ReactMarkdown from "react-markdown";

export const Article = ({article}) => {

  const components = {
    a: ({node, ...props}) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  return (
    <div className="app-content" >
      <div className="article">
        <ReactMarkdown className="markdown" components={components}>
          {article.markdown}
        </ReactMarkdown>
      </div>
    </div>
  );

};

Article.propTypes = {
  article: PropTypes.object.isRequired
};