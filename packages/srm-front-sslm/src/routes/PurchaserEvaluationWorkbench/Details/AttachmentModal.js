/*
 * @Date: 2024-02-22
 * @Author: ZLH
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React, { Fragment, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

const AttachmentModal = ({ dataSet, customizeTable = e => e, custLoading, customizeCode }) => {
  const columns = useMemo(
    () => [
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'scoreAttachmentUuid',
        width: 120,
      },
    ],
    []
  );

  return (
    <Fragment>
      {customizeTable(
        {
          code: customizeCode,
        },
        <Table dataSet={dataSet} columns={columns} custLoading={custLoading} />
      )}
    </Fragment>
  );
};

export default AttachmentModal;
