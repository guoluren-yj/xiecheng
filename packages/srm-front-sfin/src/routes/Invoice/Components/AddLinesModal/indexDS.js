import moment from 'moment';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { SRM_SPUC, SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const promptCode = 'sfin.invoiceBill';
const organizationId = getCurrentOrganizationId();

const indexDS = (type, invoiceHeaderId) => ({
  dataToJSON: 'selected',
  fields: [
    {
      label: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
      name: 'displayTrxNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别'),
      name: 'businessTypeMeaning',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.itemCode`).d('物料编码'),
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
      name: 'specifications',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.uomName`).d('单位'),
      name: 'uom',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.quantity`).d('数量'),
      name: 'quantity',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.remainInvoiceNumber`).d('剩余可开票数量'),
      name: 'remainInvoiceNumber',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantity`).d('本次开票数量'),
      name: 'currentInvoiceNumber',
      type: 'number',
      step: 0.000001,
      dynamicProps: {
        max: ({ record }) => (record.get('quantity') < 0 ? -1 : 9999999999),
        min: ({ record }) => (record.get('quantity') < 0 ? -9999999999 : 0.000001),
      },
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
      name: 'freeTaxPrice',
      type: 'number',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
      name: 'freeTaxPriceAmount',
      type: 'number',
    },
    {
      label: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
      name: 'taxRate',
      noCache: true,
      lovCode: 'SPRM.TAX',
      valueField: 'taxRate',
      textField: 'taxRate',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
      name: 'taxPrice',
      type: 'number',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
      name: 'taxPriceAmount',
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
      label: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
      name: 'trxDate',
      type: 'date',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.parentNumber`).d('父事务编号|行号'),
      name: 'parentNumber',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.asnNum`).d('送货单号|行号'),
      name: 'asnNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
      name: 'poNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.displayLineLocationNum`).d('发运号'),
      name: 'lineLocationNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
      name: 'releaseNum',
    },
    {
      label: intl.get(`sfin.invoiceBill.model.invoiceBill.billNumber`).d('开票申请单号|行号'),
      name: 'billNumber',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.orderTypeName`).d('订单类型'),
      name: 'orderTypeName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
      name: 'purchaseOrganizationName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织'),
      name: 'repertoryOrganizationName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
      name: 'inventoryName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.purchaseAgentName`).d('采购员'),
      name: 'agentName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
      name: 'supplierCode',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
      name: 'supplierSiteName',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.partnerName`).d('出票方'),
      name: 'partnerNum',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.sourceCode`).d('数据来源代码'),
      name: 'sourceCode',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.externalSystemCode`).d('外部来源系统代码'),
      name: 'externalSystemCode',
    },
    {
      label: intl
        .get(`${promptCode}.model.invoiceBill.sourceOrderTypeName`)
        .d('对账数据来源单据类型'),
      name: 'sourceOrderTypeNameMeaing',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.invoiceCreationDate`).d('开票单日期'),
      name: 'creationDate',
      type: 'date',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.trxYear`).d('事务年度'),
      name: 'trxYear',
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.needInvoiceFlag`).d('移除标识'),
      name: 'needInvoiceFlag',
    },
  ],
  queryFields: [
    {
      name: 'poNum',
      label: intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号'),
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
      name: 'billNumber',
      label: intl.get(`${promptCode}.model.invoiceBill.invoiceApplicationForm`).d('开票申请单'),
    },
    {
      name: 'displayTrxNum',
      label: intl.get(`${promptCode}.model.invoiceBill.displayTrxNum`).d('事务编号'),
    },
    {
      name: 'itemName',
      label: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料名称'),
    },
    {
      label: intl.get(`${promptCode}.model.invoiceBill.itemCode`).d('物料编码'),
      name: 'itemCodeQuery',
    },
    {
      name: 'companyId',
      type: 'object',
      label: intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司'),
      noCache: true,
      lovCode: 'SPFM.USER_AUTH.CUSTOMER',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.companyId,
    },
    {
      name: 'ouId',
      type: 'object',
      label: intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体'),
      noCache: true,
      lovCode: 'HPFM.OU',
      cascadeMap: { companyId: 'companyId' },
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value && value.ouId,
    },
    {
      name: 'purOrganizationId',
      type: 'object',
      label: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
      noCache: true,
      lovCode: 'HPFM.PURCHASE_ORGANIZATION', // 未配置
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value && value.purOrganizationId,
    },
    {
      name: 'agentName',
      label: intl.get(`${promptCode}.model.invoiceBill.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'needInvoiceFlag',
      label: intl.get(`${promptCode}.model.invoiceBill.filter.needInvoiceFlag`).d('显示已移除数据'),
      lookupCode: 'HPFM.FLAG_XF',
      defaultValue: '1',
    },
    {
      name: 'inventoryId',
      type: 'object',
      label: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
      lovCode: 'SODR.INVENTORY',
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
      transformRequest: (value) => value && value.inventoryId,
    },
    {
      name: 'displayReverseFlag',
      type: 'string',
      label: intl
        .get(`${promptCode}.model.invoiceBill.filter.displayReverseFlag`)
        .d('显示冲销数据'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url:
          data.businessType === 'ACCEPT'
            ? `${SRM_SPUC}/v1/${organizationId}/accept-line/for-invocie`
            : type === 'purchaser'
            ? `${SRM_FINANCE}/v1/${organizationId}/invoice/purchaser-ap-create`
            : `${SRM_FINANCE}/v1/${organizationId}/invoice/create`,
        method: 'GET',
        data: {
          ...data,
          invoiceHeaderId,
        },
        transformResponse: (res) => {
          if (res) {
            const newData = (JSON.parse(res).content || []).map((item) => ({
              ...item,
              rowKey: uuidv4(),
            }));
            return { ...JSON.parse(res), content: newData };
          } else {
            return res;
          }
        },
      };
    },
  },
});

export default indexDS;
