import React, { useEffect, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { useLocation, useNavigate } from "react-router-dom";
import { TextBox } from "../../components/TextBox/TextBox";
import { Footer } from "../../components/Footer";

export const Publish = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { publish: publishContent } = stateManager.useStateData("content-functions")();
  const user = stateManager.useStateData("user")();
  const [publishing, setPublishing] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState();

  const url = validateGithubUrl(text, user);

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
      .catch(error => {
        console.warn(error, error.code);
        if (error.message.slice(0,30).toLowerCase().indexOf('reject') >= 0) return;
        else if (error.code === 'user-error') setError("You don't appear to be a registered user");
        else if (error.code === 'already-published') setError('This content or URL has already been published');
        else if (error.code === 'internal error') setError('Unexpected error - try again later');
        else setError(error);
      })
      .finally(() => setPublishing(false));
  }

  return (
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
      {!error && url.valid && !url.usernameValid && <div className="error-text">You can only publish content from your own GitHub account</div>}
      {publishing && <div className="loader"></div>}
      {!publishing && 
        <div className="button-row">
          <div className={"text-link"+(url.valid && url.usernameValid ? '' : '-disabled')} onClick={() => url.valid && url.usernameValid && preview()}>Preview</div>
          <div className={"text-link"+(url.valid && url.usernameValid ? '' : '-disabled')} onClick={() => url.valid && url.usernameValid && publish()}>Publish</div>
        </div>
      }
      <Footer/>
    </div>
  );

};


function validateGithubUrl(urlStr, user) {
  try {
    const url = new URL(urlStr);
    if (url.hostname.toLowerCase() === 'github.com') {
      url.pathname = url.pathname.replace('/blob/', '/');
      url.hostname = "raw.githubusercontent.com";
    }
    const paths = url.pathname.split('/')
    const username = 'github:'+paths[1];
    const contentPath = paths.slice(2).join('/');
    const hasUsername = user.username && username.length > 7;
    return {
      valid: hasUsername && contentPath.length > 0, 
      usernameValid: hasUsername && (username === user.username), 
      url: url.toString(), 
      username
    }
  }
  catch(error) {
    return {valid: false, usernameValid: false, url: urlStr, username: undefined}
  }
}
