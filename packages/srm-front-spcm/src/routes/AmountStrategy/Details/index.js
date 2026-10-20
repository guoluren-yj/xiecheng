/*
 * @Date: 2024-06-07 16:18:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { compose, isEmpty, head, forEach } from 'lodash';
import { useDataSet, Tabs, Spin, Modal } from 'choerodon-ui/pro';
import React, { Fragment, useState, useEffect, useMemo } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { saveStrategy, publishStrategy, unlockStrategy } from '@/services/amountStrategyService';

import styles from '../styles.less';
import HeaderBtns from './HeaderBtns';
import Basic from '../components/Basic';
import { getBackPath, getHeaderTitle } from '../utils';
import ControlRules from '../components/ControlRules';
import { getFormDS, getControlRulesDS } from '../stores/getDetailDS';

const { TabPane } = Tabs;

const Details = ({
  dispatch,
  match: {
    params: { status, strategyId },
  },
}) => {
  const routerParam = querystring.parse(location.search.substr(1));
  const { editFlag, sourceKey, historyFlag, sourceStrategyId, parentEnabledFlag } = routerParam;
  const defaultKey = useMemo(() => (sourceKey === 'CREATE' ? 'controlRules' : 'baseInfo'), [
    sourceKey,
  ]);

  const [allLoading, setAllLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultKey);

  const isEdit = useMemo(() => status === 'edit', [status]);

  const formDs = useDataSet(() => getFormDS({ isEdit, strategyId }), [isEdit, strategyId]);
  const controlRulesDs = useDataSet(() => getControlRulesDS(), []);

  const { versionNumber, strategyStatus } =
    formDs.current?.get(['versionNumber', 'strategyStatus']) || {};

  const newEditFlag = Number(editFlag);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  // 刷新数据
  const handleRefresh = () => {
    if (strategyId) {
      setAllLoading(true);
      formDs
        .query()
        .then((response) => {
          if (!isEmpty(response.strategyLineList)) {
            controlRulesDs.loadData(response.strategyLineList);
          } else {
            queryIdpValue('SPCM.STRATEGY.NODE').then((response) => {
              if (response) {
                const data = response.map((n) => ({ ...n, node: n.value }));
                controlRulesDs.loadData(data);
              }
            });
          }
        })
        .finally(() => {
          setAllLoading(false);
        });
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [strategyId, isEdit]);

  // 获取需保存的数据
  const getSaveParams = async () => {
    const validateFlag = (await formDs.validate()) && (await controlRulesDs.validate());
    if (validateFlag) {
      return {
        ...formDs.current.toJSONData(),
        strategyLineList: controlRulesDs.toJSONData(),
      };
    } else {
      const errorsMsg = [];
      const { errors = [] } = head(formDs.getValidationErrors()) || {};
      if (!isEmpty(errors)) {
        forEach(errors, (curent) => {
          const { validationMessage } = head(curent?.errors) || {};
          if (validationMessage) {
            errorsMsg.push(<div>{validationMessage}</div>);
          }
        });
      }
      if (!isEmpty(errorsMsg)) {
        notification.warning({
          description: errorsMsg,
        });
      }
    }
  };

  // 保存
  const handleSave = async () => {
    const saveParams = await getSaveParams();
    if (saveParams) {
      setAllLoading(true);
      return saveStrategy(saveParams)
        .then((response) => {
          const res = getResponse(response);
          if (res) {
            handleRefresh();
            notification.success();
          }
        })
        .finally(() => setAllLoading(false));
    }
  };

  const handleRelease = async (resolve) => {
    const saveParams = await getSaveParams();
    if (saveParams) {
      setAllLoading(true);
      return publishStrategy(saveParams)
        .then((response) => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/spcm/amount-strategy/list',
              })
            );
          }
        })
        .finally(() => {
          setAllLoading(false);
          if (resolve) {
            resolve(false);
          }
        });
    }
  };

  // 发布
  const handleReleaseModal = () => {
    if (+parentEnabledFlag === 0) {
      // 父级策略禁用时，发布增加提示
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('spcm.common.view.message.publishMsg')
          .d('当前策略为禁用状态，发布后策略会变更为已发布状态，确认发布新版本?'),
        onOk: () => {
          return new Promise((resolve) => {
            handleRelease(resolve);
          });
        },
      });
    } else {
      return handleRelease();
    }
  };

  // 跳转到可编辑页面
  const jumpEditPage = (id) => {
    dispatch(
      routerRedux.push({
        pathname: `/spcm/amount-strategy/${id}/edit`,
        search: querystring.stringify({
          ...routerParam,
          sourceKey: 'EDIT',
        }),
      })
    );
  };

  // 编辑
  const handleEdit = () => {
    if (strategyStatus === 'PUBLISHED') {
      const params = formDs.current?.toData() || {};
      setAllLoading(true);
      unlockStrategy(params)
        .then((response) => {
          const res = getResponse(response);
          if (res) {
            jumpEditPage(res.strategyId);
          }
        })
        .finally(() => {
          setAllLoading(false);
        });
    } else {
      jumpEditPage(strategyId);
    }
  };

  return (
    <Fragment>
      <Header
        backPath={getBackPath(routerParam)}
        title={getHeaderTitle(status, sourceKey, versionNumber)}
      >
        <HeaderBtns
          isEdit={isEdit}
          formDs={formDs}
          dispatch={dispatch}
          onSave={handleSave}
          onEdit={handleEdit}
          editFlag={newEditFlag}
          sourceKey={sourceKey}
          allLoading={allLoading}
          historyFlag={historyFlag}
          versionNumber={versionNumber}
          onRelease={handleReleaseModal}
          sourceStrategyId={sourceStrategyId}
        />
      </Header>
      <Content className={styles['strategy-content']}>
        <Spin spinning={allLoading}>
          <Tabs tabPosition="left" activeKey={activeKey} onChange={handleTabChange}>
            <TabPane
              forceRender
              key="baseInfo"
              disabledValidate
              tab={intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
            >
              <Basic dataSet={formDs} isEdit={isEdit} />
            </TabPane>
            <TabPane
              forceRender
              key="controlRules"
              disabledValidate
              tab={intl.get('spcm.amountStrategy.model.title.controlRules').d('控制规则')}
            >
              <ControlRules formDs={formDs} isEdit={isEdit} controlRulesDs={controlRulesDs} />
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.amountStrategy'],
  })
)(Details);
