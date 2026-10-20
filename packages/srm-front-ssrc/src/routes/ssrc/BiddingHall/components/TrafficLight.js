import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import Styles from './index.less';

@observer
export default class TrafficLight extends Component {
  getLight = () => {
    const { record } = this.props;

    const { trafficLight } = record ? record.get([
      "trafficLight",
    ]) : {};

    return trafficLight;
  }

  renderLight = () => {
    const trafficLight = this.getLight();

    if (!trafficLight) {
      return "";
    }

    const lightClassType = `ssrc-bidding-traffic-light-${trafficLight}`;

    return (
      <div
        className={classnames(Styles['ssrc-bidding-traffic-light-wrap'], {
          [Styles[lightClassType]]: lightClassType,
        })}
      />
    );
  }

  render() {
    return this.renderLight();
  }
}
