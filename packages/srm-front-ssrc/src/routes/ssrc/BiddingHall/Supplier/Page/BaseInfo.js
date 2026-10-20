import React, { Component } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { noop, isNil, isFunction } from 'lodash';
import { Throttle } from 'lodash-decorators';

import classNames from 'classnames';

import intl from 'utils/intl';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';

import biddingHallCommonStyle from '@/routes/ssrc/BiddingHall/biddingHallCommonStyle.less';
import Styles from '../index.less';

import { Timer } from '../../components';

@observer
class BaseInfo extends Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.state = {
      ruleVisibleFlag: 1,
    };
  }

  @Throttle(600)
  toggleRuleVisible = () => {
    const { ruleVisibleFlag } = this.state;
    this.setState({
      ruleVisibleFlag: !ruleVisibleFlag,
    });
  };

  // header status
  renderStatusTag = () => {
    const { headerInfo, quotationStatusColor = noop } = this.props;
    const { displayBiddingSupHeaderStatus, displayBiddingSupHeaderStatusMeaning } =
      headerInfo || {};

    if (!displayBiddingSupHeaderStatus) {
      return '';
    }

    return quotationStatusColor({
      status: displayBiddingSupHeaderStatus,
      statusMeaning: displayBiddingSupHeaderStatusMeaning,
    });
  };

  renderCux = () => {
    const { remote, headerInfo, initPage, cuxObject } = this.props;
    let process = '';

    const fieldOtherProps = {
      headerInfo,
      initPage,
      cuxObject,
    };

    process = remote
      ? remote.process(
          'SSRC_SUPPLIER_BIDDINGHALL_BASE_INFO_ADD_CUX_FIELDS_PROCESS',
        <></>,
          fieldOtherProps
        )
      : '';
    return process;
  };

  renderHeaderInfo = () => {
    const {
      headerInfo = {},
      unitPriceFlag,
      quotationStatusColor = noop,
      unitWholeBatchPriceFlag = false,
      countDownShowAllZeroFlag,
      remote,
      customizeCommon,
      getCustomizeUnitCode,
      headerDS,
    } = this.props;
    const { ruleVisibleFlag } = this.state;
    const { rfxTitle, rfxNum, currencyCode, biddingModeMeaning = '', autoDeferFlag } =
      headerInfo || {};

    const countDownTimeVisibleFlag = unitPriceFlag;

    const rfxNumTitle = rfxNum && rfxTitle ? `${rfxNum}-${rfxTitle}` : rfxNum || rfxTitle || '';

    const fieldsConfigs = {
      rfxNumTitle: {
        hidden: true,
      },
      displayBiddingSupHeaderStatus: {
        useLabel: false,
        withoutBg: true,
        render: () => this.renderStatusTag(),
      },
      biddingMode: {
        useLabel: false,
        withoutBg: true,
        render: () => {
          const biddingModeMeaningComp = quotationStatusColor({
            status: 1,
            statusMeaning: biddingModeMeaning,
          });

          return biddingModeMeaning ? (
            <div>
              {remote
                ? remote?.render(
                    'SSRC_SUPPLIER_BIDDINGHALL_RENDER_BASE_INFO_HEADER_BINDDING_MODE',
                    biddingModeMeaningComp,
                    { headerInfo, quotationStatusColor }
                  )
                : biddingModeMeaningComp}
            </div>
          ) : (
            ''
          );
        },
      },
      currencyCode: {
        useLabel: false,
        withoutBg: true,
        render: () => quotationStatusColor({ status: 1, statusMeaning: currencyCode }),
      },
    };

    return (
      <div className={Styles['supplier-bidding-hall-body-header-title']}>
        <div className={Styles['supplier-bidding-hall-body-header-title-info']}>
          <div
            className={classNames(
              Styles['supplier-bidding-hall-body-header-title-info-num-title'],
              {
                [Styles[
                  'supplier-bidding-hall-body-header-title-info-num-title-add-length'
                ]]: !autoDeferFlag,
              }
            )}
          >
            <Popover content={rfxNumTitle} placement="bottomLeft">
              {rfxNumTitle}
            </Popover>
          </div>

          <div
            className={classNames(
              Styles['supplier-bidding-hall-body-header-title-status-list-wrap'],
              biddingHallCommonStyle['supplier-bidding-hall-approval-customize-override']
            )}
          >
            {customizeCommon(
              {
                code: getCustomizeUnitCode('headerTag'),
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={headerDS}
                titleField="rfxNumTitle"
                tagFields={['displayBiddingSupHeaderStatus', 'biddingMode', 'currencyCode']}
                fieldsConfig={fieldsConfigs}
              />
            )}

            {/* {biddingModeMeaning ? (
              <div>{remote ? remote?.render('SSRC_SUPPLIER_BIDDINGHALL_RENDER_BASE_INFO_HEADER_BINDDING_MODE', biddingModeMeaningComp, { headerInfo }) : biddingModeMeaningComp}</div>
            ) : (
              ''
            )}
            {currencyCode ? (
              <div>{quotationStatusColor({ status: 1, statusMeaning: currencyCode })}</div>
            ) : (
              ''
            )} */}
          </div>

          <div onClick={this.toggleRuleVisible}>
            {ruleVisibleFlag ? <Icon type="expand_less" /> : <Icon type="expand_more" />}
          </div>

          <div>{this.deferInfos()}</div>

          {this.renderCux()}
        </div>

        {countDownTimeVisibleFlag ? (
          <div className={Styles['supplier-bidding-hall-header-count-down-wrap']}>
            <Timer
              data={headerInfo}
              type="header"
              wrapClass={Styles['header-date-time-wrap']}
              labelClass={Styles['bidding-time-render-label']}
              valueClass={Styles['bidding-time-render-value']}
              unitWholeBatchPriceFlag={unitWholeBatchPriceFlag}
              countDownShowAllZeroFlag={countDownShowAllZeroFlag}
            />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  // rule
  renderRules = () => {
    const {
      headerRule = {},
      ruleDS,
      remote,
      headerInfo = {},
      customizeCommon,
      getCustomizeUnitCode,
      japOrDutchBiddingTotalPrice = noop,
    } = this.props;
    const { ruleVisibleFlag } = this.state;
    const {
      biddingModeMeaning = '',
      biddingTargetMeaning = '',
      biddingStrategyMeaning = '',
      biddingQuotationMethodMeaning,
    } = headerRule || {};
    const biddingModeComp = this.renderRule({
      title: intl.get('ssrc.biddingHall.view.biddingMode').d('竞价模式'),
      value: biddingModeMeaning,
    });

    const japarnDutchTotal = japOrDutchBiddingTotalPrice();

    const fieldsConfigs = {
      rfxNumTitle: {
        hidden: true,
      },
      biddingMode: {
        useLabel: false,
        hidden: japarnDutchTotal,
        render: () => {
          return remote
            ? remote?.render('SSRC_SUPPLIER_BIDDINGHALL_RENDER_BASE_INFO_RULES', biddingModeComp, {
                headerInfo,
              })
            : biddingModeComp;
        },
      },
      biddingTarget: {
        useLabel: false,
        hidden: japarnDutchTotal,
        render: () =>
          this.renderRule({
            title: intl.get('ssrc.biddingHall.view.biddingTarget').d('竞价对象'),
            value: biddingTargetMeaning,
          }),
      },
      biddingStrategy: {
        useLabel: false,
        hidden: japarnDutchTotal,
        render: () =>
          this.renderRule({
            title: intl.get('ssrc.biddingHall.view.biddingStrategy').d('出价策略'),
            value: biddingStrategyMeaning,
          }),
      },
      biddingQuotationMethod: {
        useLabel: false,
        hidden: !japarnDutchTotal,
        withoutBg: true,
        render: () =>
          this.renderRule({
            title: intl
              .get(`ssrc.sourceTemplate.model.template.biddingQuotationMethod`)
              .d('竞价方式'),
            value: biddingQuotationMethodMeaning,
          }),
      },
    };

    return (
      <div
        className={classNames(
          Styles['supplier-bidding-hall-body-header-rule-wrap'],
          biddingHallCommonStyle['supplier-bidding-hall-approval-customize-override'],
          {
            [Styles['rules-hidden']]: !ruleVisibleFlag,
          }
        )}
      >
        {customizeCommon(
          {
            code: getCustomizeUnitCode('headerRule'),
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            dataSet={ruleDS}
            titleField="rfxNumTitle"
            normalFields={[
              'biddingMode',
              'biddingTarget',
              'biddingStrategy',
              'biddingQuotationMethod',
            ]}
            fieldsConfig={fieldsConfigs}
          />
        )}

        {/* {remote ? remote?.render('SSRC_SUPPLIER_BIDDINGHALL_RENDER_BASE_INFO_RULES', biddingModeComp, { headerInfo }) : biddingModeComp}
        {this.renderRule({
          title: intl.get('ssrc.biddingHall.view.biddingTarget').d('竞价对象'),
          value: biddingTargetMeaning,
        })}
        {this.renderRule({
          title: intl.get('ssrc.biddingHall.view.biddingStrategy').d('出价策略'),
          value: biddingStrategyMeaning,
        })} */}
      </div>
    );
  };

  renderRule = (data = {}) => {
    const { title, value } = data || {};

    return (
      <span>
        {title} {value}
      </span>
    );

    // return (
    //   <div className={Styles['rules-wrap']}>
    //     <div className={Styles['rule-title']}>
    //       <Popover content={title}>{title}</Popover>
    //     </div>
    //     <div className={Styles['rule-value']}>
    //       <Popover content={value ?? ''} placement="bottomLeft">
    //         {value ?? ''}
    //       </Popover>
    //     </div>

    //     {/* <div className={Styles['rule-value-divide-line']} /> */}
    //   </div>
    // );
  };

  /**
   * 展示延时竞价规则
   * （延时竞价规则=延时触发时间段+延时触发规则+延时时间规则+延时时长+最大延时次数）
   * 比如：距竞价结束10分钟内，如果有新报价产生，竞价截止时间将自动延长5分钟，最多延时3次。
   * */
  deferInfos = () => {
    const {
      headerRule = {},
      unitPriceFlag,
      japanBidding = noop,
      headerInfo,
      dutchBiddingTotalPrice = noop,
      japOrDutchBiddingTotalPrice = noop,
      remote,
    } = this.props;
    const {
      // autoDeferTimeRuleMeaning, // 延时时间规则
      autoDeferDuration,
      autoDeferFlag,
      // deferBiddingAllowedQuotationCount,
      autoDeferTypeMeaning,
    } = headerRule || {};
    const { biddingEliminateRoundNumber = null } = headerInfo || {};

    const japTotalPrice = japanBidding();

    const showWarning = (autoDeferFlag && autoDeferDuration) || japOrDutchBiddingTotalPrice();
    if (!showWarning) {
      return '';
    }

    const countDownTimeVisibleFlag = unitPriceFlag;

    // 延时竞价阶段，如果出现新的报价时触发自动延时，延时竞价截止时间将自动延长1分钟，最多延时5次，
    let wheelCastMeaning = intl
      .get('ssrc.biddingHall.view.title.deferCountGenerateNewQuotedAndDelay', {
        autoDeferTypeMeaning,
        autoDeferDuration,
      })
      .d(
        `延时竞价阶段，如果出现{autoDeferTypeMeaning}，竞价截止时间将自动延长至{autoDeferDuration}分钟`
      );

    if (japTotalPrice) {
      wheelCastMeaning = intl
        .get('ssrc.biddingHall.view.title.japanDutchWarningQuotationRuleTextWithEliminateRound', {
          biddingEliminateRoundNumber,
        })
        .d(
          '供应商点击“接受”按钮后有资格进入下一轮竞价环节，若供应商连续在{biddingEliminateRoundNumber}轮竞价过程中未点击“接受”按钮，则视为放弃本次竞价资格。'
        );

      if (isNil(biddingEliminateRoundNumber)) {
        wheelCastMeaning = intl
          .get('ssrc.biddingHall.view.title.japanDutchWarningQuotationRuleText')
          .d(
            '供应商点击“接受”按钮后就有资格进入下一轮竞价环节，若未点击“接受”按钮，则视为放弃本次竞价资格。'
          );
      }
    }

    if (dutchBiddingTotalPrice()) {
      wheelCastMeaning = intl
        .get('ssrc.biddingHall.view.title.dutchWarningQuotationRuleTextWithEliminateRound', {
          biddingEliminateRoundNumber,
        })
        .d('若点击接受按钮则视为接受当前价格，若其他供应商先接受当前价格，则本次竞价结束。');
    }

    // cdp-104981协鑫埋点
    const { handleWheelStyle = undefined } = remote?.props?.process || {};
    const remoteWheelCastMeaning = isFunction(handleWheelStyle)
    ? handleWheelStyle(wheelCastMeaning, { ...this.props })
    : wheelCastMeaning;

    const INFOS = remoteWheelCastMeaning;

    return (
      <div
        className={classNames(Styles['bidding-dynamic-message-wrap'], {
          [Styles['bidding-dynamic-message-wrap-add-width-class']]: !countDownTimeVisibleFlag,
        })}
      >
        <Icon type="volume_up" className={Styles['volume-up-icon']} />
        <div className={Styles['dynamic-message-wrap']}>
          <div className={`${Styles['dynamic-message-content']} dynamic-message-infos`}>
            {INFOS}
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className={Styles['supplier-bidding-hall-body-header-wrap']}>
        {this.renderHeaderInfo()}
        {this.renderRules()}
      </div>
    );
  }
}

export default BaseInfo;
