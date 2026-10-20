import React from 'react';
import { Form, DatePicker, TextField } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default function SlientSignModal(props) {
  const { dataSet } = props;

  return (
    <div className={styles['slient-sign-modal-basic']}>
      <Alert
        message={intl
          .get('spfm.buyerElectronicSign.view.message.signModalAlertMsg')
          .d(
            '请确认静默签授权企业及经办人，并正确填写授权印章编号、授权失效时间。注意，授权经办人必须是法定代表人或签章平台企业管理员，其他角色无权限进行授权。'
          )}
        type="success"
        closable
      />
      <div
        style={{
          padding: '0 20px 20px 20px',
          marginTop: '16px',
        }}
      >
        <Form dataSet={dataSet} columns={1} labelLayout="float">
          <TextField name="sealNumber" />
          <DatePicker name="authEndTime" />
          <TextField name="authBusiness" disabled />
          <TextField name="authedBusiness" disabled />
          <TextField name="doUser" disabled />
        </Form>
      </div>
    </div>
  );
}
