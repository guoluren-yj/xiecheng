import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Prefix } from '@/utils/globalVariable';
import {
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  getUomName,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';

// 上轮报价的气泡提示
const doubleUnitTooltip = ({ doubleUnitFlag, label, title }) => {
  return doubleUnitFlag ? <Tooltip title={title}>{label}</Tooltip> : label;
};

const basicFormDS = ({ organizationId, clarifyNotifyId, sourceFrom = 'RFX' }) => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'sourceNumTitle',
        type: 'string',
      },
      {
        name: 'sourceTitle',
        type: 'string',
        label: intl.get(`ssrc.common.title`).d('标题'),
      },
      {
        name: 'clarifyNotifyTypeMeaning',
        type: 'string',
        // label: intl.get(`ssrc.inquiryHall.view.inquiryHall.sourceCategoryMeaning`).d('寻源类别'),
      },
      {
        name: 'submittedByName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdBy`).d('创建人'),
      },
      {
        name: 'clarifyNotifyNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyIssueNum`).d('澄清通知编号'),
      },
      {
        name: 'clarifyNotifyTitle',
        type: 'string',
        label: intl.get(`ssrc.common.title`).d('标题'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'sourceNum',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
      },
      {
        name: 'replyEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.replyEndDate`).d('回复截止时间'),
        showType: 'dateTime',
      },
      {
        name: 'submittedDate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitDate`).d('提交时间'),
        showType: 'dateTime',
      },
      {
        name: 'replyRequirement',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarificationRequests`).d('澄清要求'),
      },
      {
        name: 'initiationReason',
        type: 'string',
        label: intl.get(`ssrc.common.view.message.startDescription`).d('发起原因'),
      },
      {
        name: 'initiationAndAllSupplierCount',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.initiationAndAllSupplierCount`)
          .d('本次发起供应商数/总供应商数'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { customizeUnitCode, templateInfo = {} } = data.commonProps || {};
        return {
          url: `${Prefix}/${organizationId}/clarify-notify/${clarifyNotifyId}`,
          method: 'GET',
          data: {
            ...templateInfo,
            sourceFrom,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

const SupplierQuotationTableDS = ({ clarifyNotifyId, organizationId, quotationName }) => {
  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'quotationLineId',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'categoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.model`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
        type: 'number',
      },
      {
        name: 'validQuotationQuantity',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'rfxQuantity',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'newNetSecPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        name: 'validQuotationPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'validNetPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotaionDetail').d('报价明细'),
        name: 'quotationDetail',
      },
      {
        name: 'lastNetPrice',
        type: 'number',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
      },
      {
        name: 'lastNetSecPrice',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        name: 'lastQuotationPrice',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        name: 'lastQuotationSecPrice',
        type: 'number',
        max: '99999999999999999999',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationStartDate').d('报价有效期从'),
        name: 'validExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationEndDate').d('报价有效期至'),
        name: 'validExpiryDateTo',
        type: 'date',
      },
      {
        label: intl.get('ssrc.common.currentPromisedDate').d('承诺交货期'),
        name: 'validPromisedDate',
        type: 'date',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        name: 'validQuotationRemark',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount').d('最小购买量'),
        name: 'minPurchaseQuantity',
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount').d('最小包装量'),
        name: 'minPackageQuantity',
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.includingFreight').d('是否含运费'),
        name: 'freightIncludedFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        name: 'freightAmount',
        type: 'number',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment')
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { quotationHeaderId, customizeUnitCode, templateInfo = {} } = data.commonProps || {};
        if (!quotationHeaderId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/price-details/${quotationHeaderId}/quotation-lines`,
          method: 'GET',
          data: {
            ...templateInfo,
            clarifyNotifyId,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

const LadderLevelModalDS = () => {
  return {
    primaryKey: 'rfxLadderLineNum',
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLadderLineNum',
      },
      {
        label: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}</span>,
        name: 'secondaryLadderFrom',
      },
      {
        label: (
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        name: 'secondaryLadderTo',
      },
      {
        name: 'ladderFrom',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return `${getLadderFrom(doubleUnitFlag)}(>=)`;
          },
        },
      },
      {
        name: 'ladderTo',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return `${getLadderTo(doubleUnitFlag)}(<)`;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
        name: 'validLadderSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetLadderSecPrice',
      },
      {
        name: 'validLadderPrice',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'validNetLadderPrice',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { organizationId, quotationLineId, customizeUnitCode, templateInfo = {} } =
          dataSet.queryParameter.commonProps || {};
        if (!quotationLineId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
          method: 'GET',
          data: {
            ...templateInfo,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

export { basicFormDS, SupplierQuotationTableDS, LadderLevelModalDS };
