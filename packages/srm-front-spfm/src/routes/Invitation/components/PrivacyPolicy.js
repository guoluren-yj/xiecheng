/*
 * PrivacyPolicy
 * @date: 2019/11/29
 * @author: <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

export default class PrivacyPolicy extends Component {
  render() {
    const {
      form = () => {},
      privacyPolicyText = [],
      onHandlePolicyModal = () => {},
      platformPolicyText = [],
    } = this.props;
    const hiddenFlag = isEmpty(privacyPolicyText) && isEmpty(platformPolicyText);
    return hiddenFlag ? null : (
      <div style={{ marginBottom: 16, width: '80%' }}>
        <span style={{ fontWeight: 'bold', color: 'red' }}>
          {intl.get(`spfm.invitationList.view.message.readAndAgreed`).d('请阅读并同意')}
        </span>
        {platformPolicyText.map((n) => {
          return form.getFieldDecorator(`policy${n.textId}`)(
            <span style={{ marginLeft: 8 }}>
              <a onClick={() => onHandlePolicyModal(n, 1)}>{`《${n.title}》`}</a>
              {!!form.getFieldValue(`policy${n.textId}`) && (
                <Icon
                  style={{ fontSize: 16, color: '#47B881', marginTop: -1 }}
                  type="check_circle"
                />
              )}
            </span>
          );
        })}
        {privacyPolicyText.map((n) => {
          return form.getFieldDecorator(`policy${n.textId}`)(
            <span style={{ marginLeft: 8 }}>
              <a onClick={() => onHandlePolicyModal(n)}>{`《${n.title}》`}</a>
              {!!form.getFieldValue(`policy${n.textId}`) && (
                <Icon
                  style={{ fontSize: 16, color: '#47B881', marginTop: -1 }}
                  type="check_circle"
                />
              )}
            </span>
          );
        })}
      </div>
    );
  }
}
