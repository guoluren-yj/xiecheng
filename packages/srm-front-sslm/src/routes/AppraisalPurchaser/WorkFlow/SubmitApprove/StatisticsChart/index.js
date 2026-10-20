/*
 * StatisticsChart - 统计图
 * @Date: 2023-12-28 14:10:13
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useState } from 'react';
import { isEmpty, head } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import styles from '@/routes/AppraisalPurchaser/styles.less';
import {
  queryChartData,
  queryIndicatorType,
  queryIndicatorChartData,
} from '@/services/appraisalPurchaserService';

import PieChart from './PieChart';

const tenantId = getCurrentOrganizationId();

const StatisticsChart = ({ evalHeaderId, evalTplId }) => {
  const [chartDataSource, setChartDataSource] = useState([]);
  const [indicatorType, setIndicatorType] = useState([]);
  const [defaultType, setDefaultType] = useState(null);
  const [indicatorChartData, setIndicatorChartData] = useState([]);

  useEffect(() => {
    if (evalHeaderId) {
      // 查询除指标外的其他统计图数据
      queryChartData({ evalHeaderId }).then(response => {
        const res = getResponse(response);
        if (res) {
          const newList = res.map(item => {
            const { title, countList = [] } = item;
            let newCountList = [];
            if (title === 'collectLevel') {
              newCountList = countList.map(n => ({
                value: n.count,
                name: `${intl
                  .get(`sslm.evaluationQuery.model.evaluation.level`)
                  .d('评分等级')}${n.descMeaning || n.desc} ${n.count}`,
              }));
            } else {
              newCountList = countList.map(n => ({
                value: n.count,
                name: `${n.descMeaning || n.desc} ${n.count}`,
              }));
            }
            return {
              ...item,
              countList: newCountList,
            };
          });
          setChartDataSource(newList);
        }
      });
    }
    if (evalTplId) {
      // 查询指标类型
      queryIndicatorType({
        evalTplId,
        tenantId,
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          setIndicatorType(res);
          setDefaultType(head(res)?.evalTplIndId);
        }
      });
    }
  }, [evalHeaderId]);

  useEffect(() => {
    // 查询对应指标下的统计图数据
    if (defaultType && evalHeaderId) {
      queryIndicatorChartData({ evalHeaderId, indicatorId: defaultType }).then(response => {
        const res = getResponse(response);
        if (res) {
          const countList = res.map(n => ({
            value: n.count,
            name: `${intl
              .get(`sslm.evaluationQuery.model.evaluation.level`)
              .d('评分等级')}${n.descMeaning || n.desc} ${n.count}`,
          }));
          const indicatorData = {
            title: 'indicatorLevel',
            allCount: head(res)?.allCount,
            countList,
          };
          setIndicatorChartData([indicatorData]);
        }
      });
    }
  }, [evalHeaderId, defaultType]);

  const handleTypeChange = value => {
    setDefaultType(value);
  };

  return (
    <div
      className={styles['chart-wrap']}
      style={{ display: isEmpty(indicatorChartData) && isEmpty(chartDataSource) ? 'none' : 'flex' }}
    >
      {indicatorChartData.map(data => (
        <PieChart {...data} indicatorType={indicatorType} onTypeChange={handleTypeChange} />
      ))}
      {chartDataSource.map(data => (
        <PieChart {...data} />
      ))}
    </div>
  );
};

export default StatisticsChart;
