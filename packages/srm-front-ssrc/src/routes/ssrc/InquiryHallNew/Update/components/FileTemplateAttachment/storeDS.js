import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// 询价DS 全局规则 - 附件要求
const fileTemplateAttachmentDS = ({ isNewRfx, rfxInfoDS, customizeUnitCode = '', node } = {}) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'attachmentLineId',
  fields: [
    {
      name: 'attachmentType',
      label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
      type: 'object',
      lovCode: 'SSRC.ATTACHMENT_TYPE',
      textField: 'fieldName',
      valueField: 'uniqueKey',
      required: true,
      optionsProps: {
        paging: false,
      },
      transformRequest: (value = {}) => {
        return value?.uniqueKey;
      },
      transformResponse: (value, record) =>
        value ? { uniqueKey: value, fieldName: record?.attachmentTypeMeaning } : null,
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('attachmentFrom') === 'TEMPLATE') {
            // 从寻源模板中带出的
            return true;
          }
        },
        lovPara: () => {
          const sourceCategory = rfxInfoDS?.current?.get('secondarySourceCategory');

          return {
            sourceCategory,
            node: 'RELEASE',
          };
        },
      },
      lovQueryAxiosConfig: (code, _, { data, params }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/template-attachment-lines/type`,
          method: 'POST',
          data: {
            code,
            ...data,
            ...params,
          },
        };
      },
    },
    {
      // 虚拟字段
      name: 'templateAttachment',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachmentTemplate`)
        .d('模板附件'),
    },
    {
      name: 'remark',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
        .d('模板描述'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      ...(ChunkUploadProps || {}),
      dynamicProps: {
        readOnly: ({ record }) => record.get('editableFlag') === 1,
      },
    },
    {
      name: 'sourceNode',
      defaultValue: node,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (!dataSet) {
        return;
      }
      dataSet.forEach((record = {}) => {
        const requiredFlag = record.get('requiredFlag');
        if (requiredFlag) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet, params }) => {
      const { queryParameter: { sourceId, templateId } = {} } = dataSet;
      if (isNewRfx && templateId && templateId !== 'null') {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/init`,
          method: 'POST',
          params: {
            ...(params || {}),
            sourceCategory: 'RFX',
            templateId,
            customizeUnitCode,
          },
        };
      }
      if (!sourceId || sourceId === 'null') return;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/list`,
        method: 'POST',
        params: {
          customizeUnitCode,
        },
        data: {
          sourceCategory: 'RFX',
          sourceId,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { sourceId } = {} } = dataSet;
      if (!sourceId || sourceId === 'null') return;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/delete`,
        method: 'POST',
        data: {
          sourceId,
          sourceCategory: 'RFX',
          attachmentLineIds: data.map((i) => i.attachmentLineId),
        },
      };
    },
  },
});

export { fileTemplateAttachmentDS };
