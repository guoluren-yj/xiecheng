/**
 * 供应商黑名单DS 租户级
 * @Author: zepeng.huang@going-link.com
 * @Date: 2022-11-22
 * @Copyright: Copyright (c) 2022, Zhenyun
 */

import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const commonParam = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const getBlackListDs = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.socialCode').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseCode').d('组织机构代码'),
      name: 'orgNo',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.registerCode').d('企业注册登记号'),
      name: 'businessNo',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.businessStatus').d('经营状态'),
      name: 'businessStatus',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseAddress').d('企业注册地址'),
      name: 'address',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.contactPhone').d('联系人电话'),
      name: 'phone',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.contactMail').d('联系人邮箱'),
      name: 'email',
      type: 'email',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.website').d('网址'),
      name: 'website',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.roles.contacts').d('联系人'),
      name: 'link',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.label.description').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
      name: 'userName',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.addTime').d('添加时间'),
      name: 'addTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.updateTime').d('关系图谱更新时间'),
      name: 'updateTime',
      type: 'dateTime',
    },
    {
      label: intl.get('hzero.common.title.operator').d('操作'),
      name: 'operate',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.dunsNumber').d('邓白氏编码'),
      name: 'dunsNumber',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.effectTimeBegin').d('有效时间从'),
      name: 'startTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.effectTimeEnd').d('有效时间至'),
      name: 'endTime',
      type: 'dateTime',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 企业列表
 * @returns
 */
const getBusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/srm-enterprise-list`,
        params: {
          ...data,
          ...params,
          ...commonParam,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersCode').d('企业编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersName').d('企业名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.dunsNumber').d('邓白氏编码'),
      name: 'dunsNo',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseCode').d('组织机构代码'),
      name: 'orgNo',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.registerCode').d('企业注册登记号'),
      name: 'registrationNo',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersName').d('企业名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
    },
  ],
  events: {},
});

/**
 * 添加企业列表
 * @returns
 */
const getAddedBusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/monitor-enterprise-other`,
        params: {
          ...data,
          ...params,
          ...commonParam,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.supplierCodes').d('企业编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('企业名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('企业名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
    },
  ],
  events: {},
});

/**
 * 手工录入信息DS
 * @returns
 */
const getBlackRecordDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/manual-add`,
        params: {
          ...data,
          ...params,
          ...commonParam,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/manual-add`,
        data: data.length ? data[0] : {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/manual-add`,
        data: data[0],
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/manual-add`,
        data: data[0],
        method: 'DELETE',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'companyId',
  // autoCreate: true,
  fields: [
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.socialCode').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          const orgNo = record.get('orgNo');
          const businessNo = record.get('businessNo');
          const dunsNumber = record.get('dunsNumber');
          return !orgNo && !businessNo && !dunsNumber;
        },
      },
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseCode').d('组织机构代码'),
      name: 'orgNo',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          const socialCode = record.get('socialCode');
          const businessNo = record.get('businessNo');
          const dunsNumber = record.get('dunsNumber');
          return !socialCode && !businessNo && !dunsNumber;
        },
      },
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.registerCode').d('企业注册登记号'),
      name: 'businessNo',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          const socialCode = record.get('socialCode');
          const orgNo = record.get('orgNo');
          const dunsNumber = record.get('dunsNumber');
          return !socialCode && !orgNo && !dunsNumber;
        },
      },
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.dunsNumber').d('邓白氏编码'),
      name: 'dunsNumber',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          const socialCode = record.get('socialCode');
          const orgNo = record.get('orgNo');
          const businessNo = record.get('businessNo');
          return !socialCode && !orgNo && !businessNo;
        },
      },
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.businessStatus').d('经营状态'),
      name: 'businessStatus',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.enterpriseAddress').d('企业注册地址'),
      name: 'address',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.contactPhone').d('联系人电话'),
      name: 'phone',
      type: 'string',
      pattern: /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/,
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.contactMail').d('联系人邮箱'),
      name: 'email',
      type: 'email',
    },
    {
      label: intl.get('sdat.supplierBlacklistManage.model.website').d('网址'),
      name: 'website',
      type: 'string',
      pattern: /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
    },
    {
      label: intl.get('hzero.common.roles.contacts').d('联系人'),
      name: 'link',
      type: 'string',
    },
    {
      name: 'userName',
      type: 'string',
    },
    {
      name: 'userId',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.label.description').d('备注'),
      name: 'remark',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 企业图谱列表
 * @returns
 */
const MapListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/graph-record-list`,
        params: {
          ...data,
          ...params,
          tenantId,
          userId,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'supplierId',
  cacheSelection: true,
  // paging: false,
  fields: [
    {
      label: intl.get('sdat.supplierBlacklistManage.model.mapCheck').d('与最近一次图谱对比'),
      name: 'content',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.updateTime').d('更新时间'),
      name: 'graphUpdateTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.invalidTime').d('失效时间'),
      name: 'graphEndTime',
      type: 'dateTime',
    },
    {
      name: 'updateType',
      label: intl.get('sdat.monitorBusiness.model.updateType').d('更新方式'),
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

export { getBlackListDs, getBusinessListDS, getAddedBusinessListDS, getBlackRecordDS, MapListDS };
