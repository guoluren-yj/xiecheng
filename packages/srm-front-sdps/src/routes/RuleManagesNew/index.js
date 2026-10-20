/**
 * 规则配置
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import qs from 'querystring';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

const intlPrompt = 'sdps.ruleManages';

function OldRuleManages(props = {}) {
  const { currentTenantId, ruleManagesDs, activeKey } = props;

  /**
   * 数据上下线
   * @param {Object} record ds行数据
   * @param {Boolean} flag 上线下线标记
   */
  const handleLineStatus = (record, flag) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children:
        flag === 1
          ? intl.get(`${intlPrompt}.action.online.sure`).d('确定上线?')
          : intl.get(`${intlPrompt}.action.offline.sure`).d('确定下线?'),
      onOk: () => {
        record.set('enableFlag', flag);
        record.set('tenantId', currentTenantId);
        ruleManagesDs.submit().finally(() => {
          ruleManagesDs.query();
        });
      },
    });
  };

  /**
   * 删除规则
   * @param {Object} record ds行数据
   */
  const deleteRule = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get(`${intlPrompt}.action.delete.sure`).d('确定删除本规则?'),
      onOk: () => {
        record.set('tenantId', currentTenantId);
        ruleManagesDs.delete(record, false);
      },
    });
  };

  /**
   * 表格列
   */
  const columns = [
    {
      name: 'ruleCode',
      width: 200,
    },
    {
      name: 'name',
    },
    {
      name: 'type',
      width: 100,
    },
    {
      name: 'enableFlag',
      width: 100,
      renderer: ({ value }) => {
        return (
          <Badge
            status={value === 1 ? 'success' : 'error'}
            text={
              value === 1
                ? intl.get(`${intlPrompt}.view.status.online`).d('上线')
                : intl.get(`${intlPrompt}.view.status.offline`).d('下线')
            }
          />
        );
      },
    },
    {
      name: 'createdBy',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'lastUpdatedBy',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 150,
    },
    {
      name: 'action',
      width: 200,
      lock: 'right',
      renderer: ({ record }) => {
        return (
          <span className="action-link">
            <a
              onClick={() => {
                routeDetailOnlyRead(record.get('ruleManagementHeaderId'));
              }}
            >
              {intl.get(`${intlPrompt}.button.detail`).d('详情')}
            </a>
            {record.get('enableFlag') === 1 ? (
              <a onClick={() => handleLineStatus(record, 0)}>
                {intl.get(`${intlPrompt}.view.status.offline`).d('下线')}
              </a>
            ) : (
              <>
                <a onClick={() => handleLineStatus(record, 1)}>
                  {intl.get(`${intlPrompt}.view.status.online`).d('上线')}
                </a>
                <a
                  onClick={() => {
                    routeDetail(record.get('ruleManagementHeaderId'));
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                {currentTenantId === '0' && (
                  <a onClick={() => deleteRule(record)}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                )}
              </>
            )}
          </span>
        );
      },
    },
  ];

  /**
   * 路由跳转
   * @param {Number} ruleManagementHeaderId
   */
  const routeDetail = ruleManagementHeaderId => {
    props.dispatch(
      routerRedux.push({
        pathname: `/sdps/rule-management/detail`,
        search: qs.stringify({ tenantId: currentTenantId, ruleManagementHeaderId, activeKey }),
      })
    );
  };

  /**
   * 路由跳转到详情页面（只读）
   * @param {Number} ruleManagementHeaderId
   */
  const routeDetailOnlyRead = ruleManagementHeaderId => {
    props.dispatch(
      routerRedux.push({
        pathname: `/sdps/rule-management/detail-only-read`,
        search: qs.stringify({ tenantId: currentTenantId, ruleManagementHeaderId, activeKey }),
      })
    );
  };

  return (
    <>
      <FilterBar
        dataSet={[ruleManagesDs]}
        cacheState
        cacheKey="RULE_MANAGE_QUERY_LIST"
        fields={[
          {
            name: 'ruleCode',
            type: 'string',
            label: intl.get(`${intlPrompt}.ruleManages.fullPathCode`).d('规则编码'),
            display: false,
            merge: true,
          },
          {
            name: 'name',
            type: 'string',
            label: intl.get(`${intlPrompt}.ruleManages.name`).d('规则名称'),
            display: false,
            merge: true,
          },
          {
            name: 'type',
            type: 'string',
            lookupCode: 'SDPS.META_DEFINITION.TYPE',
            label: intl.get(`${intlPrompt}.ruleManages.type`).d('规则类型'),
            display: true,
          },
          {
            name: 'enableFlag',
            type: 'string',
            label: intl.get(`${intlPrompt}.ruleManages.enableFlag`).d('规则状态'),
            lookupCode: 'SDPS.META_DEFINITION.ONLINE_OFFLINE_STATUS',
            display: true,
          },
          {
            name: 'serviceCode',
            type: 'string',
            label: intl.get(`${intlPrompt}.ruleManages.serviceCode`).d('服务编码'),
            display: true,
          },
          {
            name: 'indexCode',
            type: 'string',
            label: intl.get('sdps.indexSearch.view.title.indexCode').d('指标编码'),
            display: true,
          },
        ]}
      />
      <Table
        dataSet={ruleManagesDs}
        queryBar="none"
        columns={
          currentTenantId === '0'
            ? columns
            : [
                {
                  name: 'code',
                  width: 200,
                },
              ].concat(columns)
        }
        customizable
        customizedCode="SDPS.RULE_MANAGE_OLD_LIST"
      />
    </>
  );
}

export default OldRuleManages;
