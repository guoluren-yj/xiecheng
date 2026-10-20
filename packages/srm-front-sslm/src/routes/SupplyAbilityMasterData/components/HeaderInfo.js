/**
 * HeaderInfo - 供货能力主数据-头信息
 * @date: 2024-05-31
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment } from 'react';

import intl from 'utils/intl';

import GeneralForm from '@/routes/components/GeneralForm';

const HeaderInfo = ({
  dataSet,
  custLoading = false,
  customizeForm,
  code = '',
  pageSource = 'purchaser',
}) => {
  const getFields = () => {
    const fields = [
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'supplierCompanyNum',
      },
      {
        name: 'companyName',
      },
      {
        name: 'stageDescription',
        hidden: pageSource === 'supplier',
      },
    ];
    return fields;
  };

  return (
    <Fragment>
      <div className="card-content">
        <div className="card-content-title">
          {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
        </div>
        <GeneralForm
          dataSet={dataSet}
          fields={getFields()}
          isEdit={false}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeUnitCode={code}
          readOnlyFlag={false}
        />
      </div>
    </Fragment>
  );
};

export default HeaderInfo;
