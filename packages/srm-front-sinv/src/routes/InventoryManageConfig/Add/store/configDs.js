/* eslint-disable no-empty-pattern */
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ConfigDataSet = (type) => ({
  autoQuery: false,
  paging: false,
  primaryKey: 'strategyLineId',
  dataToJSON: 'all',
  selection: 'multiple',
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'createCampCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.createCampCode`).d('创建方'),
      dynamicProps: ({ dataSet }) => {
        return {
          lookupCode:
            dataSet.getState('processFactory') === 0
              ? 'SPUC.SINV_STOCK_OUT_CAMP_P'
              : 'SPUC.SINV_STOCK_OUT_CAMP',
        };
      },
      required: true,
    },
    {
      name: 'sourceCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.sourceCode`).d('单据来源'),
      required: true,
      dynamicProps: ({ record }) => {
        return {
          lookupCode:
            record.get('createCampCode') === 'SUPPLIER'
              ? 'SPUC.SINV_STOCK_OUT_SOURCE_CODE_S'
              : 'SPUC.SINV_STOCK_OUT_SOURCE_CODE',
        };
      },
    },
    {
      name: 'submitConfirm',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.submitConfirm`).d('提交确认'),
      required: true,
      dynamicProps: ({ record }) => {
        return {
          lookupCode:
            record.get('createCampCode') === 'SUPPLIER'
              ? 'SPUC.SINV_STOCK_OUT_SUBMIT_CONFIRM_S'
              : 'SPUC.SINV_STOCK_OUT_SUBMIT_CONFIRM',
        };
      },
    },
    {
      name: 'rejectExportStatus',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.rejectExportStatus`).d('拒绝导出外部系统'),
      dynamicProps: ({ dataSet, record }) => {
        const p = record.get('processFactory');
        return {
          lookupCode:
            type === 'detail'
              ? p === 0
                ? 'SPUC.SINV_STOCK_OUT_EXTERNAL_FACTORY'
                : p === 2
                ? 'SPUC.SINV_STOCK_OUT_EXTERNAL_COMMON'
                : null
              : dataSet.getState('processFactory') === 0
              ? 'SPUC.SINV_STOCK_OUT_EXTERNAL_FACTORY'
              : dataSet.getState('processFactory') === 2
              ? 'SPUC.SINV_STOCK_OUT_EXTERNAL_COMMON'
              : null,
        };
      },
      multiple: true,
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },
    {
      name: 'exportFlag',
      type: 'boolean',
      label: intl.get(`sinv.inventoryBench.model.view.exportFlag`).d('完成导出外部系统'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'purchaseReview',
      label: intl.get(`sinv.inventoryBench.model.view.purchaseReview`).d('采购方复核'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      type: 'boolean',
    },
    {
      name: 'supplierNeedConfirm',
      type: 'boolean',
      label: intl.get(`sinv.inventoryBench.model.view.supplierNeedConfirm`).d('调入供应商确认'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'supplierShippedConfirm',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },

    {
      name: 'exportUpdate',
      type: 'number',
      label: intl.get(`sinv.inventoryBench.model.view.exportUpdate`).d('外部系统更新'),
      lookupCode: 'SPUC.SINV_STOCK_EXTERNAL_SYSTEM_UPDATES',
      defaultValue: 0,
    },

    {
      name: 'exportUpdateStatus',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.exportUpdateStatus`).d('允许更新状态'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_STATUS',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('exportUpdate') === 1;
        },
        disabled: ({ record }) => {
          return record.get('exportUpdate') !== 1;
        },
      },
      multiple: true,
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },

    {
      name: 'exportCancel',
      type: 'number',
      label: intl.get(`sinv.inventoryBench.model.view.exportCancel`).d('单据取消控制'),
      lookupCode: 'SPUC.SINV_STOCK_EXTERNAL_SYSTEM_CANCELLATION',
      defaultValue: 0,
    },

    {
      name: 'exportCancelStatus',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.exportCancelStatus`).d('允许取消状态'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_STATUS',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('exportCancel') === 1;
        },
        disabled: ({ record }) => {
          return record.get('exportCancel') !== 1;
        },
      },
      multiple: true,
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },
    {
      name: 'exportSubmitStatus',
      type: 'string',
      label: intl
        .get(`sinv.inventoryBench.model.view.exportSubmitStatus`)
        .d('单据更新自动提交状态'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_STATUS',
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('exportUpdate') !== 1 && record.get('exportUpdate') !== 2;
        },
      },
      multiple: true,
      help: intl
        .get('sinv.inventoryBench.model.view.exportSubmitStatusTip')
        .d('用于配置特定状态下的单据通过外部系统更新后在SRM系统需要重新执行提交流程'),
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { strategyHeaderId } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/line?strategyHeaderId=${strategyHeaderId}`,
        method: 'GET',
        data,
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'exportUpdate' && record.get('exportUpdate') !== 1) {
        record.set('exportUpdateStatus', null);
      }

      if (name === 'exportCancel' && record.get('exportCancel') !== 1) {
        record.set('exportCancelStatus', null);
      }

      if (
        name === 'exportUpdate' &&
        record.get('exportUpdate') !== 1 &&
        record.get('exportUpdate') !== 2
      ) {
        record.set('exportSubmitStatus', null);
      }

      if (name === 'createCampCode' && record.get('createCampCode') === 'SUPPLIER') {
        if (record.get('submitConfirm') === 'SUPPLIER_CONFIRM') {
          record.set('submitConfirm', null);
        }
        if (record.get('sourceCode') === 'EXTERNAL_SYSTEM') {
          record.set('sourceCode', null);
        }
      }
    },
  },
});

const AutoDataSet = () => ({
  autoQuery: false,
  paging: false,
  dataToJSON: 'all',
  selection: 'multiple',
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'cycleRange',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.cycleRanges`).d('周期范围'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_CYCLE_DIMENSION',
      required: true,
    },
    {
      name: 'cycleDimension',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.cycleDimension`).d('自动生单维度'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_AUTO_DIMENSION',
      multiple: true,
      valueField: 'value',
      textField: 'meaning',
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },
    {
      name: 'cycleAuto',
      type: 'number',
      label: intl.get(`sinv.inventoryBench.model.view.cycleAuto`).d('按周期时间自动生成'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      name: 'cycleDate',
      type: 'date',
      label: intl.get(`sinv.inventoryBench.model.view.cycleDate`).d('周期起始日'),
      required: true,
    },
  ],
});

const WeekDataSet = () => ({
  autoQuery: false,
  paging: false,
  dataToJSON: 'all',
  selection: 'multiple',
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'stockMappingType',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.stockMappingType`).d('类型方向'),
      lookupCode: 'SINV.STOCK_MAPPING_TYPE',
      required: true,
    },
    {
      name: 'strategyCodeObj',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.strategyCode`).d('类型编码'),
      required: true,
      lovCode: 'SPUC.SINV_STOCK_OUT_STRATEGY_LIST',
      // valueField: 'templateCode',
      textField: 'strategyCode',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          return {
            curStrategyHeaderId: dataSet.getState('strategyHeaderId'),
            tenantId: organizationId,
            inspectFlag: 1,
          };
        },
      },
    },
    {
      name: 'relStrategyHeaderId',
      type: 'string',
      bind: 'strategyCodeObj.strategyHeaderId',
    },
    {
      name: 'strategyCode',
      type: 'string',
      bind: 'strategyCodeObj.strategyCode',
    },
    {
      name: 'strategyName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('类型名称'),
      bind: 'strategyCodeObj.strategyName',
    },
  ],
  read: ({ data }) => {
    const { strategyHeaderId } = data;
    return {
      url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/mapping-line?strategyHeaderId=${strategyHeaderId}`,
      method: 'GET',
      data,
    };
  },
});

export { ConfigDataSet, AutoDataSet, WeekDataSet };
