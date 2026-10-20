/*
 * @Date: 2023-04-04 15:43:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getQueryParams = status => {
  switch (status) {
    case 'waitSubmit':
      return {
        toSubmitFlag: 1,
        unitCode: [
          'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_LIST',
          'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_SEARCH_BAR',
        ],
      };
    case 'approval':
      return {
        reqStatus: 'SUBMITTED',
        unitCode: [
          'SSSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_LIST',
          'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_SEARCH_BAR',
        ],
      };
    case 'all':
      return {
        unitCode: [
          'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_LIST',
          'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_SEARCH_BAR',
        ],
      };
    default:
      return {};
  }
};

export const getDocumentsListDS = status => ({
  pageSize: 20,
  forceValidate: true,
  cacheSelection: true,
  dataToJSON: 'selected',
  primaryKey: 'changeReqId',
  selection: ['waitSubmit', 'all'].includes(status) ? 'multiple' : false,
  fields: [
    {
      name: 'reqStatus',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_REQ_STATUS',
      label: intl.get('sslm.supplierInform.model.supplierInform.applicationState').d('申请状态'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'changeReqNumber',
      label: intl.get('sslm.supplierInform.model.supplierInform.applicationNum').d('申请单号'),
    },
    {
      name: 'changeLevel',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      label: intl.get('sslm.supplierInform.model.supplierInform.latitudeChange').d('变更维度'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.supplierCompany').d('供应商'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.supplierInform.model.supplierInform.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { unitCode = [], ...rest } = getQueryParams(status);
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`,
        method: 'GET',
        data: {
          ...data,
          ...rest,
          customizeUnitCode: unitCode.join(','),
        },
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`,
      method: 'DELETE',
      data: data && data.map(n => n.changeReqId),
    }),
  },
});
