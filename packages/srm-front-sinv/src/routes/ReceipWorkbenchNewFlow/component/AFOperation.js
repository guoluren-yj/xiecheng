import React from 'react';
import { Card } from 'choerodon-ui';

const AFOperation = ({ children }) => {
  return (
    <Card
      style={{
        margin: '4px 16px',
        border: 'none',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </Card>
  );
};

export default AFOperation;
