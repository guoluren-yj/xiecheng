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

// 配额申请单
const getSupplierQuotaDS = ({ tabKey = '' } = {}) => ({
  primaryKey: 'quotaHeaderId',
  dataToJSON: 'selected',
  cacheSelection: true,
  selection: ['toSubmitted'].includes(tabKey) ? 'multiple' : false,
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
      name: 'createName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.creationTime').d('创建时间'),
    },
    {
      name: 'sourceDocType',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.sourceDocType').d('来源单据类型'),
    },
    {
      name: 'sourceNumber',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.sourceNumber').d('来源单据编号'),
    },
    {
      name: 'buyerName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.buyer').d('分管采购员'),
    },
    {
      name: 'versionNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.version').d('版本'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      const { searchBarCode, tableCode, ...otherQueryParam } = queryParam || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/list`,
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
    destroy: {
      url: `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/list/batch-delete`,
      method: 'DELETE',
    },
  },
});

export { getSupplierQuotaDS };
