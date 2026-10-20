import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const prefix = `sfin.commom.model`;
const organizationId = getCurrentOrganizationId();

const filterFormDs = () => ({
  autoQuery: true,
  autoCreate: true,
  fields: [
    {
      name: 'billNum',
      type: 'string',
      label: intl.get(`${prefix}.billNum`).d('开票单号'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get(`entity.supplier.name`).d('供应商名称'),
    },
    {
      name: 'netAmount',
      type: 'string',
      label: intl.get(`${prefix}.netAmount`).d('不含税总额'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get(`${prefix}.currencyCode`).d('币种'),
    },
    {
      label: intl.get('entity.supplier.code').d('供应商编码'),
      name: 'supplierNum',
      type: 'string',
    },
    {
      label: intl.get(`${prefix}.taxAmount`).d('税额'),
      name: 'taxAmount',
      type: 'string',
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${prefix}.taxRate`).d('税率'),
    },
    {
      label: intl.get(`entity.company.name`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`${prefix}.taxIncludedAmount`).d('含税金额'),
      name: 'taxIncludedAmount',
      type: 'string',
    },
    {
      name: 'billStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billStatusMeaning`).d('状态'),
    },
    {
      name: 'ecBillNum',
      type: 'string',
      label: intl.get(`${prefix}.ecBillNum`).d('电商开票单号'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.remark`).d('备注'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { billHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_FINANCE}/v1/${organizationId}/bill-ec/${billHeaderId}`,
        method: 'GET',
        data: { size: null, page: null },
        transformResponse: (res) => {
          return JSON.parse(res).billHeaderDTO;
        },
      };
    },
  },
});

const automatic = () => ({
  autoQuery: true,
  selection: 'multiple',
  primaryKey: 'ecLineId',
  fields: [
    {
      name: 'ecLineNum',
      type: 'string',
      label: intl.get(`${prefix}.ecLineNum`).d('行号'),
    },
    {
      name: 'confirmStatus',
      type: 'string',
      lookupCode: 'SFIN.BILL_AUTO_CONFIRM_STATUS',
      label: intl.get(`${prefix}.confirmStatus`).d('确认状态'),
    },
    {
      name: 'lineRemark',
      type: 'string',
      label: intl.get(`${prefix}.lineRemark`).d('行备注'),
    },
    {
      name: 'matchResult',
      type: 'string',
      label: intl.get(`${prefix}.matchResult`).d('自动对账结果'),
    },
    {
      name: 'ecPoNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoNum`).d('父订单号'),
    },
    {
      name: 'ecPoSubNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoSubNum`).d('子订单号'),
    },
    {
      name: 'poNumLineNum',
      type: 'string',
      label: intl.get(`${prefix}.poNumLineNum`).d('SRM订单号|行号'),
    },
    {
      name: 'ecProductNum',
      type: 'string',
      label: intl.get(`${prefix}.ecProductNum`).d('商品编码'),
    },
    {
      name: 'ecProductName',
      type: 'string',
      label: intl.get(`${prefix}.ecProductName`).d('商品名称'),
    },
    {
      name: 'ecProductQuantity',
      type: 'number',
      label: intl.get(`${prefix}.ecProductQuantity`).d('商品数量'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.itemName`).d('物料名称'),
    },
    {
      name: 'nakedPrice',
      type: 'string',
      label: intl.get(`${prefix}.nakedPrice`).d('不含税单价'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get(`${prefix}.taxRate`).d('税率（%）'),
    },
    {
      name: 'taxPrice',
      type: 'string',
      label: intl.get(`${prefix}.taxPrice`).d('含税单价'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'string',
      label: intl.get(`${prefix}.taxIncludedAmount`).d('含税金额'),
    },
    {
      name: 'autoNakedPrice',
      type: 'string',
      label: intl.get(`${prefix}.autoNakedPrice`).d('SRM不含税单价'),
    },
    {
      name: 'autoTaxRate',
      type: 'string',
      label: intl.get(`${prefix}.autoTaxRate`).d('SRM税率（%）'),
    },
    {
      name: 'autoActualPrice',
      type: 'string',
      label: intl.get(`${prefix}.autoActualPrice`).d('SRM含税单价'),
    },
    {
      name: 'autoTaxLineAmount',
      type: 'string',
      label: intl.get(`${prefix}.autoTaxLineAmount`).d('SRM含税金额'),
    },
    {
      name: 'poQuantity',
      type: 'string',
      label: intl.get(`${prefix}.poQuantity`).d('订单数量'),
    },
    {
      name: 'deliverQuantity',
      type: 'number',
      label: intl.get(`${prefix}.deliverQuantity`).d('妥投数量'),
    },
    {
      name: 'quantityAccepted',
      type: 'number',
      label: intl.get(`${prefix}.quantityAccepted`).d('验收数量'),
    },
    {
      name: 'quantityReturned',
      type: 'number',
      label: intl.get(`${prefix}.quantityReturned`).d('退货数量'),
    },
    {
      name: 'deliverTime',
      type: 'dateTime',
      label: intl.get(`${prefix}.deliverTime`).d('妥投时间'),
      transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      name: 'asnNumLineNum',
      type: 'string',
      label: intl.get(`${prefix}.asnNumLineNum`).d('SRM送货单号|1'),
    },
    {
      name: 'trvNumLineNum',
      type: 'string',
      label: intl.get(`${prefix}.trvNumLineNum`).d('SRM接收事务单号|行号'),
    },
    {
      name: 'syncStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.syncStatus`).d('反馈状态'),
    },
    {
      name: 'syncMsg',
      type: 'string',
      label: intl.get(`${prefix}.syncMsg`).d('反馈信息'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { billHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_FINANCE}/v1/${organizationId}/bill-ec/bill-line/${billHeaderId}?billFlag=1`,
        method: 'GET',
        // data: {},
      };
    },
  },
});

const notAutomatic = () => ({
  autoQuery: true,
  selection: 'multiple',
  primaryKey: 'ecLineId',
  fields: [
    {
      name: 'ecLineNum',
      type: 'string',
      label: intl.get(`${prefix}.ecLineNum`).d('行号'),
    },
    {
      name: 'confirmStatus',
      type: 'string',
      lookupCode: 'SFIN.BILL_AUTO_CONFIRM_STATUS',
      label: intl.get(`${prefix}.confirmStatus`).d('确认状态'),
    },
    {
      name: 'lineRemark',
      type: 'string',
      label: intl.get(`${prefix}.lineRemark`).d('行备注'),
    },
    {
      name: 'matchResult',
      type: 'string',
      label: intl.get(`${prefix}.matchResult`).d('自动对账结果'),
    },
    {
      name: 'ecPoNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoNum`).d('父订单号'),
    },
    {
      name: 'ecPoSubNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoSubNum`).d('子订单号'),
    },
    {
      name: 'poNumLineNum',
      type: 'string',
      label: intl.get(`${prefix}.poNumLineNum`).d('SRM订单号|行号'),
    },
    {
      name: 'ecProductNum',
      type: 'string',
      label: intl.get(`${prefix}.ecProductNum`).d('商品编码'),
    },
    {
      name: 'ecProductName',
      type: 'string',
      label: intl.get(`${prefix}.ecProductName`).d('商品名称'),
    },
    {
      name: 'ecProductQuantity',
      type: 'number',
      label: intl.get(`${prefix}.ecProductQuantity`).d('商品数量'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.itemName`).d('物料名称'),
    },
    {
      name: 'nakedPrice',
      type: 'string',
      label: intl.get(`${prefix}.nakedPrice`).d('不含税单价'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get(`${prefix}.taxRate`).d('税率（%）'),
    },
    {
      name: 'taxPrice',
      type: 'string',
      label: intl.get(`${prefix}.taxPrice`).d('含税单价'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'string',
      label: intl.get(`${prefix}.taxIncludedAmount`).d('含税金额'),
    },
    {
      name: 'autoNakedPrice',
      type: 'string',
      label: intl.get(`${prefix}.autoNakedPrice`).d('SRM不含税单价'),
    },
    {
      name: 'autoTaxRate',
      type: 'string',
      label: intl.get(`${prefix}.autoTaxRate`).d('SRM税率（%）'),
    },
    {
      name: 'autoActualPrice',
      type: 'string',
      label: intl.get(`${prefix}.autoActualPrice`).d('SRM含税单价'),
    },
    {
      name: 'autoTaxLineAmount',
      type: 'string',
      label: intl.get(`${prefix}.autoTaxLineAmount`).d('SRM含税金额'),
    },
    {
      name: 'poQuantity',
      type: 'string',
      label: intl.get(`${prefix}.poQuantity`).d('订单数量'),
    },
    {
      name: 'deliverQuantity',
      type: 'number',
      label: intl.get(`${prefix}.deliverQuantity`).d('妥投数量'),
    },
    {
      name: 'quantityAccepted',
      type: 'number',
      label: intl.get(`${prefix}.quantityAccepted`).d('验收数量'),
    },
    {
      name: 'quantityReturned',
      type: 'number',
      label: intl.get(`${prefix}.quantityReturned`).d('退货数量'),
    },
    {
      name: 'deliverTime',
      type: 'dateTime',
      label: intl.get(`${prefix}.deliverTime`).d('妥投时间'),
      transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      name: 'asnNumLineNum',
      type: 'string',
      label: intl.get(`${prefix}.asnNumLineNum`).d('SRM送货单号|1'),
    },
    {
      name: 'trvNumLineNum',
      type: 'string',
      label: intl.get(`${prefix}.trvNumLineNum`).d('SRM接收事务单号|行号'),
    },
    {
      name: 'syncStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.syncStatus`).d('反馈状态'),
    },
    {
      name: 'syncMsg',
      type: 'string',
      label: intl.get(`${prefix}.syncMsg`).d('反馈信息'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { billHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_FINANCE}/v1/${organizationId}/bill-ec/bill-line/${billHeaderId}?billFlag=0`,
        method: 'GET',
        // data: {},
      };
    },
  },
});

export { automatic, notAutomatic, filterFormDs };
