/* AccountCheck - 对公账户打款
 * @Date: 2022-06-15 21:03:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField, Lov, SecretField } from 'choerodon-ui/pro';
import { Alert, Icon } from 'choerodon-ui';
import intl from 'utils/intl';

const AccountCheck = ({ dataSet }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <TextField name="bankName" />
      <Lov
        name="bankLov"
        tableProps={{
          pagination: false,
          buttons: [
            <Alert
              style={{
                marginTop: '16px',
                marginBottom: '16px',
                border: 'none',
                color: '#1983F5',
              }}
              message={intl
                .get(`spfm.enterpriseCertification.view.message.branchSearchTips`)
                .d('请输入详细的支行名称进行检索，下列将展示匹配度最高的20条记录。')}
              iconType="help"
              showIcon
              closeText={<Icon type="close" style={{ color: '#1983F5' }} />}
            />,
          ],
        }}
      />
      <SecretField name="bankAccountNum" />
    </Form>
  );
};

export default AccountCheck;
