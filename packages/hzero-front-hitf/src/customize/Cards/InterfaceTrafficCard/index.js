/**
 * 工作台卡片-透传接口流量
 * @author baitao.huang@hand-china.com
 * @date 2021/10/8
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { ceil, isNumber } from 'lodash';
import InterfaceIndicatorChart from '@/components/InterfaceIndicatorChart';

class InterfaceTrafficCard extends React.Component {
  transformYValue(num) {
    if (!isNumber(num)) {
      return num;
    }
    return ceil(num / 1024, 2);
  }

  render() {
    const { name } = this.props;
    const interfaceIndicatorChartProps = {
      title: name,
      indicators: ['INBOUND_METERING_TRAFFIC', 'OUTBOUND_METERING_TRAFFIC'],
      yUnit: 'KB',
      onTransformYValue: this.transformYValue,
    };
    return <InterfaceIndicatorChart {...interfaceIndicatorChartProps} />;
  }
}

export default InterfaceTrafficCard;
