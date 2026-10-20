/**
 * 事件数据分配 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  cacheSelection: true,
  primaryKey: 'exportResultId',
  dataToJSON: 'selected',
  pageSize: 20,
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-results`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_EVENT_INTERFACE_QUERY.SEARCH_BAR,SPFM.PARTNER_LIST_INTERFACE_QUERY.LIST',
        },
      };
    },
  },
  fields: [
    {
      name: 'exportResultId',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.syncStatus`).d('导入状态'),
      name: 'syncStatusMeaning',
      type: 'string',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.returnInformation`).d('返回信息'),
      name: 'syncMsg',
      type: 'string',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.sourceDocumentNo').d('触发单据编号'),
      name: 'sourceDocumentNo',
      type: 'string',
    },
    {
      label: intl.get('entity.supplier.code').d('供应商编码'),
      name: 'supplierCompanyNum',
      type: 'string',
    },
    {
      label: intl.get('entity.supplier.name').d('供应商名称'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.erpSupplierNum').d('ERP供应商编码'),
      name: 'supplierNum',
      type: 'string',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.erpSupplierNanme').d('ERP供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.triggerEvent`).d('触发事件'),
      name: 'cfCodeMeaning',
      type: 'string',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.eventClassify`).d('触发事件分类'),
      name: 'cfCategoryMeaning',
      type: 'string',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.triggerTime').d('触发时间'),
      name: 'syncDate',
      type: 'dateTime',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.creationDate').d('首次触发时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.interfaceType`).d('接口类型'),
      name: 'syncFlagMeaning',
      type: 'string',
    },
    {
      label: intl.get(`spfm.importErp.model.importErp.interfaceMessage`).d('接口报文'),
      name: 'syncBody',
      type: 'string',
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.targetSystem`).d('多方外部系统'),
      name: 'targetSystemMeaning',
      type: 'string',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.data.syncStatus === 'SUCCESS') {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});
