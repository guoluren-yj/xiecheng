import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const formDS = () => {
  return {
    autoQuery: false,
    name: 'headerDS',
    fields: [
      {
        name: 'rfxTitle',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`).d('询价单标题'),
      },
      {
        name: 'companyName',
        required: true,
        label: intl.get('ssrc.common.company').d('公司'),
        type: 'string',
      },
      {
        name: 'purOrganizationName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
        type: 'string',
      },
      {
        name: 'purchaserName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
      },
      {
        name: 'sourceCategoryMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        type: 'string',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
          .d('适用其他组织'),
        name: 'applicationScopeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'totalPrice',
        label: intl.get('ssrc.inquiryHall.model.whole.distributeTotalPrice').d('分配总金额'),
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`).d('允许多币种报价'),
        name: 'multiCurrencyFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get('ssrc.common.model.common.allowChangePayWayTextReadFlag')
          .d('允许供应商修改付款条款&方式'),
        name: 'paymentTermFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'checkRemark',
        type: 'string',
      },
      {
        name: 'checkAttachmentUuid',
        type: 'attachment',
        label: intl.get('hzero.common.title.checkAttach').d('查看附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        disabled: true,
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'sourceProjectNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
      },
    ],
  };
};

export { formDS };
