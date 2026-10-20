import React, { PureComponent, Fragment } from 'react';
import { Icon, Affix, Anchor } from 'hzero-ui';
// import { Anchor } from 'choerodon-ui';
import intl from 'utils/intl';
import styles from './index.less';

const prefix = `ssta.common.view.panel`;

export default class RectificationAnchor extends PureComponent {
  state = {
    isShow: true,
  };

  render() {
    const { isShow } = this.state;
    const { onGetAffixContainer } = this.props;
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
              <Affix target={onGetAffixContainer}>
                <Anchor getContainer={onGetAffixContainer} offsetTop={24}>
                  <Anchor.Link
                    href="#baseInfo"
                    title={intl.get(`${prefix}.panel.baseInfo`).d('基本信息')}
                  />
                  <Anchor.Link
                    href="#transaction"
                    title={intl.get(`${prefix}.panel.transaction`).d('交易方信息')}
                  />
                  <Anchor.Link
                    href="#amount"
                    title={intl.get(`${prefix}.panel.amount`).d('交易金额信息')}
                  />
                  <Anchor.Link
                    href="#detail"
                    title={intl.get(`${prefix}.panel.detail`).d('交易明细信息')}
                  />
                  <Anchor.Link
                    href="#strategy"
                    title={intl.get(`${prefix}.panel.strategy`).d('主策略信息')}
                  />
                  <Anchor.Link
                    href="#direct"
                    title={intl.get(`${prefix}.panel.direct`).d('直连开票信息')}
                  />
                  <Anchor.Link
                    href="#other"
                    title={intl.get(`${prefix}.panel.other`).d('其他信息')}
                  />
                </Anchor>
              </Affix>
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
