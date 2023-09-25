import PropTypes from "prop-types";
import React, { useMemo } from "react";
import "./style.css";
import "./markdown.css";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm';

export const Article = ({article}) => {

  // Helper function to remove duplicate title
  const removeDuplicateTitle = (markdown, title) => {
    const titleRegex = new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n`, "i");
    console.debug(`"${article.title}"`, article.markdown);
  
    return markdown.replace(titleRegex, '');
  };

  // Process markdown content once on component mount/update
  const processedMarkdown = useMemo(() => {
    return removeDuplicateTitle(article.markdown, article.title);
  }, [article.markdown, article.title]);
  
  
  const components = {
    a: ({node, ...props}) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  return (
    <div className="app-content" >
      <div className="article">
        {article.image && 
          <div className="image-box">
            <img src={article.image}></img>
            {article.imageCaption && <span className="caption">{article.imageCaption}</span>}
          </div>
        }
        <span className="title">{article.title}</span>
        <ReactMarkdown className="markdown" remarkPlugins={[gfm]} components={components}>
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );

};

Article.propTypes = {
  article: PropTypes.object.isRequired
};