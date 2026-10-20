// WarningMessageTime 警示消息

import React from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
// import { Throttle, Bind } from 'lodash-decorators';
// import classnames from 'classnames';
import { Timeline, Collapse, Tooltip } from 'choerodon-ui';
// import moment from 'moment';

// import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { dateTimeRender } from 'utils/renderer';

import {
  fetchWarningMessageSupplier,
  fetchWarningMessagePurchase,
} from '@/services/biddingHallService.js';
import EmptyDataIllustrate from './EmptyDataIllustrate.js';

import Styles from './index.less';

const { Panel } = Collapse;

@observer
class WarningMessageTime extends React.Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      timelineList: [],
      activeKey: [],
      warningCount: 0,
    };
  }

  componentDidMount() {
    this.initPage();
  }

  initPage = () => {
    // this.fetchMessage();
  };

  // getSnapshotBeforeUpdate(prevProps = {}) {
  //   const { header: preRfxHeader } = prevProps;
  //   const { header, rfxLineSupplierId: lineId } = this.props;
  //   const { rfxHeaderId: preRfxHeaderId } = preRfxHeader || {};
  //   const { rfxHeaderId, rfxLineSupplierId } = header || {};

  //   const updateRfxHeaderIdFlag = rfxHeaderId && rfxHeaderId !== preRfxHeaderId;
  //   const updateLineId = rfxLineSupplierId && rfxLineSupplierId !== lineId;

  //   const updateFlag = updateRfxHeaderIdFlag || updateLineId;
  //   return updateFlag;
  // }

  // componentDidUpdate(...params) {
  //   if (params[2]) {
  //     // this.fetchMessage();
  //   }
  // }

  fetchMessage = async () => {
    const {
      supplierFlag,
      header,
      // biddingSiteInfoDataSet,
    } = this.props;

    const { rfxHeaderId, rfxLineSupplierId } = header || {};
    if (!rfxHeaderId && !rfxLineSupplierId) {
      return;
    }

    const params = {
      rfxHeaderId,
      rfxLineSupplierId,
      organizationId: this.organizationId,
      supplierFlag,
    };

    const apiFetch = supplierFlag ? fetchWarningMessageSupplier : fetchWarningMessagePurchase;

    let result = null;
    try {
      result = await apiFetch(params);
      result = getResponse(result);
      if (!result) {
        this.clearState();
        return;
      }

      const timelineList = result || [];
      const key = [];
      let count = 0;

      timelineList.forEach((item, index) => {
        if (!item) {
          return;
        }

        const { biddingStatus, purchaseWarnMessageCount } = item || {};

        if (index === 0) {
          key.push(biddingStatus);
        }

        if (purchaseWarnMessageCount) {
          count = purchaseWarnMessageCount;
        }
      });

      this.setState({
        timelineList,
        activeKey: key,
        warningCount: count,
      });
    } catch (e) {
      throw e;
    }
  };

  getWarningCount = () => {
    const { warningCount } = this.state;

    return warningCount;
  };

  clearState = () => {
    this.setState({
      timelineList: [],
      activeKey: [],
      warningCount: 0,
    });
  };

  changeCollapse = (key = []) => {
    this.setState({
      activeKey: key,
    });
  };

  renderItem = (item) => {
    // const { supplierFlag } = this.props;
    const { creationDate, messageDescription, displayBiddingViewMessageRemark } = item || {};

    if (!messageDescription) {
      return '';
    }

    // // 供应商使用外部理由
    // const remark = supplierFlag ? processExternalRemark : processInternalRemark;

    return (
      <div className={Styles['ssrc-bidding-hall-warning-message-timeline-item']}>
        <div className={Styles['ssrc-bidding-hall-warning-message-timeline-item-conent']}>
          <div className={Styles['ssrc-bidding-hall-warning-message-timeline-item-conent-title']}>
            <Tooltip title={messageDescription}>{messageDescription}</Tooltip>
          </div>

          {displayBiddingViewMessageRemark ? (
            <div
              className={Styles['ssrc-bidding-hall-warning-message-timeline-item-conent-remark']}
            >
              <span
                className={
                  Styles['ssrc-bidding-hall-warning-message-timeline-item-conent-remark-value']
                }
              >
                <Tooltip title={displayBiddingViewMessageRemark}>
                  {displayBiddingViewMessageRemark}
                </Tooltip>
              </span>
            </div>
          ) : (
            ''
          )}

          {creationDate ? (
            <span className={Styles['ssrc-bidding-hall-warning-message-timeline-item-conent-time']}>
              {dateTimeRender(creationDate)}
            </span>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  };

  renderTimeListCategory = (listItem) => {
    const { biddingViewMessageDTOS = [] } = listItem || {};

    if (isEmpty(biddingViewMessageDTOS)) {
      return '';
    }

    return (
      <Timeline>
        {biddingViewMessageDTOS.map((item) => {
          const { biddingViewMessageId } = item || {};

          return (
            <Timeline.Item color="red" key={biddingViewMessageId}>
              {this.renderItem(item, listItem)}
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };

  render() {
    const { timelineList, activeKey } = this.state;

    if (isEmpty(timelineList)) {
      return <EmptyDataIllustrate />;
    }

    return (
      <div className={Styles['ssrc-bidding-hall-warning-message-wrap']}>
        <Collapse
          bordered={false}
          activeKey={activeKey}
          onChange={this.changeCollapse}
          expandIconPosition="text-right"
        >
          {timelineList.map((ele) => {
            const { biddingStatus, biddingStatusMeaning } = ele || {};

            if (!biddingStatus) {
              return '';
            }

            return (
              <Panel
                header={
                  <span className={Styles['ssrc-bidding-hall-warning-message-category-title']}>
                    {biddingStatusMeaning}
                  </span>
                }
                key={biddingStatus}
              >
                {this.renderTimeListCategory(ele)}
              </Panel>
            );
          })}
        </Collapse>
      </div>
    );
  }
}

export default WarningMessageTime;
