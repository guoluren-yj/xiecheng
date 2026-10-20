/*
 * ScoreResult - 评分结果
 * @Date: 2023-11-20 13:33:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import FilterBar from '_components/FilterBarTable/FilterBar';

import { RenderReminder } from '@/routes/components/utils/appraisal';
import { getScoreResultSearchDs } from '../stores/scoreResultSearchDs';

const ScoreCombineTable = ({
  dataSet,
  custLoading,
  customizeTable,
  customizeUnitCode,
  supplementBasicDs,
}) => {
  const { modifyScoreRange, evalGranularity, evalHeaderId } =
    supplementBasicDs?.current?.get(['modifyScoreRange', 'evalGranularity', 'evalHeaderId']) || {};

  const searchDs = useDataSet(() => getScoreResultSearchDs({ evalHeaderId }), [evalHeaderId]);
  const [queryParams, setQueryParams] = useState({});

  const handleQuery = useCallback(({ params = {} }) => {
    setQueryParams(params);
  }, []);

  const tableFilter = useCallback(
    record => {
      const { supplierId, levelCode, rankNum } = queryParams || {};
      if (isEmpty(queryParams)) {
        return true;
      }
      const {
        supplierId: currentSupplierId,
        levelCode: currentLevelCode,
        rankNum: currentRankNum,
      } = record.get(['supplierId', 'levelCode', 'rankNum']);
      return [
        [supplierId, currentSupplierId],
        [levelCode, currentLevelCode],
        [rankNum, currentRankNum],
      ]
        .filter(([value]) => !isEmpty(value))
        .every(([value, currentValue]) => String(currentValue) === String(value));
    },
    [queryParams]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'supplierNum',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'categoryName',
        hidden: evalGranularity !== 'SU+CA',
      },
      {
        name: 'itemName',
        hidden: evalGranularity !== 'SU+IT',
      },
      {
        name: 'lineScore',
        width: 80,
        renderer: ({ value, record: curRecord }) => {
          const { kpiEvalTplIndRemind } = curRecord?.get(['kpiEvalTplIndRemind']) || {};
          return [
            <span>{value}</span>,
            !isEmpty(kpiEvalTplIndRemind) && (
              <RenderReminder kpiEvalTplIndRemind={kpiEvalTplIndRemind} />
            ),
          ];
        },
      },
      {
        name: 'checkCollectScore',
        width: 80,
        editor: true,
        hidden: !modifyScoreRange?.includes('SUMMARY_SCORE'),
      },
      {
        name: 'rankNum',
        width: 100,
        renderer: ({ record }) => {
          const { rankNum, supplierTotalNum } = record?.get(['rankNum', 'supplierTotalNum']) || {};
          return rankNum ? `${rankNum}/${supplierTotalNum}` : '-';
        },
      },
      {
        name: 'levelCode',
        width: 80,
      },
      {
        name: 'checkLevelDesc',
        width: 100,
        editor: true,
        hidden: !modifyScoreRange?.includes('GRADE'),
      },
      {
        name: 'executeAction',
        width: 180,
      },
      {
        name: 'toStageDescription',
        width: 100,
      },
    ].filter(col => !col.hidden);
  }, [evalGranularity, modifyScoreRange]);

  return (
    <Fragment>
      <FilterBar
        dataSet={[searchDs]}
        onQuery={handleQuery}
        autoQuery={false}
        expandable={false}
        defaultExpand={false}
      />
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <Table
          queryBar="none"
          dataSet={dataSet}
          columns={columns}
          filter={tableFilter}
          custLoading={custLoading}
          selectionMode="none"
          style={{ maxHeight: 600 }}
        />
      )}
    </Fragment>
  );
};

export default observer(ScoreCombineTable);
