/*
 * @Date: 2023-10-25
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ExcelExportPro from 'components/ExcelExportPro';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

const organizationId = getCurrentOrganizationId();

const permissionList = [
  {
    name: 'create',
    meaning: '新建',
    code: 'srm.partner.suplier-ability.supply-ability-manage.button.uilt',
  },
  {
    name: 'newImport',
    meaning: '导入（新）',
    code: 'srm.partner.suplier-ability.supply-ability-manage.button.newExport',
  },
  {
    name: 'exportPro',
    code: 'srm.partner.suplier-ability.supply-ability-manage.button.export',
    meaning: '导出',
  },
  {
    name: 'submitApproval',
    code: 'srm.partner.suplier-ability.supply-ability-manage.button.table.submit',
    meaning: '提交审批',
  },
  {
    name: 'discard',
    code: 'srm.partner.suplier-ability.supply-ability-manage.button.table.discard',
    meaning: '废弃',
  },
  {
    name: 'batchUpdateImport',
    code: 'srm.partner.suplier-ability.supply-ability-manage.button.updateImport',
    meaning: '批量更新导入',
  },
];

export const OperationButtons = observer(
  ({
    currentKey,
    supplierDimension,
    expandAbilityDs,
    abilityListDs,
    handleGoDetail,
    handleSubmit,
    handldAbandon,
    customizeBtnGroup,
    customizeBtnGroupCode = '',
    getSupAbilityParams = () => {},
  }) => {
    let buttons = [];
    const expandSelectedRows = expandAbilityDs.toJSONData();
    // 供应商/物料维度
    const supAndItemDimension = currentKey === 'supplyAbility' && supplierDimension === 'ITEM';
    if (currentKey === 'supplyAbility') {
      buttons = [
        {
          name: 'create',
          btnComp: Button,
          btnProps: {
            icon: 'add',
            color: 'primary',
            onClick: () => handleGoDetail(),
          },
          child: intl.get('hzero.common.button.create').d('新建'),
        },
        {
          name: 'newImport',
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
              abilityListDs.query();
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
              abilityListDs.query();
            },
          },
        },
        supAndItemDimension && {
          name: 'exportPro',
          btnComp: ExcelExportPro,
          btnProps: {
            requestUrl: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail/export_post`,
            queryParams: () => getSupAbilityParams(),
            method: 'POST',
            allBody: true,
            buttonText: intl.get('hzero.common.button.export').d('导出'),
            templateCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY_NEW_DETAIL',
            otherButtonProps: {
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
            },
          },
        },
      ].filter(Boolean);
    } else {
      buttons = [
        {
          name: 'submitApproval',
          btnComp: Button,
          btnProps: {
            icon: 'check',
            color: 'primary',
            disabled: isEmpty(expandSelectedRows),
            onClick: handleSubmit,
            wait: 500,
            waitType: 'throttle',
          },
          child: intl.get('sslm.common.button.submitApproval').d('提交审批'),
        },
        {
          name: 'discard',
          btnComp: Button,
          btnProps: {
            icon: 'cancel',
            funcType: 'flat',
            disabled: isEmpty(expandSelectedRows),
            onClick: handldAbandon,
            wait: 500,
            waitType: 'throttle',
          },
          child: intl.get('sslm.common.button.discard').d('废弃'),
        },
      ].filter(Boolean);
    }

    return customizeBtnGroup(
      {
        code: customizeBtnGroupCode,
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
