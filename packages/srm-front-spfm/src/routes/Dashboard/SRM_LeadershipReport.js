/**
 * LeadershipReport -采购方领导报表
 * @date: 2019-02-21
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Radio, Col } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentLanguage } from 'utils/utils';
import MiniArea from './MiniArea';
import styles from './Cards.less';
// import chartImg from '../../assets/dashboard/no-chart.svg';
import reportNoData from '../../assets/dashboard/report-no-data.svg';
import { formatAumont } from './hook';

const currentLanguage = getCurrentLanguage();

const tooltip = [
  'x*y',
  (x, y) => {
    const amount = formatAumont(y);
    return {
      name: x,
      value: intl
        .get('spfm.dashboard.model.leadershipReport.purchases', {
          name: amount,
        })
        .d(`采购额：${amount}(万元)`),
    };
  },
];

const x = {
  name: 'amountStatisticsDate',
  line: {
    lineWidth: 3,
  },
  label: {
    textStyle: {
      textAlign: 'center', // 文本对齐方向，可取值为： left center right
      fill: '#8C8C8C', // 文本的颜色
      fontSize: '12', // 文本大小
    },
  },
  tickLine: {
    lineWidth: 1, // 刻度线宽
    stroke: '#ccc', // 刻度线的颜色
    length: 5, // 刻度线的长度, **原来的属性为 line**,可以通过将值设置为负数来改变其在轴上的方向
  },
};

const y = {
  // name: 'taxIncludedAmount',
  // line: {
  //   lineWidth: 3,
  // },
  grid: {
    lineStyle: {
      stroke: '#d9d9d9',
      lineWidth: 1,
      lineDash: [2, 2],
    },
  },
  label: {
    textStyle: {
      textAlign: 'right', // 文本对齐方向，可取值为： left center right
      fill: '#8C8C8C', // 文本的颜色
      fontSize: '12', // 文本大小
    },
    formatter(text) {
      if (typeof text === 'string') {
        return formatAumont(Number(text));
      }
      return text;
    },
  },
};

@connect(({ srmCards, loading }) => ({
  srmCards,
  loading: loading.effects['srmCards/queryLeadership'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class LeadershipReport extends React.Component {
  state = {
    time: 'month',
    height: '',
  };

  componentDidMount() {
    this.handleSearch(this.state.time);
    // 注释， 影响全局的 resize 方法
    // window.onresize = this.handleHeight();
    // 手动触发一次
    this.handleHeight();
    window.addEventListener('resize', this.handleHeight);
  }

  /**
   * 查询采购方领导报表
   */
  @Bind()
  handleSearch(time) {
    const { dispatch } = this.props;
    if (time === 'month') {
      dispatch({
        type: 'srmCards/queryLeadership',
        payload: {
          sectionDate: time,
          code: 'SRM_LeadershipReport',
        },
      });
    } else if (time === 'year') {
      dispatch({
        type: 'srmCards/queryLeadershipYear',
        payload: {
          sectionDate: time,
          code: 'SRM_LeadershipReport',
        },
      });
    }
  }

  @Bind()
  handleTimeChange(e) {
    this.setState({ time: e.target.value });
    this.handleSearch(e.target.value);
  }

  /**
   * 获取页面高度，使报表高度自适应
   */
  @Bind()
  handleHeight() {
    if (document.getElementById('leadership')) {
      const height = document.getElementById('leadership').scrollHeight - 180;
      this.setState({ height });
    }
  }

  render() {
    const {
      srmCards: { leadershipAmounts, leadershipReports = [], leadershipYear = [] } = {},
    } = this.props;
    const newLeadershipReports =
      currentLanguage === 'en_US'
        ? leadershipReports.map(item => ({
            x: item.x,
            y: item.y * 10000,
          }))
        : leadershipReports;
    const newLeadershipYear = leadershipYear.map(item => ({
      x: item.x,
      y: currentLanguage === 'en_US' ? item.y * 10000 : item.y,
    }));
    const { time, height } = this.state;
    return (
      <div className={styles.report} id="leadership">
        <Col span={16} className={styles['report-title']}>
          {intl.get('spfm.dashboard.view.leadershipReport.title').d('采购总额')}
          {currentLanguage === 'en_US' ? (
            <span className={styles['report-number']}>
              {formatAumont(leadershipAmounts * 10000)}
            </span>
          ) : (
            <span className={styles['report-number']}>{formatAumont(leadershipAmounts)} </span>
          )}
          {intl.get('spfm.dashboard.view.leadershipReport.statementAmount').d('万元(含税)')}
        </Col>
        <Col span={8} style={{ textAlign: 'right', marginTop: '10px' }}>
          <Radio.Group value={time} onChange={this.handleTimeChange}>
            <Radio.Button value="month">
              {intl.get('spfm.dashboard.view.leadershipReport.month').d('月度')}
            </Radio.Button>
            <Radio.Button value="year">
              {intl.get('spfm.dashboard.view.leadershipReport.year').d('年度')}
            </Radio.Button>
          </Radio.Group>
        </Col>
        {time === 'month' && leadershipAmounts !== 0 && !isEmpty(leadershipReports) && (
          <Col span={24} className={styles['report-y']}>
            {intl.get('spfm.dashboard.view.leadershipReport.message.purchases').d('采购额（万元）')}
          </Col>
        )}
        {time === 'year' && leadershipAmounts !== 0 && !isEmpty(leadershipYear) && (
          <Col span={24} className={styles['report-y']}>
            {intl.get('spfm.dashboard.view.leadershipReport.message.purchases').d('采购额（万元）')}
          </Col>
        )}
        {!isEmpty(leadershipReports) && leadershipAmounts !== 0 && time === 'month' && (
          <div style={{ marginTop: '135px' }}>
            <MiniArea
              tooltip={tooltip}
              height={height}
              data={newLeadershipReports}
              xAxis={x}
              yAxis={y}
            />
          </div>
        )}
        {!isEmpty(leadershipYear) && leadershipAmounts !== 0 && time === 'year' && (
          <div style={{ marginTop: '135px' }}>
            <MiniArea
              tooltip={tooltip}
              height={height}
              data={newLeadershipYear}
              xAxis={x}
              yAxis={y}
            />
          </div>
        )}
        {time === 'month' && (leadershipAmounts === 0 || isEmpty(leadershipReports)) && (
          <div style={{ textAlign: 'center' }}>
            <img src={reportNoData} alt="" style={{ marginTop: '35px' }} />
            <div className={styles.commonlyUsed}>
              <div className={styles['common-dashboard-no-data']}>
                {intl.get(`spfm.dashboard.model.common.reportNoData`).d('暂无工作报表')}
              </div>
            </div>
          </div>
        )}
        {time === 'year' && (leadershipAmounts === 0 || isEmpty(leadershipYear)) && (
          <div style={{ textAlign: 'center' }}>
            <img src={reportNoData} alt="" style={{ marginTop: '35px' }} />
            <div className={styles.commonlyUsed}>
              <div className={styles['common-dashboard-no-data']}>
                {intl.get(`spfm.dashboard.model.common.reportNoData`).d('暂无工作报表')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
