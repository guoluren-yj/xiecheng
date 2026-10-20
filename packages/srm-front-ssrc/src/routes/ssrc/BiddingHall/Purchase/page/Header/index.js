/**
 * 竞价大厅header内容
 */
import React, { useMemo, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { message, Icon, Popover, Tag, Text, Tooltip } from 'choerodon-ui';
import { DataSet, useModal, Modal, Icon as IconPro } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import { isEmpty, isFunction, noop } from 'lodash';
import { observer } from 'mobx-react';

import notification from 'utils/notification';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';

import biddingHallCommonStyle from '@/routes/ssrc/BiddingHall/biddingHallCommonStyle.less';

import {
  createBeforeDirectController,
  validateBeforeDirectController,
} from '@/services/inquiryHallNewService';
import { getDocumentTypeName, getSourceName } from '@/utils/globalVariable';

import { getPurCustomizeUnitCode } from '@/routes/ssrc/BiddingHall/utils/utils';

// import { PurStatusTag } from '../../../utils/renders';
import { ResumeBid, PauseBid } from './ResumePauseBid';
import { resumeBidDS, pauseBidDS, hangeTimeDS } from './stores/resumePauseBidDS';
import AdjustTime from './AdjustTime';
import {
  reqOpenTrialBidding,
  reqOpenBidding,
  reqStartSupplementPrice,
  reqEndSupplementPrice,
  biddingAdjustTime,
} from '../../api';

import style from '../../index.less';

const loudSpeakSvg = require('@/assets/biddingHall/loud-speaker.svg');
const resumeBiddingSvg = require('@/assets/biddingHall/resume-bidding.svg');
const pauseBiddingSvg = require('@/assets/biddingHall/pause-bidding.svg');
const startCircleSvg = require('@/assets/biddingHall/circle-start.svg');
const stopCircleSvg = require('@/assets/biddingHall/circle-stop.svg');

const Header = (props = {}) => {
  const ModalPro = useModal();
  const { confirm } = Modal;

  const {
    headerInfoDS = {},
    history,
    location,
    submitParams,
    initPage,
    toggleLoading,
    activeTabKey,
    pageLoading,
    closeFullScreen = noop,
    customizeBtnGroup = noop,
    customizeCommon = noop,
    search = '',
    japOrDutchBiddingTotalPrice = noop,
    britishBidding = noop,
    remote,
  } = props || {};

  const japOrDutchBiddingTotalPriceFlag = japOrDutchBiddingTotalPrice();

  const {
    rfxNum,
    rfxTitle,
    biddingStatus,
    currencyCode,
    biddingModeMeaning,
    rfxHeaderId,
    projectLineSectionId,
    roundNumber,
    autoDeferFlag, // 是否启用自动延时
    autoDeferDuration, // 延时时长
    allHeaderDateTime, // 所有阶段的时间
    biddingOnlineSignInFlag, // 签到
    biddingTrialBiddingFlag, // 试竞价
    // deferBiddingAllowedQuotationCount,
    autoDeferTypeMeaning,
    biddingTarget,
    biddingQuotationOrder,
    biddingAllowAdjustTimeFlag,
    biddingAllowAdjustTimeType,
    biddingNodeDTOS,
  } =
    headerInfoDS?.current?.get([
      'rfxNum',
      'rfxTitle',
      'biddingStatus',
      'currencyCode',
      'biddingModeMeaning',
      'rfxHeaderId',
      'projectLineSectionId',
      'roundNumber',
      'autoDeferFlag',
      'autoDeferDuration',
      'allHeaderDateTime',
      'biddingOnlineSignInFlag',
      'biddingTrialBiddingFlag',
      // 'deferBiddingAllowedQuotationCount',
      'autoDeferTypeMeaning',
      'biddingTarget',
      'biddingQuotationOrder',
      'biddingAllowAdjustTimeFlag',
      'biddingAllowAdjustTimeType',
      'biddingNodeDTOS',
    ]) || {};

  const { headerSupplementPriceStartDate, headerSupplementPriceEndDate } = allHeaderDateTime || {};

  // 变更竞价单同步标识
  const controlApiSyncFlagRef = useRef(0);

  // 时间调整
  const adjustTimeDs = useMemo(() => new DataSet(hangeTimeDS()), []);

  /**
   * 轮播延时竞价规则
   * 1.逻辑说明：滚动横条，展示延时竞价规则（延时竞价规则=延时触发时间段+延时触发规则+延时时间规则+延时时长+最大延时次数），比如：距竞价结束10分钟内，如果出现新的报价，竞价截止时间将自动延长5分钟，最多延时3次，最多延时20分钟。
   * 2.每次刷新页面时都要重新生成最新的延时竞价规则展示
   * 3.展示逻辑：启用自动延时为是时，展示该组件
   * 4.内容模板：距竞价结束{$延时触发时间段}分钟内，如果{$延时触发规则(出现新的报价/第一名价格发生变化)}，竞价截止时间将自动延长{$延时时长}分钟，最多延时{$最大延时次数}次。
   * autoDeferFlag--是否启用自动延时
   * 延时竞价阶段，如果出现新报价，竞价截止时间将自动延长5分钟，最多延时10次。其中最多延时X次，数据来源于允许报价次数（延时竞价）。 2023-11-16
   * 逻辑修改请在下方标示：
   */
  const getWheelFragment = () => {
    // 延时竞价阶段，如果出现新的报价时触发自动延时，延时竞价截止时间将自动延长1分钟，最多延时5次，
    const wheelCastMeaning = intl
      .get('ssrc.biddingHall.view.title.deferCountGenerateNewQuotedAndDelay', {
        autoDeferTypeMeaning,
        autoDeferDuration,
      })
      .d(
        `延时竞价阶段，如果出现{autoDeferTypeMeaning}，竞价截止时间将自动延长{autoDeferDuration}分钟`
      );

    // cdp-104981协鑫埋点
    const { handleWheelStyle = undefined } = remote?.props?.process || {};
    const remoteWheelCastMeaning = isFunction(handleWheelStyle)
      ? handleWheelStyle(wheelCastMeaning, { ...props })
      : wheelCastMeaning;
    // const maxDeferCountMeaning = !isNil(deferBiddingAllowedQuotationCount)
    //   ? intl
    //       .get('ssrc.biddingHall.view.title.maxDeferCount', {
    //         maxDeferCount: deferBiddingAllowedQuotationCount,
    //       })
    //       .d('，最多延时{maxDeferCount}次。')
    //   : '。';

    // const suffixText = intl.get('ssrc.biddingHall.view.title.maxCountSourceFromWarning').d('其中最多延时X次,数据来源于允许报价次数(延时竞价)。');

    return (
      !!autoDeferFlag && (
        <span className={classNames(style['broadcast-wrapper'])}>
          <img alt="" src={loudSpeakSvg} className={classNames(style['broadcast-svg'])} />
          <span className={classNames(style['broadcast-words-loop'])}>
            <span className={classNames(style['broadcast-animate'])}>{remoteWheelCastMeaning}</span>
          </span>
        </span>
      )
    );
  };

  // 按钮接口公共参数
  const commonSubmitParams = useMemo(() => {
    return {
      ...(submitParams || {}),
      roundNumber,
      biddingStatus,
    };
  }, [submitParams, roundNumber]);

  // 开始竞价
  const handleResumeBid = useCallback(() => {
    // 开始竞价
    const resumeBidFormDS = new DataSet(resumeBidDS({ submitParams: commonSubmitParams }));
    return ModalPro.open({
      destroyOnClose: true,
      closable: true,
      title: intl.get(`ssrc.biddingHall.view.button.resumeBid`).d('开始竞价'),
      children: <ResumeBid formDS={resumeBidFormDS} />,
      drawer: true,
      style: { width: '380px' },
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk: async () => {
        toggleLoading(true);
        const validate = await resumeBidFormDS.validate();
        if (!validate) {
          toggleLoading(false);
          return false;
        }
        try {
          const res = await resumeBidFormDS.submit();
          if (getResponse(res) && isFunction(initPage)) {
            // 操作成功， 刷新页面
            initPage();
          }
        } catch (e) {
          throw e;
        }
        toggleLoading(false);
      },
      onCancel: () => {
        toggleLoading(false);
      },
      onClose: () => {
        toggleLoading(false);
      },
    });
  }, [commonSubmitParams, biddingStatus, toggleLoading, initPage]);

  // 暂停竞价
  const handlePauseBid = useCallback(() => {
    // 暂停竞价
    const pauseBidFormDS = new DataSet(pauseBidDS({ submitParams: commonSubmitParams }));
    return ModalPro.open({
      destroyOnClose: true,
      closable: true,
      title: intl.get(`ssrc.biddingHall.view.button.PauseBid`).d('暂停竞价'),
      children: <PauseBid formDS={pauseBidFormDS} />,
      drawer: true,
      style: { width: '380px' },
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk: async () => {
        toggleLoading(true);
        const validate = await pauseBidFormDS.validate();
        if (!validate) {
          toggleLoading(false);
          return false;
        }
        try {
          const res = await pauseBidFormDS.submit();
          if (getResponse(res) && isFunction(initPage)) {
            // 操作成功， 刷新页面
            initPage();
          }
        } catch (e) {
          throw e;
        }
        toggleLoading(false);
      },
      onCancel: () => {
        toggleLoading(false);
      },
      onClose: () => {
        toggleLoading(false);
      },
    });
  }, [submitParams, toggleLoading, initPage]);

  // 开启试竞价
  const handleStartTrialBid = useCallback(() => {
    if (japOrDutchBiddingTotalPriceFlag) {
      return;
    }

    let content = '';
    if (biddingStatus === 'SIGNING') {
      content = intl
        .get(`ssrc.biddingHall.view.message.startTrialBidAfterSignIn`)
        .d('当前为签到阶段，确认将签到截止并开启试竞价吗？');
    } else if (biddingStatus === 'TRIAL_BIDDING_NOT_START') {
      content = intl.get(`ssrc.biddingHall.view.message.startTrialBid`).d('确认开启试竞价吗？');
    }
    confirm({
      key: Modal.key(),
      title: intl.get(`ssrc.biddingHall.view.button.startTrialBid`).d('开启试竞价'),
      children: content,
      destroyOnClose: true,
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk() {
        toggleLoading(true);
        return reqOpenTrialBidding(commonSubmitParams).then((res) => {
          if (getResponse(res) && isFunction(initPage)) {
            // 操作成功， 刷新页面
            initPage();
          }
          toggleLoading(false);
        });
      },
      onCancel() {
        toggleLoading(false);
      },
      onClose() {
        toggleLoading(false);
      },
    });
  }, [commonSubmitParams]);

  // 开启正式竞价
  const handleStartBid = useCallback(() => {
    if (japOrDutchBiddingTotalPriceFlag) {
      return;
    }

    let content = '';
    if (biddingStatus === 'SIGNING') {
      content = intl
        .get(`ssrc.biddingHall.view.message.startBidAfterSignIn`)
        .d('当前为签到阶段，确认将签到截止并开启正式竞价吗？');
    } else if (biddingStatus === 'TRIAL_BIDDING') {
      content = intl
        .get(`ssrc.biddingHall.view.message.startBidAfterTrailBid`)
        .d('当前为试竞价阶段，确认将试竞价截止并开启正式竞价吗？');
    } else if (biddingStatus === 'BIDDING_NOT_START') {
      content = intl.get(`ssrc.biddingHall.view.message.startBid`).d('确认开启正式竞价吗？');
    }
    confirm({
      key: Modal.key(),
      title: intl.get(`ssrc.biddingHall.view.button.startFormalBid`).d('开启正式竞价'),
      children: content,
      destroyOnClose: true,
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk() {
        toggleLoading(true);
        return reqOpenBidding(commonSubmitParams).then((res) => {
          if (getResponse(res) && isFunction(initPage)) {
            // 操作成功， 刷新页面
            initPage();
          }
          toggleLoading(false);
        });
      },
      onCancel() {
        toggleLoading(false);
      },
      onClose() {
        toggleLoading(false);
      },
    });
  }, [commonSubmitParams, initPage]);

  // 开启补充单价
  const handleStartBiddingSupplementPrice = useCallback(() => {
    // 竞价单中维护的补充单价开始时间是2023/02/28 19:00，确认提前开始补充单价吗？
    confirm({
      key: Modal.key(),
      title: intl.get(`ssrc.biddingHall.view.button.startBiddingSupplementPrice`).d('开启补充单价'),
      children: intl
        .get(`ssrc.biddingHall.view.message.startBiddingSupplementPrice`, {
          headerSupplementPriceStartDate,
        })
        .d(
          '竞价单中维护的补充单价开始时间是{headerSupplementPriceStartDate}，确认提前开始补充单价吗？'
        ),
      destroyOnClose: true,
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk() {
        toggleLoading(true);
        return reqStartSupplementPrice(commonSubmitParams).then((res) => {
          if (getResponse(res) && isFunction(initPage)) {
            // 操作成功， 刷新页面
            initPage();
          }
          toggleLoading(false);
        });
      },
      onCancel() {
        toggleLoading(false);
      },
      onClose() {
        toggleLoading(false);
      },
    });
  }, [headerSupplementPriceStartDate, commonSubmitParams, initPage, toggleLoading]);

  // 结束补充单价
  const handleStopBiddingSupplementPrice = useCallback(() => {
    confirm({
      key: Modal.key(),
      title: intl.get(`ssrc.biddingHall.view.button.stopBiddingSupplementPrice`).d('结束补充单价'),
      children: intl
        .get(`ssrc.biddingHall.view.message.stopBiddingSupplementPrice`)
        .d(
          '如果您结束补充单价，竞价单将进入下一环节，流程不可逆，请确保所有供应商均已补充单价完成。'
        ),
      destroyOnClose: true,
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk() {
        toggleLoading(true);
        return reqEndSupplementPrice(commonSubmitParams).then((res) => {
          if (getResponse(res) && isFunction(initPage)) {
            // 操作成功， 刷新页面
            initPage();
          }
          toggleLoading(false);
        });
      },
      onCancel() {
        toggleLoading(false);
      },
      onClose() {
        toggleLoading(false);
      },
    });
  }, [headerSupplementPriceEndDate, commonSubmitParams, initPage, toggleLoading]);

  // 变更竞价单
  const handleChangeBid = useCallback(async () => {
    if (!rfxHeaderId) {
      return;
    }

    toggleLoading(true);
    const { organizationId } = commonSubmitParams || {};
    const searchObj = {
      sourcePath: `/pub${activeTabKey}/bidding-hall/${rfxHeaderId}${search}`,
    };
    if (projectLineSectionId) {
      searchObj.projectLineSectionId = projectLineSectionId;
    }
    const biddingSearch = querystring.stringify(searchObj);

    try {
      const result = getResponse(
        await validateBeforeDirectController({
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
        })
      );
      if (result) {
        const onOk = async () => {
          if (controlApiSyncFlagRef.current === 1) {
            return;
          }

          controlApiSyncFlagRef.current = 1;
          const createRes = await createBeforeDirectController({
            organizationId,
            sourceHeaderId: rfxHeaderId,
            sourceFrom: 'RFX',
          });
          controlApiSyncFlagRef.current = 0;
          toggleLoading(false);

          if (createRes) {
            if (!createRes.failed) {
              const url = `${activeTabKey}/new-rfx-detail-controller/${createRes.adjustRecordId}`;
              history.push({
                pathname: url,
                search: biddingSearch,
              });
              closeFullScreen();
            } else {
              message.warning(createRes.message, undefined, undefined, 'top');
            }
          }
        };
        if (result.validateResult === 'createAdjustAgain') {
          confirm({
            key: Modal.key(),
            title: intl
              .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                documentTypeName: getDocumentTypeName(),
                sourceName: getSourceName(),
              })
              .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
            destroyOnClose: true,
            onOk: () => onOk(),
            onCancel: () => {
              toggleLoading(false);
            },
            onClose: () => {
              toggleLoading(false);
            },
          });
        } else if (result.validateResult === 'createAdjust') {
          await onOk();
        } else if (result.validateResult === 'openAdjust') {
          const url = `${activeTabKey}/new-rfx-detail-controller/${result.adjustRecordId}`;
          history.push({
            pathname: url,
            search: biddingSearch,
          });
          closeFullScreen();
        }
      }
    } catch (error) {
      controlApiSyncFlagRef.current = 0;
      toggleLoading(false);
      throw error;
    }
  }, [
    rfxHeaderId,
    projectLineSectionId,
    roundNumber,
    toggleLoading,
    commonSubmitParams,
    history,
    activeTabKey,
    closeFullScreen,
    search,
  ]);

  const adjustTime = async () => {
    const { current } = adjustTimeDs || {};
    const { organizationId } = commonSubmitParams || {};
    if (!current) {
      return false;
    }

    const validate = await adjustTimeDs.validate();
    if (!validate) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
          .d('提交前请填写完整相关信息'),
      });
      return false;
    }

    const formData = current.toData() || {};

    const data = {
      ...formData,
      organizationId,
      rfxHeaderId,
      sourceHeaderId: rfxHeaderId,
      sourceFrom: 'RFX',
    };

    toggleLoading(true);
    let res = null;
    try {
      res = await biddingAdjustTime(data);
      res = getResponse(res);
      toggleLoading(false);
      if (!res) {
        return false;
      }
      if (isFunction(initPage)) {
        // 操作成功， 刷新页面
        initPage();
      }
    } catch (e) {
      throw e;
    }
    toggleLoading(false);
  };

  const adjustTimeModalClose = () => {
    if (!adjustTimeDs) {
      return;
    }

    adjustTimeDs.reset();
  };

  // 时间调整
  const handleChangeTime = useCallback(() => {
    const showAdjustTimeModal = adjustTimeShow();
    if (!showAdjustTimeModal || !headerInfoDS) {
      notification.error({
        message: intl
          .get('ssrc.biddingHall.view.title.currentStatusNoAdjustTime')
          .d('操作失败，失败原因是当前竞价单状态无法调整时间，请检查'),
      });
      return;
    }

    adjustTimeDs.setState('headerInfoDS', headerInfoDS);

    const modalContentProps = {
      headerInfoDS,
      adjustTimeDs,
      rfxHeaderId,
    };

    return ModalPro.open({
      destroyOnClose: true,
      closable: true,
      title: intl.get(`ssrc.biddingHall.view.button.adjustTime`).d('调整时间'),
      children: <AdjustTime {...modalContentProps} />,
      drawer: true,
      style: { width: '380px' },
      okProps: {
        wait: 2000,
        waitType: 'throttle',
      },
      onOk: () => adjustTime(),
      // onCancel: adjustTimeModalClose,
      onClose: adjustTimeModalClose,
    });
  }, [headerInfoDS, adjustTimeDs, commonSubmitParams, adjustTimeShow]);

  /**
   * 1.竞价单：竞价对象=单价+报价次序=并行 / 竞价对象=总价
      2.寻源模板：是否允许调整时间=是+调整时间节点包含【竞价中】
      3.竞价单状态=正式竞价中
  */
  const adjustTimeShow = useCallback(() => {
    const biddingPreviewRuleVisible =
      (biddingTarget === 'UNIT_PRICE' && biddingQuotationOrder === 'PARALLEL') ||
      biddingTarget === 'TOTAL_PRICE';
    const allowAdjustRule =
      biddingAllowAdjustTimeFlag === 1 &&
      biddingAllowAdjustTimeType &&
      biddingAllowAdjustTimeType.includes('BIDDING');
    let formalBidding = false; // 正式竞价

    // 正式竞价阶段显示，因为延时阶段和正式状态一致，用节点
    if (!isEmpty(biddingNodeDTOS)) {
      biddingNodeDTOS.forEach((node) => {
        const { currentFlag, nodeName } = node || {};

        if (currentFlag === 1) {
          formalBidding = nodeName === 'BIDDING';
        }
      });
    }

    const biddingStatusShow = formalBidding && biddingStatus !== 'BIDDING_PAUSED';

    const flag =
      biddingPreviewRuleVisible && allowAdjustRule && biddingStatusShow && britishBidding();

    return flag;
  }, [biddingTarget, biddingQuotationOrder, biddingNodeDTOS]);

  // 按钮组
  const getHeaderButtons = useCallback(() => {
    const waitOptions = {
      waitType: 'throttle',
      wait: 1200,
      funcType: 'flat',
      loading: pageLoading,
      tooltip: 'overflow',
    };

    /**
     * 启动
     * 显示：暂停状态 ｜ 非【结束、关闭】状态
     */
    const resumeBidFlag =
      biddingStatus === 'BIDDING_PAUSED' &&
      ![
        'BIDDING_END',
        'BIDDING_CLOSED',
        'SUPPLEMENT_PRICE_NOT_START',
        'SUPPLEMENT_PRICE_BIDDING',
      ].includes(biddingStatus);

    /**
     * 暂停
     * 单据状态为报价中&当前时间在竞价截止时间之前（竞价截止时间没有值也展示），展示按钮
     * 隐藏：暂停状态、结束状态、关闭状态
     */
    const pauseBidFlag = [
      'BIDDING_PAUSED',
      'BIDDING_END',
      'BIDDING_CLOSED',
      'SUPPLEMENT_PRICE_NOT_START',
      'SUPPLEMENT_PRICE_BIDDING',
    ].includes(biddingStatus);

    /**
     * 开启试竞价
     * ①寻源模板中【试竞价】为是且【在线签到】也为是，当前时间在签到开始之后且在试竞价开始时间之前时才展示
     * ②寻源模板中【试竞价】为是且【在线签到】为否时，当前时间在试竞价开始时间之前时展示
     */
    const startTrialBidFlag =
      biddingTrialBiddingFlag &&
      ['SIGNING', 'TRIAL_BIDDING_NOT_START'].includes(biddingStatus) &&
      biddingStatus !== 'BIDDING_PAUSED';

    /**
     * 开启正式竞价
     * ①寻源模板中【试竞价】为是，当前时间在试竞价开始之后且在竞价开始时间之前时才展示
     * ②寻源模板中【试竞价】为否且【在线签到】为是时，当前时间在签到开始之后且在竞价开始时间之前时才展示
     * ③寻源模板中【试竞价】为否且【在线签到】也为否时，当前时间在竞价开始时间之前时才展示
     */
    const startBidFlag =
      ((!biddingTrialBiddingFlag && biddingOnlineSignInFlag && biddingStatus === 'SIGNING') ||
        ['BIDDING_NOT_START', 'TRIAL_BIDDING'].includes(biddingStatus)) &&
      biddingStatus !== 'BIDDING_PAUSED';

    // 变更竞价单
    const changeBidFlag = ['BIDDING_PAUSED', 'BIDDING_END', 'BIDDING_CLOSED'].includes(
      biddingStatus
    );

    // 补充单价-开始时间显示flag 【补充单价未开始 & 补充单价开始时间存在】
    const startBiddingSupplementPriceFlag =
      biddingStatus === 'SUPPLEMENT_PRICE_NOT_START' && headerSupplementPriceStartDate;

    // 补充单价-开始时间显示flag 【补充单价中 & 补充单价截止时间存在】
    const stopBiddingSupplementPriceFlag =
      biddingStatus === 'SUPPLEMENT_PRICE_BIDDING' && headerSupplementPriceEndDate;

    const adjustTimeBtnShow = adjustTimeShow();

    let buttons = [
      {
        name: 'resumeBid',
        btnType: 'c7n-pro',
        child: (
          <span className={style['header-button']}>
            <img alt="" src={resumeBiddingSvg} className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl.get(`ssrc.biddingHall.view.button.resumeBid`).d('启动')}
            </span>
          </span>
        ),
        hidden: !resumeBidFlag,
        btnProps: {
          ...waitOptions,
          onClick: handleResumeBid,
        },
      },
      {
        // 点击暂停按钮后，竞价单状态变为暂停，同时隐藏暂停按钮。
        name: 'pauseBid',
        btnType: 'c7n-pro',
        hidden: pauseBidFlag,
        child: (
          <span className={style['header-button']}>
            <img alt="" src={pauseBiddingSvg} className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl.get(`ssrc.biddingHall.view.button.PauseBid`).d('暂停')}
            </span>
          </span>
        ),
        btnProps: {
          ...waitOptions,
          onClick: handlePauseBid,
        },
      },
      {
        name: 'startTrialBid',
        btnType: 'c7n-pro',
        hidden: !startTrialBidFlag || japOrDutchBiddingTotalPriceFlag,
        child: (
          <span className={style['header-button']}>
            <img alt="" src={resumeBiddingSvg} className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl.get(`ssrc.biddingHall.view.button.startTrialBid`).d('开启试竞价')}
            </span>
          </span>
        ),
        btnProps: {
          ...waitOptions,
          onClick: handleStartTrialBid,
        },
      },
      {
        name: 'startFormalBid',
        btnType: 'c7n-pro',
        hidden: !startBidFlag || japOrDutchBiddingTotalPriceFlag,
        child: (
          <span className={style['header-button']}>
            <img alt="" src={resumeBiddingSvg} className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl.get(`ssrc.biddingHall.view.button.startFormalBid`).d('开启正式竞价')}
            </span>
          </span>
        ),
        btnProps: {
          ...waitOptions,
          onClick: handleStartBid,
        },
      },
      {
        name: 'startBiddingSupplementPrice',
        btnType: 'c7n-pro',
        hidden: !startBiddingSupplementPriceFlag,
        child: (
          <span className={style['header-button']}>
            <img alt="" src={startCircleSvg} className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl
                .get(`ssrc.biddingHall.view.button.startBiddingSupplementPrice`)
                .d('开启补充单价')}
            </span>
          </span>
        ),
        btnProps: {
          ...waitOptions,
          onClick: handleStartBiddingSupplementPrice,
        },
      },
      {
        name: 'stopBiddingSupplementPrice',
        btnType: 'c7n-pro',
        hidden: !stopBiddingSupplementPriceFlag,
        child: (
          <span className={style['header-button']}>
            <img alt="" src={stopCircleSvg} className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl
                .get(`ssrc.biddingHall.view.button.stopBiddingSupplementPrice`)
                .d('结束补充单价')}
            </span>
          </span>
        ),
        btnProps: {
          ...waitOptions,
          onClick: handleStopBiddingSupplementPrice,
        },
      },
      {
        // 点击跳转到寻源过程控制界面。
        name: 'changeBid',
        btnType: 'c7n-pro',
        child: (
          <span className={style['header-button']}>
            <Icon type="mail_set" className={style['header-button-icon']} />
            <span className={style['header-button-text']}>
              {intl.get(`ssrc.biddingHall.view.button.changeBid`).d('变更竞价单')}
            </span>
          </span>
        ),
        hidden: changeBidFlag,
        btnProps: {
          ...waitOptions,
          onClick: handleChangeBid,
        },
      },
      {
        name: 'adjustTime',
        btnType: 'c7n-pro',
        child: (
          <span className={style['header-button']}>
            <IconPro type="timer" className={style['header-button-icon-small']} />
            <span className={style['header-button-text']}>
              {intl.get(`ssrc.biddingHall.view.button.adjustTime`).d('调整时间')}
            </span>
            <Tooltip
              title={intl
                .get(`ssrc.biddingHall.view.button.adjustTimeBiddingWarning`)
                .d(
                  '用于配置正式竞价时间是否允许调整。仅当竞价对象=单价且报价次序=并行或竞价对象=总价时生效'
                )}
            >
              <IconPro type="help" className={style['header-button-icon-help']} />
            </Tooltip>
          </span>
        ),
        hidden: !adjustTimeBtnShow,
        btnProps: {
          ...waitOptions,
          onClick: handleChangeTime,
        },
      },
    ];

    buttons = remote
      ? remote.process('SSRC_PURCHASE_BIDDING_HALL_HEADER_BUTTONS', buttons, {
          biddingStatus,
          rfxHeaderId,
          sourceCategory: 'RFA',
          biddingTarget,
          location,
          history,
          headerInfoDS,
          biddingNodeDTOS,
          japOrDutchBiddingTotalPriceFlag,
        })
      : buttons;

    return buttons;
  }, [
    rfxHeaderId,
    biddingStatus,
    pageLoading,
    biddingOnlineSignInFlag,
    biddingTrialBiddingFlag,
    headerSupplementPriceStartDate,
    headerSupplementPriceEndDate,
    search,
    adjustTimeShow,
    commonSubmitParams,
    biddingNodeDTOS,
    biddingStatus,
    japOrDutchBiddingTotalPriceFlag,
    remote,
  ]);

  // 竞价单标题
  const biddingTitle = useMemo(() => {
    return rfxNum && rfxTitle ? `${rfxNum}-${rfxTitle}` : rfxNum || rfxTitle;
  }, [rfxNum, rfxTitle]);

  const fieldsConfigs = useMemo(() => {
    const currentFieldsConfigs = {
      rfxNumTitle: {
        hidden: true,
      },
      biddingMode: {
        useLabel: false,
        withoutBg: true,
        render: () => {
          return (
            <Tag color="blue">
              <Text style={{ maxWidth: '.6rem' }}>{biddingModeMeaning}</Text>
            </Tag>
          );
        },
      },
      currencyCode: {
        useLabel: false,
        withoutBg: true,
        render: () => {
          return <Tag color="blue">{currencyCode}</Tag>;
        },
      },
    };

    return currentFieldsConfigs;
  }, [biddingModeMeaning, currencyCode]);

  return (
    <div className={classNames(style['pur-layout-header'])}>
      <div
        className={classNames(
          style['pur-layout-header-left'],
          biddingHallCommonStyle['supplier-bidding-hall-approval-customize-override']
        )}
      >
        <Popover placement="topLeft" content={biddingTitle}>
          <span className={classNames(style['rfxTitle-rfxNum'])}>{biddingTitle}</span>
        </Popover>

        <div>
          {customizeCommon(
            {
              code: getPurCustomizeUnitCode('headerTag'),
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={headerInfoDS}
              titleField="rfxNumTitle"
              tagFields={['biddingMode', 'currencyCode']}
              fieldsConfig={fieldsConfigs}
            />
          )}
        </div>

        {/* <Tag color="blue">
          <Text style={{ maxWidth: '.6rem' }}>{biddingModeMeaning}</Text>
        </Tag>
        <Tag color="blue">{currencyCode}</Tag> */}
        {getWheelFragment()}
      </div>
      <div className={classNames(style['pur-layout-header-right'])}>
        {customizeBtnGroup(
          {
            code: getPurCustomizeUnitCode(['headerButtons']),
            pro: true,
          },
          <DynamicButtons buttons={getHeaderButtons()} trigger="click" />
        )}
      </div>
    </div>
  );
};

export default observer(Header);
