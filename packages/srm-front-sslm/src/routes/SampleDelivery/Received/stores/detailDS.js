import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const basicInfoDS = params => ({
  fields: [
    // 基本信息
    {
      name: 'reqNum',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'reqUserName',
      label: intl.get('sslm.sample.model.reqUserId').d('申请人'),
    },
    {
      name: 'reqStatus',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
      lookupCode: 'SSLM.PROCESS_STATUS',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
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
      name: 'companyName',
      label: intl.get('sslm.sample.model.company').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.sample.model.ou').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sslm.sample.model.organization').d('库存组织'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.supplier').d('供应商'),
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
      label: intl.get('sslm.sample.model.typeCode').d('送样类型'),
    },
    {
      name: 'urgencyDegreeMeaning',
      label: intl.get('sslm.sample.model.urgencyDegree').d('紧急程度'),
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
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
    {
      name: 'confirmRemark',
      label: intl.get('sslm.sample.model.confirm.instructions').d('确认说明'),
    },
    {
      name: 'receiveUnitName',
      label: intl.get('sslm.sample.model.receiveUnit').d('接收部门'),
    },
    {
      name: 'sampleAttachmentUuid',
      label: intl.get('sslm.sample.model.sample.sampleAttachment').d('相关附件'),
    },

    // 样品信息
    {
      name: 'sendUserName',
      label: intl.get('sslm.sample.model.sendUserName').d('送样人姓名'),
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
      name: 'sendTypeCode',
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
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
      name: 'supplierRemark',
      label: intl.get('sslm.sample.model.supplierRemark').d('供应商备注'),
    },
    {
      name: 'needFeedbackFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.needFeedback').d('需要供应商反馈'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { customizeUnitCode = '' } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/${params.detailReqId}`,
        method: 'get',
        data: {},
        params: {
          customizeUnitCode,
        },
      };
    },
  },
});

const listLineDS = params => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
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
      name: 'uomName',
      label: intl.get('sslm.sample.model.uomName').d('单位'),
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
      name: 'sendTypeCode',
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
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
      name: 'remark',
      label: intl.get('sslm.sample.model.sample.tryUseRemark').d('试用说明'),
    },
    {
      name: 'trialResultsUuid',
      label: intl.get('sslm.sample.model.sample.trialResultsAttachment').d('试用结果附件'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'buyerAttachmentUuid',
      label: intl.get('sslm.sample.model.buyerAttachmentUuid').d('采购方附件'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sslm.sample.model.attachmentUuid').d('供应商附件'),
    },
  ],
  transport: {
    read: ({ data, params: newParams }) => {
      const { customizeUnitCode = '' } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-infos/${params.detailReqId}/list`,
        method: 'get',
        data: {},
        params: {
          ...newParams,
          customizeUnitCode,
        },
      };
    },
  },
});

export { basicInfoDS, listLineDS };
