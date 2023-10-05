import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import activeIcon from "../../../assets/img/checkbox-active.png";
import inactiveIcon from "../../../assets/img/checkbox-inactive.png";

export const CheckBox = ({ className, setSelected, selected=false, disabled=false }) => {
  return (
    <>
      {selected && <img className={'checkbox ' + className} src={activeIcon} onClick={() => !disabled && setSelected(false)}></img>}
      {!selected && <img className={'checkbox ' + className} src={inactiveIcon} onClick={() => !disabled && setSelected(true)}></img>}
    </>
  );
};

CheckBox.propTypes = {
  selected: PropTypes.bool,
  setSelected: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
