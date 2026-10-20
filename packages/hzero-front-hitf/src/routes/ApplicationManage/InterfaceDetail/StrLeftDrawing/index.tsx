import React, { useRef } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';

import TreeShow from './TreeShow';
import styles from './index.less';

const Index = ({ openModal, handleDelete, dataSource, handleSelect, defaultSelectId, typeFlag }) => {
  const treeShowRef: any = useRef();

  const treeShowProps = {
    dataSource,
    models: {
      label: 'paramHeaderName',
    },
    treeShowRef,
    openModal,
    handleDelete,
    handleSelect,
    defaultSelectId,
    typeFlag,
  };

  return (
    <div className={styles['left-wrapper']}>
      <div className={styles['left-wrapper-title']}>{intl.get('hitf.common.relationship.maintenance').d('关联关系维护')}</div>
      <div style={{ marginTop: '-8px' }}>
        <TreeShow {...treeShowProps} />
      </div>
    </div>
  );
};
export default formatterCollections({ code: ['hitf.common', 'hmde.boComposition'] })(Index);
