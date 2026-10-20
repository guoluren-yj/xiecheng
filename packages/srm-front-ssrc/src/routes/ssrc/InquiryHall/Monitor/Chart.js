/**
 * inquiryHall - 寻源服务/询价大厅-监控台子组件【折线图】
 * @date: 2019-2-22
 * @author: lbc <baocheng.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import DataSet from '@antv/data-set';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import { isEmpty } from 'lodash';

import styles from './index.less';

class Charts extends Component {
  render() {
    const { data = [], itemLineChatActiveKey = null } = this.props;
    let yName;
    if (itemLineChatActiveKey === 'unitPrice' || !itemLineChatActiveKey) {
      yName = 'quotationPrice';
    } else if (itemLineChatActiveKey === 'weightPrice') {
      yName = 'weightPrice';
    } else {
      yName = 'totalQuotationPrice';
    }

    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['c1', 'c2', 'c3'],
      // 展开字段集
      key: 'quotedDate',
      // key字段
      value: yName, // value字段
    });
    let cols;
    if (data.length > 0) {
      cols = {
        quotedDate: {
          type: 'time',
          range: [0, 0.9],
          mask: DEFAULT_DATETIME_FORMAT,
        },
      };
    } else {
      cols = {
        quotedDate: {
          alias: 0,
        },
      };
    }

    return (
      <div className={!isEmpty(data) ? styles['ssrc-inquiry-hall-monitor-chart-wrap'] : ''}>
        <Chart height={480} data={data} scale={cols} forceFit padding="auto">
          <Legend
            // scroll
            // itemGap={15}
            // itemMarginBottom={30}
            // height={80}
            useHtml
            g2-legend={{
              marginLeft: '100px',
              marginTop: '-107px',
            }}
            g2-legend-list={{
              // border: 'none',
              width: '100%',
              height: '80px',
              overflowY: 'auto',
            }}
          />
          <Axis name="quotedDate" />
          <Axis
            name={yName}
            label={{
              autoRotate: true,
              formatter: (val) => val,
            }}
          />
          <Tooltip
            crosshairs={{
              type: 'y',
            }}
          />
          <Geom type="line" position={`quotedDate*${yName}`} size={2} color="supplierCompanyName" />
          <Geom
            type="point"
            position={`quotedDate*${yName}`}
            size={4}
            shape="circle"
            color="supplierCompanyName"
            style={{
              stroke: '#fff',
              lineWidth: 1,
            }}
          />
        </Chart>
      </div>
    );
  }
}

export default Charts;
