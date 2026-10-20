import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { EleResize } from '@/utils/eleResize';

const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');

let chartDoms = null;
let myeChart = null;
let allDataDom = null;
let allDataChart = null;

let uniqueArray = [];
let relationsList = [];

const RiskMapModal = ({ record }) => {
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
          restore: {
            show: true,
            icon: `image://${refreshSrc}`,
          },
          // saveAsImage: {
          //   show: true,
          //   icon: `image://${downloadSrc}`,
          // },
          myTool1: {
            show: true,
            title: '下载为图片',
            icon: `image://${downloadSrc}`,
            onclick: handleExportChart,
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
          // roam: 'move',
          itemStyle: {
            color: ({ data }) => {
              const name = data?.name ?? '';
              const colorStr =
                name.includes('有限') || name.includes('公司') || name.includes('合伙')
                  ? '#66a3e8'
                  : '#e85364';
              return colorStr;
            },
          },
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

    chartDoms = document.getElementById('supplier-relation-mining-modal-map');
    myeChart = echarts.init(chartDoms);

    allDataDom = document.getElementById('mining-all-data-chart');
    allDataDom.style.width = '1000px';
    allDataDom.style.height = '600px';
    allDataChart = echarts.init(allDataDom);
    // myeChart.on('mousemove', e => {
    //   console.log(' mouse move : ', e);
    // }); // 拖拽结束

    EleResize.on(chartDoms, listener);

    myeChart.setOption(option);
    allDataChart.setOption(option);
  }, [record]);

  // 图表自适应
  const listener = () => {
    myeChart.resize();
  };

  /**
   * 下载图表
   */
  const handleExportChart = () => {
    // 获取图表的数据 URL
    const dataURL = allDataChart.getDataURL({
      type: 'png', // 可以根据需要修改为其他格式，如 'jpeg'
      pixelRatio: 2, // 图片分辨率，根据需要进行调整
      backgroundColor: '#fff', // 图片背景色，根据需要进行调整
    });

    // 创建一个虚拟的下载链接并模拟点击下载
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'echarts.png'; // 下载的文件名，可以根据需要修改
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <>
      <div style={{ height: '100%', background: '#E5E7EC' }}>
        <div
          id="supplier-relation-mining-modal-map"
          style={{ height: '100%', background: '#E5E7EC' }}
        />
        <div id="mining-all-data-chart" style={{ display: 'none' }} />
      </div>
    </>
  );
};

export default RiskMapModal;
