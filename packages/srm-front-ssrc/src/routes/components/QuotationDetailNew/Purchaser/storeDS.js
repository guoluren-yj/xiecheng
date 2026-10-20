import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const organizationId = getCurrentOrganizationId();

const formDS = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'templateName',
      label: intl.get('ssrc.common.model.common.templateName').d('报价模板名称'),
    },
    {
      name: 'attachmentNeedFlag',
      label: intl.get(`ssrc.common.model.common.supplierAttachNeed`).d('供应商附件必传'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      disabled: true,
    },
    {
      name: 'allowCreateFlag',
      label: intl.get(`ssrc.common.model.common.allowCreateFlag`).d('允许供应商新建明细行'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      disabled: true,
    },
    {
      label: intl.get(`ssrc.common.model.template.allowPurCreateFlag`).d('允许采购方新建明细行'),
      name: 'allowPurCreateFlag',
      labelWidth: 150,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.upLoadPurchaseAttachment`).d('上传采购方附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'quotation-template',
      ...(ChunkUploadProps || {}),
    },
  ],
});

const tableDS = ({
  queryParams,
  handleDataSource,
  deleteUrl,
  deleteRequestPrams,
  remote,
  fetchHeaderAll,
}) => ({
  primaryKey: 'quotationDetailId',
  paging: 'server',
  idField: 'quotationDetailId',
  parentField: 'parentDetailId',
  expandField: 'expand',
  autoQuery: false,
  autoQueryAfterSubmit: false,
  dataToJSON: 'all',
  pageSize: 10,

  fields: [
    {
      name: 'configCode',
      label: intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码'),
      trim: 'both',
      required: true,
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
      required: true,
      type: 'intl',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { templateId },
      } = dataSet;
      const {
        itemId,
        sourceFrom,
        rfxHeaderId,
        rfxLineItemId,
        itemCategoryId,
        quotationHeaderId,
        quotationTemplateId,
      } = queryParams;
      const params = {
        itemId,
        templateId,
        sourceFrom,
        rfxHeaderId,
        rfxLineItemId,
        itemCategoryId,
        quotationHeaderId,
        quotationTemplateId,
      };
      const type = sourceFrom === 'RFX' || sourceFrom === 'PROJECT' ? 'rfx' : 'bid';
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/${type}/${rfxHeaderId}/quotationTemplate/view`,
        method: 'GET',
        data: params,
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const {
              supQuotationDetailPage: { content = [], ...pages },
            } = result;
            const data = handleDataSource(content);
            return { ...pages, content: data };
          }
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { operationType } = queryParams;
      if (deleteUrl) {
        // 如果外部传入有删除url，则使用外部的删除（ps：立项变更目前使用）
        return {
          url: deleteUrl,
          params: deleteRequestPrams,
          data: data.map((i) => i.quotationDetailId),
          method: 'DELETE',
          transformResponse: (res) => {
            if (!res) {
              dataSet.query(undefined, undefined, true);
            }
          },
        };
      }
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-details/${queryParams.rfxHeaderId}/${queryParams.rfxLineItemId}/delete?operationType=${operationType}`,
        data: data.map((i) => i.quotationDetailId),
        method: 'DELETE',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query(undefined, undefined, true);

            if (remote?.event) {
              remote.event.fireEvent('remoteAfterHandleDeleteSuccess', {
                dataSet,
                fetchHeaderAll,
              });
            }
          }
        },
      };
    },
  },
});

export { formDS, tableDS };
