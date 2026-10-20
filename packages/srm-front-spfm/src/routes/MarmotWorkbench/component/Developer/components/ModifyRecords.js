import React from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Content, Header } from 'components/Page';
import { getModifyRecordsTableDs } from '../store/modifyRecordsDs';

function ModifyRecords(props = {}) {
  const {
    valueDs: { modifyRecordsTableDs },
  } = props;

  const tableColumns = [
    {
      name: 'tenantName',
      width: 200,
    },
    {
      name: 'code',
      width: 200,
    },
    {
      name: 'type',
      width: 150,
    },
    {
      name: 'description',
      minWidth: 300,
    },
    {
      name: 'lastUpdateDate',
      width: 200,
    },
  ];

  return (
    <>
      <Header title={intl.get('spfm.modifyRecords.head.modifyRecords.title').d('我的修改项')} />
      <Content>
        <Table dataSet={modifyRecordsTableDs} columns={tableColumns} />
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['spfm.modifyRecords', 'hzero.common'],
})(
  withProps(
    () => {
      const modifyRecordsTableDs = new DataSet(getModifyRecordsTableDs());
      const valueDs = {
        modifyRecordsTableDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(ModifyRecords)
);
