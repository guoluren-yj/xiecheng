import React from 'react';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { useDoubleUomConfig } from '@/routes/components/utils/index';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ExecutionRecordDs from './store/executionRecordDs';
import { showRecordModal } from './recordLinks';

const ExecutionRecordDetail = (props) => {
  const { doubleUnitEnabled, from, remote, cuxPageTag } = props;
  const cuxFormProps = remote ? remote.process('SINV_EXECUTION_RECORD_DETAIL_URL_COLUMNS', { from, cuxPageTag }) || {} : {};
  const TableDs = new DataSet(ExecutionRecordDs(from, cuxFormProps));
  const organizationId = getCurrentOrganizationId();

  const handleOpenLink = (value) => {
    showRecordModal({
      from,
      width: 1000,
      url: `${SRM_SPUC}/v1/${organizationId}/rcv-trx-record-lines/${value}`,
      doubleUnitEnabled,
    });
  };

  const columns = [
    {
      name: 'realName',
      // width: 160,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'processTypeMeaning',
      // width: 130,
    },
    {
      name: 'processStatusMeaning',
      // width: 130,
    },
    ['one', 'four'].includes(from) && {
      name: 'processRemark',
      width: 150,
    },
    {
      name: 'recordHeaderId',
      // width: 150,
      renderer: ({ value }) => {
        return (
          <a onClick={() => handleOpenLink(value)}>
            {intl
              .get('sinv.receiptExecution.model.receipt.orderTypeName.errorMessage')
              .d('错误信息')}
          </a>
        );
      },
    },
  ];

  return (
    <>
      <Table
        dataSet={TableDs}
        columns={remote ? remote.process('SINV_EXECUTION_RECORD_DETAIL_COLUMNS', columns, { TableDs, cuxPageTag, doubleUnitEnabled, from }) : columns}
        customizable
        customizedCode="execution-record-retail"
        style={{ maxHeight: `calc(100vh - 350px)` }}
      />
    </>
  );
};

export default compose(
  useDoubleUomConfig(),
  formatterCollections({
    code: ['sinv.receiptExecution', 'sinv.receiptWorkbench'],
  })
)(ExecutionRecordDetail);
