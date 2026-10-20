import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const applyCustomizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_SEND.APPLY_SEARCH_BAR',
  'SSLM.SAMPLE_DELIVERY_SEND.APPLICATION_TABLE',
  'SSLM.SAMPLE_DELIVERY_SEND.BASIC_INFO',
];
const detailCustomizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_SEND.DETAIL_QUERY_TABLE',
  'SSLM.SAMPLE_DELIVERY_SEND.DETAIL_SEARCH_BAR',
  'SSLM.SAMPLE_DELIVERY_SEND.BASIC_INFO',
];

const listLineDS = () => ({
  autoLocateFirst: false,
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'action',
    },
    {
      name: 'reqNum',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.sample.model.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.sample.model.ouName').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sslm.sample.model.organizationName').d('库存组织'),
    },
    {
      name: 'supplierNum',
      type: 'object',
      label: intl.get('sslm.sample.model.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCodeMeaning',
      label: intl.get('sslm.sample.model.supplierTypeCodeMeaning').d('供应商类型'),
    },
    {
      name: 'originFactoryName',
      label: intl.get('sslm.sample.model.originFactoryName').d('原厂名称'),
    },
    {
      name: 'typeCodeMeaning',
      label: intl.get('sslm.sample.model.typeCodeMeaning').d('送样类型'),
    },
    {
      name: 'reqUserName',
      label: intl.get('sslm.sample.model.reqUserName').d('申请人'),
    },
    {
      name: 'reqInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'reqUserPhone',
      type: 'tel',
      regionField: 'reqInternationalTelCode',
      label: intl.get('sslm.sample.model.reqUserPhone').d('申请人联系电话'),
    },
    {
      name: 'recUserName',
      label: intl.get('sslm.sample.model.recUserName').d('接样人'),
    },
    {
      name: 'recInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'recUserPhone',
      type: 'tel',
      regionField: 'recInternationalTelCode',
      label: intl.get('sslm.sample.model.recUserPhone').d('接样人联系电话'),
    },
    {
      name: 'sampleSendAddress',
      label: intl.get('sslm.sample.model.sampleSendAddress').d('送样地址'),
    },
    {
      name: 'sendUserName',
      label: intl.get('sslm.sample.model.sample.sendUser').d('送样人'),
    },
    {
      name: 'sendInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'sendUserPhone',
      type: 'tel',
      regionField: 'sendInternationalTelCode',
      label: intl.get('sslm.sample.model.sendUserPhone').d('送样人联系电话'),
    },
    {
      name: 'sendTypeCodeMeaning',
      label: intl.get('sslm.sample.model.sendTypeCodeMeaning').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
    },
    {
      name: 'urgencyDegreeMeaning',
      label: intl.get('sslm.sample.model.urgencyDegreeMeaning').d('紧急程度'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.releaseDate').d('发布时间'),
    },
    {
      name: 'feedbackDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.feedbackDate').d('反馈时间'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
    {
      name: 'isPurchaseFlag',
      label: intl.get('sslm.sample.model.sampleInitiator').d('送样发起方'),
      lookupCode: 'SSLM.SAMPLE.IS_PURCHASE',
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/pageSampleSendReq/fetch/purchase`,
      method: 'GET',
      params: {
        ...params,
        customizeUnitCode: applyCustomizeUnitCode.join(),
      },
    }),
  },
});

const detailLineDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
    },
    {
      name: 'reqNum',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.sample.model.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.sample.model.ouName').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sslm.sample.model.organizationName').d('库存组织'),
    },
    {
      name: 'supplierNum',
      label: intl.get('sslm.sample.model.supplierId').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCodeMeaning',
      label: intl.get('sslm.sample.model.supplierTypeCodeMeaning').d('供应商类型'),
    },
    {
      name: 'originFactoryName',
      label: intl.get('sslm.sample.model.originFactoryName').d('原厂名称'),
    },
    {
      name: 'typeCodeMeaning',
      label: intl.get('sslm.sample.model.typeCodeMeaning').d('送样类型'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
    {
      name: 'lineNum',
      label: intl.get('sslm.sample.model.lineNum').d('行号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.sample.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.sample.model.itemName').d('物料名称'),
    },
    {
      name: 'itemDesc',
      label: intl.get('sslm.sample.model.itemDesc').d('物料说明'),
    },
    {
      name: 'uomCodeAndName',
      label: intl.get('sslm.sample.model.uomName').d('单位'),
      noCache: true,
    },
    {
      name: 'itemCategoryCode',
      type: 'object',
      textField: 'categoryCode',
      label: intl.get('sslm.sample.model.itemCategoryCode').d('品类代码'),
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
    },
    {
      name: 'itemCategoryName',
      type: 'object',
      label: intl.get('sslm.sample.model.itemCategoryName').d('品类名称'),
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
    },
    {
      name: 'reqQuantity',
      label: intl.get('sslm.sample.model.reqQuantity').d('送样需求数量'),
    },
    {
      name: 'reqTime',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.reqTime').d('送样需求时间'),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
    },
    {
      name: 'tryUseDepartment',
      label: intl.get('sslm.sample.model.tryUseDepartment').d('试用部门'),
    },
    {
      name: 'tryUseWorkshop',
      label: intl.get('sslm.sample.model.tryUseWorkshop').d('试用车间'),
    },
    {
      name: 'sampleResultMeaning',
      label: intl.get('sslm.sample.model.tryUseResults').d('试用结果'),
    },
    {
      name: 'sampleRemark',
      label: intl.get('sslm.sample.model.sample.tryUseRemark').d('试用说明'),
    },
    {
      name: 'trialResultsUuid',
      label: intl.get('sslm.sample.model.sample.trialResultsAttachment').d('试用结果附件'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.releaseDate').d('发布时间'),
    },
    {
      name: 'feedbackDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.feedbackDate').d('反馈时间'),
    },
    {
      name: 'buyerAttachmentUuid',
      label: intl.get('sslm.sample.model.buyerAttachmentUuid').d('采购方附件'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sslm.sample.model.attachmentUuid').d('供应商附件'),
    },
    {
      name: 'isPurchaseFlag',
      label: intl.get('sslm.sample.model.sampleInitiator').d('送样发起方'),
      lookupCode: 'SSLM.SAMPLE.IS_PURCHASE',
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
      lookupCode: 'SSLM.SAMPLE.IS_PURCHASE',
    },
    {
      name: 'sendTypeCodeMeaning',
      label: intl.get('sslm.sample.model.sendTypeCodeMeaning').d('送样方式'),
      lookupCode: 'SSLM.SAMPLE.IS_PURCHASE',
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/lines/pageSampleSendReq`,
      method: 'GET',
      params: {
        ...params,
        customizeUnitCode: detailCustomizeUnitCode.join(),
      },
    }),
  },
});
export { listLineDS, detailLineDS };
