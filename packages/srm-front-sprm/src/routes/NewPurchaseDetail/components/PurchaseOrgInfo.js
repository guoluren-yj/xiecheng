/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-02-24 19:17:29
 */
import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Store } from '../stores';

const PurchaseOrgInfo = function PurchaseOrgInfo({ code }) {
  const { headerDs, customizeCollapseForm } = useContext(Store);

  const form = customizeCollapseForm(
    {
      code,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      useWidthPercent
      className="c7n-pro-vertical-form-display"
    >
      <Output name="companyName" />
      <Output name="ouName" />
      <Output name="purchaseOrgName" />
      <Output name="purchaseAgentName" />
    </Form>
  );

  return form;
};

export default PurchaseOrgInfo;
