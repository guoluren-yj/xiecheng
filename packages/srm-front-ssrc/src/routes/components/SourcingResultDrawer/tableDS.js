import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

const promptCode = 'ssrc.common';
const organizationId = getCurrentOrganizationId();

const tableDS = (params = {}) => ({
  primaryKey: 'rfxLineSupplierId',
  selection: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.common.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${promptCode}.model.common.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'feedbackStatusMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.common.feedbackStatus`).d('是否参与'),
    },
    {
      name: 'quotationNumber',
      type: 'string',
      label: intl.get(`${promptCode}.model.common.quotationNumber`).d('报价行数'),
    },
    {
      name: 'prequalStatusMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.common.prequalStatus`).d('是否资格预审'),
    },
    {
      name: 'attachmentFlag',
      type: 'number',
      label: intl.get(`${promptCode}.model.common.attachmentFlag`).d('是否上传头附件'),
    },
  ],
  transport: {
    read: ({ dataSet: { queryParameter } }) => {
      const { customizeUnitCode } = params;
      const { rfxHeaderId } = queryParameter;
      return {
        url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/quotation-feedback/page`,
        method: 'GET',
        data: { rfxHeaderId, customizeUnitCode },
      };
    },
  },
});

export default tableDS;
