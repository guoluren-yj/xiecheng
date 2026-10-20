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
        name: 'problemNum',
        width: 150,
        renderer: ({ value, record }) => {
          const externalOrderId = record.get('externalOrderId');
          return value ? (
            <Button
              funcType="link"
              onClick={() => {
                history.push({
                  pathname: `/sqam/initiated8D/detail/${externalOrderId}`,
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
      {
        name: 'reformContent',
      },
    ],
    []
  );
  const dataSet = useMemo(
    () => new DataSet(getReformContentDs({ evalHeaderId, orderSource: 'siteEval' })),
    []
  );

  useEffect(() => {
    dataSet.setQueryParameter(
      'customizeUnitCode',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.QUALITY_RECTIFICATION'
    );
    dataSet.query();
  }, []);
  return customizeTable(
    {
      code: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.QUALITY_RECTIFICATION',
    },
    <Table
      columns={columns}
      dataSet={dataSet}
      selectionMode="none"
      style={{ maxHeight: `calc(100vh - 112px)` }}
    />
  );
};

export default ReformContentModal;
