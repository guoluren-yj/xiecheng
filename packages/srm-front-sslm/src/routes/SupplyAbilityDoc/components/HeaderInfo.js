/**
 * HeaderInfo - 供货能力申请单-头信息
 * @date: 2024-05-31
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment } from 'react';
import { useObserver } from 'mobx-react-lite';

import intl from 'utils/intl';

import GeneralForm from '@/routes/components/GeneralForm';
import { renderStatus } from '@/routes/components/utils';

const HeaderInfo = ({
  isPub,
  remote,
  dataSet,
  headerInfo,
  custLoading = false,
  customizeForm,
  customizeUnitCode,
  isEdit,
}) => {
  const initiateCamp = useObserver(() => dataSet?.current?.get('initiateCamp'));
  const purchaserCreateFlag = initiateCamp === '0';

  const getFields = () => {
    const fields = [
      {
        name: 'abilityReqNum',
      },
      {
        name: 'abilityReqStatus',
        componentType: 'SELECT',
        hidden: false,
        renderer: renderStatus,
      },
      {
        name: 'initiateCamp',
        componentType: 'SELECT',
      },
      {
        name: 'supplierCompanyId',
        componentType: 'LOV',
      },
      {
        name: 'companyId',
        componentType: 'LOV',
      },
      {
        name: 'companyIds',
        componentType: 'LOV',
      },
      {
        name: 'createdUserName',
      },
      {
        name: 'creationDate',
        componentType: 'DATETIMEPICKER',
      },
      {
        name: 'stageDescription',
        hidden: !purchaserCreateFlag,
      },
      {
        name: 'remark',
        componentType: 'TEXTAREA',
        newLine: true,
        resize: 'vertical',
        rowSpan: 2,
      },
    ];
    return fields;
  };

  const readOnlyFlag = remote
    ? remote.process(
        'SSLM_PURCHASER_SUPPLY_ABILITY_DOC_DETAIL_HEADER_INFO_READ_ONLY_FLAG',
        !isEdit,
        { isPub, dataSet, headerInfo }
      )
    : !isEdit;

  return (
    <Fragment>
      <div className="card-content">
        <div className="card-content-title">
          {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
        </div>
        <GeneralForm
          dataSet={dataSet}
          fields={getFields()}
          columns={3}
          isEdit={isEdit}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeUnitCode={customizeUnitCode}
          readOnlyFlag={readOnlyFlag}
        />
      </div>
    </Fragment>
  );
};

export default HeaderInfo;
