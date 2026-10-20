/**
 * CountDown - 倒计时
 * @date: 2019 3/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 * @description 解决兼容性问题
 */
import React from 'react';
import intl from 'utils/intl';

class CountDown extends React.Component {
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
    if (this.props.endTime) {
      const endTime = this.props.endTime.replace(/-/g, '/');
      const sysNow = this.props.sysNow.replace(/-/g, '/');
      this.countFun(endTime, sysNow);
    }
  }

  // 组件卸载时，取消倒计时
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { endTime, sysNow } = this.props;
    if (nextProps.endTime && nextProps.sysNow) {
      const nextPropsEndTime = nextProps.endTime.replace(/-/g, '/');
      const nextPropsSysNow = nextProps.sysNow.replace(/-/g, '/');
      if (endTime !== nextProps.endTime || sysNow !== nextProps.sysNow) {
        clearTimeout(this.timer);
        this.countFun(nextPropsEndTime, nextPropsSysNow);
      }
    }
  }

  countFun = (time, sysNow) => {
    const endTime = new Date(time).getTime();
    let sysSecond = endTime - new Date(sysNow).getTime();
    this.timer = setInterval(() => {
      // 防止倒计时出现负数
      if (sysSecond > 1000) {
        sysSecond -= 1000;
        const day = Math.floor(sysSecond / 1000 / 3600 / 24);
        const hour = Math.floor((sysSecond / 1000 / 3600) % 24);
        const minute = Math.floor((sysSecond / 1000 / 60) % 60);
        const second = Math.floor((sysSecond / 1000) % 60);
        this.setState({
          day,
          hour: hour < 10 ? `0${hour}` : hour,
          minute: minute < 10 ? `0${minute}` : minute,
          second: second < 10 ? `0${second}` : second,
        });
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
    return (
      <span>
        <span style={{ color: 'red', fontSize: '24px' }}>{this.state.day}</span>
        {intl.get('hzero.common.date.unit.day').d('天')}
        <span style={{ color: 'red', fontSize: '24px' }}>
          {this.state.hour}:{this.state.minute}:{this.state.second}
        </span>
      </span>
    );
  }
}
export default CountDown;
