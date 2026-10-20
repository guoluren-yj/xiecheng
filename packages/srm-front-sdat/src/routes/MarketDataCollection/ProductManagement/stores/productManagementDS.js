/**
 * 2026-02-10 productManagementDS.js
 * 商品管理页面 DataSet
 * Author: Felix(LQX5731@163.com)
 * Version: 1.0.0
 * Last Update: 2026-03-02
 */

import intl from 'utils/intl';
import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

const optionDs = new DataSet({
  transport: {
    read: ({ data, params }) => ({
      url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity-category/tree`,
      method: 'GET',
      params: {
        ...data,
        ...params,
        page: -1,
        enabledFlag: 1,
      },
      transformResponse: res => {
        let formatData = [];
        try {
          const dataContent = JSON.parse(res);
          if (dataContent && Array.isArray(dataContent)) {
            formatData = dataContent;
          } else if (dataContent && Array.isArray(dataContent.content)) {
            formatData = dataContent.content;
          }
        } catch (e) {
          return res;
        }

        const flatData = [];
        const flatten = items => {
          items.forEach(item => {
            const { children, endFlag, ...rest } = item;
            flatData.push({
              ...rest,
              disabled: endFlag == 0 && !(children && children.length > 0),
            });
            if (children && children.length > 0) {
              flatten(children);
            }
          });
        };

        flatten(formatData);
        return flatData;
      },
    }),
  },
  autoQuery: true,
  parentField: 'parentCode',
  idField: 'categoryCode',
  fields: [
    { name: 'categoryCode', type: 'string' },
    { name: 'parentCode', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'categoryName', type: 'string' },
  ],
});

/**
 * 商品管理列表
 * @returns
 */
export const ProductListDS = () => ({
  primaryKey: 'id',
  autoQuery: false,
  selection: false,
  transport: {
    read: ({ data, params }) => ({
      url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity`,
      method: 'GET',
      params: {
        ...data,
        ...params,
      },
    }),
  },
  fields: [
    {
      name: 'commodityCode',
      label: intl.get('sdat.productManagement.model.commodityCode').d('商品编码'),
      type: 'string',
    },
    {
      name: 'commodityName',
      label: intl.get('sdat.productManagement.model.commodityName').d('商品名称'),
      type: 'string',
    },
    {
      name: 'oneCategoryName',
      label: intl.get('sdat.productManagement.model.categoryL1').d('一级分类'),
      type: 'string',
    },
    {
      name: 'twoCategoryName',
      label: intl.get('sdat.productManagement.model.categoryL2').d('二级分类'),
      type: 'string',
    },
    {
      name: 'threeCategoryName',
      label: intl.get('sdat.productManagement.model.categoryL3').d('三级分类'),
      type: 'string',
    },
    {
      name: 'tieredPricing',
      label: intl.get('sdat.productManagement.model.isTieredPrice').d('阶梯价'),
      type: 'string',
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      name: 'remark',
      label: intl.get('sdat.productManagement.model.remark').d('备注'),
      type: 'string',
    },
    {
      name: 'type',
      label: intl.get('sdat.productManagement.model.type').d('类型'),
      type: 'string',
      lookupCode: 'SDAT.DATA_COLLECTON_CATEGORY_TYPE',
    },
    {
      name: 'effectiveFlag',
      label: intl.get('sdat.productManagement.model.status').d('状态'),
      type: 'string',
      lookupCode: 'SDAT.DATA_COLLECTON_CATEGORY_STATUS',
    },
    {
      name: 'startDate',
      label: intl.get('sdat.productManagement.model.effectiveDateFrom').d('有效期从'),
      type: 'dateTime',
    },
    {
      name: 'endDate',
      label: intl.get('sdat.productManagement.model.effectiveDateTo').d('有效期至'),
      type: 'dateTime',
    },
  ],
  queryFields: [
    {
      name: 'commodityName',
      label: intl.get('sdat.productManagement.model.commodityNameOrCode').d('商品名称或编码'),
      type: 'string',
    },
    {
      name: 'tieredPricing',
      label: intl.get('sdat.productManagement.model.isTieredPrice').d('阶梯价'),
      type: 'string',
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      name: 'type',
      label: intl.get('sdat.productManagement.model.type').d('类型'),
      type: 'string',
      lookupCode: 'SDAT.DATA_COLLECTON_CATEGORY_TYPE',
    },
    {
      name: 'startDateRange',
      label: intl.get('sdat.productManagement.model.effectiveDateFrom').d('有效期从'),
      type: 'date',
      range: true,
    },
    {
      name: 'endDateRange',
      label: intl.get('sdat.productManagement.model.effectiveDateTo').d('有效期至'),
      type: 'date',
      range: true,
    },
    {
      name: 'effectiveFlag',
      label: intl.get('sdat.productManagement.model.status').d('状态'),
      type: 'string',
      lookupCode: 'SDAT.DATA_COLLECTON_CATEGORY_STATUS',
    },
  ],
});

/**
 * 商品管理详情
 * @returns
 */
export const ProductDetailDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'commodityName',
      label: intl.get('sdat.productManagement.model.name').d('商品名称'),
      type: 'intl',
      required: true,
      maxLength: 30,
    },
    {
      name: 'commodityCode',
      label: intl.get('sdat.productManagement.model.code').d('商品编码'),
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 23,
      pattern: /^[a-zA-Z0-9_]*$/,
      format: 'uppercase',
      defaultValidationMessages: {
        patternMismatch: intl
          .get(`amkt.productManage.model.code.pattern`)
          .d('只能包含字母、数字和下划线'),
      },
    },
    {
      name: 'categoryTree',
      label: intl.get('sdat.productManagement.model.category').d('商品分类'),
      type: 'string',
      required: true,
      options: optionDs,
      textField: 'categoryName',
      valueField: 'categoryCode',
    },
    {
      label: intl.get(`amkt.productManage.model.categoryLevel1`).d('一级分类'),
      name: 'oneCategory',
      type: 'string',
    },
    {
      label: intl.get(`amkt.productManage.model.categoryLevel2`).d('二级分类'),
      name: 'twoCategory',
      type: 'string',
    },
    {
      label: intl.get(`amkt.productManage.model.categoryLevel3`).d('三级分类'),
      name: 'threeCategory',
      type: 'string',
    },
    {
      name: 'remark',
      label: intl.get('sdat.productManagement.model.remark').d('备注'),
      type: 'string',
      maxLength: 500,
    },
    {
      name: 'enabledFlag',
      label: intl.get('sdat.productManagement.model.status').d('状态'),
      type: 'string',
      lookupCode: 'SDAT.DATA_COLLECTON_CATEGORY_STATUS',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '0',
    },
  ],
});

export const GetPriceDS = (startDate, endDate) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'priceDate',
      label: intl.get('sdat.productManagement.model.priceBusinessDate').d('价格业务时间'),
      type: 'date',
      range: true,
      required: true,
      max: endDate,
      min: startDate,
      validator: value => {
        if (value && value[0] && value[1]) {
          const start = moment(value[0]);
          const end = moment(value[1]);
          if (end.diff(start, 'days') >= 7) {
            return intl
              .get('sdat.productManagement.view.validation.priceDateRange')
              .d('价格业务区间不能超过7天');
          }
        }
        return true;
      },
    },
  ],
});

export const TieredPriceDS = () => ({
  selection: false,
  paging: false,
  transport: {
    read: ({ data, params }) => ({
      url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity-tiered-info`,
      method: 'GET',
      params: {
        ...data,
        ...params,
      },
    }),
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
  ],
});
