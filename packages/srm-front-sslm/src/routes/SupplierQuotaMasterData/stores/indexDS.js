/*
 * @Date: 2024-01-02
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 配额主数据-供应商+品类维度
const getSupplierQuotaDS = () => ({
  primaryKey: 'quotaLineId',
  cacheSelection: true,
  selection: 'multiple',
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      name: 'evalStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
    {
      name: 'quotaAgreementNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.agreementNo').d('配额协议号'),
    },
    {
      name: 'quotaAgreementDescription',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.agreementDesc').d('配额协议描述'),
    },
    {
      name: 'versionNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.version').d('版本'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.company').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.businessEntity').d('业务实体'),
    },
    {
      name: 'categoryCode',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.categoryCode').d('品类编码'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.categoryName').d('品类名称'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.itemName').d('物料名称'),
    },
    {
      name: 'effectiveDateFrom',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.isValidFrom').d('有效期从'),
      type: 'date',
    },
    {
      name: 'effectiveDateTo',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.isValidTo').d('有效期至'),
      type: 'date',
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.supplierName').d('供应商名称'),
    },
    {
      name: 'quotaRatio',
      type: 'number',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.ratio').d('配额比（%）'),
    },
    {
      name: 'createName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.creationTime').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      const { searchBarCode, tableCode, ...otherQueryParam } = queryParam || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...other,
          ...otherQueryParam,
          customizeUnitCode: [searchBarCode, tableCode].join(','),
        },
      };
    },
  },
});

// 配额主数据-物料维度
const getItemQuotaDS = () => ({
  primaryKey: 'quotaHeaderId',
  cacheSelection: true,
  selection: 'multiple',
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      name: 'evalStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
    {
      name: 'quotaAgreementNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.agreementNo').d('配额协议号'),
    },
    {
      name: 'quotaAgreementDescription',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.agreementDesc').d('配额协议描述'),
    },
    {
      name: 'versionNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.version').d('版本'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.company').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.businessEntity').d('业务实体'),
    },
    {
      name: 'categoryCode',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.categoryCode').d('品类编码'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.categoryName').d('品类名称'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.itemName').d('物料名称'),
    },
    {
      name: 'effectiveDateFrom',
      type: 'date',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.isValidFrom').d('有效期从'),
    },
    {
      name: 'effectiveDateTo',
      type: 'date',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.isValidTo').d('有效期至'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.supplierName').d('供应商名称'),
    },
    {
      name: 'quotaRatio',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.ratio').d('配额比（%）'),
    },
    {
      name: 'createName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.creationTime').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      const { searchBarCode, tableCode, ...otherQueryParam } = queryParam || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/listItem`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...other,
          ...otherQueryParam,
          customizeUnitCode: [searchBarCode, tableCode].join(','),
        },
      };
    },
  },
});

export { getSupplierQuotaDS, getItemQuotaDS };
