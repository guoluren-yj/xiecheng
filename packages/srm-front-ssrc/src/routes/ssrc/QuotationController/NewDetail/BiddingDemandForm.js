// 竞价要求
import React, { Component } from 'react';
import intl from 'utils/intl';
import { Form, NumberField, DataSet, Select } from 'choerodon-ui/pro';
import { isNil, isEmpty, isFunction } from 'lodash';
import { observer } from 'mobx-react';

import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import { biddingTimeDS, addBiddingTimeDSField } from './BiddingDemandDS';
import {
  StartTimeWrapper,
  EndTimeWrapper,
  QuotationRange,
  ComponentSelectDiffRender,
  ComponentDiffRender,
} from './components/BiddingTime';

import styles from './index.less';

@formatterCollections({
  code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.biddingHall'],
})
@observer
export default class TimeControl extends Component {
  constructor(props) {
    super(props);

    if (props.getTimeController) {
      props.getTimeController(this);
    }

    this.state = {
      config: [], // 配置信息
    };
    this.timeControlDS = new DataSet(biddingTimeDS({ header: props?.header }));
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const { header: prevheader = null } = prevProps;
    const { header = null } = this.props;
    const { adjustRecordId: preAdjustRecordId = null } =
      prevheader?.rfxRequireQuotationAdjustDTO || {};
    const { adjustRecordId } = header?.rfxRequireQuotationAdjustDTO || {};
    return adjustRecordId && adjustRecordId !== preAdjustRecordId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initDSFields();
    }
  }

  componentWillUnmount() {
    this.clearDS();
  }

  clearDS = () => {
    const ds = this.timeControlDS;
    if (ds) {
      ds.reset();
      ds.clear();
      ds.loadData();
    }
  };

  _modal = {};

  clearTimerField = () => {
    this.setState({ config: [] });
  };

  // 竞价单为序列时的提示语
  getMinuteOptions = (payload = {}) => {
    const {
      intlName = intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`), //
      quotationOrderType,
    } = payload || {};
    // 如果报价次序为序列
    let minuteOptions = {};
    if (quotationOrderType === 'SEQUENCE') {
      minuteOptions = {
        help: intl
          .get('ssrc.inquiryHall.model.inquiryHall.quotationRunningTooltip', {
            stageName: intlName,
          })
          .d('当前报价次序为序列，需注意当前维护的是每一个物料的{stageName}运行时间'),
        showHelp: 'tooltip',
      };
    }
    return minuteOptions;
  };

  // 获取对应的渲染组件
  getFieldsComponent = (payload = {}) => {
    const { header, remote } = this.props;
    const { name, disabled, record, dateNowAdjustField, required } = payload || {};
    const { rfxHeaderBaseInfoAdjustDTO = {}, rfxRequirePrequalHeaderAdjustDTO } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};
    const {
      biddingNextStatus, // 单据下一状态
      biddingOnlineSignInFlag, // 签到标识
      biddingTrialBiddingFlag, // 试竞价标识
      quotationOrderType, // 报价次序
      autoDeferFlag, // 是否启用自动延时
    } = rfxHeaderBaseInfoDTO || {};

    const {
      signInStartFlag,
      signInRunningDurationFlag,
      startingTrialBiddingStartFlag,
      startingTrialBiddingRunningDurationFlag,
      startFlag,
      biddingSupplementPriceStartFlag,
      biddingSupplementPriceRunningDurationFlag,
    } = record.get([
      'signInStartFlag',
      'signInRunningDurationFlag',
      'startingTrialBiddingStartFlag',
      'startingTrialBiddingRunningDurationFlag',
      'startFlag',
      'biddingSupplementPriceStartFlag',
      'biddingSupplementPriceRunningDurationFlag',
    ]);

    const timeComponentsProps = {
      remote,
      header,
    };

    // 是否有资格预审
    const preQualificationFlag =
      rfxRequirePrequalHeaderAdjustDTO && !isEmpty(rfxRequirePrequalHeaderAdjustDTO);

    // 正式竞价开始时间下拉框
    const optionsObj = {
      defaultOption: {
        value: 0,
        text: intl.get('ssrc.common.view.selectCustomDateTime').d('自定义时间'),
      },
      defaultEndOption: {
        value: 0,
        text: intl.get('ssrc.common.view.endTime').d('截止时间'),
      },
      value1: {
        value: 1,
        text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
      },
      value2: {
        value: 1,
        text: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startAfterPreQualificationEnd`)
          .d('资格预审截止即开始'),
      },
      value3: {
        value: 1,
        text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startAfterSignIn`).d('签到截止即开始'),
      },
      value4: {
        value: 1,
        text: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startAfterTrialBiddingEnd`)
          .d('试竞价截止即开始'),
      },
      value5: {
        value: 2,
        text: intl.get('ssrc.quoController.view.selectEndByPublish').d('发布即截止'),
      },
      value6: {
        value: 1,
        text: intl.get('ssrc.common.view.runningDurationTime').d('运行时间'),
      },
      value7: {
        // 此处的发布即开始 与维护的发布即开始 意义不一样
        value: 2,
        text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
      },
      value8: {
        value: 1,
        text: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startAfterQuotationEnd`)
          .d('竞价截止即开始'),
      },
    };

    let selectionOptions = [];
    if (name === 'signInStartDate') {
      selectionOptions = [optionsObj.defaultOption];
      if (biddingNextStatus === 'SIGN_START') {
        if (name === dateNowAdjustField && !signInStartFlag) {
          record.set({
            signInStartFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'signInStartFlag',
          });
        }
        selectionOptions = [...selectionOptions, optionsObj.value7];
      } else if (!preQualificationFlag) {
        selectionOptions = [...selectionOptions, optionsObj.value1];
      }
      return {
        renderer: (
          <StartTimeWrapper
            name="signStartWrapper"
            flagField="signInStartFlag"
            startField="signInStartDate"
            endFlagField="signInRunningDurationFlag"
            endDurationField="signInRunningDuration"
            endTimeField="signInEndDate"
            record={record}
            hidden={!biddingOnlineSignInFlag}
            selectionOptions={selectionOptions}
            disabled={disabled}
            historyDTO="rfxRequireQuotationDTO"
            {...timeComponentsProps}
          />
        ),
      };
    }

    if (['signInEndDate', 'signInRunningDuration'].includes(name)) {
      selectionOptions = [optionsObj.defaultEndOption];
      if (biddingNextStatus === 'SIGN_END') {
        if (name === dateNowAdjustField && !signInRunningDurationFlag) {
          record.set({
            signInRunningDurationFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'signInRunningDurationFlag',
          });
        }
        selectionOptions = [...selectionOptions, optionsObj.value5, optionsObj.value6];
      } else {
        selectionOptions = [...selectionOptions, optionsObj.value6];
      }
      return {
        renderer: (
          <>
            <EndTimeWrapper
              title={intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`)}
              name="signEndWrapper"
              flagField="signInRunningDurationFlag"
              timeField="signInEndDate"
              durationField="signInRunningDuration"
              dayField="signInRunningDay"
              hourField="signInRunningHour"
              minuteField="signInRunningMinute"
              startField="signInStartDate"
              record={record}
              hidden={!biddingOnlineSignInFlag}
              selectionOptions={selectionOptions}
              disabled={disabled}
              historyDTO="rfxRequireQuotationDTO"
              {...timeComponentsProps}
            />
            {/* 占位符 */}
            <div name="signInEndDateField_1_3" fieldClassName="td-no-visible" />
          </>
        ),
      };
    }

    if (name === 'startingTrialBiddingStartDate') {
      selectionOptions = [optionsObj.defaultOption];
      if (biddingNextStatus === 'TRIAL_BIDDING_START') {
        if (name === dateNowAdjustField && !startingTrialBiddingStartFlag) {
          record.set({
            startingTrialBiddingStartFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'startingTrialBiddingStartFlag',
          });
        }
        selectionOptions = [...selectionOptions, optionsObj.value7];
      } else if (biddingOnlineSignInFlag) {
        selectionOptions = [...selectionOptions, optionsObj.value3];
      } else if (!preQualificationFlag) {
        selectionOptions = [...selectionOptions, optionsObj.value1];
      }
      return {
        renderer: (
          <StartTimeWrapper
            hidden={!biddingTrialBiddingFlag}
            name="startingBiddingWrapper"
            flagField="startingTrialBiddingStartFlag"
            startField="startingTrialBiddingStartDate"
            endFlagField="startingTrialBiddingRunningDurationFlag"
            endDurationField="startingTrialBiddingRunningDuration"
            endTimeField="startingTrialBiddingEndDate"
            record={record}
            selectionOptions={selectionOptions}
            disabled={disabled}
            historyDTO="rfxRequireQuotationDTO"
            {...timeComponentsProps}
          />
        ),
      };
    }

    // 试竞价截止、运行时间
    if (['startingTrialBiddingEndDate', 'startingTrialBiddingRunningDuration'].includes(name)) {
      selectionOptions = [optionsObj.value6];
      if (quotationOrderType !== 'SEQUENCE' || disabled) {
        // 报价次序为序列
        selectionOptions = [optionsObj.defaultEndOption, ...selectionOptions];
      }
      if (biddingNextStatus === 'TRIAL_BIDDING_END') {
        // 单据下一状态为试竞价截止
        if (name === dateNowAdjustField && !startingTrialBiddingRunningDurationFlag) {
          record.set({
            startingTrialBiddingRunningDurationFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'startingTrialBiddingRunningDurationFlag',
          });
        }
        selectionOptions = [...selectionOptions, optionsObj.value5];
      }
      return {
        renderer: (
          <>
            <EndTimeWrapper
              title={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`)
                .d(`试竞价`)}
              name="startingBiddingEndWrapper"
              flagField="startingTrialBiddingRunningDurationFlag"
              timeField="startingTrialBiddingEndDate"
              durationField="startingTrialBiddingRunningDuration"
              dayField="startingBiddingRunningDay"
              hourField="startingBiddingRunningHour"
              minuteField="startingBiddingRunningMinute"
              startField="startingTrialBiddingStartDate"
              record={record}
              hidden={!biddingTrialBiddingFlag}
              minuteOptions={this.getMinuteOptions({
                intlName: intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`)
                  .d(`试竞价`),
                quotationOrderType,
              })}
              selectionOptions={selectionOptions}
              disabled={disabled}
              historyDTO="rfxRequireQuotationDTO"
              {...timeComponentsProps}
            />
            {/* 占位符 */}
            <div name="startingTrialBiddingEndDateField_2_3" fieldClassName="td-no-visible" />
          </>
        ),
      };
    }

    // 正式竞价开始时间
    if (name === 'quotationStartDate') {
      selectionOptions = [optionsObj.defaultOption];
      if (biddingNextStatus === 'BIDDING_START') {
        // 正式竞价未开始
        if (name === dateNowAdjustField && !startFlag) {
          record.set({
            startFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'startFlag',
          });
        }
        selectionOptions = [...selectionOptions, optionsObj.value7];
      } else if (biddingTrialBiddingFlag) {
        selectionOptions = [...selectionOptions, optionsObj.value4];
      } else if (biddingOnlineSignInFlag) {
        selectionOptions = [...selectionOptions, optionsObj.value3];
      } else if (!preQualificationFlag) {
        selectionOptions = [...selectionOptions, optionsObj.value1];
      }
      return {
        renderer: (
          <StartTimeWrapper
            name="biddingStartFlagWrap"
            flagField="startFlag"
            startField="quotationStartDate"
            endFlagField="startingBiddingRunningDurationFlag"
            endDurationField="quotationRunningDuration"
            endTimeField="quotationEndDate"
            record={record}
            selectionOptions={selectionOptions}
            disabled={disabled}
            historyDTO="rfxRequireQuotationDTO"
            {...timeComponentsProps}
          />
        ),
      };
    }

    // 正式竞价截止运行时间
    if (['quotationEndDate', 'quotationRunningDuration'].includes(name)) {
      selectionOptions = [optionsObj.value6];
      if (quotationOrderType !== 'SEQUENCE' || disabled) {
        // 报价次序不为序列时 或者是报价次序为序列并且是禁用状态可以显示自定义时间选择框
        selectionOptions = [optionsObj.defaultEndOption, ...selectionOptions];
      }
      return {
        renderer: (
          <>
            <EndTimeWrapper
              title={intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`)}
              name="biddingEndWrap"
              flagField="startingBiddingRunningDurationFlag"
              timeField="quotationEndDate"
              durationField="quotationRunningDuration"
              dayField="biddingRunnintDay"
              hourField="biddingRunnintHour"
              minuteField="biddingRunnintMinute"
              record={record}
              startField="quotationStartDate"
              hiddenEndDate={quotationOrderType === 'SEQUENCE'} // 如果竞价次序为序列 隐藏截止时间
              minuteOptions={this.getMinuteOptions({
                intlName: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
                quotationOrderType,
              })}
              selectionOptions={selectionOptions}
              disabled={disabled}
              historyDTO="rfxRequireQuotationDTO"
              {...timeComponentsProps}
            />
            {/* 占位符 */}
            <div name="quotationEndDateField_3_3" fieldClassName="td-no-visible" />
          </>
        ),
      };
    }

    // 补充单价开始时间
    if (name === 'biddingSupplementPriceStartDate') {
      selectionOptions = [optionsObj.value8];
      if (biddingNextStatus === 'SUPPLEMENT_PRICE_START') {
        // 补充单价未开始
        // 发布即开始是此字段并且非自定义时间，手动设置值为发布即开始
        if (name === dateNowAdjustField && !biddingSupplementPriceStartFlag) {
          record.set({
            biddingSupplementPriceStartFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'biddingSupplementPriceStartFlag',
          });
        }
        selectionOptions = [optionsObj.defaultOption, optionsObj.value7];
      } else if (!autoDeferFlag || disabled) {
        // 自动延时为否 或者 禁用状态
        selectionOptions = [optionsObj.defaultOption, ...selectionOptions];
      }
      return {
        renderer: (
          <StartTimeWrapper
            name="biddingSupplementPriceStartWrap"
            flagField="biddingSupplementPriceStartFlag"
            startField="biddingSupplementPriceStartDate"
            endFlagField="biddingSupplementPriceRunningDurationFlag"
            endDurationField="biddingSupplementPriceRunningDuration"
            endTimeField="biddingSupplementPriceEndDate"
            record={record}
            selectionOptions={selectionOptions}
            disabled={disabled}
            historyDTO="rfxRequireQuotationDTO"
          />
        ),
      };
    }

    // 补充单价截止、运行时间
    if (['biddingSupplementPriceEndDate', 'biddingSupplementPriceRunningDuration'].includes(name)) {
      selectionOptions = [optionsObj.value6];
      if (biddingNextStatus === 'SUPPLEMENT_PRICE_END') {
        // 下一状态 补充单价截止
        if (name === dateNowAdjustField && !biddingSupplementPriceRunningDurationFlag) {
          record.set({
            biddingSupplementPriceRunningDurationFlag: 2,
            nowAdjustedFieldTimeSelectFlagField: 'biddingSupplementPriceRunningDurationFlag',
          });
        }
        // 不为自动延时，可以选择自定义时间
        if (!autoDeferFlag) {
          selectionOptions = [optionsObj.defaultEndOption, ...selectionOptions, optionsObj.value5];
        } else {
          selectionOptions = [...selectionOptions, optionsObj.value5];
        }
      } else if (!autoDeferFlag || disabled) {
        // 如果单据不为自动延时 或者 是禁用状态 或者是正式竞价截止时间已过，选择框可为自定义时间
        selectionOptions = [optionsObj.defaultEndOption, ...selectionOptions];
      }
      return {
        renderer: (
          <>
            <EndTimeWrapper
              title={intl
                .get('ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice')
                .d('补充单价')}
              name="biddingSupplementPriceEndWrap"
              flagField="biddingSupplementPriceRunningDurationFlag"
              timeField="biddingSupplementPriceEndDate"
              durationField="biddingSupplementPriceRunningDuration"
              dayField="biddingSupplementPriceRunnintDay"
              hourField="biddingSupplementPriceRunnintHour"
              minuteField="biddingSupplementPriceRunnintMinute"
              record={record}
              startField="biddingSupplementPriceStartDate"
              selectionOptions={selectionOptions}
              disabled={disabled}
              historyDTO="rfxRequireQuotationDTO"
            />
            {/* 占位符 */}
            <div name="biddingSupplementPriceEndDateField_4_3" fieldClassName="td-no-visible" />
          </>
        ),
      };
    }

    // 剩下普通的可以加在后面
    const surplusObj = {
      quotationInterval: {
        renderer: (
          <ComponentDiffRender
            record={record}
            historyDTO="rfxRequireQuotationDTO"
            name="quotationInterval"
          >
            <NumberField name="quotationInterval" />
          </ComponentDiffRender>
        ),
        dsFieldProps: {
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`).d('报价间隔时间'),
          name: 'quotationInterval',
          type: 'number',
          step: 1,
          min: 1,
        },
      },
      bargainEndDate: (() => {
        // 如果选择的是发布即截止，则保存后依然是发布即截止，否则自定义时间
        if (dateNowAdjustField?.indexOf(name) > -1) {
          record.set({
            bargainEndDateCustomFlag: 2,
          });
        } else {
          record.set({
            bargainEndDateCustomFlag: 0,
          });
        }
        return {
          renderer: (
            <EndTimeWrapper
              name="bargainEndDateEndWrap"
              flagField="bargainEndDateCustomFlag" // 自定义flag，后端无此字段
              timeField="bargainEndDate"
              record={record}
              selectionOptions={[optionsObj.defaultOption, optionsObj.value5]}
              disabled={disabled}
              historyDTO="rfxRequireQuotationDTO"
              customFakeFlag
            />
          ),
          dsFieldProps: {
            // ds相关配置
            name,
            label: intl
              .get(`ssrc.quoController.model.quoController.bargainEndDate`)
              .d('议价截止时间'),
            disabled,
            dynamicProps: {
              required({ record: rd }) {
                const currentField = rd.dataSet.getField(name);
                if (!currentField || disabled) {
                  return false;
                }
                // 自定义议价截止时间flag
                const bargainEndDateCustomFlag = record.get('bargainEndDateCustomFlag');
                return bargainEndDateCustomFlag === 0 && required;
              },
              min({ record: rd }) {
                const currentField = rd.dataSet.getField(name);
                if (!currentField || disabled) {
                  return false;
                }
                // 自定义议价截止时间flag
                const bargainEndDateCustomFlag = record.get('bargainEndDateCustomFlag');
                return bargainEndDateCustomFlag === 0 ? new Date() : null;
              },
            },
          },
        };
      })(),
      autoDeferDuration: {
        renderer: (
          <ComponentDiffRender
            record={record}
            historyDTO="rfxRequireQuotationDTO"
            name="autoDeferDuration"
          >
            <NumberField
              name="autoDeferDuration"
              addonAfter={intl
                .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
                .d('分钟')}
            />
          </ComponentDiffRender>
        ),
        dsFieldProps: {
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
          name: 'autoDeferDuration',
          type: 'number',
          step: 1,
          min: 1,
        },
      },
    };

    return surplusObj[name];
  };

  // 运行时间转换时分秒
  durationTimeToDayHourMinute = (payload = {}) => {
    const { runningDurationTime, dayField, hourField, minuteField } = payload || {};
    if ((!runningDurationTime && runningDurationTime !== 0) || runningDurationTime < 0) {
      return {};
    }
    const day = Math.floor(runningDurationTime / 1440);
    const hour =
      day > 0
        ? Math.floor((runningDurationTime - day * 1440) / 60)
        : runningDurationTime
        ? Math.floor(runningDurationTime / 60)
        : runningDurationTime;
    let minute = runningDurationTime;
    // 分钟需做特殊判断，可能存在小数点后很多位或者除不尽的情况，导致没有变更但页面对比不一致会标红的情况
    if (hour > 0 || day > 0) {
      minute = runningDurationTime - day * 1440 - hour * 60;
      if (minute) {
        // 因为分钟保留1位，所以此处需要先将数据处理小数点后1位
        minute = math.toFixed(runningDurationTime - day * 1440 - hour * 60, 1);
        const digitNumber = math.dp(minute);
        if (math.dp(minute) < 1) {
          // 再判断小数点后有效位数是否大于1，若小于1，只取有效位数
          minute = math.toFixed(minute, digitNumber);
        }
      }
    }
    return {
      [dayField]: day || null,
      [hourField]: hour || null,
      [minuteField]: minute || null,
    };
  };

  // 处理当前和历史时间数据
  dealCurrentAndHistoryTime = (payload = {}) => {
    const {
      signInRunningDuration,
      startingTrialBiddingRunningDuration,
      quotationRunningDuration,
      biddingSupplementPriceRunningDuration,
    } = payload || {};

    // 签到运行时间 时、分、秒
    let signInRunningDurationObj = {};
    // 试竞价运行时间 时、分、秒
    let startingTrialBiddingRunningDurationObj = {};
    // 正式竞价运行时间 时、分、秒
    let quotationRunningDurationObj = {};
    // 补充单价运行时间 时、分、秒
    let biddingSupplementPriceRunningDurationObj = {};

    if (!isNil(signInRunningDuration)) {
      // 计算时分秒
      signInRunningDurationObj = this.durationTimeToDayHourMinute({
        runningDurationTime: signInRunningDuration,
        dayField: 'signInRunningDay',
        hourField: 'signInRunningHour',
        minuteField: 'signInRunningMinute',
      });
    }
    if (!isNil(startingTrialBiddingRunningDuration)) {
      startingTrialBiddingRunningDurationObj = this.durationTimeToDayHourMinute({
        runningDurationTime: startingTrialBiddingRunningDuration,
        dayField: 'startingBiddingRunningDay',
        hourField: 'startingBiddingRunningHour',
        minuteField: 'startingBiddingRunningMinute',
      });
    }
    if (!isNil(quotationRunningDuration)) {
      quotationRunningDurationObj = this.durationTimeToDayHourMinute({
        runningDurationTime: quotationRunningDuration,
        dayField: 'biddingRunnintDay',
        hourField: 'biddingRunnintHour',
        minuteField: 'biddingRunnintMinute',
      });
    }
    if (!isNil(biddingSupplementPriceRunningDuration)) {
      biddingSupplementPriceRunningDurationObj = this.durationTimeToDayHourMinute({
        runningDurationTime: biddingSupplementPriceRunningDuration,
        dayField: 'biddingSupplementPriceRunnintDay',
        hourField: 'biddingSupplementPriceRunnintHour',
        minuteField: 'biddingSupplementPriceRunnintMinute',
      });
    }
    return {
      ...signInRunningDurationObj,
      ...startingTrialBiddingRunningDurationObj,
      ...quotationRunningDurationObj,
      ...biddingSupplementPriceRunningDurationObj,
    };
  };

  /**
   * 处理数据
   */
  dealDTOData = () => {
    const { header } = this.props;
    const { rfxRequireQuotationAdjustDTO } = header || {};
    const { rfxRequireQuotationDTO = {} } = rfxRequireQuotationAdjustDTO || {};

    // 处理当前运行时间数据
    const currentDurationTime = this.dealCurrentAndHistoryTime(rfxRequireQuotationAdjustDTO);
    // 处理历史运行时间数据
    const historyDurationTime = this.dealCurrentAndHistoryTime(rfxRequireQuotationDTO);

    // 历史数据DTO
    const historyDTOResult = {
      ...rfxRequireQuotationDTO,
      ...historyDurationTime,
      bargainEndDateCustomFlag: 0, // 自定义议价截止时间flag，后端无此字段，纯前端显示使用
    };
    return {
      ...rfxRequireQuotationAdjustDTO,
      ...currentDurationTime,
      rfxRequireQuotationDTO: historyDTOResult,
      ssrcCustomCurrentNewDateTime: new Date(), // 前端自定义时间，用来记录当前时间
    };
  };

  // 设置时间
  setDayHourMinuteTime = (payload = {}) => {
    const { record, ...otherPayload } = payload || {};
    if (record) {
      const result = this.durationTimeToDayHourMinute(otherPayload);
      record.set(result || {});
    }
  };

  // 特殊处理字段
  getConfigData = (payload) => {
    const { rfxHeaderBaseInfoDTO } = payload || {};
    const { biddingOnlineSignInFlag, biddingTrialBiddingFlag } = rfxHeaderBaseInfoDTO || {};
    // 需要特殊处理的值
    const configData = {
      biddingOnlineSignInFlag,
      biddingTrialBiddingFlag,
    };
    return configData;
  };

  // 初始化ds
  @Bind()
  initDSFields() {
    const { header } = this.props;
    const {
      rfxRequireQuotationAdjustDTO,
      rfxHeaderBaseInfoAdjustDTO = {},
      rfxRequirePrequalHeaderAdjustDTO,
    } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};
    const {
      biddingStatus, // 单据状态
    } = rfxHeaderBaseInfoDTO || {};

    if (isEmpty(rfxRequireQuotationAdjustDTO)) {
      return;
    }
    if (rfxRequirePrequalHeaderAdjustDTO && !isEmpty(rfxRequirePrequalHeaderAdjustDTO)) {
      // 后端说根据这个dto是否有值去判断资格预审是否存在
      this.timeControlDS.setQueryParameter('preQualificationObj', {
        preQualificationFlag: 1,
        getPrequalEndDate: this.getPrequalEndDate,
      });
    }
    this.timeControlDS.setQueryParameter('headerBaseInfo', rfxHeaderBaseInfoDTO);
    const curStatusFlag = [
      'SUPPLEMENT_PRICE_NOT_START',
      'SUPPLEMENT_PRICE_BIDDING',
      'BIDDING_END',
    ].includes(biddingStatus); // 若正式竞价已截止【补充单价未开始、补充单价中、结束】竞价规则不显示
    this.timeControlDS.setQueryParameter('showRuleFormFlag', !curStatusFlag); // 根据状态是否显示竞价规则表单
    const { fieldPropertyDTOList = [], nowAdjustedField: dateNowAdjustField = null } =
      rfxRequireQuotationAdjustDTO || {};
    const newRfxRequireQuotationAdjustDTO = this.dealDTOData() || {};

    const configData = this.getConfigData({ rfxHeaderBaseInfoDTO, dateNowAdjustField });

    const newData = { ...newRfxRequireQuotationAdjustDTO, ...configData };
    this.timeControlDS.loadData([newData]);

    const curRecord = this.timeControlDS?.current;

    const newFieldPropertyDTOList = [];

    fieldPropertyDTOList.forEach((field) => {
      const { name, visible = 0, value: defaultValue = null, required = 0, disabled } = field || {};
      if (!visible || name === 'clarifyEndDate') return;
      const { renderer, dsFieldProps } =
        this.getFieldsComponent({
          name,
          disabled,
          required,
          record: curRecord,
          dateNowAdjustField,
        }) || {};
      const newField = { ...field, ...{ renderer }, defaultValue };
      newFieldPropertyDTOList.push(newField);
      // 根据条件动态添加字段
      if (isFunction(addBiddingTimeDSField)) {
        addBiddingTimeDSField({
          timeControlDS: this.timeControlDS,
          field,
        });
      }
      // 议价截止时间
      if (name === 'bargainEndDate') {
        // eslint-disable-next-line no-unused-expressions
        this.timeControlDS.addField(name, dsFieldProps || {});
        this.timeControlDS.addField('bargainEndDateCustomFlag', {
          label: intl.get('ssrc.common.view.bargainPrice').d('议价'),
          defaultValue: 0,
        });
        return;
      }
      // 如果ds中没有field，则动态添加
      if (!this.timeControlDS.getField(name)) {
        // eslint-disable-next-line no-unused-expressions
        this.timeControlDS.addField(name, dsFieldProps || {});
      }
    });

    this.setState({
      config: newFieldPropertyDTOList,
    });
    this.forceUpdate();
  }

  @Bind()
  getPrequalEndDate() {
    const { preQualificationRef } = this.props || {};
    const prequalEndDate = preQualificationRef?.prequalificationDS?.current?.get('prequalEndDate');
    return prequalEndDate;
  }

  @Bind()
  renderFields() {
    const { config = [] } = this.state;
    const record = this.timeControlDS?.current;
    if (!record || !config) return;

    const fields = config.map((field) => {
      const { visible = 0, renderer } = field;
      if (!visible) {
        return null;
      }
      return renderer;
    });
    return fields?.filter(Boolean);
  }

  // 出价策略字段过滤
  filterBiddingStrategyOption = ({
    optionRecord,
    biddingQuotationMethod,
    // auctionRule,
    openRule,
  } = {}) => {
    const optionValue = optionRecord.get('value') || null;

    // biddingQuotationMethod - 竞价方式：竞价（BIDDING）｜ 拍卖（AUCTION）
    // 如果出价策略是低于最低价，高于最高价 &（【公开规则是隐藏身份隐藏报价、公开身份隐藏报价】｜【竞价规则是所有排名允许报相同价格、前三名不允许报相同价格】）则出价策略不可选择
    const hiddenSelectFlag =
      // ['NONE', 'TOP_THREE'].includes(auctionRule) ||
      ['HIDE_IDENTITY_HIDE_QUOTE', 'OPEN_IDENTITY_HIDE_QUOTE'].includes(openRule);
    if (biddingQuotationMethod === 'BIDDING') {
      // 竞价方式为竞价
      if (hiddenSelectFlag && optionValue === 'BELOW_THE_LOWEST_PRICE') return false;
      return ['BELOW_THE_LOWEST_PRICE', 'LOWER_THAN_LAST_QUOTE'].includes(optionValue);
    } else if (biddingQuotationMethod === 'AUCTION') {
      // 竞价方式为拍卖
      if (hiddenSelectFlag && optionValue === 'ABOVE_MAXIMUM_PRICE') return false;
      return ['ABOVE_MAXIMUM_PRICE', 'ABOVE_THAN_LAST_QUOTE'].includes(optionValue);
    }
    return optionValue;
  };

  // 渲染竞价规则表单节点
  renderBiddingRuleForm = () => {
    const record = this.timeControlDS?.current;
    if (!record) return;
    const { header } = this.props;
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};

    const {
      biddingMode, // 竞价模式
      biddingTarget, // 报价类型是 总价竞价还是单价竞价
      biddingQuotationMethod, // 竞价方式：竞价（BIDDING）｜ 拍卖（AUCTION）
      // auctionRule, // 竞价规则
      openRule, // 数据公开规则
      biddingTotalPricePrinciple, // 总价竞价规则
    } = rfxHeaderBaseInfoDTO || {};

    // 【竞价模式】是英式竞价且【报价类型】为总价竞价
    const biddingTotalPriceFlag =
      biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'TOTAL_PRICE';
    // 总价 - 总价必输
    const totalRequiredFlag =
      biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && biddingTarget === 'TOTAL_PRICE';

    return [
      <ComponentSelectDiffRender
        key="biddingStrategy"
        record={record}
        historyDTO="rfxRequireQuotationDTO"
        name="biddingStrategy"
      >
        <Select
          name="biddingStrategy"
          optionsFilter={(optionRecord) =>
            this.filterBiddingStrategyOption({
              optionRecord,
              biddingQuotationMethod,
              // auctionRule,
              openRule,
            })
          }
        />
      </ComponentSelectDiffRender>,
      !!biddingTotalPriceFlag && (
        <QuotationRange
          name="quotationRange"
          record={record}
          historyDTO="rfxRequireQuotationDTO"
          type="totalPrice"
        />
      ),
      !!biddingTotalPriceFlag && (
        <ComponentDiffRender
          key="safePrice"
          record={record}
          historyDTO="rfxRequireQuotationDTO"
          name="safePrice"
        >
          <C7nPrecisionInputNumber
            name="safePrice"
            record={record}
            dataSet={this.timeControlDS}
            financial="currencyCode"
            omitZeroFlag
          />
        </ComponentDiffRender>
      ),
      !!totalRequiredFlag && (
        <ComponentDiffRender
          key="biddingSpreadPrice"
          record={record}
          historyDTO="rfxRequireQuotationDTO"
          name="biddingSpreadPrice"
        >
          <C7nPrecisionInputNumber
            name="biddingSpreadPrice"
            record={record}
            dataSet={this.timeControlDS}
            financial="currencyCode"
            omitZeroFlag
          />
        </ComponentDiffRender>
      ),
    ];
  };

  renderNoRestrictions({ value = null }) {
    if (!value) {
      return intl.get('ssrc.common.view.noRestrictions').d('不限制');
    }

    return value;
  }

  render() {
    const { customizeForm, custLoading, custKey } = this.props;
    const { config = [] } = this.state;
    const showRuleFormFlag = this.timeControlDS.getQueryParameter('showRuleFormFlag');
    return (
      <>
        <div>
          {/* {!['BIDDING_END'].includes(biddingStatus) && ( */}
          {config?.length ? (
            <>
              <h4 style={{ marginTop: '32px' }}>
                <div className={styles['rfx-card-item-title-line']} />
                {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingTimer').d('竞价时间')}
              </h4>
              <Form
                dataSet={this.timeControlDS}
                labelLayout="float"
                columns={3}
                custLoading={custLoading}
                style={{ marginBottom: '12px' }}
                useWidthPercent
              >
                {this.renderFields()}
              </Form>
            </>
          ) : (
            ''
          )}
        </div>
        {showRuleFormFlag && (
          <div>
            <h4 style={{ marginTop: '32px' }}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingRule').d('竞价规则')}
            </h4>
            {customizeForm(
              {
                code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE`,
                dataSet: this.timeControlDS,
              },
              <Form
                dataSet={this.timeControlDS}
                labelLayout="float"
                columns={3}
                custLoading={custLoading}
                style={{ marginBottom: '12px' }}
                useWidthPercent
              >
                {this.renderBiddingRuleForm()}
              </Form>
            )}
          </div>
        )}
      </>
    );
  }
}
