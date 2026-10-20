/*
 * @Description: 标的阶梯报价dataSet
 * @Date: 2022-08-17 15:25:01
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { getDynamicLabel, conversionUpdate } from '@/utils/util';

const organizationId = getCurrentOrganizationId();
const { tenantId } = getCurrentTenant();

// 阶梯价格
const ladderQuoteDS = (props) => {
  const {
    editable,
    pcSubjectId,
    priceEdit,
    ladderNetPriceEdit,
    itemCode,
    doubleUnitEnabled,
    quotePcSubject,
  } = props;
  return {
    paging: true,
    selection: editable && 'multiple',
    primaryKey: 'lineId',
    pageSize: 20,
    // table显示的字段
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get('spcm.common.model.common.orderSeq').d('序号'),
      },
      {
        name: 'secondaryQuantityStart',
        type: 'currency',
        label: intl.get('spcm.common.model.quantityStart').d('数量从（>=）'),
        required: !!doubleUnitEnabled,
        dynamicProps: {
          max: ({ record }) => record.get('secondaryQuantityEnd'),
        },
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
        name: 'secondaryQuantityEnd',
        type: 'currency',
        label: intl.get('spcm.common.model.quantityEnd').d('数量至（<）'),
        required: !!doubleUnitEnabled,
        dynamicProps: {
          min: ({ record }) => record.get('secondaryQuantityStart'),
        },
      },
      {
        name: 'quantityEnd',
        type: 'currency',
        label: getDynamicLabel(doubleUnitEnabled, 'ladderTo'),
        required: true,
        dynamicProps: {
          min: ({ record }) => record.get('quantityStart'),
        },
      },
      {
        name: 'secondaryPrice',
        type: 'number',
        label: intl.get('spcm.common.model.new.price').d('单价(含税)'),
        required: priceEdit && doubleUnitEnabled,
      },
      {
        name: 'price',
        type: 'number',
        label: getDynamicLabel(doubleUnitEnabled, 'validLadderPrice'),
        required: priceEdit && !doubleUnitEnabled,
      },
      {
        name: 'ladderSecondaryNetPrice',
        type: 'number',
        label: intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)'),
        required: ladderNetPriceEdit && doubleUnitEnabled,
      },
      {
        name: 'ladderNetPrice',
        type: 'number',
        label: getDynamicLabel(doubleUnitEnabled, 'validNetLadderPrice'),
        required: ladderNetPriceEdit && !doubleUnitEnabled,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spcm.common.model.description').d('备注'),
      },
      {
        name: 'stepAccumulationFlag',
        type: 'boolean',
        label: intl.get('spcm.common.model.ladderAccumulation').d('阶梯累计'),
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams = {} } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-subject/${pcSubjectId}/lines`,
          method: 'GET',
          data: { ...data, ...queryParams },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-subject/lines`,
          method: 'DELETE',
          data: data.map((d) => d.lineId),
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-subject/${pcSubjectId}/lines`,
          method: 'PATCH',
          data: data.map((d) => ({ ...d, pcSubjectId, tenantId })),
        };
      },
    },
    events: {
      update: ({ dataSet, record, name, value }) => {
        if (name === 'secondaryQuantityStart' && doubleUnitEnabled) {
          // 开启双单位 并且有 必备参数 换算出基本数量
          if (itemCode && value) {
            conversionUpdate({
              lovRecord: quotePcSubject,
              dataSet,
              record,
              value,
              field: 'quantityStart',
              secField: 'secondaryQuantityStart',
            });
          } else {
            record.set({ quantityStart: value });
          }
        }
        if (name === 'secondaryQuantityEnd' && doubleUnitEnabled) {
          // 有物料编码 并且开启双单位换算出基本数量
          if (itemCode && value) {
            conversionUpdate({
              lovRecord: quotePcSubject,
              dataSet,
              record,
              value,
              field: 'quantityEnd',
              secField: 'secondaryQuantityEnd',
            });
          } else {
            record.set({ quantityEnd: value });
          }
        }
      },
    },
  };
};

export default ladderQuoteDS;
