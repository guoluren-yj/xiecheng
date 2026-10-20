import React, { memo, useState, useMemo, useCallback, useRef } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { isNil } from 'lodash';

import { treeDS, CHECK_FIELD, PRIMARY_FIELD, LEAF_FIELD } from '../store';
import styles from '../index.less';
import SearchInput from './SearchInput';
import UnitTree from './UnitTree';
import ExportUnits from './ExportUnits';

function ExportModal({ closeModal, onExport }) {
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const treeDs = useMemo(() => new DataSet(treeDS()), []);
  const treeCacheKeySet = useMemo(() => new Set(), []);
  const unitTreeRef = useRef();

  const filterData = useCallback((filterValue) => {
    if (unitTreeRef.current && unitTreeRef.current.filterDataByName) {
      unitTreeRef.current.filterDataByName(filterValue);
    }
  }, []);

  const checkedRecords = useMemo(() => {
    if (!checkedKeys.length) {
      return [];
    }
    if (unitTreeRef.current && unitTreeRef.current.filterDataByKeys) {
      return unitTreeRef.current.filterDataByKeys(checkedKeys);
    }
  }, [checkedKeys]);

  const handleExport = useCallback(async () => {
    if (!checkedRecords.length) {
      notification.warning({
        message: intl
          .get('srm.common.message.confirm.selected.atLeastServiceDefinition')
          .d('请至少选择一个服务定义进行导出'),
      });
      return;
    }
    const ids = checkedRecords.map((record) => record.id);
    setLoading(true);
    const flag = await onExport(ids);
    if (flag) {
      closeModal();
    }
    setLoading(false);
  }, [checkedRecords]);

  const filterCheckedKeys = useCallback(() => {
    return treeDs
      .filter((r) => r.get(CHECK_FIELD) && !isNil(r.get(LEAF_FIELD)))
      .map((item) => item.get(PRIMARY_FIELD));
  }, [treeDs]);

  // 缓存的记录，防止因输入查询条件而不显示
  const filterCacheCheckedKeys = useCallback(() => {
    if (!checkedKeys.length) {
      return [];
    }
    return checkedKeys.filter((key) => !treeCacheKeySet.has(key));
  }, [checkedKeys, treeCacheKeySet]);

  const handleCheck = useCallback(() => {
    const newCheckedKeys = [...filterCacheCheckedKeys(), ...filterCheckedKeys()];
    setCheckedKeys(newCheckedKeys);
  }, [filterCacheCheckedKeys, filterCheckedKeys]);

  const handleUnCheckTreeRecord = useCallback(
    (unCheckKey) => {
      const record = treeDs.find((item) => item.get(PRIMARY_FIELD) === unCheckKey);
      if (record) {
        record.set(CHECK_FIELD, false);
      }
      const newCheckedKeys = checkedKeys.filter((key) => key !== unCheckKey);
      setCheckedKeys(newCheckedKeys);
    },
    [treeDs, checkedKeys]
  );

  return (
    <div className={styles['content-container']}>
      <div className={styles['left-content']}>
        <div className={styles['left-title']}>
          {intl.get('srm.common.view.title.selectServiceDefinition').d('选择导出服务定义')}
        </div>
        <div className={styles['left-query-input']}>
          <SearchInput filterData={filterData} />
        </div>
        <div className={styles['left-tree']}>
          <UnitTree
            treeDs={treeDs}
            treeCacheKeySet={treeCacheKeySet}
            checkedRecords={checkedRecords}
            unitTreeRef={unitTreeRef}
            onCheck={handleCheck}
          />
        </div>
        <div className={styles['left-footer']}>
          <Button color={ButtonColor.primary} loading={loading} onClick={handleExport}>
            {intl.get('hzero.common.export').d('导出')}
          </Button>
          <Button disabled={loading} onClick={closeModal}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </div>
      <div className={styles['right-content']}>
        <ExportUnits
          checkedRecords={checkedRecords}
          onUnCheckTreeRecord={handleUnCheckTreeRecord}
        />
      </div>
    </div>
  );
}

export default memo(ExportModal);
