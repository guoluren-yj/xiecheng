import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export const DeleteButton = observer(({dataSet, onClick = e => e, children}) => (
  <Button
    funcType="flat"
    icon="delete_sweep"
    color="primary"
    disabled={dataSet.selected.length < 1}
    onClick={onClick}
  >
    {children || intl.get('hzero.common.button.batchDelete').d('批量删除')}
  </Button>
));
