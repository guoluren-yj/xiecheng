import React, { useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import Style from '../index.less';

const ValidationResultModal = (props = {}) => {
  const { ds = {}, sectionFlag = false } = props;

  const batchValidateParams = useCallback(
    (list = []) => {
      if (isEmpty(list)) {
        return null;
      }

      const data = list.sort((a, b) => a - b);
      const message = data.join(',');

      return <Popover content={message}>{message}</Popover>;
    },
    [ds]
  );

  const tableColumns = useMemo(
    () => [
      {
        name: 'message',
        width: 400,
        className: 'validate-message',
        tooltip: 'none',
        renderer: ({ value }) => {
          if (!value) {
            return '';
          }

          let currentText = '';
          currentText = value.split('\n');
          return currentText?.map?.((item) => {
            return <div>{item}</div>;
          });
        },
      },
      {
        name: 'messageDetails',
        hidden: !sectionFlag,
        renderer: ({ value }) => batchValidateParams(value),
      },
    ],
    [ds, sectionFlag]
  );

  return (
    <div className={Style['ssrc-validate-table-wrapper']}>
      <Table rowKey="validateKey" dataSet={ds} columns={tableColumns} />
    </div>
  );
};

export default observer(ValidationResultModal);
