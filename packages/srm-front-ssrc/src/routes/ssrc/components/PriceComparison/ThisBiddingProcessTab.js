import React, { PureComponent, createRef } from 'react';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import HistoryAnalysis from '@/routes/ssrc/BiddingHall/components/PurBiddingHistoryChart/HistoryAnalysis.js';
import JAPANDUTCHAggregationTableList from '@/routes/ssrc/BiddingHall/Purchase/page/MainContent/JAPANDUTCHAggregationTableList';

const { TabPane } = Tabs;

class ThisBiddingProcessTab extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.japanDutchChartRef = createRef({});

    this.state = {
      activeTab: 'unitPrice', // tab页
    };
  }

  @Bind()
  changeTabs(activeKey) {
    this.setState({
      activeTab: activeKey,
    });
  }

  setJapanDutchChartRef = (node) => {
    this.japanDutchChartRef = node;
  };

  renderBiddingHallJapanOrDutchTotalPrice = () => {
    const {
      baseInfoDs,
      japanDutchAggregationTableDs,
      currentPageSymbol,
      handleRebuileAggregrationTableDataForDS,
    } = this.props;
    const { activeTab } = this.state;

    const { current } = baseInfoDs || {};

    if (!current) {
      return '';
    }

    const header = current ? current.toData() : {};

    const aggregrationTableProps = {
      japanDutchAggregationTableDs,
      header: header || {},
      finishedFlag: 1,
      aggregrationTableProps: {
        style: {
          height: 450,
        },
      },
      handleRebuileAggregrationTableDataForDS,
    };

    const japanDutchChartProps = {
      header: header || {},
      type: 'PURCHASE',
      biddingRuleDataSet: baseInfoDs,
      japanDutchFlag: 1,
      onlyShowChartFlag: 1,
      expandViewFlag: 1,
      otherPageRenderChartStyle: {
        wrapperStyle: {
          height: '620px',
          width: '100%',
          overflow: 'auto',
        },
        chartStyle: {
          height: '600px',
          width: window?.innerWidth * 0.8 - 100,
        },
      },
      chartOtherParams: {
        biddingEndFlag: 1,
        biddingNotStartFlag: 0,
        biddingRoundEndQueryFlag: 1,
        currentPageSymbol, // 比价助手页面标识，纯前端字段
      },
      outterChartRef: this.setJapanDutchChartRef,
      biddingFinished: true, // 竞价趋势不需要15秒实时刷新了
    };

    return (
      <Tabs animated={false} onChange={this.changeTabs} activeKey={activeTab}>
        <TabPane
          tab={intl.get('ssrc.common.priceComparison.view.tab.chart').d('竞价趋势图')}
          key="unitPrice"
        >
          <HistoryAnalysis {...japanDutchChartProps} />
        </TabPane>
        <TabPane
          tab={intl.get('ssrc.common.priceComparison.view.tab.biddingRoundInfo').d('竞价轮次信息')}
          key="table"
        >
          <JAPANDUTCHAggregationTableList {...aggregrationTableProps} />
        </TabPane>
      </Tabs>
    );
  };

  render() {
    return this.renderBiddingHallJapanOrDutchTotalPrice();
  }
}

export { ThisBiddingProcessTab };
export default ThisBiddingProcessTab;
