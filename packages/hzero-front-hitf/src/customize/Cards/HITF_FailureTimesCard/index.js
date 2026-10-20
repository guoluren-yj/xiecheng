import React from 'react';
import InterfaceIndicatorChart from '@/components/InterfaceIndicatorChart';
import getLang from '@/langs/cardLang';

class FailureTimesCard extends React.Component {
  render() {
    const { name } = this.props;
    const interfaceIndicatorChartProps = {
      title: name,
      indicators: ['FAILURE_COUNT'],
      yUnit: getLang('TIMES'),
    };
    return <InterfaceIndicatorChart {...interfaceIndicatorChartProps} />;
  }
}
export default FailureTimesCard;
