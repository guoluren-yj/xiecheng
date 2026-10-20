import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_FINANCE } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

// eslint-disable-next-line func-names
const tableDS = function () {
  return {
    autoQuery: true,
    queryFields: [
      {
        name: 'paymentNum',
        type: 'string',
        label: intl.get('sfin.common.view.paymentNum').d('付款申请单号'),
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('sfin.common.view.companyIdLov').d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        ignore: 'always',
        noCache: true,
        lovPara: { organizationId },
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl
          .get('sfin.paymentSyncErp.model.paymentSyncErp.supplierCompanyIdLov')
          .d('供应商'),
        lovCode: 'SFIN.USER_AUTH.EXT_SUPPLIER',
        ignore: 'always',
        noCache: true,
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'paymentTypeCode',
        type: 'string',
        label: intl.get('sfin.common.view.paymentTypeCode').d('类型'),
        lookupCode: 'SFIN.PAYMENT_TYPE',
      },
      {
        name: 'creationDateStart',
        type: 'date',
        label: intl.get('sfin.common.view.creationDateStart').d('申请日期从'),
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
      },
      {
        name: 'creationDateEnd',
        type: 'date',
        label: intl.get('sfin.common.view.creationDateEnd').d('申请日期至'),
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
      },
      {
        name: 'erpImportCode',
        type: 'string',
        label: intl.get('sfin.common.view.serverCode').d('导入状态'),
        lookupCode: 'SFIN.PAYMENT_APPROVE_SYNC_STATUS',
        // lookupAxiosConfig: () => {
        //   return {
        //     url: `${HZERO_PLATFORM}/v1/lovs/data`,
        //     params: {
        //       lovCode: 'SFIN.PAYMENT_SYNC_STATUS',
        //     },
        //     transformResponse: (res) => {
        //       let parsedData = {};
        //       try {
        //         parsedData = JSON.parse(res);
        //       } catch (e) {
        //         // do nothing, use default error deal
        //       }
        //       return parsedData.filter((item) => item.value !== 'IMPORTED');
        //     },
        //   };
        // },
      },
    ],
    fields: [
      {
        label: intl.get(`sfin.paymentSyncErp.model.paymentSyncErp.syncStatus`).d('导入状态'),
        type: 'string',
        name: 'erpImportCodeMeaning',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.model.paymentSyncErp.errorMessage`).d('错误信息'),
        type: 'string',
        name: 'errorMessage',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.payApproveNo`).d('付款申请单号'),
        type: 'string',
        name: 'paymentNum',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.type`).d('类型'),
        type: 'string',
        name: 'paymentTypeCodeMeaning',
      },
      {
        label: intl
          .get(`sfin.paymentSyncErp.view.message.model.paymentSyncErp.erpPaymentNum`)
          .d('ERP付款单号'),
        type: 'string',
        name: 'erpPaymentNum',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.company`).d('公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl.get(`sfin.common.model.common.ouName`).d('业务实体'),
        name: 'ouName',
        type: 'string',
      },
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        type: 'string',
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.invoiceBodyName`).d('开票主体'),
        name: 'invoiceTitle',
        type: 'string',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.payMoney`).d('付款金额'),
        type: 'string',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.currency`).d('币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.payDate`).d('付款日期'),
        type: 'date',
        name: 'paymentDate',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.view.model.amountPaid`).d('已付金额'),
        type: 'string',
        name: 'amountPaid',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.view.model.unpaidAmount`).d('未付金额'),
        type: 'string',
        name: 'unpaidAmount',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.payer`).d('申请人'),
        type: 'string',
        name: 'createdByName',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.applyDate`).d('申请日期'),
        type: 'date',
        name: 'creationDate',
      },
      {
        label: intl.get(`sfin.paymentSyncErp.common.remark`).d('备注'),
        name: 'remark',
        type: 'string',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const url = `${SRM_FINANCE}/v1/${organizationId}/payment-headers/synclist?customizeUnitCode=SFIN.PAYMENT_SYNC_ERP.LIST`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

export { tableDS };
