import React, { useEffect, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { useLocation, useNavigate } from "react-router-dom";
import { TextBox } from "../../components/TextBox/TextBox";

export const Publish = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { publish: publishContent } = stateManager.useStateData("content-functions")();
  const [publishing, setPublishing] = useState(false);
  const [text, setText] = useState();
  const [error, setError] = useState();

  const url = validateGithubUrl(text);

  // Retrieve previewed url if saved in local storage
  useEffect(() => {
    const savedText = localStorage.getItem(location.pathname);
    if (savedText) {
      localStorage.removeItem(location.pathname);
      setText(savedText);
    }
  }, []);

  function preview() {
    if (url.url !== text) console.trace('mapping', text, 'to', url.url);
    localStorage.setItem(location.pathname, text);
    navigate('/preview/'+encodeURIComponent(url.url));
  }

  function publish() {
    if (url.url !== text) console.trace('mapping', text, 'to', url.url);
    setPublishing(true);
    publishContent(url.url)
      .then(() => navigate('/'))
      .catch(setError)
      .finally(() => setPublishing(false));
  }

  return (
    <div>
      <div className="publish-screen" >
        <div className="summary-title">Publish a New Article</div>
        <div className="description-section">
          <span>
            To publish an article, add it to your GitHub account and enter the URL below.
          </span>
          <div className="help-link">How to Write and Publish Seedling Articles</div>
        </div>
        <div className="summary-content">
          <TextBox className="url-textbox" text={text} onChange={setText} placeholder="Your article URL..." />
        </div>
        {error && <div className="error-text">{error.message || error}</div>}
        {publishing && <div className="loader"></div>}
        {!publishing && 
          <div className="button-row">
            <div className={"text-link"+(url.valid ? '' : '-disabled')} onClick={() => url.valid && preview()}>Preview</div>
            <div className={"text-link"+(url.valid ? '' : '-disabled')} onClick={() => url.valid && publish()}>Publish</div>
          </div>
        }
      </div>
    </div>
  );

};


function validateGithubUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    if (url.hostname.toLowerCase() === 'github.com') {
      url.pathname = url.pathname.replace('/blob/', '/');
      url.hostname = "raw.githubusercontent.com";
    }
    return {valid: true, url: url.toString()}
  }
  catch(error) {
    return {valid: false, url: urlStr}
  }
}