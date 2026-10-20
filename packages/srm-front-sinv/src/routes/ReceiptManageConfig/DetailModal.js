import React, { Fragment } from 'react';
import { Table, ModalContainer } from 'choerodon-ui/pro';

const SettlePool = (props) => {
  const { dataSet, columns } = props;
  const [type, setType] = React.useState('A');

  let tableRef;

  React.useEffect(() => {
    setType('B');
  }, []);

  React.useEffect(() => {
    if (tableRef) {
      tableRef.tableStore.width = 1152;
      // tableRef.forceUpdate();
    }
  }, [type]);

  return (
    <Fragment>
      <Table
        ref={(ref) => {
          tableRef = ref;
        }}
        columns={columns}
        dataSet={dataSet}
        pagination={false}
      />
      <ModalContainer location={location} />
    </Fragment>
  );
};

export default SettlePool;
