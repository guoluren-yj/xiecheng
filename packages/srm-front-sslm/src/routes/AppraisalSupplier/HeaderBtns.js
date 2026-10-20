/*
 * @Date: 2023-11-03 09:09:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

const tenantId = getCurrentOrganizationId();

const HeaderBtns = ({ onExportParams }) => {
  const buttons = [
    {
      name: 'exportPro',
      btnComp: ExcelExportPro,
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/result/supplier/export`,
        queryParams: () => onExportParams(),
        buttonText: intl.get('hzero.common.button.export').d('导出'),
        templateCode: 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER_MANGE_LINE_EXPORT',
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    },
  ];

  return <DynamicButtons buttons={buttons} />;
};

export default HeaderBtns;
