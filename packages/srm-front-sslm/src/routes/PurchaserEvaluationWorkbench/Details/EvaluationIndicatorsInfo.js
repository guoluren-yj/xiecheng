import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { renderStatus } from '@/routes/components/utils';
import { getEvaluationIndicatorsInfoDs } from '../stores/getEvaluationIndicatorsInfoDs';

const EvaluationIndicatorsInfo = ({ dataSource }) => {
  const dataSet = useMemo(() => new DataSet(getEvaluationIndicatorsInfoDs()), []);

  useEffect(() => {
    dataSet.loadData(dataSource);
  }, []);

  const columns = [
    { name: 'completeFlag', width: 100, renderer: renderStatus },
    { name: 'indicatorCode', width: 150 },
    { name: 'indicatorName' },
    { name: 'respWeight', width: 100, align: 'right' },
    { name: 'score', width: 80, align: 'right' },
  ];

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 210 }}
      customizable
      customizedCode="sslm-purchaser-evaluation-workbench-assessment-panel" // 没有个性化编码用这种方式实现配置
    />
  );
};

export default EvaluationIndicatorsInfo;
