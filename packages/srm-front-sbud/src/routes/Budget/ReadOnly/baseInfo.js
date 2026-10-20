/*
 * @Descripttion: 
 * @version: 
 * @Author: yanglin
 * @Date: 2023-10-09 16:21:42
 * @LastEditors: yanglin
 * @LastEditTime: 2023-10-27 14:55:55
 */
import React, { useContext } from 'react';
import { Output, Form, Row } from 'choerodon-ui/pro';
import { colorRender } from '../hook';

import { Store } from '../stores/storeProvider';

const BaseInfo = function BaseInfo() {
  const { headerDs, budgetHeaderStatus, setFormFieldsHiddenObj } = useContext(Store);

  const form = (
    <Form
      useWidthPercent
      dataSet={headerDs}
      showLines={6}
      columns={3}
      useColon={false}
      labelLayout="vertical"
      labelAlign="left"
      className="c7n-pro-vertical-form-display"
    >
      <Output name="budgetNum" />
      <Output name="budgetHeaderDesc" />
      <Output name="budgetTemplateCode" />

      <Output name="periodNum" />
      <Output name="validityDate" />

      {!['NEW', 'REJECT', 'APPROVING', 'APPROVED'].includes(budgetHeaderStatus) && (
        <>
          <Output name="adjustPeriodNum" />
          <Output name="adjustValidityDate" />
        </>
      )}

      <Output
        name="budgetHeaderStatusMeaning"
        renderer={({ value, record }) => colorRender(record?.get('budgetHeaderStatus'), value)}
      />
      <Output name="responsibleId" />
      {!setFormFieldsHiddenObj?.hiddenCreatedBy && <Output name="createdByName" />}
      <Output name="creationDate" />
      <Output name="version" />
    </Form>
  );

  return <Row>{form}</Row>;
};

export default BaseInfo;
