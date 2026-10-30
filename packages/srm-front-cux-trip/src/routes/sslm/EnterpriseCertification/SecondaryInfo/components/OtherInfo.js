/**
 * OtherInfo - 其他补充信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import styles from '../../index.less';

export default class OtherInfo extends Component {
  componentDidMount() {
    const { changeReqId, dataSet } = this.props;
    if (changeReqId) {
      dataSet.setQueryParameter('changeReqId', changeReqId);
      dataSet.query();
    }
  }

  render() {
    const { dataSet, isEdit, customizeForm = () => {}, configInfo = {} } = this.props;
    const { remark } = configInfo;
    return (
      <Content>
        <div className={styles['certification-title']} id="sslm_sup_change_other">
          {intl.get('spfm.enterpriseCertification.view.title.otherInfo').d('其他信息')}
        </div>
        {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
        {customizeForm(
          {
            code: 'SSLM.ENTERPRISE_CERTIFICATION.SECONDARY_OTHER_INFO',
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !isEdit,
            enableReLoad: false,
          },
          <Form
            dataSet={dataSet}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={classnames({
              'c7n-pro-vertical-form-display': !isEdit,
            })}
            style={{ width: '75%', maxWidth: 1172 }}
          />
        )}
      </Content>
    );
  }
}
