import React, { Fragment } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { FormItem } from '@/routes/Components';

import intl from 'utils/intl';

export default (props) => {
  const { customizeForm, formDs } = props;

  return (
    <Fragment>
      {customizeForm(
        { code: 'SSTA.SUPPLIER_BILL_DETAIL.SETTLE_CONFIG', readOnly: true },
        <Form columns={3} useColon={false} dataSet={formDs} labelLayout="vertical">
          <FormItem name="settleConfigNum" />
          <FormItem name="settleConfigName" />
          <FormItem name="configVersionNumber" />
          <FormItem name="confirmCollaborativeModeMeaning" />
          <FormItem name="confirmApproveMethodMeaning" />
          <FormItem name="autoIssueMeaning" />
          <FormItem name="cancelCollaborativeModeMeaning" />
          <FormItem name="cancelApproveMethodMeaning" />
          <FormItem
            name="lineLimitQuantity"
            renderer={({ value, record }) => {
              return record?.get('enableLineLimitFlag')
                ? value
                : intl.get('ssta.reconciliationWorkbench.view.message.noLimit').d('无限制');
            }}
          />
          <Output name="showUxFlag" />
          <FormItem name="eSignFlag" />
        </Form>
      )}
    </Fragment>
  );
};
