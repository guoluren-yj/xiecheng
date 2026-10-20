/**
 * 我发出的邀约上面的部分
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Tag, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

// import picture from '@/assets/illustrate-cooperation.png';
import styles from '../index.less';

/**
 * 我发出的邀约上面的部分
 * @extends {Component} - React.Component
 * @reactProps {String} companyName公司名
 * @reactProps {Boolean} isSupplier true-我是供应商
 * @reactProps {Date} invitingTime邀请时间
 * @reactProps {String} inviteRemark邀请备注
 * @reactProps {String} status send 我发出 received 我收到
 * @return React.element
 */
export default class SendTop extends React.Component {
  /**
   * 打开侧边模态框
   */
  @Bind()
  showModal() {
    this.props.onShowDrawer();
  }

  // 显示拒绝弹窗

  render() {
    const { isSupplier, invitingInfo = {}, inviteReg = {}, CusForm, status, pStatus } = this.props;
    return (
      <div className={styles['agree-top']}>
        <div className={styles['agree-word']}>
          {/* 判断是供应商还是客户 */}
          {isSupplier ? (
            <p style={{ fontSize: 16 }}>
              {intl.get(`spfm.disposeInvite.view.message.turnTo`).d('我向')}
              <span onClick={this.showModal} style={{ paddingLeft: 5 }} className={styles.company}>
                {invitingInfo.companyName}
              </span>
              {intl
                .get(`spfm.disposeInvite.view.message.regiserTopOne`)
                .d('发出注册邀约，邀请它成为我的【客户】')}
            </p>
          ) : (
            <p style={{ fontSize: 16 }}>
              {intl
                .get(`spfm.disposeInvite.view.message.turnToCertificated`)
                .d('我邀请的供应商企业')}
              <span style={{ padding: '0 5px' }} className={styles.company}>
                {inviteReg.supplierName}
              </span>
              {intl.get(`spfm.disposeInvite.view.message.certificatedTopTwo`).d('已完成企业认证')}
            </p>
          )}
          <CusForm dataSource={invitingInfo} status={status} pStatus={pStatus} />
          <React.Fragment>
            {invitingInfo.processStatus === 'CERTIFICATED' && (
              <Tag color="green">
                <Icon type="check-circle" theme="filled" className={styles.tag} />
                {intl.get(`spfm.disposeInvite.view.message.tag.certificated`).d('已完成企业认证')}
              </Tag>
            )}
          </React.Fragment>
        </div>
        {/* <div>
          <img src={picture} alt="" />
        </div> */}
      </div>
    );
  }
}
