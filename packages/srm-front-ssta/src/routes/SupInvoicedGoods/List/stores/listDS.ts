/*
 * @Description: 供应商开票商品信息-DataSet
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2023-03-22 09:56:26
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, DataToJSON, FieldIgnore } from 'choerodon-ui/dataset/data-set/enum';
import { invert, isNil } from 'lodash';
// import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { HZERO_IAM } from 'utils/config';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ActiveKey } from '../../utils/type';
import { GridCustCode, SearchCustCode } from '../../utils/type';

const tenantId = getCurrentOrganizationId();

export const infoTableDS = (): DataSetProps => {
  const key = ActiveKey.Info;
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'commodityId',
    dataToJSON: DataToJSON.selected,
    fields: [
      {
        name: 'commodityCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxCodeClassify').d('税收分类编码'),
      },
      {
        name: 'commodityName',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceNameClassify').d('税收分类编码名称'),
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.operation').d('操作'),
      },
      {
        name: 'commodityServiceCateCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceClassShortClassify').d('税收分类编码简称'),
      },
      {
        name: 'taxRate',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxRatePercent').d('税率(%)'),
      },
      {
        name: 'preferentialPolicyFlagMeaning',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.preferentialPolicySign').d('优惠政策标识'),
      },
      {
        name: 'freeTaxMarkMeaning',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.zeroTaxRateSign').d('零税率标识'),
      },
      {
        name: 'specialManagementVat',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.preferentialPolicyName').d('优惠政策名称（增值税特殊管理）'),
      },
      {
        name: 'percent',
        type: FieldType.number,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.normalizedPercentageProbability').d('归一化百分数概率'),
      },
      {
        name: 'keyWord',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.keywords').d('关键字'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.remark').d('说明'),
      },
      {
        name: 'summaryFlagMeaning',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.summaryItem').d('汇总项'),
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.enableStatus').d('启用状态'),
      },
      {
        name: 'sourceCodeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsSource').d('商品来源'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.supplierCompanyTaxNum').d('供应商公司税号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.projectNameGood').d('项目名称（开票服务商处自定义商品名称）'),
      },
      {
        name: 'model',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.specificationModelGood').d('规格型号（开票服务商处自定义商品名称）'),
      },
      {
        name: 'uom',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.unitInfo').d('单位（开票服务商处自定义商品名称）'),
      },
    ],
    queryParameter: {
      customizeUnitCode: [GridCustCode[key], SearchCustCode[key]].join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${tenantId}/direct-commoditys/purchaser-list`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SSTA}/v1/${tenantId}/direct-commoditys/enable`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
  };
};

export const mappingTableDS = (): DataSetProps => {
  const key = ActiveKey.Mapping;
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'mappingId',
    dataToJSON: DataToJSON.selected,
    fields: [
      {
        name: 'partnerItemCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.itemCode').d('物料编码'),
      },
      {
        name: 'partnerItemName',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.itemName').d('物料名称'),
      },
      {
        name: 'commodityCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxCodeClassify').d('税收分类编码'),
      },
      {
        name: 'commodityName',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceNameClassify').d('税收分类编码名称'),
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.operation').d('操作'),
      },
      {
        name: 'commodityServiceCateCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceClassShortClassify').d('税收分类编码简称'),
      },
      {
        name: 'taxRate',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxRatePercent').d('税率(%)'),
      },
      {
        name: 'preferentialPolicyFlagMeaning',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.preferentialPolicySign').d('优惠政策标识'),
      },
      {
        name: 'freeTaxMarkMeaning',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.zeroTaxRateSign').d('零税率标识'),
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: true,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.enableStatus').d('启用状态'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.supplierCompanyTaxNum').d('供应商公司税号'),
      },
    ],
    queryParameter: {
      customizeUnitCode: [GridCustCode[key], SearchCustCode[key]].join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${tenantId}/direct-commodity-mappings/purchaser-list`,
          method: 'GET',
        };
      },
    },
  };
};

export const initGoodsInfoDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'supplierCompanyLov',
        type: FieldType.object,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.enterpriseInfo').d('企业信息'),
        lovCode: 'SDIM.USER_AUTH.SUPPLIER',
        lovPara: { tenantId },
        required: true,
      },
      {
        name: 'supplierCompanyId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyId',
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyName',
      },
      {
        name: 'supplierTenantId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierTenantId',
      },
      {
        name: 'supplierCompanyNum',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyNum',
      },
      {
        name: 'supplierUnifiedSocialCode',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierUnifiedSocialCode',
      },
      {
        name: 'projectCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.projectCodeGoodInfo').d('项目编码（开票服务商处自定义商品编码）'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.projectNameGood').d('项目名称（开票服务商处自定义商品名称）'),
        dynamicProps: {
          required: ({ record }) => record.get('model') || !isNil(record.get('taxRate')),
        },
      },
      {
        name: 'model',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.specificationModelGood').d('规格型号（开票服务商处自定义商品名称）'),
        dynamicProps: {
          required: ({ record }) => record.get('projectName') || !isNil(record.get('taxRate')),
        },
      },
      {
        name: 'taxRate',
        type: FieldType.number,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxRatePercent').d('税率(%)'),
        lookupCode: 'SDIM.COMMODITY_RATE',
        dynamicProps: {
          required: ({ record }) => record.get('projectName') || record.get('model'),
        },
      },
      // {
      //   name: 'unit',
      //   type: FieldType.string,
      //   label: intl.get('ssta.goodsInfo.model.goodsInfo.unit').d('单位'),
      // },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SSTA}/v1/${tenantId}/direct-commoditys/purchaser-init`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

export const modifyGoodsMappingDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'companyLov',
        type: FieldType.object,
        lovCode: 'SDIM.USER_AUTH.SUPPLIER',
        label: intl.get('ssta.goodsInfo.model.goodsInfo.invoiceCompanyName').d('开票方名称'),
        lovPara: { tenantId },
        required: true,
      },
      {
        name: 'supplierCompanyId',
        type: FieldType.string,
        bind: 'companyLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: FieldType.string,
        bind: 'companyLov.supplierTenantId',
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        bind: 'companyLov.supplierCompanyName',
      },
      {
        name: 'partnerItemLov',
        type: FieldType.object,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.itemCode').d('物料编码'),
        lovCode: 'SDIM.PURCHASER_ITEM',
        lovPara: { purchaserTenantId: tenantId },
        cascadeMap: { supplierCompanyId: 'supplierCompanyId', supplierTenantId: 'supplierTenantId' },
        textField: 'partnerItemCode',
      },
      {
        name: 'sdimItemId',
        bind: 'partnerItemLov.sdimItemId',
      },
      {
        name: 'partnerItemId',
        type: FieldType.string,
        bind: 'partnerItemLov.partnerItemId',
      },
      {
        name: 'partnerItemCode',
        type: FieldType.string,
        bind: 'partnerItemLov.partnerItemCode',
      },
      {
        name: 'partnerItemName',
        type: FieldType.string,
        bind: 'partnerItemLov.partnerItemName',
        label: intl.get('ssta.goodsInfo.model.goodsInfo.itemName').d('物料名称'),
        required: true,
      },
      {
        name: 'purchaserCompanyId',
        type: FieldType.string,
        bind: 'partnerItemLov.purchaserCompanyId',
      },
      {
        name: 'purchaserTenantId',
        type: FieldType.string,
        bind: 'partnerItemLov.purchaserTenantId',
      },
      {
        name: 'model',
        type: FieldType.string,
        label: intl.get(`ssta.goodsInfo.model.goodsInfo.specificationsModel`).d('规格型号'),
        bind: 'partnerItemLov.model',
      },
      {
        name: 'uomLov',
        type: FieldType.object,
        label: intl.get(`ssta.goodsInfo.model.goodsInfo.unit`).d('单位'),
        lovCode: 'SDIM.UOM',
        required: true,
      },
      {
        name: 'uomCode',
        type: FieldType.string,
        bind: 'uomLov.uomCode',
      },
      {
        name: 'taxRateLov',
        type: FieldType.object,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxRatePercent').d('税率(%)'),
        lovCode: 'SMDM.TAX',
        // multiple: true,
        textField: 'taxRate',
        // transformRequest: (value) => (isArray(value) ? value.join() : value),
        // transformResponse: (value) => (isString(value) ? value.split(',') : null),
        required: true,
      },
      {
        name: 'taxRate',
        type: FieldType.number,
        bind: 'taxRateLov.taxRate',
        // transformRequest: (value) => (isArray(value) ? value.join() : value),
        // transformResponse: (value) => (isString(value) ? value.split(',') : null),
      },
      {
        name: 'taxId',
        type: FieldType.string,
        bind: 'taxRateLov.taxId',
        // transformRequest: (value) => (isArray(value) ? value.join() : value),
        // transformResponse: (value) => (isString(value) ? value.split(',') : null),
      },
      {
        name: 'taxCode',
        type: FieldType.string,
        bind: 'taxRateLov.taxCode',
        // transformRequest: (value) => (isArray(value) ? value.join() : value),
        // transformResponse: (value) => (isString(value) ? value.split(',') : null),
      },
      {
        name: 'commodityLov',
        type: FieldType.object,
        lovCode: 'SDIM.COMMODITY_LOV_PUR',
        textField: 'commodityName',
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceNameClassify').d('税收分类编码名称'),
        lovPara: { tenantId },
        required: true,
      },
      {
        name: 'commodityCode',
        type: FieldType.string,
        bind: 'commodityLov.commodityCode',
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxCodeClassify').d('税收分类编码'),
        required: true,
      },
      {
        name: 'commodityId',
        type: FieldType.string,
        bind: 'commodityLov.commodityId',
      },
      {
        name: 'commodityName',
        type: FieldType.object,
        bind: 'commodityLov.commodityName',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.operation').d('操作'),
      },
      {
        name: 'commodityServiceCateCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceClassShortClassify').d('税收分类编码简称'),
        bind: 'commodityLov.commodityServiceCateCode',
      },
      // {
      //   name: 'preferentialPolicyFlag',
      //   type: FieldType.string,
      //   lookupCode: 'SDIM.PREFERENTIAL_POLICY_FLAG',
      //   label: intl.get('ssta.goodsInfo.model.goodsInfo.preferentialPolicySign').d('优惠政策标识'),
      //   bind: 'commodityLov.preferentialPolicyFlag',
      //   required: true,
      // },
      // {
      //   name: 'freeTaxMark',
      //   type: FieldType.string,
      //   lookupCode: 'SDIM.FREE_TAX_MARK',
      //   label: intl.get('ssta.goodsInfo.model.goodsInfo.zeroTaxRateSign').d('零税率标识'),
      //   bind: 'commodityLov.freeTaxMark',
      //   required: true,
      // },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.enableStatus').d('启用状态'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.supplierCompanyTaxNum').d('供应商公司税号'),
        bind: 'companyLov.supplierUnifiedSocialCode',
      },
    ],
    transport: {
      submit: ({ data }) => {
        const submitData = data[0];
        const { mappingId } = submitData;
        // 区分新建提交
        const url = mappingId
          ? `${SRM_SSTA}/v1/${tenantId}/direct-commodity-mappings/purchaser-update`
          : `${SRM_SSTA}/v1/${tenantId}/direct-commodity-mappings/purchaser-create`;
        const method = mappingId ? 'PUT' : 'POST';
        return {
          url,
          method,
          data: submitData,
        };
      },
    },
  };
};

export const permissionDS = (permissionCodeMap: Record<string, string>, ingoreKeyList: string[] = []): DataSetProps => {
  return {
    autoQuery: true,
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    data: [{}],
    fields: [],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/check-permissions`,
          method: 'POST',
          params: {},
          data: Object.values(permissionCodeMap),
          transformResponse: (res) => {
            try {
              const invertCodeMap = invert(permissionCodeMap);
              return Object.fromEntries(
                JSON.parse(res).map(({ code, approve }) => {
                  const permissionKey = invertCodeMap[code];
                  return [permissionKey, ingoreKeyList.includes(permissionKey) ? true : approve];
                })
              );
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};

// 税收商品信息修改DS
export const modifyGoodsInfoDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'commodityCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxCodeClassify').d('税收分类编码'),
        required: true,
      },
      {
        name: 'commodityName',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceNameClassify').d('税收分类编码名称'),
        required: true,
      },
      {
        name: 'commodityServiceCateCode',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.goodsOrServiceClassShortClassify').d('税收分类编码简称'),
      },
      {
        name: 'taxRate',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.taxRatePercent').d('税率(%)'),
        lovCode: 'SDIM.COMMODITY_RATE',
        // multiple: true,
        required: true,
        // transformRequest: (value) => (isArray(value) ? value.join(';') : value),
        // transformResponse: (value) => (isString(value) ? value.split(';') : null),
      },
      {
        name: 'preferentialPolicyFlag',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.preferentialPolicySign').d('优惠政策标识'),
        lookupCode: 'SDIM.PREFERENTIAL_POLICY_FLAG',
      },
      {
        name: 'freeTaxMark',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.zeroTaxRateSign').d('零税率标识'),
        lookupCode: 'SDIM.FREE_TAX_MARK',
      },
      {
        name: 'percent',
        type: FieldType.number,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.normalizedPercentageProbability').d('归一化百分数概率'),
      },
      {
        name: 'keyWord',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.keywords').d('关键字'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.remark').d('说明'),
      },
      {
        name: 'summaryFlag',
        label: intl.get('ssta.goodsInfo.model.goodsInfo.summaryItem').d('汇总项'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.enableStatus').d('启用状态'),
      },
      {
        name: 'supUnifiedSocialCodeLov',
        type: FieldType.object,
        label: intl.get('ssta.goodsInfo.model.goodsInfo.supUnifiedSocialCode').d('开票方公司税号'),
        lovCode: 'SDIM.USER_AUTH.SUPPLIER',
        textField: 'supplierUnifiedSocialCode',
        required: true,
        dynamicProps: {
          lovPara: () => ({
            tenantId,
          }),
        },
      },
      {
        name: 'supplierCompanyId',
        type: FieldType.string,
        bind: 'supUnifiedSocialCodeLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: FieldType.string,
        bind: 'supUnifiedSocialCodeLov.supplierTenantId',
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        bind: 'supUnifiedSocialCodeLov.supplierCompanyName',
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        bind: 'supUnifiedSocialCodeLov.supplierUnifiedSocialCode',
      },
      {
        name: 'supplierUnifiedSocialCode',
        type: FieldType.string,
        bind: 'supUnifiedSocialCodeLov.supplierUnifiedSocialCode',
      },
    ],
    transport: {
      submit: ({ data }) => {
        const submitData = data[0];
        const { commodityId } = submitData;
        // 区分新建提交
        const url = commodityId
          ? `${SRM_SSTA}/v1/${tenantId}/direct-commoditys/purchaser-update`
          : `${SRM_SSTA}/v1/${tenantId}/direct-commoditys/purchaser-create`;
        const method = commodityId ? 'PUT' : 'POST';
        return {
          url,
          method,
          data: submitData,
        };
      },
    },
  };
};
