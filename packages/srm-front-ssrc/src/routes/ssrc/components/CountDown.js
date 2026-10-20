/**
 * CountDown - 倒计时
 * @date: 2019 3/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 * @description 解决兼容性问题
 */
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import styles from './CountDownStyle.less';

@observer
class CountDown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      day: 0,
      hour: 0,
      minute: '00',
      second: '00',
    };
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const { endTime, sysNow } = this.props;

    if (endTime) {
      const nextPropsEndTime = this.formatTime(endTime);
      const nextPropsSysNow = this.formatTime(sysNow);
      this.countFun(nextPropsEndTime, nextPropsSysNow);
    }
  };

  // 组件卸载时，取消倒计时
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      endTime: newEndTime = null,
      sysNow: newSysNow = null,
      pausedFlag: prevPausedFlag,
    } = this.props;
    const { endTime, sysNow, pausedFlag } = prevProps;

    const result = newEndTime !== endTime || newSysNow !== sysNow || pausedFlag !== prevPausedFlag;
    return result;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      const { endTime, sysNow } = this.props;
      const nextPropsEndTime = this.formatTime(endTime);
      const nextPropsSysNow = this.formatTime(sysNow);
      if (endTime || sysNow) {
        clearTimeout(this.timer);
        this.countFun(nextPropsEndTime, nextPropsSysNow);
      }
    }
  }

  formatTime = (time = null) => {
    return time ? moment(time).format(DEFAULT_DATETIME_FORMAT).replace(/-/g, '/') : null;
  };

  countFun = (time, sysNow) => {
    const { pausedFlag = false } = this.props;

    const endTime = new Date(time).getTime();
    const currentTime = sysNow ? new Date(sysNow).getTime() : new Date();

    let sysSecond = endTime - currentTime;
    this.timer = setInterval(() => {
      // 防止倒计时出现负数
      if (sysSecond > 1000) {
        sysSecond -= 1000;
        const day = Math.floor(sysSecond / 1000 / 3600 / 24);
        const hour = Math.floor((sysSecond / 1000 / 3600) % 24);
        const minute = Math.floor((sysSecond / 1000 / 60) % 60);
        const second = Math.floor((sysSecond / 1000) % 60);
        this.setState(
          {
            day,
            hour: hour < 10 ? `0${hour}` : hour,
            minute: minute < 10 ? `0${minute}` : minute,
            second: second < 10 ? `0${second}` : second,
          },
          () => {
            if (pausedFlag) {
              clearInterval(this.timer); // 外部控制倒计时停止，但是需要计算一次时间
            }
          }
        );
      } else {
        clearInterval(this.timer);
        this.setState({
          day: 0,
          hour: 0,
          minute: '00',
          second: '00',
        });
        // 倒计时结束时，触发父组件的方法
        if (this.props.timeOver) {
          this.props.timeOver();
        }
      }
    }, 1000);
  };

  render() {
    const { type = 'day', numberStyle = {}, hiddenDayFlag = 0, remote } = this.props;
    const NumberStyle = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_COUNT_DOWN_COLOR',
          {
            ...(numberStyle || {}),
          },
          {
            day: this.state.day,
            hour: this.state.hour,
            minute: this.state.minute,
            second: this.state.second,
          }
        )
      : {
          ...(numberStyle || {}),
        };

    const CommonNumberStyle = {
      color: 'rgb(6,135,255)',
      fontSize: '24px',
      ...(numberStyle || {}),
    };

    return (
      <span>
        {!hiddenDayFlag ? (
          <span>
            {type === 'dayChina' ? (
              <span
                style={{
                  color: 'rgb(6,135,255)',
                  fontSize: '24px',
                  ...(NumberStyle || {}),
                }}
              >
                {this.state.day}
              </span>
            ) : (
              <span
                className={styles['not-dayChina-color']}
                style={{
                  fontSize: '24px',
                  ...(NumberStyle || {}),
                }}
              >
                {this.state.day}
              </span>
            )}
            {intl.get('hzero.common.date.unit.day').d('天')}
          </span>
        ) : (
          ''
        )}
        {type === 'dayChina' ? (
          <React.Fragment>
            <span style={CommonNumberStyle}>{this.state.hour}</span>
            {intl.get('hzero.common.date.unit.hour').d('时')}
            <span style={CommonNumberStyle}>{this.state.minute}</span>
            {intl.get('hzero.common.date.unit.minute').d('分')}
            <span style={CommonNumberStyle}>{this.state.second}</span>
            {intl.get('hzero.common.date.unit.second').d('秒')}
          </React.Fragment>
        ) : (
          <span
            className={styles['not-dayChina-color']}
            style={{ fontSize: '24px', ...(NumberStyle || {}) }}
          >
            {this.state.hour}:{this.state.minute}:{this.state.second}
          </span>
        )}
      </span>
    );
  }
}
export default CountDown;
