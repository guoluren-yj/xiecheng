/*
 * @Date: 2023-04-12 16:41:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

export const getLocationDS = ({ compareFlag = false } = {}) => ({
  forceValidate: true,
  paging: !compareFlag, // 对比不分页
  fields: [
    {
      name: 'countryId',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { countryId, countryName, countryCode } = data;
        return value ? { countryId, countryName, countryCode } : null;
      },
    },
    {
      name: 'countryCode',
      bind: 'countryId.countryCode',
    },
    {
      name: 'regionId',
      type: 'object',
      lovCode: 'HPFM.REGION',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('countryId')?.countryId,
        required: ({ record }) => record.get('countryCode') === 'CN',
        lovPara: ({ record }) => ({ countryId: record.get('countryId')?.countryId }),
      },
      transformRequest: value => value && value.regionId,
      transformResponse: (value, data) => {
        const { regionId, regionName } = data;
        return value ? { regionId, regionName } : null;
      },
    },
    {
      name: 'cityId',
      type: 'object',
      lovCode: 'HPFM.REGION',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('regionId')?.regionId,
        required: ({ record }) => record.get('countryCode') === 'CN',
        lovPara: ({ record }) => ({ parentRegionId: record.get('regionId')?.regionId }),
      },
      transformRequest: value => value && value.regionId,
      transformResponse: (value, data) => {
        const { cityId, city } = data;
        return value ? { regionId: cityId, regionName: city } : null;
      },
    },
    {
      name: 'address',
      required: true,
      label: intl.get('sslm.supplierInform.model.supplierInform.addressDetail').d('详细地址'),
    },
    {
      name: 'supplierAddress',
      required: true,
      label: intl.get('sslm.supplierInform.model.supplierInform.supplierLocation').d('供应商地点'),
    },
    {
      name: 'name',
      type: 'object',
      required: true,
      textField: 'name',
      valueField: 'name',
      lovCode: 'SSLM.SUPPLIER_CONTACTS',
      label: intl.get('sslm.supplierInform.model.supplierInform.contacts').d('联系人'),
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const {
            tenantId,
            companyId,
            spfmCompanyId,
            supplierTenantId,
            supplierCompanyId,
            spfmSupplierCompanyId,
          } = dataSet.getState('dsState') || {};
          return {
            tenantId,
            companyId,
            spfmCompanyId,
            enableFlag: 1,
            partnerTenantId: supplierTenantId,
            partnerCompanyId: supplierCompanyId,
            spfmPartnerCompanyId: spfmSupplierCompanyId,
          };
        },
      },
      transformRequest: value => value && value.name,
      transformResponse: (value, data) => {
        const {
          name,
          contactName,
          mobilephone,
          internationalTelCode,
          internationalTelMeaning,
        } = data;
        return value
          ? {
              name,
              mobilephone,
              contactName,
              internationalTelCode,
              internationalTelMeaning,
            }
          : null;
      },
    },
    {
      name: 'contactName',
      bind: 'name.contactName',
    },
    {
      name: 'internationalTelCode',
      bind: 'name.internationalTelCode',
    },
    {
      name: 'internationalTelMeaning',
      bind: 'name.internationalTelMeaning',
    },
    {
      name: 'mobilephone',
      bind: 'name.mobilephone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.contactsMethod').d('联系方式'),
    },
    {
      name: 'ouMessage',
      label: intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('supplierSyncEbsAddrId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    create: ({ dataSet, record }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      record.set({ changeReqId });
    },
    update: ({ name, record }) => {
      switch (name) {
        case 'countryId':
          record.set({
            cityId: null,
            regionId: null,
          });
          break;
        case 'regionId':
          record.set({
            cityId: null,
          });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-adds`,
        method: 'GET',
        data: { changeReqId, customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION' },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-adds/delete`,
        method: 'DELETE',
        params: {
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION',
        },
        data,
      };
    },
  },
});

export const getOuDS = ({ supChangeAddId, changeReqId, listDs, compareFlag = false } = {}) => ({
  autoQuery: !!supChangeAddId, // 对比页不自动查询
  paging: !compareFlag, // 对比不分页
  forceValidate: true,
  fields: [
    {
      name: 'ouId',
      type: 'object',
      required: true,
      lovCode: 'HPFM.OU',
      label: intl.get('sslm.supplierInform.model.supplierInform.OULayer').d('OU层'),
      transformRequest: value => value && value.ouId,
      transformResponse: (value, data) => {
        const { ouId, ouName } = data;
        return value ? { ouId, ouName } : null;
      },
    },
    {
      name: 'billPeriod',
      lookupCode: 'SSLM.EBS_OU_BILL_PERIOD',
      label: intl.get('sslm.supplierInform.model.supplierInform.billPeriod').d('账期'),
    },
    {
      name: 'typeCode',
      type: 'object',
      required: true,
      lovCode: 'SMDM.PAYMENT_TYPE',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, data) => {
        const { typeCode, typeName } = data;
        return value ? { typeCode, typeName } : null;
      },
    },
    {
      name: 'typeName',
      bind: 'typeCode.typeName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.ticketDay').d('票据天数'),
      name: 'ticketDay',
      type: 'number',
      numberGrouping: false,
      min: 0,
      max: 500,
    },
    {
      name: 'termCode',
      type: 'object',
      required: true,
      lovCode: 'SMDM.PAYMENT.TERM',
      textField: 'termName',
      valueField: 'termCode',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条件'),
      transformRequest: value => value && value.termCode,
      transformResponse: (value, object) =>
        value
          ? {
              termId: object.termId,
              termCode: object.termCode,
              termName: object.termName,
            }
          : null,
    },
    {
      name: 'termId',
      bind: 'termCode.termId',
    },
    {
      name: 'bankCode',
      type: 'object',
      required: true,
      noCache: true,
      lovCode: 'SSLM.BANK_ACCOUNT',
      textField: 'bankCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.bankCode').d('银行代码'),
      dynamicProps: {
        lovPara: () => {
          const {
            tenantId,
            companyId,
            spfmCompanyId,
            supplierTenantId,
            supplierCompanyId,
            spfmSupplierCompanyId,
          } = (listDs && listDs.getState('dsState')) || {};
          return {
            tenantId,
            companyId,
            spfmCompanyId,
            enableFlag: 1,
            partnerTenantId: supplierTenantId,
            partnerCompanyId: supplierCompanyId,
            spfmPartnerCompanyId: spfmSupplierCompanyId,
          };
        },
      },
      transformRequest: value => value && value.bankCode,
      transformResponse: (value, data) => {
        const {
          bankFirm,
          bankCode,
          bankName,
          bankAccountNum,
          bankBranchName,
          bankAccountName,
        } = data;
        return value
          ? { bankFirm, bankCode, bankName, bankAccountNum, bankBranchName, bankAccountName }
          : null;
      },
    },
    {
      name: 'id',
      bind: 'bankCode.id',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.bankName').d('银行名称'),
      name: 'bankName',
      bind: 'bankCode.bankName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.bankFirm').d('联行行号'),
      name: 'bankFirm',
      bind: 'bankCode.bankFirm',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.depositBank').d('开户行名称'),
      name: 'bankBranchName',
      bind: 'bankCode.bankBranchName',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.accountkName`).d('账户名称'),
      name: 'bankAccountName',
      bind: 'bankCode.bankAccountName',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.bankAccountNum').d('银行账户'),
      name: 'bankAccountNum',
      type: 'secret',
      bind: 'bankCode.bankAccountNum',
    },
    {
      name: 'taxId',
      type: 'object',
      required: true,
      lovCode: 'SPRM.TAX',
      textField: 'taxRate',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.taxRate').d('税率'),
      transformRequest: value => value && value.taxId,
      transformResponse: (value, data) => {
        const { taxId, taxRate } = data;
        return value ? { taxId, taxRate } : null;
      },
    },
    {
      name: 'taxRate',
      bind: 'taxId.taxRate',
    },
    {
      name: 'currencyCode',
      type: 'object',
      required: true,
      lovCode: 'SMDM.CURRENCY',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyName').d('币种'),
      transformRequest: value => value && value.currencyCode,
      transformResponse: (value, data) => {
        const { currencyCode, currencyName } = data;
        return value ? { currencyCode, currencyName } : null;
      },
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.supplierInform.model.supplierInform.layerCreationDate').d('层创建日期'),
    },
    {
      name: 'expirationDate',
      required: true,
      type: 'date',
      defaultValue: moment('9999-12-31'),
      dynamicProps: {
        min: ({ record }) => record.get('createDate') || moment(),
      },
      label: intl
        .get('sslm.supplierInform.model.supplierInform.layerExpirationDate')
        .d('层失效日期'),
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('supChangeOuId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    create: ({ record }) => {
      record.set({ changeReqId, supChangeAddId });
    },
  },
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-ous`,
      method: 'GET',
      data: { supChangeAddId, customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU' },
    },
    submit: {
      url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ebs-ous`,
      method: 'POST',
      params: { customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU' },
    },
  },
});
