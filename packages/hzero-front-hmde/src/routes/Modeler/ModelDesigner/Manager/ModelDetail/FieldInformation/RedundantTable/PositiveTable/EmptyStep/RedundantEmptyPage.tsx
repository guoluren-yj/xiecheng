/* eslint-disable no-nested-ternary */
import React, { useContext /* , { useContext } */ } from 'react';

import ImgIcon from '@/utils/ImgIcon';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import styles from '../index.less';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';

const RedundantEmptyPage = ({
  quoteRedundantTable,
  canCreateRedundantTable,
  canEditRedundantTable,
}: // appId,
{
  quoteRedundantTable: () => void;
  canCreateRedundantTable?: boolean;
  canEditRedundantTable?: boolean;
}) => {
  const modelManagerStore: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  const canNotDesignFlag =
    ((isTenantRoleLevel() || modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant') &&
      modelManagerStore.storeData.modelType === 'PLATFORM_SHARED') ||
    (!canEditRedundantTable && !canCreateRedundantTable);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        height: '90%',
      }}
    >
      <ImgIcon className={styles['redundant-empty-bg']} name="no-page@3x.png" size={200} />
      <div style={{ color: '#5A6677' }}>
        {canNotDesignFlag ? (
          '暂无相关的扩展字段'
        ) : modelManagerStore.storeData.modelType !== 'PREDEFINE' ? (
          <>
            <span>检测到当前模型暂无相关的扩展字段，如需创建扩展字段，请点击</span>
            <a style={{ cursor: 'pointer' }} onClick={quoteRedundantTable}>
              {' '}
              设计扩展表{' '}
            </a>
            <span>快速创建扩展表及字段信息</span>
          </>
        ) : (
          <span>当前模型暂无相关的扩展字段</span>
        )}
      </div>
    </div>
  );
};
export default RedundantEmptyPage;
