import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const listLineDS = (
  documentTypeName = intl.get('ssrc.common.view.message.rfx').d('询价单'),
  bidFlag = false
) => ({
  selection: 'single',
  primaryKey: 'rfxHeaderId',
  pageSize: 5,
  // table表单显示的字段
  fields: [
    {
      name: 'rfxStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'rfxNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
    },
    {
      name: 'rfxTitle',
      type: 'string',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, { documentTypeName })
        .d('{documentTypeName}标题'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'preQualificationFlag',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.preQualification`).d('资格预审'),
    },
    {
      name: 'expertScoreFlag',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertEvaluation`).d('专家评分'),
    },
    {
      name: 'templateName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
    },
    {
      name: 'quotationTypeMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
    },
    {
      name: 'sealedQuotationFlag',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
    },
    {
      name: 'createdUnitName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
    },
  ],

  // 查询表单字段
  queryFields: [
    {
      name: 'rfxNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
    },
    {
      name: 'rfxTitle',
      type: 'string',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, { documentTypeName })
        .d('{documentTypeName}标题'),
    },
    {
      name: 'rfxStatus',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: bidFlag ? 'SSRC.NEW_BID_STATUS' : 'SSRC.RFX_STATUS',
      defaultValue: 'FINISHED',
    },
    !bidFlag
      ? {
          name: 'sourceCategory',
          type: 'string',
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
          lookupCode: 'SSRC.SOURCE_CATEGORY',
        }
      : null,
    {
      name: 'quotationType',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
      lookupCode: 'SSRC.QUOTATION_TYPE',
    },
    {
      name: 'sourceMethod',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
      lookupCode: 'SSRC.SOURCE_METHOD',
    },
    {
      name: 'purOrganizationId',
      type: 'object',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrg`).d('采购组织'),
      lovCode: 'SPFM.USER_AUTH.PURORG',
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value && value.purOrganizationId,
    },
    {
      name: 'createdUnitName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
    },
    {
      name: 'auctionDirection',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`).d('报价方向'),
      lookupCode: 'SSRC.SOURCE_AUCTION_DIRECTION',
    },
    {
      name: 'currencyCode',
      type: 'object',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
    },
    {
      name: 'sealedQuotationFlag',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'prNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
    },
  ].filter(Boolean),
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/list/all/history`,
        method: 'GET',
        data: {
          ...data,
          secondarySourceCategory: bidFlag ? 'NEW_BID' : '',
        },
      };
    },
  },
});

export { listLineDS };
