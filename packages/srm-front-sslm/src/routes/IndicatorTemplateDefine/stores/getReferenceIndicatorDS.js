/*
 * getReferenceIndicatorDS - 引用指标DS
 * @Date: 2023-10-13 13:48:16
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isNil } from 'lodash';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getReferenceIndicatorDs = ({ sourceKey, queryParams = {} } = {}) => ({
  paging: false,
  idField: 'indicatorId',
  childrenField: 'children',
  parentField: 'parentIndicatorId',
  queryParameter: {
    enabledFlag: 1,
    ...queryParams,
  },
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.indicatorCode').d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.indicatorName').d('指标名称'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.scoreType').d('评分方式'),
    },
    {
      name: 'score',
      label: intl.get('sslm.common.model.field.mark').d('分值'),
    },
    {
      name: 'configuration',
      label: intl.get('sslm.common.model.field.formulaAndOptionQuery').d('公式/选项查询'),
    },
  ],
  transport: {
    read: () => {
      const url =
        sourceKey === 'PLATFORM'
          ? `${SRM_PLATFORM}/v1/${organizationId}/indicators/tree-ref`
          : sourceKey === 'TENANT'
          ? `${SRM_SSLM}/v1/${organizationId}/indicators/new/tree`
          : sourceKey === 'TEMPLATE'
          ? `${SRM_SSLM}/v1/${organizationId}/indicators/tree-ref`
          : `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/new/tree`;
      return {
        url,
        method: 'GET',
      };
    },
  },
  events: {
    select: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.unSelect(i));
      }
    },
  },
});

export const getReferenceIndicatorColumns = (sourceKey, handleConfiguration) => [
  {
    name: 'indicatorCode',
    headerStyle: { paddingLeft: 48 },
  },
  {
    name: 'indicatorName',
  },
  {
    name: 'scoreTypeMeaning',
    width: 110,
  },
  {
    name: 'score',
    width: 110,
    renderer: ({ record }) => {
      const { scoreFrom, scoreTo } = record.get(['scoreFrom', 'scoreTo']);
      if (isNil(scoreFrom) && isNil(scoreTo)) {
        return '-';
      } else {
        return `${scoreFrom} ~ ${scoreTo}`;
      }
    },
  },
  {
    name: 'configuration',
    width: 100,
    renderer: ({ record }) => {
      const { scoreType, indicatorType, indicatorId, evalTplIndId } = record.get([
        'scoreType',
        'indicatorType',
        'indicatorId',
        'evalTplIndId',
      ]);
      // 已维护到模板中的指标使用evalTplIndId
      const newIndicatorId = sourceKey === 'CURRENT_TEMPLATE' ? evalTplIndId : indicatorId;
      return scoreType === 'SYSTEM' ? (
        <Button
          funcType="link"
          onClick={() =>
            handleConfiguration({ type: 'formulaConfig', indicatorId: newIndicatorId, sourceKey })
          }
        >
          {intl.get('sslm.common.model.field.formulaQuery').d('公式查询')}
        </Button>
      ) : scoreType === 'MANUAL' && indicatorType === 'OPT' ? (
        <Button
          funcType="link"
          hidden={sourceKey === 'PLATFORM'} // 平台级指标不显示选项配置
          onClick={() =>
            handleConfiguration({ type: 'optionsConfig', indicatorId: newIndicatorId, sourceKey })
          }
        >
          {intl.get('sslm.common.model.field.optionQuery').d('选项查询')}
        </Button>
      ) : (
        '-'
      );
    },
  },
];
