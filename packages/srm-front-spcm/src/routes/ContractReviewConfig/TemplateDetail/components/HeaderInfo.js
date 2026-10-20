/*
 * DetailHeader - 基础信息
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';

import intl from 'utils/intl';

import GeneralForm from '@/routes/components/GeneralForm';
import StatusTag from '@/routes/components/StatusTag';


const DetailHeader = ({ dataSet, custLoading, customizeForm, isEdit=false, formCode = "" }) => {
  const fields = [
    {
      name: 'reviewTemplateCode',
    },
    {
      name: 'reviewTemplateName',
      componentType: "INTLFIELD",
    },
    {
      name: 'templateStatus',
      renderer: ({ value, record }) => (
        <StatusTag text={record?.get('templateStatusMeaning')} value={value} />
      ),
    },
    {
      name: 'versionNumber',
    },
    {
      name: 'createdByName',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'reviewTemplateDesc',
      componentType: "TEXTAREA",
      colSpan: 2,
    },
  ];
  return (
    <div className="card-content-wrap">
      <div className="card-content">
        <div className="card-content-title">
          {intl.get('spcm.common.view.title.baseInfo').d('基础信息')}
        </div>
        <GeneralForm
          dataSet={dataSet}
          isEdit={isEdit}
          fields={fields}
          customizeForm={customizeForm}
          customizeUnitCode={formCode}
          custLoading={custLoading}
          readOnlyFlag={!isEdit}
        />
      </div>
    </div>
  );
};

export default DetailHeader;
