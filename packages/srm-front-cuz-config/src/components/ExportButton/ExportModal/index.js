import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { treeDS, CHECK_KEY, PRIMARY_KEY } from '../store';
import styles from '../index.less';
import SearchInput from './SearchInput';
import UnitTree from './UnitTree';
import ExportUnits from './ExportUnits';

const ExportModal = ({ closeModal, onExport }) => {
  const [checkedKeys, setCheckedKeys] = useState([]);
  const treeDs = useMemo(() => new DataSet(treeDS()), []);
  const treeDataCacheKeys = useMemo(() => new Set(), []);
  const unitTreeRef = useRef();

  const [unitTypeObj, setUnitTypeObj] = useState({});
  useEffect(()=>{
    queryMapIdpValue({
      custType: 'HPFM.CUST.FIELD_CUST_TYPE',
      unitType: 'HPFM.CUST.UNIT_TYPE',
    }).then(res => {
      if(getResponse(res)){
        const _unitTypeObj = {};
        res.unitType.forEach(i => {
          _unitTypeObj[i.value] = i.meaning;
        });
        setUnitTypeObj(_unitTypeObj);
      }
    });
  }, []);
  const filterData = useCallback(filterValue => {
    if (unitTreeRef.current && unitTreeRef.current.filterDataByName) {
      unitTreeRef.current.filterDataByName(filterValue);
    }
  });

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
          .get('hpfm.individual.message.confirm.selected.atLeastUnit')
          .d('请至少选择一个单元进行导出'),
      });
      return;
    }
    const unitCodes = checkedRecords.map(item => item.unitCode);
    onExport(unitCodes);
  }, [checkedKeys]);

  const filterCheckedKeys = () => {
    return treeDs
      .filter(r => r.get(CHECK_KEY) && !isNil(r.get('unitName')))
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
          {intl.get('hpfm.individual.view.title.selectExportUnit').d('选择导出单元')}
        </div>
        <div className={styles['left-query-input']}>
          <SearchInput filterData={filterData} />
        </div>
        <div className={styles['left-tree']}>
          <UnitTree
            treeDs={treeDs}
            treeDataCacheKeys={treeDataCacheKeys}
            checkedRecords={checkedRecords}
            unitTypeObj={unitTypeObj}
            unitTreeRef={unitTreeRef}
            onCheck={handleCheck}
          />
        </div>
        <div className={styles['left-footer']}>
          <Button color="primary" onClick={handleExport}>
            {intl.get('hzero.common.export').d('导出')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </div>
      <div className={styles['right-content']}>
        <ExportUnits
          checkedRecords={checkedRecords}
          onUnCheckTreeRecord={handleUnCheckTreeRecord}
          unitTypeObj={unitTypeObj}
        />
      </div>
    </div>
  );
};

export default ExportModal;
