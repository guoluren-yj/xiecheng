import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import intl from 'utils/intl';

import pin from '@/assets/pin.svg';
import cancelPin from '@/assets/cancel_pin.svg';
import Styles from './index.less';

@observer
class PinFixed extends Component {
  render() {
    const {
      wrapClassNames = '',
      pinFixed = false,
      handleChangePin = () => {},
      hiddenFlag = false,
      wrapStyle = {},
    } = this.props;

    const styles = wrapStyle || {};

    if (hiddenFlag) {
      return '';
    }

    return (
      <div
        className={classNames(Styles['ssrc-component-pin-fixed-wrap'], wrapClassNames)}
        onClick={handleChangePin}
        style={styles}
      >
        <Tooltip
          placement="top"
          title={
            pinFixed
              ? intl.get('ssrc.common.view.message.pinAreaCancel').d('取消固定此区域')
              : intl.get('ssrc.common.view.message.pinArea').d('固定此区域')
          }
        >
          <img
            src={pinFixed ? pin : cancelPin}
            className="push-pin"
            alt=""
            style={{ marginRight: '4px' }}
          />
          {pinFixed
            ? intl.get('ssrc.common.view.message.cancelPin').d('取消钉住')
            : intl.get('ssrc.common.view.message.onTheTop').d('钉在顶部')}
        </Tooltip>
      </div>
    );
  }
}

export default PinFixed;
