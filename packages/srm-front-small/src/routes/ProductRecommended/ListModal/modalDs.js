import moment from 'moment';

import intl from 'utils/intl';
import { SRM_MALL } from '_utils/config';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID
const agreementHeaderTypeMapping = {
  4: 'MEMBER',
  5: 'AGENT',
  6: 'INTERNAL_TRANSACTION',
  7: 'RECEIVE',
};

const modalDs = ({ isEdit }) => ({
  selection: false,
  fields: [
    {
      name: 'includeNoStockFlag',
      type: 'string',
      defaultValue: 1,
      lookupCode: 'SMAL.PRODUCT_FILTER_TYPE_REC',
      label: intl.get('small.ProRecommend.model.incloudNonePro').d('默认显示商品范围'),
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') !== '3';
        },
      },
    },
    {
      name: 'catalog',
      label: intl.get('small.ProRecommend.model.skuRange').d('商品范围'),
      multiple: true,
      type: 'object',
      textField: 'catalogName',
      valueField: 'catalogId',
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '2';
        },
      },
    },
    {
      name: 'suppiler',
      label: intl.get('small.ProRecommend.model.skuRange').d('商品范围'),
      multiple: true,
      type: 'object',
      lovCode: 'SMAL.SUPPLIER_BY_PUR',
      lovPara: { tenantId: organizationId },
      textField: 'supplierName',
      valueField: 'supplierId',
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '1';
        },
      },
    },
    {
      name: 'active',
      label: intl.get('small.ProRecommend.model.skuRange').d('商品范围'),
      multiple: true,
      type: 'object',
      lovCode: 'SAGM.SALE_AGREEMENT_HEADER',
      computedProps: {
        required: ({ record }) => {
          return [4, 5, 6, 7].includes(+record.get('groupType'));
        },
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            agreementHeaderType: agreementHeaderTypeMapping[record.get('groupType')],
            statusCode: 'EFFECTED',
          };
        },
      },
    },
    {
      name: 'salesRank',
      lookupCode: 'SMAL.PRODUCT_GROUP_SALE',
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '3';
        },
      },
      label: intl.get('small.ProRecommend.model.skuRange').d('商品范围'),
    },
    {
      name: 'skuRange',
      disabled: true,
      label: intl.get('small.ProRecommend.model.skuRange').d('商品范围'),
    },
    {
      name: 'label',
      type: 'object',
      multiple: true,
      label: intl.get('small.ProRecommend.model.skuRange').d('商品范围'),
      lovCode: 'SMPC.SKU_LABEL',
      lovPara: { enabledFlag: 1 },
      textField: 'labelName',
      valueField: 'labelId',
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '8';
        },
      },
    },
    {
      name: 'groupName',
      type: 'intl',
      maxLength: 30,
      label: intl.get('small.ProRecommend.model.listName').d('列表名称'),
      required: true,
    },
    {
      name: 'groupAttribute',
      type: 'string',
      lookupCode: 'SMAL.PRODUCT_GROUP_ATTRIBUTE',
      disabled: isEdit,
      label: intl.get('small.ProRecommend.model.listAttribute').d('列表属性'),
      required: true,
    },
    {
      name: 'groupType',
      type: 'string',
      // lookupCode: 'SMAL.PRODUCT_GROUP_TYPE',
      label: intl.get('small.ProRecommend.model.listType').d('列表类型'),
      required: true,
      computedProps: {
        disabled: ({ record }) => {
          return !record.get('groupAttribute');
        },
      },
    },
    {
      name: 'orderType',
      type: 'string',
      lookupCode: 'SMAL.PRODUCT_GROUP_ORDER_TYPE',
      label: intl.get('small.ProRecommend.model.showSort').d('显示排序'),
      computedProps: {
        required: ({ record }) => {
          return [0, 1, 2, 5, 6, 7, 8].includes(+record.get('groupType'));
        },
      },
    },
    {
      name: 'validityDate',
      type: 'date',
      ignore: 'always',
      range: ['startDate', 'endDate'],
      format: DEFAULT_DATE_FORMAT,
      min: moment().format(DATETIME_MIN),
      label: intl.get('small.ProRecommend.model.validityDate').d('有效期'),
      computedProps: {
        required: ({ record }) => !record.get('startDate'),
      },
      // validator: (value) => {
      //   if (!value?.startDate) {
      //     return intl.get('small.common.view.inputValidateFrom').d('请输入有效期从');
      //   }else if(value?.startDate) {
      //     return true;
      //   }
      // },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      bind: 'validityDate.startDate',
    },
    {
      name: 'endDate',
      type: 'date',
      bind: 'validityDate.endDate',
    },
    {
      name: 'tagFlag',
      type: 'string',
      lookupCode: 'SMAL.PRODUCT_GROUP_TAG_FLAG',
      label: intl.get('small.ProRecommend.model.yesOrnoTag').d('是否打标'),
      required: true,
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '4';
        },
      },
    },
    {
      name: 'tagName',
      type: 'string',
      label: intl.get('small.ProRecommend.model.tagName').d('标签名称'),
      required: true,
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '4' && record.get('tagFlag') === '1';
        },
      },
    },
    {
      name: 'tagStyle',
      type: 'string',
      lookupCode: 'SMAL.PRODUCT_GROUP_TAG_STYLE',
      label: intl.get('small.ProRecommend.model.tagStyle').d('标签样式'),
      required: true,
      computedProps: {
        required: ({ record }) => {
          return record.get('groupType') === '4' && record.get('tagFlag') === '1';
        },
      },
    },
    {
      name: 'tagColor',
      label: intl.get('small.ProRecommend.model.tagColor').d('标签颜色'),
      defaultValue: 'A',
    },
  ],
});

const skuDs = () => ({
  primaryKey: 'productNum',
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'serialNumber',
      type: 'string',
      label: intl.get('small.ProRecommend.model.serialNumber').d('序号'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get('small.ProRecommend.model.skuCode').d('商品编码'),
      required: true,
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get('small.ProRecommend.model.skuName').d('商品名称'),
      required: true,
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('small.ProRecommend.model.supplier').d('供应商'),
      required: true,
    },
    {
      name: 'operation',
      label: intl.get('small.ProRecommend.model.operation').d('操作'),
      help: intl
        .get('small.ProRecommend.model.operationTipOfToppingA')
        .d(
          '置顶: 对商品行进行置顶操作以实现自定义商品的显示排序，若重置排序方式则置顶操作排序无效。置顶操作仅对“按加入时间排序“的规则有效。'
        ),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { filterParams = {}, ...otherParmas } = data;
      const { params = {} } = filterParams;
      if(!data.groupId) {
        return;
      };
      return {
        url: `${SRM_MALL}/v1/${organizationId}/product-group-assigns`,
        method: 'GET',
        data: { ...params, ...otherParmas },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/product-group-assigns`,
        data,
        method: 'DELETE',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
});

export { modalDs, skuDs };
