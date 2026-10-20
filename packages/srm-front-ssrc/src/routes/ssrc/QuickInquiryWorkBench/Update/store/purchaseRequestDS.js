import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const tableDS = () => {
  return {
    autoQuery: true,
    primaryKey: 'prLineId',
    pageSize: 20,
    selection: 'multiple',
    fields: [
      {
        name: 'displayPrNumOrDisplayLineNum',
        label: intl
          .get('ssrc.quickInquiry.model.quickInquiry.displayPrNumOrDisplayLineNum')
          .d('申请编号-行号'),
      },
      {
        name: 'itemCode',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemName').d('物料名称'),
      },
      {
        name: 'referencePrice',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.referencePrice').d('参考价格'),
        type: 'number',
      },
      {
        name: 'categoryName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.categoryName').d('物料类别'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.companyName').d('公司'),
      },
      {
        name: 'ouName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.ouName').d('业务实体'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.invOrganizationName').d('库存组织'),
      },
      {
        label: intl.get(`ssrc.common.model.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.currencyCode`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.taxCode`).d('税率代码'),
        name: 'taxCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.tax`).d('税率'),
        name: 'taxRate',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prRequestedName`).d('申请人'),
        name: 'prRequestedName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.executorName`).d('需求执行人'),
        name: 'executorName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.purOrganizationName`).d('采购组织'),
        name: 'purchaseOrgName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.purchaseName`).d('采购员'),
        name: 'purchaseAgentName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.requestDate`).d('申请日期'),
        name: 'requestDate',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.remark`).d('备注'),
        name: 'remark',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prSourcePlatform`).d('数据来源'),
        name: 'prSourcePlatformMeaning',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.projectCategory`).d('项目类别'),
        name: 'projectCategoryMeaning',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prTypeName`).d('申请类型'),
        name: 'prTypeName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.demandAttachmentUuid`).d('需求附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        readOnly: true,
        ...(ChunkUploadProps || {}),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.demandRemark`).d('需求描述'),
        name: 'headerRemark',
      },
      {
        name: 'urgentFlag',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.urgentFlag').d('加急标识'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.suggestSupplier').d('建议供应商'),
      },
    ],
    transport: {
      read: ({ params = {}, data = {} }) => {
        // eslint-disable-next-line no-unused-vars
        const { multiSelectHeaderAndLineNums = null, ...others } = data || {};
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-pr-line/quick-inquiry-query-line`,
          method: 'POST',
          params: {
            ...(others || {}),
            ...(params || {}),
            customizeUnitCode:
              'SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_LINE,SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_FILTER',
          },
          data: {
            ...(data || {}),
            ...(params || {}),
            customizeUnitCode:
              'SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_LINE,SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_FILTER',
          },
        };
      },
    },
  };
};

export { tableDS };
