/**
 * 竞价流程节点
 */
import React, { useMemo, useCallback } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { Popover, Steps } from 'choerodon-ui';
import intl from 'utils/intl';
import { Record } from 'choerodon-ui/dataset';
import formatterCollections from 'utils/intl/formatterCollections';

import style from './index.less';

const { Step } = Steps;

const finishSvg = require('@/assets/biddingHall/process-node-finish.svg');
const pauseSvg = require('@/assets/biddingHall/process-node-pause.svg');
const closeSvg = require('@/assets/biddingHall/process-node-close.svg');

const Index = (props) => {
  const { processNodeData, japOrDutchBiddingTotalPrice, } = props;

  const japOrDutchTotalPrice = japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice();

  const { biddingNodeDTOS, biddingStatus, closedDate, autoDeferDuration } =
    processNodeData instanceof Record
      ? processNodeData?.get([
          'biddingNodeDTOS',
          'biddingStatus',
          'closedDate',
          'autoDeferDuration',
        ]) || {}
      : processNodeData || {};

  // 获取当前节点索引
  const currentIndex = useMemo(() => {
    let curIndex = biddingNodeDTOS?.length || -1;
    // eslint-disable-next-line no-unused-expressions
    biddingNodeDTOS?.forEach((item, index) => {
      if (item.currentFlag === 1 || item.pendingFlag === 1) {
        curIndex = index;
      }
    });
    return curIndex;
  }, [biddingNodeDTOS]);

  // 获取流程节点icon
  const getNodeIcon = useCallback((status, index) => {
    const obj = {
      finished: <img src={finishSvg} alt="" />,
      noStart: <span className="node-item-icon-paused">{index + 1}</span>,
      paused: <img src={pauseSvg} alt="" />,
      current: <span className="node-item-icon-current">{index + 1}</span>,
      closed: <img src={closeSvg} alt="" />,
    };
    return obj[status] || '';
  }, []);

  // 获取节点icon
  const getCurrentNodeIcon = useCallback(
    (node, index) => {
      let className = '';
      let nodeIconKey = '';
      if (currentIndex === index && node.pendingFlag !== 1) {
        nodeIconKey = 'current';
        // 当前进行节点
        className = style['process-node-item-current'];
        if (biddingStatus === 'BIDDING_PAUSED') {
          // 当前暂停节点
          nodeIconKey = 'paused';
          className = `${className} ${style['process-node-item-current-paused']}`;
        } else if (biddingStatus === 'BIDDING_CLOSED') {
          // 当前关闭节点
          nodeIconKey = 'closed';
          className = `${className} ${style['process-node-item-current-closed']}`;
        }
      } else if (currentIndex < index || (currentIndex === index && node.pendingFlag === 1)) {
        // 未开始
        nodeIconKey = 'noStart';
        className = style['process-node-item-wait'];
      } else if (currentIndex > index) {
        // 已完成
        nodeIconKey = 'finished';
        className = style['process-node-item-finished'];
      }

      // 节点线特殊处理样式 ps: pendingFlag 指前面的节点线是否需要显示绿色,因此此处判断下一个节点的pendingFlag
      let itemLineClassName = '';
      if (biddingNodeDTOS[index + 1]?.pendingFlag === 1 && biddingStatus === 'BIDDING_PAUSED') {
        itemLineClassName = style['process-node-item-line-current-paused'];
      } else if (biddingNodeDTOS[index + 1]?.pendingFlag === 1) {
        itemLineClassName = style['process-node-item-line-current'];
      }
      return {
        icon: getNodeIcon(nodeIconKey, index),
        nodeClassName: `${className} ${itemLineClassName}`,
        nodeIconKey,
      };
    },
    [currentIndex, biddingStatus, getNodeIcon]
  );

  // 计算运行时间
  const getDurationTime = useCallback((node = {}) => {
    const { startDate, endDate, nodeName } = node || {};

    // 日/荷兰  不需要时间
    if (japOrDutchTotalPrice) {
      return "";
    }

    if (endDate && startDate && moment(endDate).isAfter(startDate)) {
      const startMoment = moment(startDate);
      const endMoment = moment(endDate);
      const day = endMoment.diff(startMoment, 'days');
      const hour = endMoment.diff(startMoment, 'hours') % 24;
      const minute = endMoment.diff(startMoment, 'minutes') % 60;
      if (nodeName === 'DEFER_BIDDING') {
        return autoDeferDuration ? (
          <span className={style['process-node-time-title-running']}>
            ({autoDeferDuration}
            {intl.get('hzero.common.date.unit.minutes').d('分钟')}/
            {intl.get('ssrc.common.view.common.timers').d('次')})
          </span>
        ) : null;
      }
      return day || hour || minute ? (
        <span className={style['process-node-time-title-running']}>
          (
          {`${day > 0 ? `${day}${intl.get('hzero.common.date.unit.day').d('天')}` : ''}${
            hour > 0 ? `${hour}${intl.get('hzero.common.date.unit.hours').d('小时')}` : ''
          }${minute > 0 ? `${minute}${intl.get('hzero.common.date.unit.minutes').d('分钟')}` : ''}`}
          )
        </span>
      ) : null;
    }
  }, [
    japOrDutchTotalPrice,
  ]);

  // 获取节点头标题
  const getTitle = useCallback(
    (node, nodeIconKey) => {
      return (
        <Popover
          content={
            <div className={style['ssrc-pur-node-item-popover-time']}>
              <h4 className={style['ssrc-pur-node-item-popover-time-title']}>
                {node.nodeNameMeaning}
              </h4>
              {!japOrDutchTotalPrice ? (
                <p className={style['ssrc-pur-node-item-popover-time-value']}>
                  {node.startDate ? moment(node.startDate).format('MM-DD HH:mm:ss') : ''}
                  {node.endDate ? ` ～ ${moment(node.endDate).format('MM-DD HH:mm:ss')}` : ''}
                </p>
              ) : ""}
              {/* 关闭的节点显示关闭时间 */}
              {nodeIconKey === 'closed' && closedDate ? (
                <p className={style['ssrc-pur-node-item-popover-time-closed']}>
                  <span className={style['ssrc-pur-node-item-popover-time-closed-label']}>
                    {intl.get('ssrc.biddingHall.view.message.closeDate').d('关闭时间')}
                  </span>
                  <span>{closedDate}</span>
                </p>
              ) : null}
            </div>
          }
        >
          {node.nodeNameMeaning}
          {getDurationTime(node)}
        </Popover>
      );
    },
    [closedDate, getDurationTime, japOrDutchTotalPrice,]
  );

  // 获取每个step
  const getStep = (node, index) => {
    const { icon, nodeClassName, nodeIconKey } = getCurrentNodeIcon(node, index);
    return <Step title={getTitle(node, nodeIconKey)} icon={icon} className={nodeClassName} />;
  };

  return (
    <Steps current={currentIndex} className={style['bidding-process-node-steps']}>
      {biddingNodeDTOS?.map((node, index) => {
        return getStep(node, index);
      })}
    </Steps>
  );
};

export default formatterCollections({
  code: ['hzero.common'],
})(observer(Index));
