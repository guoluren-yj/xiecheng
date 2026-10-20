import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { renderStatus } from '@/routes/components/utils';
import { getReformContentDs } from './stores/details';

const ReformContentModal = ({ evalHeaderId, history, customizeTable }) => {
  const columns = useMemo(
    () => [
      {
        name: 'problemStatusMeaning',
        width: 100,
        renderer: ({ record, value, name }) => {
          return value ? <span>{renderStatus({ value, name, record })}</span> : <span>-</span>;
        },
      },
      {
        name: 'reformContent',
      },
      {
        name: 'problemNum',
        width: 150,
        renderer: ({ value, record }) => {
          const externalOrderId = record.get('externalOrderId');
          return value ? (
            <Button
              funcType="link"
              onClick={() => {
                history.push({
                  pathname: `/sqam/received8D/detail/${externalOrderId}`,
                });
              }}
            >
              {value}
            </Button>
          ) : (
            <span>-</span>
          );
        },
      },
      {
        name: 'problemTitle',
        width: 200,
      },
    ],
    []
  );
  const dataSet = useMemo(
    () =>
      new DataSet(getReformContentDs({ evalHeaderId, orderSource: 'siteEval', modalFlag: true })),
    []
  );

  useEffect(() => {
    dataSet.query();
  }, []);

  return customizeTable ? (
    customizeTable(
      {
        code: 'SSLM.PURCHASER_ASSESS_LIST.REFORMCONTENT_MODAL',
      },
      <Table
        columns={columns}
        dataSet={dataSet}
        style={{ maxHeight: `calc(100vh -112px)` }}
        selectionMode="none"
      />
    )
  ) : (
    <Table
      columns={columns}
      dataSet={dataSet}
      style={{ maxHeight: `calc(100vh -112px)` }}
      selectionMode="none"
    />
  );
};

export default ReformContentModal;
