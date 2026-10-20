import React, { PureComponent, Fragment } from 'react';
import { Icon, Affix, Anchor } from 'hzero-ui';

import styles from './index.less';

/**
 * getAffixContainer-获取给 Affix 组件使用的元素
 * @return {HTMLElement}
 */

const getAffixContainer = () => {
  const parent = getParent(
    document.getElementById('sqam-audit8dnotPub-detail-content-inner-wrapper')
  );
  return parent || document.body;
};

/**
 * getParent-获取 dom 的parent
 * @param {HTMLElement} dom
 * @return {HTMLElement}
 */
const getParent = (dom) => {
  const parent = dom && dom.parentNode.parentNode;
  return parent && parent.nodeType !== 11 ? parent : null;
};

export default class RectificationAnchor extends PureComponent {
  state = {
    isShow: false,
  };

  render() {
    const { isShow } = this.state;
    const { linkList = [] } = this.props;
    return (
      <Fragment>
        <div
          className={styles['rectification-anchor']}
          style={{ right: isShow ? '120px' : '2px' }}
          onClick={() => this.setState({ isShow: !isShow })}
        >
          <Icon
            className="rectification-anchor-icon"
            type={isShow ? 'caret-right' : 'caret-left'}
          />
        </div>
        <div className={styles['rectification-anchor-container']}>
          {isShow && (
            <div className="rectification-anchor-wrapper">
              <Affix target={getAffixContainer}>
                <Anchor getContainer={getAffixContainer} offsetTop={24}>
                  {linkList.map((item) => {
                    const { key, title } = item;

                    return <Anchor.Link href={`#${key}`} title={title} />;
                  })}
                </Anchor>
              </Affix>
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
