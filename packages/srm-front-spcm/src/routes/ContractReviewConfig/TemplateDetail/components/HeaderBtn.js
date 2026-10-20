/*
 * @Date: 2025-03-28 09:09:05
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import HistoryVersion from '../../components/HistoryVersion';

const HeaderBtns = observer(
  ({
    handlePublish = () => {},
    handleSave = () => {},
    loading = false,
    dispatch,
    isEdit,
    sourceKey,
    headerDs,
    sourceReviewTemplateId,
  }) => {
    // historyFlag 历史版本只有一条数据，不展示历史版本按钮
    const { versionNumber, reviewTemplateId } = headerDs.current?.get(['versionNumber', 'reviewTemplateId']) || {};

    const hiddenHistory = isEdit || (!sourceKey && versionNumber === 1) || !versionNumber;

    const buttons = [
      {
        name: 'publish',
        hidden: !isEdit,
        child: intl.get(`hzero.common.button.release`).d('发布'),
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          onClick: () => handlePublish(),
        },
      },
      {
        name: 'save',
        hidden: !isEdit,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          onClick: () => handleSave(),
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
                record={headerDs.current}
                type={sourceKey || 'DETAIL_HISTORY'}
                sourceReviewTemplateId={sourceReviewTemplateId || reviewTemplateId}
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
    ].map((btn) => ({
      ...btn,
      btnProps: {
        ...btn.btnProps,
        wait: 200,
        loading,
        waitType: 'throttle',
      },
    }));

    return <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />;
  }
);

export default HeaderBtns;
