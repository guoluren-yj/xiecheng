import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const supplierAttachmentDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'attachmentTypeMeaning',
      label: intl.get('sslm.sample.model.attachmentTypeMeaning').d('附件类型'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.requiredFlag').d('供应商是否必传'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'attachmentDesc',
      label: intl.get('sslm.sample.model.attachmentDesc').d('附件描述'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sslm.sample.model.attachmentUuid').d('供应商附件'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'attachmentType',
      label: intl.get('sslm.sample.model.attachmentTyp').d('附件类型'),
      lookupCode: 'SSLM.ATTACHMENT_TYPE',
    },

    {
      name: 'attachmentDesc',
      label: intl.get('sslm.sample.model.attachmentDesc').d('附件描述'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { sampleId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-attachments/${sampleId}/list`,
        method: 'get',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-attachments/createOrUpdate`,
        method: 'post',
        data,
      };
    },
  },
});

export { supplierAttachmentDS };
