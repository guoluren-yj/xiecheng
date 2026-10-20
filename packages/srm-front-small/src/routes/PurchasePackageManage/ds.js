import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import moment from 'moment';
import {
  // DEFAULT_DATETIME_FORMAT,
  // DEFAULT_DATE_FORMAT,
  DATETIME_MIN,
  DATETIME_MAX,
} from 'utils/constants';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const tableDs = () => {
  return {
    autoQuery: true,
    autoCreate: true,
    pageSize: 20,
    selection: 'multiple',
    primaryKey: 'shoppingBarId',
    fields: [
      {
        label: intl.get('small.packages.purchase.status').d('状态'),
        name: 'enabledFlag',
      },
      {
        label: intl.get('small.packages.purchase.name').d('采购套餐名称'),
        name: 'shoppingBarName',
      },
      {
        label: intl.get('small.packages.purchase.description').d('采购套餐描述'),
        name: 'description',
      },
      {
        label: intl.get('small.packages.purchase.createTime').d('创建时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        label: intl.get('small.packages.purchase.startTime').d('开始时间'),
        type: 'date',
        name: 'startDate',
      },
      {
        label: intl.get('small.packages.purchase.endTime').d('截止时间'),
        type: 'date',
        name: 'endDate',
      },
      {
        label: intl.get('small.packages.purchase.valid.date').d('有效天数'),
        name: 'effectiveDay',
      },
      {
        label: intl.get('small.packages.purchase.edit').d('操作'),
        name: 'edit',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/shopping-bars`,
          method: 'GET',
          data: {
            ...data,
            companyId: -1,
            customizeUnitCode: 'SMAL_PACKAGE_CONTROL.SEARCH_BAR',
          },
        };
      },
      destroy: ({ data, dataSet }) => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/shopping-bars`,
          data,
          method: 'DELETE',
          transformResponse: res => {
            if (!res) {
              dataSet.query();
            }
          },
        };
      },
    },
  };
};

export const comboDs = shoppingBarId => {
  return {
    autoQuery: false,
    selection: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get('small.packages.purchase.name').d('采购套餐名称'),
        type: 'intl',
        name: 'shoppingBarName',
        required: true,
      },
      // {
      //   label: intl.get('small.packages.purchase.startTime').d('开始时间'),
      //   name: 'startDate',
      //   required: true,
      // },
      // {
      //   label: intl.get('small.packages.purchase.endTime').d('截止时间'),
      //   name: 'endDate',
      //   required: true,
      //   format: DATETIME_MAX,
      //   transformRequest: val => moment(val || {})?.format(DATETIME_MAX),
      //   computedProps: {
      //     min: ({ record }) => {
      //       if (isEmpty(record?.get('startDate'))) {
      //         return moment().format(DEFAULT_DATETIME_FORMAT);
      //       } else {
      //         return 'startDate';
      //       }
      //     },
      //   },
      // },
      {
        name: 'validityDate',
        type: 'date',
        ignore: 'always',
        required: true,
        range: ['startDate', 'endDate'],
        // format: DEFAULT_DATE_FORMAT,
        min: moment().format(DATETIME_MIN),
        label: intl.get('small.common.model.validate.date').d('有效期'),
        validator: value => {
          if (!value?.startDate) {
            return intl.get('small.common.view.inputValidateFrom').d('请输入有效期从');
          } else if (!value?.endDate) {
            return intl.get('small.common.view.inputValidateTo').d('请输入有效期至');
          }
        },
      },
      {
        name: 'imagePath',
        type: 'string',
      },
      {
        name: 'startDate',
        type: 'date',
        required: true,
        format: DATETIME_MIN,
        bind: 'validityDate.startDate',
      },
      {
        name: 'endDate',
        type: 'date',
        required: true,
        format: DATETIME_MAX,
        bind: 'validityDate.endDate',
        // transformRequest: (val) => moment(val || {})?.format(DATETIME_MAX),
      },
      {
        label: intl.get('small.packages.purchase.description').d('采购套餐描述'),
        type: 'intl',
        name: 'description',
      },
      {
        name: 'pageConfigAuthList',
        label: intl.get('small.packages.view.purchase.fenpei').d('采买组织分配'),
        required: true,
        type: 'object',
        textField: 'unitCodeName',
        valueField: 'unitId',
        multiple: true,
        transformResponse: (_, record) => {
          const { pageConfigAuthList } = record;
          const allUnit = {
            unitId: 'ALL',
            unitName: intl.get('small.packages.model.all.Organizations').d('所有组织'),
          };
          const list = isEmpty(pageConfigAuthList) ? [allUnit] : pageConfigAuthList;
          return list
            ? list.map(m => ({
                ...m,
                unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
              }))
            : list;
        },
        transformRequest: val => (val || {}).filter(f => f.unitId !== 'ALL'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/shopping-bars`,
          method: 'GET',
          data: {
            ...data,
            shoppingBarId,
          },
        };
      },
    },
  };
};

export const productDs = (shoppingBarId, type) => {
  return {
    autoQuery: false,
    selection: type === 'readOnly' ? false : 'multiple',
    primaryKey: 'barLineId',
    fields: [
      {
        label: intl.get('small.packages.product.type').d('商品类型'),
        name: 'sourceType',
      },
      {
        label: intl.get('small.packages.product.suppiler').d('供应商'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('small.packages.product.code').d('商品编码'),
        name: 'productNum',
      },
      {
        label: intl.get('small.packages.product.name').d('商品名称'),
        name: 'productName',
      },
      {
        label: intl.get('small.packages.purchase.quality').d('采购数量'),
        type: 'number',
        name: 'purchaseNumber',
        step: 1,
        min: 1,
      },
      {
        label: intl.get('small.packages.purchase.edit').d('操作'),
        name: 'edit',
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'purchaseNumber') {
          record.set('updateFlag', 1);
        }
      },
    },
    transport: {
      read: ({ data }) => {
        if (type !== 'create') {
          return {
            url: `${SRM_MALL}/v1/${organizationId}/shopping-bar-lines`,
            method: 'GET',
            data: {
              ...data,
              companyId: -1,
              shoppingBarId,
              customizeUnitCode: 'SMAL_PACKAGE_MANAGE.SEARCH_BAR',
            },
          };
        }
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/shopping-bar-lines`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};
