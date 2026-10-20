/**
 * HeaderInfo - 采购财务头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

const HeaderInfo = ({ dataSet, customizeForm, custLoading }) => {
  return customizeForm(
    {
      code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.PURCHASE_HEADER',
      readOnly: false,
    },
    <Form
      dataSet={dataSet}
      columns={3}
      labelLayout="vertical"
      custLoading={custLoading}
      className="c7n-pro-vertical-form-display"
      style={{ marginBottom: 16 }}
    >
      <Output
        name="programmeGroups"
        renderer={({ record }) => {
          const value = (record && record.get('programmeGroupsMeaning')) || '';
          return value;
        }}
      />
      <Output name="schemeGroup" />
      <Output
        name="accountGroup"
        renderer={({ record }) => {
          const value = (record && record.get('accountGroupMeaning')) || '';
          return value;
        }}
      />

      <Output
        name="reconciliationAccount"
        renderer={({ record }) => {
          const value = (record && record.get('reconciliationAccountMeaning')) || '';
          return value;
        }}
      />
      <Output
        name="ouId"
        renderer={({ record }) => {
          const value = (record && record.get('ouCode')) || '';
          return value;
        }}
      />
      <Output
        name="termId"
        renderer={({ record }) => {
          const value = (record && record.get('termName')) || '';
          return value;
        }}
      />

      <Output
        name="frozenFlag"
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
      />
      <Output
        name="paymentFrozen"
        renderer={({ record }) => {
          const value = (record && record.get('paymentFrozenMeaning')) || '';
          return value;
        }}
      />
    </Form>
  );
};

export default HeaderInfo;
