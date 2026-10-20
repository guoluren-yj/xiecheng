import React from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
// import { isNil } from 'lodash';

import { Prefix } from '@/utils/globalVariable';

const ItemLineTableDS = () => {
  /**
   * 是否是竞价大厅标识
   * @param { object } record
   * @param { object } dataSet
   */
  const isNewBiddingFlag = ({ dataSet }) => {
    const biddingHallFlag = dataSet.getQueryParameter('biddingHallFlag');
    const rfxHeaderBaseInfoDTO = dataSet.getQueryParameter('rfxHeaderBaseInfoDTO');
    const { secondarySourceCategory, biddingFlag } = rfxHeaderBaseInfoDTO || {};
    // 竞价大厅-竞价单标识
    const newBiddingFlag =
      !!biddingHallFlag && secondarySourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    return newBiddingFlag;
  };

  /**
   * 是否可编辑
   */
  const isDisabled = ({ dataSet }) => {
    const rfxHeaderBaseInfoDTO = dataSet.getQueryParameter('rfxHeaderBaseInfoDTO');
    const { biddingStatus } = rfxHeaderBaseInfoDTO || {};
    return biddingStatus === 'BIDDING_END';
  };

  return {
    autoQuery: false,
    dataToJSON: 'all',
    selection: false,
    pageSize: 20,
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
        computedProps: {
          lookupCode({ dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ dataSet });
            return newBiddingFlag ? 'SSRC.BIDDING_FLOAT_TYPE' : 'SSRC.FLOAT_TYPE';
          },
          defaultValue({ dataSet }) {
            const newBiddingFlag = isNewBiddingFlag({ dataSet });
            return newBiddingFlag ? 'money' : '';
          },
          disabled({ dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ dataSet });
            if (newBiddingFlag) {
              // 新竞价
              const disable = isDisabled({ dataSet });
              return disable;
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
        // validator: (value) => {
        //   const pattern = /^0{1}(\.\d*)|(^[1-9][0-9]*)+(\.\d*)?$/;
        //   if (!isNil(value) && !pattern.test(value)) {
        //     return intl.get(`ssrc.inquiryHall.model.inquiryHall.tip.notNegative`).d('请输入非负数');
        //   }
        //   return true;
        // },
        dynamicProps: {
          disabled({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ dataSet });
            if (newBiddingFlag) {
              // 新竞价
              const disable = isDisabled({ dataSet });
              return disable;
            }
            // 原有逻辑
            return !record.get('floatType');
          },
          precision({ record }) {
            const floatType = record.get('floatType');
            if (floatType === 'ratio') {
              return 2;
            }
          },
        },
      },
      {
        label: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}
          </Tooltip>
        ),
        name: 'biddingQuotationRange',
        type: 'string',
        dynamicProps: {
          disabled({ record }) {
            if (record?.get('itemNoEditFlag')) {
              // 次序时物料时间已过 itemNoEditFlag 为1不可编辑
              return true;
            }
            return false;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          disabled({ dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ dataSet });
            if (newBiddingFlag) {
              // 新竞价
              const disable = isDisabled({ dataSet });
              return disable;
            }
          },
        },
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

        return {
          url: `${Prefix}/${organizationId}/rfx/item/adjust/details`,
          method: 'GET',
          data: queryParams,
        };
      },
      submit: ({ data, dataSet }) => {
        const {
          queryParameter: { queryParams = {} },
        } = dataSet;
        const { organizationId } = queryParams;
        return {
          url: `${Prefix}/${organizationId}/rfx/item/adjust/save`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

export default ItemLineTableDS;
