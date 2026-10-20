import React, { Component } from 'react';
import { Icon, Anchor } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import classnames from 'classnames';

import styles from './index.less';

const { Link } = Anchor;

export default class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorShow: false,
    };
  }

  // 触发锚点展示
  @debounce(500)
  @Bind()
  toggleAnchor = () => {
    this.setState((preStaus) => {
      return {
        anchorShow: !preStaus.anchorShow,
      };
    });
  };

  currentAnchorContainer = () => {
    const container = document.getElementsByClassName('c7n-pro-modal-body')[0] || document.body;
    console.log(container);
    return container;
  }

  render() {
    const {
      currentOffsetTop = null,
      linkList,
    } = this.props;
    const { anchorShow = true } = this.state;

    return (
      <div
        className={classnames(styles['page-anchor-container'], {})}
        style={{ right: anchorShow ? '32px' : '-220px' }}
      >
        <div className={styles['anchor-icon']} onClick={this.toggleAnchor}>
          <Icon
            type="baseline-arrow_right"
            className={anchorShow ? null : styles['anchor-icon-custom-left']}
            style={{ fontSize: '12px' }}
          />
        </div>
        <div className={classnames(styles['anchor-content'])}>
          <Anchor
            offsetTop={currentOffsetTop || 10}
            getContainer={this.currentAnchorContainer}
            getCurrentAnchor={`#${linkList?.[0].templateId}`}
          >
            {linkList?.map((item) => (
              <Link href={`#${item.templateId}`} title={item.templateName} />
            ))}
          </Anchor>
        </div>
      </div>
    );
  }
}
