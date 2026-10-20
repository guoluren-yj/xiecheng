/*
 * @Date: 2022-09-26 13:14:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { Tag } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import React, { useMemo, useCallback, useState } from 'react';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, filterNullValueObject } from 'utils/utils';

import MoreButton from '@/routes/components/MoreButton';
import { enable } from '@/services/supplierLifePolicyConfigService';
import { renderStatus, tableHeight, tableMaxHeight } from '@/routes/components/utils';
import HistoryVersion from './HistoryVersion';

const PolicyConfig = ({ dataSet, dispatch }) => {
  const [loading, setLoading] = useState(false);
  // 跳转明细
  const jumpDetail = useCallback((record, status) => {
    const { strategyId, lifeCycleStrategy } = record.get(['strategyId', 'lifeCycleStrategy']) || {};
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-life-policy-config/detail/${strategyId}/${status}`,
        search: querystring.stringify(
          filterNullValueObject({
            sourceStrategyId: strategyId, // 存储最新版本id,用于明细历史版本跳转
            editFlag: isEmpty(lifeCycleStrategy) ? 1 : 0,
          })
        ),
      })
    );
  }, []);

  // 启用、禁用
  const hanldeEnable = record => {
    const enabledFlag = record.get('enabledFlag');
    setLoading(true);
    enable({
      ...(record.toData() || {}),
      enabledFlag: enabledFlag ? 0 : 1,
      isEnableOpt: true, // 后端用于启禁用还是编辑
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          dataSet.query();
          notification.success();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 编辑
  const handleEdit = record => {
    const { draftId, strategyStatus } = record.get(['draftId', 'strategyStatus']);
    if (strategyStatus === 'RELEASED') {
      setLoading(true);
      enable(record.toData())
        .then(response => {
          const res = getResponse(response);
          if (res) {
            dispatch(
              routerRedux.push({
                pathname: `/sslm/supplier-life-policy-config/detail/${draftId}/edit`,
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      jumpDetail(record, 'edit');
    }
  };

  // 渲染行按钮
  const getLineBtns = useCallback(record => {
    const { enabledFlag, strategyStatus, versionNumber, lifeCycleStrategy } =
      record.get([
        'enabledFlag',
        'strategyStatus',
        'draftId',
        'versionNumber',
        'lifeCycleStrategy',
      ]) || {};
    return [
      {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(record),
        hidden: strategyStatus === 'RELEASED' && !isEmpty(lifeCycleStrategy),
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
        isMenu: true,
        name: 'historyVersion',
        hidden: strategyStatus === 'UNRELEASED' || versionNumber === 0,
        label: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        child: <HistoryVersion record={record} dispatch={dispatch} type="LIST_HISTORY" />,
      },
    ].filter(btn => !btn.hidden);
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'strategyStatus',
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
        name: 'action',
        renderer: ({ record }) => {
          const buttons = getLineBtns(record);
          return <MoreButton buttons={buttons} />;
        },
      },
      {
        name: 'strategyCode',
        renderer: ({ value, record }) => {
          return <a onClick={() => jumpDetail(record, 'view')}>{value}</a>;
        },
      },
      {
        name: 'strategyName',
      },
      {
        name: 'versionNumber',
      },
      {
        name: 'orderSeq',
      },
    ],
    []
  );

  return (
    <Spin spinning={loading}>
      <div style={{ height: tableHeight.hasTab }}>
        <SearchBarTable
          pristine
          cacheState
          mode="tree"
          columns={columns}
          dataSet={dataSet}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchCode="SSLM.SUPPLIER_LIFE_POLICY_CONFIG.SEARCH_BAR"
          customizedCode="SSLM.SUPPLIER_LIFE_POLICY_CONFIG.POLICY_CONFIG"
        />
      </div>
    </Spin>
  );
};

export default PolicyConfig;
