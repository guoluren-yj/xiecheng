import React, { useState, useMemo, useCallback } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { listLineDS } from '@/routes/ssrc/PriceLibDimension/Org/lineDS';
import styles from '../index.less';
import UnitTree from './UnitTree';

const ExportModal = ({ closeModal, onExport }) => {
  const [checkedKeys, setCheckedKeys] = useState([]);
  const treeDs = useMemo(
    () => new DataSet({ ...listLineDS(), autoQuery: false, pageSize: 1000 }),
    []
  );

  const handleExport = useCallback(() => {
    if (!checkedKeys.length) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return;
    }
    onExport(checkedKeys);
  }, [checkedKeys]);

  const handleCheck = useCallback((newCheckedKeys) => {
    setCheckedKeys(newCheckedKeys);
  }, []);

  return (
    <div className={styles['content-container']}>
      <div className={styles['left-content']}>
        <div className={styles['left-title']}>
          {intl.get('ssrc.priceLibDimension.view.title.selectExportPriceLib').d('选择导出价格库')}
        </div>
        <div className={styles['left-tree']}>
          <UnitTree treeDs={treeDs} onCheck={handleCheck} />
        </div>
        <div className={styles['left-footer']}>
          <Button color="primary" onClick={handleExport}>
            {intl.get('hzero.common.export').d('导出')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
