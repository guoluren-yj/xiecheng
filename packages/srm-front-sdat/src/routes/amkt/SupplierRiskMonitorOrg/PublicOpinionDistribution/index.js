/* eslint-disable no-unused-expressions */
/**
 * 新增舆情分布卡片
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect, useRef } from 'react';
import { Result, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import echarts from 'echarts';

import {
  getAddPublicOpinionDistribution,
  getMsgByLovCode,
} from '@/services/supplierRiskMonitorOrgService';
import style from './index.less';

let eTable = null; // echarts对象

export default function PublicOpinionDistribution(props = {}) {
  const { canSearch = false } = props;
  const [emojiMap, setEmojiMap] = useState({});
  const [resData, setResData] = useState(null); // resData是接口回传的数据
  const [chartsData, setChartsData] = useState(null); // chartsData是echarts需要的数据

  const divRef = useRef();

  useEffect(() => {
    // 页面变化时获取浏览器窗口的大小
    window.addEventListener('resize', handleResize);

    return () => {
      // 组件销毁时移除监听事件
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    // eslint-disable-next-line no-unused-expressions
    eTable?.resize();
  };

  // 查询等级对应的值集字段
  useEffect(() => {
    eTable?.showLoading();
    getMsgByLovCode({ code: 'SDAT.RISK_NEWS_EMOTION_TYPE' })
      .then((res) => {
        const mapObj = {};
        (res || []).forEach((item) => {
          Object.assign(mapObj, { [item?.value]: item?.meaning });
        });
        setEmojiMap(mapObj);
      })
      .finally(() => {
        eTable?.hideLoading();
      });
  }, []);

  // 等级对应的值集字段出现后查询数据
  useEffect(() => {
    if (Object.keys(emojiMap).length === 0 || !canSearch) return;
    eTable?.showLoading();
    getAddPublicOpinionDistribution()
      .then((res) => {
        if (!(res instanceof Array)) return;
        const tempData = []; // 构造临时数据
        Object.keys(emojiMap).forEach((ind) => {
          // 检查本ind是否在回传的数据内
          // eslint-disable-next-line eqeqeq
          const indexInRes = (res || []).findIndex((p) => (p?.name ?? '') == ind);
          if (indexInRes === -1) {
            tempData.push({
              name: emojiMap[ind] ?? '',
              value: 0,
              labelLine: { show: false },
              label: { show: false },
            });
          } else {
            tempData.push({
              name: emojiMap[ind] ?? '',
              value: (res || [])[indexInRes]?.value,
            });
          }
        });
        setChartsData(tempData);
        setResData(res || []);
      })
      .finally(() => {
        eTable?.hideLoading();
      });
  }, [emojiMap, canSearch]);

  // 加载完毕后初始化echarts对象
  useEffect(() => {
    if (divRef?.current) {
      eTable = echarts?.init(divRef.current);
    }
  }, []);

  // 数据查询完毕后初始化echarts对象
  useEffect(() => {
    if (divRef?.current) {
      eTable = echarts?.init(divRef.current);
    }
  }, []);

  // echarts对象赋值成功则渲染
  useEffect(() => {
    renderChart();
  }, [eTable, chartsData]);

  /**
   * 渲染图表
   */
  const renderChart = () => {
    if ((chartsData?.length ?? 0) === 0) return;
    if (eTable) {
      // 计算总数
      const total = (chartsData || []).reduce((prev, current) => {
        return prev + Number(current?.value ?? 0);
      }, 0);
      const option = {
        tooltip: {
          trigger: 'item',
        },
        grid: {
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          containLabel: true,
        },
        legend: {
          bottom: '16px',
          right: '16px',
          itemWidth: 8,
          itemHeight: 8,
          orient: 'vertical',
          selectedMode: false, // 取消图例上的点击事件
        },
        series: [
          {
            name: intl
              .get('sdat.supplierRiskMonitor.view.title.newPublicOpinionDistribution')
              .d('新增舆情分布'),
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: true,
            label: {
              normal: {
                show: true,
                position: 'center',
                color: '#4c4a4a',
                formatter: `{total|${total}}\r{active|${intl
                  .get('sdat.supplierRiskMonitor.view.title.stuff')
                  .d('条')}}`,
                rich: {
                  total: {
                    fontSize: 35,
                    color: '#454c5c',
                  },
                  active: {
                    fontSize: 14,
                    color: '#6c7a89',
                    padding: [
                      0, // 上
                      0, // 右
                      10, // 下
                      0, // 左
                    ],
                  },
                },
              },
            },
            color: ['#3ab445', '#c9cdd4', '#f25535'], // 积极到消极的颜色
            data: chartsData,
          },
          {
            name: intl
              .get('sdat.supplierRiskMonitor.view.title.newPublicOpinionDistribution')
              .d('新增舆情分布'),
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: true,
            label: {
              normal: {
                formatter: '{c}',
              },
            },
            color: ['#3ab445', '#c9cdd4', '#f25535'], // 积极到消极的颜色
            data: chartsData,
          },
        ],
      };
      eTable.showLoading();
      eTable.clear();
      eTable.setOption(option);
      eTable.hideLoading();
    }
  };

  return (
    <div className={style['out-box']}>
      <div className={style['title-bar']}>
        {intl
          .get('sdat.supplierRiskMonitor.view.title.newPublicOpinionDistribution')
          .d('新增舆情分布')}
      </div>
      {(resData?.length ?? 0) === 0 && (
        <Result
          className={style['no-data-result']}
          icon={<Icon className={style['no-data-icon']} />}
          title={
            <span>
              {intl.get('sdat.supplierRiskMonitor.view.notification.noData').d('暂无数据')}
            </span>
          }
        />
      )}
      <div
        ref={divRef}
        className={style['canvas-box']}
        style={{
          display: (resData?.length ?? 0) === 0 ? 'none' : 'block',
        }}
      />
    </div>
  );
}
