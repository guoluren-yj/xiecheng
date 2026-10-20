import React, { Fragment } from 'react';

import { Form, TextField, Select, Lov } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';

import { Content } from 'components/Page';

import styles from './form.less';

const LogisticsForm = (props) => {
  const { logisticsFormDs, customizeForm } = props;
  return (
    <Fragment>
      <Alert
        banner
        type="success"
        showIcon={false}
        message={
          <div className={styles['add-log-alert']}>
            <div className={styles['add-log-icon']} />
            <div>
              {intl
                .get(`sinv.common.view.message.addLogistics.titleTooltip`)
                .d(
                  '提示：为配合第三方物流公司升级查询服务，让您更精准地获取物流信息，建议您维护 “收件人手机号” 信息，感谢您的理解'
                )}
            </div>
          </div>
        }
      />
      <Content style={{ marginBottom: 8, padding: 20 }}>
        <div className={styles['logistic-info']}>
          {customizeForm(
            {
              code: 'SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
              // disableOutput: 'Output',
              // __force_record_to_update__: true,
            },
            <Form labelLayout="float" columns={1} dataSet={logisticsFormDs}>
              <Lov
                name="logisticsCompany"
                // renderer={({ value, record }) => {
                //   if (value) {
                //     return record?.get('logisticsCompanyMeaning');
                //   }
                // }}
              />
              <TextField name="logisticsStaff" />
              <TextField name="shipToLocationAddress" />
              <TextField name="logisticsCost" />
              <TextField name="expressNum" />
              <TextField
                name="logisticsPhoneNum"
                pattern={/1[3-9]\d{9}/g}
                addonBefore={<Select name="internationalTelCode" />}
              />
              <TextField name="carNumber" />
            </Form>
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export { LogisticsForm };
