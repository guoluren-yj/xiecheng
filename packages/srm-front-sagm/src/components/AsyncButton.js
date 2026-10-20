import React, { useState } from 'react';
import { Button } from 'hzero-ui';

const AsyncButton = (props) => {
  const { children, loading, onClick = (e) => e, ...btnProps } = props;
  const [_loading, setLoading] = useState(false);

  async function _handleClick(...args) {
    setLoading(true);
    await onClick(...args);
    setLoading(false);
  }

  return (
    <Button {...btnProps} loading={loading || _loading} onClick={_handleClick}>
      {children}
    </Button>
  );
};

export default AsyncButton;
