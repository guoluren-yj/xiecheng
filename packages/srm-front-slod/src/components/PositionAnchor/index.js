/**
 * 平台组件---定位轴组件
 * 传入整个Link组件数组，生成定位轴数据，例如：
 *  [
 *    <Link href={`#${对应的标题id}`} title='一级标题'  />,
 *    <Link href={`#${对应的标题id}`} title='一级标题'>
 *      <Link href={`#${对应的标题id}`} title='二级标题'  />,
 *    </Link>,
 *    ...,
 * ]
 * 传入 currentAnchorContainer方法从而触发滚动过渡效果:
 * currentAnchorContainer={() => document.getElementsByClassName('page-container')[0] || document.body}
 */
import React, { Children, isValidElement, Component } from 'react';
import { Anchor, Icon, Tooltip } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import classnames from 'classnames';
import { withRouter } from 'dva/router';

import styles from './index.less';

const { Link } = Anchor;

/**
 * 气泡展示标题
 * @param {*} title 标题
 */
const AnchorToolTip = (title = null) => (
  <Tooltip placement="left" title={title} theme="dark">
    {title}
  </Tooltip>
);

const STORE_KEY = 'srm-side-anchor-visible';

@withRouter
export default class PositionAnchor extends Component {
  static Link = Link;

  static AnchorToolTip = AnchorToolTip;

  anchorRef = null;

  anchorContainerRef = null;

  saveRef = (e) => {
    this.anchorRef = e;
  };

  containerRef = (e) => {
    this.anchorContainerRef = e;
  };

  constructor(props) {
    super(props);
    const storedAnchorShow = localStorage.getItem(STORE_KEY);
    this.state = {
      anchorShow: storedAnchorShow !== '0',
      hiddenLinks: [],
    };
  }

  componentDidMount() {
    const { anchorContainerRef } = this;
    if (anchorContainerRef) {
      anchorContainerRef.style.display = 'none';
      setTimeout(() => {
        anchorContainerRef.style.display = '';
        this.updateHiddenLinks();
      }, 0);
    }
  }

  // 强行使用Anchor的handleScrollTo方法达到实现history回退记忆的目的
  componentWillReceiveProps(nextProps) {
    const { hash: nextHash } = nextProps.location;
    const { hash } = this.props.location;
    const { anchorRef } = this;
    if (anchorRef && nextHash !== hash) {
      anchorRef.handleScrollTo(nextHash);
    }
  }

  // 解决多页面切换下，hash锚点丢失导致定位图标消失的问题
  componentDidUpdate(prevProps) {
    const { anchorRef } = this;
    anchorRef.handleScroll();
    if (!this.compareLinks(prevProps.children || [])) {
      this.updateHiddenLinks();
    }
  }

  // 触发锚点展示
  @debounce(500)
  @Bind()
  toggleAnchor = () => {
    this.setState((preStaus) => {
      const anchorShow = !preStaus.anchorShow;
      localStorage.setItem(STORE_KEY, anchorShow ? '1' : '0');
      return {
        anchorShow,
      };
    });
  };

  updateHiddenLinks = () => {
    const { children = [] } = this.props;
    const hiddenLinks = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.props.href) {
        const newHref = child.props.href.replace('#', '');
        const ele = document.getElementById(newHref);
        if (!ele) hiddenLinks.push(child.props.href);
      }
    });
    this.setState({ hiddenLinks });
  };

  compareLinks = (prevChildren) => {
    const { children = [] } = this.props;
    const extractLinks1 = [];
    const extractLinks2 = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.props.href) {
        extractLinks1.push(child.props.href);
      }
    });
    Children.forEach(prevChildren, (child) => {
      if (isValidElement(child) && child.props.href) {
        extractLinks2.push(child.props.href);
      }
    });
    if (
      extractLinks1.length !== extractLinks2.length ||
      extractLinks1.some((v) => !extractLinks2.includes(v))
    ) {
      return false;
    }
    return true;
  };

  render() {
    const { children = [], currentOffsetTop = null, currentAnchorContainer, ...rest } = this.props;
    const { anchorShow = true, hiddenLinks } = this.state;
    const newChildren = [];
    //  Children.forEach(children, (child) => {
    //    if (
    //      hiddenLinks.length === 0 ||
    //      (isValidElement(child) && !hiddenLinks.includes(child.props.href))
    //    ) {
    //      newChildren.push(child);
    //    }
    //  });
    const childList = children.props ? children.props.children : [];
    childList.forEach((item) => {
      if (
        (item && hiddenLinks.length === 0) ||
        (isValidElement(item) && !hiddenLinks.includes(item.props.href))
      ) {
        const newHref = item.props.href.replace('#', '');
        const ele = document.getElementById(newHref);
        if (ele) {
          newChildren.push(item);
        }
      }
    });

    return (
      <div
        ref={this.containerRef}
        className={classnames(styles['page-anchor-container'], {
          [styles['page-anchor-container-collapse']]: !anchorShow,
        })}
      >
        <div className={styles['anchor-icon']} onClick={this.toggleAnchor}>
          <Icon
            type="baseline-arrow_right"
            className={anchorShow ? null : styles['anchor-icon-custom-left']}
          />
        </div>
        <div className={classnames(styles['anchor-content'])}>
          <Anchor
            affix={false}
            showInkInFixed
            offsetTop={currentOffsetTop || 150}
            getContainer={currentAnchorContainer}
            ref={this.saveRef}
            {...rest}
          >
            {newChildren}
          </Anchor>
        </div>
      </div>
    );
  }
}
