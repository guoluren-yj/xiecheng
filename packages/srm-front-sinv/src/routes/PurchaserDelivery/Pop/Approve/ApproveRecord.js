import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ApproveDS } from './ApproveDS';

const ApproveRecord = (props) => {
  const { asnHeaderId } = props;
  const ApproveDataSet = useMemo(() => new DataSet(ApproveDS()), []);
  const ApproveDs = useMemo(() => new DataSet(ApproveDS()), []);

  useEffect(() => {
    ApproveDataSet.setQueryParameter('params', {
      asnHeaderId,
    });
    ApproveDataSet.query().then((res) => {
      if (res && res?.length) {
        const data = res
          .reduce((pre, current) => [...pre, ...(current.historicTaskExtList || [])], [])
          .reverse();
        ApproveDs.loadData(data);
      }
    });
  }, []);

  const columns = [
    {
      name: 'endTime',
    },
    {
      name: 'action',
    },
    {
      name: 'name',
    },
    {
      name: 'assigneeName',
    },
    {
      name: 'comment',
    },
    {
      name: 'attachmentUuid',
    },
  ];

  return (
    <Fragment>
      <Table columns={columns} dataSet={ApproveDs} />
    </Fragment>
  );
};

export default ApproveRecord;
