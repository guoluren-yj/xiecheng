import { Drawer, Table } from 'hzero-ui';
import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord } from 'bizcharts';
import intl from 'utils/intl';

export default class LevelChart extends Component {
  render() {
    const { visible, onClose, levelList = [] } = this.props;
    const dataSource = [];
    const cols = {
      value: {
        type: 'linear',
        minLimit: 0,
        minTickInterval: 1,
      },
    };
    const columns = [
      {
        title: intl.get('sslm.evaluationQuery.modal.levelChart.level').d('等级'),
        width: 120,
        dataIndex: 'level',
        render: () =>
          intl.get('sslm.evaluationQuery.modal.levelChart.supplierNumber').d('供应商数量'),
      },
    ];
    levelList.forEach((n) => {
      columns.push({
        title: n.levelDesc,
        dataIndex: `supplierCount#${n.levelCode}`,
      });
      dataSource[`supplierCount#${n.levelCode}`] = n.supplierCount;
    });

    return (
      <Drawer
        title={intl.get('sslm.evaluationQuery.view.title.viewChartTitle').d('等级分布图表')}
        width={520}
        onClose={onClose}
        visible={visible}
      >
        <Chart forceFit data={levelList} scale={cols} padding={40} height={400}>
          <h3 style={{ textAlign: 'center' }}>
            {intl.get('sslm.evaluationQuery.view.title.levelScattergram').d('供应商绩效等级分布图')}
          </h3>
          <Coord type="polar" scale={[1, 1]} />
          <Axis name="levelDesc" line={null} tickLine={null} grid={null} />
          <Tooltip itemTpl={`<li data-index={index}>{value}</li>`} />
          <Axis
            name="supplierCount"
            line={null}
            tickLine={null}
            label={{
              offset: 5,
            }}
            grid={{
              type: 'polygon',
              lineStyle: {
                lineDash: null,
              },
            }}
          />
          <Geom type="line" position="levelDesc*supplierCount" color="#0082cf" size={2} />
          <Geom
            size={3}
            type="point"
            color="#0082cf"
            shape="circle"
            position="levelDesc*supplierCount"
            style={{
              lineWidth: 1,
              fillOpacity: 1,
            }}
          />
        </Chart>
        <Table bordered columns={columns} dataSource={[{ ...dataSource }]} pagination={false} />
      </Drawer>
    );
  }
}
