/**
 * 供应商找关系页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-09-06
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getUrlParam } from '@/utils/utils';

const { crmSignature = '', tenantId = '' } = getUrlParam() || {};

const header = crmSignature ? { 'ambn-client-signature': `${crmSignature}` } : {};

/**
 * 维度设计 列表 DS
 * @returns
 */
const RelationShipDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/service-models`,
        params: {
          ...data,
          ...params,
        },
        headers: {
          ...header,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.supplier.model.serialNumber`).d('序号'),
      name: 'serialNumber',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.view.btn.map`).d('图谱'),
      name: 'shipMap',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliatedRoad`).d('关联路径详情'),
      name: 'road',
      type: 'string',
    },
    {
      name: 'cuzRelationPath',
    },
  ],
  events: {},
});

export { RelationShipDS };
