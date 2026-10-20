/*
 * ViewScoreResult - 查看评分结果
 * @Date: 2024-07-05 13:48:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { isNil, isEmpty } from 'lodash';
import { Table, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { RenderReminder } from '@/routes/components/utils/appraisal';
import { handleParamQuery, hanldeScoreStatus } from './utils';
import { getSupplierIndicatorDs } from '../stores/getScoreCombineTableDS';

const ViewScoreResult = ({ record }) => {
  const { evalRespRule, evalLineId } = record.get(['evalRespRule', 'evalLineId']) || {};
  const dataSet = useDataSet(() => getSupplierIndicatorDs({ evalRespRule, evalLineId }), [
    evalRespRule,
    evalLineId,
  ]);

  useEffect(() => {
    dataSet.query();
  }, [evalRespRule, evalLineId]);

  const columns = [
    {
      name: 'indicatorCode',
      width: 160,
    },
    {
      name: 'indicatorName',
      width: 200,
    },
    {
      name: 'indicatorType',
      width: 100,
    },
    {
      name: 'scoreType',
      width: 100,
    },
    {
      name: 'processRemark',
      width: 150,
    },
    {
      name: 'paramQuery',
      width: 100,
      renderer: ({ record: curRecord }) => {
        const { scoreType, processStatus } = curRecord.get(['scoreType', 'processStatus']) || {};
        return scoreType === 'SYSTEM' && processStatus === 'COMPLETE' ? (
          <a onClick={() => handleParamQuery(curRecord)}>
            {intl.get('sslm.common.view.title.paramQuery').d('参数值查询')}
          </a>
        ) : (
          '-'
        );
      },
    },
    {
      name: 'evalStandard',
      width: 120,
    },
    {
      name: 'evalWeight',
      width: 100,
    },
    {
      name: 'benchmarkScore',
      width: 100,
    },
    {
      name: 'vetoFlag',
      width: 100,
      renderer: ({ value, record: curRecord }) => {
        const { indicatorType } = curRecord?.get(['indicatorType']) || {};
        return indicatorType === 'VETO' ? yesOrNoRender(value || 0) : '-';
      },
    },
    {
      name: 'standardFlag',
      width: 100,
      renderer: ({ value, record: curRecord }) => {
        const { indicatorType } = curRecord?.get(['indicatorType']) || {};
        return indicatorType === 'TICK' ? yesOrNoRender(value || 0) : '-';
      },
    },
    {
      name: 'indOptFlag',
      width: 100,
      renderer: ({ value, record: curRecord }) => {
        const { indicatorType } = curRecord?.get(['indicatorType']) || {};
        return indicatorType === 'OPT' ? yesOrNoRender(value || 0) : '-';
      },
    },
    {
      name: 'scoreFrom',
      width: 100,
    },
    {
      name: 'scoreTo',
      width: 100,
    },
    {
      name: 'finalScore',
      width: 100,
      renderer: ({ value, record: curRecord }) => {
        const { children, kpiEvalTplIndRemind } =
          curRecord?.get(['children', 'kpiEvalTplIndRemind']) || {};
        return [
          isNil(value) ? (
            '-'
          ) : !isEmpty(children) ? (
            <span>{value}</span>
          ) : (
            <a onClick={() => hanldeScoreStatus(curRecord)}>{value}</a>
          ),
          !isEmpty(kpiEvalTplIndRemind) && (
            <RenderReminder kpiEvalTplIndRemind={kpiEvalTplIndRemind} />
          ),
        ];
      },
    },
    {
      name: 'checkDetailScore',
      width: 100,
    },
    {
      name: 'evalWeightScore',
      width: 100,
    },
    {
      name: 'indicatorLevelCode',
      width: 100,
    },
    {
      name: 'respRemarks',
      width: 150,
    },
  ];

  return <Table dataSet={dataSet} columns={columns} />;
};

export default ViewScoreResult;
