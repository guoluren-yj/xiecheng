import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import styles from './index.less';

export default class RightClickMenu extends Component {
  constructor(props) {
    super(props);
    if (typeof props.onRef === 'function') props.onRef(this);
    this.state = {
      left: 0,
      top: 0,
      visible: false,
      buttons: [],
    };
  }

  getTitleWidth = (title, fontSize = '14px') => {
    const text = document.createElement('div');
    text.style.visibility = 'hidden';
    text.style.position = 'absolute';
    text.style.left = '100px';
    text.style.fontSize = fontSize;
    text.innerText = title;
    document.body.appendChild(text);
    const width = text.clientWidth;
    document.body.removeChild(text);
    return width;
  };

  show = (e, buttons = []) => {
    const screenWidth = document.body.clientWidth;
    const screenHeight = document.body.clientHeight;
    let maxTitleWidth = 80;
    let x = e.clientX;
    let y = e.clientY;
    buttons.forEach((btn) => {
      const w = this.getTitleWidth(btn.title);
      maxTitleWidth = maxTitleWidth > w ? maxTitleWidth : w;
    });
    const allWidth = 15 * 2 + 14 + 8 + maxTitleWidth;
    const allHeight = buttons.length * 32 + 8;
    // 菜单往鼠标右侧显示超出屏幕宽度时
    if (x + allWidth > screenWidth) {
      x -= allWidth;
    }
    if (y + allHeight > screenHeight) {
      y = screenHeight - allHeight;
    }
    this.setState({
      visible: true,
      left: x,
      top: y,
      buttons,
    });

    window.addEventListener('click', this.touchStart, { passive: false });
  };

  touchStart = () => {
    this.dismiss();
  };

  dismiss = () => {
    if (!this.state.visible) return;
    this.setState({
      left: 0,
      top: 0,
      visible: false,
      buttons: [],
    });
    window.removeEventListener('click', this.touchStart);
  };

  render() {
    const { buttons, left, top, visible } = this.state;
    return (
      <div
        className={styles['smbl-right-click-menu']}
        style={{ left: `${left}px`, top: `${top}px`, display: visible ? 'block' : 'none' }}
      >
        {buttons.map((btn) => {
          return (
            <div
              className={styles['smbl-right-click-menu-item']}
              onClick={btn.onClick}
              key={btn.key}
            >
              <Icon className={styles['smbl-right-click-menu-item-icon']} type={btn.icon} />
              <span className={styles['smbl-right-click-menu-item-title']}>{btn.title}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
