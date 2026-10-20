/**
 * attachmentDS.js - 附件DS
 * @date: 2020-09-09
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { HZERO_PLATFORM } from 'utils/config';

const optionDs = new DataSet({
  childrenField: 'children',
  autoQuery: true,
  fields: [
    { name: 'value', type: 'string' },
    { name: 'meaning', type: 'string' },
  ],
  transport: {
    read: () => {
      return {
        url: `${HZERO_PLATFORM}/v1/lovs/value/tree`,
        method: 'GET',
        params: {
          'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
          'SPFM.COMPANY.SUB_ATTACHMENT': 2,
        },
        data: {},
      };
    },
  },
});

function attachmentDS() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'attachmentTypeMerge',
        type: 'string',
        required: true,
        label: intl.get('entity.attachment.type').d('附件类型'),
        textField: 'meaning',
        valueField: 'value',
        transformResponse: (value, record) => {
          const { attachmentType, subAttachment } = record;
          if (attachmentType && subAttachment) {
            return [attachmentType, subAttachment];
          } else {
            return value;
          }
        },
        options: optionDs,
        ignore: 'always',
      },
      {
        name: 'attachmentType',
        type: 'string',
        required: true,
        label: intl.get('entity.attachment.type').d('附件类型'),
      },
      {
        name: 'subAttachment',
        type: 'string',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('entity.attachment.description').d('附件描述'),
      },
      {
        name: 'endDate',
        type: 'date',
        label: intl.get('spfm.attachment.model.attachment.endDate').d('文件到期日'),
        computedProps: {
          disabled: ({ record }) => record.get('longEffectiveFlag'),
          required: ({ record }) => !record.get('longEffectiveFlag'),
        },
      },
      {
        name: 'longEffectiveFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('spfm.attachment.model.attachment.longEffective').d('是否长期有效'),
      },
      {
        name: 'uploadDate',
        type: 'date',
        disabled: true,
        label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后更新时间'),
      },
      {
        name: 'attachmentUuid',
        type: 'string',
        label: intl.get('entity.attachment.upload').d('附件上传'),
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'longEffectiveFlag' && value === 1) {
          record.set('endDate', null);
        }
      },
    },
  };
}

export default attachmentDS;
