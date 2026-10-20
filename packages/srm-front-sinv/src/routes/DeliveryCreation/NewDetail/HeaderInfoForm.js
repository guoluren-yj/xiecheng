import React, { Fragment } from 'react';
import {
  Form,
  Spin,
  TextArea,
  TextField,
  Select,
  DatePicker,
  DateTimePicker,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { Content } from 'components/Page';

import styles from './form.less';
import { showBigNumber } from '@/routes/components/utils';

const viewMessagePrompt = 'sinv.common.view.message';

const HeaderInfoForm = (props) => {
  const { headerFormDs, customizeForm } = props;
  return (
    <Fragment>
      <Spin dataSet={headerFormDs}>
        <Content style={{ marginBottom: 8, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 className={styles['page-title']}>
              {intl.get(`${viewMessagePrompt}.title.orderHeaderShipInfo`).d('发货信息')}
            </h3>
          </div>
          <div className={styles['form-info']}>
            {customizeForm(
              {
                code: 'SINV.DELIVERY_CREATION_DETAIL.HEADER',
                disableOutput: 'Output',
                __force_record_to_update__: true,
              },
              <Form labelLayout="float" dataSet={headerFormDs} columns={3}>
                <TextField disabled name="asnNum" />
                <TextField disabled name="asnTypeCodeMeaning" />
                <TextField disabled name="supplierCompanyName" />
                <TextField
                  disabled
                  name="immedShippedFlag"
                  renderer={({ value }) => {
                    if (+value === 1) {
                      return intl.get('hzero.common.button.yes').d('是');
                    } else if (+value === 0) {
                      return intl.get('hzero.common.button.no').d('否');
                    }
                  }}
                />
                <TextField disabled name="supplierSiteName" />
                <DatePicker name="shipDate" />
                <DateTimePicker name="expectedArriveDate" />
                <TextField
                  disabled
                  name="totalQuantity"
                  renderer={({ value }) => showBigNumber(value)}
                />
                <Select name="transportType" />
                <TextField
                  disabled
                  name="taxIncludedAmount"
                  renderer={({ value, record }) =>
                    showBigNumber(value, record && record.get('financialPrecision'))
                  }
                />
                <TextArea
                  name="remark"
                  newLine
                  resize="both"
                  colSpan={2}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                />
              </Form>
            )}
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export { HeaderInfoForm };
