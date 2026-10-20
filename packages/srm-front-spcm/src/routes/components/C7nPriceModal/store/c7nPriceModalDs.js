import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getDynamicLabel } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

const priceTableDS = (params) => ({
  selection: 'single',
  pageSize: 20,
  fields: [
    {
      name: 'taxPrice',
      label: intl.get(`spcm.common.model.common.inculdeTaxUnitPrice`).d('原币含税单价'),
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      label: intl.get(`spcm.common.model.common.unitPrice`).d('原币不含税单价'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'uomCodeName',
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
    },
    {
      name: 'taxCode',
      label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率'),
    },
    {
      name: 'ladderPrice',
      label: intl.get(`spcm.common.model.common.ladderPrice`).d('阶梯价格'),
    },
    {
      name: 'priceSource',
      label: intl.get(`spcm.common.model.common.sourceFrom`).d('价格来源'),
    },
    {
      name: 'orderNum',
      label: intl.get(`spcm.common.model.common.sourceFromNum`).d('价格来源单据号'),
    },
  ],
  // queryParameter: params,
  transport: {
    read: () => ({
      url: `${SRM_SPCM}/v1/${organizationId}/pc-subject/reference-price`,
      method: 'POST',
      data: params,
    }),
  },
});
const doubleUnitEnabled = '0';
const ladderPriceDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('spcm.common.model.common.orderSeq').d('序号'),
    },
    {
      name: 'quantityStart',
      type: 'currency',
      label: getDynamicLabel(doubleUnitEnabled, 'ladderFrom'),
      required: true,
      dynamicProps: {
        max: ({ record }) => record.get('quantityEnd'),
      },
    },
    {
      name: 'quantityEnd',
      type: 'currency',
      label: getDynamicLabel(doubleUnitEnabled, 'ladderTo'),
      dynamicProps: {
        min: ({ record }) => record.get('quantityStart'),
      },
    },
    {
      name: 'price',
      type: 'number',
      label: getDynamicLabel(doubleUnitEnabled, 'validLadderPrice'),
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      label: getDynamicLabel(doubleUnitEnabled, 'validNetLadderPrice'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('spcm.common.model.description').d('备注'),
    },
    {
      name: 'stepAccumulationFlag',
      type: 'boolean',
      label: intl.get('spcm.common.model.ladderAccumulation').d('是否阶梯累计'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/pc-subject/price-lib-ladders`,
        method: 'GET',
      };
    },
  },
});

export { priceTableDS, ladderPriceDS };
