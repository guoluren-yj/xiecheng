import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getPriceName, getNetPriceName } from '@/utils/utils';

const quotationHistoryTableDS = (options = {}) => {
  const { quotationName, doubleUnitFlag = false } = options;

  return {
    autoQuery: false,
    primaryKey: 'recordId',
    cacheSelection: true,
    selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl
          .get('ssrc.common.currentVariableStage', { quotationName })
          .d('{quotationName}阶段'),
        name: 'quotationNode',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        name: 'quotationRoundNumber',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
        name: 'roundRank',
      },
      {
        label: intl
          .get(`ssrc.common.quotationOrBidTime`, { quotationName })
          .d('{quotationName}时间'),
        name: 'quotedDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, { quotationName })
          .d('{quotationName}人'),
        name: 'quotedByName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        name: 'totalAmount',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxQuotationAmount`)
          .d('行金额(不含税)'),
        name: 'netAmount',
      },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationQuantity`).d('数量'),
      //   name: 'quotationQuantity',
      // },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.taxPrice`).d('单价(含税)'),
        name: 'quotationSecondaryPrice',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supplierBidQuery.noTaxPrice`)
          .d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'quotationPrice',
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
        name: 'bargainPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
        name: 'bargainRemark',
      },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainer`).d('还价人'),
      //   name: 'bargainName',
      // },
    ],
    transport: {
      read: ({ data }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId } = commonProps || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/items/quotation/lines/record`,
          method: 'GET',
          data: { ...commonProps, ...others },
        };
      },
    },
  };
};

export { quotationHistoryTableDS };
