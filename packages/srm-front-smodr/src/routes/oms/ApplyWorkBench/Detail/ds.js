/* eslint-disable no-param-reassign */
import { math } from 'choerodon-ui/dataset';
import { runInAction } from 'mobx';

import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { baseDsFields, tableDsFields, editDsFields } from './dataSource';

const organizationId = getCurrentOrganizationId();

const baseDs = () => ({
  selection: false,
  fields: baseDsFields(),
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/mall-requests/detail`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMODR.REQUEST.DETAIL.BASE.INFO',
        },
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'handleAgentByName') {
        const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = value;
        if (purchaseAgentId) {
          record.set('handleAgentByCode', purchaseAgentCode);
          record.set('handleAgentBy', purchaseAgentId);
          record.set('handleAgentByName', purchaseAgentName);
        }
      }
    },
  },
});

const tableDs = (type = undefined, handleReceive) => ({
  selection: type ? 'multiple' : false,
  cacheSelection: true,
  forceValidate: true,
  primaryKey: 'requestEntryId',
  pageSize: 20,
  fields: tableDsFields(type, handleReceive),
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/detail-list`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMODR.REQUEST.DETAIL.SKU.INFO, SMODR.REQUEST.DETAIL.SKU.SEARCHBAR1',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.selectable = record.get('lineStatus') !== 'CANCELED' && record.get('sourceType') !== 'EC';
      });
    },
    update: ({ record, name, value }) => {
      const quantity = record.get('quantity');
      const unitPrice = record.get('unitPrice');
      const nakedUnitPriceMeaning = record.get('nakedUnitPriceMeaning');
      if (name === 'unitPrice' && ![null, undefined].includes(value)) {
        record.set('amountMeaning', math.multipliedBy(value, quantity));
        record.set('amount', math.multipliedBy(value, quantity));
      } if (name === 'quantity' && ![null, undefined].includes(value)) {
        record.set('amountMeaning', math.multipliedBy(value, unitPrice));
        record.set('amount', math.multipliedBy(value, unitPrice));
        record.set('nakedAmountMeaning', math.multipliedBy(value, nakedUnitPriceMeaning));
        record.set('nakedAmount', math.multipliedBy(value, nakedUnitPriceMeaning));
      }
      if (name === 'receiveFullAddress') {
        const { contactName = '', internationalTelCode = '', mobile = '', fullAddress, addressId, address } = value || {};
        if (addressId) {
          runInAction(() => {
            record.set('receiveContactName', contactName);
            record.set('receiveMobilePhone', mobile);
            record.set('internationalTelCode', internationalTelCode);
            record.set('receiveFullAddress', fullAddress);
            record.set('receiveAddress', address);
            record.set('receiveAddressId', addressId);
          });
        }
      }
      if (name === 'supplierCompanyName') {
        const { supplierCompanyId, supplierCompanyNum, supplierCompanyName, supplierTenantId } = value || {};
        if (supplierCompanyId) {
          record.set('supplierCompanyId', supplierCompanyId);
          record.set('supplierCompanyName', supplierCompanyName);
          record.set('supplierCompanyCode', supplierCompanyNum);
          record.set('supplierTenantId', supplierTenantId);
        }
      }
      // 物料
      if (name === 'itemCode') {
        const { itemName, itemCode, itemId, categoryId, categoryCode, categoryName, uomId, uomCode, uomName, uomPrecision } = value || {};
        if (!value) {
          record.set('itemId', null);
          record.set('itemName', null);
          record.set('uomName', null);
        }
        if (itemName) {
          record.set('itemName', itemName);
          record.set('itemCode', itemCode);
          record.set('itemId', itemId);
          record.set('uomName', { uomName, uomId });
          record.set('itemCategoryId', categoryId);
          record.set('itemCategoryCode', categoryCode);
          record.set('itemCategoryName', categoryName);
          record.set('itemUomId', uomId);
          record.set('itemUomCode', uomCode);
          record.set('itemUomName', uomName);
          record.set('uomPrecision', uomPrecision);
        }
      }
      // 单位
      if (name === 'uomName') {
        const { uomId, uomCode, uomName } = value || {};
        if (uomId) {
          record.set('uomId', uomId);
          record.set('uomCode', uomCode);
          record.set('uomName', uomName);
        }
      }
      if (name === 'taxRate') {
        const { taxId, taxCode, taxRate } = value || {};
        if (taxId) {
          record.set('taxId', taxId);
          record.set('taxCode', taxCode);
          record.set('taxRate', taxRate);
        }
      }
      if (name === 'ouLov') {
        record.set('purOrganizationLov', null);
        record.set('invOrganizationLov', null);
      }
      if (name === 'purOrganizationLov') {
        record.set('invOrganizationLov', null);
      }
    },
  },
});

const editDs = (flag) => ({
  selection: false,
  fields: editDsFields(flag),
});

