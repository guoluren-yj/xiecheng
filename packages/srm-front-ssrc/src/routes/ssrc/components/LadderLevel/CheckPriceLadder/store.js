import React from 'react';
import { getLadderFrom, getLadderTo, getNetPriceName, getPriceName } from '@/utils/utils';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const headerDataSet = () => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
    ],
  };
};

/**
 * 阶梯报价DS
 * @returns Json
 */
const ladderQuotationTableDS = ({ doubleUnitFlag }) => ({
  primaryKey: 'rfxLadderLineNum',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'rfxLadderLineNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      label: (
        <span>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
          {`(<)`}
        </span>
      ),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      label: (
        <span>
          {getLadderFrom(doubleUnitFlag)}
          {`(>=)`}
        </span>
      ),
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      label: (
        <span>
          {getLadderTo(doubleUnitFlag)}
          {`(<)`}
        </span>
      ),
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
      label: getPriceName(doubleUnitFlag),
      name: 'validLadderPrice',
    },
    {
      label: getNetPriceName(doubleUnitFlag),
      name: 'validNetLadderPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
      name: 'validBargainPrice',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commons = {} },
      } = dataSet;
      const { quotationLineId, organizationId, ...others } = commons || {};
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
        method: 'GET',
        data: others,
      };
    },
  },
});

export { ladderQuotationTableDS, headerDataSet };
