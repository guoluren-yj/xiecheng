/*
 * @Date: 2024-06-07 14:36:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { Record } from 'choerodon-ui/dataset';
import React, { Fragment, useCallback, useState } from 'react';
import { DataSet, Button, Spin, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';

import MoreButton from '@/routes/components/MoreButton';
import { unlockStrategy, copyStrategy, enableStrategy } from '@/services/amountStrategyService';
import { getIndexDS } from './stores/getIndexDS';
import StatusTag from '../components/StatusTag';
import HistoryVersion from './components/HistoryVersion';

const Index = ({ tableDs, dispatch }) => {
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    dispatch(
      routerRedux.push({
        pathname: '/spcm/amount-strategy/create',
      })
    );
  };

  // 跳转详情页
  const jumpDetail = useCallback((record, type) => {
    const { strategyId, children, enableFlag, parentEnabledFlag } = record.get([
      'strategyId',
      'children',
      'enableFlag',
      'parentEnabledFlag',
    ]);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/amount-strategy/${strategyId}/${type}`,
        search: querystring.stringify({
          sourceStrategyId: strategyId, // 存储最新版本id,用于明细历史版本跳转
          editFlag: isEmpty(children) ? 1 : 0, // 判断当前模板是否有子集，用于处理明细编辑按钮
          parentEnabledFlag: parentEnabledFlag || enableFlag, // 父级是否启用
        }),
      })
    );
  }, []);

  // 编辑
  const handleEdit = useCallback((record) => {
    const strategyStatus = record.get('strategyStatus');
    if (['DISABLED', 'PUBLISHED'].includes(strategyStatus)) {
      setLoading(true);
      unlockStrategy(record.toData())
        .then((response) => {
          const res = getResponse(response);
          if (res) {
            jumpDetail(new Record(res), 'edit');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      jumpDetail(record, 'edit');
    }
  }, []);

  // 复制
  const handleCopy = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('spcm.amountStrategy.view.message.copyMsg').d('确认复制该行？'),
      onOk: () => {
        return new Promise((resolve) => {
          setLoading(true);
          copyStrategy(record.toData())
            .then((response) => {
              const res = getResponse(response);
              if (res) {
                jumpDetail(new Record(res), 'edit');
              }
            })
            .finally(() => {
              setLoading(false);
              resolve(false);
            });
        });
      },
    });
  };

  // 启用、禁用
  const hanldeEnable = (record) => {
    setLoading(true);
    const enableFlag = record.get('enableFlag');
    enableStrategy({
      ...record.toData(),
      enableFlag: enableFlag ? 0 : 1,
    })
      .then((response) => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          tableDs.query(tableDs.currentPage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 获取行上操作按钮
  const getLineBtns = useCallback((record) => {
    const { enableFlag, strategyStatus, children, versionNumber } = record.get([
      'enableFlag',
      'strategyStatus',
      'children',
      'versionNumber',
    ]);
    return [
      {
        name: 'edit',
        hidden: !isEmpty(children),
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(record),
      },
      {
        name: 'copy',
        child: intl.get('hzero.common.button.copy').d('复制'),
        onClick: () => handleCopy(record),
      },
      {
        name: 'disable',
        hidden: strategyStatus !== 'PUBLISHED',
        child: intl.get('hzero.common.status.disable').d('禁用'),
        onClick: () => hanldeEnable(record),
      },
      {
        name: 'enable',
        hidden: enableFlag !== 0,
        child: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => hanldeEnable(record),
      },
      {
        name: 'historyVersion',
        isMenu: true,
        hidden: ['UN_PUBLISHED'].includes(strategyStatus) || versionNumber === 1,
        label: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        child: (
          <HistoryVersion
            type="LIST_HISTORY"
            record={record}
            dispatch={dispatch}
            showSubMenuFlag={isEmpty(children)}
          />
        ),
      },
    ].filter((btn) => !btn.hidden);
  }, []);

  const columns = [
    {
      name: 'strategyStatus',
      headerStyle: { paddingLeft: 48 },
      renderer: ({ value, record }) => (
        <StatusTag text={record.get('strategyStatusMeaning')} value={value} />
      ),
    },
    {
      name: 'operator',
      width: 190,
      renderer: ({ record }) => {
        const buttons = getLineBtns(record);
        return <MoreButton buttons={buttons} />;
      },
    },
    {
      name: 'strategyNum',
      renderer: ({ value, record }) => <a onClick={() => jumpDetail(record, 'view')}>{value}</a>,
    },
    {
      name: 'strategyName',
    },
    {
      name: 'versionNumber',
    },
    {
      name: 'createdByName',
    },
    {
      name: 'creationDate',
    },
  ];
  return (
    <Fragment>
      <Header
        title={intl.get('spcm.amountStrategy.view.title.agreementAmountStrategy').d('协议金额策略')}
      >
        <Button icon="add" color="primary" loading={loading} onClick={handleCreate}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
      </Header>
      <Content>
        <Spin spinning={loading}>
          <SearchBarTable
            cacheState
            mode="tree"
            dataSet={tableDs}
            columns={columns}
            style={{ maxHeight: `calc(100vh - 200px)` }}
            customizedCode="SPCM.AMOUNT_STRATEGY.LIST_TABLE"
            searchCode="SPCM.AMOUNT_STRATEGY.LIST_SEARCH_BAR"
          />
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.amountStrategy'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(getIndexDS());
      return { tableDs };
    },
    { cacheState: true }
  )
)(Index);
