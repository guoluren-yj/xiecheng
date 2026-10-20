import intl from 'utils/intl';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const priceTable = () => ({
  selection: 'single',
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get(`sodr.common.model.common.supplierCode`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
    },
    {
      name: 'taxPrice',
      label: intl.get(`sodr.common.model.common.taxPrice`).d('含税单价'),
    },
    {
      name: 'unitPrice',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
    },
    {
      name: 'uomCodeName',
      label: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
    },
    {
      name: 'taxCode',
      label: intl.get(`sodr.common.model.common.taxType`).d('税种'),
    },
    {
      name: 'taxRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
    },
    {
      name: 'ladderPrice',
      label: intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格'),
    },
    {
      name: 'priceSource',
      label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
    },
    {
      name: 'orderNum',
      label: intl.get(`sodr.common.model.common.priceSourceDocumentNum`).d('价格来源单据号'),
    },
  ],
});

const ladderPrice = () => ({
  selection: false,
  fields: [
    {
      name: 'ladderLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'numberRange',
      label: intl.get('sodr.workspace.model.common.numberRange').d('数量范围'),
    },
    {
      name: 'ladderPrice',
      label: intl.get('sodr.workspace.model.common.price').d('价格'),
    },
    {
      name: 'ladderPriceRemark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
  ],
});

export { priceTable, ladderPrice };
