/*
 * @Date: 2022-09-20 15:36:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { connect } from 'dva';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { compose, isEmpty, head } from 'lodash';
import { Tabs, Spin, Modal, useDataSet } from 'choerodon-ui/pro';
import React, { Fragment, useEffect, useCallback, useState, useRef, useMemo } from 'react';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  enable,
  resetDefault,
  saveStrategy,
  publishStrategy,
  queryApplyStage,
  queryDimension,
  deleteApplyStage,
  batchCreateProcess,
  batchSaveProcess,
} from '@/services/supplierLifePolicyConfigService';
import BatchEdit from './BatchEdit';
import HeaderBtns from './HeaderBtns';
import BatchEditDetail from './BatchEdit/Detail';
import { getBasicDs } from '../stores/getBasicDS';
import { getTabPaneList, getHeaderTitle, getBackPath } from './utils';
import { getApplyScopeDS } from '../stores/getApplyScopeDS';

const { TabPane } = Tabs;

const Detail = ({
  dispatch,
  lifeCyclePolicyRemote,
  primaryColor = '#00B8CC',
  match: {
    params: { strategyId, status },
  },
}) => {
  const detailRef = useRef(null);
  const processRef = useRef(null);

  const [allLoading, setAllLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('basicInfo');
  const [versionNumber, setVersionNumber] = useState();
  const [applyStageDataSource, setApplyStageDataSource] = useState([]);
  const [applyScopeDataSource, setApplyScopeDataSource] = useState({});

  const isEdit = useMemo(() => status === 'edit', [status]);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { editFlag, historyFlag, jumpSource, sourceStrategyId } = routerParams;

  const newEditFlag = Number(editFlag);

  // 基础信息ds
  const basicDs = useDataSet(() => getBasicDs({ isEdit }), [isEdit]);
  // 试用范围ds
  const applyScopeDs = useDataSet(() => getApplyScopeDS(), []);

  const finalLoading = allLoading || saveLoading;

  useEffect(() => {
    handleApplyScope();
    handleApplyStage();
  }, [isEdit, strategyId]);

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  // 适用范围-查询
  const handleApplyScope = useCallback(() => {
    setAllLoading(true);
    queryDimension({ strategyId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { lifeCycleStrategy, ...others } = res;
          setApplyScopeDataSource(others);
          setVersionNumber(lifeCycleStrategy.versionNumber);
          basicDs.loadData([lifeCycleStrategy]);
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  }, [strategyId, isEdit]);

  // 适用阶段-查询(与流程设置-阶段，接口公用)
  const handleApplyStage = useCallback(
    params => {
      setAllLoading(true);
      queryApplyStage({ strategyId, hasProc: false, ...params })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            const dataSource = res.map(item => ({ ...item, id: item.stageCode }));
            setApplyStageDataSource(dataSource);
          }
        })
        .finally(() => {
          setAllLoading(false);
        });
    },
    [strategyId, isEdit]
  );

  // 适用阶段-恢复默认
  const handleRestoreDefault = useCallback(() => {
    setSaveLoading(true);
    resetDefault({ strategyId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          handleApplyStage();
        }
      })
      .finally(() => {
        setSaveLoading(false);
      });
  }, [strategyId]);

  // 适用阶段-删除阶段
  const handleDeleteStage = useCallback(curStage => {
    setAllLoading(true);
    deleteApplyStage(curStage)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          handleApplyStage();
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  }, []);

  // 流程设置 - 批量编辑
  const batchEditRef = useRef(null);
  let _modal;
  const handleBatchEdit = useCallback(() => {
    _modal = Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 380 },
      bodyStyle: { padding: 0 },
      title: intl.get('sslm.common.button.batchEdit').d('批量编辑'),
      children: <BatchEdit strategyId={strategyId} ref={batchEditRef} />,
      okText: intl.get('sslm.common.view.btn.nextStep').d('下一步'),
      onOk: async () => {
        if (batchEditRef.current) {
          const validateFlag = await batchEditRef.current.formDs.validate();
          const { checkedValue } = batchEditRef.current;
          if (validateFlag) {
            const data = batchEditRef.current.formDs?.current?.toJSONData() || {};
            const params = {
              ...data,
              strategyId,
            };
            await batchCreateProcess(params).then(response => {
              const res = getResponse(response);
              if (res) {
                handleApplyScope(); // 查询适用范围，用于刷新单据状态，放开按钮
                _modal.update({
                  style: { width: 1200 },
                  children: (
                    <BatchEditDetail
                      strategyId={strategyId}
                      primaryColor={primaryColor}
                      processRef={processRef}
                      batchProcIds={res}
                      checkedValue={checkedValue}
                    />
                  ),
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  cancelButton: false,
                  onOk: async () => {
                    if (processRef.current) {
                      const stageProcConfigs = await processRef.current.getSaveParams();
                      if (!isEmpty(stageProcConfigs)) {
                        await batchSaveProcess({ ...head(stageProcConfigs), procIds: res }).then(
                          saveResponse => {
                            const saveRes = getResponse(saveResponse);
                            if (saveRes) {
                              handleApplyStage();
                              processRef.current.setCurProcess({});
                            }
                          }
                        );
                      }
                      return stageProcConfigs;
                    }
                  },
                });
              }
            });
          }
        }
        return false;
      },
    });
  }, [strategyId, applyStageDataSource, processRef]);

  // 刷新
  const handleRefresh = useCallback(() => {
    notification.success();
    handleApplyScope(); // 查询适用范围
    if (processRef.current) {
      // 查询流程设置
      processRef.current.onQuery();
    }
  }, [detailRef, processRef]);

  // 获取需保存的参数
  const getSaveParams = async () => {
    const payload = { strategyId };
    const basicValidate = await basicDs.validate();
    if (basicValidate) {
      payload.lifeCycleStrategy = basicDs.current?.toJSONData() || {};
    } else {
      notification.warning({
        message: intl
          .get('sslm.supplierLifePolicyConfig.view.message.checkBasic')
          .d('请检查【基础信息】是否填写有误'),
      });
      return false;
    }
    if (detailRef.current) {
      const dimConfig = await detailRef.current.getSaveParams();
      if (dimConfig) {
        payload.dimConfig = dimConfig;
      } else {
        return false;
      }
    }
    if (processRef.current) {
      const stageProcConfigs = await processRef.current.getSaveParams();
      if (stageProcConfigs) {
        payload.stageProcConfigs = stageProcConfigs;
      } else {
        return false;
      }
    }
    return payload;
  };

  // 发布
  const handlePublish = (saveParams, resolve) => {
    setAllLoading(true);
    return publishStrategy(saveParams)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          dispatch(
            routerRedux.push({
              pathname: '/sslm/supplier-life-policy-config/list',
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
  };

  // 保存回调
  const handleSaveAndPublish = useCallback(
    async type => {
      const saveParams = await getSaveParams();
      if (saveParams) {
        if (type === 'save') {
          setSaveLoading(true);
          return saveStrategy(saveParams)
            .then(response => {
              const res = getResponse(response);
              if (res) {
                handleRefresh();
              }
            })
            .finally(() => {
              setSaveLoading(false);
            });
        } else {
          const { lifeCycleStrategy: { parentEnabledFlag } = {} } = saveParams || {};
          if (+parentEnabledFlag === 0) {
            // 父级策略禁用时，发布增加提示
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: intl
                .get('sslm.common.view.message.publishMsg')
                .d('当前策略为禁用状态，发布后策略会变更为已发布状态，确认发布新版本?'),
              onOk: () => {
                return new Promise(resolve => {
                  handlePublish(saveParams, resolve);
                });
              },
            });
          } else {
            return handlePublish(saveParams);
          }
        }
      }
    },
    [detailRef, processRef, strategyId]
  );

  // 编辑
  const handleEdit = () => {
    const { strategyStatus } = applyScopeDs.current?.get(['strategyStatus']) || {};
    const params = basicDs.current?.toData() || {};
    if (strategyStatus === 'RELEASED') {
      setAllLoading(true);
      enable(params)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            dispatch(
              routerRedux.push({
                pathname: `/sslm/supplier-life-policy-config/detail/${params.draftId}/edit`,
              })
            );
          }
        })
        .finally(() => {
          setAllLoading(false);
        });
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sslm/supplier-life-policy-config/detail/${strategyId}/edit`,
        })
      );
    }
  };

  const policyConfigList = getTabPaneList();
  const componentProps = {
    basicInfo: {
      dataSet: basicDs,
    },
    applyScope: {
      strategyId,
      ref: detailRef,
      dataSet: applyScopeDs,
      dataSource: applyScopeDataSource,
    },
    applyStage: {
      primaryColor,
      dataSource: applyStageDataSource,
      onDeleteStage: handleDeleteStage,
    },
    setProcess: {
      strategyId,
      primaryColor,
      ref: processRef,
      stageDataSource: applyStageDataSource,
      onQueryStage: handleApplyStage,
    },
  };

  return (
    <Fragment>
      <Header
        title={getHeaderTitle(status, jumpSource, versionNumber)}
        backPath={getBackPath({ jumpSource, sourceStrategyId, editFlag: newEditFlag })}
      >
        <HeaderBtns
          isEdit={isEdit}
          basicDs={basicDs}
          dispatch={dispatch}
          activeKey={activeKey}
          loading={finalLoading}
          editFlag={newEditFlag}
          jumpSource={jumpSource}
          historyFlag={historyFlag}
          versionNumber={versionNumber}
          sourceStrategyId={sourceStrategyId}
          onEdit={handleEdit}
          onBatchEdit={handleBatchEdit}
          onSaveAndPublish={handleSaveAndPublish}
          onRestoreDefault={handleRestoreDefault}
        />
      </Header>
      <Content style={{ padding: 20 }}>
        <Spin spinning={finalLoading}>
          <Tabs animated={false} onChange={handleTabChange} activeKey={activeKey}>
            {policyConfigList.map(config => (
              <TabPane
                disabledValidate
                key={config.key}
                tab={config.title}
                forceRender={config.key === 'applyScope'}
              >
                <config.component
                  isEdit={isEdit}
                  remote={lifeCyclePolicyRemote}
                  {...componentProps[config.key]}
                />
              </TabPane>
            ))}
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ user = {} }) => {
    const { currentUser: { themeConfigVO = {} } = {} } = user;
    const {
      enableThemeConfig, // 是否开启了新主题
      colorCode, // 主题色
    } = themeConfigVO;
    if (enableThemeConfig) {
      return {
        primaryColor: colorCode,
      };
    }
    return {};
  }),
  formatterCollections({
    code: ['sslm.supplierLifePolicyConfig', 'sslm.common', 'sslm.workbench'],
  }),
  remote({
    code: 'SSLM_SUPPLIER_LIFE_POLICY_CONFIG',
    name: 'lifeCyclePolicyRemote',
  })
)(Detail);
