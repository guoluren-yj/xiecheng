import React from 'react';
import InterfaceIndicatorChart from '@/components/InterfaceIndicatorChart';
import getLang from '@/langs/cardLang';

class BusinessFailureTimeCard extends React.Component {
  render() {
    const { name } = this.props;
    const interfaceIndicatorChartProps = {
      title: name,
      indicators: ['BUSINESS_FAILURE_COUNT'],
      yUnit: getLang('TIMES'),
    };
    return <InterfaceIndicatorChart {...interfaceIndicatorChartProps} />;
  }
}
export default BusinessFailureTimeCard;
