import React from 'react';
import { observer } from 'mobx-react-lite';
import type { Record } from 'choerodon-ui/dataset';

import { TypeUI, NullAndUndefined } from '@/routes/components/Widget/Types';

interface FuncProps {
  record: Record | object,
  uiType?: TypeUI,
  styleObj: object | NullAndUndefined,
  [index: string]: any,
};

const RenderFileTotalCount = (props: FuncProps): any => {
  const {
    record = {},
    uiType = 'c7n-pro',
    styleObj = {},
    fileCountName = 'totalDisplayFileCount',
  } = props;

  const styles = {
    paddingLeft: '2px',
    ...(styleObj as object),
  };

  const { [fileCountName]: totalDisplayFileCount} =
    uiType !== 'c7n-pro' ? record : (record as Record).get([fileCountName]);

  return !totalDisplayFileCount || totalDisplayFileCount === '0' ?
  '' :
  (
    <span style={styles}>
      {totalDisplayFileCount}
    </span>
  );
};

export default observer(RenderFileTotalCount);
