import React from 'react';
import styles from './index.less';

// 为适应主题颜色
function SortDescendingIcon() {
  return (
    <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1">
      <title>icon-ascending</title>
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-97.000000, -8.000000)">
          <g id="icon-ascending" transform="translate(97.000000, 8.000000)">
            <rect id="矩形" x="0" y="0" width="16" height="16" />
            <g id="编组-22" transform="translate(1.250000, 4.000000)" fillRule="nonzero">
              <path
                d="M7,6.66666667 L7,8 L0,8 L0,6.66666667 L7,6.66666667 Z M5.6,4 L5.6,5.33333333 L0,5.33333333 L0,4 L5.6,4 Z M4.2,1.33333333 L4.2,2.66666667 L0,2.66666667 L0,1.33333333 L4.2,1.33333333 Z"
                id="形状结合"
                fillOpacity="0.85"
                fill="#000000"
              />
              <polygon
                id="形状结合-path"
                className={styles['sort-icon-color']}
                // fill="#36C2CF"
                transform="translate(10.000000, 4.000000) scale(1, -1) translate(-10.000000, -4.000000) "
                points="10 0 13.5 4 10.7 4 10.7 8 9.3 8 9.3 4 6.5 4"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function SortAscendingIcon() {
  return (
    <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1">
      <title>icon-ascending</title>
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-97.000000, -8.000000)">
          <g id="icon-ascending" transform="translate(97.000000, 8.000000)">
            <rect id="矩形" x="0" y="0" width="16" height="16" />
            <g id="编组-22" transform="translate(1.250000, 4.000000)" fillRule="nonzero">
              <path
                d="M7,6.66666667 L7,8 L0,8 L0,6.66666667 L7,6.66666667 Z M5.6,4 L5.6,5.33333333 L0,5.33333333 L0,4 L5.6,4 Z M4.2,1.33333333 L4.2,2.66666667 L0,2.66666667 L0,1.33333333 L4.2,1.33333333 Z"
                id="形状结合"
                fillOpacity="0.85"
                fill="#000000"
              />
              <polygon
                id="形状结合-path"
                className={styles['sort-icon-color']}
                // fill="#36C2CF"
                points="10 0 13.5 4 10.7 4 10.7 8 9.3 8 9.3 4 6.5 4"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export { SortDescendingIcon, SortAscendingIcon };
