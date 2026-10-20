/**
 * PriceCharts - 缩略图页面
 * @date: 2019 4/9
 * @author: HZL <zili.hou@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Col, Row, Spin } from 'hzero-ui';
import { Content } from 'components/Page';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import intl from 'utils/intl';
import DataSet from '@antv/data-set';

export default class PriceCharts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { loading, priceDataSource = [], supplierNameList = [] } = this.props;
    // 历史报价折线图
    const historicalQuoteDs = new DataSet();
    const historicalQuoteDv = historicalQuoteDs.createView().source(priceDataSource);
    historicalQuoteDv
      .transform({
        type: 'fold',
        fields: supplierNameList,
        key: 'supplierCompanyName',
        value: 'quotationPrice',
      })
      .transform({
        type: 'filter',
        callback(row) {
          return typeof row.quotationPrice !== 'undefined';
        },
      });
    const cols = {
      quotedDate: {
        type: 'time',
        range: [0, 0.9],
        tickCount: 6,
        mask: 'YYYY-MM-DD HH:mm:ss',
      },
    };
    return (
      <React.Fragment>
        {/* 历史报价 */}
        <Spin spinning={loading}>
          <Content>
            <Row>
              {priceDataSource.length > 0 ? (
                <Col span={24}>
                  <Chart height={300} data={historicalQuoteDv} scale={cols} forceFit>
                    <Legend />
                    <Axis
                      name="quotedDate"
                      label={{
                        formatter: val => {
                          return val.replace(' ', '\n');
                        },
                      }}
                    />
                    <Axis name="quotationPrice" />

                    <Tooltip crosshairs={{ type: 'y' }} />
                    <Geom
                      type="line"
                      position="quotedDate*quotationPrice"
                      tooltip={[
                        'quotedDate*supplierCompanyName*quotationPrice',
                        (quotedDate, supplierCompanyName, quotationPrice) => {
                          return {
                            title: quotedDate,
                            name: supplierCompanyName,
                            value: quotationPrice,
                          };
                        },
                      ]}
                      size={2}
                      color="supplierCompanyName"
                    />
                    <Geom
                      type="point"
                      position="quotedDate*quotationPrice"
                      tooltip={[
                        'quotedDate*supplierCompanyName*quotationPrice',
                        (quotedDate, supplierCompanyName, quotationPrice) => {
                          return {
                            title: quotedDate,
                            name: supplierCompanyName,
                            value: quotationPrice,
                          };
                        },
                      ]}
                      size={4}
                      shape="circle"
                      color="supplierCompanyName"
                      style={{
                        stroke: '#fff',
                        lineWidth: 1,
                      }}
                    />
                  </Chart>
                </Col>
              ) : (
                <div style={{ padding: '12px 0 0 48%' }}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.temporarilyNoData`).d('暂无数据')}
                </div>
              )}
            </Row>
          </Content>
        </Spin>
      </React.Fragment>
    );
  }
}
