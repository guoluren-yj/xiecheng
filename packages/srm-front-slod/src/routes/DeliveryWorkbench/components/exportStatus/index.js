import React, { Fragment, useEffect, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import request from 'hzero-front/lib/utils/request';
import { SRM_SLOD } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { indexDS } from './indexDS';

const organizationId = getCurrentOrganizationId();

const ExportStatus = (props) => {
  const { code, headerId, lineId, remote } = props;
  const indexDs = useMemo(() => new DataSet(indexDS()), [code]);

  useEffect(() => {
    indexDs.setQueryParameter('params', {
      nodeTemplateCode: code,
      deliveryHeaderId: headerId,
      deliveryLineId: lineId,
    });
    indexDs.query();
  }, [code]);

  const execute = async (record) => {
    indexDs.status = 'submitting';
    const list = record.toData();
    const res = await request(
      `${SRM_SLOD}/v1/${organizationId}/delivery/${code}/${list.recordId}/re-sync?campKey=p`,
      {
        method: 'PUT',
        body: list,
      }
    );
    if (getResponse(res)) {
      indexDs.query();
      indexDs.status = 'ready';
    } else {
      indexDs.status = 'ready';
    }
  };

  const columns = [
    {
      name: 'exportTypeMeaning',
      width: 160,
    },
    {
      name: 'exportStatusMeaning',
      width: 80,
      renderer: ({ value, record }) => {
        switch (record.get('exportStatus')) {
          case 'IMPORTING':
            return (
              <Tag color="yellow" style={{ border: 'none' }}>
                <span>
                  {intl.get('slod.deliveryWorkbench.model.common.tongbuzhong').d('同步中')}
                </span>
              </Tag>
            );
          case 'NONE':
            return (
              <Tag color="gray" style={{ border: 'none' }}>
                <span>
                  {intl.get('slod.deliveryWorkbench.model.common.notongbu').d('无需同步')}
                </span>
              </Tag>
            );
          case 'SUCCESS':
            return (
              <Tag color="green" style={{ border: 'none' }}>
                <span>{value}</span>
              </Tag>
            );
          case 'FAIL':
            return (
              <Tag color="red" style={{ border: 'none' }}>
                <span>{value}</span>
              </Tag>
            );
          default:
            return (
              <Tag color="gray" style={{ border: 'none' }}>
                <span>
                  {intl.get('slod.deliveryWorkbench.model.common.notongbu').d('无需同步')}
                </span>
              </Tag>
            );
        }
      },
    },
    {
      name: 'synchronous',
      width: 80,
      renderer: ({ record }) => (
        <a
          disabled={record.get('exportStatus') !== 'FAIL'}
          onClick={() => {
            const { cuxExecuteFunc } = remote?.props?.process || {};
            if (remote && cuxExecuteFunc && typeof cuxExecuteFunc === 'function') {
              return cuxExecuteFunc({ indexDs, record, callback: execute });
            }
            return execute(record);
          }}
        >
          {intl.get(`slod.deliveryWorkbench.model.common.resynchronization`).d('重新同步')}
        </a>
      ),
    },
    {
      name: 'exportMessage',
      width: 160,
    },
    {
      name: 'externalSystemCode',
      width: 160,
    },
  ];
  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 155px)' }}>
        <Table
          dataSet={indexDs}
          columns={columns}
          boxSizing="wrapper"
          style={{ maxHeight: `calc(100% - 22px)` }}
        />
      </div>
    </Fragment>
  );
};

export default ExportStatus;
