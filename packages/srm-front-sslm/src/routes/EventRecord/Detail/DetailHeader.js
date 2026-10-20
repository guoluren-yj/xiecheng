/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React from 'react';

import { renderStatus } from '@/routes/components/utils';
import GeneralForm from '@/routes/components/GeneralForm';
import '@/routes/index.less';

const DetailHeader = ({ header, isEdit, custLoading, customizeForm }) => {
  const fields = [
    {
      name: 'evalEventNumber',
    },
    {
      name: 'eventDesc',
      clearButton: true,
    },
    {
      name: 'eventStatus',
      componentType: 'SELECT',
      renderer: renderStatus,
    },
    {
      name: 'companyIdLov',
      componentType: 'LOV',
    },
    {
      name: 'ouId',
      componentType: 'LOV',
    },
    {
      name: 'supplierTenantIdLov',
      componentType: 'LOV',
    },
    {
      name: 'createUserName',
    },
    {
      name: 'eventType',
      componentType: 'SELECT',
    },
    {
      name: 'eventDate',
      componentType: 'DATETIMEPICKER',
    },
    {
      name: 'creationDate',
      componentType: 'DATETIMEPICKER',
    },
    {
      name: 'remark',
      componentType: 'TEXTAREA',
      newLine: true,
      rows: 3,
      colSpan: 2,
      resize: 'vertical',
    },
  ];

  return (
    <GeneralForm
      dataSet={header}
      fields={fields}
      isEdit={isEdit}
      custLoading={custLoading}
      customizeForm={customizeForm}
      customizeUnitCode="SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER"
    />
  );
};
export default DetailHeader;
