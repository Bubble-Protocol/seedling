import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { TextBox } from "../TextBox/TextBox";
import changeIcon from "../../../assets/img/change-icon.png";
import coffeeIcon from "../../../assets/img/coffee-icon.png";
import beerIcon from "../../../assets/img/beer-icon.png";
import foodIcon from "../../../assets/img/food-icon.png";
import champagneIcon from "../../../assets/img/champagne-icon.png";
import lamboIcon from "../../../assets/img/lambo-icon.png";
import { stateManager } from "../../../state-context";

export const TipModal = ({x, y, article, onClose}) => {

  const { tipDollars } = stateManager.useStateData("tip-functions")();
  const [tip, setTipNum] = useState("2");
  const popup = useRef();
  const firework = useRef();

  function setTip(val) {
    if (val.slice(0,1) === '$') val = val.slice(1);
    setTipNum(val);
  }

  function sendTip() {
    tipDollars(article.id, parseFloat(tip))
    .catch(console.warn)
    .finally(onClose);
  }

  useEffect(() => {
    if (popup.current) {
      positionPopup(x, y, popup.current);
    }
  }, []);

  const tipIsValid = isTipValid(tip);

  return (
    <div className="screen-overlay" onClick={onClose} >
      <div className="tip-frame" ref={popup} onClick={e => {e.stopPropagation()}}>
        <div className="top-frame">
          <div className="firework" ref={firework}></div>
          <TextBox text={'$'+tip} centered={true} onChange={setTip} />
          <div className="tip-icons">
            <img className="tip-icon" src={changeIcon} onClick={() => setTip('1')} />
            <img className="tip-icon" src={coffeeIcon} onClick={() => setTip('2')} />
            <img className="tip-icon" src={beerIcon} onClick={() => setTip('5')} />
            <img className="tip-icon" src={foodIcon} onClick={() => setTip('10')} />
            <img className="tip-icon" src={champagneIcon} onClick={() => setTip('20')} />
            <img className="tip-icon" src={lamboIcon} onClick={() => triggerFirework(firework) && setTip('100')} />
          </div>
        </div>
        <div className={"tip-button"+(!tipIsValid ? " disabled" : '')} onClick={() => tipIsValid && sendTip()}>Tip</div>
      </div>
    </div>
  );
};


function isTipValid(tipStr) {
  return /^[0-9.]+$/.test(tipStr) && tipStr.split('.').length <= 2;
}


function positionPopup(x, y, popup) {
  // Get dimensions and positions
  const popupRect = popup.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate initial position
  let left = x;
  let top = y - 85;

  // Adjust position to keep popup/modal within viewport
  if (left + popupRect.width > viewportWidth) {
    left = viewportWidth - popupRect.width;
  }
  if (top + popupRect.height > viewportHeight) {
    top = viewportHeight - popupRect.height;
  }
  if (top < 0) top = 0;

  // Set the position of the popup/modal
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}


function triggerFirework(ref) {
  ref.current.classList.add('pyro');
  setTimeout(() => ref.current.classList.remove('pyro'), 1000);
  return true;
}