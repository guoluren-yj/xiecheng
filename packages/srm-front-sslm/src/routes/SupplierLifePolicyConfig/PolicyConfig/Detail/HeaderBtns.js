/*
 * @Date: 2024-03-15 11:42:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { Dropdown, Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import HistoryVersion from '../HistoryVersion';

const HeaderBtns = ({
  isEdit,
  loading,
  basicDs,
  editFlag,
  activeKey,
  jumpSource,
  historyFlag,
  versionNumber,
  sourceStrategyId,
  onEdit,
  dispatch,
  onBatchEdit,
  onSaveAndPublish,
  onRestoreDefault,
}) => {
  const basicRecord = useObserver(() => basicDs.current);

  // (!jumpSource && versionNum === 0) 版本为0，点击编码进来的
  // historyFlag 历史版本只有一条数据，从历史版本进入详情页不展示历史版本按钮
  const hiddenHistory =
    isEdit ||
    basicRecord.get('strategyStatus') !== 'RELEASED' ||
    (!jumpSource && versionNumber === 0) ||
    historyFlag === '0';

  const buttons = [
    {
      name: 'publish',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.publish').d('发布'),
      btnProps: {
        icon: 'near_me',
        color: 'primary',
        onClick: () => onSaveAndPublish('publish'),
      },
    },
    {
      name: 'save',
      hidden: !isEdit,
      child: intl.get('hzero.common.save').d('保存'),
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: () => onSaveAndPublish('save'),
      },
    },
    {
      name: 'edit',
      hidden: isEdit || !editFlag,
      child: intl.get('hzero.common.button.edit').d('编辑'),
      btnProps: {
        icon: 'mode_edit',
        funcType: 'flat',
        onClick: onEdit,
      },
    },
    {
      name: 'batchEdit',
      hidden: activeKey !== 'setProcess' || !isEdit,
      child: intl.get('sslm.common.button.batchEdit').d('批量编辑'),
      btnProps: {
        icon: 'checklist',
        funcType: 'flat',
        onClick: () => onBatchEdit(),
        help: intl
          .get('sslm.supplierLifePolicyConfig.view.message.batchEditMsg')
          .d('批量设置相同初始阶段或目标阶段的流程'),
      },
    },
    {
      name: 'restoreDefault',
      hidden: activeKey !== 'applyStage' || !isEdit,
      child: intl.get('sslm.supplierLifePolicyConfig.view.btn.restoreDefault').d('恢复默认'),
      btnProps: {
        icon: 'loop',
        funcType: 'flat',
        onClick: () => onRestoreDefault(),
      },
    },
    {
      name: 'historyVersion',
      noNest: true,
      hidden: hiddenHistory,
      child: (
        <Dropdown
          overlay={
            <HistoryVersion
              filterData
              record={basicRecord}
              dispatch={dispatch}
              editFlag={editFlag}
              sourceStrategyId={sourceStrategyId}
              type={jumpSource || 'DETAIL_HISTORY'}
            />
          }
        >
          <Button icon="schedule" funcType="flat" loading={loading}>
            <span>{intl.get('hzero.common.button.historyVersion').d('历史版本')}</span>
            <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
          </Button>
        </Dropdown>
      ),
    },
  ].map(btn => ({
    ...btn,
    btnProps: { ...btn.btnProps, loading, wait: 200, waitType: 'throttle' },
  }));
  return <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />;
};

export default HeaderBtns;
