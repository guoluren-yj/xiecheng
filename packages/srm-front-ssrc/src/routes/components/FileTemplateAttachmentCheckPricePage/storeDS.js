import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// 附件要求
const fileTemplateAttachmentDS = (options) => {
  const { select, editorFlag, node } = options || {};

  return {
    autoQuery: false,
    dataToJSON: 'all',
    selection: select,
    primaryKey: 'attachmentLineId',
    fields: [
      {
        name: 'attachmentType',
        label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
        type: 'object',
        lovCode: 'SSRC.ATTACHMENT_TYPE',
        textField: 'fieldName',
        valueField: 'uniqueKey',
        optionsProps: {
          paging: false,
        },
        transformRequest: (value = {}) => {
          return value?.uniqueKey;
        },
        transformResponse: (value, record) =>
          value ? { uniqueKey: value, fieldName: record?.attachmentTypeMeaning } : null,
        dynamicProps: {
          required({ record }) {
            const attachmentFrom = record.get('attachmentFrom');
            const flag = !!editorFlag && attachmentFrom !== 'TEMPLATE';
            return flag;
          },
          disabled: ({ record }) => {
            const attachmentFrom = record.get('attachmentFrom');
            const flag = attachmentFrom === 'TEMPLATE' || !editorFlag;

            return flag;
          },
          lovPara: ({ dataSet }) => {
            const headerDS = dataSet.getState('headerDS');
            const { current } = headerDS || {};

            const { secondarySourceCategory } = current
              ? current.get(['secondarySourceCategory'])
              : {};

            return {
              // templateAttachmentLineList: dataSet.toData(),
              node,
              sourceCategory: secondarySourceCategory,
            };
          },
        },
        lovQueryAxiosConfig: (code, _, { data, params }) => {
          return {
            url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/template-attachment-lines/type`,
            method: 'POST',
            data: {
              code,
              node,
              ...data,
              ...params,
              page: null,
              pageSize: null,
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
        // 虚拟字段
        name: 'editorOnline',
        label: intl.get(`ssrc.common.view.editorOnline`).d('在线编辑'),
      },
      {
        name: 'remark',
        label: intl
          .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
          .d('模板描述'),
        disabled: true,
      },
      {
        name: 'attachmentUuid',
        label: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-template-requirement',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          readOnly: ({ record }) => !editorFlag || record.get('editableFlag') === 1,
        },
      },
      {
        name: 'sourceNode',
        defaultValue: node,
      },
      {
        name: 'fileManageId',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        if (!dataSet?.length || !editorFlag) {
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
      read: ({ data, params }) => {
        const { commons } = data || {};
        const { organizationId, customizeUnitCode, ...others } = commons || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/attachment-lines/list`,
          method: 'POST',
          data: {
            sourceCategory: 'RFX',
            ...others,
          },
          params: {
            customizeUnitCode,
            ...params,
          },
        };
      },
      destroy: ({ data, dataSet }) => {
        const { queryParameter: { commons } = {} } = dataSet;
        const { organizationId, customizeUnitCode, ...others } = commons || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/attachment-lines/delete`,
          method: 'POST',
          params: {
            customizeUnitCode,
          },
          data: {
            ...others,
            sourceCategory: 'RFX',
            attachmentLineIds: data.map((i) => i.attachmentLineId),
          },
        };
      },
    },
  };
};

export { fileTemplateAttachmentDS };
