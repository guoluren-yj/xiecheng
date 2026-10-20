import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const MobxButton = observer(({ dataSet, loadingState, children, dynamicDisabled, ...props }) => {
  const disabled = dataSet
    ? dynamicDisabled
      ? dynamicDisabled(dataSet)
      : dataSet.selected.length < 1
    : false;
  const stateLoading = dataSet ? dataSet.getState(loadingState) : false;
  return (
    <Button disabled={disabled} {...props} loading={stateLoading || props.loading}>
      {children}
    </Button>
  );
});

export default MobxButton;
