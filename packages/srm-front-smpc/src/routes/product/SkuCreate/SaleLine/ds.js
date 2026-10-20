import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { maxSMPCMessageValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();

const ladderDs = () => ({
  paging: false,
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get('sagm.common.model.lineNumber').d('行号'),
      name: 'lineNum',
    },
    {
      label: intl.get('sagm.common.model.numberFrom').d('数量从(>=)'),
      name: 'ladderFrom',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.numberTo').d('数量至(<)'),
      name: 'ladderTo',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.view.purchasePrice').d('采购价'),
      name: 'purchasePrice',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.salePrice').d('销售价'),
      name: 'salePrice',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.noTaxPrice').d('未税单价'),
      name: 'unitPrice',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.taxPrice').d('含税单价'),
      name: 'taxPrice',
      type: 'number',
    },
    {
      name: 'pointPrice',
      type: 'number',
      min: 0,
      step: 1,
      required: true,
      // max: '99999999999999999999',
      label: intl.get('sagm.common.view.pointPrice').d('积分价'),
      validator: maxSMPCMessageValidator,
    },
  ],
});

// 销售协议行
const saleLineDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
    { name: 'org', label: intl.get('smpc.product.view.organization').d('组织') },
    {
      name: 'marketPrice',
      type: 'number',
      label: intl.get('smpc.product.model.marketPrice').d('市场价'),
    },
    {
      name: 'purchasePrice',
      type: 'number',
      label: intl.get('smpc.product.view.purchasePrice').d('采购价'),
    },
    {
      name: 'sellingPrice',
      type: 'number',
      label: intl.get('smpc.product.view.salePrice').d('销售价'),
    },
    {
      name: 'pointPrice',
      type: 'number',
      label: intl.get('smpc.product.view.pointPrice').d('积分价'),
      min: 0,
      step: 1,
      dynamicProps: {
        required: ({ record }) => record.get('priceStrategyId'),
      },
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
    },
    {
      name: 'priceType',
      label: intl.get('smpc.product.view.isLadderPrice').d('是否有阶梯价格'),
    },
    {
      name: 'ladderPrices',
      label: intl.get('smpc.product.view.ladderPrice').d('阶梯价格'),
    },
    {
      name: 'currencyName',
      label: intl.get('smpc.product.view.currency').d('币种'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('smpc.product.view.taxRate').d('税率'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-agreement-lines/by-sku`,
      method: 'GET',
    },
    submit: {
      url: `/sagm/v1/${organizationId}/sale-agreement-lines/by-sku`,
      method: 'POST',
    },
  },
});

export { ladderDs, saleLineDs };
