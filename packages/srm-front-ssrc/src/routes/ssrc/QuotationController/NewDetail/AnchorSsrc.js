import React, { Component } from 'react';
import { Icon, Anchor } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';

import styles from './index.less';

const { Link } = Anchor;

export default class AnchorSsrc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorShow: true,
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

  render() {
    const {
      header,
      currentOffsetTop = null,
      currentAnchorContainer = () =>
        document.getElementsByClassName('page-content-wrap')[0] || document.body,
    } = this.props;
    const { anchorShow = true } = this.state;

    return (
      <div
        className={classnames(styles['page-anchor-container'], {
          // [styles['toggle-show']]: !anchorShow,
        })}
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
            // affix={false}
            offsetTop={currentOffsetTop || 150}
            getContainer={currentAnchorContainer}
          >
            <Link
              href="#rfxBasicInfo"
              title={intl.get('ssrc.inquiryHall.view.inquiryHall.rfxBasicInfo').d('询价基础信息')}
            />
            <Link
              href="#rfxItemLines"
              title={intl.get('ssrc.inquiryHall.view.inquiryHall.rfxItemLines').d('询价标的物')}
            />
            {header?.rfxHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE' && (
              <Link
                href="#supplierWithRequest"
                title={intl
                  .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
                  .d('对供应商要求')}
              />
            )}

            <Link
              href="#rfxDeamnd"
              title={intl.get('ssrc.inquiryHall.view.inquiryHall.rfxDeamnd').d('询价要求')}
            />
          </Anchor>
        </div>
      </div>
    );
  }
}
