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
import CommonImport from 'components/Import';

const organizationId = getCurrentOrganizationId();
const permissionList = [
  {
    name: 'batchUpdateImport',
    code: 'srm.partner.supply-ability-query-purchaser.api.updateImport',
    meaning: '批量更新导入',
  },
];

const HeaderBtns = observer(
  ({ remote, dataSet, dimension, customizeBtnGroup, handleExportParams = () => {} }) => {
    const supplierDimension = dimension === 'SUPPLIER';
    const btns = [
      {
        name: 'batchCreateImport',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl.get('sslm.common.button.batchCreateImport').d('批量新增导入'),
          buttonTooltip: intl
            .get('sslm.supplyAbility.button.batchCreateImportTip')
            .d('本模板仅支持批量新增供货能力行，不支持更新已有供货能力行'),
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SSLM_SUPPLY_ABILITY',
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
          successCallBack: () => {
            dataSet.query();
          },
        },
      },
      {
        name: 'batchUpdateImport',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl.get('sslm.common.button.batchUpdateImport').d('批量更新导入'),
          buttonTooltip: intl
            .get('sslm.supplyAbility.button.batchUpdateImportTip')
            .d(
              '请先通过导出模板导出待更新供货能力行的行ID，导入模板将通过行ID进行匹配更新，模板内字段为空则将行上对应字段更新为空'
            ),
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY_BATCH_UPDATE',
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
          successCallBack: () => {
            dataSet.query();
          },
        },
      },
      {
        name: 'excelExport',
        btnComp: ExcelExportPro,
        hidden: supplierDimension,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail/export_post/new`,
          queryParams: () => handleExportParams(),
          method: 'POST',
          allBody: true,
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          templateCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY_NEW_DETAIL',
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
    ];
    const buttons = remote
      ? remote.process('SSLM_SUPPLY_ABILITY_MASTER_DATA_PURCHASER_LIST_HEADER_BTNS', btns, {
          dataSet,
          dimension,
        })
      : btns;
    return customizeBtnGroup(
      {
        code: supplierDimension
          ? 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_BTNS'
          : 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.ITEM_BTNS',
        pro: true,
      },
      <DynamicButtons
        buttons={buttons}
        maxNum={5}
        trigger="hover"
        defaultBtnType="c7n-pro"
        permissions={permissionList}
      />
    );
  }
);

export default HeaderBtns;
