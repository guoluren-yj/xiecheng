import moment from 'moment';
import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { isArray } from 'lodash';

const promptCode = 'sfin.invoiceBill';
const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  dataToJSON: 'selected',
  fields: [
    {
      label: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
      name: 'trxAndLineNum',
    },
    {
      label: intl.get('entity.item.code').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get('smdm.materiel.model.materiel.commonName').d('通用名'),
      name: 'commonName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
      name: 'specificationsAndModel',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.unit`).d('单位'),
      name: 'unit',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantityAvailable`).d('可开票数量'),
      name: 'invoiceQuantityAvailable',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
      name: 'netPrice',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
      name: 'netAmount',
      type: 'number',
    },
    {
      label: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
      name: 'taxRate',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
      name: 'taxIncludedPrice',
      type: 'number',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
      name: 'taxIncludedAmount',
      type: 'number',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
      name: 'taxAmount',
      type: 'number',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.trxType`).d('事务类型'),
      name: 'trxType',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.parentNumber`).d('父事务编号|行号'),
      name: 'parentNumber',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.asnNumAndAsnLineNum`).d('送货单号|行号'),
      name: 'asnNumAndAsnLineNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
      name: 'poNumAndLineNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
      name: 'displayReleaseNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.displayLine`).d('发运行'),
      name: 'displayLineLocationNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.orderTypeName`).d('订单类型'),
      name: 'orderTypeName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
      name: 'purchaseOrgName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织'),
      name: 'organizationName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
      name: 'inventoryName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
      name: 'purAgentName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
      name: 'trxDate',
    },
  ],
  queryFields: [
    {
      name: 'poNum',
      label: intl.get(`${promptCode}.model.invoiceBill.poNum`).d('采购订单号'),
    },
    {
      name: 'displayTrxNumber',
      label: intl.get(`${promptCode}.model.invoiceBill.displayTrxNumber`).d('事务编号'),
    },
    {
      name: 'trxDateFrom',
      type: 'date',
      max: 'trxDateTo',
      label: intl.get(`${promptCode}.model.invoiceBill.trxDateFrom`).d('事务日期从'),
      defaultValue: moment().subtract(6, 'month'),
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'trxDateTo',
      type: 'date',
      min: 'trxDateFrom',
      label: intl.get(`${promptCode}.model.invoiceBill.trxDateTo`).d('事务日期到'),
      defaultValue: moment(),
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    {
      name: 'purOrganizationIdLov',
      type: 'object',
      label: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
      noCache: true,
      multiple: true,
      lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'purOrganizationIds',
      bind: 'purOrganizationIdLov.purchaseOrgId',
      transformRequest: (value) => (isArray(value) ? value.join() : value),
    },
    {
      name: 'purchaseAgentIdLov',
      type: 'object',
      label: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
      noCache: true,
      multiple: true,
      lovCode: 'HPFM.PURCHASE_AGENT_NOUSER',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'purchaseAgentIds',
      bind: 'purchaseAgentIdLov.purchaseAgentId',
      transformRequest: (value) => (isArray(value) ? value.join() : value),
    },
    {
      name: 'inventoryIdLov',
      type: 'object',
      label: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
      lovCode: 'SODR.INVENTORY',
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
    },
    {
      name: 'inventoryId',
      bind: 'inventoryIdLov.inventoryId',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_FINANCE}/v1/${organizationId}/bill/purchase-trx-line/bill-line`,
        method: 'GET',
        data,
      };
    },
  },
});

export default indexDS;
