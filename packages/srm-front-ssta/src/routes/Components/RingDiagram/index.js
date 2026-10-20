import React from 'react';
import * as echarts from 'echarts';

class RingDiagram extends React.Component {
  state = {
    // 指定图表的配置项和数据
    option: {
      tooltip: {
        trigger: 'none',
      },
      legend: {
        type: 'plain',
        top: 'center',
        left: '40%',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        formatter(value) {
          const newVelue = value.split(' ');
          // 参数传过来的是根据空格拼接的，去掉最后一个空格为要显示的name，取分割的最后一个值为value值
          const name = value.replace(/\s+\S*$/, '');
          const len = newVelue.length;
          return `{val|${name}} {number|${newVelue[len - 1]}}`;
        },
        tooltip: {
          show: true,
        },
        textStyle: {
          overflow: 'truncate',
          ellipsis: '...',
          align: 'right',
          width: 100,
          rich: {
            val: {
              color: '#4E5769',
              align: 'left',
            },
            number: {
              color: '#000',
              align: 'right',
            },
          },
        },
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['70%', '80%'],
          startAngle: 220,
          label: {
            normal: {
              show: false,
            },
          },
          data: this.props.data || [],
          // animationEasingUpdate: 'cubicInOut',
          // animationDurationUpdate: 400,
          borderRadius: 0,
          legendHoverLink: false,
          right: '130',
        },
      ],
    },
  };

  componentDidMount() {
    // 初始化echarts实例
    this.dashboard = echarts.init(this.dash);
    // 使用配置项
    this.dashboard.setOption(this.state.option);
  }

  render() {
    return (
      <div
        style={{
          width: '220px',
          height: '80px',
        }}
      >
        <div
          ref={(el) => {
            this.dash = el;
          }}
          id="mains"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }
}

export default RingDiagram;
