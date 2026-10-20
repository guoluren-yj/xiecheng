import React, { useMemo, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { sizeChangerRenderer } from '../../components/utils';
import TableList from './TableList';
import styles from './index.less';

const Index = (props) => {
  const { dataSet, openModal, modalRef, modal, changePagination } = props;
  const columns = useMemo(() => {
    return [
      {
        name: 'companyName',
        renderer: ({ record }) => {
          return (
            <TableList record={record} dataSet={dataSet} openModal={openModal} modalRef={modalRef} modal={modal} />
          );
        },
      },
    ];
  }, [dataSet, openModal, modalRef, modal, TableList]);

  return (
    <Fragment>
      <Table
        dataSet={dataSet}
        columns={columns}
        queryBar="none"
        pagination={{
          hideOnSinglePage: true,
          showSizeChangerLabel: false,
          showTotal: false,
          showPager: true,
          showQuickJumper: false,
          sizeChangerPosition: 'right',
          sizeChangerOptionRenderer: sizeChangerRenderer,
          // onChange: changePagination,
        }}
        className={styles['common-table']}
        // style={{ maxHeight: `calc(100vh - 400px)` }}
      />
    </Fragment>
  );
};
export default observer(Index);
