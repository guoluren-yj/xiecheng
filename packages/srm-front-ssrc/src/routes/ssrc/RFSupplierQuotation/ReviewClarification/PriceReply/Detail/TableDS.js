import React from 'react';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

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
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'newQuotationPrice',
        // type: 'number',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'netPrice',
        // type: 'number',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
        name: 'lastQuotationPrice',
        // type: 'number',
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
        lovCode: 'SMDM.TAX_ANOTHER',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        name: 'currentQuotationQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'rfxQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'currentDeliveryCycle',
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
        name: 'ladderFrom',
      },
      {
        label: (
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        name: 'ladderTo',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { organizationId, sourceQuotationLineId } = dataSet.queryParameter.commonProps || {};
        if (!sourceQuotationLineId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/supplier/${sourceQuotationLineId}/ladder-quotation`,
          method: 'GET',
        };
      },
    },
  };
};

export { SupplierQuotationTableDS, LadderLevelModalDS };
