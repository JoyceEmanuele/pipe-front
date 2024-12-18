import { createGlobalStyle } from 'styled-components';

import { colors } from './colors';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  /* ===== Scrollbar CSS ===== */
  /* Firefox */
  * {
    scrollbar-width: thin;
    
    scrollbar-color: #868686 #ffffff;
  }

  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 12px;
    border-radius: 20px;
    background-color: red;
  }

  *::-webkit-scrollbar-track {
    background: #ffffff;
  }

  *::-webkit-scrollbar-thumb {
    background-color: darkgrey !important;
    outline: 1px solid slategrey !important;
    border-radius: 10px !important;
    /* -webkit-border-radius: 1ex; */
  }

  body {
    font-family: 'Inter', sans-serif !important;
    color: initial !important;
    font-size: 14px !important;
    margin: 0 !important;
    font-feature-settings: unset !important;
    font-variant: unset !important;
  }

  .toastify-body {
    padding: 22px 24px!important;
    font-size: 0.875em!important;
    border-radius: 4px!important;
    background-color: ${colors.White}!important;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.16)!important;
  }

  .Toastify__toast--default, .Toastify__toast--error {
    color: ${colors.Grey300};
    border: 1px solid ${colors.Red};
    border-left: 8px solid ${colors.Red};
  }

  .Toastify__toast--success {
    color: ${colors.Grey300};
    border: 1px solid ${colors.Green};
    border-left: 8px solid ${colors.Green};
  }

  .Toastify__toast--info {
    color: ${colors.Grey300};
    border: 1px solid ${colors.Blue300};
    border-left: 8px solid ${colors.Blue300};
  }

  .Toastify__toast--warning {
    color: ${colors.Grey300};
    border: 1px solid ${colors.Yellow};
    border-left: 8px solid ${colors.Yellow};
  }


  .__react_component_tooltip {
      border-width: 0.5px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 4px !important;
      padding: 20px !important;
  }

  /**
  * Main wrapper
  */
  .select-search {
      width: 100%;
      position: relative;
      box-sizing: border-box;
  }

  .select-search *,
  .select-search *::after,
  .select-search *::before {
      box-sizing: inherit;
  }

  /**
  * Value wrapper
  */
  .select-search__value {
      position: relative;
      z-index: 1;
  }

  .select-search__value::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: calc(50% - 16px);
      right: 19px;
      width: 8.5px;
      height: 8.5px;
  }

  /**
  * Input
  */
  .select-search__input {
      display: block;
      height: 27px;
      width: 100%;
      padding: 0 40px 0 16px;
      background: #fff;
      border: 1px solid transparent;
      border-radius: 3px;
      outline: none;
      font-family: 'Inter',sans-serif;
      font-size: 12px;
      color: #000;
      text-align: left;
      text-overflow: ellipsis;
      -webkit-appearance: none;
  }

  .select-search__input::-webkit-search-decoration,
  .select-search__input::-webkit-search-cancel-button,
  .select-search__input::-webkit-search-results-button,
  .select-search__input::-webkit-search-results-decoration {
      -webkit-appearance:none;
  }

  .select-search__input:not([readonly]):focus {
      cursor: initial;
  }

  /**
  * Options wrapper
  */
  .select-search__select {
      background: #fff;
      box-shadow: 0 .0625rem .125rem rgba(0, 0, 0, 0.15);
  }

  /**
  * Options
  */
  .select-search__options {
      list-style: none;
      padding: 0;
  }

  .select-search__options .MuiCheckbox-colorPrimary.Mui-checked {
    color: white;
  }

  .DateRangePicker_picker {
    z-index: 999 !important;
  }

  /**
  * Option row
  */
  .select-search__row:not(:first-child) {
      border-top: 1px solid #eee;
  }

  /**
  * Option
  */
  .select-search__option,
  .select-search__not-found {
      display: block;
      height: 36px;
      width: 100%;
      padding: 0 16px;
      background: #fff;
      border: none;
      outline: none;
      font-family: 'Inter',sans-serif;
      font-size: 12px;
      color: #000;
      text-align: left;
      cursor: pointer;
  }

  .select-search--multiple .select-search__option {
      height: 48px;
  }

  .select-search__option.is-selected {
      background: #363BC4;
      color: #fff;
  }

  .select-search__option.is-highlighted,
  .select-search__option:not(.is-selected):hover {
      background: rgba(54, 59, 196, 0.34);
  }

  .select-search__option.is-highlighted.is-selected,
  .select-search__option.is-selected:hover {
      background: rgba(54, 59, 196, 0.79);
      color: #fff;
  }

  /**
  * Group
  */
  .select-search__group-header {
      font-size: 10px;
      text-transform: uppercase;
      background: #eee;
      padding: 8px 16px;
  }

  /**
  * States
  */
  .select-search.is-disabled {
      opacity: 0.5;
  }

  .select-search.is-loading .select-search__value::after {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cpath fill='%232F2D37' d='M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='0.6s' repeatCount='indefinite'/%3E%3C/path%3E%3C/svg%3E");
      background-size: 11px;
  }

  .select-search:not(.is-disabled) .select-search__input {
      cursor: pointer;
  }

  /**
  * Modifiers
  */
  .select-search--multiple {
      border-radius: 3px;
      overflow: hidden;
  }

  .select-search:not(.is-loading):not(.select-search--multiple) .select-search__value::after {
      transform: rotate(45deg);
      border-right: 2px solid #000;
      border-bottom: 2px solid #000;
      pointer-events: none;
  }

  .select-search--multiple .select-search__input {
      cursor: initial;
  }

  .select-search--multiple .select-search__input {
      border-radius: 3px 3px 0 0;
  }

  .select-search--multiple:not(.select-search--search) .select-search__input {
      cursor: default;
  }

  .select-search:not(.select-search--multiple) .select-search__select {
      position: absolute;
      z-index: 2;
      right: 0;
      left: 0;
      border-radius: 3px;
      overflow: auto;
      max-height: 360px;
  }

  .select-search--multiple .select-search__select {
    position: relative;
    overflow: auto;
    max-height: 260px;
    border-top: 1px solid #eee;
    border-radius: 0 0 3px 3px;
  }

  .select-search__not-found {
    height: auto;
    padding: 16px;
    text-align: center;
    color: #888;
  }

  .ant-modal-content {
    border-radius: 5px !important;

    .ant-modal-title {
      font-weight: bold;
    }

    .ant-modal-header {
      border-top: 7px solid ${colors.BlueSecondary};
      border-radius: 5px 5px 0px 0px !important;
    }
    .ant-modal-footer {
      border-radius: 0px 0px 5px 5px !important;
    }
  }
`;
