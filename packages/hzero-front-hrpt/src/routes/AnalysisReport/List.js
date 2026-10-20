import React, { Component } from 'react';
import { Table, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';

const modelPrompt = 'hrpt.analysisReport.model.analysisReport';

export default class List extends Component {
  // 动态获取柱状图X轴
  @Bind()
  getX() {
    const { reportType } = this.props;
    switch (reportType) {
      case 'company':
        return 'companyName';
      case 'catalog':
        return 'catalogName';
      case 'item':
        return 'itemName';
      default: {
        return null;
      }
    }
  }

  // 获取表格列
  @Bind()
  getColumns() {
    const { reportType } = this.props;
    const columns = {
      company: [
        {
          title: intl.get(`${modelPrompt}.company`).d('公司'),
          dataIndex: 'companyName',
          width: 200,
        },
        {
          title: intl.get(`${modelPrompt}.lineAmount`).d('不含税采购金额'),
          dataIndex: 'lineAmount',
          width: 200,
        },
        {
          title: intl.get(`${modelPrompt}.time`).d('时间'),
          dataIndex: 'date',
          width: 200,
        },
      ],
      catalog: [
        {
          title: intl.get(`${modelPrompt}.catalogue`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 200,
        },
        {
          title: intl.get(`${modelPrompt}.lineAmount`).d('不含税采购金额'),
          dataIndex: 'lineAmount',
          width: 200,
        },
        {
          title: intl.get(`${modelPrompt}.time`).d('时间'),
          dataIndex: 'date',
          width: 200,
        },
      ],
      item: [
        {
          title: intl.get(`${modelPrompt}.tradeName`).d('商品名称'),
          dataIndex: 'itemName',
          width: 200,
        },
        {
          title: intl.get(`${modelPrompt}.quantity`).d('数量'),
          dataIndex: 'quantity',
          width: 100,
        },
        {
          title: intl.get(`${modelPrompt}.lineAmount`).d('不含税采购金额'),
          dataIndex: 'lineAmount',
          width: 200,
        },
        {
          title: intl.get(`${modelPrompt}.time`).d('时间'),
          dataIndex: 'date',
          width: 200,
        },
      ],
    };
    return columns[reportType] || [];
  }

  render() {
    const { analysisReport = {}, handleSearch = e => e, fetchAnalysisReportLoading } = this.props;
    const { dataSource = [], pagination = {}, histogramDataSource = [] } = analysisReport;
    const cols = {
      companyName: { alias: intl.get(`${modelPrompt}.company`).d('公司') },
      lineAmount: { alias: intl.get(`${modelPrompt}.lineAmount`).d('不含税采购金额') },
      catalogName: { alias: intl.get(`${modelPrompt}.catalogue`).d('商品目录') },
      itemName: { alias: intl.get(`${modelPrompt}.tradeName`).d('商品名称') },
    };
    const size = ['companyName', [30]];
    const contentWidth =
      histogramDataSource.length > 6 ? `${(histogramDataSource.length * 100) / 6}%` : '100%';
    const chartWidth = this.content ? this.content.offsetWidth : 0;
    const columns = this.getColumns();
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 100;
    const tableProps = {
      columns,
      dataSource,
      scroll: { x: scrollX },
      pagination,
      onChange: handleSearch,
      loading: fetchAnalysisReportLoading,
    };
    return (
      <Row>
        <Col span={12}>
          <Table {...tableProps} bordered />
        </Col>
        <Col span={12}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <div
              style={{ width: contentWidth }}
              ref={node => {
                this.content = node;
              }}
            >
              <Chart
                height={500}
                data={histogramDataSource}
                scale={cols}
                placeholder
                width={chartWidth}
              >
                <Axis
                  name="companyName"
                  title
                  label={{
                    formatter: val => {
                      return val.replace(' ', '\n');
                    },
                  }}
                />
                <Axis name="lineAmount" title />
                <Axis name="catalogName" title />
                <Axis name="itemName" title />
                <Tooltip
                  crosshairs={{
                    type: 'y',
                  }}
                />
                <Geom
                  type="interval"
                  position={`${this.getX()}*lineAmount`}
                  size={size}
                  tooltip={[
                    'companyName*lineAmount',
                    (_, lineAmount) => {
                      return {
                        name: intl.get(`${modelPrompt}.lineAmount`).d('不含税采购金额'),
                        value: lineAmount,
                      };
                    },
                  ]}
                />
              </Chart>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}
