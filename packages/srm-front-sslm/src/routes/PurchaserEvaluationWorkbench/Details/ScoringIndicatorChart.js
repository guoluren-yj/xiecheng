import React, { useEffect, useState, useCallback } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord } from 'bizcharts';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import ChartDataSet from '@antv/data-set';
import { Breadcrumb } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { featchChartData } from '@/services/purchaserEvaluationWorkbenchServices';

const BreadcrumbItem = Breadcrumb.Item;

const ScoringIndicatorChart = ({ evalHeaderId }) => {
  const [dsData, setDsData] = useState(null);
  const { DataView } = ChartDataSet;
  const [stepBar, setStepBar] = useState([]); // 步骤条

  const cols = {
    finalScore: {
      type: 'linear',
      minLimit: 0,
      minTickInterval: 1,
    },
    user: {
      formatter: val =>
        ({ finalScore: intl.get('sslm.purchaserEvaluationDetail.view.title.score').d('分数') }[
          val
        ]),
    },
  };
  // 下级指标点击回调
  const handStepChange = useCallback(
    e => {
      const { data: { _origin = {} } = {}, target: { name = '' } = {} } = e || {};
      const { leafFlag, indicatorId, indicatorName } = _origin || {};
      const pointFlag = name === 'point';
      // 有下级指标
      if (pointFlag && leafFlag === 0) {
        queryChartData({ parentIndicatorId: indicatorId, evalHeaderId });
        const stepObj = {
          title: indicatorName,
          parentIndicatorId: indicatorId,
        };
        const newStep = [...stepBar, stepObj];
        setStepBar(newStep);
      } else if (pointFlag && leafFlag !== 0) {
        notification.warning({
          message: intl.get('sslm.purchaserEvaluationDetail.view.warning').d('没有下级指标'),
        });
      }
    },
    [dsData, stepBar, evalHeaderId]
  );

  // 查询，格式化雷达图数据
  const queryChartData = useCallback(
    params => {
      featchChartData(params).then(res => {
        const chartData = getResponse(res);
        if (chartData) {
          const dv = new DataView().source(chartData);
          dv.transform({
            type: 'fold',
            fields: ['finalScore'],
            // 展开字段集
            key: 'user',
            // key字段
            value: 'finalScore', // value字段
          });
          setDsData(dv);
        }
      });
    },
    [dsData, stepBar, evalHeaderId]
  );

  // 点击步骤条标题回调
  const handClick = useCallback(
    (e, params) => {
      let flag = false;
      const { parentIndicatorId } = params;
      const curStepBar = stepBar
        .map(item => {
          if (item.parentIndicatorId === parentIndicatorId) {
            flag = true;
            return item;
          } else if (flag) {
            return false;
          } else {
            return item;
          }
        })
        .filter(Boolean);
      setStepBar(curStepBar);
      queryChartData({ parentIndicatorId, evalHeaderId });
    },
    [dsData, stepBar, evalHeaderId]
  );

  useEffect(() => {
    // 雷达图首页
    const defaultChart = {
      title: intl.get('sslm.purchaserEvaluationDetail.view.title.summaryIndex').d('汇总指标'),
      parentIndicatorId: -1,
    };
    if (isEmpty(stepBar)) {
      setStepBar([defaultChart]);
      const params = {
        parentIndicatorId: defaultChart.parentIndicatorId,
        evalHeaderId,
      };
      queryChartData(params);
    }
  }, [stepBar, dsData, evalHeaderId]);

  return (
    <Chart
      key={`${JSON.stringify(stepBar)}`}
      forceFit
      data={dsData}
      scale={cols}
      padding={40}
      onClick={e => handStepChange(e)}
    >
      <Breadcrumb>
        {stepBar &&
          stepBar.map(bar => {
            return <BreadcrumbItem onClick={e => handClick(e, bar)}> {bar.title} </BreadcrumbItem>;
          })}
      </Breadcrumb>
      <Coord type="polar" scale={[1, 1]} />
      <Axis
        name="indicatorName"
        line={null}
        tickLine={null}
        grid={{
          lineStyle: {
            lineDash: null,
          },
          hideFirstLine: false,
        }}
      />
      <Tooltip />
      <Axis
        name="finalScore"
        line={null}
        tickLine={null}
        grid={{
          type: 'polygon',
          lineStyle: {
            lineDash: null,
          },
          alternateColor: 'rgba(0, 0, 0, 0.04)',
        }}
      />
      {/* <Legend name="user" marker="circle" offset={30} /> */}
      <Geom type="area" position="indicatorName*finalScore" color="user" />
      <Geom type="line" position="indicatorName*finalScore" color="user" size={2} />
      <Geom
        type="point"
        position="indicatorName*finalScore"
        color="user"
        shape="circle"
        size={4}
        style={{
          stroke: '#fff',
          lineWidth: 1,
          fillOpacity: 1,
        }}
      />
    </Chart>
  );
};
export default ScoringIndicatorChart;
