import { DataSet } from 'choerodon-ui/pro';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const optionDs = new DataSet({
  autoQuery: true,
  childrenField: 'children',
  transport: {
    read: {
      url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/tree`,
      method: 'GET',
      params: {
        tenantId: organizationId,
        'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
        'SPFM.COMPANY.SUB_ATTACHMENT': 2,
      },
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          const { children, parentValue } = record.get(['children', 'parentValue']);
          if (!children && !parentValue) {
            record.set('disabled', true);
          }
        });
      }
    },
  },
});

// 附件模板ds
const getAttachmentTemplateDS = () => ({
  paging: false,
  fields: [
    {
      name: 'attachmentFileType',
      required: true,
      label: intl.get(`spfm.investigationDefinition.view.attachment.type`).d('附件类型'),
      options: optionDs,
      textField: 'meaning',
      valueField: 'value',
      transformResponse: (value, record) => {
        const { attachmentType, parentAttachmentType } = record;
        if (parentAttachmentType && attachmentType) {
          return [parentAttachmentType, attachmentType];
        } else if (attachmentType) {
          return [attachmentType];
        } else {
          return value;
        }
      },
      ignore: 'always',
    },
    {
      name: 'parentAttachmentType',
    },
    {
      name: 'attachmentType',
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get(`spfm.investigationDefinition.view.attachmentDesc`).d('附件描述'),
    },
    {
      name: 'purchaseTemplUuid',
      type: 'attachment',
      label: intl.get(`spfm.investigationDefinition.view.purchaseTemplUuid`).d('采购方上传模板'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      min: 0,
      step: 1,
      defaultValue: 1,
      required: true,
      numberGrouping: false,
      label: intl.get(`spfm.investigationDefinition.model.definition.orderSeq`).d('排序'),
    },
    {
      name: 'supplierAttFlag',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spfm.investigationDefinition.view.asupplierAttFlag`).d('供方附件是否必传'),
    },
    {
      name: 'freezeControlFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get(`spfm.investigationDefinition.view.freezeControlFlag`)
        .d('供应商记账冻结管控'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { investigateTemplateId } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-atts`,
        method: 'GET',
        params: {
          ...params,
          investigateTemplateId,
        },
        data: {},
      };
    },
    destroy: ({ data, dataSet }) => {
      const newInvestigateTemplateId = dataSet.getState('newInvestigateTemplateId');
      const ids = data.map(item => item.investgCfAttTemplId);
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-atts/${newInvestigateTemplateId}`,
        method: 'DELETE',
        data: ids,
      };
    },
    submit: ({ data, dataSet }) => {
      const newInvestigateTemplateId = dataSet.getState('newInvestigateTemplateId');
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-atts/${newInvestigateTemplateId}`,
        method: 'POST',
        data,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { getAttachmentTemplateDS };
