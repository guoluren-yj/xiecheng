import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
// import { uniq } from 'lodash';

import { dateFormate } from '@/utils/utils';

import BiddingNodes from './index.js';

/**
 *  关于竞价节点：
        1、序列：维护页面不显示试竞价、正式竞价、延时竞价具体时间；
        2、序列：明细页面发布之后显示具体时间，不显示延时竞价时间；
        3、并行：维护、明细显示具体时间；
    关于并行-延时竞价节点的计算：
        目前：正式竞价截止 + 延时时长 * 延时次数（延时时长和延时次数有1个为空，就不显示延时时间）
        以后：可能改成 正式竞价截止 - 延时触发时间段
      src-29597 更新：
      次序：延时竞价不显示具体时间；
      并行：延时截止时间 = 正式竞价截止时间 + 延时时长；（ps：这个截止时间是大致的，因为供应商报价可能还会触发延时）
 */

// 竞价节点渲染
const RenderBiddingNodes = observer((props = {}) => {
  const { rfxInfoDS } = props || {};

  const record = rfxInfoDS.current || null;
  if (!record) {
    return null;
  }
  const {
    biddingOnlineSignInFlag, // 签到开始标识
    biddingTrialBiddingFlag, // 试竞价标识
    signInStartDate, // 签到开始时间
    signInEndDate, // 签到截止时间
    startingTrialBiddingStartDate, // 试竞价开始时间
    startingTrialBiddingEndDate, // 试竞价截止时间
    // startingTrialBiddingRunningDuration, // 试竞价运行时间
    quotationStartDate, // 正式竞价开始时间
    quotationEndDate, // 正式竞价截止时间
    // quotationRunningDuration, // 正式竞价运行时间
    autoDeferDuration, // 延时时长
    // maxDeferCount, // 最大延时次数
    // quotationInterval, // 报价间隔时间
    quotationOrderType, // 报价次序
    biddingMode, // 竞价模式
    autoDeferFlag, // 自动延时
    rfxStatus,
    // autoDeferPeriod, // 延时触发时间段
    biddingSupplementPriceStartDate,
    biddingSupplementPriceEndDate,
    biddingTarget,
    biddingTotalPricePrinciple,
  } =
    record?.get([
      'biddingOnlineSignInFlag',
      'biddingTrialBiddingFlag',
      'signInStartDate',
      'signInEndDate',
      'startingTrialBiddingStartDate',
      'startingTrialBiddingEndDate',
      // 'startingTrialBiddingRunningDuration',
      'quotationStartDate',
      'quotationEndDate',
      // 'quotationRunningDuration',
      'autoDeferDuration',
      // 'maxDeferCount',
      // 'quotationInterval',
      'quotationOrderType',
      'biddingMode',
      'autoDeferFlag',
      'rfxStatus',
      // 'autoDeferPeriod',
      'biddingSupplementPriceStartDate',
      'biddingSupplementPriceEndDate',
      'biddingTarget',
      'biddingTotalPricePrinciple',
    ]) || {};

  // let acutalStartingTrialBiddingEndDate = startingTrialBiddingEndDate; // 试竞价实际截止时间
  // let actualQuotationStartDate = quotationStartDate; // 正式竞价实际开始时间
  // let acutalQuotationEndDate = quotationEndDate; // 正式竞价实际截止时间
  // let delayNodeDate = null; // 延时时长

  // 物料行数量
  // const itemLineCount =
  //   (itemLineTableDS?.created?.length || 0) + (itemLineTableDS?.totalCount || 0);
  //   if (['RELEASE_REJECTED', 'ROUNDED', 'RELEASE_APPROVING', 'NEW'].includes(rfxStatus)) {
  //     if (
  //       biddingTrialBiddingFlag &&
  //       startingTrialBiddingStartDate
  //     ) {
  //       if (quotationOrderType === 'SEQUENCE' && startingTrialBiddingRunningDuration && itemLineCount && quotationInterval) {
  //         // 真正的试竞价截止时间 开始时间 + (物料数 * 运行时间) + (物料数 * 间隔时间)
  //         acutalStartingTrialBiddingEndDate += moment(startingTrialBiddingStartDate).valueOf() + (itemLineCount * startingTrialBiddingRunningDuration + quotationInterval * (itemLineCount - 1)) * 60 * 1000;
  //         if (
  //           quotationStartDate &&
  //           moment(quotationStartDate).isBefore(acutalStartingTrialBiddingEndDate)
  //         ) {
  //           actualQuotationStartDate = acutalStartingTrialBiddingEndDate;
  //         }
  //       }

  //       // realStartingTrialBiddingEndDate =
  //       //   moment(startingTrialBiddingStartDate).valueOf() +
  //       //   startingTrialBiddingRunningDuration * 60000;
  //       // if (biddingTrialBiddingFlag && realStartingTrialBiddingEndDate && quotationInterval) {
  //       //   // 真正的试竞价截止时间 试开始+ 运行时间 + (物料数 * 间隔时间)
  //       //   if (quotationOrderType === 'SEQUENCE' && itemLineCount) {
  //       //     // 次序
  //       //     realStartingTrialBiddingEndDate += moment(startingTrialBiddingStartDate).valueOf() + (itemLineCount * startingTrialBiddingRunningDuration + quotationInterval * (itemLineCount - 1)) * 60 * 1000;
  //       //   }
  //       //   // else if (quotationOrderType === 'PARALLEL') {
  //       //   //   // 并行
  //       //   //   realStartingTrialBiddingEndDate += quotationInterval * 60 * 1000;
  //       //   // }

  //       // }
  //     }

  //   // 发布之前自己算，发布之后直接取后端的值
  //     if (actualQuotationStartDate) {
  //     if (quotationOrderType === 'SEQUENCE' && quotationRunningDuration && itemLineCount && quotationInterval) {
  //       // 真正的截止时间 开始时间 + (物料数 * 运行时间) + (物料数 * 间隔时间)
  //       acutalQuotationEndDate += moment(actualQuotationStartDate).valueOf() + (itemLineCount * quotationRunningDuration + quotationInterval * (itemLineCount - 1)) * 60 * 1000;
  //     }
  //     // if (quotationRunningDuration) {
  //     //   realQuotationEndTime =
  //     //     moment(quotationStartDate).valueOf() + quotationRunningDuration * 60000;
  //     // } else if (quotationEndDate) {
  //     //   realQuotationEndTime = moment(quotationEndDate).valueOf();
  //     // }
  //     // if (acutalQuotationEndDate && quotationStartDate && quotationInterval) {
  //     //   // 真正的截止时间 开始时间 + (物料数 * 运行时间) + (物料数 * 间隔时间)
  //     //   if (quotationOrderType === 'SEQUENCE' && itemLineCount) {
  //     //     // 次序
  //     //     realQuotationEndTime += moment(quotationStartDate).valueOf() + (itemLineCount * quotationRunningDuration + quotationInterval * (itemLineCount - 1)) * 60 * 1000;
  //     //   }
  //     //   // else if (quotationOrderType === 'PARALLEL') {
  //     //   //   // 并行
  //     //   //   realQuotationEndTime += quotationInterval * 60 * 1000;
  //     //   // }
  //     // }
  //     acutalQuotationEndDate = moment(acutalQuotationEndDate).format(DEFAULT_DATETIME_FORMAT);
  //   }

  //   // 延时节点的时间= 截止时间 - 延时触发时间；（产品更改为正式竞价包含【延时竞价】节点）
  //   // let totalDelayTime = 0;
  //   // if (autoDeferDuration && maxDeferCount && isNumber(maxDeferCount)) {
  //   //   if (quotationOrderType === 'SEQUENCE') {
  //   //     // 次序
  //   //     totalDelayTime = autoDeferDuration * maxDeferCount * itemLineCount * 60 * 1000;
  //   //   } else if (quotationOrderType === 'PARALLEL') {
  //   //     // 并行
  //   //     totalDelayTime = autoDeferDuration * maxDeferCount * 60 * 1000;
  //   //   }
  //   // }
  //   if (autoDeferPeriod && acutalStartingTrialBiddingEndDate) {
  //     delayNodeDate = moment(acutalStartingTrialBiddingEndDate - autoDeferPeriod * 60 * 1000).format(
  //       DEFAULT_DATETIME_FORMAT
  //     );
  //   }
  // }

  // if (autoDeferPeriod && quotationEndDate) {
  //   // 延时竞价 = 正式竞价截止 - 延时触发时间段（产品更改为正式竞价包含【延时竞价】节点） // TODO：此逻辑先保留，后续还会改回来
  //   const delayNodeDateTimestap = moment(quotationEndDate).valueOf() - autoDeferPeriod * 60 * 1000;
  //   if (delayNodeDateTimestap > 0) {
  //     delayNodeDate = moment(delayNodeDateTimestap).format(DEFAULT_DATETIME_FORMAT);
  //   }
  // }

  // 获取月日时分秒
  const getDateExceptYear = useCallback((date) => {
    if (date) {
      if (moment(date).seconds() === 0) {
        return moment(date).format('MM-DD HH:mm');
      }
      return moment(date).format('MM-DD HH:mm:ss');
    }
  }, []);

  // 判断正式竞价开始时间是否和试竞价截止时间或者签到截止时间
  const judgeQuotationEndDateIsEqualToBeforeTime = useCallback(() => {
    // 如果有试竞价，判断试竞价；
    if (biddingTrialBiddingFlag) {
      if (
        (startingTrialBiddingEndDate &&
          moment(quotationStartDate).isSame(startingTrialBiddingEndDate)) ||
        (!startingTrialBiddingEndDate && !quotationStartDate)
      ) {
        return true;
      }
      return false;
    }
    // 否则判断签到
    if (biddingOnlineSignInFlag) {
      if (
        (signInEndDate && moment(quotationStartDate).isSame(signInEndDate)) ||
        (!signInEndDate && !quotationStartDate)
      ) {
        return true;
      }
      return false;
    }
    return false;
  }, [
    biddingTrialBiddingFlag,
    biddingOnlineSignInFlag,
    startingTrialBiddingEndDate,
    quotationStartDate,
    signInEndDate,
  ]);

  // 获取所有节点数据
  const getAllNodeList = () => {
    // 延时相关字段显示标识 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
    const timerToTriggerFlag = biddingMode === 'BRITISH_BIDDING' && autoDeferFlag;
    // 单据如果是以下状态，则代表单子是发布之前，否则代表单子已成功发布
    const newRfxStatus = [
      null,
      undefined,
      'null',
      'undefined',
      'NEW',
      'RELEASE_APPROVING',
      'RELEASE_REJECTED',
      'ROUNDED',
      'CANCELED',
    ].includes(rfxStatus);

    // 显示试竞价、正式竞价、延时竞价具体时间flag 【序列 & 发布之后】｜【并行】
    const showNodeDateFlag =
      (biddingTarget === 'UNIT_PRICE' && quotationOrderType === 'SEQUENCE' && !newRfxStatus) ||
      biddingTarget === 'TOTAL_PRICE' ||
      quotationOrderType === 'PARALLEL';

    // 真正的截止时间
    let realQuotationEndDate = quotationEndDate;
    if (autoDeferFlag && autoDeferDuration && quotationEndDate) {
      // 有延时时 真正的截止时间 = 截止时间 + 延时时长
      realQuotationEndDate = moment(quotationEndDate).add(autoDeferDuration, 'm');
    }

    // 所有时间阶段节点集合
    const nodeList = [];
    // 签到
    if (biddingOnlineSignInFlag && (signInStartDate || signInEndDate)) {
      nodeList.push({
        key: 'sign',
        from: signInStartDate,
        end: signInEndDate,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
      });
    } else if (biddingOnlineSignInFlag) {
      nodeList.push({
        key: 'sign',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
        isNoStart: true,
      });
    }
    /**
     * 1、试竞价存在 & 【试竞价截止 > 试竞价开始】
     * 2、序列：单据发布之后 可以显示试竞价、正式竞价截止时间，不显示延时竞价
     * 3、并行 试竞价、正式竞价、延时竞价都显示具体时间
     */
    if (
      biddingTrialBiddingFlag &&
      (startingTrialBiddingStartDate || startingTrialBiddingEndDate) &&
      showNodeDateFlag
    ) {
      nodeList.push({
        key: 'trailBidding',
        from: startingTrialBiddingStartDate,
        end: startingTrialBiddingEndDate,
        isNoStart:
          (signInEndDate && moment(startingTrialBiddingStartDate).isSame(signInEndDate)) ||
          (!signInEndDate && !startingTrialBiddingStartDate),
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
      });
    } else if (biddingTrialBiddingFlag) {
      nodeList.push({
        key: 'trailBidding',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
        isNoStart: true,
      });
    }
    /**
     * 1、竞价存在 & 【竞价截止 > 竞价开始】
     * 2、序列：单据发布之后 可以显示试竞价、正式竞价截止时间，不显示延时竞价
     * 3、并行 试竞价、正式竞价、延时竞价都显示具体时间
     */
    if (
      (quotationStartDate || quotationEndDate) &&
      // moment(quotationStartDate).isBefore(quotationEndDate) &&
      showNodeDateFlag
    ) {
      nodeList.push({
        key: 'bidding',
        from: quotationStartDate,
        end: quotationEndDate,
        isNoStart: judgeQuotationEndDateIsEqualToBeforeTime(),
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingFormalBidding`).d(`正式竞价`),
      });
    } else {
      nodeList.push({
        key: 'bidding',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingFormalBidding`).d(`正式竞价`),
        isNoStart: true,
      });
    }
    // 如果开启自动延时，才有延时竞价
    if (timerToTriggerFlag) {
      let delayNodeDate = null; // 延时时长
      // ps: 序列的时候不处理，并行的时候算出来
      if (realQuotationEndDate && autoDeferDuration && showNodeDateFlag) {
        if(!newRfxStatus) { // 已经发布过的询价单直接取接口中的quotationEndDate
          delayNodeDate = rfxInfoDS.getState('quotationEndDate');
        } else {
          delayNodeDate = dateFormate(realQuotationEndDate, DEFAULT_DATETIME_FORMAT);
        }
      }
      if (delayNodeDate && moment(delayNodeDate).isAfter(quotationEndDate) && showNodeDateFlag) {
        // 如果
        nodeList.push({
          key: 'biddingDelay',
          end: delayNodeDate,
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.delayBidding`).d(`延时竞价`),
          isNoStart: true,
          lineShape: 'dotted',
        });
      } else {
        nodeList.push({
          key: 'biddingDelay',
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.delayBidding`).d(`延时竞价`),
          isNoStart: true,
          lineShape: 'dotted',
        });
      }
    }
    // 补充单价
    // 补充单价显示逻辑 总价竞价且总价竞价原则为总价必输
    const totalPriceFlag =
      biddingTarget === 'TOTAL_PRICE' && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
    if (totalPriceFlag) {
      if (
        (biddingSupplementPriceStartDate || biddingSupplementPriceEndDate) &&
        // moment(biddingSupplementPriceEndDate).isAfter(biddingSupplementPriceStartDate) &&
        showNodeDateFlag
      ) {
        nodeList.push({
          key: 'biddingSupplementPrice',
          isNoStart:
            realQuotationEndDate &&
            moment(biddingSupplementPriceStartDate).isSame(realQuotationEndDate),
          label: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`)
            .d(`补充单价`),
          from: biddingSupplementPriceStartDate,
          end: biddingSupplementPriceEndDate,
        });
      } else {
        nodeList.push({
          key: 'biddingSupplementPrice',
          label: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`)
            .d(`补充单价`),
          isNoStart: true,
        });
      }
    }
    return nodeList;
  };

  let newNodeList = [];
  // 处理渲染的数据list
  // const getDealNodeList = () => {
  const nodeList = getAllNodeList();
  // 长度 对应rem
  // const lineWidth = {
  //   0: 1.2,
  //   1: 1,
  //   2: 0.8,
  // };
  const keyObj = {};
  // 判断各个时间段大小
  const timeInterval = [];
  // 判断日期是否是同一天 若是同一天则只显示时分秒 否则显示月日时分秒
  let isEveryDateEqual = true;
  nodeList.reduce((pre, cur) => {
    if (
      (pre.from && cur.from && !moment(pre.from).isSame(cur.from, 'day')) ||
      (pre.end && cur.end && !moment(pre.end).isSame(cur.end, 'day')) ||
      (cur.from && cur.end && !moment(cur.from).isSame(cur.end, 'day'))
    ) {
      isEveryDateEqual = false;
    }
    // 将开始时间和结束时间都存在的节点，计算出差值，方便后续计算节点长度； 只有【签到、试竞价、正式竞价】参与计算
    if (cur.key && cur.from && cur.end && ['sign', 'trailBidding', 'bidding'].includes(cur.key)) {
      timeInterval.push({
        key: cur.key,
        timestamp: moment(cur.end).diff(cur.from),
      });
    }
    return cur;
  }, {});

  // 对时间戳进行排序 降序
  timeInterval.sort((a, b) => b.timestamp - a.timestamp);
  // timeInterval.forEach((node, index) => {
  //   keyObj[node.key] = lineWidth[index];
  // });

  // 如果维护的时间是同一天，则只显示时分秒
  if (isEveryDateEqual) {
    newNodeList = nodeList.map((node) => {
      return {
        ...node,
        from: node.from
          ? `${
              moment(node.from).seconds() === 0
                ? moment(node.from).format('HH:mm')
                : moment(node.from).format('HH:mm:ss')
            }`
          : null,
        end: node.end
          ? `${
              moment(node.end).seconds() === 0
                ? moment(node.end).format('HH:mm')
                : moment(node.end).format('HH:mm:ss')
            }`
          : null,
        lineWidth: keyObj[node.key] ?? node.lineWidth,
        tooltipFrom: dateFormate(node.from, DEFAULT_DATETIME_FORMAT),
        tooltipEnd: dateFormate(node.end, DEFAULT_DATETIME_FORMAT),
      };
    });
  } else {
    newNodeList = nodeList.map((node) => {
      return {
        ...node,
        from: getDateExceptYear(node.from),
        end: getDateExceptYear(node.end),
        lineWidth: keyObj[node.key] ?? node.lineWidth,
        tooltipFrom: dateFormate(node.from, DEFAULT_DATETIME_FORMAT),
        tooltipEnd: dateFormate(node.end, DEFAULT_DATETIME_FORMAT),
      };
    });
  }
  // };

  return <BiddingNodes data={newNodeList} />;
});

export default formatterCollections({ code: ['ssrc.inquiryHall'] })(RenderBiddingNodes);
