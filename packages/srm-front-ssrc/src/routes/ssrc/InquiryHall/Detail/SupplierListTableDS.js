import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const SupplierListTableDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        name: 'companyId',
        type: 'string',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageDescription',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskLevel`).d('风险等级'),
        name: 'riskLevel',
        lookupCode: 'SDAT.WORKBENCH_EVENT_LEVEL',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskScan`).d('风险扫描'),
        type: 'string',
        name: 'riskScan',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'contactName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
        width: 100,
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        name: 'contactMail',
        width: 100,
        type: 'email',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'viewItemLine',
        type: 'string',
      },
      {
        name: 'isMonitor',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'isShowScan',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.paymentTypeOfTender')
          .d('招标文件费缴纳类型'),
        name: 'bidFileExpensePaymentRuleMeaning',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.marginPaymentType').d('保证金缴纳类型'),
        name: 'depositPaymentRuleMeaning',
        type: 'string',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const {
          organizationId,
          rfxHeaderId,
          customizeUnitCode = null,
          isPubPage,
          permissionFilterFlag = 0,
        } = commonProps;
        if (!rfxHeaderId || rfxHeaderId === 'null') {
          return;
        }
        let url;
        if (isPubPage) {
          url = `${Prefix}/${organizationId}/rfx/hist/${rfxHeaderId}/suppliers`;
        } else {
          url = `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/suppliers`;
        }
        return {
          url,
          method: 'GET',
          data: {
            tenantId: organizationId,
            organizationId,
            rfxHeaderId,
            customizeUnitCode,
            permissionFilterFlag,
          },
        };
      },
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId = null, customizeUnitCode = null } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers`,
          method: 'DELETE',
          params: customizeUnitCode,
          data,
        };
      },
    },
  };
};

export default SupplierListTableDS;
