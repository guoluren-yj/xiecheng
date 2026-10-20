import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react';
import { noop } from 'lodash';
import { Table } from 'choerodon-ui/pro';

import Store from '../store/index';

const AttachmentRequirements = () => {
  const {
    commonDs: { attachRequirementDs },
    getCustomizeUnitCode,
    customizeTable = noop,
  } = useContext(Store);

  // table columns
  const columns = useMemo(() => [
    {
      name: 'attachmentTypeMeaning',
    },
    {
      name: 'attachmentUuid',
    },
    {
      name: 'fileManageName',
    },
    {
      name: 'editableFlag',
    },
    {
      name: 'remark',
    },
    {
      name: 'requiredFlag',
    },
    { name: 'sourceNodeMeaning' },
  ]);

  return customizeTable(
    {
      code: getCustomizeUnitCode('attachmentRequirements'),
      dataSet: attachRequirementDs,
    },
    <Table dataSet={attachRequirementDs} columns={columns} />
  );
};

export default observer(AttachmentRequirements);
