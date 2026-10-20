import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { historyDiffRenderComp } from '@/routes/ssrc/InquiryHallNew/RFController/utils.js';
import styles from './index.less';

const Expert = observer((props) => {
  const { customizeTable, expertDs, consultationDs, getCustomizeUnitCode, viewType } = props;

  const columns = useMemo(
    () => [
      {
        name: 'loginName',
        width: 260,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'loginName'),
      },
      {
        name: 'expertName',
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'expertName'),
      },
      {
        name: 'expertRole',
        width: 150,
        renderer: ({ record, dataSet, text }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'expertRole', text),
      },
      consultationDs?.current?.get('bidRuleType') === 'DIFF'
        ? {
            name: 'scoreCategory',
            width: 150,
            renderer: ({ record, dataSet, text }) =>
              historyDiffRenderComp(record, dataSet, 'rfExpert', 'scoreCategory', text),
          }
        : null,
      {
        name: 'expertType',
        width: 150,
        renderer: ({ record, dataSet, text }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'expertType', text),
      },
      {
        name: 'phone',
        width: 150,
        renderer: ({ record, dataSet, text }) =>
          text ? historyDiffRenderComp(record, dataSet, 'rfExpert', 'phone', text, 'tel') : null,
      },
      {
        name: 'email',
        width: 180,
        renderer: ({ record, value, dataSet }) =>
          value ? historyDiffRenderComp(record, dataSet, 'rfExpert', 'email') : null,
      },
    ],
    [consultationDs?.current]
  );

  return (
    <React.Fragment>
      <div className={styles['expert-table']}>
        {customizeTable(
          {
            code: getCustomizeUnitCode('expertGroup', viewType),
            dataSet: expertDs,
          },
          <Table dataSet={expertDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
        )}
      </div>
    </React.Fragment>
  );
});

export default Expert;
