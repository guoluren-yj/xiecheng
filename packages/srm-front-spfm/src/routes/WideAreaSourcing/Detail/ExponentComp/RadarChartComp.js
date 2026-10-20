/* eslint-disable no-param-reassign */
/**
 * 雷达图组件
 */
import React, { useState, useEffect } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label } from 'bizcharts';
import DataSet from '@antv/data-set';

const RadarChartComp = (props) => {
  const { radarData = [], indicatorsList = [] } = props;
  const { DataView } = DataSet;

  const [data, setData] = useState([]);

  useEffect(() => {
    const list = radarData.concat();
    list.forEach((item) => {
      item.value = item.value ? parseFloat(item.value) : 0;
    });
    setData(list);
  }, radarData);

  const dv = new DataView().source(data);

  dv.transform({
    type: 'fold',
    fields: ['value'], // 展开字段集
    key: 'user', // key字段
    value: 'score', // value字段
  });

  const scale = {
    score: {
      min: 0,
      max: 1000,
      tickInterval: 200,
    },
  };

  const areaColor = ['user', ['rgba(54,194,207, 0.1)']]; // 区域颜色填充值
  const lineColor = ['user', ['#36C2CF']]; // 区域颜色填充值

  /**
   * 获取指标详细介绍
   * @param {*} title
   */
  const getItemContent = (title) => {
    let rtnStr = '';

    if (indicatorsList.length && title) {
      indicatorsList.forEach((item) => {
        if (item.title === title) {
          rtnStr = item.content;
        }
      });
    }
    return rtnStr;
  };

  return (
    <>
      {radarData.length && (
        <Chart
          // height={600}
          // width={540}
          data={dv.rows}
          scale={scale}
          padding={[30, 20, 20, 20]}
          forceFit
        >
          <Coord type="polar" radius={0.8} />
          <Axis
            name="item"
            line={null}
            tickLine={null}
            grid={{
              lineStyle: {
                lineDash: null,
              },
              hideFirstLine: false,
            }}
            label={{
              offset: 20,
              textStyle: {
                fill: 'rgba(0,0,0,0.25)',
                fontSize: '12',
                fontWeight: '400',
              },
              htmlTemplate(text) {
                return `<div style='width: 60px; text-align: center;'>
                          ${text}
                        </div>`;
              },
            }}
          />
          <Tooltip
            useHtml
            inPlot={false}
            htmlContent={(title, items) => {
              return `<div
                      class="g2-tooltip"
                      style='
                        width: 245px;
                        position: absolute;
                        background: rgba(255,255,255,0.95);
                        box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.12);
                        color: #000;
                        border-radius: 2px;
                      '
                    >
                      <ul style='margin: 0; padding: 12px 16px 6px 16px;'>
                        <li style='list-style: none; font-size: 12px; font-weight: 400; line-height: 16px;'>
                          <span style='line-height: 22px;font-weight: 500;'>
                            ${title}:
                          </span>
                          <span style='font-size: 14px; font-weight: 600; color: #36C2CF;'>
                            ${items[0]?.value ?? ''}
                          </span>
                        </li>
                      </ul>
                      <div
                        style='
                          padding: 0 16px 12px 16px;
                        '
                      >
                        ${getItemContent(title)}
                      </div>
                    </div>`;
            }}
          />
          <Axis
            name="score"
            line={null}
            tickLine={null}
            grid={{
              type: 'polygon',
              lineStyle: {
                lineDash: null,
              },
              alternateColor: 'rgba(0, 0, 0, 0.04)',
            }}
            label={{
              textStyle: {
                fill: 'rgba(0,0,0,0.25)',
                fontSize: '12',
                fontWeight: '400',
              },
            }}
          />
          <Geom type="area" position="item*score" color={areaColor} />
          <Geom type="line" position="item*score" color={lineColor} size={2}>
            <Label
              content="item"
              offset={15}
              textStyle={{
                textAlign: 'start',
                fill: '#36C2CF',
                fontSize: '12',
                fontWeight: '600',
                textBaseline: 'top',
              }}
              autoRotate={false}
              formatter={(text, item) => {
                return item?.point?.score ?? 0;
              }}
            />
          </Geom>
        </Chart>
      )}
    </>
  );
};

export default RadarChartComp;
