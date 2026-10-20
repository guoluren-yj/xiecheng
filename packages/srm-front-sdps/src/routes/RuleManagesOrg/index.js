/**
 * 规则配置
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import getRuleManagesDs from './store/ruleManagesDs';

// 表格列渲染状态
const statusMap = ['error', 'success'];

function RuleManagesOrg(props = {}) {
  const {
    location: { state: { _back } = {} }, // 获取返回状态，根据 _back 来判断刷新状态
  } = props;
  const { ruleManagesDs } = props.valueDs;
  // 设置当前租户信息
  const currentTenantId = getCurrentOrganizationId();

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
        ruleManagesDs.submit().then(() => {
          ruleManagesDs.query();
        });
      },
    });
  };

  /**
   * 表格列
   */
  const columns = [
    {
      name: 'code',
      width: 100,
    },
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
              </>
            )}
          </span>
        );
      },
    },
  ];

  const routeDetail = (metaDefinitionId) => {
    const url = metaDefinitionId
      ? `/sdps/rule-manages-org/detail?tenantId=${currentTenantId}&metaDefinitionId=${metaDefinitionId}`
      : `/sdps/rule-manages-org/detail?tenantId=${currentTenantId}`;
    props.history.push(url);
  };

  // 路由跳转到详情界面，不允许任何编辑
  const routeDetailOnlyRead = (metaDefinitionId) => {
    const url = `/sdps/rule-manages-org/detail-only-read?tenantId=${currentTenantId}&metaDefinitionId=${metaDefinitionId}`;
    props.history.push(url);
  };

  return (
    <React.Fragment>
      <Header title={intl.get('sdps.ruleManages.view.header.title').d('规则配置')}>
        {/* <Button color="primary" onClick={() => routeDetail()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button> */}
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
      const valueDs = {
        ruleManagesDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RuleManagesOrg)
);
