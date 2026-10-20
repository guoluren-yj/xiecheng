/**
 * 规则配置
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Table, Button, Lov, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { createTenantRuleMessages } from '@/services/ruleManagesService';
import getRuleManagesDs from './store/ruleManagesDs';

// 表格列渲染状态
const statusMap = ['error', 'success'];

function RuleManages(props = {}) {
  const {
    location: { state: { _back } = {} }, // 获取返回状态，根据 _back 来判断刷新状态
  } = props;
  const { ruleManagesDs, tenantLovDs } = props.valueDs;
  // 设置当前租户信息
  const [currentTenantId, setCurrentTenantId] = useState(
    (tenantLovDs.current.get('tenant') || {}).tenantId
  );

  /**
   * 选择租户后，创建按钮渲染为lov的ds初始化
   */
  const tenantCreateLovDs = new DataSet({
    fields: [
      {
        name: 'ruleConfig',
        type: 'object',
        lovCode: 'SDPS.CNF_META_DEFINITION.ROLE',
        lovPara: {
          subscribe: 'false',
          tenantId: currentTenantId,
        },
      },
    ],
  });

  /**
   * 设置租户信息，查询
   */
  useEffect(() => {
    ruleManagesDs.setQueryParameter('tenantId', currentTenantId);
    ruleManagesDs.query();
  }, [currentTenantId, _back]);

  /**
   * 上下线状态渲染
   * @param {String} v value
   * @returns
   */
  const isOffLineRender = (v) => {
    return React.createElement(Badge, {
      status: statusMap[v],
      text:
        v === 1
          ? intl.get('sdps.ruleManages.view.status.online').d('上线')
          : intl.get('sdps.ruleManages.view.status.offline').d('下线'),
    });
  };

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
          ? intl.get('sdps.ruleManages.action.online.sure').d('确定上线?')
          : intl.get('sdps.ruleManages.action.offline.sure').d('确定下线?'),
      onOk: () => {
        record.set('enableFlag', flag);
        record.set('tenantId', currentTenantId);
        ruleManagesDs.submit().then(() => {
          ruleManagesDs.query();
        });
      },
    });
  };

  /**
   * 删除规则
   * @param {Object} record ds行数据
   */
  const deleteRule = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sdps.ruleManages.action.delete.sure').d('确定删除本规则?'),
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
      name: 'fullPathCode',
      width: 200,
    },
    {
      name: 'name',
      width: 200,
    },
    {
      name: 'type',
      width: 100,
    },
    {
      name: 'enableFlag',
      width: 100,
      renderer: ({ value }) => isOffLineRender(value),
    },
    {
      name: 'serviceCode',
      width: 300,
    },
    {
      name: 'serviceName',
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
                routeDetailOnlyRead(record.get('metaDefinitionId'));
              }}
            >
              {intl.get('sdps.ruleManages.button.detail').d('详情')}
            </a>
            {record.get('enableFlag') === 1 ? (
              <a onClick={() => handleLineStatus(record, 0)}>
                {intl.get('sdps.ruleManages.view.status.offline').d('下线')}
              </a>
            ) : (
              <>
                <a onClick={() => handleLineStatus(record, 1)}>
                  {intl.get('sdps.ruleManages.view.status.online').d('上线')}
                </a>
                <a
                  onClick={() => {
                    routeDetail(record.get('metaDefinitionId'));
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <a onClick={() => deleteRule(record)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              </>
            )}
          </span>
        );
      },
    },
  ];

  /**
   * 查询并设置租户信息
   * @param {*} record
   */
  const queryTenantRuleManage = (record = {}) => {
    setCurrentTenantId(record.tenantId);
    ruleManagesDs.queryDataSet.reset();
  };

  /**
   * 路由跳转
   * @param {Number} metaDefinitionId
   */
  const routeDetail = (metaDefinitionId) => {
    const url = metaDefinitionId
      ? `/sdps/rule-manages/detail?tenantId=${currentTenantId}&metaDefinitionId=${metaDefinitionId}`
      : `/sdps/rule-manages/detail?tenantId=${currentTenantId}`;
    props.history.push(url);
  };

  /**
   * 路由跳转到详情页面（只读）
   * @param {Number} metaDefinitionId
   */
  const routeDetailOnlyRead = (metaDefinitionId) => {
    const url = `/sdps/rule-manages/detail-only-read?tenantId=${currentTenantId}&metaDefinitionId=${metaDefinitionId}`;
    props.history.push(url);
  };

  /**
   * 租户级复制平台级规则
   * @param {*} record
   */
  const createTenantRule = (record = {}) => {
    createTenantRuleMessages({
      tenantId: currentTenantId,
      fullPathCode: record.fullPathCode,
    })
      .then((res) => {
        if (getResponse(res)) {
          routeDetail(res.metaDefinitionId);
        }
      })
      .finally(() => tenantCreateLovDs.reset());
  };

  return (
    <React.Fragment>
      <Header title={intl.get('sdps.ruleManages.view.header.title').d('规则配置')}>
        {currentTenantId !== '0' ? (
          <Lov
            name="ruleConfig"
            mode="button"
            color="primary"
            clearButton={false}
            placeholder={intl.get('hzero.common.button.create').d('新建')}
            onChange={createTenantRule}
            dataSet={tenantCreateLovDs}
          />
        ) : (
          <Button color="primary" onClick={() => routeDetail()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        )}

        <Lov
          dataSet={tenantLovDs}
          name="tenant"
          onChange={queryTenantRuleManage}
          clearButton={false}
          searchable={false}
        />
      </Header>
      <Content>
        <Table dataSet={ruleManagesDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.ruleManages'],
})(
  withProps(
    () => {
      const ruleManagesDs = new DataSet(getRuleManagesDs());
      const tenantLovDs = new DataSet({
        data: [
          {
            tenant: {
              tenantId: '0',
              tenantName: intl.get('sdps.ruleManages.view.textValue.lov').d('SRM平台'),
            },
          },
        ],
        fields: [
          {
            name: 'tenant',
            lovCode: 'HPFM.TENANT',
            type: 'object',
            label: intl.get('hzero.common.tenant').d('租户'),
          },
        ],
      });
      const valueDs = {
        ruleManagesDs,
        tenantLovDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RuleManages)
);
