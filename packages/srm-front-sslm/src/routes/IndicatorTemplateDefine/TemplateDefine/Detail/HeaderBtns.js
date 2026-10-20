/*
 * @Date: 2023-11-23 16:27:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dropdown, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import HistoryVersion from '../HistoryVersion';

const HeaderBtns = observer(
  ({
    remote,
    isEdit,
    loading,
    onSave,
    onEdit,
    onPublish,
    dispatch,
    basicDs,
    versionNum,
    jumpSource,
    sourceEvalTplId,
    sourceEvalTplType,
    editFlag,
    historyFlag,
    customizeBtnGroup,
  }) => {
    const { evalStatusCode } = basicDs.current?.get(['evalStatusCode']) || {};
    // (!jumpSource && versionNum === 0) 版本为0，点击编码进来的
    // historyFlag 历史版本只有一条数据，从历史版本进入详情页不展示历史版本按钮
    const newHiddenHistory =
      isEdit ||
      evalStatusCode !== 'PUBLISHED' ||
      (!jumpSource && versionNum === 0) ||
      historyFlag === '0';
    const hiddenHistory = remote
      ? remote.process(
          'SSLM.INDICATORTEMPLATEDEFINE.DETAIL_HISTORY_BTN_HIDDEN_FLAG',
          newHiddenHistory,
          { basicDs }
        )
      : newHiddenHistory;

    const buttons = [
      {
        name: 'release',
        hidden: !isEdit,
        child: intl.get(`hzero.common.button.release`).d('发布'),
        btnProps: {
          loading,
          icon: 'publish2',
          color: 'primary',
          onClick: onPublish,
        },
      },
      {
        name: 'save',
        hidden: !isEdit,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          loading,
          icon: 'save',
          funcType: 'flat',
          onClick: onSave,
        },
      },
      {
        name: 'edit',
        hidden: isEdit || !(editFlag === '1' && !jumpSource),
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          loading,
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
                filterData
                editFlag={editFlag}
                dispatch={dispatch}
                showSubMenuFlag={false}
                record={basicDs.current}
                type={jumpSource || 'DETAIL_HISTORY'}
                sourceEvalTplId={sourceEvalTplId}
                sourceEvalTplType={sourceEvalTplType}
              />
            }
          >
            <Button icon="schedule" funcType="flat" loading={loading}>
              {intl.get('hzero.common.button.historyVersion').d('历史版本')}
              <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
            </Button>
          </Dropdown>
        ),
      },
    ];
    return customizeBtnGroup(
      {
        code: 'SSLM.TEMPLATE_DEFINE.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
    );
  }
);

export default HeaderBtns;
