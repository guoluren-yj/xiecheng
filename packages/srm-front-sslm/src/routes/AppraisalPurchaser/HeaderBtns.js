/*
 * @Date: 2023-11-03 09:09:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const btnsPermissions = [
  {
    name: 'detailExport',
    code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.detail-export',
    meaning: '明细导出',
  },
  {
    name: 'export',
    code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.all-export',
    meaning: '整单导出',
  },
];

const HeaderBtns = ({ dataSet, onCreate, activeKey, remoteProps }) => {
  // 获取导出参数
  const getQueryParams = () => {
    const queryParams = dataSet?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject(queryParams);
  };

  const exportUrl = useMemo(
    () =>
      activeKey === 'detailAll'
        ? 'eval-headers/eval-manage/result-detail/export'
        : 'eval-headers/eval-manage/all/export',
    [activeKey]
  );

  const buttons = [
    {
      name: 'create',
      child: intl.get(`hzero.common.button.create`).d('新建'),
      btnProps: {
        icon: 'add',
        color: 'primary',
        onClick: onCreate,
      },
    },
    {
      name: activeKey === 'detailAll' ? 'detailExport' : 'export',
      btnComp: ExcelExportPro,
      hidden: !['all', 'detailAll'].includes(activeKey),
      btnProps: {
        queryParams: () => getQueryParams(),
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/${exportUrl}`,
        buttonText: intl.get('hzero.common.button.export').d('导出'),
        templateCode: 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER_EVAL_MANAGE_ALL_EXPORT',
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    },
  ];

  const newAllBtns = remoteProps
    ? remoteProps.process('SSLM_APPRAISAL_PURCHASER_LIST_BUTTONS', buttons, { dataSet })
    : buttons;
  return (
    <DynamicButtons buttons={newAllBtns} defaultBtnType="c7n-pro" permissions={btnsPermissions} />
  );
};

export default HeaderBtns;
