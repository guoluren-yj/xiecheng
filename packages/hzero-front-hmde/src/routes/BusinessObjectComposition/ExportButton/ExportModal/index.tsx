import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { isNil } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';

import { treeDS, CHECK_KEY, PRIMARY_KEY } from '../store';
import styles from '../index.less';
import SearchInput from './SearchInput';
import UnitTree from './UnitTree';
import ExportUnits from './ExportUnits';

const ExportModal = ({ closeModal, onExport }: {
  closeModal: () => void;
  // eslint-disable-next-line no-unused-vars
  onExport: (params: { importTemplates: any[], exportTemplates: any[] }) => void;
}) => {
  const [checkedKeys, setCheckedKeys] = useState<any[]>([]);
  const treeDs = useMemo(() => new DataSet(treeDS()), []);
  const treeDataCacheKeys = useMemo(() => new Set(), []);
  const unitTreeRef = useRef<any>();

  const filterData = filterValue => {
    if (unitTreeRef.current && unitTreeRef.current.filterDataByName) {
      unitTreeRef.current.filterDataByName(filterValue);
    }
  };

  const checkedRecords = useMemo(() => {
    if (!checkedKeys.length) {
      return [];
    }
    if (unitTreeRef.current && unitTreeRef.current.filterDataByKeys) {
      return unitTreeRef.current.filterDataByKeys(checkedKeys);
    }
  }, [checkedKeys]);

  const handleExport = async () => {
    if (!checkedRecords.length) {
      notification.warning({
        message: intl
          .get('hmde.boComposition.message.confirm.selected.atLeastTemplate')
          .d('请至少选择一个模板进行导出'),
      });
      return;
    }
    const exportTemplates: any[] = [];
    const importTemplates: any[] = [];
    checkedRecords.forEach(item => {
      if (item.type === 'export') {
        exportTemplates.push(item.templateCode);
      } else if (item.type === 'import') {
        importTemplates.push(item.templateCode);
      }
    });
    return onExport({ exportTemplates, importTemplates });
  };

  const filterCheckedKeys = () => {
    return treeDs
      .filter(r => r.get(CHECK_KEY) && !isNil(r.get('templateCode')))
      .map(item => item.get(PRIMARY_KEY));
  };

  const filterCacheCheckedKeys = () => {
    if (!checkedKeys.length) {
      return [];
    }
    return checkedKeys.filter(key => !treeDataCacheKeys.has(key));
  };

  const handleCheck = useCallback(() => {
    const newCheckedKeys = [...filterCacheCheckedKeys(), ...filterCheckedKeys()];
    setCheckedKeys(newCheckedKeys);
  }, [checkedKeys]);

  const handleUnCheckTreeRecord = useCallback(
    unCheckKey => {
      const record = treeDs.find(item => item.get(PRIMARY_KEY) === unCheckKey);
      if (record) {
        record.set(CHECK_KEY, false);
      }
      const newCheckedKeys = checkedKeys.filter(key => key !== unCheckKey);
      setCheckedKeys(newCheckedKeys);
    },
    [checkedKeys]
  );

  return (
    <div className={styles['content-container']}>
      <div className={styles['left-content']}>
        <div className={styles['left-title']}>
          {intl.get('hmde.boComposition.view.title.selectExportTemplate').d('选择模板导出')}
        </div>
        <div className={styles['left-query-input']}>
          <SearchInput filterData={filterData} />
        </div>
        <div className={styles['left-tree']}>
          <UnitTree
            treeDs={treeDs}
            treeDataCacheKeys={treeDataCacheKeys}
            checkedRecords={checkedRecords}
            unitTreeRef={unitTreeRef}
            onCheck={handleCheck}
          />
        </div>
        <div className={styles['left-footer']}>
          <Button color={ButtonColor.primary} onClick={handleExport}>
            {intl.get('hzero.common.export').d('导出')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
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
};

export default ExportModal;
