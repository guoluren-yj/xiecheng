/**
 * 语言切换
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import './index.less';
import intl from '../../../utils/intl';
import { Icon } from 'hzero-ui';

class DefaultLicenseTip extends React.PureComponent {
  render() {
    const { license, user } = this.props;
    const { status, limitStatus, subsStatus, limitTime, machineOut, tenantSubs } = license || {};
    const { subsStartDate, subsEndDate, subsLimitDate } = tenantSubs || {};
    if (!status) {
      return (
        <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-warn')}>
          <Icon type="exclamation-circle" />
          <span className="hzero-common-layout-tips-text">
            {intl
              .get('hzero.common.view.message.license.unauthorized.tip1')
              .d('系统使用未授权，为了不影响您的使用，请尽快获取有效授权码')}
          </span>
        </div>
      );
    }
    switch (status) {
      case 'unauthorized':
        const { machineCode, graceTime } = machineOut || {};
        const machineCodeTxt = (machineCode || []).join('、');
        return (
          <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-warn')}>
            <Icon type="exclamation-circle" />
            <span className="hzero-common-layout-tips-text">
              {intl
                .get('hzero.common.view.message.license.unauthorized', {
                  code: machineCodeTxt,
                  day: graceTime,
                })
                .d('系统授权未过期，但机器码{code}未授权，{day}天后该节点不可使用，请尽快获取有效授权码')}
            </span>
          </div>
        );
      case 'warn':
        return (
          <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-warn')}>
            <Icon type="exclamation-circle" />
            <span className="hzero-common-layout-tips-text">
              {intl
                .get('hzero.common.view.message.license.warn', {
                  time: limitTime,
                })
                .d('系统授权已过期，系统截止使用日期：{time}，为了不影响您使用，请尽快获取有效授权码')}
            </span>
          </div>
        );
      case 'limit':
        if (limitStatus === 'limit_with_machine_out') {
          const machineCodeTxt = (machineOut.machineCode || []).join('、');
          return (
            <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-error')}>
              <Icon type="close-circle" />
              <span className="hzero-common-layout-tips-text">
                {intl
                  .get('hzero.common.view.message.license.limit.tip1', {
                    code: machineCodeTxt,
                  })
                  .d('系统授权已过期，且机器码{code}未授权，节点不可使用，请尽快获取有效授权码')}
              </span>
            </div>
          );
        } else if (limitStatus === 'limit_not_but_machine_out') {
          const machineCodeTxt = (machineOut.machineCode || []).join('、');
          return (
            <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-error')}>
              <Icon type="close-circle" />
              <span className="hzero-common-layout-tips-text">
                {intl
                  .get('hzero.common.view.message.license.limit.tip3', {
                    code: machineCodeTxt,
                  })
                  .d('系统已授权，但机器码{code}未授权，节点不可使用，请尽快获取有效授权码')}
              </span>
            </div>
          );
        } else {
          return (
            <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-error')}>
              <Icon type="close-circle" />
              <span className="hzero-common-layout-tips-text">
                {intl
                  .get('hzero.common.view.message.license.limit.tip2')
                  .d('当前授权码已过期，为了不影响您的使用，请尽快获取有效授权码')}
              </span>
            </div>
          );
        }
      default: ;
    }
    switch (subsStatus) {
      case 'INVALID': return (
        <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-warn')}>
          <Icon type="exclamation-circle" />
          <span className="hzero-common-layout-tips-text">
            {
              intl
                .get('hzero.common.view.message.license.subs.tip1', {
                  tenantNum: String(user.tenantNum || ""),
                  subsLimitDate: String(subsLimitDate || ""),
                })
                .d('{tenantNum}租户订阅已到期，系统截止使用日期：{subsLimitDate}，请尽快联系管理员或者甄云服务人员购买服务！')
            }
          </span>
        </div>
      );
      case 'LIMIT': return (
        <div className={classnames('hzero-common-layout-tips', 'hzero-common-layout-tips-error')}>
          <Icon type="close-circle" />
          <span className="hzero-common-layout-tips-text">
            {
              intl
                .get('hzero.common.view.message.license.subs.tip2', {
                  tenantNum: String(user.tenantNum || ""),
                })
                .d('{tenantNum}租户订阅授权已过期，无法继续使用，请及时联系管理员或者甄云服务人员购买服务！')
            }
          </span>
        </div>
      );
      default:;
    }
    return null;
  }
}

export default connect(({ global = {}, user }) => ({
  license: global.license, // 证书
  user: user.currentUser || {},
}))(DefaultLicenseTip);
