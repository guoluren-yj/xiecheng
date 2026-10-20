import React from 'react';
import { Icon, Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Throttle } from 'lodash-decorators';
import { isNil } from 'lodash';

import intl from 'utils/intl';

import { getLineStatusColor } from '../utils/statusColor';

import Styles from './index.less';

const finishBiddingSvg = require('@/assets/biddingHall/finish-bidding.svg');

@observer
class StatusAlert extends React.Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.state = {
      alertVisible: true,
    };
  }

  @Throttle(500)
  handleChange = () => {
    this.setState({ alertVisible: false });
  };

  renderAlert = () => {
    const {
      remote,
      supplierStatus,
      prohibitQuotationDate, // 删除报价日期
      // prohibitProcessExternalRemark,
      displayBiddingSupHeaderStatus,
      displayBiddingSupHeaderStatusMeaning,
      actionProcessRemark,
      trialBiddingQueryFlag,
      wrapStyles = {},
      supplierSupplementStartAndNotQuoted,
      biddingRoundSupplierStatus = null,
      biddingEliminateRoundNumber = null,
      japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice,
    } = this.props;
    const japanDutchTotalPrice = japOrDutchBiddingTotalPrice();
    const japanTotalPrice = japanBiddingTotalPrice && japanBiddingTotalPrice();

    let message = null;
    const ERRORICON = <Icon type="error" style={{ color: '#f06200', fontSize: '16px' }} />;
    let icon = ERRORICON;

    let headerStatus = displayBiddingSupHeaderStatus;

    if (displayBiddingSupHeaderStatus === 'PAUSED') {
      message =
        intl
          .get('ssrc.biddingHall.view.title.biddingPausedReason')
          .d('竞价单已暂停，暂停原因是：') + actionProcessRemark ?? '';
      headerStatus = 5;
    }

    if (
      displayBiddingSupHeaderStatus === 'BIDDING_END' ||
      displayBiddingSupHeaderStatus === 'FINISHED'
    ) {
      message = intl
        .get('ssrc.biddingHall.view.title.biddingHallHeaderStatus', {
          status: displayBiddingSupHeaderStatusMeaning || '',
        })
        .d('竞价{status}');
      icon = <img src={finishBiddingSvg} alt="" />;
    }

    if (displayBiddingSupHeaderStatus === 'CLOSED') {
      message = `${intl
        .get('ssrc.biddingHall.view.title.biddingClosedReason')
        .d('竞价单已关闭，关闭原因是：')} ${actionProcessRemark ?? ''}`;
    }

    if (trialBiddingQueryFlag === 1 && displayBiddingSupHeaderStatus === 'IN_PROGRESS') {
      // 试竞价
      // 温馨提醒:模拟竞拍为了让用户快速熟悉网络竞价流程，请勿按照真实价格出价
      message = intl
        .get('ssrc.biddingHall.view.title.biddingHallTrialSupplierBiddingStatusAlertMsg')
        .d('温馨提醒:模拟竞拍为了让用户快速熟悉网络竞价流程，请勿按照真实价格出价');
      headerStatus = 'TRIAL_BIDDING';

      if (japanDutchTotalPrice) {
        message = intl
          .get(
            'ssrc.biddingHall.view.title.biddingHallTrialSupplierBiddingWithJapanDutchStatusAlertMsg'
          )
          .d(
            '温馨提醒:模拟竞拍为了让用户快速熟悉网络竞价流程，当前所展示价格为虚拟数据，接受与否均不影响正式竞价响应'
          );
      }
    }

    // 被淘汰的供应商可以补充单价
    if (
      biddingRoundSupplierStatus === 'ELIMINATE' &&
      !isNil(biddingEliminateRoundNumber) &&
      japanTotalPrice &&
      displayBiddingSupHeaderStatus === 'IN_PROGRESS'
    ) {
      message = intl
        .get('ssrc.biddingHall.view.title.biddingHallSupplierHasEliminatedWarning', {
          biddingEliminateRoundNumber,
        })
        .d('由于您连续{biddingEliminateRoundNumber}轮未接受，您无法参与后续的竞价过程。');

      if (trialBiddingQueryFlag === 1) {
        message = intl
          .get('ssrc.biddingHall.view.title.trialBiddingHallSupplierHasEliminatedWarning', {
            biddingEliminateRoundNumber,
          })
          .d(
            '由于您试竞价连续{biddingEliminateRoundNumber}轮未接受，您无法参与后续的试竞价过程，请等待正式竞价开始。'
          );
      }

      headerStatus = 5;
      icon = ERRORICON;
    }

    // 待补充单价
    if (supplierSupplementStartAndNotQuoted) {
      message = intl
        .get('ssrc.biddingHall.view.title.quotedHasFinishedPleaseSupplementaryPrice')
        .d('竞价已完成, 请补充单价');
      icon = <img src={finishBiddingSvg} alt="" />;
      headerStatus = 5;
    }

    const frohibitFlag = supplierStatus === 'PROHIBIT_QUOTATION';
    if (frohibitFlag) {
      message = intl
        .get('ssrc.biddingHall.view.title.biddingHallProhibittedStatusAlertMsg', {
          prohibitTime: prohibitQuotationDate,
        })
        .d('您在 {prohibitTime} 被禁止报价，如有异议，请联系本次竞价负责人处理');
      headerStatus = 5;
      icon = ERRORICON;
    }

    const customizeColor = {
      FINISHED: {
        color: '#4E5769',
        bgColor: '#F7F8FA',
      },
    };
    const { bgColor: backgroundColor, color } =
      getLineStatusColor(headerStatus, customizeColor) || {};
    const colorStyles = {
      color,
      backgroundColor,
    };

    const showFlag = message && icon && color;
    const cuxShowFlag = remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BIDDING_HALL_STATUS_ALERT_SHOW_FLAG',
          showFlag,
          { displayBiddingSupHeaderStatus }
        )
      : showFlag;
    if (!cuxShowFlag) {
      return '';
    }

    const styles = {
      ...colorStyles,
      ...(wrapStyles || {}),
    };

    return (
      <div className={Styles['line-status-alert-wrap']} style={styles}>
        <div
          className={`${Styles['line-status-alert-wrap-left']} line-status-alert-wrap-left-tips`}
        >
          <span className={Styles['line-status-alert-icon']}>{icon}</span>
          <span>
            <Popover content={message}>{message}</Popover>
          </span>
        </div>
        <div onClick={this.handleChange}>
          <Icon type="close" />
        </div>
      </div>
    );
  };

  render() {
    const { alertVisible } = this.state;
    if (!alertVisible) {
      return '';
    }

    return this.renderAlert();
  }
}

export default StatusAlert;
