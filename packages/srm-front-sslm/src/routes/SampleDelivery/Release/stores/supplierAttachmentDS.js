import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  fields: [
    {
      name: 'attachmentType',
      label: intl.get('sslm.sample.model.attachmentType').d('附件类型'),
      lookupCode: 'SSLM.ATTACHMENT_TYPE',
      required: true,
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
  ],
  queryFields: [
    {
      name: 'attachmentType',
      label: intl.get('sslm.sample.model.attachmentType').d('附件类型'),
      lookupCode: 'SSLM.ATTACHMENT_TYPE',
    },
    {
      name: 'attachmentDesc',
      label: intl.get('sslm.sample.model.attachmentDesc').d('附件描述'),
    },
  ],
  transport: {
    submit: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-attachments/createOrUpdate`,
      method: 'post',
      data,
    }),
    destroy: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-attachments/batchRemove`,
      method: 'post',
      data,
    }),
    read: ({ dataSet }) => {
      const { queryParameter: { sampleId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-attachments/${sampleId}/list`,
        method: 'get',
      };
    },
  },
});

export { listLineDS };
