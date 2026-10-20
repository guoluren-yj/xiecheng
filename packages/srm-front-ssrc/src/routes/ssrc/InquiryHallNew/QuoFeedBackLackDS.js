import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const feedBackDS = (params = {}) => ({
  selection: false,
  paging: false,
  primaryKey: 'bidMemberId',
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'feedbackStatusMeaning',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.feedbackStatus`).d('是否参与'),
    },
    {
      name: 'quotationNumber',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.quotationNumber`).d('报价行数'),
    },
    {
      name: 'prequalStatusMeaning',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.prequalStatus`).d('是否资格预审'),
    },
    {
      name: 'attachmentFlag',
      type: 'number',
      label: intl.get(`ssrc.common.model.common.attachmentFlag`).d('是否上传头附件'),
    },
    {
      name: 'supplierCompanyIp',
      label: intl.get(`ssrc.common.model.common.quotatedIp`).d('报价IP'),
    },
  ],
  transport: {
    read: () => {
      const { rfxHeaderId, customizeUnitCode } = params;
      return {
        url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/quotation-feedback`,
        method: 'GET',
        data: { rfxHeaderId, customizeUnitCode },
      };
    },
  },
});

export { feedBackDS };
