import React from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';

import { Prefix } from '@/utils/globalVariable';

const ItemLineTableDS = (config) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.lineNo.').d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.businessUnit').d('业务实体'),
        name: 'ouName',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.invOrganizationName').d('库存组织'),
        name: 'invOrganizationName',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.itemCode').d('物料编码'),
        name: 'itemCode',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.itemName').d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        name: 'floatToType',
        label: (
          <Tooltip
            title={intl
              .get('ssrc.inquiryHall.view.message.floatingMoneyDetail')
              .d('浮动方式：最小价格幅度的计算按照金额或者比率！')}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.floatingWay').d('浮动方式')}
          </Tooltip>
        ),
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.floatingWay').d('浮动方式'),
        name: 'floatType',
        type: 'string',
        // lookupCode: 'SSRC.FLOAT_TYPE',
        disabled: true,
        computedProps: {
          lookupCode({ dataSet }) {
            const { judgeNewBiddingFlag } = config || {};
            // 竞价大厅标识
            if (isFunction(judgeNewBiddingFlag)) {
              const newBiddingFlag = judgeNewBiddingFlag({ dataSet });
              return newBiddingFlag ? 'SSRC.BIDDING_FLOAT_TYPE' : 'SSRC.FLOAT_TYPE';
            }
          },
          defaultValue({ dataSet }) {
            const { judgeNewBiddingFlag } = config || {};
            // 竞价大厅标识
            if (isFunction(judgeNewBiddingFlag)) {
              const newBiddingFlag = judgeNewBiddingFlag({ dataSet });
              return newBiddingFlag ? 'money' : '';
            }
          },
        },
      },
      {
        label: (
          <Tooltip
            title={intl
              .get('ssrc.inquiryHall.view.message.floatingRatioDetail')
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.quotationRange').d('报价幅度')}
          </Tooltip>
        ),
        name: 'quotationRange',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          disabled({ record }) {
            const { judgeNewBiddingFlag } = config || {};
            if (isFunction(judgeNewBiddingFlag)) {
              const newBiddingFlag = judgeNewBiddingFlag();
              return newBiddingFlag;
            }
            return !record.get('floatType');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        name: 'biddingQuotationRange',
        type: 'string',
        disabled: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
        disabled: true,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { queryParams = {} },
        } = dataSet;
        const { organizationId, adjustRecordId } = queryParams;
        if (!adjustRecordId || adjustRecordId === 'null') {
          return;
        }
        let url;
        if (config.currentMode === 'history') {
          url = `${Prefix}/${organizationId}/rfx/item/adjust/before-query`;
        } else {
          url = `${Prefix}/${organizationId}/rfx/item/adjust/after-query`;
        }
        return {
          url,
          method: 'GET',
          data: queryParams,
        };
      },
    },
  };
};

export default ItemLineTableDS;
