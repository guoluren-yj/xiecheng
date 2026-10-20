import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const currentUserId = getCurrentUserId();

// 列表页DS
const getIndexDS = () => ({
  primaryKey: 'extSupplierReqId',
  cacheSelection: true,
  dataToJSON: 'selected',
  autoLocateFirst: false,
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyStatus').d('申请状态'),
    },
    {
      name: 'reqNumber',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyNum').d('申请单号'),
    },
    {
      name: 'reqTypeCodeMeaning',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyType').d('单据类型'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierName').d('供应商名称'),
    },
    {
      name: 'creator',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.creationTime').d('创建时间'),
    },
    {
      name: 'operating',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        const { data: { reqStatus, createdBy } = {} } = record;
        if (!['NEW', 'REJECTED'].includes(reqStatus) || currentUserId !== createdBy) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },

  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs`,
        method: 'GET',
        params: {
          customizeUnitCode:
            'SSLM.EASY_SUPPLIER_WAREHOUSE.LIST,SSLM.EASY_SUPPLIER_WAREHOUSE.SEARCH_BAR',
          ...params,
        },
      };
    },
    destroy: ({ data, params }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/delete`,
      method: 'DELETE',
      data,
      params: {
        customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.LIST',
        ...params,
      },
    }),
  },
});

// 历史记录DS
const getHistoryRecordDS = () => ({
  selection: false,
  fields: [
    {
      name: 'reqNumber',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyNum').d('申请单号'),
    },
    {
      name: 'creator',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.originator').d('变更人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.lastChangeTime').d('最近变更时间'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs`,
      method: 'GET',
    },
  },
});

// 新建弹窗DS
const getNewModalDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'reqTypeCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.reqTypeCode').d('单据类型'),
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_TYPE',
      required: true,
    },
    {
      name: 'supplierLov',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplier').d('供应商'),
      lovCode: 'SSLM.UNLINKED_EXT_SUPPLIER',
      type: 'object',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => record && record.get('reqTypeCode') === 'SUP_UPDATE_REQ',
        disabled: ({ record }) => record && record.get('reqTypeCode') !== 'SUP_UPDATE_REQ',
      },
    },
    {
      name: 'supplierId',
      bind: 'supplierLov.supplierId',
    },
    {
      name: 'supplierNum',
      bind: 'supplierLov.supplierNum',
    },
    {
      name: 'supplierName',
      bind: 'supplierLov.supplierName',
    },
    {
      name: 'externalSystemCode',
      bind: 'supplierLov.externalSystemCode',
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'reqTypeCode': {
          record.set('supplierLov', null);
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export { getIndexDS, getHistoryRecordDS, getNewModalDS };
