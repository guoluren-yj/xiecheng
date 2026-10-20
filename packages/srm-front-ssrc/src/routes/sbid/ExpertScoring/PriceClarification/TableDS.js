import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import {
  getPriceName,
  getNetPriceName,
  getAvailableQtyName,
  getQtyName,
  getUomName,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';

// 上轮报价的气泡提示
const doubleUnitTooltip = ({ doubleUnitFlag, label, title }) => {
  return doubleUnitFlag ? <Tooltip title={title}>{label}</Tooltip> : label;
};

const SupplierQuotationTableDS = ({
  editTable = true,
  sourceKey,
  doubleUnitFlag = false,
  invalidFlag = null,
}) => {
  return {
    primaryKey: 'quotationLineId',
    autoQuery: false,
    cacheSelection: true,
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
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'validQuotationPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
        align: 'right',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotaionDetail').d('报价明细'),
        name: 'quotationDetail',
      },
      {
        label: doubleUnitTooltip({
          doubleUnitFlag,
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
          title: intl
            .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
            .d('辅助单位对应的上次报价'),
        }),
        name: 'lastQuotationPrice',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
        width: 100,
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
        width: 100,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'secondaryQuantity',
        width: 100,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: getQtyName(doubleUnitFlag),
        name: 'rfxQuantity',
        width: 100,
      },
      {
        label: getUomName(doubleUnitFlag),
        name: 'uomName',
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
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        name: 'priceClarifyIssueLineId',
        type: 'string',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        if (!dataSet) {
          return;
        }
        dataSet.forEach((record = {}) => {
          const { priceClarifyIssueLineId, supplierStatus } = record.get([
            'priceClarifyIssueLineId',
            'supplierStatus',
          ]);
          if (priceClarifyIssueLineId) {
            Object.assign(record, { isSelected: true });
          }
          const invalidSupplierFlag =
            (supplierStatus && supplierStatus === 'QUOTATION_INVALID') ||
            supplierStatus === 'REVIEW_SCORE_NO_APPROVED'; // 无效/符合性检查不通过
          if (
            !editTable ||
            record.get('eliminateFlag') * 1 ||
            record.get('priceClarifySelective') * 1 === 0 ||
            invalidFlag === 1 ||
            invalidSupplierFlag
          ) {
            Object.assign(record, { selectable: false });
          }
        });
      },
      select: ({ dataSet, record }) => {
        const unSelectList = dataSet.getState('unSelectList')?.toJSON() || [];
        const index = unSelectList.findIndex(
          (ele) => ele.quotationLineId === record.toData().quotationLineId
        );
        if (index > -1) {
          unSelectList.splice(index, 1);
          dataSet.setState('unSelectList', unSelectList);
        }
      },
      unSelect: ({ dataSet, record }) => {
        const unSelectList = dataSet.getState('unSelectList')?.toJSON() || [];
        const index = unSelectList.findIndex(
          (ele) => ele.quotationLineId === record.toData().quotationLineId
        );
        if (index === -1) {
          unSelectList.push(record.toData());
          dataSet.setState('unSelectList', unSelectList);
        }
      },
    },
    transport: {
      read: ({ data }) => {
        const { organizationId, quotationHeaderId, clarifyNotifyId } = data.commonProps || {};
        if (!quotationHeaderId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/supplier/${quotationHeaderId}/quotation-lines`,
          method: 'GET',
          data: {
            clarifyNotifyId,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_EDIT`,
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
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return `${getLadderFrom(doubleUnitFlag)}(>=)`;
          },
        },
      },
      {
        name: 'ladderTo',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
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
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'validNetLadderPrice',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
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
        const { organizationId, quotationLineId, customizeUnitCode } =
          dataSet.queryParameter.commonProps || {};
        if (!quotationLineId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
          method: 'GET',
          data: {
            customizeUnitCode,
          },
        };
      },
    },
  };
};

// 价格澄清列表ds
const PriceClarificationListDS = () => {
  return {
    primaryKey: 'clarifyNotifyId',
    autoQuery: false,
    selection: false,
    queryFields: [
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.clarificationNotifNum')
          .d('澄清通知编号'),
        name: 'clarifyNotifyNum',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.clarificationNotifTitle').d('标题'),
        name: 'clarifyNotifyTitle',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.responseStatus').d('回复状态'),
        name: 'clarifyNotifyStatus',
        type: 'string',
        lookupCode: 'SSRC.CLARIFY_NOTIFY_STATUS',
      },
    ],
    fields: [
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.clarificationNotifNum')
          .d('澄清通知编号'),
        name: 'clarifyNotifyNum',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.clarificationNotifTitle').d('标题'),
        name: 'clarifyNotifyTitle',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.responseStatus').d('回复状态'),
        name: 'clarifyNotifyStatusMeaning',
      },
      {
        label: intl.get('ssrc.common.company').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.common.supplier`).d('供应商'),
        name: 'suppliers',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.submittendTime').d('提交时间'),
        name: 'submittedDate',
        showType: 'dateTime',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.responseEndTimes').d('回复截至时间'),
        name: 'replyEndDate',
        showType: 'dateTime',
      },
      {
        label: intl.get('hzero.common.action').d('操作'),
        name: 'operations',
      },
      { name: 'repliedSupplierCount', type: 'number' },
      { name: 'supplierCount', type: 'number' },
      { name: 'clarifyNotifyStatus' },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const { organizationId, sourceHeaderId = null, sourceFrom } =
          dataSet.queryParameter.commonProps || {};
        if (!sourceHeaderId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/${sourceHeaderId}/list`,
          method: 'GET',
          data: { ...data, sourceFrom, clarifyNotifyType: 'PRICE' },
        };
      },
    },
  };
};

//  /v1/{organizationId}/clarify-notify/price/{clarifyNotifyId}/reply-detail/list
const SupplierReplyList = () => {
  return {
    primaryKey: 'supplierCompanyId',
    selection: false,
    fields: [
      {
        name: 'supplierCompanyCode',
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('ssrc.common.supplierName').d('供应商名称'),
      },
      {
        name: 'priceClarifyIssueLineStatusMeaning',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.responseStatus').d('回复状态'),
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const { organizationId, clarifyNotifyId = null, sourceFrom } =
          dataSet.queryParameter.commonProps || {};
        if (!clarifyNotifyId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/${clarifyNotifyId}/reply-detail/list`,
          method: 'GET',
          data: { ...data, sourceFrom },
        };
      },
    },
  };
};

export {
  SupplierQuotationTableDS,
  LadderLevelModalDS,
  PriceClarificationListDS,
  SupplierReplyList,
};
