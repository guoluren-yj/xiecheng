import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { transformQselectDate, transformSupplierData } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const tableUnitCodes = {
  A: 'SDIM.POOL_SUPPLY.TAB_ALL.GRID',
  B: 'SDIM.POOL_SUPPLY.TAB_INVOICE.GRID',
  C: 'SDIM.POOL_SUPPLY.TAB_INVOICED.GRID',
  D: 'SDIM.POOL_SUPPLY.TAB_TRASH.GRID',
};

const filterUnitCodes = {
  A: 'SDIM.POOL_SUPPLY.TAB_ALL.SEARCH_BAR',
  B: 'SDIM.POOL_SUPPLY.TAB_INVOICE.SEARCH_BAR',
  C: 'SDIM.POOL_SUPPLY.TAB_INVOICED.SEARCH_BAR',
  D: 'SDIM.POOL_SUPPLY.TAB_TRASH.SEARCH_BAR',
};

const tableDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'poolId',
    validateBeforeQuery: false,
    pageSize: 20,
    fields: [
      {
        name: 'poolNum',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.poolNum').d('开票事务编号'),
      },
      {
        name: 'poolStatusMeaning',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.poolStatusMeaning')
          .d('开票状态'),
      },
      {
        name: 'ruleNum',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.ruleNum').d('执行开票规则'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.netPrice').d('不含税单价'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoicing')
          .d('开票税额'),
      },
      {
        name: 'amountInvoice',
        type: 'number',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoice')
          .d('可开票含税金额'),
      },
      {
        name: 'trxDate',
        type: 'date',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.trxDate').d('事务日期'),
      },
      {
        name: 'refDocNumListStr',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.refDocNumListStr')
          .d('关联开票申请单'),
      },
      {
        name: 'defaultInvoiceTypeMeaning',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.defaultInvoiceType')
          .d('税务发票种类'),
      },
      {
        name: 'refInvoiceNumListStr',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.refInvoiceNumListStr')
          .d('关联税务发票代码-发票号码'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.companyName').d('所属客户'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.supplierCompanyName')
          .d('所属公司'),
      },
      {
        name: 'item',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.item').d('物料名称'),
      },
      {
        name: 'commodityNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.commodityNum')
          .d('税收商品编码'),
      },
      {
        name: 'commodityName',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.commodityName')
          .d('商品或服务名称'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.quantity').d('可开票数量'),
      },
      {
        name: 'sourceDocNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocNum')
          .d('来源单据号'),
      },
      {
        name: 'sourceDocLineNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocLineNum')
          .d('来源单据行号'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ params, dataSet, data }) => {
        let url = '';
        const {
          queryParameter: { type },
        } = dataSet;
        switch (type) {
          case 'A':
            url = `/ssta/v1/${organizationId}/direct-pools/list/all`;
            break;
          case 'B':
            url = `/ssta/v1/${organizationId}/direct-pools/list/invoice`;
            break;
          case 'C':
            url = `/ssta/v1/${organizationId}/direct-pools/list/invoiced`;
            break;
          default:
            url = `/ssta/v1/${organizationId}/direct-pools/list/all`;
            break;
        }

        return {
          url,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            customizeUnitCode: [filterUnitCodes[type], tableUnitCodes[type]]
              .filter((item) => item)
              .join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'trxDate' }),
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};

const errorTableDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'errorId',
    validateBeforeQuery: false,
    pageSize: 20,
    fields: [
      {
        name: 'poolNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.originalPoolNum')
          .d('原开票事务编号'),
      },
      {
        name: 'poolStatusMeaning',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.poolStatusMeaning')
          .d('开票状态'),
      },
      {
        name: 'ruleNum',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.ruleNum').d('执行开票规则'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.netPrice').d('不含税单价'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoicing')
          .d('开票税额'),
      },
      {
        name: 'amountInvoice',
        type: 'number',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoice')
          .d('可开票含税金额'),
      },
      {
        name: 'trxDate',
        type: 'date',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.trxDate').d('事务日期'),
      },
      {
        name: 'refDocNumListStr',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.refDocNumListStr')
          .d('关联开票申请单'),
      },
      {
        name: 'defaultInvoiceTypeMeaning',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.defaultInvoiceType')
          .d('税务发票种类'),
      },
      {
        name: 'refInvoiceNumListStr',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.refInvoiceNumListStr')
          .d('关联税务发票代码-发票号码'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.companyName').d('所属客户'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.supplierCompanyName')
          .d('所属公司'),
      },
      {
        name: 'item',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.item').d('物料名称'),
      },
      {
        name: 'commodityNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.commodityNum')
          .d('税收商品编码'),
      },
      {
        name: 'commodityName',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.commodityName')
          .d('商品或服务名称'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.quantity').d('可开票数量'),
      },
      {
        name: 'sourceDocNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocNum')
          .d('来源单据号'),
      },
      {
        name: 'sourceDocLineNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocLineNum')
          .d('来源单据行号'),
      },
      /**
       * 垃圾箱
       */
      {
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.errorNum`).d('开票事务编号'),
        type: 'string',
        name: 'errorNum',
      },
      {
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.errorTypeMeaning`)
          .d('导入失败类型'),
        type: 'string',
        name: 'errorTypeMeaning',
      },
      {
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.errorMsg`).d('导入失败原因'),
        type: 'string',
        name: 'errorMsg',
      },
      {
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.errorMsg`).d('导入失败原因'),
        type: 'string',
        name: 'errorMsg',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ params, dataSet, data }) => {
        const {
          queryParameter: { type },
        } = dataSet;
        return {
          url: `/ssta/v1/${organizationId}/direct-pool-errors/list`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            customizeUnitCode: [filterUnitCodes[type], tableUnitCodes[type]]
              .filter((item) => item)
              .join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};

export { tableDS, errorTableDS };
