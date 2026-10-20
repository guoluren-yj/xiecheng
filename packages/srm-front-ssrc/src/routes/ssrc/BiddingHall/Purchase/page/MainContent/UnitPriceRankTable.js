import React, { useMemo, useCallback, useEffect } from 'react';
import intl from 'utils/intl';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import { numberSeparatorRender } from '@/utils/renderer';
import OverlappingSupplier from '@/routes/ssrc/InquiryHall/Detail/OverlappingSupplier';
import NoOverlappingSupplier from '@/routes/ssrc/InquiryHall/Detail/NoOverlappingSupplier';

import { TrafficLight } from "@/routes/ssrc/BiddingHall/components";
import { deleteSupplierNewPrice } from '../../api';
import { unitPriceRankTableDS } from '../../stores/unitPriceDS';
import { getBenchmarkPriceTypeField } from '../../../utils/utils';

const UnitPriceRankTable = (props = {}) => {
  const {
    record: itemRecord,
    commonProps,
    header,
    initPage,
    toggleLoading,
    bidCountDataSet,
    itemLineListDS,
    biddingRuleDataSet,
    headerInfoDS,
    rankTableRemote,
    useNewRateFlag = 0,
    rfxHeaderId,
  } = props || {};
  const {
    biddingStatus,
    benchmarkPriceType, // 基准价
    sealedQuotationFlag, // 是否是密封报价
    biddingQuotationMethod, // 竞价或者拍卖
    biddingType,
    trialBiddingFlag,
    biddingAnonymousQuotesFlag, // 是否匿名报价
    allowDeleteLatestQuotation, // 允许操作删除最新报价
    isBritishBidTrafficLight,
  } = header || {};

  if (!itemRecord) return;
  const { rfxLineItemId, biddingItemStatus } =
    itemRecord.get(['rfxLineItemId', 'biddingItemStatus']) || {};

  const { rankRule } = biddingRuleDataSet?.current?.get(['rankRule']) || {};

  const tableDS = useMemo(() => new DataSet(unitPriceRankTableDS()), []);

  // 提交参数
  const submitProps = useMemo(() => {
    return {
      ...commonProps,
      rankRule,
      rfxLineItemId,
      biddingItemStatus,
      biddingQuotationMethod,
      biddingType,
      trialBiddingFlag,
      biddingAnonymousQuotesFlag,
      biddingStatus,
      sealedQuotationFlag,
      benchmarkPriceType,
    };
  }, [
    commonProps,
    rankRule,
    rfxLineItemId,
    biddingItemStatus,
    biddingQuotationMethod,
    biddingType,
    trialBiddingFlag,
    biddingAnonymousQuotesFlag,
    biddingStatus,
    sealedQuotationFlag,
    benchmarkPriceType,
  ]);

  useEffect(() => {
    tableDS.setQueryParameter('submitProps', submitProps);
    tableDS.query();
    return () => {};
  }, [submitProps, itemRecord, tableDS]);

  // 删除最新报价
  const handleDeleteNewPrice = useCallback(
    (record) => {
      const {
        biddingSupLineCurId,
        biddingSupLineId,
        biddingSupHeaderId,
        rfxLineSupplierId,
        displaySupplierName,
      } =
        record.get([
          'biddingSupLineCurId',
          'biddingSupLineId',
          'biddingSupHeaderId',
          'rfxLineSupplierId',
          'displaySupplierName',
        ]) || {};
      const { confirm } = Modal;
      confirm({
        key: rfxLineSupplierId,
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('ssrc.biddingHall.view.title.isDeleteNewPrice', {
            supplierCompanyName: displaySupplierName,
          })
          .d('是否确认删除{supplierCompanyName}的最新报价？'),
        okProps: {
          wait: 2000,
          waitType: 'throttle',
        },
        onOk() {
          toggleLoading(true);
          return new Promise((resolve, reject) => {
            deleteSupplierNewPrice({
              ...commonProps,
              biddingSupLineCurId,
              biddingSupLineId,
              rfxLineItemId,
              biddingSupHeaderId,
              rfxLineSupplierId,
              biddingStatus,
              biddingItemStatus,
              trialBiddingFlag,
            })
              .then((res) => {
                if (getResponse(res)) {
                  tableDS.query();
                  // eslint-disable-next-line no-unused-expressions
                  itemLineListDS?.query(itemLineListDS?.currentPage);
                  // eslint-disable-next-line no-unused-expressions
                  bidCountDataSet?.query();
                  toggleLoading(false);
                }
                resolve();
                toggleLoading(false);
              })
              .catch(() => {
                toggleLoading(false);
                reject();
              });
          });
        },
        onCancel() {
          toggleLoading(false);
        },
        onClose() {
          toggleLoading(false);
        },
      });
    },
    [
      commonProps,
      initPage,
      biddingStatus,
      rfxLineItemId,
      itemRecord,
      tableDS,
      itemLineListDS,
      bidCountDataSet,
      trialBiddingFlag,
    ]
  );

  const handleOpenIPCoincide = (val, record) => {
    const Props = {
      sourceHeaderId: rfxHeaderId,
      whetherIpCoincide: val,
      rfxLineSupplierId: record.get('rfxLineSupplierId'),
      quotationHeaderId: record.get('quotationHeaderId'),
    };
    Modal.open({
      key: 'ssrc-ip-coincide',
      title: intl.get('ssrc.common.model.common.IPDetail').d('IP详情'),
      children: val ? <OverlappingSupplier {...Props} /> : <NoOverlappingSupplier {...Props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  };

  const columns = useMemo(() => {
    // 权重单价标识
    const weightPriceFlag = rankRule === 'WEIGHT_PRICE';
    // 价格相关字段
    const priceFields = sealedQuotationFlag
      ? []
      : [
          weightPriceFlag
            ? {
                name: getBenchmarkPriceTypeField({
                  benchmarkPriceType,
                  includePriceField: 'priceCoefficientPrice',
                  netPriceField: 'priceCoefficientNetPrice',
                }),
                width: 120,
                align: 'right',
                renderer: ({ value }) => numberSeparatorRender(value),
              }
            : null,
          {
            name: getBenchmarkPriceTypeField({
              benchmarkPriceType,
              includePriceField: 'validQuotationSecPrice',
              netPriceField: 'validNetSecondaryPrice',
            }),
            width: 120,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
          {
            name: getBenchmarkPriceTypeField({
              benchmarkPriceType,
              includePriceField: 'firstValidQuotationSecPrice',
              netPriceField: 'firstValidNetSecPrice',
            }),
            width: 120,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
        ];

    const allColumns = [
      {
        name: 'biddingQuotationRank',
        width: 60,
        hidden: isBritishBidTrafficLight === 1,
        renderer: ({ value, record }) => {
          if (isBritishBidTrafficLight === 1) {
            return (
              <TrafficLight record={record} />
            );
          }

          return value;
        },
      },
      {
        name: 'trafficLight',
        width: 100,
        align: 'center',
        hidden: isBritishBidTrafficLight !== 1 || sealedQuotationFlag,
        renderer: ({ value, record }) => {
          if (isBritishBidTrafficLight === 1) {
            return (
              <TrafficLight record={record} />
            );
          }

          return "";
        },
      },
      {
        name: 'displaySupplierName',
        minWidth: 180,
      },
      ...priceFields,
      {
        name: 'quotationCount',
        width: 80,
        align: 'right',
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      !useNewRateFlag
        ? {
            name: 'supplierCompanyIp',
            width: 180,
            hidden: true,
          }
        : null,
      useNewRateFlag
        ? {
            name: 'whetherIpCoincide',
            width: 150,
            hidden: true,
            renderer: ({ value, record }) =>
              isNil(value) ? (
                value
              ) : (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenIPCoincide(value, record)}
                >
                  <Badge style={{ marginTop: '-2px' }} status={value ? 'error' : 'success'} />
                  <span>
                    {value
                      ? intl.get(`hzero.common.model.yes`).d('是')
                      : intl.get(`hzero.common.model.no`).d('否')}
                  </span>
                </span>
              ),
          }
        : null,
      biddingItemStatus !== 'BIDDING_END' &&
        allowDeleteLatestQuotation && {
          // 单据状态为报价中&供应商有过报价记录时展示按钮
          name: 'operate',
          renderer: ({ record }) => {
            const disabledFlag = ['BIDDING_PAUSED'].includes(biddingItemStatus);
            if (biddingItemStatus === 'BIDDING_IN_PROGRESS' || disabledFlag) {
              return (
                <Button
                  funcType="link"
                  disabled={disabledFlag}
                  onClick={() => handleDeleteNewPrice(record)}
                >
                  {intl.get('ssrc.biddingHall.view.button.deleteNewPrice').d('删除最新报价')}
                </Button>
              );
            }
            return null;
          },
        },
    ].filter(Boolean);
    return rankTableRemote
      ? rankTableRemote.process(
          'SSRC_PURCHASE_BIDDING_HALL_UNIT_PRICE_RANK_TABLE_PROCESS_COLUMNS',
          allColumns,
          {
            headerInfoDS,
            itemRecord,
            biddingRuleDataSet,
            pageProps: props,
          }
        )
      : allColumns;
  }, [
    sealedQuotationFlag,
    benchmarkPriceType,
    biddingItemStatus,
    headerInfoDS,
    itemRecord,
    biddingRuleDataSet,
    handleDeleteNewPrice,
    allowDeleteLatestQuotation,
  ]);

  return (
    <Table
      rowKey="rfxLineSupplierId"
      dataSet={tableDS}
      columns={columns}
      customizable
      customizedCode="SSRC.BIDDING_HALL.UNIT_PRICE_ITEM_LINE_LIST.RANK_TABLE"
      style={{ maxHeight: '200px' }}
    />
  );
};

export default remote({
  code: 'SSRC_PURCHASE_BIDDING_HALL_UNIT_PRICE_RANK_TABLE',
  name: 'rankTableRemote',
})(observer(UnitPriceRankTable));
