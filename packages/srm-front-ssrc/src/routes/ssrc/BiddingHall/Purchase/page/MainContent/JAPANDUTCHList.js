/**
 * 日式，荷兰
 *
 * 平铺表列表
 */

import React, { useCallback, useEffect, useState, useMemo, useImperativeHandle } from 'react';
import { isNil } from 'lodash';
import { Icon, Spin, Collapse, Row, Col, Text } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import { AFExtra } from 'srm-front-boot/lib/components/AFCards';

import { numberSeparatorRender } from '@/utils/renderer';

import { totalPriceSupplierListAFDataSet } from '@/routes/ssrc/BiddingHall/Purchase/stores/totalPriceDS';
import { getPurCustomizeUnitCode } from '../../../utils/utils';
import { PurStatusTag } from '../../../utils/renders';
import { getPurLineStatusColor } from '../../../utils/statusColor';
import JAPANDUTCHTable from './JAPANDUTCHTable';

import Style from './index.less';

const noDataSvg = require('@/assets/biddingHall/no-data-placeholder.svg');

const { Panel } = Collapse;

const JAPANDUTCHList = observer((props = {}) => {
  const {
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
    japanDutchRoundListDs,
    organizationId,
    header,
    japanDutchListRef,
  } = props || {};

  const commonProps = japanDutchRoundListDs.getQueryParameter('commonProps');

  const {
    quotationOrderType, // 报价次序
    benchmarkPriceType, // 基准价
    biddingStatus,
    biddingQuotationMethod, // 竞价方式是 竞价：BIDDING；拍卖：AUCTION
    // autoDeferFlag, // 是否启用自动延时
    sealedQuotationFlag, // 密封报价
    biddingTarget, // 竞价对象
    biddingAnonymousQuotesFlag, // 匿名报价
    quotationEndDate,
    originalStatus, // 真正的暂停状态
  } = header || {};

  // 刷新轮次列表 loading
  // const [itemListLoading, setItemListLoading] = useState(false);
  // 打开的折叠面板数据
  const [collapseList, setCollapseList] = useState([]);

  useEffect(() => {
    handleDefaultOpenRoundItem();
  }, [japanDutchRoundListDs?.length]);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(
    japanDutchListRef,
    () => ({
      handleDefaultOpenRoundItem,
    }),
    [handleDefaultOpenRoundItem]
  );

  /**
   * 展开轮次
   */
  const handleDefaultOpenRoundItem = useCallback(() => {
    // dom渲染时已经打开标识
    const firstOpenItemFlag = japanDutchRoundListDs.getState('firstOpenItemFlag');
    // 若第一次已经自动打开，则后面不再自动打开折叠框
    if (firstOpenItemFlag) {
      return;
    }

    if (japanDutchRoundListDs?.length > 0) {
      japanDutchRoundListDs.forEach((r) => {
        const { biddingRoundStatus, biddingRoundDateId } = r
          ? r.get(['biddingRoundStatus', 'biddingRoundDateId'])
          : {};

        if (biddingRoundStatus === 'IN_PROCESS' && biddingRoundDateId) {
          setCollapseList([...collapseList, biddingRoundDateId]);
        }
      });

      // 设置第一次渲染已经打开标识，防止后面刷新的时候再次重新打开
      japanDutchRoundListDs.setState('firstOpenItemFlag', true);
    }
  }, [japanDutchRoundListDs, quotationOrderType, collapseList]);

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

  // 轮次信息表单字段
  const roundListItemInfoFieldsConfig = useCallback(
    (data = {}) => {
      const { roundRecord } = data || {};
      const { biddingRoundPrice, displayBiddingRoundQuotedCount } = roundRecord
        ? roundRecord.get(['biddingRoundPrice', 'displayBiddingRoundQuotedCount'])
        : {};

      const currentFieldsConfigs = {
        biddingRoundPrice: {
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundPrice`).d('叫价'),
          useLabel: true,
          renderValue: () => {
            return isNil(biddingRoundPrice) ? '-' : numberSeparatorRender(biddingRoundPrice);
          },
        },
        displayBiddingRoundQuotedCount: {
          name: 'displayBiddingRoundQuotedCount',
          useLabel: true,
          renderValue: () => {
            return displayBiddingRoundQuotedCount;
          },
        },
        quotationStartDate: {
          useLabel: true,
        },
        quotationEndDate: {
          useLabel: true,
        },
      };

      return currentFieldsConfigs;
    },
    [
      japanDutchRoundListDs,
      benchmarkPriceType, // 基准价
      quotationOrderType,
      biddingStatus,
      biddingQuotationMethod, // 竞价方式是 竞价：BIDDING；拍卖：AUCTION
      // autoDeferFlag, // 是否启用自动延时
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
      if (!record) {
        return '';
      }

      const currentCardData = record.toData() || {};
      let approvalFormDS = record.getState('approvalFormDS');

      if (!approvalFormDS) {
        approvalFormDS = new DataSet(totalPriceSupplierListAFDataSet({ biddingQuotationMethod }));
        approvalFormDS.create(currentCardData, 0);

        record.setState('approvalFormDS', approvalFormDS);
      }

      const {
        // itemCode,
        biddingRoundNumber = 0,
        biddingRoundStatusMeaning,
        biddingRoundStatus, // 行状态
        biddingRoundDateId,
      } = record.get([
        // 'itemCode',
        'biddingRoundNumber',
        'biddingRoundStatusMeaning',
        'biddingRoundStatus',
        'biddingRoundDateId',
      ]);

      // 标签状态颜色
      const statusColor = getPurLineStatusColor(biddingRoundStatus);

      return (
        <div className={`${Style['bidding-hall-layout-content-unit-price-list-item']}`}>
          <Row
            gutter={8}
            type="flex"
            justify="space-between"
            className={Style['bidding-hall-layout-content-unit-price-list-item-material-detail']}
          >
            <Col className={Style['list-item-material-left']}>
              <span className={Style['list-item-material-name']}>
                {intl
                  .get(`ssrc.biddingHall.view.theRoundNum`, { round: biddingRoundNumber })
                  .d('第{round}轮')}
              </span>
            </Col>

            <Col className={Style['list-item-material-right']}>
              {biddingRoundStatusMeaning ? (
                <PurStatusTag {...statusColor} marginRight={0}>
                  <Text style={{ maxWidth: '.45rem' }}>{biddingRoundStatusMeaning}</Text>
                </PurStatusTag>
              ) : (
                ''
              )}
            </Col>
          </Row>

          <div>
            {customizeCommon(
              {
                code: getPurCustomizeUnitCode('japanDutchRoundListHeaderForm'),
                processUnitTag: 'AF-EXTRA',
              },
              <AFExtra
                dataSet={approvalFormDS}
                cardMaxCount={5}
                underLabel
                fields={[
                  'biddingRoundPrice',
                  'displayBiddingRoundQuotedCount',
                  'quotationStartDate',
                  'quotationEndDate',
                ]}
                fieldsConfig={roundListItemInfoFieldsConfig({ roundRecord: record })}
              />
            )}
          </div>

          <Row
            gutter={8}
            type="flex"
            justify="space-between"
            className={Style['bidding-hall-layout-content-unit-price-list-item-quotation-detail']}
          >
            {!beforeBiddingOnGoingFlag ? (
              <Col span={16}>
                <div className={Style['quotation-detail-text-no-start']}>
                  {intl.get('ssrc.biddingHall.view.message.noStart').d('尚未开始，请耐心等待')}
                </div>
              </Col>
            ) : (
              ''
            )}
          </Row>

          {beforeBiddingOnGoingFlag ? (
            <Row gutter={8} type="flex" justify="space-around">
              {collapseList.includes(biddingRoundDateId) ? (
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
          ) : (
            ''
          )}
        </div>
      );
    },
    [
      japanDutchRoundListDs,
      biddingStatus,
      biddingQuotationMethod, // 竞价方式是 竞价：BIDDING；拍卖：AUCTION
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
    if (!record) {
      return '';
    }

    const biddingRoundStatus = record.get('biddingRoundStatus');
    // 只有序列才需要这样的样式 不同的状态展示不同的样式，使用不同的类名
    let differentStyleClassName = '';
    const showProcessItemFlag = biddingRoundStatus === 'BIDDING_IN_PROGRESS';
    if (biddingRoundStatus === 'BIDDING_PAUSED') {
      differentStyleClassName = 'c7n-collapse-item-unit-price-list-item-paused';
    } else if (showProcessItemFlag) {
      differentStyleClassName = 'c7n-collapse-item-unit-price-list-item-process';
    }

    return differentStyleClassName;
  });

  // 折叠面板点击事件
  const handleChangeCollapse = useCallback((key) => {
    setCollapseList(key);
  });

  // // 分页改变自定义渲染
  // const sizeChangerRenderer = useCallback(({ text }) => {
  //   return `${text} ${intl.get('hzero.c7nUI.Pagination.items_per_page').d('条/页')}`;
  // }, []);

  // // 切换分页
  // const handleChangePage = useCallback(() => {
  //   setItemListLoading(true);
  // }, []);

  // 获取列表 ds loading 状态
  const getItemLineDsStatus = useMemo(() => {
    return japanDutchRoundListDs?.status === 'loading';
  }, [japanDutchRoundListDs?.status]);

  // 供应商排名参数
  const japanDutchPriceRankTableProps = {
    commonProps,
    header,
    initPage,
    toggleLoading,
    fetchBiddingSiteInfo,
    japanDutchRoundListDs,
    biddingRuleDataSet,
    bidCountDataSet,
    headerInfoDS,
    useNewRateFlag,
    rfxHeaderId,
    organizationId,
  };

  return (
    <React.Fragment>
      {/* 注意⚠️：此处的loading必须是手动设置为true 并且ds状态为loading 时才出现加载状态，像websocket这种推送刷新不需要loading */}
      <Spin spinning={getItemLineDsStatus}>
        <div className={Style['pur-main-content-bidding-list-wrapper']}>
          {/* 主内容 */}
          <div
            className={classnames(
              Style['pur-main-content-bidding-list-itemLine-wrapper'],
              Style['pur-main-content-bidding-list-itemLine-wrapper-japan-dutch']
            )}
          >
            {japanDutchRoundListDs?.length ? (
              <div className={Style['pur-main-content-bidding-list-itemLine-table-wrapper']}>
                <Collapse
                  bordered={false}
                  onChange={handleChangeCollapse}
                  activeKey={collapseList}
                  style={{ flex: '1 1 auto', overflow: 'auto', height: '100%' }}
                  trigger={beforeBiddingOnGoingFlag ? 'header' : 'noTrigger'}
                >
                  {japanDutchRoundListDs?.length &&
                    japanDutchRoundListDs?.records?.map((line = {}, index) => (
                      <Panel
                        header={rowRenderer({ index, record: line })}
                        key={line.get('biddingRoundDateId')}
                        showArrow={false}
                        className={getClassName(line)}
                      >
                        {beforeBiddingOnGoingFlag && (
                          <JAPANDUTCHTable record={line} {...japanDutchPriceRankTableProps} />
                        )}
                      </Panel>
                    ))}
                </Collapse>

                {/* <div className={Style['pur-main-content-bidding-list-itemLine-pagination-wrapper']}>
                  <Pagination
                    style={{ textAlign: 'right' }}
                    showPager
                    maxPageSize={100}
                    showTotal={false}
                    dataSet={japanDutchRoundListDs}
                    sizeChangerPosition="right"
                    showSizeChangerLabel={false}
                    sizeChangerOptionRenderer={sizeChangerRenderer}
                    onChange={handleChangePage}
                  />
                </div> */}
              </div>
            ) : (
              ''
            )}

            {!japanDutchRoundListDs?.length ? (
              <div className={Style['list-empty-item-occupied']}>
                <img alt="" src={noDataSvg} />
                <div className={Style['list-empty-item-occupied-text']}>
                  {intl.get('hzero.common.message.data.none').d('暂无数据')}
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      </Spin>
    </React.Fragment>
  );
});

export default JAPANDUTCHList;
