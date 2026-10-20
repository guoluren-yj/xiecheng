import React from 'react';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const SupplierQuotationTableDS = ({ sourceKey }) => {
  return {
    primaryKey: 'quotationLineId',
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
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
        name: 'validQuotationPrice',
      },
      {
        label: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        name: 'validNetPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'companyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrg`).d('采购组织'),
        name: 'organizationName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxRate',
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
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT`,
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
