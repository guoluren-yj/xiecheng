import React from 'react';
// import { DataSet, Modal } from 'choerodon-ui/pro';


import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import { getCurrentOrganizationId } from 'utils/utils';

import Transfer from '../../components/Transfer';
import BatchDimensionDefine from './BatchDimensionDefine';
import CustomDimension from './CustomDimension';
import { fetchAddItem, fetchRemoveItem } from '../api';

const organizationId = getCurrentOrganizationId();

// 批次维度定义
const handleOpenBatchDefine = (noCheck = true, relationDimensionIds = [], callBack = e => e) => {
  const footer = noCheck ? {
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  } : {};
  const title = noCheck ?
    intl.get('sstk.stockConfig.button.batchDimensionManage').d('批次维度管理')
    : intl.get('sstk.stockConfig.button.chooseBatchDimension').d('选择批次维度');
  c7nModal({
    title,
    style: { width: 742 },
    ...footer,
    children: <BatchDimensionDefine noCheck={noCheck} relationDimensionIds={relationDimensionIds} callBack={callBack} />,
  });
};
// 维度配置
const openCustomDimension = (args = {}) => {
  const { readOnly, dimensionId } = args;
  const title = readOnly ?
    intl.get('sstk.stockConfig.view.viewCustomDimension').d('查看批次维度')
    : dimensionId
      ? intl.get('sstk.stockConfig.view.editCustomDimension').d('编辑批次维度')
      : intl.get('sstk.stockConfig.view.addCustomDimension').d('新建批次维度');
  c7nModal({
    title,
    style: { width: 742 },
    children: <CustomDimension {...args} />,
  });
};
// 维护物料范围
const openItemRageModal = (strategyId, onDataChange = () => null, type = 'add') => {
  const title = type === 'add'
    ? intl.get('sstk.stockConfig.view.addItemRange').d('新增物料')
    : intl.get('sstk.stockConfig.view.maintainItemRange').d('维护物料范围');
  c7nModal({
    style: { width: 1200 },
    drawer: true,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title,
    children: (
      <Transfer
        readOnly={false}
        strategyId={strategyId}
        onDataChange={onDataChange}
        leftInfo={{
          url: `/stck/v1/${organizationId}/stock-strategy-items/off-strategy-item/${strategyId}`,
          params: {
            customizeUnitCode: 'SSTK.STOCK_STRATEGY_CONFIG.ITEM.SEARCHBAR',
          },
        }}
        rightInfo={{
          url: `/stck/v1/${organizationId}/stock-strategy-items/strategy-item/${strategyId}`,
          params: {
            customizeUnitCode: 'SSTK.STOCK_STRATEGY_CONFIG.ITEM.SEARCHBAR',
          },
        }}
        onJoin={fetchAddItem}
        onDelete={fetchRemoveItem}
      />
    ),
  });
};
export {
  handleOpenBatchDefine,
  openCustomDimension,
  openItemRageModal,
};