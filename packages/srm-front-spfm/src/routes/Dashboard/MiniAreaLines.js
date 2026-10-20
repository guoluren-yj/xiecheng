import React from 'react';
import { Chart, Axis, Tooltip, Geom, Legend } from 'bizcharts';
import autoHeight from '_components/Charts/autoHeight';
import styles from '_components/Charts/index.less';

@autoHeight()
export default class MiniArea extends React.Component {
  render() {
    const {
      height,
      data = [],
      forceFit = true,
      scale = {},
      borderWidth = 2,
      xAxis,
      yAxis,
      animate = true,
      tooltip = [],
      startYearDate,
    } = this.props;

    const scaleProps = {
      x: {
        type: 'cat',
        range: data.length > 1 ? [0, 1] : [0.5, 1],
        ...scale.x,
        tickCount: data.length > 12 ? 12 : null,
      },
      y: {
        // min: 0,
        ...scale.y,
      },
    };

    const chartHeight = height + 54;

    return (
      <div className={styles.miniChart} style={{ height }}>
        <div className={styles.chartContent}>
          {height > 0 && (
            <Chart
              animate={animate}
              scale={scaleProps}
              height={chartHeight}
              forceFit={forceFit}
              data={data}
              padding="auto"
            >
              <Legend />
              <Axis
                key="axis-x"
                name="x"
                label={false}
                line={false}
                tickLine={false}
                grid={false}
                {...xAxis}
              />
              <Axis
                key="axis-y"
                name="y"
                label={false}
                line={false}
                tickLine={false}
                grid={false}
                {...yAxis}
              />
              <Tooltip showTitle={false} crosshairs={false} />
              <Geom
                type="line"
                position="x*y"
                color={[
                  'yearLevel',
                  (yearLevel) => {
                    if (parseInt(yearLevel, 0) === startYearDate) return '#FCA000';
                    else if (parseInt(yearLevel, 0) === startYearDate - 1) return '#47B881';
                    else return '#3095F2';
                  },
                ]}
                size={borderWidth}
                tooltip={tooltip}
              />
            </Chart>
          )}
        </div>
      </div>
    );
  }
}
