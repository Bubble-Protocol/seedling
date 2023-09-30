import PropTypes from "prop-types";
import React, { useState } from "react";
import "./style.css";

export const DropdownMenu = ({ children, direction='top-left', options=[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasIcon = options.some(option => option.icon !== undefined);

  function toggleOpen() { setIsOpen(!isOpen) }

  function clickOption(option) { 
    setIsOpen(false);
    option.onClick && option.onClick();
  }

  return (
    <div className="dropdown-menu-container">
      <div className="dropdown-button" onClick={toggleOpen}>
        {children}
      </div>
      {isOpen && (
        <div className={"dropdown-menu"+(direction ? " dropdown-"+direction : '')} onMouseLeave={() => setIsOpen(false)}>
          {options.map((option, i) => {
            switch (option.type) {
              case 'line': return <div key={i} className="line"></div>
              default: 
                return <div className={"li"+(option.onClick ? '' : ' no-click')} onClick={() => clickOption(option)} key={i}>
                  <div className="icon-text">
                    {hasIcon && option.icon && <img src={option.icon} /> }
                    {hasIcon && !option.icon && <div className="blank-img" /> }
                    {option.name}
                  </div>
                </div>
              }
          })}
        </div>
      )}
    </div>
  );
};

DropdownMenu.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCompletion: PropTypes.func,
  direction: PropTypes.string
};
