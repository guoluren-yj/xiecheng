import React, { useState, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import qs from 'querystring';
import intl from 'utils/intl';
// import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DataSet, Button, Lov, Modal, Spin, Form, TextField, Tabs } from 'choerodon-ui/pro';
// import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
// import { SRM_DATA_PROCESS } from '_utils/config';
import RelTable from '_components/RelTable';
import { routerRedux } from 'dva/router';

import { getUrlParam } from '@/utils/utils';
import { dataSync, checkIsSync } from '@/services/ruleManagesService';

import { getRuleManagesDs, getRiskManagesDs, getSubscribeManagesDs } from './store/ruleManagesDs';
import OldRuleManages from '../RuleManagesNew';
import RiskRuleManages from '../RuleManagesRisk';

const modalKey = Modal.key();
const intlPrompt = 'sdps.ruleManages';
const { TabPane } = Tabs;

const RuleManages = (props) => {
  const {
    location: { state: { _back } = {} }, // 获取返回状态，根据 _back 来判断刷新状态
  } = props;

  const urlParam = getUrlParam();
  const { backKey } = urlParam;

  const [syncButtonShow, handleSyncButtonShow] = useState(false);
  const [syncLoading, handleSyncLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('1');

  const tableCode = 'sdps_data_sync'; // 配置表编码

  const { ruleManagesDs, riskManagesDs, tenantLovDs, subscribeManagesDs } = props.valueDs;

  // 设置当前租户信息
  const [currentTenantId, setCurrentTenantId] = useState(
    (tenantLovDs.current.get('tenant') || {}).tenantId
  );

  /**
   * 设置租户信息，查询
   */
  useEffect(() => {
    ruleManagesDs.setQueryParameter('tenantId', currentTenantId);
    riskManagesDs.setQueryParameter('tenantId', currentTenantId);
    ruleManagesDs.query();
    riskManagesDs.query();

    // 检查是否同步，控制同步按钮的显示
    checkIsSync().then((res) => {
      if (res === 0) handleSyncButtonShow(true);
      else handleSyncButtonShow(false);
    });
  }, [currentTenantId, _back]);

  useEffect(() => {
    setActiveKey(backKey || '1');
  }, [backKey]);

  /**
   * handleSync: 老数据同步
   */
  const handleSync = () => {
    handleSyncLoading(true);
    dataSync()
      .then((res) => {
        if (getResponse(res)) {
          // 成功同步完成则弹窗显示配置表
          Modal.open({
            drawer: true,
            size: 'large',
            footer: (okBtn) => okBtn,
            children: <RelTable tableCode={tableCode} />,
            afterClose: () => {
              ruleManagesDs.setQueryParameter('tenantId', currentTenantId);
              ruleManagesDs.query();
            },
          });
        }
      })
      .finally(() => {
        handleSyncLoading(false);
        handleSyncButtonShow(false);
      });
  };

  /**
   * createTenantRule: 帮租户级新建规则（实际上就是数据订阅）
   */
  const createTenantRule = () => {
    subscribeManagesDs.setState('tenantId', currentTenantId); // 传参tenantId
    subscribeManagesDs.create();
    let isCreate = true; // 是否为创建状态
    Modal.open({
      key: modalKey,
      title: intl.get(`${intlPrompt}.view.form.subscribe`).d('填写订阅信息'),
      drawer: true,
      style: { width: 500 },
      children: (
        <Form record={subscribeManagesDs.current} labelLayout="float">
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {intl.get(`${intlPrompt}.view.form.subscribe`).d('填写订阅信息')}
          </div>
          <TextField name="code" />
          <TextField name="name" />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {intl.get(`${intlPrompt}.view.form.choiceCode`).d('选择规则编码')}
          </div>
          <Lov name="mdCode" />
        </Form>
      ),
      onOk: () => {
        isCreate = true;
        return subscribeManagesDs.submit();
      },
      onCancel: () => {
        isCreate = false;
        subscribeManagesDs.reset();
      },
      afterClose: () => {
        if (isCreate) {
          // 清空查询条件，再设置租户，重新查询
          ruleManagesDs.queryDataSet.reset();
          ruleManagesDs.query();
        }
      },
    });
  };

  /**
   * 查询并设置租户信息
   * @param {*} record
   */
  const queryTenantRuleManage = (record = {}) => {
    setCurrentTenantId(record.tenantId);
    ruleManagesDs.queryDataSet.reset();
    riskManagesDs.queryDataSet.reset();
  };

  /**
   * 路由跳转
   * @param {Number} ruleManagementHeaderId
   */
  const routeDetail = (ruleManagementHeaderId) => {
    props.dispatch(
      routerRedux.push({
        pathname:
          activeKey === '1'
            ? `/sdps/rule-management/detail`
            : `/sdps/rule-management/new-tab-detail`,
        search: qs.stringify({ tenantId: currentTenantId, ruleManagementHeaderId, activeKey }),
      })
    );
  };

  const handleChangeTag = (key) => {
    setActiveKey(key);
  };

  // const queryParams = () => {
  //   const param = riskManagesDs?.queryDataSet?.toData() ?? {};
  //   return { ...param };
  // };

  // const handleImport = () => {
  //   openTab({
  //     key: '/sdps/commentImport/SDPS.RULE_DEFINE_IMPORT',
  //     search: qs.stringify({
  //       key: '/sdps/commentImport/SDPS.RULE_DEFINE_IMPORT',
  //       title: 'hzero.common.title.batchImport',
  //       action: intl.get('hzero.common.title.batchImport').d('批量导入'),
  //       auto: true,
  //     }),
  //   });
  // };

  return (
    <Spin spinning={syncLoading}>
      <Header title={intl.get(`${intlPrompt}.view.header.title`).d('规则配置')}>
        {currentTenantId === '0' && activeKey === '1' && syncButtonShow && (
          <Button
            onClick={() => {
              Modal.confirm({
                title: intl.get(`${intlPrompt}.modal.sync.sure`).d('同步确认'),
                children: intl.get(`${intlPrompt}.modal.sync.confirm`).d('是否进行同步?'),
                onOk: handleSync,
              });
            }}
          >
            {intl.get(`${intlPrompt}.button.sync`).d('同步')}
          </Button>
        )}
        {currentTenantId !== '0' && activeKey === '1' ? (
          <Button color="primary" onClick={() => createTenantRule()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        ) : (
          <Button color="primary" onClick={() => routeDetail()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        )}
        {/* {activeKey === '2' ? (
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              style: { border: 'none' },
            }}
            defaultSelectAll
            requestUrl={`${SRM_DATA_PROCESS}/v1/rule-define-site/rule-export`}
            queryParams={queryParams}
            buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
          />
        ) : null}
        {activeKey === '2' ? (
          <Button funcType="flat" icon="file_upload" onClick={handleImport}>
            {intl.get('sdps.ruleManages.button.import').d('导入')}
          </Button>
        ) : null} */}
        <Lov
          dataSet={tenantLovDs}
          name="tenant"
          onChange={queryTenantRuleManage}
          clearButton={false}
          searchable={false}
        />
      </Header>
      <Content>
        <Tabs activeKey={activeKey} onChange={handleChangeTag}>
          <TabPane
            tab={intl.get('sdps.ruleManages.view.title.ruleManageOld').d('规则管理(旧)')}
            key="1"
          >
            <OldRuleManages
              ruleManagesDs={ruleManagesDs}
              currentTenantId={currentTenantId}
              activeKey={activeKey}
              dispatch={props.dispatch}
            />
          </TabPane>
          <TabPane
            tab={intl.get('sdps.ruleManages.view.title.ruleManageRisk').d('规则管理(风控)')}
            key="2"
          >
            <RiskRuleManages
              ruleManagesDs={riskManagesDs}
              currentTenantId={currentTenantId}
              activeKey={activeKey}
              dispatch={props.dispatch}
            />
          </TabPane>
        </Tabs>
      </Content>
    </Spin>
  );
};

export default formatterCollections({
  code: ['sdps.ruleManages', 'sdps.indexSearch'],
})(
  withProps(
    () => {
      const ruleManagesDs = new DataSet(getRuleManagesDs());
      const riskManagesDs = new DataSet(getRiskManagesDs());
      const tenantLovDs = new DataSet({
        data: [
          {
            tenant: {
              tenantId: '0',
              tenantName: intl.get(`${intlPrompt}.view.textValue.lov`).d('SRM平台'),
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
      const subscribeManagesDs = new DataSet(getSubscribeManagesDs());
      const valueDs = {
        ruleManagesDs,
        tenantLovDs,
        subscribeManagesDs,
        riskManagesDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RuleManages)
);
