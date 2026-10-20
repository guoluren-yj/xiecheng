/*
 * getIndicatorConfigDS 指标配置DS
 * @Date: 2023-10-08 11:50:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isNil } from 'lodash';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import { renderEnable } from '@/routes/components/utils';
import { handleParamDefinition, handleParamConfig } from '@/routes/components/utils/appraisal';

const organizationId = getCurrentOrganizationId();

// 公式配置ds
export const getFormulaConfigDS = ({ evalTplId, indicatorId, sourceKey } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'serviceCode',
      required: true,
      type: 'object',
      lovCode: 'SSLM.KPI_FORMULA_SERVICE',
      textField: 'serviceCode',
      valueField: 'serviceCode',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.serviceName').d('服务'),
      transformRequest: value => value && value.serviceCode,
      transformResponse: (value, data) =>
        value
          ? {
              serviceCode: data.serviceCode,
            }
          : null,
    },
    {
      name: 'formulaUrl',
      required: true,
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.formulaUrl').d('URL'),
    },
    {
      name: 'paramDefinition',
      label: intl.get('sslm.common.model.formula.paramDefinition').d('参数定义'),
    },
    {
      name: 'paramConfig',
      label: intl.get('sslm.common.model.formula.paramConfig').d('参数配置'),
    },
  ],
  transport: {
    read: ({ params }) => {
      const url =
        sourceKey === 'PLATFORM' // 平台级指标
          ? `${SRM_PLATFORM}/v1/${organizationId}/indicators/${indicatorId}/formulas`
          : ['TENANT', 'TEMPLATE'].includes(sourceKey) // 租户级指标/模板指标
          ? `${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls`
          : `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/formulas`; // 当前模板指标
      return {
        url,
        method: 'GET',
        params: { ...params, page: 0, size: 0 },
      };
    },
    destroy: () => {
      const url = ['TENANT'].includes(sourceKey)
        ? `${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls/delete`
        : `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/formulas/delete`;
      return {
        url,
        method: 'DELETE',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/formulas`,
        method: 'POST',
        data: (data || []).map(n => ({ ...n, evalTplId })),
      };
    },
  },
});

// 公式配置Columns
export const getFormulaConfigColumns = ({ isEdit, type, sourceKey }) =>
  [
    {
      name: 'enabledFlag',
      width: 100,
      editor: isEdit,
      renderer: renderEnable,
      header: isEdit
        ? intl.get('hzero.common.status.enable').d('启用')
        : intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'serviceCode',
      editor: isEdit,
    },
    {
      name: 'formulaUrl',
      editor: isEdit,
    },
    {
      name: 'paramDefinition',
      width: 80,
      // 新建顶级和下级指标时不显示，平台级指标、模板中新建指标也不显示
      hidden: ['PARENT', 'CHILD'].includes(type) || ['PLATFORM', 'TEMPLATE'].includes(sourceKey),
      renderer: ({ record }) => (
        <Button
          funcType="link"
          onClick={() => handleParamDefinition({ isEdit, sourceKey, lineRecord: record })}
        >
          {intl.get('sslm.common.model.formula.paramDefinition').d('参数定义')}
        </Button>
      ),
    },
    {
      name: 'paramConfig',
      width: 80,
      // 新建顶级和下级指标时不显示，平台级指标、模板中新建指标也不显示
      hidden: ['PARENT', 'CHILD'].includes(type) || ['PLATFORM', 'TEMPLATE'].includes(sourceKey),
      renderer: ({ record }) => (
        <Button
          funcType="link"
          onClick={() => handleParamConfig({ isEdit, sourceKey, lineRecord: record })}
        >
          {intl.get('sslm.common.model.formula.paramConfig').d('参数配置')}
        </Button>
      ),
    },
  ].filter(col => !col.hidden);

// 公式配置-参数定义ds
export const getParamDefinitionDS = ({ sourceKey, indFmlId, evalTplId, evalTplIndId } = {}) => ({
  paging: false,
  record: {
    dynamicProps: {
      selectable: record => !record.get('indFmlParamId'),
    },
  },
  fields: [
    {
      name: 'enableFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'paramField',
      required: true,
      pattern: /[^\u4e00-\u9fa5]/,
      label: intl.get('sslm.common.model.formula.paramCode').d('参数编码'),
    },
    {
      name: 'paramDescription',
      required: true,
      label: intl.get('sslm.common.model.formula.paramName').d('参数名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      const queryPath =
        sourceKey === 'CURRENT_TEMPLATE' ? 'kpi-tpl-ind-fml-params' : 'kpi-ind-fml-params';
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${queryPath}`,
        method: 'GET',
        data: {
          ...rest,
          ...queryParams,
        },
      };
    },
    submit: ({ data }) => {
      const submitPath =
        sourceKey === 'CURRENT_TEMPLATE'
          ? `kpi-tpl-ind-fml-params/${indFmlId}`
          : `kpi-ind-fml-params/${indFmlId}`;
      const saveData =
        sourceKey === 'CURRENT_TEMPLATE'
          ? data.map(n => ({ ...n, evalTplId, evalTplIndId }))
          : data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${submitPath}`,
        method: 'POST',
        data: saveData,
      };
    },
  },
});

// 公式配置-参数定义Columns
export const getParamDefinitionColumns = ({ isEdit } = {}) => [
  {
    name: 'enableFlag',
    editor: isEdit,
    renderer: renderEnable,
    header: isEdit
      ? intl.get('hzero.common.status.enable').d('启用')
      : intl.get('hzero.common.status').d('状态'),
  },
  {
    name: 'paramField',
    editor: isEdit,
  },
  {
    name: 'paramDescription',
    editor: isEdit,
  },
];

// 公式配置-参数配置ds
export const getParamConfigDS = ({ sourceKey, indFmlId }) => ({
  paging: false,
  fields: [
    {
      ...(sourceKey === 'CURRENT_TEMPLATE'
        ? {
            name: 'tplIndFmlParamId',
            lovCode: 'SSLM_TPL_IND_PARAM',
            lovPara: { evalTplIndFmlId: indFmlId, tenantId: organizationId },
            transformRequest: value => value && value.tplIndFmlParamId,
          }
        : {
            name: 'indFmlParamId',
            lovCode: 'SSLM_KPI_IND_PARAM',
            lovPara: { indicatorFmlId: indFmlId, tenantId: organizationId },
            transformRequest: value => value && value.indFmlParamId,
          }),
      required: true,
      type: 'object',
      label: intl.get('sslm.common.model.formula.param').d('参数'),
      transformResponse: (value, data) =>
        value
          ? {
              paramField: data.paramField,
              indFmlParamId: data.indFmlParamId,
              tplIndFmlParamId: data.tplIndFmlParamId,
            }
          : null,
    },
    {
      name: 'matchRule',
      required: true,
      lookupCode: 'SSLM.KPI_IND_CONDITION',
      label: intl.get('sslm.common.model.formula.condition').d('条件'),
    },
    {
      name: 'matchValue',
      required: true,
      pattern: /[^\u4e00-\u9fa5]/,
      label: intl.get('sslm.common.model.formula.paramValue').d('参数值'),
      help: intl
        .get('sslm.common.model.formula.paramFormat')
        .d('参数值可维护固定值或区间，维护区间时请按格式(a,b]、[a,b)、(a,b)、[a,b]'),
    },
    {
      name: 'returnValue',
      required: true,
      type: 'number',
      step: 0.01,
      precision: 2,
      numberGrouping: false,
      label: intl.get('sslm.common.model.formula.calculateScore').d('计算分值'),
    },
    {
      name: 'orderSeq',
      required: true,
      type: 'number',
      min: 1,
      step: 1,
      precision: 0,
      numberGrouping: false,
      label: intl.get('hzero.common.priority').d('优先级'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      const queryPath =
        sourceKey === 'CURRENT_TEMPLATE' ? 'kpi-tpl-ind-fml-configs' : 'kpi-ind-fml-configs';
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${queryPath}`,
        method: 'GET',
        data: {
          ...rest,
          ...queryParams,
        },
      };
    },
    destroy: () => {
      const destroyPath =
        sourceKey === 'CURRENT_TEMPLATE' ? 'kpi-tpl-ind-fml-configs' : 'kpi-ind-fml-configs';
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${destroyPath}`,
        method: 'DELETE',
      };
    },
    submit: () => {
      const submitPath =
        sourceKey === 'CURRENT_TEMPLATE'
          ? `kpi-tpl-ind-fml-configs/${indFmlId}`
          : `kpi-ind-fml-configs/${indFmlId}`;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${submitPath}`,
        method: 'POST',
      };
    },
  },
});

// 公式配置-参数配置ds
export const getParamConfigColumns = ({ isEdit, sourceKey }) => [
  {
    name: sourceKey === 'CURRENT_TEMPLATE' ? 'tplIndFmlParamId' : 'indFmlParamId',
    editor: isEdit,
  },
  {
    name: 'matchRule',
    editor: isEdit,
  },
  {
    name: 'matchValue',
    editor: isEdit,
  },
  {
    name: 'returnValue',
    editor: isEdit,
  },
  {
    name: 'orderSeq',
    editor: isEdit,
  },
];

// 选项配置ds
export const getOptionsConfigDS = ({ evalTplId, indicatorId, sourceKey } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'tenantId',
      defaultValue: organizationId,
    },
    {
      name: 'optName',
      required: true,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.optName').d('选项名称'),
    },
    {
      name: 'score',
      required: true,
      type: 'number',
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.score').d('分值'),
    },
    {
      name: 'sequence',
      type: 'number',
      min: 0,
      step: 1,
      precision: 1,
      required: true,
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.sequence').d('排序号'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.common.model.field.defaultOption').d('默认选项'),
    },
  ],
  transport: {
    read: ({ params }) => {
      const path =
        sourceKey === 'CURRENT_TEMPLATE'
          ? `eval-templates/indicators/${indicatorId}/kpi-eval-tpl-ind-opts`
          : 'kpi-indicator-opt';
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${path}`,
        method: 'GET',
        params: { ...params, page: 0, size: 0, indicatorId },
      };
    },
    destroy: () => {
      const path =
        sourceKey === 'CURRENT_TEMPLATE'
          ? `eval-templates/indicators/${indicatorId}/kpi-eval-tpl-ind-opts/eval-manage/delete`
          : `kpi-indicator-opt/${indicatorId}/eval-manage/delete`;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${path}`,
        method: 'DELETE',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/kpi-eval-tpl-ind-opts/eval-mange/save`,
        method: 'POST',
        data: (data || []).map(n => ({ ...n, evalTplId })),
      };
    },
  },
});

// 选项配置Columns
export const getOptionsConfigColumns = ({ isEdit }) => [
  {
    name: 'optName',
    editor: isEdit,
  },
  {
    name: 'score',
    editor: isEdit,
  },
  {
    name: 'sequence',
    editor: isEdit,
  },
  {
    name: 'defaultFlag',
    editor: isEdit,
    renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
  },
];
