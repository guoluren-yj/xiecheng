import intl from 'utils/intl';

const createTemplateDS = (selectedLength, bidFlag, otherPayload = {}) => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      name: 'templateIdLov',
      type: 'object',
      lovCode: 'SSRC.TEMPLATE_NAME',
      ignore: 'always',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
      required: true,
      dynamicProps: {
        lovPara() {
          const { selectData = {} } = otherPayload || {};
          const { sourceProjectId } = selectData || {};
          return {
            sourceCategory: 'RFX',
            secondarySourceCategory: bidFlag ? 'NEW_BID' : null,
            sourceFrom: 'PROJECT',
            sourceProjectId,
          };
        },
      },
      textField: 'templateName',
      valueField: 'templateId',
    },
    {
      name: 'templateId',
      bind: 'templateIdLov.templateId',
    },
    {
      name: 'templateName',
      bind: 'templateIdLov.templateName',
    },
    {
      name: 'qualificationType',
      bind: 'templateIdLov.qualificationType',
    },
    {
      name: 'mergeType',
      label: intl.get(`ssrc.inquiryHall.model.projectSetup.prequalMergeType`).d('资格预审合并方式'),
      type: 'string',
      lookupCode: 'SSRC_PREQUAL_MERGE_TYPE',
      dynamicProps: {
        required({ record }) {
          return record.get('qualificationType') === 'PRE' && selectedLength > 1;
        },
      },
    },
  ],
});

export { createTemplateDS };
