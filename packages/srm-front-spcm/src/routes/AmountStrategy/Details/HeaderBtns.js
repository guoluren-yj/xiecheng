/*
 * @Date: 2023-11-03 09:09:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import HistoryVersion from '../components/HistoryVersion';

const HeaderBtns = observer(
  ({
    formDs,
    isEdit,
    onSave,
    onEdit,
    dispatch,
    editFlag,
    onRelease,
    sourceKey,
    allLoading,
    historyFlag,
    versionNumber,
    sourceStrategyId,
  }) => {
    // (!sourceKey && versionNum === 1) 版本为1，点击编码进来的
    // historyFlag 历史版本只有一条数据，从历史版本进入详情页不展示历史版本按钮
    const hiddenHistory =
      isEdit ||
      ['UN_PUBLISHED'].includes(formDs?.current?.get('strategyStatus')) ||
      (!sourceKey && versionNumber === 1) ||
      historyFlag === '0';

    const buttons = [
      {
        name: 'publish',
        hidden: !isEdit,
        child: intl.get(`hzero.common.button.release`).d('发布'),
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          onClick: () => onRelease(),
        },
      },
      {
        name: 'save',
        hidden: !isEdit,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          onClick: () => onSave(),
        },
      },
      {
        name: 'edit',
        hidden: isEdit || !(editFlag && !sourceKey),
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: onEdit,
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
                dispatch={dispatch}
                editFlag={editFlag}
                record={formDs.current}
                sourceStrategyId={sourceStrategyId}
                type={sourceKey || 'DETAIL_HISTORY'}
              />
            }
          >
            <Button icon="schedule" funcType="flat" loading={allLoading}>
              <span>{intl.get('hzero.common.button.historyVersion').d('历史版本')}</span>
              <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
            </Button>
          </Dropdown>
        ),
      },
    ].map((btn) => ({
      ...btn,
      btnProps: {
        ...btn.btnProps,
        wait: 200,
        loading: allLoading,
        waitType: 'throttle',
      },
    }));

    return <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />;
  }
);

export default HeaderBtns;
