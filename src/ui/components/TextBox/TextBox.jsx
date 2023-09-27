import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const TextBox = ({ className, text, onChange=()=>{}, placeholder, disabled=false, valid=true, centered=false }) => {
  return (
    <div className={"textbox " + className}>
      <input type="text" className={"text" + (!valid ? " invalid" : "") + (centered ? " centered" : "")} value={text} placeholder={placeholder} onChange={e => onChange(e.target.value)} disabled={disabled} />
    </div>
  );
};

TextBox.propTypes = {
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  valid: PropTypes.bool,
};
