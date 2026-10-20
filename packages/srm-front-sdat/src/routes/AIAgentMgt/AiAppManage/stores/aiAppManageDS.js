/**
 * 供应商黑名单DS 租户级
 * @Author: zepeng.huang@going-link.com
 * @Date: 2022-11-22
 * @Copyright: Copyright (c) 2022, Zhenyun
 */

import intl from 'utils/intl';
// import { SRM_DATA_SDAT } from '@/utils/config';
import { PRIVATE_BUCKET } from '_utils/config';

const BUCKET_DIRECTORY = 'sdat-aiAgent-workbench';

const ServiceListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/smbl/v1/ai-skill-configs/list`,
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
      label: intl.get('sdat.aiAppManage.model.skillName').d('技能名称'),
      name: 'skillName',
      type: 'string',
      // lookupCode: 'SMBL.AI_SKILL',
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillAliasName').d('技能别名'),
      name: 'skillAliasName',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillCode').d('技能编码'),
      name: 'skillCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillIcon').d('技能图标'),
      name: 'skillIcon',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillType').d('技能类型'),
      name: 'skillType',
      type: 'string',
      lookupCode: 'SMBL.AI_SKILL_TYPE',
    },
    {
      label: intl.get('sdat.aiAppManage.model.apiKey').d('技能APIKEY'),
      name: 'secretKey',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillDesc').d('技能描述'),
      name: 'skillDesc',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillComment').d('技能推荐问'),
      name: 'suggestion',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.tenant').d('租户'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.serviceType').d('服务类型'),
      name: 'serviceType',
      type: 'string',
      lookupCode: 'SMBL.AI_SKILL_SERVICE_TYPE',
    },
    {
      label: intl.get('sdat.aiAppManage.model.callAddress').d('调用地址'),
      name: 'endPoint',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.thirdSupplier').d('三方供应商'),
      name: 'supplier',
      type: 'string',
      lookupCode: 'SMBL.AI_SUPPLIER',
    },
    {
      label: intl.get('sdat.aiAppManage.model.status').d('状态'),
      name: 'enableFlag',
      type: 'number',
    },
    {
      label: intl.get('sdat.aiAppManage.model.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.moduleCode').d('使用方'),
      name: 'moduleCode',
      type: 'string',
      lookupCode: 'SMBL.AI_MODULE',
    },
    {
      label: intl.get('sdat.aiAppManage.model.sortNum').d('排序号'),
      name: 'sortNum',
      type: 'number',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.aiAppManage.model.skillName').d('技能名称'),
      name: 'skillName',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.tenant').d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SRM.TENAT.LIST',
      noCache: true,
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
  ],
  events: {},
});

const ServiceDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/smbl/v1/ai-skill-configs/add`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `/smbl/v1/ai-skill-configs/add`,
        data,
        method: 'POST',
      };
    },

    update: ({ data }) => {
      return {
        url: `/smbl/v1/ai-skill-configs/update`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get('sdat.aiAppManage.model.skillName').d('技能名称'),
      name: 'skillName',
      type: 'string',
      lookupCode: 'SMBL.AI_SKILL',
      required: true,
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillAliasName').d('技能别名'),
      name: 'skillAliasName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillCode').d('技能编码'),
      name: 'skillCode',
      type: 'string',
      required: true,
      // pattern: '^[A-Za-z][A-Za-z0-9_-]*$',
      // maxLength: 20,
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillType').d('技能类型'),
      name: 'skillType',
      type: 'string',
      lookupCode: 'SMBL.AI_SKILL_TYPE',
      required: true,
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillIcon').d('技能图标'),
      name: 'skillIcon',
      type: 'attachment',
      max: 1,
      fileSize: 10 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
      // listType: 'picture-card',
    },
    {
      label: intl.get('sdat.aiAppManage.model.serviceType').d('服务类型'),
      name: 'serviceType',
      type: 'string',
      required: true,
      lookupCode: 'SMBL.AI_SKILL_SERVICE_TYPE',
    },
    {
      label: intl.get('sdat.aiAppManage.model.apiKey').d('服务APIKEY'),
      name: 'secretKey',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('sdat.aiAppManage.model.skillDesc').d('技能描述'),
      name: 'skillDesc',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.tenant').d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SRM.TENAT.LIST',
      required: true,
      noCache: true,
      displayField: 'tenantName',
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantObj.tenantName',
    },
    {
      label: intl.get('sdat.aiAppManage.model.thirdSupplier').d('三方供应商'),
      name: 'supplier',
      type: 'string',
      lookupCode: 'SMBL.AI_SUPPLIER',
      required: true,
    },
    {
      label: intl.get('sdat.aiAppManage.model.callAddress').d('调用地址'),
      name: 'endPoint',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('sdat.aiAppManage.model.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.sortNum').d('排序号'),
      name: 'sortNum',
      type: 'number',
      step: 1,
      min: 0,
    },
  ],
  queryFields: [],
  events: {},
});

const IntlMultiDS = () => ({
  tlsUrl: '/hpfm/v1/multi-language?fieldName=suggestion',
  transport: {},
  fields: [
    {
      label: intl.get('sdat.aiAppManage.view.placeholder.pleaseInput').d('请输入'),
      name: 'suggestion1',
      type: 'intl',
      // maxLength: 20,
    },
    {
      label: intl.get('sdat.aiAppManage.view.placeholder.pleaseInput').d('请输入'),
      name: 'suggestion2',
      type: 'intl',
      // maxLength: 20,
    },
    {
      label: intl.get('sdat.aiAppManage.view.placeholder.pleaseInput').d('请输入'),
      name: 'suggestion3',
      type: 'intl',
      // maxLength: 20,
    },
    {
      label: intl.get('sdat.aiAppManage.view.placeholder.pleaseInput').d('请输入'),
      name: 'suggestion4',
      type: 'intl',
      // maxLength: 20,
    },
    {
      label: intl.get('sdat.aiAppManage.view.placeholder.pleaseInput').d('请输入'),
      name: 'c',
      type: 'intl',
      // maxLength: 20,
    },
  ],
  queryFields: [],
  events: {},
});

export { ServiceListDS, ServiceDetailDS, IntlMultiDS };
