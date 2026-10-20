import React from 'react';
import { observer } from 'mobx-react';
import SupplierComp from './SupplierComp';
import styles from './index.less';

const SupplierList = (props = {}) => {
  const { dataSource } = props || {};
  return (
    <div
      className={styles['content-list']}
      style={{ maxHeight: dataSource?.length > 1 && '700px' }}
    >
      {dataSource.map((item, index) => {
        const itemProps = {
          headerInfo: item,
          length: dataSource?.length,
          indexNum: index,
        };
        return <SupplierComp {...itemProps} />;
      })}
    </div>
  );
};

export default observer(SupplierList);
