import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';

const ObserverBtn = observer(({ ds, title, fn = e => e, ...rest }) => {
  return (
    <Button disabled={ds.selected.length <= 0} onClick={fn} {...rest}>{title}</Button>
  );
});

export { ObserverBtn };
