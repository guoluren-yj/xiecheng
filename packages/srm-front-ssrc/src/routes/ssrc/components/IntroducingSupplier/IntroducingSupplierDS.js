import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const fetchRFDS = (sourceProjectId, targetSourceCategory, companyId) => ({
  primaryKey: 'prLineId',
  dataToJSON: 'all',
  fields: [
    {
      name: 'rfNum',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.orderNumber`).d('单号'),
    },
    {
      name: 'rfTitle',
      type: 'string',
      label: intl.get('hzero.common.button.title').d('标题'),
    },
    {
      name: 'sourceCategory',
      label: intl.get('ssrc.inquiryHall.view.message.button.orderType').d('单据类型'),
    },
    {
      name: 'rfRemark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  queryFields: [
    {
      name: 'rfNumAndTitle',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.orderNumberOrTitle`).d('单号/标题'),
    },
    {
      name: 'sourceCategory',
      lookupCode: 'SSRC.RF_SOURCE_CATEGORY',
      label: intl.get('ssrc.inquiryHall.view.message.button.orderType').d('单据类型'),
    },
    {
      name: 'rfRemark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const currentRecord = record;
        if (currentRecord.get('projectLineSections')) {
          currentRecord.selectable = false;
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      if (!companyId) {
        return null;
      }
      return {
        url: `${Prefix}/${organizationId}/rf/introduce-suppliers`,
        method: 'GET',
        data: {
          ...data,
          sourceProjectId,
          targetSourceCategory,
        },
      };
    },
  },
});

const fetchSupplierDS = () => ({
  paging: false,
  dataToJSON: 'all',
  selection: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.common.supplierName').d('供应商名称'),
    },
    {
      name: 'suggestedRemark',
      type: 'string',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.suggestedRemark`).d('选择理由'),
    },
  ],
});

export { fetchRFDS, fetchSupplierDS };
