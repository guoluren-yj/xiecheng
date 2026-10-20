/*
 * SupplierLifePolicyConfig - 生命周期管理策略配置
 * @Date: 2022-09-20 11:24:14
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose, forEach, isEmpty } from 'lodash';
import { Tabs } from 'choerodon-ui';
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import { DataSet, Button, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { routerRedux } from 'dva/router';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { searchStageNodes, saveStageNodes } from '@/services/supplierLifePolicyConfigService';
import { getListDS } from './stores/getListDS';
import { getStageInfoDS } from './stores/getStageInfoDS';
import PhaseConfig from './PhaseConfig';
import PolicyConfig from './PolicyConfig';

const { TabPane } = Tabs;

const Index = ({ listDs, stageInfoDs, dispatch, mixObj }) => {
  const [allLoading, setAllLoading] = useState(false);
  const [effectLoading, setEffectLoading] = useState(false);
  const [stageDataSource, setStageDataSource] = useState([]);
  const [stageOriginalData, setStageOriginalData] = useState({});
  const [activeKey, setActiveKey] = useState(mixObj.currentKey);

  const finalLoading = allLoading || effectLoading;

  useEffect(() => {
    handleStage();
  }, []);

  // 阶段配置-查询
  const handleStage = useCallback(() => {
    setAllLoading(true);
    // 清空之前loadData的数据
    stageInfoDs.loadData([]);
    searchStageNodes()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setStageOriginalData(res);
          const { lifeCycleStgAssigns = [] } = res;
          const stageList = lifeCycleStgAssigns
            .map(n => n.cycleStages)
            .map(stage => {
              const newStage = { ...stage, id: stage.stageId };
              return newStage;
            });
          stageInfoDs.appendData(stageList);
          setStageDataSource(stageList);
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  }, []);

  // 新建回调
  const handleCreate = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-life-policy-config/create`,
      })
    );
  }, []);

  // 生效回调
  const handleEffect = useCallback(async () => {
    setEffectLoading(true);
    const validateFlag = await stageInfoDs.validate();
    if (validateFlag) {
      const updateStage = stageInfoDs.toData();
      const { lifeCycleStgAssigns = [] } = stageOriginalData;
      const newList = [];
      forEach(updateStage, (stage, index) => {
        const existStage = lifeCycleStgAssigns.filter(
          lifeCycleStg => lifeCycleStg.cycleStages?.stageId === stage.stageId
        );
        if (isEmpty(existStage)) {
          const { stageId, ...cycleStages } = stage;
          newList.push({ cycleStages, orderSeq: index + 1 });
        } else {
          newList.push({
            ...existStage[0],
            cycleStages: stage,
            orderSeq: index + 1,
          });
        }
      });
      return new Promise(() => {
        saveStageNodes({
          ...stageOriginalData,
          lifeCycleStgAssigns: newList,
        })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              handleStage();
            }
          })
          .finally(() => {
            setEffectLoading(false);
          });
      });
    } else {
      notification.warning({
        message: intl
          .get('sslm.supplierLifePolicyConfig.modal.stage.requireMsg')
          .d('请维护必输字段'),
      });
    }
  }, [stageOriginalData]);

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setActiveKey(key);
    // eslint-disable-next-line no-param-reassign
    mixObj.currentKey = key;
  }, []);

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.supplierLifePolicyConfig.view.title.supplierLifePolicyConfig')
          .d('生命周期管理策略配置')}
      >
        <Button
          color="primary"
          icon="check"
          wait={200}
          waitType="throttle"
          loading={finalLoading}
          onClick={handleEffect}
          hidden={activeKey === 'policyConfig'}
        >
          {intl.get('sslm.common.button.effect').d('生效')}
        </Button>
        <Button
          color="primary"
          icon="add"
          onClick={handleCreate}
          hidden={activeKey === 'phaseConfig'}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <Spin spinning={finalLoading}>
          <Tabs animated={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabPane
              key="phaseConfig"
              tab={intl
                .get('sslm.supplierLifePolicyConfig.view.tabTitle.phaseConfig')
                .d('阶段配置')}
            >
              <PhaseConfig dataSet={stageInfoDs} dataSource={stageDataSource} />
            </TabPane>
            <TabPane
              key="policyConfig"
              tab={intl
                .get('sslm.supplierLifePolicyConfig.view.tabTitle.policyConfig')
                .d('策略配置')}
            >
              <PolicyConfig dataSet={listDs} dispatch={dispatch} />
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.workbench',
      'sslm.supplierLifePolicyConfig',
      'sslm.supplierLifeConfig',
    ],
  }),
  withProps(
    () => {
      const listDs = new DataSet(getListDS());
      const stageInfoDs = new DataSet(getStageInfoDS());
      const mixObj = {
        currentKey: 'phaseConfig',
      };
      return { listDs, stageInfoDs, mixObj };
    },
    { cacheState: true }
  ),
  withCustomize({
    unitCode: ['SSLM.SUPPLIER_LIFE_POLICY_CONFIG.SEARCH_BAR'],
  })
)(Index);
