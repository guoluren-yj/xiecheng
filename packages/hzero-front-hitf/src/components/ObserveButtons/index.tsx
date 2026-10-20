import React from 'react';
import { Button as ObserveButton } from 'hzero-ui';
import { observer } from 'mobx-react-lite';

const Button: React.FC<any> = observer(({ dataSet, children, ...props }) => {
  let isSelected = false;
  if (dataSet) {
    isSelected = dataSet.selected.length === 0;
  }
  return (
    <ObserveButton disabled={isSelected} {...props}>
      {children}
    </ObserveButton>
  );
});

export default Button;
