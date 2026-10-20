import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

const headDs = ({ currentData }) => {
  return {
    autoQuery: false,
    autoCreate: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'defaultOrderingAddressId',
        label: intl.get(`${commonPrompt}.defaultOrderingAddressId`).d('收货地址'),
        type: 'object',
        lovCode: 'SMCT.ADDRESS.NOT_ENCRYPT',
        transformRequest: (value) => value && value.addressId,
        transformResponse: (_, object) => {
          return object?.defaultOrderingAddressId
            ? {
                addressId: object?.defaultOrderingAddressId,
                fullAddress: object?.defaultOrderingAddress,
                contactName: object?.defaultContactPerson,
                mobile: object?.defaultContactPhone,
              }
            : null;
        },
        dynamicProps: {
          lovPara: () => {
            return {
              companyId: currentData?.companyId,
              userld: getCurrentUser()?.id,
              belongType: 1,
            };
          },
        },
      },
      {
        name: 'defaultOrderingAddress',
        bind: 'defaultOrderingAddressId.fullAddress',
      },
      {
        name: 'prLineId',
      },
      {
        name: 'companyId',
      },
      {
        name: 'defaultContactPerson',
        label: intl.get(`${commonPrompt}.defaultContactPerson`).d('联系人'),
        bind: 'defaultOrderingAddressId.contactName',
      },
      {
        name: 'defaultContactPhone',
        bind: 'defaultOrderingAddressId.mobile',
        label: intl.get(`${commonPrompt}.defaultContactPhone`).d('联系电话'),
      },
      {
        name: 'itemCode',
        label: intl.get('entity.item.code').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('entity.item.name').d('物料名称'),
      },
    ],
  };
};

const lineDs = ({ currentData }) => {
  return {
    autoQuery: false,
    selection: 'single',
    // pageSize: 20,
    paging: false,
    fields: [
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sodr.common.model.common.localSupplierCompanyNum').d('本地供应商编码'),
        name: 'supplierCode',
      },
      {
        label: intl.get('sodr.common.model.common.localSupplierName').d('本地供应商名称'),
        name: 'supplierName',
      },
      {
        label: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
        name: 'taxPrice',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
        name: 'unitPrice',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get(`sodr.common.model.common.marketPrice`).d('划线价'),
        name: 'marketPrice',
      },
      {
        label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxType`).d('税种'),
        name: 'taxCode',
      },
      {
        label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        name: 'prPriceSourceMeaning',
      },
      {
        label: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.sourceOrderNumPro`).d('价格来源单据号'),
        name: 'orderNum',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateFrom`).d('有效期从'),
        name: 'validDateFrom',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateTo`).d('有效期至'),
        name: 'validDateTo',
      },
      {
        label: intl.get(`sprm.common.model.common.skuCodeAndName`).d('商品'),
        name: 'skuCodeAndName',
      },
      {
        label: intl.get(`sprm.common.model.common.productEcSourceFrom`).d('价格商品电商平台编码'),
        name: 'productEcSourceFrom',
      },
      {
        name: 'ecLimitQuantity',
        label: intl.get(`sprm.common.model.order.ecLimitQuantity`).d('电商起订量'),
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.date.creation.price`).d('价格创建时间'),
        name: 'creationDate',
        type: 'dateTime',
        format: DEFAULT_DATE_FORMAT,
      },
    ],
    queryFields: [
      // 选择供应商及价格
      {
        type: 'string',
        merge: true,
        name: 'queryPriceSupplierCode',
        label: intl.get(`${commonPrompt}.supplierCode`).d('供应商编码'),
      },

      {
        type: 'string',
        display: true,
        name: 'queryPriceProductCode',
        label: intl.get(`${commonPrompt}.queryPriceProductCode`).d('商品编码'),
      },
      {
        label: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
        name: 'taxPrice',
        type: 'number',
        visible: false,
        sortFlag: true,
      },
      {
        label: intl.get(`sprm.common.model.common.validDateFrom`).d('有效期从'),
        name: 'validDateFrom',
        type: 'date',
        visible: false,
        sortFlag: true,
      },
      {
        label: intl.get(`sprm.common.model.common.validDateTo`).d('有效期至'),
        name: 'validDateTo',
        type: 'date',
        visible: false,
        sortFlag: true,
      },
      {
        label: intl.get(`hzero.common.date.creation`).d('创建日期'),
        name: 'creationDate',
        type: 'date',
        sortFlag: true,
        visible: false,
        format: DEFAULT_DATE_FORMAT,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { customizeOrderField, ...other } = data || {};
        return {
          url: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-requests/pr-line/select-price-recommend-supplier-lov`,
          method: 'POST',
          data: {
            ...currentData,
            ...other,
            referencePriceDisplayFlag: null,
            sortFieldAndRule: customizeOrderField ? customizeOrderField.replace(/:/g, ',') : null,
          },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((ele) => {
          if (
            (ele.get('priceLibId') === currentData?.priceLibId && ele.get('priceLibId')) ||
            (ele.get('skuId') === currentData?.priceProductId &&
              ele.get('skuId') &&
              ele.get('skuId'))
          ) {
            dataSet.select(ele);
          }
        });
      },
    },
  };
};

export { headDs, lineDs };
