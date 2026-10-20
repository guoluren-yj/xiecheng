import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const formDS = ({ currentEditDisable = false }) => ({
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
        required({ record }) {
          return record.get('attachmentNeedFlag') === 1 && !currentEditDisable;
        },
        readOnly() {
          return currentEditDisable;
        },
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
  currentEditDisable = false,
  remote,
  fetchHeaderAll,
}) => ({
  primaryKey: 'supQuotationDetailCurrentId',
  paging: 'server',
  idField: 'supQuotationDetailCurrentId',
  parentField: 'parentDetailId',
  expandField: 'expand',
  autoQuery: false,
  autoQueryAfterSubmit: false,
  dataToJSON: 'all',

  fields: [
    {
      name: 'configCode',
      label: intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码'),
      trim: 'both',
      // required: !currentEditDisable,
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
        required: ({ record }) => {
          const flag = record.get('createFlag') === 1 && !currentEditDisable;
          return flag;
        },
        disabled: ({ record }) => {
          return record.get('createFlag') !== 1 || currentEditDisable;
        },
      },
    },
    {
      name: 'configName',
      label: intl.get(`ssrc.common.model.common.configName`).d('报价明细项名称'),
      type: 'intl',
      // required: !currentEditDisable,
      dynamicProps: {
        required: ({ record }) => {
          const flag = record.get('createFlag') === 1 && !currentEditDisable;
          return flag;
        },
        disabled: ({ record }) => {
          return record.get('createFlag') !== 1 || currentEditDisable;
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
      const organizationId = getCurrentOrganizationId();

      const {
        sourceFrom,
        itemId,
        itemCategoryId,
        quotationLineCurrentId,
        quotationHeaderCurrentId,
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
        quotationLineCurrentId,
        quotationHeaderCurrentId,
      };
      if (detailFrom) {
        params.from = detailFrom;
      }
      // const type = sourceFrom === 'RFX' ? 'rfx' : 'bid';
      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/sup-dtl`,
        method: 'GET',
        data: params,
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const {
              supQuotationDtlCurPage: { content = [], ...pages },
            } = result;
            const data = handleDataSource(content);
            return { ...pages, content: data };
          }
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const {
        queryParameter: { quotationLineCurrentId, sourceParams },
      } = dataSet;
      const organizationId = getCurrentOrganizationId();

      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/sup-dtl`,
        data: {
          supQuotationDetailCurrentIds: data.map((i) => i.supQuotationDetailCurrentId),
          quotationLineCurrentId,
          ...sourceParams,
        },
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
