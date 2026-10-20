import React, { memo, useCallback, useEffect, useState } from 'react';
import
{
  DataSet,
  Table,
} from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { TableProps } from 'choerodon-ui/pro/lib/table/Table';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';


import { getQueryDataApi } from '../../../RuleMaintenance/Rebate/utils/api';
import { queryLineDS } from '../../../RuleMaintenance/Rebate/Detail/stores/mainDS';

interface CumulativeModalPropsType
{
  ruleId: string
}


export default memo((props: CumulativeModalPropsType) =>
{
  const { ruleId } = props;

  const [queryProps, setQueryProps] = useState({ dataSet: [] as any as DataSet, columns: [] as ColumnProps[] } as TableProps); // 存储查询视图的ds和columns

  const init = useCallback(async () =>
  {
    // 动态渲染查询视图表格
    // 1.获取labels
    const labelRes = await getQueryDataApi(ruleId);
    if (getResponse(labelRes))
    {
      const { labels = [] } = labelRes || {};
      if (labels && labels.length > 0)
      {
        // columns
        const queryColumns = labels.map((fieldObj) =>
        {
          const { dimensionCode, dimensionOperation } = fieldObj || {};

          if (['NOT_EQUALS', 'NOT_IN'].includes(dimensionOperation))
          {
            return {
              name: dimensionCode,
              width: 150,
              help: intl.get(`spfp.common.title.message.notTipBackgroundColor`).d('红色字体表示不等于关系，即当前维度值不包含下述罗列值'),
              renderer: ({ value }) => (<span style={{ color: 'red' }}>{value}</span>),
            };
          }
          return {
            name: dimensionCode,
            width: 150,
          };

        });
        const fields = labels.map(fieldObj =>
        {
          const { dimensionCode, dimensionName } = fieldObj || {};
          return {
            name: dimensionCode,
            type: FieldType.string,
            label: dimensionName,
          };
        });
        // 动态获取查询视图的dataSet
        const queryDs = new DataSet(queryLineDS(fields, ruleId));
        // 动态的获取查询视图的数据
        queryDs.query();
        setQueryProps({
          dataSet: queryDs,
          columns: queryColumns,
        });
      }
    }

  }, [ruleId]);

  useEffect(() =>
  {
    if (ruleId) init();
  }, [ruleId, init]);

  return queryProps?.columns?.length ? (
    <div style={{ height: 'calc(100vh - 300px)' }}>
      <Table {...queryProps} style={{ maxHeight: 'calc(100% - 35px)' }} />
    </div>
  ) : null;
});