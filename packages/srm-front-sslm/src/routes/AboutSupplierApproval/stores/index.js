/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-10 16:27:35
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-31 17:02:22
 * @FilePath: /srm-front-sslm/src/routes/AboutSupplierApproval/stores/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import { SRM_PLATFORM, PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';

import { bucketDirectory } from '@/routes/utils/utils';

const getTenantAdminDs = () => ({
  primaryKey: 'enterpriseId',
  cacheSelection: true,
  selection: 'multiple',
  dataToJSON: 'selected',
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      label: intl.get('sslm.AboutSupplierApproval.model.table.status').d('申请状态'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.companyName').d('企业名称'),
    },
    {
      name: 'tenantName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.tenantName').d('所属租户'),
    },
    {
      name: 'tenantNum',
      label: intl.get('sslm.AboutSupplierApproval.model.table.tenantNum').d('所属租户编码'),
    },
    {
      name: 'applicantName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.applicantName').d('申请人'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.realName').d('子账户'),
    },
    {
      name: 'loginName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.loginName').d('子账户账号'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sslm.AboutSupplierApproval.model.table.creationDate').d('申请时间'),
    },
    {
      name: 'reason',
      label: intl.get('sslm.AboutSupplierApproval.model.table.reason').d('申请说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('sslm.AboutSupplierApproval.model.table.attachmentUuid').d('申请附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.aboutSupplierApproval,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/enterprise-role-applys/list`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.ABOUTSUPPLIERAPPROVAL.TENANT_ADMIN_SEARCH_BAR',
          // 'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL,SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST,SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING,SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
        },
      };
    },
  },
});

const getRealNameAuthenticationDs = () => ({
  primaryKey: 'attestationId',
  cacheSelection: true,
  selection: 'multiple',
  dataToJSON: 'selected',
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'attestationStatusMeaning',
      label: intl.get('sslm.AboutSupplierApproval.model.table.attestationStatus').d('申请状态'),
    },
    {
      name: 'name',
      label: intl.get('sslm.AboutSupplierApproval.model.table.applicantName').d('申请人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sslm.AboutSupplierApproval.model.table.creationDate').d('申请时间'),
    },
    {
      name: 'idType',
      label: intl.get('sslm.AboutSupplierApproval.model.table.idType').d('证件类型'),
    },
    {
      name: 'idCard',
      label: intl.get('sslm.AboutSupplierApproval.model.table.idCard').d('证件号'),
    },
    {
      name: 'idFrontUuid',
      type: 'attachment',
      label: intl.get('sslm.AboutSupplierApproval.model.table.idFrontUuid').d('证件正面附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.aboutSupplierApproval,
    },
    {
      name: 'idBackUuid',
      type: 'attachment',
      label: intl.get('sslm.AboutSupplierApproval.model.table.idBackUuid').d('证件反面附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.aboutSupplierApproval,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1//user-attestations/list`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.ABOUTSUPPLIERAPPROVAL.REAL_NAME_SEARCH_BAR',
          // 'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL,SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST,SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING,SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
        },
      };
    },
  },
});

const getAssociatedEnterprisesDs = () => ({
  primaryKey: 'attestationId',
  cacheSelection: true,
  selection: 'multiple',
  dataToJSON: 'selected',
  autoLocateFirst: false,
  pageSize: 20,
  record: {
    dynamicProps: {
      selectable: record => record.get('attestationStatus') === 'APPROVING',
    },
  },
  fields: [
    {
      name: 'attestationStatusMeaning',
      label: intl.get('sslm.AboutSupplierApproval.model.table.attestationStatus').d('申请状态'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.companyName').d('企业名称'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.realName').d('子账户'),
    },
    {
      name: 'proposerName',
      label: intl.get('sslm.AboutSupplierApproval.model.table.applicantName').d('申请人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.AboutSupplierApproval.model.table.creationDate').d('申请时间'),
    },
    {
      name: 'reason',
      label: intl.get('sslm.AboutSupplierApproval.model.table.reason').d('申请说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('sslm.AboutSupplierApproval.model.table.attachmentUuid').d('申请附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.aboutSupplierApproval,
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-attestations/list`,
        method: 'GET',
        data: {
          attestationStatus: 'APPROVING',
          ...data,
          customizeUnitCode: 'SSLM.ABOUTSUPPLIERAPPROVAL.ASSOCIATED_SEARCH_BAR',
          // 'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL,SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST,SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING,SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
        },
      };
    },
  },
});

const getRefusedDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      label: intl.get('sslm.AboutSupplierApproval.model.form.refusedRemark').d('拒绝理由'),
      required: true,
    },
  ],
});
export { getTenantAdminDs, getRealNameAuthenticationDs, getAssociatedEnterprisesDs, getRefusedDs };
