/**
 * 2026-02-10 productPriceDS.js
 * 商品价格页面 DataSet
 * Author: Felix(LQX5731@163.com)
 * Version: 1.0.0
 * Last Update: 2026-03-12
 */

import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

export const ProductPriceDS = () => ({
  pageSize: 20,
  primaryKey: 'marketDataId',
  transport: {
    read: ({ data, params }) => {
      const { priceDate, ...restData } = data;
      const newParams = { ...params };

      const dateList = Array.isArray(priceDate) ? priceDate : priceDate?.split(',');

      if (dateList && dateList.length > 0 && !newParams.businessDateStart) {
        newParams.businessDateStart = dateList?.[0] || '';
      }
      if (dateList && dateList.length > 0 && !newParams.businessDateEnd) {
        newParams.businessDateEnd = dateList?.[1] || '';
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-market-data`,
        method: 'GET',
        params: {
          ...restData,
          ...newParams,
        },
      };
    },
  },
  fields: [
    {
      name: 'dataSourceCode',
      label: intl.get('sdat.productPrice.model.dataSourceCode').d('数据源编码'),
      type: 'string',
    },
    {
      name: 'dataSourceName',
      label: intl.get('sdat.productPrice.model.dataSourceName').d('数据源名称'),
      type: 'string',
    },
    {
      name: 'commodityCode',
      label: intl.get('sdat.productPrice.model.commodityCode').d('商品编码'),
      type: 'string',
    },
    {
      name: 'specifications',
      label: intl.get('sdat.productPrice.model.model').d('规格型号'),
      type: 'string',
    },
    {
      name: 'market',
      label: intl.get('sdat.productPrice.model.market').d('市场'),
      type: 'string',
    },
    {
      name: 'priceUnit',
      label: intl.get('sdat.productPrice.model.unit').d('价格单位'),
      type: 'string',
    },
    {
      name: 'price',
      label: intl.get('sdat.productPrice.model.price').d('价格'),
      type: 'number',
    },
    {
      name: 'maxPrice',
      label: intl.get('sdat.productPrice.model.maxPrice').d('最高价'),
      type: 'number',
    },
    {
      name: 'minPrice',
      label: intl.get('sdat.productPrice.model.minPrice').d('最低价'),
      type: 'number',
    },
    {
      name: 'businessDate',
      label: intl.get('sdat.productPrice.model.businessDate').d('价格业务时间'),
      type: 'date',
    },
    {
      name: 'collectionDate',
      label: intl.get('sdat.productPrice.model.collectionDate').d('价格采集时间'),
      type: 'dateTime',
    },
    //  {
    //    name: 'priceType',
    //    label: intl.get('sdat.productPrice.model.priceType').d('价格类型'),
    //    type: 'string',
    //  },
  ],
  queryFields: [
    {
      name: 'specifications',
      label: intl.get('sdat.productPrice.view.model').d('规格型号'),
      type: 'string',
    },
    {
      name: 'market',
      label: intl.get('sdat.productPrice.view.market').d('市场'),
      type: 'string',
    },
    {
      name: 'priceTypeList',
      label: intl.get('sdat.productPrice.model.priceType').d('价格类型'),
      type: 'string',
      lookupCode: 'SDAT.MDC_PRICE_TYPE',
      multiple: true,
    },
    {
      name: 'priceDate',
      label: intl.get('sdat.productPrice.view.priceBusinessTime').d('价格业务时间'),
      type: 'date',
      range: true,
      // required: true,
      defaultValue: [moment().subtract(30, 'days'), moment()],
      // validator: (value) => {
      //   if (value && value[0] && value[1]) {
      //     const start = moment(value[0]);
      //     const end = moment(value[1]);
      //     if (end.diff(start, 'days') > 30) {
      //       return intl
      //         .get('sdat.productPrice.view.validation.priceDateRangeLimit')
      //         .d('日期范围不能超过30天');
      //     }
      //   }
      //   return true;
      // },
    },
    // {
    //   name: 'businessDateStart',
    // },
    // { name: 'businessDateEnd' },
  ],
});

export const TieredPriceDS = () => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-market-tiered-data`,
        method: 'GET',
        params: {
          ...data,
          ...params,
        },
      };
    },
  },
  fields: [
    {
      name: 'priority',
      label: intl.get('sdat.productManagement.model.priority').d('优先级'),
    },
    {
      name: 'tieredName',
      label: intl.get('sdat.productManagement.model.tieredName').d('阶梯名称'),
    },
    {
      name: 'tieredCode',
      label: intl.get('sdat.productManagement.model.tieredCode').d('阶梯编码'),
    },
    {
      name: 'commodityCode',
      label: intl.get('sdat.productManagement.model.commodityCode').d('商品编码'),
    },
    {
      name: 'price',
      label: intl.get('sdat.productManagement.model.price').d('价格'),
      type: 'number',
    },
    {
      name: 'maxPrice',
      label: intl.get('sdat.productManagement.model.maxPrice').d('最高价'),
      type: 'number',
    },
    {
      name: 'minPrice',
      label: intl.get('sdat.productManagement.model.minPrice').d('最低价'),
      type: 'number',
    },
    {
      name: 'specifications',
      label: intl.get('sdat.productPrice.model.model').d('规格型号'),
      type: 'string',
    },
    {
      name: 'market',
      label: intl.get('sdat.productPrice.model.market').d('市场'),
      type: 'string',
    },
    {
      name: 'priceUnit',
      label: intl.get('sdat.productPrice.model.unit').d('价格单位'),
      type: 'string',
    },
    {
      name: 'businessDate',
      label: intl.get('sdat.productPrice.model.businessDate').d('价格业务时间'),
      type: 'date',
    },
    {
      name: 'collectionDate',
      label: intl.get('sdat.productPrice.model.collectionDate').d('价格采集时间'),
      type: 'dateTime',
    },
  ],
  queryFields: [
    {
      name: 'tieredName',
      label: intl.get('sdat.productManagement.model.tierName').d('阶梯名称'),
    },
  ],
});
