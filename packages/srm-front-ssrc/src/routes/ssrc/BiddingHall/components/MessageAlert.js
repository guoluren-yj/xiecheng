import React from 'react';
import { Icon, Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Throttle } from 'lodash-decorators';

// import intl from 'utils/intl';

import { getLineStatusColor } from '../utils/statusColor';

import Styles from './index.less';

@observer
class MessageAlert extends React.Component {
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
    const { message, icon, status, styles = {}, closedFlag = 1 } = this.props;

    const currentMessage = message;
    const currentIcon = icon || (
      <Icon type="error" style={{ color: '#f06200', fontSize: '16px' }} />
    );

    const { bgColor: backgroundColor, color } = getLineStatusColor(status) || {};

    const colorStyles = {
      color,
      backgroundColor,
      ...(styles || {}),
    };

    if (!currentMessage || !currentIcon || !color) {
      return '';
    }

    return (
      <div className={Styles['line-status-alert-wrap']} style={colorStyles}>
        <div>
          <span className={Styles['line-status-alert-icon']}>{currentIcon}</span>
          <span>
            <Popover content={currentMessage}>{currentMessage}</Popover>
          </span>
        </div>
        {closedFlag ? (
          <div onClick={this.handleChange}>
            <Icon type="close" />
          </div>
        ) : (
          ''
        )}
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

export default MessageAlert;
