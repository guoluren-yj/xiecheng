/* eslint-disable no-shadow */
import React, { Fragment, useState, memo, useEffect } from 'react';

import { Tabs } from 'choerodon-ui';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';

import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { nodeListDS } from './stores/nodeConfigDs';
import { nodePolicyListDS } from './stores/nodePolicyConfigDs';
import NodeConfig from './NodeConfig';
import NodePolicyConfig from './NodePolicyConfig';

const { TabPane } = Tabs;
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = ({ nodeListDs, nodePolicyListDs, materialCertificationPolicy, dispatch }) => {
  const [currentTab, setCurrentTab] = useState(
    materialCertificationPolicy?.tabType || 'nodeConfig'
  );

  const handleNodeCreate = (record, type) => {
    if (record) {
      if (record?.nodeHisId) {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-read/${record?.nodeHisId}`,
            search: `?version=${record.nodeVersionNumber}`,
          })
        );
      } else if (type === 'read') {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-read/${record.get('nodeId')}`,
          })
        );
      } else if (type === 'change') {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-detail/${record?.nodeId}`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-detail/${record.get('nodeId')}`,
          })
        );
      }
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/smdm/material-certification-policy/node-detail/new`,
        })
      );
    }
  };

  const handleNodePolicytoDetail = (data, type) => {
    if (data) {
      if (data.strategyHeaderHisId) {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-policy-read/${data?.strategyHeaderHisId}`,
            search: `?version=${data.versionNumber}`,
          })
        );
      } else if (type === 'edit') {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-palicy-detail/${data.strategyHeaderId}`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/smdm/material-certification-policy/node-policy-read/${data.strategyHeaderId}`,
          })
        );
      }
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/smdm/material-certification-policy/node-palicy-detail/new`,
        })
      );
    }
  };

  const handleCreate = () => {
    if (currentTab === 'nodeConfig') {
      handleNodeCreate();
    } else {
      handleNodePolicytoDetail();
    }
  };

  const HeaderBtn = observer(() => {
    return (
      <>
        <Button
          icon="add"
          type="c7n-pro"
          color="primary"
          funcType="raised"
          wait={500}
          onClick={handleCreate}
        >
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
      </>
    );
  });

  useEffect(() => {
    if (currentTab === 'nodeConfig') {
      nodeListDs.query(nodeListDs.currentPage);
    } else {
      nodePolicyListDs.query(nodePolicyListDs.currentPage);
    }
  }, [currentTab, nodeListDs, nodePolicyListDs]);

  return (
    <Fragment>
      <Header
        title={intl.get(`${commonPrompt}.materialAuthPolicyTemplate`).d('物料认证策略模版管理')}
      >
        <HeaderBtn />
      </Header>
      <Content>
        <Tabs
          defaultActiveKey={currentTab}
          activeKey={currentTab}
          onChange={(value) => {
            setCurrentTab(value);
            console.log(value);
            dispatch({
              type: 'materialCertificationPolicy/updateState',
              payload: { tabType: value },
            });
          }}
        >
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.certificationNodeConfig`).d('认证阶段配置')}</>}
            key="nodeConfig"
          >
            <NodeConfig dataSet={nodeListDs} handleEdit={handleNodeCreate} />
          </TabPane>
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.certificationNodePolicyConfig`).d('认证策略配置')}</>}
            key="nodePolicyConfig"
          >
            <NodePolicyConfig dataSet={nodePolicyListDs} handleEdit={handleNodePolicytoDetail} />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ materialCertificationPolicy }) => ({
    materialCertificationPolicy,
  })),
  formatterCollections({
    code: ['smdm.common', 'hzero.c7nProUI'],
  }),
  withProps(
    () => {
      const nodeListDs = new DataSet(nodeListDS());
      const nodePolicyListDs = new DataSet(nodePolicyListDS());

      return {
        nodeListDs,
        nodePolicyListDs,
      };
    },
    { cacheState: true }
  )
)(memo(Index));
