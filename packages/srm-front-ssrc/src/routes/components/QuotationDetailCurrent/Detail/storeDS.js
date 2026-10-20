import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const formDS = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'templateName',
      label: intl.get('ssrc.common.model.common.templateName').d('报价模板名称'),
    },
    {
      name: 'quoDetailAttachmentUuid',
      label: intl.get(`ssrc.common.model.common.viewSupplierAttachment`).d('查看供应商附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      ...(ChunkUploadProps || {}),
    },
    {
      name: 'attachmentNeedFlag',
      label: intl.get(`ssrc.common.model.common.supplierAttachNeed`).d('供应商附件必传'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'allowCreateFlag',
      label: intl.get(`ssrc.common.model.common.allowCreateFlag`).d('允许供应商新建明细行'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.common.model.template.allowPurCreateFlag`).d('允许采购方新建明细行'),
      name: 'allowPurCreateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.viewPurchaseAttachment`).d('查看采购方附件'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.viewPurchaseAttachment`).d('查看采购方附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'quotation-template',
      ...(ChunkUploadProps || {}),
    },
  ],
});

const tableDS = ({ rowKeyId, queryParams, handleDataSource }) => ({
  primaryKey: rowKeyId,
  paging: 'server',
  idField: rowKeyId,
  parentField: 'parentDetailId',
  expandField: 'expand',
  selection: false,
  autoQuery: false,
  dataToJSON: 'all',

  fields: [
    {
      name: 'configCode',
      label: intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码'),
      trim: 'both',
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('configCode'))) {
          return intl
            .get(`ssrc.common.model.common.validation.configCode`)
            .d('报价明细列编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'configName',
      label: intl.get(`ssrc.common.model.common.configName`).d('报价明细项名称'),
      type: 'intl',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { templateId },
      } = dataSet;
      const organizationId = getCurrentOrganizationId();

      const {
        sourceFrom,
        itemId,
        itemCategoryId,
        quotationLineCurrentId,
        quotationHeaderCurrentId,
        quotationTemplateId,
        rfxHeaderId,
        rfxLineItemId,
        sourceResultId,
        quotationLineId,
        quotationHeaderId,
      } = queryParams || {};

      const params = {
        quotationLineId,
        quotationHeaderId,
        templateId,
        sourceFrom,
        rfxLineItemId,
        itemId,
        itemCategoryId,
        rfxHeaderId,
        quotationLineCurrentId,
        quotationHeaderCurrentId,
        quotationTemplateId,
        sourceResultId,
      };
      const type = sourceFrom === 'RFX' ? 'rfx' : 'bid';
      const url =
        sourceResultId || !rfxHeaderId
          ? `${SRM_SSRC}/v1/${organizationId}/rfx/external/quotationTemplate/view`
          : `${SRM_SSRC}/v1/${organizationId}/${type}/${rfxHeaderId}/quotationTemplate/view`;
      return {
        url,
        method: 'GET',
        data: params,
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const {
              supQuotationDetailPage: { content = [], ...pages },
            } = result || {};
            const data = handleDataSource(content);
            return { ...pages, content: data };
          }
        },
      };
    },
  },
});

const itemFormDS = () => {
  return {
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        name: 'itemName',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { commonProps = {}, ...others } = data || {};
        const { organizationId } = commonProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/items`,
          method: 'GET',
          data: { ...commonProps, ...others },
        };
      },
    },
  };
};

export { formDS, tableDS, itemFormDS };
