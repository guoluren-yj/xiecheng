import React, { Component } from 'react';
import { Popover, Steps, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { Throttle } from 'lodash-decorators';

// import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { supplierProcessBar } from '@/services/biddingHallService';
import { formatDateTime } from '@/routes/ssrc/BiddingHall/utils/formatDate';

import Styles from './index.less';

const { Step } = Steps;

@observer
class ProcessPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processVisibleFlag: false,
      processList: [],
    };
  }

  @Throttle(1000)
  processClose = () => {
    this.setState({
      processList: [],
    });
  };

  @Throttle(1000)
  queryProcess = async () => {
    const { headerInfo, organizationId } = this.props;
    const { rfxHeaderId } = headerInfo || {};

    if (!rfxHeaderId || !organizationId) {
      return;
    }

    const data = {
      organizationId,
      rfxHeaderId,
    };
    try {
      let result = await supplierProcessBar(data);
      result = getResponse(result);
      if (!result) {
        return;
      }
      const { biddingNodeDTOS } = result || {};
      this.setState({
        processList: biddingNodeDTOS || [],
      });
    } catch (e) {
      throw e;
    }
  };

  @Throttle(1200)
  processVisibleChange = async (visible = false) => {
    if (!visible) {
      this.processClose();
    } else {
      this.queryProcess();
    }

    this.setState({
      processVisibleFlag: visible,
    });
  };

  // status popover process list
  renderProcessList = () => {
    const { processList } = this.state;
    if (isEmpty(processList)) {
      return '';
    }

    // let current = processList.findIndex(step => step?.currentFlag === 1);
    // current = current !== -1 ? current : 10000;

    return (
      <div>
        <Steps
          // progressDot
          // current={current + 1}
          direction="vertical"
          className={Styles['supplier-bidding-hall-status-list-steps-wrap']}
        >
          {processList.map((item) => this.renderProcessItem(item))}
        </Steps>
      </div>
    );
  };

  // process step
  renderProcessItem = (data) => {
    if (isEmpty(data)) {
      return '';
    }

    const { nodeName, nodeNameMeaning, startDate, endDate, currentFlag } = data || {};
    const start = formatDateTime({ dateTime: startDate });
    const end = formatDateTime({ dateTime: endDate });
    const description = start && end ? `${start}~${end}` : start || end || '';

    return (
      <Step
        key={nodeName}
        icon={
          <Icon
            type="radio_button_unchecked"
            style={{ width: '32px', color: currentFlag ? '#179454' : '#C9CDD4' }}
          />
        }
        status="wait"
        title={
          <span
            style={{
              fontSize: '12px',
              color: currentFlag ? '#179454' : '#868D9C',
              fontWeight: '400',
            }}
          >
            {nodeNameMeaning}
          </span>
        }
        description={
          <span
            style={{ color: '#868D9C', fontSize: '12px', fontWeight: '400', maxWidth: '200px' }}
          >
            {description}
          </span>
        }
      />
    );
  };

  render() {
    const { children = '' } = this.props;
    const { processVisibleFlag } = this.state;

    if (!children) {
      return '';
    }

    return (
      <Popover
        // trigger="click"
        // overlayClassName={Styles['supplier-process-list-popover-wrap']}
        content={this.renderProcessList()}
        placement="bottomLeft"
        visible={processVisibleFlag}
        onVisibleChange={this.processVisibleChange}
        overlayStyle={{
          width: '370px',
        }}
        onClose={this.processClose}
      >
        {children || ''}
      </Popover>
    );
  }
}

export default ProcessPopover;
