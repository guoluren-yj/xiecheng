import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  primaryKey: 'changeReqId',
  cacheSelection: true,
  dataToJSON: 'selected',
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl
        .get('sslm.supplierEntry.model.supplierEntry.model.supplierEntry.status')
        .d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'changeReqNumber',
      label: intl.get('sslm.supplierEntry.model.supplierEntry.applyCode').d('申请单编号'),
    },
    {
      name: 'partnerCompanyNum',
      label: intl.get('sslm.supplierEntry.model.supplierEntry.supplierCode').d('供应商编码'),
    },
    {
      name: 'partnerCompanyName',
      label: intl.get('sslm.supplierEntry.model.supplierEntry.supplierName').d('供应商名称'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.supplierEntry.model.supplierEntry.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierEntry.model.supplierEntry.creationDate').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { reqStatusList, ...others } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...others,
          reqStatusList: reqStatusList?.join(',') || null,
          customizeUnitCode:
            'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL,SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST,SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING,SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
        },
      };
    },
  },
  // events: {
  // load: ({ dataSet }) => {
  //   dataSet.forEach(record => {
  //     if (record.data.reqStatus !== 'NEW' && record.data.reqStatus !== 'REJECTED') {
  //       Object.assign(record, { selectable: false });
  //     }
  //   });
  // },
  // },
});

export { indexDS };
