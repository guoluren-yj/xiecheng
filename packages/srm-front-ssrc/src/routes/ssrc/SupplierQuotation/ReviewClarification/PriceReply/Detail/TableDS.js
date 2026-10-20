import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';

// 上轮有效报价的气泡提示
const doubleUnitTooltip = ({ doubleUnitFlag, label, title }) => {
  return doubleUnitFlag ? <Tooltip title={title}>{label}</Tooltip> : label;
};

const SupplierQuotationTableDS = ({ sourceKey }) => {
  return {
    primaryKey: 'quotationLineId',
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`hzero.common.status`).d('状态'),
        name: 'priceClarifyIssueLineStatusMeaning',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.model`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'newQuotationSecPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'newNetSecPrice',
      },
      {
        name: 'newQuotationPrice',
        // type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'netPrice',
        // type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get('ssrc.supplierQuotation.model.supQuo.quotationDetails').d('报价明细'),
        name: 'quotationDetail',
      },
      {
        // label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
        name: 'lastQuotationPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
        // type: 'number',
      },
      {
        name: 'lastQuotationSecPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
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
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        disabled: true,
        // dynamicProps: {
        //   disabled({ record }) {
        //     return !record.get('taxIncludedFlag') || !record.get('taxChangeFlag');
        //   },
        // },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxRate',
        type: 'object',
        lovCode: 'SMDM.TAX',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'currentQuotationQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'rfxQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'deliveryCycle',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        name: 'taxChangeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { organizationId, clarifyNotifyId, supplierCompanyId, supplierTenantId } =
          data.commonProps || {};
        if (!clarifyNotifyId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/supplier-reply/${clarifyNotifyId}/price-clarify-line/list`,
          method: 'GET',
          data: {
            supplierCompanyId,
            supplierTenantId,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_DETAIL`,
          },
        };
      },
    },
  };
};

const LadderLevelModalDS = () => {
  return {
    primaryKey: 'ladderInquiryId',
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
            return `${getLadderFrom(doubleUnitFlag)} (>=)`;
          },
        },
      },
      {
        name: 'ladderTo',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return `${getLadderTo(doubleUnitFlag)} (<)`;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxPrice`).d('单价(含税)'),
        name: 'currentLadderSecPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'currentNetLadderSecPrice',
        type: 'number',
      },
      {
        name: 'currentLadderPrice',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'currentNetLadderPrice',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.isCumulativeFlag`).d('是否累计阶梯'),
        name: 'cumulativeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { organizationId, sourceQuotationLineId, ...others } =
          dataSet.queryParameter?.commonProps || {};
        if (!sourceQuotationLineId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/supplier/${sourceQuotationLineId}/ladder-quotation`,
          method: 'GET',
          data: {
            ...others,
          },
        };
      },
    },
  };
};

export { SupplierQuotationTableDS, LadderLevelModalDS };
