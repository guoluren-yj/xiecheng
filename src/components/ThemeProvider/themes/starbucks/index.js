export default () => `
  /* Main Header styles start */
  .hzero-normal-container .hzero-normal-header {
    background-color: #fff !important;
  }

  .default-language-select .ant-select-selection .ant-select-arrow, .default-language-select .ant-select-selection .ant-select-selection-selected-value,
  .hzero-normal-header-container .hzero-normal-header-right-item-avatar-name,
  .hzero-normal-header-container .hzero-normal-header-right-item-select,
  .hzero-normal-header-right-item > a,
  .hzero-normal-header-logo-sign > a .hzero-normal-header-title, .hzero-normal-header-logo > a .hzero-normal-header-title,
  .hzero-normal-container .hzero-normal-body .hzero-normal-collapsed-trigger {
    color: #000 !important;
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
    color: #000;
    font-size: 20px;
  }

  /* Main Header styles end */
  /* Main Menu styles start */
  .hzero-normal-container .hzero-normal-body .hzero-normal-nav-container,
  .hzero-main-menu-wrap > ul,
  .hzero-sub-menu {
    background-color: #006341 !important;
  }
  .hzero-leaf-menu {
    background-color: #fff !important;
  }
  
  .hzero-normal-side-search .hzero-normal-side-search-input,
  .hzero-normal-side-search .hzero-normal-side-search-history-content > .ant-tag,
  .hzero-normal-container .hzero-normal-side-search-icon {
    background-color: #4D7D67 !important;
  }
  .hzero-normal-container .hzero-normal-side-search .hzero-normal-side-search-icon {
    background-color: transparent !important;
  }
  .hzero-normal-side-search-focus .hzero-normal-side-search-input {
    background-color: #fff !important;
  }
  .hzero-normal-side-search-select-wrap .ant-select-dropdown-menu-item {
    background-color: #006341 !important;
  }
  .hzero-normal-side-search-select-wrap .ant-select-dropdown-menu-item-active {
    background-image: none !important;
    background-color: #003B27 !important;
  }

  .hzero-normal-side-search:not(.hzero-normal-side-search-focus) .hzero-normal-side-search-input > div > div > .ant-select-selection__placeholder,
  .hzero-main-menu-item-content,
  .hzero-sub-menu-item-title,
  .hzero-normal-side-search-history-title,
  .hzero-normal-side-search .hzero-normal-side-search-history-btn-clear:hover,
  .hzero-normal-side-search .hzero-normal-side-search-history-btn-clear:focus {
    color: #fff !important;
  }
  .hzero-leaf-menu-item {
    color: #000 !important;
  }

  .hzero-main-menu-item-hover .hzero-main-menu-item-content,
  .hzero-main-menu-item-active .hzero-main-menu-item-content,
  .hzero-main-menu-item-tab-active .hzero-main-menu-item-content,
  .hzero-sub-menu-item-content:hover,
  .hzero-sub-menu-item-active .hzero-sub-menu-item-content,
  .hzero-sub-menu-item-hover .hzero-sub-menu-item-content,
  .hzero-leaf-menu-item:hover,
  .hzero-leaf-menu-item-active {
    background-color: #003B27 !important;
    background-image: none !important;
    color: #fff !important;
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
    border-left-color: #fff !important;
  }

  .hzero-leaf-menu-item-wrap-line {
    background-color: #006341 !important;
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
    color: #fff;
  }
  .hzero-normal-side-search.hzero-normal-side-search-focus .hzero-normal-side-search-icon:before {
    color: #ccc;
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
  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-ink-bar + .ant-tabs-tab {
    background-color: #006341 !important;
    color: #ccc !important;
  }

  .hzero-normal-content-container > .ant-tabs > .ant-tabs-bar .ant-tabs-ink-bar + .ant-tabs-tab-active {
    color: #fff !important;
  }

  /* Main Tab styles end */
`;
