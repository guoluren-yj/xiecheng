import React, { Fragment, useContext, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import { sizeChangerRenderer } from '../utils';
import TableList from './TableList';
import styles from './index.less';

const Index = (props) => {
  const { dataSet, modal, synthesize } = props;
  const columns = useMemo(() => {
    return [
      {
        name: 'companyName',
        tooltip: 'none',
        renderer: ({ record, dataSet }) => {
          return <TableList record={record} dataSet={dataSet} modal={modal} />;
        },
      },
    ];
  }, []);

  return (
    <Fragment>
      <Table
        queryBar="none"
        pagination={{
          hideOnSinglePage: true,
          showSizeChangerLabel: false,
          showTotal: false,
          showPager: true,
          showQuickJumper: false,
          sizeChangerPosition: 'right',
          sizeChangerOptionRenderer: sizeChangerRenderer,
        }}
        dataSet={dataSet}
        columns={columns}
        className={classNames(styles['common-table'], {
          [styles['card-table']]: synthesize,
        })}
      />
    </Fragment>
  );
};
export default observer(Index);
