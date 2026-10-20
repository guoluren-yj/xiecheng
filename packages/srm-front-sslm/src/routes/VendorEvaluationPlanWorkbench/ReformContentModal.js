import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { renderStatus } from '@/routes/components/utils';
import { getReformContentDs } from './stores/getreformContentDs';

const ReformContentModal = ({ evalHeaderId, history }) => {
  const columns = useMemo(
    () => [
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
        width: 180,
      },
      {
        name: 'problemStatusMeaning',
        width: 100,
        renderer: ({ record, value, name }) => {
          return value ? (
            <span>{renderStatus({ value, name, record, iconType: 'expand_more' })}</span>
          ) : (
            <span>-</span>
          );
        },
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
    dataSet.query();
  }, []);
  return (
    <>
      <Table
        columns={columns}
        dataSet={dataSet}
        selectionMode="none"
        customizable
        customizedCode="sslm-vendor-evaluationPlan-workbench-reformContent-modal"
        autoHeight={{ type: 'maxHeight', diff: 0 }}
      />
    </>
  );
};

export default ReformContentModal;
