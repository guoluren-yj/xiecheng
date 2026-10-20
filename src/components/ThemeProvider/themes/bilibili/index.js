const primaryColor = '#23ade5';
const fontColor = '#18191C';
const fontColorDark = '#fff';
const borderColor = '#d9d9d9';
const activeFontColor = primaryColor;
const bgColor = '#fff';
const bgColorDark = '#1c1c1c';
const headerBg = bgColorDark;
const headerFontColor = fontColorDark;
const menuBg = bgColor;
const menuFontColor = fontColor;
const subMenuBg = menuBg;
const menuLeafBg = menuBg;
const menuLeafDivider = borderColor;
const mainTabBg = primaryColor;
const mainTabFontColor = fontColorDark;
const searchBg = bgColor;


export default () => `
  /* Main Header styles start */
  .hzero-normal-container .hzero-normal-header {
    background-color: ${headerBg} !important;
  }

  .default-language-select .ant-select-selection .ant-select-arrow, .default-language-select .ant-select-selection .ant-select-selection-selected-value,
  .hzero-normal-header-container .hzero-normal-header-right-item-avatar-name,
  .hzero-normal-header-container .hzero-normal-header-right-item-select,
  .hzero-normal-header-right-item > a,
  .hzero-normal-header-logo-sign > a .hzero-normal-header-title, .hzero-normal-header-logo > a .hzero-normal-header-title,
  .hzero-normal-container .hzero-normal-body .hzero-normal-collapsed-trigger {
    color: ${headerFontColor} !important;
  }

  .hzero-normal-header-container .hzero-normal-header-right-item-notice .anticon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-image: none !important;
  }

  .hzero-normal-header-container .hzero-normal-header-right-item-notice .anticon:before {
    display: block;
    font-family: anticon !important;
    content: "\\E64E";
    color: ${headerFontColor};
    font-size: 20px;
  }

  /* Main Header styles end */
  /* Main Menu styles start */
  .hzero-normal-container .hzero-normal-body .hzero-normal-nav-container,
  .hzero-main-menu-wrap > ul {
    background-color: ${menuBg} !important;
  }
  .hzero-sub-menu {
    background-color: ${subMenuBg} !important;
    opacity: 1;
  }
  .hzero-leaf-menu {
    background-color: ${menuLeafBg} !important;
    opacity: 1;
  }
  
  .hzero-normal-side-search .hzero-normal-side-search-input,
  .hzero-normal-side-search .hzero-normal-side-search-history-content > .ant-tag,
  .hzero-normal-container .hzero-normal-side-search-icon {
    background-color: ${searchBg} !important;
  }
  .hzero-normal-side-search .hzero-normal-side-search-input > div {
    border: 1px solid ${borderColor};
  }
  .hzero-normal-container .hzero-normal-side-search .hzero-normal-side-search-icon {
    background-color: transparent !important;
  }
  .hzero-normal-side-search-focus .hzero-normal-side-search-input {
    background-color: ${searchBg} !important;
  }
  .hzero-normal-side-search-select-wrap .ant-select-dropdown-menu-item {
    background-color: ${menuBg} !important;
    color: ${fontColor};
  }
  .hzero-normal-side-search-select-wrap .ant-select-dropdown-menu-item-active {
    background-image: none !important;
    background-color: ${menuBg} !important;
    color: ${activeFontColor};
  }
  
  .hzero-normal-side-search-popover .hzero-normal-side-search {
    background-color: transparent;
  }

  .hzero-normal-side-search:not(.hzero-normal-side-search-focus) .hzero-normal-side-search-input > div > div > .ant-select-selection__placeholder,
  .hzero-main-menu-item-content,
  .hzero-sub-menu-item-title,
  .hzero-normal-side-search-history-title,
  .hzero-normal-side-search .hzero-normal-side-search-history-btn-clear:hover,
  .hzero-normal-side-search .hzero-normal-side-search-history-btn-clear:focus {
    color: ${menuFontColor} !important;
  }
  .hzero-leaf-menu-item {
    color: ${menuFontColor} !important;
  }

  .hzero-main-menu-item-hover .hzero-main-menu-item-content,
  .hzero-main-menu-item-active .hzero-main-menu-item-content,
  .hzero-main-menu-item-tab-active .hzero-main-menu-item-content,
  .hzero-sub-menu-item-content:hover,
  .hzero-sub-menu-item-active .hzero-sub-menu-item-content,
  .hzero-sub-menu-item-hover .hzero-sub-menu-item-content,
  .hzero-leaf-menu-item:hover,
  .hzero-leaf-menu-item-active {
    background-color: ${menuBg} !important;
    background-image: none !important;
    color: ${activeFontColor} !important;
  }

  .hzero-main-menu-item-hover .hzero-main-menu-item-content:before,
  .hzero-main-menu-item-active .hzero-main-menu-item-content:before,
  .hzero-main-menu-item-tab-active .hzero-main-menu-item-content:before,
  .hzero-sub-menu-item-content:hover:before,
  .hzero-sub-menu-item-active .hzero-sub-menu-item-content:before,
  .hzero-sub-menu-item-hover .hzero-sub-menu-item-content:before,
  .hzero-leaf-menu-item:hover:before,
  .hzero-leaf-menu-item-active:before {
    display: none;
  }

  .hzero-main-menu-item-content:after,
  .hzero-sub-menu-item-content:after {
    border-left-color: ${menuFontColor} !important;
  }

  .hzero-leaf-menu-item-wrap-line {
    background-color: ${menuLeafDivider} !important;
  }

  .hzero-normal-side-search .hzero-normal-side-search-icon,
  .hzero-normal-container .hzero-normal-side-search-icon {
    background-image: none !important;
  }

  .hzero-normal-side-search .hzero-normal-side-search-icon:before,
  .hzero-normal-container .hzero-normal-side-search-icon:before {
    display: block;
    font-family: anticon !important;
    content: "\\E670";
  }
  .hzero-normal-side-search:not(.hzero-normal-side-search-focus) .hzero-normal-side-search-icon:before,
  .hzero-normal-container .hzero-normal-side-search-icon:before {
    color: ${menuFontColor};
  }
  .hzero-normal-side-search.hzero-normal-side-search-focus .hzero-normal-side-search-icon:before {
    color: ${activeFontColor};
  }

  .hzero-normal-container .hzero-normal-side-search-icon {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  .hzero-normal-container .hzero-normal-side-search-icon:before {
    font-size: 16px;
  }

  .hzero-normal-side-search .hzero-normal-side-search-icon {
    display: block !important;
  }

  .hzero-normal-side-search .hzero-normal-side-search-icon:before {
    font-size: 12px;
  }

  /* Main Menu styles end */
  /* Main Tab styles start */
  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-tab {
    color: ${fontColor} !important;
  }
  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-tab.ant-tabs-tab-active {
    color: ${activeFontColor} !important;
  }
  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-tab {
    color: ${fontColor} !important;
  }
  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-ink-bar + .ant-tabs-tab {
    background-color: ${mainTabBg} !important;
    color: ${mainTabFontColor} !important;
  }

  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-ink-bar + .ant-tabs-tab-active {
    color: ${mainTabFontColor} !important;
  }

  /* Main Tab styles end */
`;
