import React from 'react';
import InterfaceIndicatorChart from '@/components/InterfaceIndicatorChart';
import getLang from '@/langs/cardLang';

class ResponseTimeCard extends React.Component {
  render() {
    const { name } = this.props;
    const interfaceIndicatorChartProps = {
      title: name,
      indicators: ['TOTAL_RESPONSE_TIME'],
      yUnit: getLang('RESPONSE_TIME'),
    };
    return <InterfaceIndicatorChart {...interfaceIndicatorChartProps} />;
  }
}
export default ResponseTimeCard;
