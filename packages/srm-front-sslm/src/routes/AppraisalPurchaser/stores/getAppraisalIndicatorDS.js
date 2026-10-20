/*
 * @Date: 2023-11-06 19:25:14
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getAppraisalIndicatorDs = ({ evalHeaderId } = {}) => ({
  forceValidate: true,
  paging: false,
  idField: 'evalTplIndId',
  childrenField: 'children',
  parentField: 'parentId',
  fields: [
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.indicatorCode').d('指标编码'),
      name: 'indicatorCode',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.indicatorName').d('指标描述'),
      name: 'indicatorName',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evaluationWay').d('评分方式'),
      name: 'scoreTypeMeaning',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.indicatorType').d('指标类型'),
      name: 'indicatorTypeMeaning',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evaluationStandard').d('评分标准'),
      name: 'evalStandard',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.scoreWeight').d('权重'),
      name: 'evalWeight',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.01,
      dynamicProps: {
        required: ({ record }) => {
          const children = record?.get('children');
          return isEmpty(children);
        },
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-datas/eval-manage/indicator/${evalHeaderId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/deleteKpiEvalLineByIds/${evalHeaderId}`,
      method: 'POST',
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
