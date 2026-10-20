import React, { Component } from 'react';
import classNames from 'classnames';

export const AnchorContext = React.createContext();

class Anchor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLink: '',
    };
  }

  animating = false;

  links = [];

  componentDidMount() {
    const container = this.getContainer();
    container.addEventListener('scroll', this.handleScroll);
    this.handleScroll();
  }

  /**
   * 获取容器
   * @returns
   */
  getContainer = () => {
    const { getContainer } = this.props;
    const container = (getContainer && getContainer()) || window;
    return container;
  };

  /**
   * 监听回调，设置当前的活动Link
   */
  handleScroll = () => {
    const { activeLink } = this.state;
    if (this.animating) {
      return;
    }
    const current = this.getCurrentAnchor();
    if (activeLink !== current) {
      this.setState({ activeLink: current });
    }
  };

  /**
   * 根据容器的滚动高度来计算当前活动Link的href
   * @returns
   */
  getCurrentAnchor = () => {
    const linkSections = [];
    this.links.forEach(link => {
      const target = document.getElementById(link);
      const top = this.getOffsetTop(target, this.getContainer());
      if (top < 5) {
        linkSections.push({
          link,
          top,
        });
      }
    });
    if (linkSections.length) {
      let maxItem = {};
      linkSections.forEach(item => {
        if (item.top > maxItem.top || -1) {
          maxItem = item;
        }
      });
      // const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
      return maxItem.link;
    }
    return '';
  };

  /**
   * 获取目标距容器顶部的距离
   * @param {*} target
   * @param {*} container
   * @returns
   */
  getOffsetTop = (target, container) => {
    if (!target) {
      return 0;
    }
    if (!target.getClientRects().length) {
      return 0;
    }
    const rect = target.getBoundingClientRect();
    return rect.top - container.getBoundingClientRect().top;
  };

  /**
   * 获取距离顶部的距离
   * @param {*} target
   * @param {*} top
   * @returns
   */
  getScroll = (target, top) => {
    if (typeof window === 'undefined') {
      return 0;
    }
    const prop = top ? 'pageYOffset' : 'pageXOffset';
    const method = top ? 'scrollTop' : 'scrollLeft';
    const isWindow = target === window;

    let ret = isWindow ? target[prop] : target[method];
    // ie6,7,8 standard mode
    if (isWindow && typeof ret !== 'number') {
      ret = document.documentElement[method];
    }
    return ret;
  };

  /**
   * 滚懂到指定href
   * @param {*} link
   * @param {*} container
   */
  scrollTo = (link, container, callback) => {
    const targetContainer = container;
    const targetElement = document.getElementById(link);
    const eleOffsetTop = this.getOffsetTop(targetElement, container);
    const scrollTop = this.getScroll(container, true);
    if (!targetElement) {
      return;
    }
    const targetScrollTop = scrollTop + eleOffsetTop;
    targetContainer.scrollTop = targetScrollTop;
    callback();
  };

  /**
   * 滚动到指定href
   */
  handleScrollTo = activeLink => {
    this.animating = true;
    this.setState({ activeLink });
    this.scrollTo(activeLink, this.getContainer(), () => {
      this.animating = false;
    });
  };

  render() {
    const { style, className, children } = this.props;
    const wrapperClass = classNames(className, `ant-anchor-wrapper`);
    const wrapperStyle = style;
    return (
      <AnchorContext.Provider
        value={{
          registerLink: link => {
            if (!this.links.includes(link)) {
              this.links.push(link);
            }
          },
          unregisterLink: link => {
            const index = this.links.indexOf(link);
            if (index !== -1) {
              this.links.splice(index, 1);
            }
          },
          activeLink: this.state.activeLink,
          scrollTo: this.handleScrollTo,
          onClick: this.props.onClick,
        }}
      >
        <div className={wrapperClass} style={wrapperStyle}>
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
}
export default Anchor;
