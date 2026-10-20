import { isEmpty } from 'lodash';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { fetchProductPriceService, fetchSkuStockService } from '../api';

const tableDS = ({ fullAddress, addressId, companyId, regionCodeList = [], setResData }) => ({
  autoQuery: false,
  primaryKey: 'skuId',
  cacheSelection: true,
  pageSize: 20,
  record: {
    dynamicProps: {
      selectable: (record) => record?.get('saleState') === 1 && record.get('stockFlag'),
    },
  },
  fields: [
    {
      name: 'saleState',
      label: intl.get('smpc.product.model.saleState.state').d('可售状态'),
    },
    {
      name: 'supplierCompanyCode',
      label: intl.get('sagm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sagm.common.view.supplier.name').d('供应商名称'),
    },
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    { name: 'imagePath', label: intl.get('smpc.product.view.skuImage').d('商品图片') },
    { name: 'salePrice', label: intl.get('smpc.product.view.taxPrice').d('单价(含税)') },
    { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    { name: 'currencyName', label: intl.get('smpc.product.model.currency').d('币种') },
    {
      name: 'limitQuantity',
      label: intl.get('smpc.product.view.orderQuantity').d('起订量'),
    },
    {
      name: 'skuStock',
      label: intl.get('smpc.product.model.skuStock').d('库存量'),
    },
    {
      name: 'deliveryCycle',
      label: intl.get('smpc.product.model.deliveryCycle').d('供货周期'),
    },
  ],
  queryFields: [
    {
      name: 'skuName',
      label: intl.get('smpc.product.view.skuNameCode').d('商品名称、编码'),
      merge: true,
    },
    {
      name: 'thirdSkuCode',
      label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
    },
    {
      name: 'itemCode',
      label: intl.get('smpc.product.view.itemNameAndCode').d('物料名称、编码'),
      lovCode: 'SMAL.CUSTOMER_ITEM',
      type: 'object',
      valueField: 'itemCode',
      textField: 'itemName',
      display: true,
    },
    {
      name: 'supplierCompanyId',
      label: intl.get('smpc.product.view.supplier').d('供应商'),
      lovCode: 'SMPC.TENANT_SUPPLIER_ALL',
      type: 'object',
      valueField: 'supplierCompanyId',
      display: true,
    },
    {
      name: 'salePrice',
      label: intl.get('smpc.product.view.salePrice').d('价格'),
      sortFlag: true,
      visible: false,
    },
    {
      name: 'quantity',
      label: intl.get('smpc.product.view.saleQuantity').d('销量'),
      sortFlag: true,
      visible: false,
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/smpc/v1/${getCurrentOrganizationId()}/pur-skus/srm/ec-list`,
        method: 'POST',
        data: {
          ...data,
          companyId,
          addressId,
          checkSaleFlag: 1,
          shelfStatus: 1,
          requestFrom: 'PR_EXECUTE',
        },
      };
    },
  },
  feedback: {
    loadSuccess: (resp) => {
      const { content } = resp || {};
      setResData(content);
    },
  },
  events: {
    query: ({ dataSet }) => {
      // 需要输入查询条件(排序也不行)才查询
      const { customizeOrderField, __dirty, ...other } =
        dataSet.queryDataSet.current.toData() || {};
      if (isEmpty(other)) return false;
      // 手动分页无需调接口
      if (dataSet.getState('queryFlag') === 0) {
        dataSet.setState('queryFlag', 1);
        return false;
      }
    },
    load: async ({ dataSet }) => {
      // 接口最多查询出来200条，页面展示20条
      if (dataSet.pageSize === 500) {
        dataSet.splice(20, 200);
        dataSet.remove(dataSet.destroyed, true);
        // eslint-disable-next-line
        dataSet.pageSize = 20;
      }
      const skus = dataSet.map((record) => {
        const { thirdSkuId: skuId, sourceFrom: supplierCode } = record.get([
          'thirdSkuId',
          'sourceFrom',
        ]);
        return {
          skuId,
          skuNum: 1,
          supplierCode,
        };
      });
      const batchSkuIds = dataSet.map((record) => {
        const { categoryCode, thirdSkuId, sourceFrom } = record.get([
          'categoryCode',
          'thirdSkuId',
          'sourceFrom',
        ]);
        return { categoryCode, skuId: thirdSkuId, supplierCode: sourceFrom };
      });
      if (isEmpty(batchSkuIds)) return;
      const param = {
        address: fullAddress,
        provinceId: regionCodeList[0],
        cityId: regionCodeList[1],
        countyId: regionCodeList[2],
        tenantId: getCurrentOrganizationId(),
        addressId,
      };
      // 价格查询
      const res = getResponse(await fetchProductPriceService({ ...param, skus }));
      // 库存查询
      const stockRes = getResponse(await fetchSkuStockService({ ...param, batchSkuIds }));
      if (res && stockRes) {
        dataSet.forEach((record) => {
          const { marketPrice, purchasePrice, saleState, sellPrice } =
            res.find((n) => n.skuId === record.get('thirdSkuId')) || {};
          const { stockState, skuStock } =
            stockRes.result?.find((n) => n.skuId === record.get('thirdSkuId')) || {};
          record.init({
            marketPrice,
            purchasePrice,
            saleState,
            sellPrice,
            stockFlag: stockState !== 5 && skuStock !== 0, // 是否有库存
            skuStock,
          });
        });
      }
    },
  },
});

export { tableDS };
