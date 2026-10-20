/**
 * 关系挖掘页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-09-06
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// const { tenantId = '' } = getLocationParam() || {};

/**
 * 关系挖掘 列表 DS
 * @returns
 */
const RelationMiningDS = (tenantId) => ({
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/relation-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.supplier.model.serialNumber`).d('序号'),
      name: 'serialNumber',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.relationshipDetails`).d('关系详情'),
      name: 'relationshipDetails',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.blackCompName`).d('黑名单企业'),
      name: 'relatedCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.targetEnterprise`).d('目标企业'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedShareholders`).d('关联股东'),
      name: 'relatedType',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedRoad`).d('关联路径详情'),
      name: 'affiliatedRoad',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedLevel`).d('关联层级'),
      name: 'Level',
      type: 'string',
    },
    {
      name: 'cuzRelationPath',
    },
  ],
  events: {},
});

/**
 * 关系挖掘 列表 DS
 * @returns
 */
const RelationMiningHisDS = (tenantId) => ({
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/relation-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.supplier.model.serialNumber`).d('序号'),
      name: 'serialNumber',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.relationshipDetails`).d('关系详情'),
      name: 'relationshipDetails',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.blackCompName`).d('黑名单企业'),
      name: 'relatedCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.targetEnterprise`).d('目标企业'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedShareholders`).d('关联股东'),
      name: 'relatedType',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedRoad`).d('关联路径详情'),
      name: 'affiliatedRoad',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedLevel`).d('关联层级'),
      name: 'Level',
      type: 'string',
    },
    {
      name: 'cuzRelationPath',
    },
  ],
  events: {},
});

/**
 * 筛选条件 DS
 * @returns
 */
const QueryDS = () => ({
  transport: {},
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.supplier.model.waitingType`).d('待排查企业类型'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDAT.RELATION_TROUBLESHOOTING_TYPE',
      lookupAxiosConfig: () => {
        return {
          url: `/hpfm/v1/lovs/data?lovCode=SDAT.RELATION_TROUBLESHOOTING_TYPE`,
          method: 'GET',
          transformResponse: [
            (data) => {
              // 处理数据
              const list = JSON.parse(data);
              return list.filter((item) => [2, '2'].includes(item.value));
            },
          ],
        };
      },
    },
  ],
  events: {},
});

const HistoryQueryDS = () => ({
  transport: {},
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.supplier.model.timeRange`).d('时间范围'),
      name: 'dateRange',
      type: 'date',
      range: true,
    },
    {
      label: intl.get(`sdat.supplier.model.triggerAction`).d('触发动作'),
      name: 'businessType',
      type: 'string',
      lookupCode: 'SDAT.BLACKLIST_RELATION_ACTION',
      lookupAxiosConfig: () => {
        return {
          url: `/hpfm/v1/lovs/data?lovCode=SDAT.BLACKLIST_RELATION_ACTION`,
          method: 'GET',
          transformResponse: [
            (data) => {
              // 处理数据
              const list = JSON.parse(data);
              return list.filter((item) => item.tag === 'PARTNER' || item.tag === 'COMMON');
            },
          ],
        };
      },
    },
  ],
  events: {},
});

export { RelationMiningDS, QueryDS, RelationMiningHisDS, HistoryQueryDS };
