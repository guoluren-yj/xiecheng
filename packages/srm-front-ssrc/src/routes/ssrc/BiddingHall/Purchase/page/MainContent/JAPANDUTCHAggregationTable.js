/**
 *
 * 日式，荷兰 聚合表格
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Tag, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
// import classnames from 'classnames';
import { debounce } from 'lodash';

import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';

import TooltipEllipsis from '@/routes/ssrc/BiddingHall/components/TooltipEllipsis';
import { getSupplierStatusTagColor } from '../../../utils/statusColor';

import style from './index.less';

// 总价竞价供应商列表
const JAPANDUTCHAggregationTable = (props = {}) => {
  const {
    header,
    tableDs,
    finishedFlag = 0,
    handleRebuileAggregrationTableDataForDS,
    aggregrationTableProps = {},
  } = props || {};

  const { biddingStatus } = header || {};

  const [appendLoading, setAppendLoading] = useState(false);

  const tableRef = useRef(null);

  // horizontal scroll
  const handleGroupScrollLeft = debounce((scrollLeft, getScrollInfo) => {
    if (!tableDs?.length) {
      return;
    }

    const currentTableCacheObj = tableDs?.getState('currentTableCacheObj') || {};
    const { currentEndRound, allRound, loadLength = 10 } = currentTableCacheObj;

    const { end = 0 } = getScrollInfo() || {};

    /**
     * 每次加载后记录下最后一列轮次 currentEndRound ，
     * 滚动表格后，判断最后一列end 小于整个竞价总轮次allRound，
     * 并且和记录的竞价总轮次相同，表示需要去给表格重新加载数据
     *
     * 比如100轮， 先默认加载 currentEndRound = 10，
     * 表格滚到第十轮， end = 10,
     * 则再次给表格填充 loadLength 条数据。
     */
    const needAppendData = allRound && end && end < allRound && currentEndRound === end;

    if (needAppendData && handleRebuileAggregrationTableDataForDS) {
      const newEnd = end + loadLength;
      setAppendLoading(true);
      handleRebuileAggregrationTableDataForDS({
        start: end,
        end: newEnd,
        leftScrollAppendFlag: 1,
      });

      setAppendLoading(false);

      tableDs.setState('currentTableCacheObj', {
        ...currentTableCacheObj,
        currentEndRound: newEnd,
      });
      tableDs.setState('scroll', {
        scrollLeft,
      });
    }

    tableRef.current.setScrollLeft(scrollLeft);
  }, 100);

  // const handleGroup1ScrollTop = useCallback(
  //   (scrollTop, getScrollInfo) => {
  //   },
  //   [],
  // );

  // const handleGroup1ColumnResize = useCallback(({ width, index }) => {
  // }, []);

  // price render
  const renderCommonTablePrice = useCallback(({ value }) => {
    return numberSeparatorRender(value);
  }, []);

  // 补充单价显示逻辑，补充单价及之后
  const supplementPriceShow = useMemo(
    () =>
      finishedFlag === 1 ||
      biddingStatus === 'SUPPLEMENT_PRICE_BIDDING' ||
      biddingStatus === 'BIDDING_END',
    [biddingStatus]
  );

  const columns = useMemo(
    () => [
      {
        children: [
          {
            title: 'header-group-column-aggregation', // 可在个性化内显示
            header: ({ aggregationTree, title }) => {
              return aggregationTree || title;
            },
            renderer: ({ aggregationTree }) => {
              return aggregationTree[0];
            },
            aggregation: true,
            aggregationLimit: 3,
            aggregationLimitDefaultExpanded: false,
            titleEditable: false,
            key: 'roundDetail',
            align: 'left',
            width: 150,
            children: [
              {
                name: 'biddingRoundSupplierStatus',
                renderer: ({ record }) => {
                  const {
                    biddingRoundSupplierStatus,
                    biddingRoundSupplierStatusMeaning,
                  } = record.get([
                    'biddingRoundSupplierStatus',
                    'biddingRoundSupplierStatusMeaning',
                  ]);

                  if (!biddingRoundSupplierStatus) {
                    return '-';
                  }

                  const color = getSupplierStatusTagColor({ status: biddingRoundSupplierStatus });

                  return (
                    <Tag
                      color={color}
                      style={{ height: '18px', lineHeight: '1.3', fontSize: '12px' }}
                      border={null}
                    >
                      <Tooltip title={biddingRoundSupplierStatusMeaning}>
                        {biddingRoundSupplierStatusMeaning}
                      </Tooltip>
                    </Tag>
                  );
                },
              },
            ],
          },
        ],
      },
    ],
    [tableDs, header, tableDs?.length, tableDs?.status]
  );

  const itemGroups = useMemo(
    () => [
      {
        name: 'biddingRoundNumber',
        type: 'header',
        columnProps: {
          tooltip: 'none',
          header: ({ dataSet }) => {
            const count = dataSet?.getState('acceptedSupplierCount') || 0;

            return (
              <div className={style['ssrc-bidding-hall-aggregration-table-group-title-wrap']}>
                <div
                  className={style['ssrc-bidding-hall-aggregration-table-group-title-invide-left']}
                >
                  <Tooltip
                    title={intl
                      .get('ssrc.common.biddingHall.supplierSignCount', { count })
                      .d('共{count}家供应商签到')}
                  >
                    {intl
                      .get('ssrc.common.biddingHall.supplierSignCount', { count })
                      .d('共{count}家供应商签到')}
                  </Tooltip>
                </div>

                <div
                  className={
                    style['ssrc-bidding-hall-aggregration-table-group-title-invide-middle']
                  }
                >
                  <Tooltip
                    title={intl
                      .get('ssrc.common.biddingHall.view.subtitle.theFinallyAcceptPrice')
                      .d('最终接受价格')}
                  >
                    {intl
                      .get('ssrc.common.biddingHall.view.subtitle.theFinallyAcceptPrice')
                      .d('最终接受价格')}
                  </Tooltip>
                </div>

                {supplementPriceShow ? (
                  <div
                    className={
                      style['ssrc-bidding-hall-aggregration-table-group-title-invide-right']
                    }
                  >
                    <Tooltip
                      title={intl
                        .get('ssrc.common.biddingHall.view.subtitle.supplementAmountPrice')
                        .d('补充单价价格')}
                    >
                      {intl
                        .get('ssrc.common.biddingHall.view.subtitle.supplementAmountPrice')
                        .d('补充单价价格')}
                    </Tooltip>
                  </div>
                ) : (
                  ''
                )}
              </div>
            );
          },
          renderer: ({ text }) => {
            const newText = `${intl.get('ssrc.inquiryHall.model.inquiryHall.round').d('轮次')}${` ${
              text || '-'
            }`}`;
            return newText || '';
          },
          aggregationLimit: 3,
          aggregationLimitDefaultExpanded: false,
          style: { textAlign: 'left' },
          headerStyle: { textAlign: 'left' },
          children: [
            {
              name: 'biddingRoundPrice',
              renderer: renderCommonTablePrice,
            },
            {
              name: 'displayBiddingRoundQuotedCount',
              renderer: renderCommonTablePrice,
            },
            {
              name: 'quotationEndDate',
            },
          ],
        },
      },
      {
        name: 'disSupplierCompanyName',
        type: 'column',
        width: 220,
        columnProps: {
          header: () => {
            return intl.get('ssrc.common.view.message.roundInfo').d('轮次信息');
          },
          key: 'key',
          align: 'left',
          aggregation: true,
          aggregationLimit: 3,
          aggregationLimitDefaultExpanded: false,
          width: supplementPriceShow ? 380 : 280,
          children: [
            {
              name: 'disSupplierCompanyName',
              renderer: ({ record }) => {
                const {
                  displayAcceptAmount,
                  disSupplierCompanyName,
                  displaySupplementAmount = null,
                } = record.get([
                  'displayAcceptAmount',
                  'disSupplierCompanyName',
                  'displaySupplementAmount',
                ]);

                const supplier = disSupplierCompanyName || '-';
                const price = numberSeparatorRender(displayAcceptAmount);
                const supplementPrice = numberSeparatorRender(displaySupplementAmount);

                return (
                  <div className={style['ssrc-bidding-hall-aggregration-table-group-value-wrap']}>
                    <div
                      className={
                        style['ssrc-bidding-hall-aggregration-table-group-value-invide-left']
                      }
                    >
                      <Tooltip title={supplier}>{supplier}</Tooltip>
                    </div>

                    <div
                      className={
                        style['ssrc-bidding-hall-aggregration-table-group-value-invide-middle']
                      }
                    >
                      <TooltipEllipsis title={price ?? '-'}>
                        <span>{price ?? '-'}</span>
                      </TooltipEllipsis>
                    </div>

                    {supplementPriceShow ? (
                      <div
                        className={
                          style['ssrc-bidding-hall-aggregration-table-group-value-invide-right']
                        }
                      >
                        <TooltipEllipsis title={supplementPrice ?? '-'}>
                          <span>{supplementPrice ?? '-'}</span>
                        </TooltipEllipsis>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                );
              },
            },
          ],
        },
      },
    ],
    [tableDs, header, tableDs?.length, tableDs?.status]
  );

  const extraColumn = useMemo(
    () => ({
      width: 120,
      header: intl.get('ssrc.common.view.message.roundInfo').d('轮次信息'),
      align: 'left',
      children: [
        {
          header: ({ aggregationTree, title }) => {
            let newTitle = title;

            if (aggregationTree) {
              newTitle = React.cloneElement(aggregationTree[1], {
                hideValue: true,
                column: {
                  ...aggregationTree[1]?.props?.column,
                  aggregationLimit: 3,
                  aggregationLimitDefaultExpanded: false,
                },
              });

              return newTitle;
            }
          },
        },
      ],
    }),
    [tableDs, header, tableDs?.length, tableDs?.status]
  );

  const tableCommonProps = {
    virtual: true,
    virtualCell: true,
    customizable: false,
    queryBar: 'none',
    columnDraggable: false,
    aggregation: true,
    columnTitleEditable: false,
    border: false,
    dataSet: tableDs,
    columns,
    groups: itemGroups,
    headerGroupExtraColumn: extraColumn,
    headerRowHeight: 'auto',
    onScrollLeft: handleGroupScrollLeft,
    // onScrollTop: handleGroup1ScrollTop,
    // onColumnResize: handleGroup1ColumnResize,
    ref: tableRef,

    // autoHeight: {
    //   type: 'minHeight',
    //   diff: 30,
    // },
    style: {
      height: 450,
    },
    selectionMode: 'none',
    bodyExpandable: true,
    fullColumnWidth: false,
    aggregationCellLineBreak: true,
    aggregationCellLineLimit: 4,
    highLightRow: false,
    showAllPageSelectionButton: true,
    aggregationExpandType: 'row',
    aggregationExpandTypeChangeable: false,
    spin: {
      spinning: appendLoading || tableDs?.status === 'loading', // spin cancel
    },
    ...aggregrationTableProps,
  };

  return (
    <div className={style['ssrc-bidding-hall-aggregration-table-purchase']}>
      <Table {...tableCommonProps} />
    </div>
  );
};

export default observer(JAPANDUTCHAggregationTable);
