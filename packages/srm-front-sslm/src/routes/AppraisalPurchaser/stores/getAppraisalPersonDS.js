/*
 * @Date: 2023-11-06 19:50:18
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

const getDsConfig = (evalRespRule, evalHeaderId) => {
  switch (evalRespRule) {
    case 'INDICATOR':
      return {
        childrenField: 'children',
        queryPath: `kpi-eval-header-datas/eval-manage/indicator/${evalRespRule}/${evalHeaderId}`,
      };
    case 'RATER':
      return {
        primaryKey: 'headerRespDmsId',
        queryPath: `kpi-eval-header-resp-dmss/eval-manage/${evalRespRule}/${evalHeaderId}`,
      };
    default:
      return {
        primaryKey: 'evalDataId',
        queryPath: `kpi-eval-header-datas/eval-manage/${evalRespRule}/${evalHeaderId}`,
      };
  }
};

// 评分人表格
export const getAppraisalPersonDs = ({ evalHeaderId, evalRespRule, respCalMethod } = {}) => {
  const { queryPath, ...dsConfig } = getDsConfig(evalRespRule, evalHeaderId);
  return {
    forceValidate: true,
    pageSize: 20,
    ...dsConfig,
    fields: [
      // 指标
      {
        label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码'),
        name: 'indicatorCode',
      },
      {
        label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称'),
        name: 'indicatorName',
      },
      // 供应商
      {
        name: 'supplierCompanyNum',
        label: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
      },
      // 品类
      {
        name: 'categoryCode',
        label: intl.get('sslm.common.category.categoryCode').d('品类编码'),
      },
      {
        name: 'categoryName',
        label: intl.get('sslm.common.category.categoryName').d('品类名称'),
      },
      // 物料
      {
        name: 'itemCode',
        label: intl.get('sslm.common.item.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sslm.common.item.itemName').d('物料名称'),
      },
      // 评分人
      {
        name: 'respUserId',
      },
      {
        name: 'respLoginName',
        label: intl.get('sslm.common.model.user.account').d('账户'),
      },
      {
        name: 'respUserName',
        label: intl.get('sslm.common.model.user.name').d('名称'),
      },
      {
        name: 'respWeight',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.01,
        precision: 2,
        required: evalRespRule === 'RATER' && respCalMethod !== 'AVERAGE',
        label: intl.get('sslm.supplierKpiIndicator.model.supplier.respWeight').d('权重%'),
      },
      {
        name: 'assignRule',
        lookupCode: 'SSLM.KPI_EVAL.ALLOCATION_RULE',
        defaultValue: 'MANUAL',
        label: intl.get('sslm.common.modal.field.allocationRule').d('分配规则'),
        transformResponse: (value, data) => {
          const { children } = data;
          return isEmpty(children) ? value : null;
        },
      },
      {
        name: 'assignedScore',
        label: intl.get('sslm.common.modal.field.assignedScore').d('分配评分人'),
      },
      {
        name: 'scorer',
        type: 'object',
        multiple: true,
        ignore: 'always',
        lovCode: 'SSLM.KPI_CHOOSE_USER',
        lovPara: { tenantId },
        textField: 'scorer',
        label: intl.get('sslm.common.modal.grade.realName').d('评分人'),
        transformResponse: (value, data) => {
          const { children, kpiEvalHeaderRespDmsList } = data;
          // 父级不展示评分人
          const dataList = isEmpty(children) ? kpiEvalHeaderRespDmsList : null;
          return dataList
            ? dataList.map(n => {
                const { respUserName, respWeight } = n;
                return {
                  scorer: respWeight ? `${respUserName}-${respWeight}%` : `${respUserName}`,
                };
              })
            : null;
        },
      },
    ],
    transport: {
      read: {
        url: `${SRM_SSLM}/v1/${tenantId}/${queryPath}`,
        method: 'GET',
      },
      destroy: {
        url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-resp-dmss/eval-manage/${evalRespRule}/${evalHeaderId}`,
        method: 'DELETE',
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
  };
};

// 分配评分人表格
export const getAssignScorerTableDs = ({
  evalDataId,
  evalRespRule,
  evalHeaderId,
  respCalMethod,
} = {}) => ({
  paging: false,
  dataToJSON: 'all',
  queryParameter: {
    evalDataType: evalRespRule,
  },
  fields: [
    {
      name: 'accountLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.user.account').d('账户'),
    },
    {
      name: 'respLoginName',
      type: 'object',
      required: true,
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      textField: 'loginName',
      valueField: 'userId',
      label: intl.get('sslm.common.model.user.account').d('账户'),
      transformResponse: (value, data) =>
        value
          ? {
              userId: data.respUserId,
              userName: data.respUserName,
              loginName: data.respLoginName,
            }
          : null,
      transformRequest: value => (value ? value.loginName : null),
    },
    {
      name: 'respUserId',
      bind: 'respLoginName.userId',
    },
    {
      name: 'respUserName',
      bind: 'respLoginName.userName',
      label: intl.get('sslm.common.model.user.name').d('名称'),
    },
    {
      name: 'respWeight',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.01,
      precision: 2,
      required: respCalMethod !== 'AVERAGE',
      label: intl.get('sslm.supplierKpiIndicator.model.supplier.respWeight').d('权重%'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-resp-dmss/eval-manage/${evalRespRule}/${evalHeaderId}/${evalDataId}`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-resp-dmss/eval-manage/${evalRespRule}/${evalHeaderId}`,
      method: 'DELETE',
    },
  },
});
