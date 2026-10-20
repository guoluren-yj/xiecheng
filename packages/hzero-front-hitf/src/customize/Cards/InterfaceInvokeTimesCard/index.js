/**
 * 工作台卡片-接口调用次数
 * @author baitao.huang@hand-china.com
 * @date 2021/01/19
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import InterfaceIndicatorChart from '@/components/InterfaceIndicatorChart';
import getLang from '@/langs/cardLang';

class InterfaceInvokeTimesCard extends React.Component {
  render() {
    const { name } = this.props;
    const interfaceIndicatorChartProps = {
      title: name,
      indicators: ['TOTAL_COUNT'],
      yUnit: getLang('TIMES'),
    };
    return <InterfaceIndicatorChart {...interfaceIndicatorChartProps} />;
  }
}

export default InterfaceInvokeTimesCard;
