/*
 * @Date: 2023-10-18 17:11:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isArray, isNil } from 'lodash';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 考评对象ds
export const getEvaluationObjectDs = ({ isEdit } = {}) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'selectedField', // 供应商lov组件字段
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      multiple: true,
      ignore: 'always',
    },
    {
      name: 'evalGranularity',
      defaultValue: 'SU',
      lookupCode: 'SSLM.KPI_EVAL_GRANULARITY',
      label: intl
        .get('sslm.supplierDocManage.model.docManage.choseEvalGranularity')
        .d('考评颗粒度'),
      dynamicProps: {
        required: ({ record }) =>
          isEdit && !['BDKPI_EVAL', 'GYSKP_XC', 'GYSKP_ORDER'].includes(record.get('evalTplType')),
        disabled: ({ record }) => {
          const trxLineFlags = record?.get('trxLineFlags') || [];
          return trxLineFlags.includes('4');
        },
      },
    },
    {
      name: 'trxLineFlags',
      multiple: ',',
      lookupCode: 'SSLM.KPI_SUPPLIER_SCOPE_NEW',
      label: intl
        .get('sslm.supplierDocManage.model.evalDocManage.evaluateScope')
        .d('选择参评供应商范围'),
      transformResponse: (_, data) =>
        data ? (isNil(data.trxLineFlag) ? data.trxLineFlags : String(data.trxLineFlag)) : null,
    },
    {
      name: 'inventoryTimes',
      type: 'number',
      min: 0,
      step: 1,
      precision: 0,
      defaultValue: 1,
      numberGrouping: false,
      label: intl
        .get(`sslm.supplierKpiIndicator.model.issuedOrder.inventoryTimes`)
        .d('接收入库次数（≥）'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('1'),
      },
    },
    {
      name: 'cooperationDays',
      type: 'number',
      min: 0,
      step: 1,
      precision: 0,
      numberGrouping: false,
      label: intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.cooperationDay`).d('合作天数'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('2'),
      },
    },
    {
      name: 'categoryIds',
      type: 'object',
      multiple: true,
      valueField: 'categoryId',
      textField: 'categoryDescription',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      label: intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.categoryIds`).d('供应商分类'),
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => {
              const { hasChild } = record.data;
              return !+hasChild;
            },
          },
        },
      },
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('3'),
      },
      transformRequest: value => isArray(value) && value.map(n => n.categoryId).join(),
      transformResponse: (value, data) => (value ? data.categoryDescriptions : null),
    },
    {
      name: 'itemCategoryIds',
      type: 'object',
      multiple: true,
      valueField: 'categoryId',
      textField: 'categoryName',
      lovCode: 'SMDM.TREE_ITEM_CATEGORY_NEW',
      lovPara: {
        enabledFlag: 1,
        tenantId,
      },
      label: intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.supplierProduct`).d('供货品类'),
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
      },
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('4'),
      },
      transformRequest: value => isArray(value) && value.map(n => n.categoryId).join(),
      transformResponse: (value, data) => (value ? data.itemCategoryNames : null),
    },
    {
      name: 'stageIds',
      multiple: ',',
      valueField: 'stageId',
      textField: 'stageDescription',
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE_FOR_EVAL',
      label: intl.get('sslm.common.model.stageDescription').d('生命周期阶段'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('5'),
      },
    },
    {
      name: 'deliveryTimes',
      type: 'number',
      min: 0,
      step: 1,
      precision: 0,
      defaultValue: 1,
      numberGrouping: false,
      label: intl
        .get(`sslm.supplierKpiIndicator.model.issuedOrder.deliveryTimes`)
        .d('送货单次数（≥）'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('6'),
      },
    },
    {
      name: 'purchaseAgentIds',
      type: 'object',
      multiple: true,
      valueField: 'purchaseAgentId',
      textField: 'purchaseAgentName',
      lovCode: 'SPFM.TENANT_PURCHASE_AGENT',
      lovPara: { tenantId },
      label: intl.get(`sslm.common.model.buyer`).d('采购员'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('trxLineFlags')?.includes('7'),
      },
      transformRequest: value => isArray(value) && value.map(n => n.purchaseAgentId).join(),
      transformResponse: (value, data) => (value ? data.purchaseAgentNames : null),
    },
    {
      name: 'cancelAutoWriteFlag',
      type: 'string',
      lookupCode: 'SSLM_EVAL_SUP_SELECT_RULE',
      defaultValue: '0',
      label: intl
        .get('sslm.supplierKpiIndicator.model.evaluationObject.cancelSuppliers')
        .d('选择参评供应商规则'),
      dynamicProps: {
        required: ({ record }) => {
          const trxLineFlags = record.get('trxLineFlags');
          return ['3', '5', '3,5', '5,3'].includes(trxLineFlags.toString()) && isEdit;
        },
      },
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      switch (name) {
        case 'trxLineFlags':
          record.set({
            inventoryTimes: 1,
            cooperationDays: null,
            categoryIds: null,
            itemCategoryIds: null,
            stageIds: null,
            deliveryTimes: 1,
            trxLineFlag: null,
          });
          if (value.includes('0')) {
            record.set('trxLineFlags', ['0']);
          }
          if (value.includes('4')) {
            record.set('evalGranularity', 'SU+CA');
          }
          if (!['3', '5', '3,5', '5,3'].includes(value.toString())) {
            record.set('cancelAutoWriteFlag', '0');
          }
          break;
        default:
          break;
      }
    },
  },
});

// 参评供应商ds
export const getSuppliersDs = ({ evalTplId } = {}) => ({
  primaryKey: 'supplierCompanyId',
  forceValidate: true,
  pageSize: 20,
  fields: [
    {
      name: 'companyNum',
      label: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
    },
    {
      name: 'kpiEvalTplScopeDtlList',
      multiple: true,
      type: 'object',
      dynamicProps: {
        label: ({ dataSet }) => {
          const evalGranularity = dataSet.getState('evalGranularity');
          return evalGranularity === 'SU+CA'
            ? intl.get(`spfm.supplierKpiIndicator.view.button.category`).d('参评品类')
            : intl.get(`spfm.supplierKpiIndicator.view.button.item`).d('参评物料');
        },
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          scopeId: record.get('evalTplScopeId'),
          businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
        }),
        lovCode: ({ dataSet }) => {
          const evalGranularity = dataSet.getState('evalGranularity');
          return evalGranularity === 'SU+CA' ? 'SSLM_KPI_TPL_CATEGORY' : 'SSLM_KPI_TPL_ITEM';
        },
        required: ({ dataSet }) => {
          const evalGranularity = dataSet.getState('evalGranularity');
          return ['SU+CA', 'SU+IT'].includes(evalGranularity);
        },
        optionsProps: ({ dataSet }) => {
          const evalGranularity = dataSet.getState('evalGranularity');
          return evalGranularity === 'SU+CA'
            ? {
                paging: false,
                idField: 'categoryId',
                parentField: 'parentCategoryId',
                record: {
                  dynamicProps: {
                    selectable: record => record.get('isCheck') !== false,
                  },
                },
              }
            : {};
        },
      },
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/scope/new`,
      method: 'GET',
      data: {},
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/scope/new`,
      method: 'DELETE',
    },
  },
});

// 参评供应商-批量编辑ds
export const getBatchEditDs = () => ({
  autoCreate: true,
  fields: [
    // 新增品类
    {
      name: 'addCategory',
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      lovPara: {
        tenantId,
        enabledFlag: 1,
        businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
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
    // 新增物料
    {
      name: 'addItem',
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SMDM.CUSTOMER_ITEM',
      lovPara: {
        tenantId,
        enabledFlag: 1,
      },
    },
  ],
});
