import React, { useEffect } from 'react';
// import intl from 'utils/intl';
import * as echarts from 'echarts';
// import { EleResize } from '@/utils/eleResize';

// const fllScreenSrc = require('@/assets/fullscreen.svg');
const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');

let chartDoms = null;
let myeChart = null;

let uniqueArray = [];
let relationsList = [];

// let fullScreen = false;

const RiskMapModal = ({ record }) => {
  // useEffect(() => {
  //   return () => {
  //     fullScreen = false;
  //   };
  // }, []);

  useEffect(() => {
    const obj = record.toData();

    formatRelationList(obj);

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
          // myFullScreen: {
          //   show: true,
          //   title: fullScreen ? '退出全屏' : '全屏显示',
          //   // icon从阿里图标复制对应的svg格式代码
          //   icon: `image://${fllScreenSrc}`,
          //   onclick: () => {
          //     fullScreen = !fullScreen;
          //     setTimeout(() => {
          //       const element = document.getElementById('supplier-relation-mining-modal-map');
          //       // 图表自适应
          //       const listener = () => {
          //         myeChart.resize();
          //       };

          //       EleResize.on(element, listener);

          //       if (element.requestFullscreen) {
          //         element.requestFullscreen();
          //       } else if (element.msRequestFullscreen) {
          //         element.msRequestFullscreen();
          //       } else if (element.webkitRequestFullScreen) {
          //         element.webkitRequestFullScreen();
          //       } else if (element.mozRequestFullscreen) {
          //         element.mozRequestFullscreen();
          //       }

          //       // 退出全屏
          //       if (element.requestFullScreen) {
          //         document.exitFullscreen();
          //       } else if (element.msRequestFullScreen) {
          //         document.msExitFullscreen();
          //       } else if (element.webkitRequestFullScreen) {
          //         document.webkitCancelFullScreen();
          //       } else if (element.mozRequestFullScreen) {
          //         document.mozCancelFullScreen();
          //       }
          //     }, 0);
          //   },
          // },
          restore: {
            show: true,
            icon: `image://${refreshSrc}`,
          },
          saveAsImage: {
            show: true,
            icon: `image://${downloadSrc}`,
          },
        },
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'circular',
          symbolSize: 100,
          roam: true,
          label: {
            show: true,
            formatter: (param) => {
              const label = param?.name ?? '';
              let result = '';

              for (let i = 0; i < label.length; i++) {
                if (i % 5 === 0 && i !== 0) {
                  result += `-${label[i]}`;
                } else {
                  result += label[i];
                }
              }

              const text = result?.split('-')?.join('\n') ?? '';
              return text;
            },
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 8],
          edgeLabel: {
            fontSize: 20,
          },
          data: uniqueArray,
          links: relationsList,
          lineStyle: {
            opacity: 0.9,
            width: 1,
            curveness: 0,
          },
        },
      ],
    };

    chartDoms = document.getElementById('supplier-relation-ship-modal-map');
    myeChart = echarts.init(chartDoms);

    myeChart.setOption(option);
  }, [record]);

  const formatRelationList = (relation = {}) => {
    const seriesData = []; // 去重的企业列表
    relationsList = []; // 节点关系列表
    uniqueArray = [];

    const subjectList = relation.SubjectList;

    if (subjectList && subjectList.length) {
      subjectList.forEach((item2) => {
        seriesData.push({
          ...item2,
          name: item2.Name,
        });
      });
    }

    if (relation.RelationList && relation.RelationList.length) {
      relation.RelationList.forEach((item2) => {
        let source = '';
        let target = '';

        if (subjectList && subjectList.length) {
          subjectList.forEach((item3) => {
            if (item2.EndNodeId === item3.NodeId) {
              target = item3.Name;
            }
            if (item2.StartNodeId === item3.NodeId) {
              source = item3.Name;
            }
          });
        }

        relationsList.push({
          ...item2,
          source,
          target,
          label: {
            show: true,
            color: '#000',
            verticalAlign: 'middle',
            fontSize: 12,
            formatter: () => {
              const labelList = (item2?.PropertyList ?? []).map((result) => result.LabelText);
              return labelList && labelList.length ? labelList.join(',') : '';
            },
          },
        });
      });
    }

    // 去重
    uniqueArray = uniqueList(seriesData);
  };

  /**
   * 对象数组去重
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].NodeId]) {
        result.push(arr[i]);
        obj[arr[i].NodeId] = true;
      }
    }
    return result;
  };

  return (
    <div style={{ height: '100%' }}>
      <div id="supplier-relation-ship-modal-map" style={{ height: '100%' }} />
    </div>
  );
};

export default RiskMapModal;
