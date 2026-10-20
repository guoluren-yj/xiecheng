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
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.viewPurchaseAttachment`).d('查看采购方附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'quotation-template',
      ...(ChunkUploadProps || {}),
    },
    {
      name: 'quoDetailAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.common.model.common.uploadSupplierAttachment`).d('上传供应商附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'quotation-template',
      dynamicProps: {
        required: ({ record }) => record.get('attachmentNeedFlag') === 1,
      },
      ...(ChunkUploadProps || {}),
    },
  ],
});

const tableDS = ({
  abandonedFlag,
  queryParams,
  detailFrom,
  handleDataSource,
  postAndDeleteParams,
  extendInterfaceParams = {},
  remote,
  fetchHeaderAll,
}) => ({
  primaryKey: 'supQuotationDetailId',
  paging: 'server',
  idField: 'supQuotationDetailId',
  parentField: 'parentDetailId',
  autoQueryAfterSubmit: false,
  expandField: 'expand',
  autoQuery: false,
  dataToJSON: 'all',

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
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('createFlag') !== 1;
        },
      },
    },
    {
      name: 'configName',
      label: intl.get(`ssrc.common.model.common.configName`).d('报价明细项名称'),
      type: 'intl',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('createFlag') !== 1;
        },
      },
    },
  ],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.createFlag !== 1 || abandonedFlag) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },

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
        rfxLineItemId,
        rfxHeaderId,
      } = queryParams;

      const params = {
        templateId,
        sourceFrom,
        rfxLineItemId,
        itemId,
        itemCategoryId,
        rfxHeaderId,
        quotationLineId,
        quotationHeaderId,
      };
      if (detailFrom) {
        params.from = detailFrom;
      }
      const type = sourceFrom === 'RFX' ? 'rfx' : 'bid';
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
      const {
        queryParameter: { templateId, moduleRule },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/${queryParams.rfxHeaderId}/${queryParams.quotationLineId}/supQuotationDetails/batchDelete`,
        data: data.map((i) => i.supQuotationDetailId),
        method: 'DELETE',
        params: {
          ...postAndDeleteParams,
          ...(extendInterfaceParams || {}),
          templateId: moduleRule === 'SUB_MODULE' ? templateId : undefined,
        },
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
