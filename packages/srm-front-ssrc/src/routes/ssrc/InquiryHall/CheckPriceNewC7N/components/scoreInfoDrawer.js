import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import tableStyles from '../Tables/index.less';

const ScoreInfoDrawer = (props) => {
  const { subScoreDs, scoreColumns: baseScoreColumns = [{}] } = props;

  const scoreColumns = useMemo(
    () => [
      {
        ...baseScoreColumns[0],
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanysName`).d('供应商名称'),
        header: ({ group }) => {
          const inHeaderRecord = group?.totalRecords?.find((record) => record.get('showInHeader'));
          return inHeaderRecord.get('supplierCompanyName');
        },
        footer: null,
      },
    ],
    []
  );
  const scoreGroups = useMemo(
    () => [
      {
        name: 'rfxLineSupplierId',
        type: 'header',
        hidden: true,
        width: 240,
      },
      {
        name: 'tempIndicateId',
        parentField: 'parentIndicateId',
        type: 'column',
        columnProps: {
          header: () => (
            <span className={tableStyles.columnsHeader}>
              {intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}
            </span>
          ),
          resizable: false,
          renderer: ({ record }) => record.get('scoreMeaning'),
          width: 240,
        },
      },
    ],
    []
  );

  return (
    <Table
      virtual
      virtualCell
      customizable={false}
      aggregations
      columnDraggable
      queryBar="none"
      className="score_table"
      columnTitleEditable
      border={false}
      dataSet={subScoreDs}
      columns={scoreColumns}
      groups={scoreGroups}
      selectionMode="none"
      highLightRow={false}
      bodyExpandable
    />
  );
};

export default ScoreInfoDrawer;
