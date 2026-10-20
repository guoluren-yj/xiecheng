/* 列表头按钮组
 * @Date: 2024-05-30 13:38:15
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const HeaderBtns = observer(({ handleExportParams = () => {} }) => {
  const buttons = [
    {
      name: 'excelExport',
      btnComp: ExcelExportPro,
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/sup/detail-post-export`,
        queryParams: () => handleExportParams(),
        method: 'POST',
        allBody: true,
        buttonText: intl.get('hzero.common.button.export').d('导出'),
        templateCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY_NEW_DETAIL_SUP',
        otherButtonProps: {
          icon: 'unarchive',
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    },
  ];
  return <DynamicButtons buttons={buttons} maxNum={5} trigger="hover" defaultBtnType="c7n-pro" />;
});

export default HeaderBtns;
