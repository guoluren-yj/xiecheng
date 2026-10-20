/**
 * 文件名: index.js
 * 创建时间: 2026-05-15
 * 文件描述: 导出弹窗（流程单据/流程分类树形勾选 + 已选预览）
 * 作者: Felix(LQX5731@163.com)
 * 版本号: 1.1.0
 * 最后更新时间: 2026-05-15
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';

import notification from 'utils/notification';
import intl from 'utils/intl';

import { treeDS, CHECK_KEY, PRIMARY_KEY } from '../store';
import styles from '../index.less';
import SearchInput from './SearchInput';
import UnitTree from './UnitTree';
import ExportUnits from './ExportUnits';

const ExportModal = ({ closeModal, onExport }) => {
  // 已勾选的节点唯一 key 集合
  const [checkedKeys, setCheckedKeys] = useState([]);
  const treeDs = useMemo(() => new DataSet(treeDS()), []);
  // 缓存所有节点主键，用于过滤态下也能保留勾选
  const treeDataCacheKeys = useMemo(() => new Set(), []);
  const unitTreeRef = useRef();

  /**
   * 把过滤值传递给左侧树
   */
  const filterData = useCallback((filterValue) => {
    if (unitTreeRef.current && unitTreeRef.current.filterDataByName) {
      unitTreeRef.current.filterDataByName(filterValue);
    }
  }, []);

  /**
   * 当前已勾选节点的完整记录
   */
  const checkedRecords = useMemo(() => {
    if (!checkedKeys.length) {
      return [];
    }
    if (unitTreeRef.current && unitTreeRef.current.filterDataByKeys) {
      return unitTreeRef.current.filterDataByKeys(checkedKeys) || [];
    }
    return [];
  }, [checkedKeys]);

  /**
   * 将勾选记录组装为接口需要的结构
   * { documents: [{ documentId, categoryIds: number[] }] }
   * @param {Array} records 勾选的节点
   * @returns {{ documents: Array<{ documentId:number, categoryIds:number[] }> }}
   */
  const buildExportPayload = (records) => {
    const documentMap = new Map();

    records.forEach((record) => {
      if (record.nodeType === 'document') {
        const { documentId } = record;
        if (documentId === undefined || documentId === null) return;
        if (!documentMap.has(documentId)) {
          documentMap.set(documentId, { documentId, categoryIds: [] });
        }
      }
    });

    records.forEach((record) => {
      if (record.nodeType === 'category') {
        const { documentId, categoryId } = record;
        if (documentId === undefined || documentId === null) return;
        if (!documentMap.has(documentId)) {
          documentMap.set(documentId, { documentId, categoryIds: [] });
        }
        if (categoryId !== undefined && categoryId !== null) {
          const target = documentMap.get(documentId);
          if (!target.categoryIds.includes(categoryId)) {
            target.categoryIds.push(categoryId);
          }
        }
      }
    });

    return { documents: Array.from(documentMap.values()) };
  };

  /**
   * 点击导出按钮
   */
  const handleExport = useCallback(async () => {
    if (!checkedRecords.length) {
      notification.warning({
        message: intl
          .get('smbl.checkRules.message.confirm.selected.atLeastUnit')
          .d('请至少选择一个流程单据/流程分类进行导出'),
      });
      return;
    }
    const payload = buildExportPayload(checkedRecords);
    if (!payload.documents.length) {
      notification.warning({
        message: intl
          .get('smbl.checkRules.message.confirm.selected.atLeastUnit')
          .d('请至少选择一个流程单据/流程分类进行导出'),
      });
      return;
    }

    onExport(payload);
  }, [checkedRecords, onExport]);

  /**
   * 收集 DataSet 内当前可见的勾选项
   */
  const filterCheckedKeys = () => {
    const keys = [];
    treeDs.forEach((record) => {
      if (record.get(CHECK_KEY) === true) {
        keys.push(record.get(PRIMARY_KEY));
      }
    });
    return keys;
  };

  /**
   * 过滤掉那些已经不在缓存里的旧 key
   */
  const filterCacheCheckedKeys = () => {
    if (!checkedKeys.length) return [];
    return checkedKeys.filter((key) => !treeDataCacheKeys.has(key));
  };

  /**
   * 树勾选回调
   */
  const handleCheck = useCallback(() => {
    const newCheckedKeys = Array.from(
      new Set([...filterCacheCheckedKeys(), ...filterCheckedKeys()])
    );
    setCheckedKeys(newCheckedKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedKeys]);

  /**
   * 右侧列表点 X 取消勾选
   */
  const handleUnCheckTreeRecord = useCallback(
    (unCheckKey) => {
      let target;
      treeDs.forEach((record) => {
        if (record.get(PRIMARY_KEY) === unCheckKey) {
          target = record;
        }
      });
      if (target) {
        target.set(CHECK_KEY, false);
      }
      setCheckedKeys(checkedKeys.filter((key) => key !== unCheckKey));
    },
    [checkedKeys]
  );

  return (
    <div className={styles['content-container']}>
      <div className={styles['left-content']}>
        <div className={styles['left-title']}>
          {intl.get('smbl.checkRules.view.title.selectExportUnit').d('选择导出流程单据/流程分类')}
        </div>
        <div style={{ marginTop: '8px', color: '#868D9C', lineHeight: '18px', fontWeight: '400' }}>
          {intl.get('smbl.checkRules.view.title.onlySupportJson').d('仅支持导出json文件')}
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
        />
      </div>
    </div>
  );
};

export default ExportModal;
