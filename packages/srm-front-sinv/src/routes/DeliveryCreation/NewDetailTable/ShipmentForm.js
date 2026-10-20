import React, { Fragment } from 'react';
import { Form, Spin, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content } from 'components/Page';

import styles from './form.less';

const viewMessagePrompt = 'sinv.common.view.message';

const ShipInfoForm = (props) => {
  const { shipmentFormDs, customizeForm } = props;

  return (
    <Fragment>
      <Spin dataSet={shipmentFormDs}>
        <Content style={{ marginTop: 0, marginBottom: 8, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 className={styles['page-title']}>
              {intl.get(`${viewMessagePrompt}.title.orderHeaderDispatchedInfo`).d('收货信息')}
            </h3>
          </div>
          <div className={styles['form-info']}>
            {customizeForm(
              {
                code: 'SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
                disableOutput: 'Output',
                __force_record_to_update__: true,
              },
              <Form labelLayout="float" dataSet={shipmentFormDs} columns={3}>
                <TextField disabled name="companyName" />
                <TextField disabled name="organizationName" />
                <TextField disabled name="shipToLocationAddress" />
                <TextField disabled name="actualReceiverName" />
                <TextField disabled name="contactInfo" />
              </Form>
            )}
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export { ShipInfoForm };
