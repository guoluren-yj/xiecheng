import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { getResponse } from 'utils/utils';
import { noop, isFunction, isNil } from 'lodash';
import { Icon, Spin, Collapse, Row, Col, Text } from 'choerodon-ui';
import { Pagination, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import { observer } from 'mobx-react';

import { AFExtra } from 'srm-front-boot/lib/components/AFCards';

import { numberSeparatorRender } from '@/utils/renderer';

import { unitPriceItemDataSet } from '@/routes/ssrc/BiddingHall/Purchase/stores/unitPriceDS';
import { getPurCustomizeUnitCode } from '../../../utils/utils';
import { PurStatusTag } from '../../../utils/renders';
import { getPurLineStatusColor, getPurLineStatusTimerColor } from '../../../utils/statusColor';
import { PurchaseLineStatus, PurchaseItemIcon, PurBiddingHistoryChart } from '../../../components';
import UnitPriceRankTable from './UnitPriceRankTable';

import Style from './index.less';

const { Panel } = Collapse;

const noDataSvg = require('@/assets/biddingHall/no-data-placeholder.svg');

const UnitPriceBiddingTable = observer((props = {}) => {
  const {
    itemLineListDS,
    leftRender = noop,
    statusCheckableTabRef,
    initPage,
    toggleLoading,
    fetchBiddingSiteInfo,
    biddingRuleDataSet,
    bidCountDataSet,
    headerInfoDS,
    remote,
    customizeCommon,
    useNewRateFlag = 0,
    rfxHeaderId,
  } = props || {};

  const header = itemLineListDS.getQueryParameter('header');
  const commonProps = itemLineListDS.getQueryParameter('commonProps');

  const {
    quotationOrderType, // 报价次序
    benchmarkPriceType, // 基准价
    biddingStatus,
    biddingQuotationMethod, // 竞价方式是 竞价：BIDDING；拍卖：AUCTION
    autoDeferFlag, // 是否启用自动延时
    sealedQuotationFlag, // 密封报价
    biddingTarget, // 竞价对象
    biddingAnonymousQuotesFlag, // 匿名报价
    quotationEndDate,
    originalStatus, // 真正的暂停状态
    isBritishBidTrafficLight, // 启用红绿灯
    trialBiddingFlag,
  } = header || {};

  // 刷新物料列表 loading
  const [itemListLoading, setItemListLoading] = useState(false);
  // 打开的折叠面板数据
  const [collapseList, setCollapseList] = useState([]);

  useEffect(() => {
    handleDefaultOpenItem();
  }, [itemLineListDS?.length]);

  /**
   * 展开物料
   * record - 需要展开的物料行
   * isOpen - 是展开还是收起
   */
  const handleDefaultOpenItem = useCallback(() => {
    // dom渲染时已经打开标识
    const firstOpenItemFlag = itemLineListDS.getState('firstOpenItemFlag');
    // 若第一次已经自动打开，则后面不再自动打开折叠框
    if (firstOpenItemFlag) return;
    if (itemLineListDS?.length > 0) {
      if (quotationOrderType === 'SEQUENCE') {
        // eslint-disable-next-line no-unused-expressions
        itemLineListDS?.records?.forEach((r) => {
          if (r.get('biddingItemStatus') === 'BIDDING_IN_PROGRESS') {
            setCollapseList([...collapseList, r.get('rfxLineItemId')]);
          }
        });
        // 设置第一次渲染已经打开标识，防止后面刷新的时候再次重新打开
        itemLineListDS.setState('firstOpenItemFlag', true);
      }
    }
  }, [itemLineListDS, quotationOrderType, collapseList]);

  // 试竞价开始之前
  const beforeBiddingOnGoingFlag = useMemo(() => {
    const flag = !(
      ['SIGN_NOT_START', 'SIGNING', 'TRIAL_BIDDING_NOT_START', 'BIDDING_NOT_START'].includes(
        biddingStatus
      ) ||
      (['BIDDING_PAUSED', 'BIDDING_CLOSED'].includes(biddingStatus) &&
        ['SIGN_NOT_START', 'SIGNING', 'TRIAL_BIDDING_NOT_START', 'BIDDING_NOT_START'].includes(
          originalStatus
        ))
    );
    return flag;
  }, [biddingStatus, originalStatus]);

  // 物料信息表单字段
  const itemListItemInfoFieldsConfig = useCallback(
    (data = {}) => {
      const { itemRecord } = data || {};
      const {
        // itemCode,
        // itemName,
        // rfxQuantity, // 数量
        // secondaryQuantity, // 辅助数量
        // uomName, // 单位
        // secondaryUomName, // 辅助单位
        // specs, // 规格
        quotationCount, // 出价次数
        // biddingItemStatusMeaning, // 物料行状态名称
        biddingLineRule,
        // biddingItemStatus, // 行状态
        quotedSupplierCount,
        assignedSupplierCount, // 邀请是已分配供应商；公开是已分配供应商
        minTaxIncludePrice, // 最高价 含税
        minNetPrice, // 最低价 未税
        maxTaxIncludePrice, // 最高价 含税
        maxNetPrice, // 最高价 未税
        // rfxLineItemId,
        // rfxLineItemNum, // 行号
      } = itemRecord
        ? itemRecord.get([
            // // 'itemCode',
            // 'itemName',
            // 'rfxQuantity',
            // 'secondaryQuantity',
            // 'uomName',
            // 'secondaryUomName',
            // 'specs',
            'quotationCount',
            // 'biddingItemStatusMeaning',
            'biddingLineRule',
            // 'biddingItemStatus',
            'quotedSupplierCount',
            'assignedSupplierCount',
            'minTaxIncludePrice',
            'minNetPrice',
            'maxTaxIncludePrice',
            'maxNetPrice',
            // 'rfxLineItemId',
            // 'rfxLineItemNum',
          ])
        : {};

      const {
        startingBiddingPrice, // 起竞价
        floatType, // 浮动方式
        quotationRange, // 报价幅度
        // biddingType,
      } = biddingLineRule || {};

      /**
     * 最低价
     * 1.展示逻辑：
      寻源模板中【试竞价】为是时，试竞价阶段和竞价开始后（试竞价开始-试竞价结束&正式竞价开始后）展示
      寻源模板中【试竞价】为否时，竞价开始时间后展示
      当询价单头中【密封报价】为是，最优价字段不展示
      2.逻辑说明：
      ①按照基准价判断，展示物料当前最优价。竞价方式是拍卖时，展示所有供应商报价中对该物料的最高价。竞价方式是竞价时，展示所有供应商报价中对该物料的最低价。
      ②试竞价需判断试竞价的报价中最优价
      竞价时需判断竞价的报价中最优价
    */
      let minPriceValue = '';
      if (!sealedQuotationFlag) {
        if (biddingQuotationMethod === 'BIDDING') {
          // 竞价
          if (benchmarkPriceType === 'TAX_INCLUDED_PRICE') {
            minPriceValue = minTaxIncludePrice;
          } else {
            minPriceValue = minNetPrice;
          }
        } else if (biddingQuotationMethod === 'AUCTION') {
          // 拍卖
          if (benchmarkPriceType === 'TAX_INCLUDED_PRICE') {
            minPriceValue = maxTaxIncludePrice;
          } else {
            minPriceValue = maxNetPrice;
          }
        }
      }

      const trialBiddingLimitShow = isBritishBidTrafficLight === 1 && trialBiddingFlag === 1;
      const biddingLimitShow = isBritishBidTrafficLight === 1 && trialBiddingFlag === 0;

      const currentFieldsConfigs = {
        rfxNumTitle: {
          hidden: true,
        },
        startingBiddingPrice: {
          useLabel: true,
          hidden: isBritishBidTrafficLight === 1,
          renderValue: () => {
            return isNil(startingBiddingPrice) ? '-' : numberSeparatorRender(startingBiddingPrice);
          },
          label:
            biddingQuotationMethod === 'AUCTION'
              ? intl.get('ssrc.biddingHall.model.startingAuctionBiddingPrice').d('起拍价')
              : intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
        },
        quotationRange: {
          useLabel: true,
          hidden: biddingTarget !== 'UNIT_PRICE' || isBritishBidTrafficLight === 1,
          renderValue: () => {
            return !isNil(quotationRange)
              ? `${numberSeparatorRender(quotationRange)}${floatType === 'ratio' ? '%' : ''}`
              : '-';
          },
        },
        targetPriceLowerLimit: {
          useLabel: true,
          hidden: !biddingLimitShow,
          renderValue: ({ value }) => {
            const formatValue = !isNil(value) ? numberSeparatorRender(value) : '-';
            return formatValue;
          },
        },
        targetPriceUpperLimit: {
          useLabel: true,
          hidden: !biddingLimitShow,
          renderValue: ({ value }) => {
            const formatValue = !isNil(value) ? numberSeparatorRender(value) : '-';
            return formatValue;
          },
        },
        trialTargetPriceLowerLimit: {
          useLabel: true,
          hidden: !trialBiddingLimitShow,
          renderValue: ({ value }) => {
            const formatValue = !isNil(value) ? numberSeparatorRender(value) : '-';
            return formatValue;
          },
        },
        trialTargetPriceUpperLimit: {
          useLabel: true,
          hidden: !trialBiddingLimitShow,
          renderValue: ({ value }) => {
            const formatValue = !isNil(value) ? numberSeparatorRender(value) : '-';
            return formatValue;
          },
        },
        quotedSupplierCount: {
          useLabel: true,
          hidden: !beforeBiddingOnGoingFlag,
          renderValue: () => {
            return !isNil(quotedSupplierCount) || !isNil(assignedSupplierCount)
              ? `${quotedSupplierCount ?? '0'}/${assignedSupplierCount ?? '0'}`
              : '-';
          },
        },
        quotationCount: {
          useLabel: true,
          hidden: !beforeBiddingOnGoingFlag,
          renderValue: () => {
            return quotationCount ?? '-';
          },
        },
        minPrice: {
          useLabel: true,
          hidden: !beforeBiddingOnGoingFlag,
          renderValue: () => {
            return isNil(minPriceValue) || minPriceValue === ''
              ? '-'
              : numberSeparatorRender(minPriceValue);
          },
          label:
            biddingQuotationMethod === 'BIDDING'
              ? intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')
              : intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价'),
        },
      };
      const processFieldsConfigs = remote
        ? remote.process(
            'SSRC_PURCHASE_BIDDING_HALL_PUR_UNIT_HEADER_ITEM_FIELDS_CONFIG',
            currentFieldsConfigs,
            {
              pageProps: props,
            }
          )
        : currentFieldsConfigs;

      return processFieldsConfigs;
    },
    [
      itemLineListDS,
      benchmarkPriceType, // 基准价
      quotationOrderType,
      biddingStatus,
      biddingQuotationMethod, // 竞价方式是 竞价：BIDDING；拍卖：AUCTION
      autoDeferFlag, // 是否启用自动延时
      sealedQuotationFlag, // 密封报价
      biddingTarget, // 竞价对象
      biddingAnonymousQuotesFlag, // 匿名报价
      quotationEndDate,
      originalStatus, // 真正的暂停状态
      biddingRuleDataSet,
      commonProps,
      header,
      beforeBiddingOnGoingFlag,
      remote,
    ]
  );

  // 表格外层行渲染
  const rowRenderer = useCallback(
    ({ record }) => {
      const doubleUnitFlag = itemLineListDS.getQueryParameter('doubleUnitFlag');

      if (!record) return;

      const currentCardData = record.toData() || {};
      let approvalFormDS = record.getState('approvalFormDS');

      if (!approvalFormDS) {
        approvalFormDS = new DataSet(unitPriceItemDataSet({ biddingQuotationMethod }));
        approvalFormDS.create(currentCardData, 0);

        record.setState('approvalFormDS', approvalFormDS);
      }

      const {
        // itemCode,
        itemName,
        rfxQuantity, // 数量
        secondaryQuantity, // 辅助数量
        uomName, // 单位
        secondaryUomName, // 辅助单位
        specs, // 规格
        // quotationCount, // 出价次数
        biddingItemStatusMeaning, // 物料行状态名称
        // biddingLineRule,
        biddingItemStatus, // 行状态
        // quotedSupplierCount,
        // assignedSupplierCount, // 邀请是已分配供应商；公开是已分配供应商
        // minTaxIncludePrice, // 最高价 含税
        // minNetPrice, // 最低价 未税
        // maxTaxIncludePrice, // 最高价 含税
        // maxNetPrice, // 最高价 未税
        rfxLineItemId,
        rfxLineItemNum, // 行号
      } = record.get([
        // 'itemCode',
        'itemName',
        'rfxQuantity',
        'secondaryQuantity',
        'uomName',
        'secondaryUomName',
        'specs',
        // 'quotationCount',
        'biddingItemStatusMeaning',
        // 'biddingLineRule',
        'biddingItemStatus',
        // 'quotedSupplierCount',
        // 'assignedSupplierCount',
        // 'minTaxIncludePrice',
        // 'minNetPrice',
        // 'maxTaxIncludePrice',
        // 'maxNetPrice',
        'rfxLineItemId',
        'rfxLineItemNum',
      ]);

      // const {
      //   startingBiddingPrice, // 起竞价
      //   floatType, // 浮动方式
      //   quotationRange, // 报价幅度
      //   // biddingType,
      // } = biddingLineRule || {};

      // 签到之后的都显示进行中
      // const biddingSignInFlag = !(
      //   ['SIGN_NOT_START', 'SIGNING'].includes(biddingStatus) ||
      //   (biddingStatus === 'BIDDING_PAUSED' &&
      //     ['SIGN_NOT_START', 'SIGNING', ''].includes(originalStatus))
      // );

      // /**
      //  * 最低价
      //  * 1.展示逻辑：
      //   寻源模板中【试竞价】为是时，试竞价阶段和竞价开始后（试竞价开始-试竞价结束&正式竞价开始后）展示
      //   寻源模板中【试竞价】为否时，竞价开始时间后展示
      //   当询价单头中【密封报价】为是，最优价字段不展示
      //   2.逻辑说明：
      //   ①按照基准价判断，展示物料当前最优价。竞价方式是拍卖时，展示所有供应商报价中对该物料的最高价。竞价方式是竞价时，展示所有供应商报价中对该物料的最低价。
      //   ②试竞价需判断试竞价的报价中最优价
      //   竞价时需判断竞价的报价中最优价
      // */
      // let minPriceValue = '';
      // if (!sealedQuotationFlag) {
      //   if (biddingQuotationMethod === 'BIDDING') {
      //     // 竞价
      //     if (benchmarkPriceType === 'TAX_INCLUDED_PRICE') {
      //       minPriceValue = minTaxIncludePrice;
      //     } else {
      //       minPriceValue = minNetPrice;
      //     }
      //   } else if (biddingQuotationMethod === 'AUCTION') {
      //     // 拍卖
      //     if (benchmarkPriceType === 'TAX_INCLUDED_PRICE') {
      //       minPriceValue = maxTaxIncludePrice;
      //     } else {
      //       minPriceValue = maxNetPrice;
      //     }
      //   }
      // }

      // 报价详情字段
      // const quotationDetailColumns = [
      //   {
      //     name: 'startingBiddingPrice',
      //     label:
      //       biddingQuotationMethod === 'AUCTION'
      //         ? intl.get('ssrc.biddingHall.model.startingAuctionBiddingPrice').d('起拍价')
      //         : intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
      //     value: isNil(startingBiddingPrice) ? '-' : numberSeparatorRender(startingBiddingPrice),
      //   },
      //   biddingTarget === 'UNIT_PRICE'
      //     ? {
      //         name: 'quotationRange',
      //         label: intl.get('ssrc.biddingHall.model.quotationRange').d('报价幅度'),
      //         value: !isNil(quotationRange)
      //           ? `${numberSeparatorRender(quotationRange)}${floatType === 'ratio' ? '%' : ''}`
      //           : '-',
      //       }
      //     : null,
      //   beforeBiddingOnGoingFlag && {
      //     name: 'quotedSupplierCount',
      //     label: intl.get('ssrc.biddingHall.model.BidStatus').d('出价情况'),
      //     value:
      //       !isNil(quotedSupplierCount) || !isNil(assignedSupplierCount)
      //         ? `${quotedSupplierCount ?? '0'}/${assignedSupplierCount ?? '0'}`
      //         : '-',
      //   },
      //   beforeBiddingOnGoingFlag && {
      //     name: 'quotationCount',
      //     label: intl.get('ssrc.biddingHall.view.title.numberOfBids').d('出价次数'),
      //     value: quotationCount,
      //   },
      //   beforeBiddingOnGoingFlag &&
      //     !sealedQuotationFlag && {
      //       name: 'minPrice',
      //       label:
      //         biddingQuotationMethod === 'BIDDING'
      //           ? intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')
      //           : intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价'),
      //       value:
      //         isNil(minPriceValue) || minPriceValue === ''
      //           ? '-'
      //           : numberSeparatorRender(minPriceValue),
      //     },
      // ].filter(Boolean);

      // 标签状态颜色
      const statusColor = getPurLineStatusColor(biddingItemStatus);

      // 物料前面的icon颜色
      let itemStatusColor = getPurLineStatusTimerColor(biddingItemStatus);
      // 暂停、进行中 用深色的，其他状态用浅色的
      if (['BIDDING', 'BIDDING_PAUSED'].includes(biddingItemStatus)) {
        itemStatusColor = statusColor;
      }

      // 物料名称相关
      const itemNameTitle = doubleUnitFlag
        ? `${itemName}${!isNil(secondaryQuantity) ? `-${secondaryQuantity}` : ''}${
            !isNil(secondaryUomName) ? `${secondaryUomName}` : ''
          }`
        : `${itemName}${!isNil(rfxQuantity) ? `-${rfxQuantity}` : ''}${
            !isNil(uomName) ? `${uomName}` : ''
          }`;

      let itemViewFormWrapDivClassNameCUX = '';
      itemViewFormWrapDivClassNameCUX = remote
        ? remote.process(
            'SSRC_PURCHASE_BIDDING_HALL_PROCESS_ITEM_VIEW_LIST_ITEM_WRAPPER_DIV_CLASS_NAME',
            itemViewFormWrapDivClassNameCUX,
            {
              record,
              Style,
              pageProps: props,
            }
          )
        : itemViewFormWrapDivClassNameCUX;
      itemViewFormWrapDivClassNameCUX = itemViewFormWrapDivClassNameCUX || '';

      // 并行序列样式组件参数
      const itemIconProps = {
        status: biddingItemStatus,
        quotationOrderType,
        index: rfxLineItemNum,
        textColor: itemStatusColor,
      };

      // 竞价历史图表分析参数
      const historyChartProps = {
        itemRecord: record,
        commonProps,
        header,
        type: 'PURCHASE',
        biddingRuleDataSet,
        itemLineListDS,
        beforeBiddingOnGoingFlag,
      };

      return (
        <div className={`${Style['bidding-hall-layout-content-unit-price-list-item']}`}>
          <Row
            gutter={8}
            type="flex"
            justify="space-between"
            className={Style['bidding-hall-layout-content-unit-price-list-item-material-detail']}
          >
            <Col className={Style['list-item-material-left']}>
              <PurchaseItemIcon
                styles={{
                  minWidth: '.16rem',
                  height: '.16rem',
                  width: 'auto',
                  lineHeight: '.16rem',
                }}
                {...itemIconProps}
              />
              <span className={Style['list-item-material-name']}>
                <Text>{itemNameTitle}</Text>
              </span>
              {/* TODO：这里后期若放出竞价图表分析再将条件去掉 */}
              {specs ? <span className={Style['list-item-material-split']} /> : null}
              {specs ? (
                <span className={Style['list-item-material-specs']}>
                  <Text>{specs ?? ''}</Text>
                </span>
              ) : null}
              <span className={Style['list-item-material-history-chart']}>
                <PurBiddingHistoryChart {...historyChartProps} />
              </span>
            </Col>
            <Col className={Style['list-item-material-right']}>
              {biddingItemStatusMeaning ? (
                <PurStatusTag {...statusColor} marginRight={0}>
                  <Text style={{ maxWidth: '.45rem' }}>{biddingItemStatusMeaning}</Text>
                </PurStatusTag>
              ) : (
                ''
              )}
              {/* 报价次序为序列时显示行倒计时 */}
              {quotationOrderType === 'SEQUENCE' && (
                <PurchaseLineStatus
                  headerRecordData={headerInfoDS?.current}
                  data={record}
                  countDownTimerOver={() => {
                    itemLineListDS.query(itemLineListDS.currentPage || 1);
                  }}
                  type="line"
                  labelClass={Style['list-item-timer-label']}
                  lineStatusStyle={{
                    ...getPurLineStatusTimerColor(biddingItemStatus),
                    padding: '0',
                  }}
                />
              )}
            </Col>
          </Row>
          {/* 二开埋点：捷泰科技 */}
          {remote
            ? remote.render('SSRC_PURCHASE_BIDDING_HALL_RENDER_UNIT_PRICE_LIST_ROW_NODE', <></>, {
                record,
                sealedQuotationFlag,
                Style,
              })
            : ''}

          <div className={itemViewFormWrapDivClassNameCUX}>
            {customizeCommon(
              {
                code: getPurCustomizeUnitCode('unitPriceHeaderItemView'),
                processUnitTag: 'AF-EXTRA',
              },
              <AFExtra
                dataSet={approvalFormDS}
                titleField="rfxNumTitle"
                cardMaxCount={5}
                underLabel
                fields={[
                  'startingBiddingPrice',
                  'quotationRange',
                  'targetPriceLowerLimit',
                  'targetPriceUpperLimit',
                  'trialTargetPriceLowerLimit',
                  'trialTargetPriceUpperLimit',
                  'quotedSupplierCount',
                  'quotationCount',
                  'minPrice',
                ]}
                fieldsConfig={itemListItemInfoFieldsConfig({ itemRecord: record })}
              />
            )}
          </div>

          <Row
            gutter={8}
            type="flex"
            justify="space-between"
            className={Style['bidding-hall-layout-content-unit-price-list-item-quotation-detail']}
          >
            {/* {quotationDetailColumns.map((item) => (
              <Col key={item.name} span={4}>
                <h3 className={Style['quotation-detail-text-value']}>
                  <Text>{item.value}</Text>
                </h3>
                <span className={Style['quotation-detail-text-name']}>
                  <Text>{item.label}</Text>
                </span>
              </Col>
            ))} */}
            {!beforeBiddingOnGoingFlag && (
              <Col span={16}>
                <div className={Style['quotation-detail-text-no-start']}>
                  {intl.get('ssrc.biddingHall.view.message.noStart').d('尚未开始，请耐心等待')}
                </div>
              </Col>
            )}
          </Row>
          {beforeBiddingOnGoingFlag && (
            <Row gutter={8} type="flex" justify="space-around">
              {collapseList.includes(rfxLineItemId) ? (
                <Icon
                  type="baseline-arrow_drop_up"
                  style={{ height: '12px', lineHeight: '12px' }}
                />
              ) : (
                <Icon
                  type="baseline-arrow_drop_down"
                  style={{ height: '12px', lineHeight: '12px' }}
                />
              )}
            </Row>
          )}
        </div>
      );
    },
    [
      itemLineListDS,
      benchmarkPriceType, // 基准价
      quotationOrderType,
      biddingStatus,
      biddingQuotationMethod, // 竞价方式是 竞价：BIDDING；拍卖：AUCTION
      autoDeferFlag, // 是否启用自动延时
      sealedQuotationFlag, // 密封报价
      biddingTarget, // 竞价对象
      biddingAnonymousQuotesFlag, // 匿名报价
      quotationEndDate,
      originalStatus, // 真正的暂停状态
      biddingRuleDataSet,
      commonProps,
      collapseList,
      header,
      beforeBiddingOnGoingFlag,
      remote,
    ]
  );

  // 获取单价竞价类名
  const getClassName = useCallback((record) => {
    if (!record) return;
    const biddingItemStatus = record.get('biddingItemStatus');
    // 只有序列才需要这样的样式 不同的状态展示不同的样式，使用不同的类名
    let differentStyleClassName = '';
    if (quotationOrderType === 'SEQUENCE') {
      // 报价次序为序列并且物料为进行中状态 显示蓝色边框
      const showProcessItemFlag =
        quotationOrderType === 'SEQUENCE' && biddingItemStatus === 'BIDDING_IN_PROGRESS';
      if (biddingItemStatus === 'BIDDING_PAUSED') {
        differentStyleClassName = 'c7n-collapse-item-unit-price-list-item-paused';
      } else if (showProcessItemFlag) {
        differentStyleClassName = 'c7n-collapse-item-unit-price-list-item-process';
      }
    }
    return differentStyleClassName;
  });

  // 列表查询
  const tableSearchQuery = useCallback(
    (searchParams, otherParams = {}) => {
      if (!itemLineListDS) {
        return;
      }
      const { params = {}, status: customStatus } = searchParams || {};
      setItemListLoading(true);
      // 如果搜索来自于组件自带刷新，则直接调用query即可，否则需要重新设置标签参数
      if (otherParams?.searchFrom === 'barRefreshIcon') {
        // 如果是触发了刷新icon，则非筛选器自带的查询参数保持原来的
        const { status } = itemLineListDS.getQueryParameter('advanced') || {};
        itemLineListDS.setQueryParameter('advanced', {
          status,
          searchBarParams: params,
        });

        itemLineListDS
          .query(1)
          .then((res) => {
            if (getResponse(res)) {
              setItemListLoading(false);
            }
          })
          .catch(() => {
            setItemListLoading(false);
          });
      } else {
        // 否则筛选器自带的查询参数保持原来的
        const { searchBarParams } = itemLineListDS.getQueryParameter('advanced') || {};
        itemLineListDS.setState('openTabList', []);
        itemLineListDS.setQueryParameter('advanced', {
          status: customStatus,
          searchBarParams,
        });
        itemLineListDS
          .query(1)
          .then((res) => {
            if (getResponse(res)) {
              setItemListLoading(false);
            }
          })
          .catch(() => {
            setItemListLoading(false);
          });
      }
    },
    [itemLineListDS, setItemListLoading]
  );

  // 清除列表筛选器
  const unitPriceListTableSearchClear = useCallback(() => {
    const { clearCheckTag } = statusCheckableTabRef?.current || {};

    if (isFunction(clearCheckTag)) {
      clearCheckTag();
    }
  }, [statusCheckableTabRef?.current]);

  // 折叠面板点击事件
  const handleChangeCollapse = useCallback((key) => {
    setCollapseList(key);
  });

  // 分页改变自定义渲染
  const sizeChangerRenderer = useCallback(({ text }) => {
    return `${text} ${intl.get('hzero.c7nUI.Pagination.items_per_page').d('条/页')}`;
  }, []);

  // 切换分页
  const handleChangePage = useCallback(() => {
    setItemListLoading(true);
  }, []);

  // 获取列表 ds loading 状态
  const getItemLineDsStatus = useMemo(() => {
    return itemLineListDS?.status === 'loading';
  }, [itemLineListDS?.status]);

  // 供应商排名参数
  const unitPriceRankTableProps = {
    commonProps,
    header,
    initPage,
    toggleLoading,
    fetchBiddingSiteInfo,
    itemLineListDS,
    biddingRuleDataSet,
    bidCountDataSet,
    headerInfoDS,
    useNewRateFlag,
    rfxHeaderId,
  };
  return (
    <React.Fragment>
      {/* 注意⚠️：此处的loading必须是手动设置为true 并且ds状态为loading 时才出现加载状态，像websocket这种推送刷新不需要loading */}
      <Spin spinning={itemListLoading && getItemLineDsStatus}>
        <div className={Style['pur-main-content-bidding-list-wrapper']}>
          {/* 筛选器 */}
          <div className={Style['pur-main-content-bidding-list-search-bar']}>
            <SearchBar
              clearButton
              searchCode={getPurCustomizeUnitCode('unitPriceItemTableSearch')}
              onQuery={(params) => tableSearchQuery(params, { searchFrom: 'barRefreshIcon' })}
              dataSet={itemLineListDS}
              autoQuery={false}
              // expandable={false}
              defaultExpand={false}
              left={{
                render: (_, ds) => leftRender(ds, tableSearchQuery),
              }}
              onClear={unitPriceListTableSearchClear}
            />
          </div>
          {/* 主内容 */}
          <div className={Style['pur-main-content-bidding-list-itemLine-wrapper']}>
            {!!itemLineListDS?.length && (
              <div className={Style['pur-main-content-bidding-list-itemLine-table-wrapper']}>
                <Collapse
                  bordered={false}
                  onChange={handleChangeCollapse}
                  activeKey={collapseList}
                  style={{ flex: 1, overflow: 'auto' }}
                  trigger={beforeBiddingOnGoingFlag ? 'header' : 'noTrigger'}
                >
                  {itemLineListDS.length &&
                    itemLineListDS?.records?.map((line = {}, index) => (
                      <Panel
                        header={rowRenderer({ index, record: line })}
                        key={line.get('rfxLineItemId')}
                        showArrow={false}
                        className={getClassName(line)}
                      >
                        {beforeBiddingOnGoingFlag && (
                          <UnitPriceRankTable record={line} {...unitPriceRankTableProps} />
                        )}
                      </Panel>
                    ))}
                </Collapse>
                <div className={Style['pur-main-content-bidding-list-itemLine-pagination-wrapper']}>
                  <Pagination
                    style={{ float: 'right' }}
                    showPager
                    maxPageSize={100}
                    showTotal={false}
                    dataSet={itemLineListDS}
                    sizeChangerPosition="right"
                    showSizeChangerLabel={false}
                    sizeChangerOptionRenderer={sizeChangerRenderer}
                    onChange={handleChangePage}
                  />
                </div>
              </div>
            )}
            {!itemLineListDS?.length && (
              <div className={Style['list-empty-item-occupied']}>
                <img alt="" src={noDataSvg} />
                <div className={Style['list-empty-item-occupied-text']}>
                  {intl.get('hzero.common.message.data.none').d('暂无数据')}
                </div>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </React.Fragment>
  );
});

export default UnitPriceBiddingTable;
