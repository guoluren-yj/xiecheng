/**
 * 规则配置（租户级）
 * @date: 2021-1-10
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import qs from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import getRuleManagesOrgDs from './store/ruleManagesOrgDs';

import styles from './index.less';

const intlPrompt = 'sdps.ruleManages.model';

function RuleManagesNewOrg(props = {}) {
  const {
    location: { state: { _back } = {} }, // 获取返回状态，根据 _back 来判断刷新状态
  } = props;
  const { ruleManagesDs } = props.valueDs;
  // 设置当前租户信息
  const currentTenantId = getCurrentOrganizationId();

  useEffect(() => {
    ruleManagesDs.addEventListener('query', queryEvent);

    return () => {
      ruleManagesDs.removeEventListener('query', queryEvent);
    };
  }, []);

  /**
   * 设置租户信息，查询
   */
  useEffect(() => {
    ruleManagesDs.setQueryParameter('tenantId', currentTenantId);
    // ruleManagesDs.query();
  }, [currentTenantId, _back]);

  const queryEvent = ({ dataSet }) => {
    if (dataSet && dataSet.queryDataSet && dataSet.queryDataSet.current) {
      dataSet.queryDataSet.current.set('name', '');
    }
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
        ruleManagesDs.submit().finally(() => {
          const param = ruleManagesDs?.queryDataSet?.toData()[0] ?? {};
          const name = param ? param.ruleCode || param.name : '';
          if (name) {
            ruleManagesDs.setQueryParameter('name', name);
            ruleManagesDs.setQueryParameter('ruleCode', name);
          }

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
      name: 'enableFlag',
      width: 100,
      renderer: ({ value }) => {
        return (
          <Tag color={value !== 1 ? 'red' : 'green'}>
            {value === 1
              ? intl.get('sdps.ruleManages.view.status.online').d('上线')
              : intl.get('sdps.ruleManages.view.status.offline').d('下线')}
          </Tag>
        );
      },
    },
    {
      name: 'ruleCode',
      width: 180,
      renderer: ({ value, record }) => {
        return (
          <a onClick={() => routeDetailOnlyRead(record.get('ruleManagementHeaderId'))}>{value}</a>
        );
      },
    },
    {
      name: 'name',
      width: 180,
    },
    {
      name: 'code',
      width: 180,
      help: intl
        .get('sdps.ruleManages.view.help.tip')
        .d('此字段对应[标准指标定义]功能中的“指标编码”'),
    },
    {
      name: 'type',
      width: 100,
    },
    {
      name: 'createdBy',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 180,
    },
    {
      name: 'lastUpdatedBy',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 180,
    },
    {
      name: 'action',
      width: 200,
      lock: 'right',
      renderer: ({ record }) => {
        return (
          <span className="action-link">
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
                    routeDetail(record.get('ruleManagementHeaderId'));
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

  /**
   * 路由跳转
   * @param {Number} ruleManagementHeaderId
   */
  const routeDetail = ruleManagementHeaderId => {
    const queryParams = ruleManagesDs?.queryDataSet?.toData() ?? {};

    localStorage.setItem('ruleManageSearchParam', JSON.stringify(queryParams));

    props.dispatch(
      routerRedux.push({
        pathname: `/sdps/rule-management-org/detail`,
        search: qs.stringify({ tenantId: currentTenantId, ruleManagementHeaderId }),
      })
    );
  };

  /**
   * 路由跳转到详情页面（只读）
   * @param {Number} ruleManagementHeaderId
   */
  const routeDetailOnlyRead = ruleManagementHeaderId => {
    const queryParams = ruleManagesDs?.queryDataSet?.toData() ?? {};

    localStorage.setItem('ruleManageSearchParam', JSON.stringify(queryParams));

    props.dispatch(
      routerRedux.push({
        pathname: `/sdps/rule-management-org/detail-only-read`,
        search: qs.stringify({ tenantId: currentTenantId, ruleManagementHeaderId }),
      })
    );
  };

  const handleClear = () => {
    ruleManagesDs.setQueryParameter('name', '');
    ruleManagesDs.setQueryParameter('ruleCode', '');
  };

  return (
    <div className={styles['rule-manage-org-basic']}>
      <Header title={intl.get('sdps.ruleManages.view.header.title').d('规则配置')} />
      <Content>
        <FilterBar
          dataSet={[ruleManagesDs]}
          cacheState
          cacheKey="RULE_MANAGE_ORG_QUERY_LIST"
          onClear={handleClear}
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
        <div style={{ height: 'calc(100vh - 240px)' }}>
          <Table
            dataSet={ruleManagesDs}
            columns={columns}
            queryBar="none"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </Content>
    </div>
  );
}

export default formatterCollections({
  code: ['sdps.ruleManages', 'sdps.indexSearch'],
})(
  withProps(
    () => {
      const ruleManagesDs = new DataSet(getRuleManagesOrgDs());

      const valueDs = {
        ruleManagesDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RuleManagesNewOrg)
);
