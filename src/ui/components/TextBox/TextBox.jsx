import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const TextBox = ({ text, onChange=()=>{}, disabled=false, valid=true, centered=false }) => {
  return (
    <div className="textbox">
      <input type="text" className={"text" + (!valid ? " invalid" : "") + (centered ? " centered" : "")} value={text} onChange={e => onChange(e.target.value)} disabled={disabled} />
    </div>
  );
};

TextBox.propTypes = {
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  valid: PropTypes.bool,
};
