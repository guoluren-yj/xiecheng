/*
 * getIndicatorListDS - 指标定义列表DS
 * @Date: 2023-10-07 15:56:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 处理父级节点parentIndicatorName，后端返回影响接口性能
const assignListTree = (collection = [], parentIndicatorName) => {
  return collection.map(n => {
    const item = n;
    if (parentIndicatorName) {
      item.parentIndicatorName = parentIndicatorName;
    } else {
      item.parentIndicatorName = intl
        .get('spfm.supplierKpiIndicator.model.suKpiIn.parentIndicatorRoot')
        .d('根节点');
    }
    if (!isEmpty(item.children)) {
      item.children = assignListTree(item.children, item.indicatorName);
    }
    return item;
  });
};

export const getIndicatorListDs = () => ({
  paging: false,
  childrenField: 'children',
  primaryKey: 'indicatorId',
  cacheSelection: true,
  fields: [
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'indicatorCode',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称'),
    },
    {
      name: 'indicatorTypeMeaning',
      label: intl.get(`sslm.common.model.supplierKpiIndicator.indicatorType`).d('指标类型'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreType').d('评分方式'),
    },
    {
      name: 'evalStandard',
      label: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.evalStandard`).d('评分标准'),
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
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/indicators/new/tree`,
      method: 'GET',
    },
  },
  events: {
    beforeLoad: ({ data }) => {
      assignListTree(data);
    },
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

// 引用指标的评分模板ds
export const getReferenceTemplateDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'evalTplCode',
      label: intl
        .get('spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode')
        .d('评分模板编码'),
    },
    {
      name: 'evalTplName',
      label: intl
        .get('spfm.evaluationTemplate.model.evaluationTemplate.evalTplDesc')
        .d('评分模板名称'),
    },
  ],
});
