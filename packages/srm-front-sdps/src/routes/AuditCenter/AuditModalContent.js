import React, { useEffect } from 'react';
import {
  Table,
  // useModal,
} from 'choerodon-ui/pro';

const AuditModalContent = (props) => {
  const { dataSet, localRecord } = props;

  useEffect(() => {
    if (localRecord && localRecord.get('auditHeaderId')) {
      dataSet.queryParameter = { auditHeaderId: localRecord.get('auditHeaderId') };
      dataSet.query();
    }
    return () => {
      dataSet.data = [];
      dataSet.reset();
    };
  }, []);

  const columns = () => {
    return [{ name: 'objDetailNum' }, { name: 'objDetailName' }];
  };

  return <Table queryBar="none" columns={columns()} dataSet={dataSet} />;
};

export default AuditModalContent;
