/*
 * @Date: 2024-08-09 15:47:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 找企业list ds
export const getEnterpriseDS = () => ({
  selection: false,
  pageSize: 20,
  queryParameter: {
    customizeUnitCode: 'SSLM.MEMBER_SUPPLIER_RECOMMEND.ENTERPRISE_SEARCH_BAR',
  },
  fields: [
    {
      name: 'combination',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/member-supplier-page`,
        method: 'GET',
        data: {
          ...rest,
          ...queryParams,
        },
      };
    },
  },
});

// 找企业卡片表单ds
export const getEnterpriseFormDS = () => ({
  fields: [
    {
      name: 'legalRepName',
      label: intl.get('sslm.supplierManage.model.supplierManage.legalRepName').d('法定代表人'),
    },
    {
      name: 'registeredCapital',
      type: 'number',
      label: intl
        .get('sslm.supplierManage.model.supplierManage.registeredCapital')
        .d('注册资金(万元)'),
    },
    {
      name: 'currencyName',
      label: intl.get('sslm.common.model.field.registeredCurrency').d('注册币种'),
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('sslm.supplierManage.model.supplierManage.buildDate').d('成立日期'),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'industryNames',
      label: intl.get('sslm.common.model.field.relatedIndustry').d('所处行业'),
    },
    {
      name: 'industryCategoryNames',
      label: intl.get('sslm.common.model.field.mainCategories').d('主营品类'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.field.latestScanningTime').d('最近扫描时间'),
    },
  ],
});

// 找产品list ds
export const getProductDS = () => ({
  selection: false,
  pageSize: 20,
  queryParameter: {
    customizeUnitCode: 'SSLM.MEMBER_SUPPLIER_RECOMMEND.PRODUCT_SEARCH_BAR',
  },
  fields: [
    {
      name: 'combination',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/member-product-page`,
        method: 'GET',
        data: {
          ...rest,
          ...queryParams,
        },
      };
    },
  },
});

// 找产品表单ds
export const getProductFormDS = () => ({
  fields: [
    {
      name: 'productPictureUuid',
    },
    {
      name: 'productName',
    },
    {
      name: 'price',
    },
    {
      name: 'productIntro',
      label: intl.get('sslm.common.model.field.productIntroduce').d('产品简介'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.fieldCode').d('公司'),
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('sslm.common.view.companyInfo.registerDate').d('成立日期'),
    },
    {
      name: 'industryNames',
      label: intl.get('sslm.common.model.field.relatedIndustry').d('所处行业'),
    },
    {
      name: 'industryCategoryNames',
      label: intl.get('sslm.common.model.field.mainCategories').d('主营品类'),
    },
  ],
});
