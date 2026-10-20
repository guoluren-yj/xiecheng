/**
 * 关系挖掘页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-09-06
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';

/**
 * 关系挖掘 列表 DS
 * @returns
 */
const RelationMiningDS = () => ({
  transport: {},
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
      label: intl.get(`sdat.supplier.model.relationshipDetails`).d('关系详情'),
      name: 'relationshipDetails',
      type: 'string',
    },
    {
      label: intl.get(`sdat.monitorBusiness.model.companyName`).d('企业名称'),
      name: 'CompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliate`).d('关联企业'),
      name: 'RelatedCompanyName',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplier.view.title.relationType').d('关系类型'),
      name: 'RelatedName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.relationRoad`).d('关系路径详情'),
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
 * 联系方式
 * @returns
 */
const RelationContactMiningDS = () => ({
  transport: {},
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
      label: intl.get(`sdat.supplier.model.relationshipDetails`).d('关系详情'),
      name: 'relationshipDetails',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.companyName`).d('企业名称'),
      name: 'CompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.affiliate`).d('关联企业'),
      name: 'RelatedCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.view.title.contactInfo`).d('联系方式'),
      name: 'RelatedName',
      type: 'string',
    },
    {
      label: intl.get('sdat.supplier.view.title.relationType').d('关系类型'),
      name: 'RelatedType',
      type: 'string',
    },
    {
      label: intl.get(`sdat.supplier.model.relationRoad`).d('关系路径详情'),
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

export { RelationMiningDS, RelationContactMiningDS };
