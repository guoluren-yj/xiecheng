/*
 * RestPolicy - 邀约,审批，实名认证
 * @date: 2022/06/06 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Content } from 'components/Page';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import InvitePolicy from './InvitePolicy';
import ApprovalPolicy from './ApprovalPolicy';
import CertificationPolicy from './CertificationPolicy';
import AffiliatePolicy from './AffiliatePolicy';
import DefaultPassword from './DefaultPassword';
import AccountVerificationPolicy from './AccountVerificationPolicy';

import styles from '../index.less';

export default class RestPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 获取配置页签
  @Bind()
  getTabList() {
    const { tabKey } = this.props;
    const inviteHidden = ['invitePolicy'].includes(tabKey);
    const otherHidden = ['otherInfo'].includes(tabKey);
    return [
      {
        PolicyComponent: InvitePolicy,
        hidden: otherHidden,
      },
      {
        PolicyComponent: ApprovalPolicy,
        hidden: otherHidden,
      },
      {
        PolicyComponent: AccountVerificationPolicy,
        hidden: inviteHidden,
      },
      {
        PolicyComponent: CertificationPolicy,
        hidden: inviteHidden,
      },
      {
        PolicyComponent: AffiliatePolicy,
        hidden: inviteHidden,
      },
      {
        PolicyComponent: DefaultPassword,
        hidden: inviteHidden,
      },
    ].filter(i => !i.hidden);
  }

  render() {
    const { dataSet = {}, isEdit } = this.props;
    const componentProps = {
      dataSet,
      isEdit,
    };
    const tabList = this.getTabList();
    return (
      <React.Fragment>
        {tabList.map(item => {
          const { PolicyComponent } = item;
          return (
            <Content
              className={classnames(
                styles['policy-content-card'],
                isEdit ? '' : styles['policy-content-card-view']
              )}
            >
              <PolicyComponent {...componentProps} />
            </Content>
          );
        })}
      </React.Fragment>
    );
  }
}
