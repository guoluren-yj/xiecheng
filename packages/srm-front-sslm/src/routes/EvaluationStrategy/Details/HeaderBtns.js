import React from 'react';
import { observer } from 'mobx-react-lite';
import { Icon, Button, Dropdown } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import HistoryVersion from '../HistoryVersion';

const HeaderBtns = observer(
  ({
    isPub,
    status,
    isEdit,
    dataSet,
    draftId,
    loading,
    editFlag,
    dispatch,
    handleSave,
    handleEdit,
    jumpSource,
    historyFlag,
    handlePublish,
    sourceStrategyId,
  }) => {
    const isCreate = status === 'create';

    const isShowPublish = !isEdit || isCreate;
    // 是否显示历史版本
    const { versionNumber, strategyStatus } =
      dataSet?.current?.get(['versionNumber', 'strategyStatus']) || {};
    // 是否显示编辑
    const editHideFlag = isEdit || !(editFlag === '1' && !jumpSource) || isPub;
    // (!jumpSource && versionNum === 1) 版本为1，点击编码进来的
    // historyFlag 历史版本只有一条数据，从历史版本进入详情页不展示历史版本按钮
    const hiddenHistory =
      isEdit ||
      strategyStatus !== 'RELEASED' ||
      (!jumpSource && versionNumber === 1) ||
      historyFlag === '0';

    const buttons = [
      {
        name: 'publish',
        hidden: isShowPublish,
        child: intl.get('hzero.common.button.publish').d('发布'),
        btnProps: {
          icon: 'near_me',
          color: 'primary',
          onClick: handlePublish,
        },
      },
      {
        name: 'save',
        hidden: !isEdit,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          onClick: handleSave,
          color: isCreate ? 'primary' : '',
          funcType: isCreate ? 'raised' : 'flat',
        },
      },
      {
        name: 'edit',
        hidden: editHideFlag,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          onClick: handleEdit,
          funcType: 'flat',
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
                draftId={draftId}
                record={dataSet.current}
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
  }
);

export default HeaderBtns;
