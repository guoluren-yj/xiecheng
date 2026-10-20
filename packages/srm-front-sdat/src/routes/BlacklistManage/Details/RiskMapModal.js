/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { getResponse } from 'utils/utils';
// import { EleResize } from '@/utils/eleResize';

import { fetchMapData } from '@/services/supplierBlacklistService';

const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');

let chartDoms = null;
let myeChart = null;

const RiskMapModal = ({ record }) => {
  const recordId = record?.get('recordId');

  useEffect(() => {
    fetchMapData({
      recordId,
    }).then((res) => {
      if (!getResponse(res)) return false;

      let data = [];
      if (res && res.children && res.children.length) {
        res.children.forEach((item) => {
          item.collapsed = true; // 默认折叠
        });
      }

      data = [res];

      const date = record?.get('graphUpdateTime') ?? '';
      const dateStr = new Date(date); // .toLocaleString();

      const fileName = `图谱详情${dateStr.getFullYear()}-${
        dateStr.getMonth() + 1
      }-${dateStr.getDate()} ${dateStr.getHours()}:${dateStr.getMinutes()}:${dateStr.getSeconds()}`;

      const option = {
        title: {
          text: '',
        },
        tooltip: {
          show: false,
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              show: true,
              icon: `image://${refreshSrc}`,
            },
            saveAsImage: {
              show: true,
              name: fileName,
              icon: `image://${downloadSrc}`,
            },
          },
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'tree',
            data,
            top: '5%',
            left: '25%',
            bottom: '5%',
            right: '20%',
            zoom: 0.8,
            symbolSize: 10,
            roam: true,
            itemStyle: {
              color: '#29BECD',
              borderColor: '#29BECD',
            },
            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 16,
            },
            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left',
              },
            },
            emphasis: {
              // disabled: true,
              // focus: 'descendant',
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      };

      chartDoms = document.getElementById('supplier-relation-mining-modal-map');
      myeChart = echarts.init(chartDoms);

      // // 图表自适应
      // const listener = () => {
      //   myeChart.resize();
      // };

      // EleResize.on(chartDoms, listener);

      myeChart.setOption(option);
    });
  }, []);

  return (
    <>
      <div style={{ height: '100%' }}>
        <div id="supplier-relation-mining-modal-map" style={{ height: '100%' }} />
      </div>
    </>
  );
};

export default RiskMapModal;
