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
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'quotation-template',
      ...(ChunkUploadProps || {}),
    },
  ],
});

const tableDS = ({
  rowKeyId,
  queryParams,
  handleDataSource,
  remote,
  queryTableUrl,
  queryTableParams,
}) => ({
  primaryKey: rowKeyId,
  paging: 'server',
  idField: rowKeyId,
  parentField: 'parentDetailId',
  expandField: 'expand',
  selection: false,
  autoQuery: false,
  dataToJSON: 'all',
  pageSize: 10,

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
      const {
        sourceFrom,
        itemId,
        itemCategoryId,
        quotationLineId,
        quotationHeaderId,
        quotationTemplateId,
        rfxHeaderId,
        rfxLineItemId,
        sourceResultId,
      } = queryParams;
      const dataParams = {
        templateId,
        sourceFrom,
        rfxLineItemId,
        itemId,
        itemCategoryId,
        rfxHeaderId,
        quotationLineId,
        quotationHeaderId,
        quotationTemplateId,
        sourceResultId,
      };
      const params = remote
        ? remote.process(
            'SSRC_QUOTATION_DETAIL_VIEW_MODAL_PROCESS_TABLE_QUERY_PARAMS',
            dataParams,
            { queryParams }
          )
        : dataParams;
      const type = sourceFrom === 'RFX' || sourceFrom === 'PROJECT' ? 'rfx' : 'bid';
      const url =
        sourceResultId || !rfxHeaderId
          ? `${SRM_SSRC}/v1/${organizationId}/rfx/external/quotationTemplate/view`
          : `${SRM_SSRC}/v1/${organizationId}/${type}/${rfxHeaderId}/quotationTemplate/view`;
      return {
        url: queryTableUrl ?? url, // ps: 外部传入的有url，则使用外部，目前立项变更审批在用
        method: 'GET',
        data: {
          ...(params || {}),
          ...(queryTableParams || {}),
        },
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
  },
});

export { formDS, tableDS };
