/**
 * @Description: 供应商评估策略 - 列表页面
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-26 15:09:29
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import { Tag } from 'choerodon-ui';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { compose, isEmpty } from 'lodash';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import React, { Fragment, useCallback } from 'react';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject } from 'utils/utils';

import MoreButton from '@/routes/components/MoreButton';
import { tableMaxHeight, tableHeight, renderStatus } from '@/routes/components/utils';
import { handleCopyRecord, handleOperationEnabled } from '@/services/evaluationStrategyServices';
import { getTableDs } from './stores';
import HistoryVersion from './HistoryVersion';

const EvaluationStrategy = ({ tableDs, customizeTable, custLoading, dispatch }) => {
  // 新建回调
  const handleCreate = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-strategy/details/create`,
      })
    );
  }, []);

  const handleJumpDetail = (record, status = 'view', unlock) => {
    const { strategyId, draftId, evalPlanStrategy } = record?.get([
      'strategyId',
      'draftId',
      'evalPlanStrategy',
    ]);
    const newStrategyId = unlock ? draftId : strategyId;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-strategy/details/${status}`,
        search: querystring.stringify(
          filterNullValueObject({
            draftId,
            strategyId: newStrategyId,
            sourceStrategyId: newStrategyId,
            editFlag: isEmpty(evalPlanStrategy) ? 1 : 0,
          })
        ),
      })
    );
  };

  // 复制
  const handleCopy = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get(`sslm.common.view.message.copyConfirm`)
        .d('是否复制此单据生成一张新单据？'),
      onOk: () =>
        handleCopyRecord(record.toData()).then(response => {
          const res = getResponse(response);
          if (res) {
            tableDs.query();
          }
        }),
    });
  };

  // 启用/禁用
  const hanldeEnable = record => {
    const { strategyId } = record.get(['strategyId']);
    handleOperationEnabled({ strategyId }).then(response => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        tableDs.query(tableDs.currentPage);
      }
    });
  };

  const getLineBtns = record => {
    const {
      draftId,
      versionNumber,
      childrenFlag,
      evalPlanStrategy,
      strategyStatus,
      enabledFlag,
    } = record.get([
      'draftId',
      'versionNumber',
      'childrenFlag',
      'evalPlanStrategy',
      'strategyStatus',
      'enabledFlag',
    ]);
    // 子集数据隐藏操作按钮
    const hiddenBtn = Number(childrenFlag) === 1;
    // 是否解锁版本
    const isUnlock = Boolean(draftId);
    // 显示编辑按钮
    const editBtnFlag = isEmpty(evalPlanStrategy);
    return [
      {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        hidden: !editBtnFlag,
        onClick: () => handleJumpDetail(record, 'edit', isUnlock),
      },
      {
        name: 'copy',
        child: intl.get('sslm.evaluationStrategy.table.row.actions.copy').d('复制'),
        hidden: hiddenBtn,
        onClick: () => handleCopy(record),
      },
      {
        name: 'enable',
        child: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => hanldeEnable(record),
        hidden: enabledFlag !== 0,
      },
      {
        name: 'disable',
        child: intl.get('hzero.common.status.disable').d('禁用'),
        onClick: () => hanldeEnable(record),
        hidden: !(enabledFlag === 1 && strategyStatus === 'RELEASED'),
      },
      {
        name: 'historyVersion',
        isMenu: true,
        hidden: strategyStatus === 'UNRELEASED' || versionNumber === 1,
        label: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        child: (
          <HistoryVersion
            record={record}
            dispatch={dispatch}
            type="LIST_HISTORY"
            showSubMenuFlag={isEmpty(evalPlanStrategy)}
          />
        ),
      },
    ].filter(btn => !btn.hidden);
  };

  const getColumns = () => {
    return [
      {
        name: 'strategyStatus',
        width: 130,
        headerStyle: { paddingLeft: 48 },
        renderer: ({ name, value, record }) => {
          const { enabledFlag } = record.get(['enabledFlag']);
          if (!enabledFlag) {
            return (
              <Tag color="red" style={{ border: 'none' }}>
                {intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
              </Tag>
            );
          } else {
            return renderStatus({ name, value, record });
          }
        },
      },
      {
        name: 'operation',
        width: 200,
        renderer: ({ record }) => {
          const buttons = getLineBtns(record);
          return <MoreButton buttons={buttons} />;
        },
      },
      {
        name: 'strategyCode',
        width: 150,
        renderer: ({ record, value }) => (
          <a onClick={() => handleJumpDetail(record, 'view')}>{value}</a>
        ),
      },
      {
        name: 'strategyName',
      },
      {
        name: 'versionNumber',
        width: 80,
      },
      {
        name: 'assessType',
        width: 130,
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'realName',
        width: 120,
      },
    ];
  };

  return (
    <Fragment>
      <Header title={intl.get('sslm.evaluationStrategy.view.header.Title').d('供应商评估策略配置')}>
        <Button icon="add" color="primary" onClick={handleCreate}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
      </Header>
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: 'SSLM.EVAL_PLAN_STRATEGY.MAIN_TABLE',
            },
            <SearchBarTable
              cacheState
              mode="tree"
              dataSet={tableDs}
              custLoading={custLoading}
              columns={getColumns(tableDs)}
              searchCode="SSLM.EVAL_PLAN_STRATEGY.MAIN"
              style={{
                maxHeight: tableMaxHeight.fixedHeight,
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.evaluationStrategy', 'sslm.evaluationStrategyDetail', 'sslm.common'],
  }),
  withCustomize({
    unitCode: ['SSLM.EVAL_PLAN_STRATEGY.MAIN_TABLE'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(getTableDs('SSLM.EVAL_PLAN_STRATEGY.MAIN'));
      return { tableDs };
    },
    { cacheState: true }
  )
)(EvaluationStrategy);
