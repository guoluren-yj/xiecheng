import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

const IdpLovListTable = props => {
  const { idpLovTableDS } = props;

  return (
    <Table dataSet={idpLovTableDS} queryFieldsLimit={2}>
      <Column name="value" />
      <Column name="meaning" />
    </Table>
  );
};

export default IdpLovListTable;
