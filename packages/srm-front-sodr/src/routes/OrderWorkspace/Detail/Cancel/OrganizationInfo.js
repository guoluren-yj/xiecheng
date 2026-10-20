/*
 * OrganizationInfo - 订单明细页-交易方及采买组织信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

const OrganizationInfo = (props) => {
  const { ds, customizeForm } = props;
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_CANCEL_DETAIL.ORGANIZATIONINFO',
    },
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="companyName" />
      <Output
        name="supplierName"
        renderer={({ record }) => record.get('supplierName') || record.get('supplierCompanyName')}
      />
      <Output name="ouName" />
      <Output name="purchaseOrgName" />
      <Output name="agentName" />
      {/* 默认隐藏字段 */}
      <Output name="settleCompanyName" />
      <Output
        name="settleSupplierName"
        newLine
        renderer={({ record }) =>
          record.get('settleErpSupplierName') || record.get('settleSupplierName')
        }
      />
      <Output name="supplierSiteName" />
      <Output name="supplierContactName" />
      <Output name="supplierContactTelNum" />
    </Form>
  );
};

export default OrganizationInfo;
