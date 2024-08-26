import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./style.css";
import "./markdown.css";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import { Footer } from "../../components/Footer";
import anonymousUserIcon from '../../../assets/img/user.png';
import { formatArticleDate } from "../../utils/date-utils";
import { stateManager } from "../../../state-context";
import { TipModal } from "../../components/TipModal";
import { ActivityBar } from "./components/ActivityBar";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const Article = () => {
  const { id, preview } = useParams();
  const navigate = useNavigate();

  const { openConnectModal } = useConnectModal();
  const walletConnected = stateManager.useStateData("wallet-connected")();
  const user = stateManager.useStateData("user")();
  const { getArticleById, getPreview, unpublish } = stateManager.useStateData("content-functions")();
  const [article, setArticle] = useState(null);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState(null);
  const [tipModal, setTipModal] = useState();
  const articleRef = useRef();

  useEffect(() => {
    const fetchArticle = async asPreview => {
      try {
        const fetchedArticle = asPreview ? await getPreview(decodeURIComponent(preview)) : await getArticleById(id);
        if (!fetchedArticle.markdown) setError('Article Not Found!');
        else {
          if (articleRef.current) articleRef.current.scrollTop = 0;
          setArticle(fetchedArticle);
          if (user.followingFunctions) setFollowing(user.followingFunctions.isFollowing(fetchedArticle.author.username));
        }
      }
      catch(error) {
        console.warn('Failed to fetch article:', error);
        if (error.code === 'content-not-found') setError('Article Not Found!');
        else setError('Article Unavailable');
      }
    };
    fetchArticle(!!preview);
  }, [id]);

  // Set following status if user changes
  useEffect(() => {
    if (article && user.followingFunctions) setFollowing(user.followingFunctions.isFollowing(article.author.username));
    else setFollowing(false);
  }, [user]);


  function openTipModal(event) {
    if (!id) return; // preview only
    const rect = event.target.getBoundingClientRect();
    setTipModal({y: rect.top, x: rect.right + 8});
  }

  if (!article) {
    return (
      <div className="article" >
        <div className="article-loading">
          {!error && <div className="loader"></div>}
          {error && <div className="error-text">{error.message || error}</div>}
        </div>
        <Footer/>
      </div>
    )
  }

  function setTemporaryError(error) {
    setError(error);
    setTimeout(() => setError(null), 5000);
  }

  function follow() {
    if (!walletConnected) return openConnectModal();
    if (user.followingFunctions) {
      user.followingFunctions.follow(article.author.username);
      setFollowing(true);
    }
  }

  function unfollow() {
    if (user.followingFunctions) {
      user.followingFunctions.unfollow(article.author.username);
      setFollowing(false);
    }
  }

  async function unpublishArticle() {
    return unpublish(article.id)
    .then(() => navigate('/'))
    .catch(error => setTemporaryError(formatError(error)));
  }

  // Determine if the logged in account is the author of the article
  const isAuthor = (user.username === article.author.username) || (article.author.address && (user.account.toLowerCase() === article.author.address.toLowerCase()));

  return (
      <div className="article" ref={articleRef}>
      {tipModal && <TipModal x={tipModal.x} y={tipModal.y} article={article} onClose={() => setTipModal(null)} /> }

        {/* Image & Title */}
        {article.image && 
          <div className="image-box">
            <img className={article.image.width === 'full' ? 'full-width' : article.image.width === 'medium' ? 'medium-width' : 'default-width'} src={article.image.url}></img>
            {article.image.caption && <span className="caption">{article.image.caption}</span>}
          </div>
        }
        {!article.image && <div className="no-image"></div>}
        <span className="title">{article.title}</span>

        {/* Author Section */}
        <div className="author-section">
          <img className="contact-icon" src={article.author.icon || anonymousUserIcon} onClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}></img>
          <div className="selectorContent">
            <div className="selector-title-row">
              <span className="selector-title author-name" onClick={() => navigate(`/user/${article.author.username.replace(':','/')}`)}>{article.author.name}</span>
              {!following && <span className="selector-follow-link" onClick={follow}>Follow</span>}
              {following && <span className="selector-follow-link" onClick={unfollow}>Unfollow</span>}
            </div>
            <div className="selector-title-row">
              <span className="selector-time">{formatArticleDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>
        <ActivityBar article={article} isAuthor={isAuthor} openTipModal={openTipModal} unpublish={unpublishArticle} />

        {error && <div className="error-text">{error.message || error}</div>}

        {/* Markdown */}
        <ReactMarkdown className="markdown" remarkPlugins={[gfm, remarkEmoji]} components={{a: CustomLinkRenderer}} >
          {article.markdown}
        </ReactMarkdown>

        {/* Footer Section */}
        {error && <div className="error-text">{error.message || error}</div>}
        <ActivityBar article={article} isAuthor={isAuthor} openTipModal={openTipModal} unpublish={unpublishArticle} />
        <Footer/>
      </div>
  );

};

function CustomLinkRenderer(props) {
  const url = new URL(props.href);
  if (url.hostname === 'seedling-d.app') {
    return <Link to={`${url.pathname}${url.search}${url.hash}`}>{props.children}</Link>;
  } else {
    return <a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>;
  }
}

function formatError(error) {
  return error.details || error.message || error;
}