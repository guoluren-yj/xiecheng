import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { StoreContext } from '../store/StoreProvider';
import { renderChangeFieldsColor, renderFieldTag } from '../utils';

// 标段/包信息
const planLineTable = observer((props) => {
  const { changeType } = props;

  const {
    onlyChangeCommonDs: { planLineTableDs: onlyChangePlanLineTableDs } = {},
    commonDs: { planLineTableDs } = {},
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  const columns = [
    {
      name: 'changeTypeMeaning',
      renderer: renderFieldTag,
    },
    {
      name: 'projectLinePlanNum',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'projectLinePlanNum' }),
    },
    {
      name: 'projectStageMeaning',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'projectStage' }),
    },
    {
      name: 'planCompleteDate',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({
          value: value && moment(value).format(DEFAULT_DATE_FORMAT),
          record,
          name: 'planCompleteDate',
        }),
    },
  ];

  if (changeType === 'onlyChange') {
    return (
      <Table
        dataSet={onlyChangePlanLineTableDs}
        columns={columns}
        style={{ maxHeight: '4.5rem' }}
      />
    );
  }
  return customizeTable(
    {
      code: getCustomizeUnitCode('projectPlanTable'),
      dataSet: planLineTableDs,
    },
    <Table dataSet={planLineTableDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default planLineTable;