const receiveDs = (recordData) => ({
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'skuCodeLov',
      type: 'object',
      label: intl.get('smodr.apply.model.reSkuCode').d('领用商品编码'),
      lovCode: 'SPMC.RECEIVE_SKU_FOR_APPLY',
      computedProps: {
        lovPara: () => {
          const data = recordData?.get('dimValueDTO')?.productDimensionMap;
          return {
            unitLevelPath: recordData.get('purUnitLevelPath'),
            ...data,
          };
        },
      },
    },
    // {
    //   name: 'skuId',
    //   bind: 'skuCodeLov.skuId',
    // },
    // {
    //   name: 'skuCode',
    //   bind: 'skuCodeLov.skuCode',
    // },
    // {
    //   name: 'surplusStock',
    //   bind: 'skuCodeLov.surplusStock',
    // },
    // {
    //   name: 'uomId',
    //   bind: 'skuCodeLov.uomId',
    // },
    // {
    //   name: 'uomCode',
    //   bind: 'skuCodeLov.uomCode',
    // },
    // {
    //   name: 'itemId',
    //   bind: 'skuCodeLov.itemId',
    // },
    // {
    //   name: 'itemUomId',
    //   bind: 'skuCodeLov.itemUomId',
    // },
    // {
    //   name: 'itemUomCode',
    //   bind: 'skuCodeLov.itemUomCode',
    // },
    // {
    //   name: 'itemUomName',
    //   bind: 'skuCodeLov.itemUomName',
    // },
    // {
    //   name: 'inventoryId',
    //   bind: 'skuCodeLov.inventoryId',
    // },
    // {
    //   name: 'inventoryCode',
    //   bind: 'skuCodeLov.inventoryCode',
    // },
    {
      name: 'skuName',
      // bind: 'skuCodeLov.skuName',
      type: 'string',
      label: intl.get('smodr.apply.model.reSkuName').d('领用商品名称'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    {
      name: 'itemCode',
      // bind: 'skuCodeLov.itemCode',
      type: 'object',
      label: intl.get('smodr.apply.model.reItemCode').d('领用物料编码'),
      lovCode: 'SMCT.ITEM_RELATE_PURCHASE_PRICE',
    },
    {
      name: 'itemName',
      // bind: 'skuCodeLov.itemName',
      type: 'string',
      label: intl.get('smodr.apply.model.reItemName').d('领用物料名称'),
      required: true,
    },
    {
      name: 'inventoryName',
      // bind: 'skuCodeLov.inventoryName',
      type: 'object',
      label: intl.get('smodr.apply.model.reWareHouse').d('领用库房'),
      required: true,
      lovCode: 'SPFM.USER_AUTH.INVENTORY',
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    {
      name: 'inventoryAddress',
      // bind: 'skuCodeLov.address',
      type: 'string',
      label: intl.get('smodr.apply.model.wareHouse').d('库房地址'),
      // required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    {
      name: 'receiveContactName',
      // bind: 'skuCodeLov.attributeVarchar2',
      type: 'string',
      label: intl.get('smodr.apply.model.contactName').d('联系人名称'),
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    {
      name: 'receiveMobilePhone',
      // bind: 'skuCodeLov.mobilePhone',
      type: 'string',
      label: intl.get('smodr.apply.model.contactWay').d('联系方式'),
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    {
      name: 'receiveEmail',
      // bind: 'skuCodeLov.attributeVarchar3',
      type: 'string',
      label: intl.get('smodr.apply.model.concatemail').d('联系人邮箱'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('smodr.apply.model.quantity').d('数量'),
      required: true,
      min: 0,
      validator: (value, name, record) => {
        if (record.get('surplusStock') && value > record.get('surplusStock')) {
          return `${intl.get('smodr.apply.model.shengyuStock').d('剩余库存为')}${record.get('surplusStock')}，${intl.get('smodr.apply.model.kucun').d('库存不足')}`;
        } if (value === 0) {
          return intl.get('smodr.apply.model.quantityTip').d('数量不能为0');
        }
      },
    },
    {
      name: 'uomName',
      // bind: 'skuCodeLov.uomName',
      type: 'object',
      label: intl.get('smodr.apply.model.uomName').d('单位'),
      required: true,
      lovCode: 'SMDM.UOM',
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    {
      name: 'taxRate',
      // bind: 'skuCodeLov.taxRate',
      type: 'object',
      label: intl.get('smodr.apply.model.tax').d('税率'),
      lovCode: 'SMDM.TAX',
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    // {
    //   name: 'taxId',
    //   bind: 'skuCodeLov.taxId',
    // },
    // {
    //   name: 'taxCode',
    //   bind: 'skuCodeLov.taxCode',
    // },
    {
      name: 'unitPrice',
      // bind: 'skuCodeLov.agreementTaxedPrice',
      type: 'number',
      label: intl.get('smodr.apply.model.perPrice').d('单价'),
      // required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
    // {
    //   name: 'nakedUnitPrice',
    //   bind: 'skuCodeLov.agreementPrice',
    // },
    {
      name: 'supplierCompanyName',
      type: 'object',
      label: intl.get('smodr.apply.model.supplier').d('供应商'),
      required: true,
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      dynamicProps: {
        disabled: ({ record }) => record.get('skuCodeLov'),
      },
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'skuCodeLov') {
        const {
          skuId,
          skuCode,
          skuName,
          uomId,
          uomCode,
          uomName,
          itemId,
          itemCode,
          itemName,
          itemUomId,
          itemUomCode,
          itemUomName,
          inventoryId,
          inventoryCode,
          inventoryName,
          address,
          attributeVarchar2,
          attributeVarchar3,
          mobilePhone,
          taxId,
          taxRate,
          taxCode,
          agreementPrice,
          agreementTaxedPrice,
          agreementInfoList,
        } = value || {};
        const { agreementHeaderNum, agreementLineId, proxyCompanyCode, proxyCompanyId, proxyCompanyName } = agreementInfoList?.[0] || {};
        if (!value) {
          record.set('skuId', null);
          record.set('skuCode', null);
          record.set('skuName', null);
          record.set('uomId', null);
          record.set('uomCode', null);
          record.set('uomName', null);
          record.set('itemId', null);
          record.set('itemCode', null);
          record.set('itemName', null);
          record.set('itemUomId', null);
          record.set('itemUomCode', null);
          record.set('itemUomName', null);
          record.set('inventoryId', null);
          record.set('inventoryCode', null);
          record.set('inventoryName', null);
          record.set('inventoryAddress', null);
          record.set('receiveContactName', null);
          record.set('receiveEmail', null);
          record.set('receiveMobilePhone', null);
          record.set('supplierCompanyId', null);
          record.set('supplierCompanyCode', null);
          record.set('supplierCompanyName', null);
          record.set('supplierTenantId', null);
          record.set('taxId', null);
          record.set('taxRate', null);
          record.set('taxCode', null);
          record.set('nakedUnitPrice', null);
          record.set('unitPrice', null);
          record.set('agreementNum', null);
          record.set('agreementLineId', null);
        }
        if (skuId) {
          record.set('skuId', skuId);
          record.set('skuCode', skuCode);
          record.set('skuName', skuName);
          record.set('uomId', uomId);
          record.set('uomCode', uomCode);
          record.set('uomName', uomName);
          record.set('itemId', itemId);
          record.set('itemCode', itemCode);
          record.set('itemName', itemName);
          record.set('itemUomId', itemUomId);
          record.set('itemUomCode', itemUomCode);
          record.set('itemUomName', itemUomName);
          record.set('inventoryId', inventoryId);
          record.set('inventoryCode', inventoryCode);
          record.set('inventoryName', inventoryName);
          record.set('inventoryAddress', address);
          record.set('receiveContactName', attributeVarchar2);
          record.set('receiveEmail', attributeVarchar3);
          record.set('receiveMobilePhone', mobilePhone);
          record.set('supplierCompanyId', proxyCompanyId);
          record.set('supplierCompanyCode', proxyCompanyCode);
          record.set('supplierCompanyName', proxyCompanyName);
          record.set('supplierTenantId', organizationId);
          record.set('taxId', taxId);
          record.set('taxRate', taxRate);
          record.set('taxCode', taxCode);
          record.set('nakedUnitPrice', agreementPrice);
          record.set('unitPrice', agreementTaxedPrice);
          record.set('agreementNum', agreementHeaderNum);
          record.set('agreementLineId', agreementLineId);
        }
      }
      if (name === 'itemCode') {
        if (!value) {
          record.set('itemName', null);
        }
        const { itemId, itemCode, itemName, uomId, uomCode, uomName } = value || {};
        if (itemCode) {
          record.set('itemCode', itemCode);
          record.set('itemName', itemName);
          record.set('itemId', itemId);
          record.set('itemUomId', uomId);
          record.set('itemUomCode', uomCode);
          record.set('itemUomName', uomName);
        }
      }
      if (name === 'inventoryName') {
        const { inventoryId, inventoryCode, inventoryName, attributeVarchar1, attributeVarchar2, attributeVarchar3 } = value || {};
        if (inventoryId) {
          record.set('inventoryAddress', attributeVarchar1);
          record.set('receiveContactName', attributeVarchar2);
          record.set('receiveEmail', attributeVarchar3);
          record.set('inventoryId', inventoryId);
          record.set('inventoryCode', inventoryCode);
          record.set('inventoryName', inventoryName);
        }
      } if (name === 'taxRate') {
        const { taxId, taxRate, taxCode } = value || {};
        if (taxId) {
          record.set('taxId', taxId);
          record.set('taxRate', taxRate);
          record.set('taxCode', taxCode);
        }
      }
      if (name === 'uomName') {
        const { uomId, uomCode, uomName } = value || {};
        if (uomId) {
          record.set('uomId', uomId);
          record.set('uomCode', uomCode);
          record.set('uomName', uomName);
        }
      }
      if (name === 'supplierCompanyName') {
        const { companyId, companyNum, companyName } = value || {};
        if (companyId) {
          record.set('supplierCompanyCode', companyNum);
          record.set('supplierCompanyId', companyId);
          record.set('supplierCompanyName', companyName);
          record.set('supplierTenantId', organizationId);
        }
      }
    },
  },
});

export { baseDs, tableDs, editDs, receiveDs };