import React from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { Throttle } from 'lodash-decorators';
import classnames from 'classnames';
import { Tooltip } from 'choerodon-ui/pro';

import Styles from './index.less';

@observer
class StatusCheckableTab extends React.Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.state = {
      checkedList: new Set(),
    };
  }

  componentWillUnmount() {
    this.onlyClearCheckTag();
  }

  onlyClearCheckTag = () => {
    const { dsOnlyClearStatusQuerryParam, ds } = this.props;
    const currents = new Set();
    this.setState({ checkedList: currents });

    const valueList = [];
    if (dsOnlyClearStatusQuerryParam) {
      dsOnlyClearStatusQuerryParam({
        status: valueList,
        ds,
      });
    }
  };

  @Throttle(1200)
  clearCheckTag = () => {
    const { tableQueryBarStatusTabChange, ds } = this.props;
    const currents = new Set();
    this.setState({ checkedList: currents });

    const valueList = [];

    if (tableQueryBarStatusTabChange) {
      tableQueryBarStatusTabChange({
        status: valueList,
        ds,
        clearType: 'allClear', // 点小清除按钮
      });
    }
  };

  @Throttle(1200)
  handleChange = (value) => {
    const { tableQueryBarStatusTabChange, ds } = this.props;
    const { checkedList } = this.state;

    if (checkedList.has(value)) {
      checkedList.delete(value);
    } else {
      checkedList.add(value);
    }

    this.setState({ checkedList });

    const valueList = [...checkedList];

    if (tableQueryBarStatusTabChange) {
      tableQueryBarStatusTabChange({
        status: valueList,
        ds,
      });
    }
  };

  render() {
    const { checkedList } = this.state;
    const { statusList = [] } = this.props;

    if (isEmpty(statusList)) {
      return '';
    }

    return (
      <div className={Styles['bidding-status-tab-warp']}>
        {statusList.map((status = {}) => {
          const { value, meaning } = status || {};
          if (!value) {
            return '';
          }

          return (
            <Tooltip title={meaning}>
              <span
                className={classnames(Styles['bidding-status-tab'], {
                  [Styles['bidding-status-checked']]: !!checkedList.has(value),
                })}
                onClick={() => this.handleChange(value)}
                key={value}
              >
                {meaning}
              </span>
            </Tooltip>
          );
        })}
      </div>
    );
  }
}

export default StatusCheckableTab;
