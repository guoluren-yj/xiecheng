/*
 * @Date: 2023-05-17 09:54:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';

const Detail = ({ dataSet, custLoading, customizeForm, changeLevel }) => {
  const companyHiddenFlag = ['GROUP'].includes(changeLevel);
  const fields = [
    {
      name: 'changeReqNumber',
    },
    {
      name: 'createUserRealName',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'reqStatus',
      renderer: renderStatus,
    },
    {
      name: 'changeLevel',
    },
    {
      name: 'companyName',
      hidden: companyHiddenFlag,
    },
    {
      name: 'companyIds',
      hidden: !['COMPANY'].includes(changeLevel),
    },
    {
      name: 'supplierLov',
    },
    {
      name: 'purchaseAgentId',
      renderer: ({ value, record, name }) => {
        return (
          <span style={{ color: record.get(`${name}Flag`) === 'UPDATE' && 'red' }}>
            {value && value.purchaseAgentName}
          </span>
        );
      },
    },
    {
      name: 'investigateTemplateId',
      renderer: ({ record, name }) => {
        return (
          <span style={{ color: record.get(`${name}Flag`) === 'UPDATE' && 'red' }}>
            {record.get('templateName')}
          </span>
        );
      },
    },
    {
      name: 'remark',
      newLine: true,
    },
    {
      name: 'attachmentUuid',
      newLine: true,
    },
  ];

  return customizeForm(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC',
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Form
      columns={3}
      dataSet={dataSet}
      labelLayout="vertical"
      custLoading={custLoading}
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => (
        <Output {...field} />
      ))}
    </Form>
  );
};

export default Detail;
