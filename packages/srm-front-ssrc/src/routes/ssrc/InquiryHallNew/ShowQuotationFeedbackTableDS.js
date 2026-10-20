import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const tableDS = (record) => ({
  selection: false,
  paging: false,
  autoQuery: true,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanysName').d('供应商名称'),
    },
    {
      name: 'feedbackStatusMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherParticipate`).d('是否参与'),
    },
    {
      name: 'quotationNumber',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineNumber`).d('报价行数'),
    },
    {
      name: 'prequalStatusMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherPrequal`).d('是否资格预审'),
    },
    {
      name: 'postqualStatusMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherPostqual`).d('是否资格后审'),
    },
    {
      name: 'attachmentFlagMeaning',
      type: 'string',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.whetherHeaderUploaded`)
        .d('是否上传头附件'),
    },
  ],
  transport: {
    read: () => {
      const { rfxHeaderId, customizeUnitCode } = record;
      return {
        url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/quotation-feedback`,
        method: 'GET',
        data: {
          customizeUnitCode,
        },
      };
    },
  },
});

export { tableDS };
