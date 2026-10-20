import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
// import { SRM_SPUC } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

import { feedbackGetVerification } from './store/feedbackGetVerificationDs';
import styles from './index.less';

// const organizationId = getCurrentOrganizationId();

const FeedbackGetVerificationTable = (props) => {
  const { message, queryFun } = props;
  const feedbackGetVerificationDs = useMemo(
    () =>
      new DataSet({
        ...feedbackGetVerification(),
        transport: {
          read: queryFun,
        },
      }),
    []
  );
  const columns = useMemo(
    () => [
      {
        name: 'displayPoNumAndLineNum',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'closeOrCancelQuantity',
        width: 150,
      },
      {
        name: 'uomCodeAndName',
        width: 150,
      },
    ],
    []
  );
  useEffect(() => {
    feedbackGetVerificationDs.query();
  }, []);
  return (
    <div className={styles['modal-content-feedback']}>
      {message && (
        <Alert
          message={message}
          showIcon
          iconType="help"
          style={{ marginBottom: '20px', border: 'none' }}
        />
      )}
      <Table
        dataSet={feedbackGetVerificationDs}
        columns={columns}
        selectionMode="none"
        style={{ maxHeight: `calc(100% - 22px)` }}
      />
    </div>
  );
};

export default FeedbackGetVerificationTable;
