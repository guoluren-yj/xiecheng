import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const receiveOrReturnDS = (nodeStrategyId) => ({
  dataToJSON: 'all',
  pageSize: 10,
  forceValidate: true,
  autoCreate: true,
  selection: nodeStrategyId ? false : 'multiple',
  fields: [
    {
      name: 'returnedFlag',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.returnedFlag').d('收货/退货'),
      lookupCode: 'SINV.RCV_RETURN_FLAG',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
      // defaultValue: '0',
    },
    {
      name: 'coopType',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.coopType').d('创建方'),
      lookupCode: 'SPUC.SINV_COOP_TYPE',
      lovPara: {
        tenantId: organizationId,
      },
      // defaultValue: 'PUR',
      required: true,
    },
    {
      name: 'approveRuleCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.approveRuleCode').d('创建审批方式'),
      lookupCode: 'SINV.STRATEGY_APPROVE_METHOD',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
      defaultValue: 'NONE',
    },
    {
      name: 'supplierConfirmType',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.supplierConfirmType').d('供应商确认方式'),
      lookupCode: 'SPUC.SINV_SUPPLIER_CONFIRM_TYPE',
      defaultValue: 'NONE',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
        disabled: ({ record }) => record.get('coopType') === 'SUPPER',
      },
    },
    {
      name: 'exportExtEnable',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.exportExtEnable').d('导出外部系统'),
      lookupCode: 'SPUC.SINV_EXPORT_CONFIG',
      lovPara: {
        tenantId: organizationId,
      },
      defaultValue: '0',
    },
    {
      name: 'itfRcvConfirmExport',
      type: 'string',
      label: intl
        .get('sinv.receiptManage.model.receipt.itfRcvConfirmExport')
        .d('外部系统来源事务确认结果回传'),
      lookupCode: 'SPUC.SINV_EXPORT_CONFIG',
      lovPara: {
        tenantId: organizationId,
      },
      defaultValue: '0',
      help: intl
        .get('sinv.receiptManage.model.receipt.itfRcvConfirmExportTipshow')
        .d('用于外部系统导入的事务，在SRM中确认或拒绝后，单据确认或拒绝的状态导出至外部系统。'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { strategyLineId, ...others } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv-strategy-line-coop/query/${strategyLineId}`,
        method: 'GET',
        data: {
          ...others,
        },
      };
    },
  },
  events: {
    load: () => { },
    update: ({ record, name, value }) => {
      if (name === 'coopType' && value === 'SUPPER') {
        record.set('supplierConfirmType', 'NONE');
      }
    },
  },
});

export { receiveOrReturnDS };
