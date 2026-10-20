import React, { useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import { C7NCPopover } from '@/routes/components/CPopover/C7NPopover';

const ValidationResultModal = (props = {}) => {
  const { ds = {}, sectionFlag = false } = props || {};

  const batchValidateParams = useCallback(
    (list = []) => {
      if (isEmpty(list)) {
        return '';
      }

      const data = list.sort((a, b) => a - b);
      const message = data.join(',');

      return <C7NCPopover content={message}>{message}</C7NCPopover>;
    },
    [ds]
  );

  const tableColumns = useMemo(
    () =>
      [
        {
          name: 'message',
          width: 400,
          // renderer: ({ value }) => <C7NCPopover content={value}>{value}</C7NCPopover>,
        },
        {
          name: 'messageDetails',
          hidden: !sectionFlag,
          renderer: ({ value }) => batchValidateParams(value),
        },
      ].filter(Boolean),
    [ds, sectionFlag, batchValidateParams]
  );

  return (
    <div>
      <Table rowKey="validateKey" dataSet={ds} columns={tableColumns} style={{maxHeight: '280px'}} />
    </div>
  );
};

export default observer(ValidationResultModal);
