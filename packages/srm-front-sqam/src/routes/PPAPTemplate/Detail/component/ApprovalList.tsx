// 项目审批方式
import React, { useMemo, useContext, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

import { Store } from '../stores/StoreProvider';
import type { StoreValueType } from '../stores/StoreProvider';
import styles from '../index.less';


const ApprovalList = () => {
  const { viewFlag, approvalLineDs, customizeTable } = useContext<StoreValueType>(Store);

  useEffect(() => {
    approvalLineDs.query();
  }, [approvalLineDs]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'approvePoint',
      },
      {
        name: 'approveMethod',
        editor: !viewFlag,
      },
      {
        name: 'approveRoleLov',
        editor: !viewFlag,
      },
    ];
  }, [viewFlag]);


  return (
    <div className={styles['sqam-ppap-approval']}>
      {customizeTable(
        { code: 'SQAM.PPAP_DELIVERY_TEMP_DEFINITION_DETAIL.APPROVAL_LIST' },
        <Table
          customizable
          dataSet={approvalLineDs}
          columns={columns}
        />
      )}
    </div>

  );
};

export default observer(ApprovalList);
