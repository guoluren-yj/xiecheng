/*
 * EvaluationIndicator - 考评指标
 * @Date: 2023-11-15 13:39:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil } from 'lodash';
import React, { useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { saveCreateIndicator } from '@/services/indicatorTemplateDefineService';
import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { handleConfiguration, handleReferenceIndicator } from '@/routes/components/utils/appraisal';

const organizationId = getCurrentOrganizationId();

const EvaluationIndicator = ({ isEdit, evalTplId, dataSet }) => {
  // 新建指标回调
  const handleCreateIndicator = ({ record, selectedRows, resolve }) => {
    let parentId = -1;
    if (record) {
      parentId = record.get('evalTplIndId');
    }
    return saveCreateIndicator({
      evalTplId,
      parentId,
      refKpiIndicatorList: selectedRows,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          resolve();
          notification.success();
          dataSet.query();
        }
      })
      .finally(() => {
        resolve(false);
      });
  };

  // 获取导出参数
  const getQueryParams = () => {
    const queryParams = dataSet?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({ ...queryParams, evalTplId });
  };

  const getButtons = useCallback(() => {
    const commonBtns = [
      <ExcelExportPro
        queryParams={() => getQueryParams()}
        requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/new/tree/export`}
        templateCode="SRM_C_SRM_SSLM_KPI_EVAL_TPL_IND_EXPORT"
        buttonText={intl.get('hzero.common.button.export').d('导出')}
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          permissionList: [
            {
              code: 'srm.partner.indicator-template-definition.button.indicators-export',
              type: 'button',
              meaning: '考评指标-导出',
            },
          ],
        }}
      />,
      'expandAll',
      'collapseAll',
    ];
    return isEdit
      ? [
        <Button
          icon="playlist_add"
          onClick={() =>
              handleReferenceIndicator({
                dataSet,
                sourceKey: 'TEMPLATE',
                onOk: handleCreateIndicator,
                searchCode: 'SSLM.TEMPLATE_DEFINE.EVALUATION_INDICATOR.SEARCH',
              })
            }
        >
          {intl.get('spfm.supplierKpiIndicator.view.button.addParentNode').d('新增顶级指标')}
        </Button>,
          'delete',
        <CommonImport
          refreshButton
          prefixPatch={SRM_SSLM}
          businessObjectTemplateCode="SRM_C_SRM_SSLM_KPI_EVAL_TPL_IND_IMPORT"
          buttonText={intl.get('hzero.common.button.import').d('导入')}
          args={{ evalTplId }}
          successCallBack={() => {
              dataSet.query();
            }}
          buttonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.partner.indicator-template-definition.button.indicators-import',
                  type: 'button',
                  meaning: '考评指标-导入',
                },
              ],
            }}
        />,
          ...commonBtns,
        ]
      : [...commonBtns];
  }, [isEdit]);

  const columns = [
    {
      name: 'indicatorCode',
      width: 150,
      headerStyle: { paddingLeft: 48 },
    },
    {
      name: 'indicatorName',
      width: 150,
    },
    {
      name: 'action',
      width: 100,
      hidden: !isEdit,
      renderer: ({ record }) => {
        return (
          <Button
            funcType="link"
            onClick={() =>
              handleReferenceIndicator({
                record,
                dataSet,
                sourceKey: 'TEMPLATE',
                onOk: handleCreateIndicator,
                searchCode: 'SSLM.TEMPLATE_DEFINE.EVALUATION_INDICATOR.SEARCH',
              })
            }
          >
            {intl.get('spfm.supplierKpiIndicator.view.button.addChildIndicator').d('新增下级指标')}
          </Button>
        );
      },
    },
    {
      name: 'scoreTypeMeaning',
      width: 100,
      renderer: ({ value, record }) => (record.children ? '-' : value),
    },
    {
      name: 'indicatorTypeMeaning',
      width: 100,
    },
    {
      name: 'evalStandard',
      width: 250,
      editor: isEdit,
    },
    {
      name: 'evalWeight',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'scoreFrom',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'scoreTo',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'defaultScore',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'indicatorScore',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'isStandard',
      editor: isEdit,
      width: 100,
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
    {
      name: 'benchmarkScore',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'orderSeq',
      editor: isEdit,
      width: 100,
    },
    {
      name: 'enabledFlag',
      editor: isEdit,
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'configuration',
      width: 100,
      renderer: ({ record }) => {
        const { scoreType, indicatorType, evalTplIndId } = record.get([
          'scoreType',
          'indicatorType',
          'evalTplIndId',
        ]);
        return scoreType === 'SYSTEM' ? (
          <Button
            funcType="link"
            onClick={() =>
              handleConfiguration({
                isEdit,
                evalTplId,
                type: 'formulaConfig',
                indicatorId: evalTplIndId,
                sourceKey: 'CURRENT_TEMPLATE',
              })
            }
          >
            {intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')}
          </Button>
        ) : scoreType === 'MANUAL' && indicatorType === 'OPT' ? (
          <Button
            funcType="link"
            onClick={() =>
              handleConfiguration({
                isEdit,
                evalTplId,
                type: 'optionsConfig',
                indicatorId: evalTplIndId,
                sourceKey: 'CURRENT_TEMPLATE',
              })
            }
          >
            {intl.get('spfm.supplierKpiIndicator.view.button.optionsConfig').d('选项配置')}
          </Button>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <div style={{ height: tableHeight.fixedHeight }}>
      <SearchBarTable
        virtual
        virtualCell
        mode="tree"
        dataSet={dataSet}
        columns={columns}
        defaultRowExpanded
        buttons={getButtons()}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        style={{ maxHeight: tableMaxHeight.fixedHeight }}
        searchCode="SSLM.TEMPLATE_DEFINE.EVALUATION_INDICATOR.SEARCH_BAR"
        customizedCode="SSLM.TEMPLATE_DEFINE.EVALUATION_INDICATOR_TABLE"
        searchBarConfig={{
          autoQuery: false,
          defaultExpand: false,
          closeFilterSelector: true,
        }}
      />
    </div>
  );
};

export default EvaluationIndicator;
