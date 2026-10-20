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

const basicFormDS = ({ organizationId, rfxHeaderSnapId }) => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'rfxNumTitle',
        type: 'string',
      },
      {
        name: 'rfxTitle',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceTitle`).d('寻源标题'),
      },
      {
        name: 'rfxNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
      },
      {
        name: 'quotationRoundNumber',
        label: intl.get(`ssrc.inquiryHall.bargain.roundNumber`).d('轮次'),
      },
      {
        name: 'bargainTimes',
        type: 'dateTime',
      },
      {
        name: 'quotationRounds',
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'initiationAndAllSupplierCount',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.initiationAndAllSupplierCount`)
          .d('本次发起供应商数/总供应商数'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间'),
        name: 'bargainEndDate',
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.bargain.reasonToBargain`).d('议价理由'),
        name: 'bargainRemark',
      },
      {
        name: 'createdByName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdBy`).d('创建人'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { customizeUnitCode, templateInfo = {} } = data.commonProps || {};
        return {
          url: `${Prefix}/${organizationId}/rfx/snap/simple/${rfxHeaderSnapId}`,
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

const SupplierQuotationTableDS = ({ organizationId, quotationName }) => {
  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'quotationLineId',
    fields: [
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName,
          })
          .d('{quotationName}状态'),
        name: 'quotationLineStatusMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNum`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.categoryName`).d('物料分类'),
        name: 'itemCategoryName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        name: 'validQuotationPrice',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
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
        name: 'preQuotationPrice',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        name: 'currentBargainPrice',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
                .d('辅助单位对应的还价单价'),
            });
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentBargainRemark`).d('还价理由'),
        name: 'currentBargainRemark',
      },
      {
        name: 'validBargainPrice',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl
                .get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`)
                .d('有效还价单价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary`)
                .d('辅助单位对应的有效还价单价'),
            });
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        name: 'validBargainRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotaionDetail').d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl.get('ssrc.common.company').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.inventoryOrg`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment')
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        readOnly: true,
      },
    ],
    transport: {
      read: ({ data }) => {
        const {
          rfxLineSupplierId,
          rfxHeaderId,
          rfxHeaderSnapId,
          customizeUnitCode,
          templateInfo = {},
        } = data.commonProps || {};
        if (!rfxLineSupplierId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/snap/bargain`,
          method: 'GET',
          data: {
            ...templateInfo,
            rfxHeaderId,
            rfxHeaderSnapId,
            customizeUnitCode,
            rfxLineSupplierId,
            isBargainApprovalFlag: 1,
          },
        };
      },
    },
  };
};

const LadderLevelModalDS = ({ lineRecord, organizationId }) => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'rfxLadderLineNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNum`).d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}（>=)`,
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}(<)`,
    },
    {
      name: 'ladderFrom',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderFrom(doubleUnitFlag)}(>=)`;
        },
      },
    },
    {
      name: 'ladderTo',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderTo(doubleUnitFlag)} (<)`;
        },
      },
    },
    {
      name: 'currentLadderSecPrice',
      type: 'currency',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
    },
    {
      name: 'currentNetLadderSecPrice',
      type: 'currency',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'currentLadderPrice',
      type: 'currency',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getPriceName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'currentNetLadderPrice',
      type: 'currency',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getNetPriceName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'validLadderPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getPriceName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'validNetLadderPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getNetPriceName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
      name: 'validLadderSecPrice',
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
      name: 'validNetLadderSecPrice',
    },
    {
      name: 'cumulativeFlag',
      label: intl.get('ssrc.priceLibraryNew.model.library.cumulative').d('是否累计阶梯'),
    },
    {
      name: 'currentBargainPrice',
      type: 'string',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return doubleUnitTooltip({
            doubleUnitFlag,
            label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价'),
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
              .d('辅助单位对应的还价单价'),
          });
        },
      },
    },
    {
      name: 'currentBargainRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
    },
    {
      name: 'validBargainPrice',
      type: 'string',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return doubleUnitTooltip({
            doubleUnitFlag,
            label: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`)
              .d('有效还价单价'),
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary`)
              .d('辅助单位对应的有效还价单价'),
          });
        },
      },
    },
    {
      name: 'validBargainRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { customizeUnitCode, templateInfo = {} } = data.commonProps || {};
      return {
        url: `${Prefix}/${organizationId}/rfx/${lineRecord.get(
          'quotationLineId'
        )}/ladder-inquiry/bargain`,
        method: 'GET',
        data: {
          ...templateInfo,
          customizeUnitCode,
        },
      };
    },
  },
});

export { basicFormDS, SupplierQuotationTableDS, LadderLevelModalDS };
