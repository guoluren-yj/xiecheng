/*
 * PrivacyPolicy 隐私协议
 * @date: 2019/11/29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Icon, Modal, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

// import {
//   fetchPrivacyPolicy,
//   fetchPrivacyPolicyText,
// } from '@/services/supplierInviteManageServices';

export default class PrivacyPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privacyPolicyText: [],
    };
  }

  componentDidMount() {
    // this.handlePrivacyPolicy();
  }

  /**
   *  查询采购方是否启用合作条款
   */
  // @Bind()
  // handlePrivacyPolicy(tenantId, companyId) {
  //   fetchPrivacyPolicy({
  //     tenantId,
  //   }).then(res => {
  //     if (getResponse(res)) {
  //       if (res && res.settingValue === '1') {
  //         this.setState({
  //           // showStaticText: true,
  //         });
  //         this.handlePrivacyStaticTexts(tenantId, companyId);
  //       }
  //     }
  //   });
  // }

  /**
   *  查询静态文本
   */
  // @Bind()
  // handlePrivacyStaticTexts(tenantId, companyId) {
  //   const { dataSet } = this.props;
  //   fetchPrivacyPolicyText({
  //     companyId,
  //     partnerTenantId: tenantId,
  //     textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
  //   }).then(res => {
  //     if (getResponse(res)) {
  //       this.setState({
  //         privacyPolicyText: res,
  //       });
  //       dataSet.current.set({ policyIds: res });
  //     }
  //   });
  // }

  // 静态文本弹框回调
  @Bind()
  modalCallback(n, value) {
    const { dataSet } = this.props;
    this._modal.close();
    dataSet.current.set({ [`policy${n.textId}`]: value });
    // form.setFieldsValue({ [`policy${n.textId}`]: value });
  }

  // 静态文本弹框
  @Bind()
  onHandlePolicyModal(n) {
    this._modal = Modal.open({
      key: Modal.key(),
      title: n.title,
      autoCenter: true,
      closable: true,
      footer: null,
      style: { width: 1200 },
      bodyStyle: { paddingBottom: 0 },
      children: (
        <Fragment>
          <div dangerouslySetInnerHTML={{ __html: n.text || '' }} />
          <div
            style={{
              textAlign: 'right',
              padding: '12px 24px',
              margin: '0 -24px',
              borderTop: 'solid 1px #e0e0e0',
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={() => this.modalCallback(n, 0)}>
              {intl.get(`hzero.common.button.notAgree`).d('不同意')}
            </Button>
            <Button type="primary" onClick={() => this.modalCallback(n, 1)}>
              {intl.get(`hzero.common.button.agree`).d('同意')}
            </Button>
          </div>
        </Fragment>
      ),
    });
  }

  render() {
    const { privacyPolicyText = [], onHandlePolicyModal = () => {} } = this.state;
    return (
      <div style={{ marginBottom: 16, width: '80%' }}>
        <span style={{ fontWeight: 'bold' }}>
          {intl.get(`spfm.invitationList.view.message.readAndAgreed`).d('请阅读并同意')}
        </span>
        {privacyPolicyText.map(n => {
          return (
            <span style={{ marginLeft: 8 }}>
              <a onClick={() => onHandlePolicyModal(n)}>{`《${n.title}》`}</a>
              {
                <Icon
                  style={{ fontSize: 16, color: '#47B881', marginTop: -1 }}
                  type="check_circle"
                />
              }
            </span>
          );
        })}
      </div>
    );
  }
}
