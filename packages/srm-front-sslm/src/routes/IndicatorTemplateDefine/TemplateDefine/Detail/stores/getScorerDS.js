/*
 * @Date: 2023-11-15 18:10:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 评分人维度表单
export const getScorerFormDs = ({ isEdit } = {}) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'addSuppliers', // 新增供应商
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      multiple: true,
      ignore: 'always',
    },
    {
      name: 'addCategory', // 新增品类
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      lovPara: {
        enabledFlag: 1,
        businessObjectCode: 'SRM_C_SRM_SSLM_LIFE_CYCLE',
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'addItem', // 新增物料
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SMDM.ITEM',
      lovPara: {
        tenantId,
        enabledFlag: 1,
      },
    },
    {
      name: 'addScorer', // 新增评分人
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.user.account').d('账户'),
    },
    {
      name: 'evalRespRule',
      lookupCode: 'SSLM.KPI_EVAL.ADD_RATER_RULE',
      label: intl.get('sslm.common.model.scorer.addRaterRule').d('添加评分人规则'),
      dynamicProps: {
        required: ({ record }) => isEdit && !['GYSKP_ORDER'].includes(record.get('evalTplType')),
      },
    },
    {
      name: 'respCalMethod',
      lookupCode: 'SSLM.KPI_EVAL.SCORE_CALCULATE_METHOD',
      label: intl.get('sslm.common.model.scorer.calculationMethod').d('评分人分数计算方式'),
      dynamicProps: {
        required: ({ record }) => isEdit && !['GYSKP_ORDER'].includes(record.get('evalTplType')),
      },
    },
    {
      name: 'abandonFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.common.model.scorer.allowedAbandonScore').d('允许评分人放弃评分'),
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'respCalMethod':
          record.set({ abandonFlag: 0 });
          break;
        default:
          break;
      }
    },
  },
});

export const getConfig = (evalRespRule, evalTplId) => {
  switch (evalRespRule) {
    case 'INDICATOR': // 指标维度
      return {
        primaryKey: 'evalTplIndId',
        queryPath: 'eval-templates/indicators/tree/assign',
        dsProps: {
          idField: 'evalTplIndId',
          parentField: 'parentId',
          childrenField: 'children',
        },
      };
    case 'RATER': // 评分人维度
      return {
        primaryKey: 'evalRespDmsId',
        queryPath: `kpi-eval-tpl-resp-dmss/tpl/${evalTplId}`,
        deletePath: `kpi-eval-tpl-resp-dmss/${evalTplId}/tpl/delete`,
      };
    default:
      return {
        primaryKey: 'evalDataId',
        queryPath: `kpi-eval-tpl-datas/${evalRespRule}/${evalTplId}`,
        deletePath: `kpi-eval-tpl-datas/${evalRespRule}/${evalTplId}/delete`,
      };
  }
};

// 评分人维度表格
export const getScorerTableDs = ({ evalRespRule, evalTplId, respCalMethod } = {}) => {
  const { dsProps = {}, primaryKey, queryPath, deletePath } = getConfig(evalRespRule, evalTplId);
  return {
    primaryKey,
    forceValidate: true,
    pageSize: 20,
    paging: !['RATER', 'INDICATOR'].includes(evalRespRule),
    ...dsProps,
    queryParameter: {
      evalTplId,
    },
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
      {
        label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreType').d('评分方式'),
        name: 'scoreTypeMeaning',
      },
      {
        label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorType').d('指标类型'),
        name: 'indicatorTypeMeaning',
      },
      {
        label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.evalStandard').d('评分标准'),
        name: 'evalStandard',
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
          const { children, kpiEvalTplRespDmsList, kpiEvalTplIndRespList } = data;
          // 父级不展示评分人
          const dataList = isEmpty(children)
            ? kpiEvalTplRespDmsList || kpiEvalTplIndRespList
            : null;
          return dataList
            ? dataList.map(n => ({
                scorer:
                  respCalMethod === 'AVERAGE'
                    ? `${n.respUserName}`
                    : `${n.respUserName}-${n.respWeight}%`,
              }))
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
        url: `${SRM_SSLM}/v1/${tenantId}/${deletePath}`,
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

// 分配评分人表单
export const getAssignScorerFormDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'assignRule',
      lookupCode: 'SSLM.KPI_EVAL.ALLOCATION_RULE',
      defaultValue: 'MANUAL',
      label: intl.get('sslm.common.modal.field.allocationRule').d('分配规则'),
    },
  ],
});

// 分配评分人表格
export const getAssignScorerTableDs = ({
  evalRespRule,
  evalDataId,
  evalTplId,
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
    read: () => {
      const path =
        evalRespRule === 'INDICATOR'
          ? `eval-templates/indicators/${evalDataId}/responsible`
          : `kpi-eval-tpl-resp-dmss/${evalDataId}`;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/${path}`,
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      const path =
        evalRespRule === 'INDICATOR'
          ? `eval-templates/indicators/${evalDataId}/responsible/delete`
          : `kpi-eval-tpl-resp-dmss/${evalTplId}/delete`;
      const method = evalRespRule === 'INDICATOR' ? 'POST' : 'DELETE';
      const deleteData =
        evalRespRule === 'INDICATOR'
          ? data
          : {
              evalDataId,
              evalDataType: evalRespRule,
              kpiEvalTplRespDms: data,
            };
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/${path}`,
        method,
        data: deleteData,
      };
    },
  },
});
