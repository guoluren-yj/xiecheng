import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const maintenanceDataSet = () => ({
  autoQuery: false,
  primaryKey: 'asnHeaderId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'asnNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`entity.company.tag`).d('公司'),
    },
    {
      name: 'supplierSiteName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.companySiteName`).d('公司地点'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`entity.customer.tag`).d('客户'),
    },
    {
      name: 'actualReceiverName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
    },
    {
      name: 'shipToLocationAddress',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
    },
    {
      name: 'operationRecord',
      type: 'string',
      label: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({
        supplierTenantId: getUserOrganizationId(),
        ...params,
        ...other,
      });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier/maintain`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { maintenanceDataSet };
