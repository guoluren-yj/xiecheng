import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';
import { getPriceName, getNetPriceName, getLadderFrom, getLadderTo } from '@/utils/utils';
import { math } from 'choerodon-ui/dataset';

const organizationId = getCurrentOrganizationId();

const ladderQuotationTableDS = ({ lineRecord, isUnTaxPriceFlag }) => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'rfxLadderLineNum',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.rfLadderLineNum').d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      label: intl.get('ssrc.rf.model.rf.ladderFromRange').d('数量从（>=）'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      label: intl.get('ssrc.rf.model.rf.ladderToRange').d('数量至(<)'),
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
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED' || isUnTaxPriceFlag;
        },
        required({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            doubleUnitFlag && record.get('quotationLineStatus') !== 'ABANDONED' && !isUnTaxPriceFlag
          );
        },
      },
    },
    {
      name: 'currentNetLadderSecPrice',
      type: 'currency',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED' || !isUnTaxPriceFlag;
        },
        required({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            doubleUnitFlag && record.get('quotationLineStatus') !== 'ABANDONED' && isUnTaxPriceFlag
          );
        },
      },
    },
    {
      name: 'currentLadderPrice',
      type: 'currency',
      label: intl.get(`ssrc.common.model.supQuo.basicUnitPriceTax`).d('基本单价(含税)'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED' || isUnTaxPriceFlag;
        },
        required({ record }) {
          return record.get('quotationLineStatus') !== 'ABANDONED' && !isUnTaxPriceFlag;
        },
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
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED' || !isUnTaxPriceFlag;
        },
        required({ record }) {
          return record.get('quotationLineStatus') !== 'ABANDONED' && isUnTaxPriceFlag;
        },
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
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.cumulative').d('是否累计阶梯'),
    },
    {
      name: 'currentBargainPrice',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价'),
      dynamicProps: {
        disabled() {
          return !['SUBMITTED', 'REPLIED'].includes(lineRecord.get('quotationLineStatus'));
        },
      },
    },
    {
      name: 'currentBargainRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
      dynamicProps: {
        disabled() {
          return !['SUBMITTED', 'REPLIED'].includes(lineRecord.get('quotationLineStatus'));
        },
      },
    },
    {
      name: 'validBargainPrice',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价'),
    },
    {
      name: 'validBargainRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
    },
  ],
  events: {
    update: ({ dataSet, name, record, value }) => {
      const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
      const taxRate = lineRecord.get('taxRate');
      const rate = math.plus(1, math.div(taxRate, 100) || 0);
      if (name === 'currentNetLadderPrice') {
        if ((value || value === 0) && isUnTaxPriceFlag) {
          record.set('currentLadderPrice', math.toFixed(math.multipliedBy(value, rate), 10));
        }
      } else if (name === 'currentLadderPrice') {
        if ((value || value === 0) && !isUnTaxPriceFlag) {
          record.set('currentNetLadderPrice', math.toFixed(math.div(value, rate), 10));
        }
      }
      if (doubleUnitFlag) {
        if (name === 'currentNetLadderSecPrice') {
          if ((value || value === 0) && isUnTaxPriceFlag) {
            record.set('currentLadderSecPrice', math.toFixed(math.multipliedBy(value, rate), 10));
          }
        } else if (name === 'currentLadderSecPrice') {
          if ((value || value === 0) && !isUnTaxPriceFlag) {
            record.set('currentNetLadderSecPrice', math.toFixed(math.div(value, rate), 10));
          }
        }
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/rfx/${lineRecord.get(
          'quotationLineId'
        )}/ladder-inquiry/bargain`,
        method: 'GET',
      };
    },
  },
});

export { ladderQuotationTableDS };
