/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-05 17:09:36
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { createContext, useMemo, useEffect, useRef, useState, useCallback } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { ModalProvider, DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer, useObserver } from 'mobx-react-lite';
import { isTenantRoleLevel } from 'utils/utils';
import withProps from 'utils/withProps';
import { compose } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
// import { stringify } from 'querystring';
import notification from 'utils/notification';
import {
  getDynamicType,
  getDynamicDefine,
  getToDoDefine,
  createRoleDynamicType,
  saveRoleDynamicType,
  createRoleDynamicDefine,
  saveRoleDynamicDefine,
  createRoleToDo,
  saveRoleToDo,
} from '@/services/RoleConfigSercice';
import { dynamicTypeDS, dynamicDefineDS, toDoDefinitionDS, triggerRuleDS } from './stores';
import { dynamicTypeForm, dynamicDefineForm, toDoDefineForm } from './stores/FormDS';
import { ObjectMenuType } from '../components/utils/common';
import DynamicTypeFrom from './components/DynamicTypeFrom';
import DynamicDefineFrom from './components/DynamicDefineFrom';
import ToDoDefineFrom from './components/ToDoDefineFrom';
import ExpressionTerm from '../components/ExpressionEngine';

export const Store = createContext();

/**
 * @dynamicTypeDs       --动态类型表格
 * @dynamicDefineDs     --动态定义表格
 * @toDoDefinitionDs    --待办定义表格
 * @dynamicTypeFormDs   --动态类型表单
 * @dynamicDefineFormDs --动态定义表单
 * @toDoDefineFormDs    --待办定义表单
 * @handleCreateType    --动态类型新建
 * @handleCreateDefine  --动态定义新建
 * @handleCreateTodo    --待办定义新建
 * @handleDynamicConfig --动态定义规则
 * @handleToDoConfig    --待办定义规则
 * @param {*} props
 * @returns
 */
const StoreProvider = function StoreProvider(props) {
  const isTenant = isTenantRoleLevel();
  const {
    history,
    location,
    children,
    dynamicTypeDs,
    dynamicDefineDs,
    toDoDefinitionDs,
    dynamicTypeFormDs,
    dynamicDefineFormDs,
    toDoDefineFormDs,
    dynamicConfigDs,
    triggerRuleDs,
  } = props;
  const [activeKey, setActiveKey] = useState(ObjectMenuType.dynamicDefine);
  /**
   * 新建/编辑动态类型
   *
   */
  const handleCreateType = useCallback(
    ({ record }, title) => {
      if (record) {
        dynamicTypeFormDs.loadData([
          {
            ...record.data,
          },
        ]);
      } else {
        dynamicTypeFormDs.create({});
      }
      Modal.open({
        title,
        key: Modal.key(),
        drawer: true,
        closable: true,
        width: 300,
        destroyOnClose: true,
        children: <DynamicTypeFrom formDs={dynamicTypeFormDs} isTenant={isTenant} />,
        okText: intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        onOk: async () => {
          const validate = await dynamicTypeFormDs.current?.validate();
          const data = dynamicTypeFormDs.current.toData();
          if (validate) {
            if (data.categoryId) {
              const res = await saveRoleDynamicType({
                ...data,
              });
              if (getResponse(res)) {
                notification.success();
                dynamicTypeFormDs.reset();
                dynamicTypeDs.query();
              } else {
                return false;
              }
            } else {
              const res = await createRoleDynamicType({
                ...data,
              });
              if (getResponse(res)) {
                notification.success();
                dynamicTypeFormDs.reset();
                dynamicTypeDs.query();
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        },
        onCancel: () => {
          dynamicTypeFormDs.reset();
          dynamicTypeFormDs.loadData([]);
        },
      });
    },
    [dynamicTypeFormDs, dynamicTypeDs]
  );

  /**
   * 新建/编辑关注定义
   *
   */
  const handleCreateDefine = useCallback(
    ({ record }, title) => {
      if (record) {
        dynamicDefineFormDs.loadData([
          {
            ...record.data,
          },
        ]);
      } else {
        dynamicDefineFormDs.create({});
      }
      Modal.open({
        title,
        key: Modal.key(),
        drawer: true,
        closable: true,
        width: 300,
        destroyOnClose: true,
        children: <DynamicDefineFrom formDs={dynamicDefineFormDs} isTenant={isTenant} />,
        okText: intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        // footer: (okBtn, cancelBtn) => (status !== 'view' ? [okBtn, cancelBtn] : cancelBtn),
        onOk: async () => {
          if (isTenant) {
            const confirmRes = await Modal.confirm({
              title: intl.get('swbh.common.model.common.pleaseNote').d('请注意'),
              children: (
                <div>
                  {intl
                    .get('swbh.common.model.common.confirm')
                    .d(
                      '租户级定义任意一条关注/待办事件后，平台级的关注/待办将失效，如需定义租户级事件，请将本租户所需的事件全部引用到租户级。'
                    )}
                </div>
              ),
            });

            if (confirmRes === 'cancel') {
              return false;
            }
          }

          const validate = await dynamicDefineFormDs.current?.validate();
          const data = dynamicDefineFormDs.current.toData();
          if (validate) {
            if (data.actionId) {
              const res = await saveRoleDynamicDefine({
                ...data,
              });
              if (getResponse(res)) {
                notification.success();
                dynamicDefineFormDs.reset();
                dynamicDefineDs.query();
              } else {
                return false;
              }
            } else {
              const res = await createRoleDynamicDefine({
                ...data,
              });
              if (getResponse(res)) {
                notification.success();
                dynamicDefineFormDs.reset();
                dynamicDefineDs.query();
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        },
        onCancel: () => {
          dynamicDefineFormDs.reset();
          dynamicDefineFormDs.loadData([]);
        },
      });
    },
    [dynamicDefineFormDs, dynamicDefineDs]
  );
  /**
   * 新建/编辑 --待办定义
   */
  const handleCreateTodo = useCallback(
    ({ status, record }, title) => {
      if (record) {
        toDoDefineFormDs.loadData([
          {
            ...record.data,
          },
        ]);
      } else {
        toDoDefineFormDs.create({});
      }
      Modal.open({
        title,
        drawer: true,
        closable: true,
        width: 300,
        destroyOnClose: true,
        children: <ToDoDefineFrom formDs={toDoDefineFormDs} isTenant={isTenant} status={status} />,
        okText: intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        onOk: async () => {
          if (isTenant) {
            const confirmRes = await Modal.confirm({
              title: intl.get('swbh.common.model.common.pleaseNote').d('请注意'),
              children: (
                <div>
                  {intl
                    .get('swbh.common.model.common.confirm')
                    .d(
                      '租户级定义任意一条关注/待办事件后，平台级的关注/待办将失效，如需定义租户级事件，请将本租户所需的事件全部引用到租户级。'
                    )}
                </div>
              ),
            });

            if (confirmRes === 'cancel') {
              return false;
            }
          }

          const validate = await toDoDefineFormDs.current?.validate();
          const data = toDoDefineFormDs.current.toData();
          if (validate) {
            if (data.todoId) {
              const res = await saveRoleToDo({
                ...data,
                defaultClearFlag: 1,
              });
              if (getResponse(res)) {
                notification.success();
                toDoDefineFormDs.reset();
                toDoDefinitionDs.query();
              } else {
                return false;
              }
            } else {
              const res = await createRoleToDo({
                ...data,
                defaultClearFlag: 1,
              });
              if (getResponse(res)) {
                notification.success();
                toDoDefineFormDs.reset();
                toDoDefinitionDs.query();
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        },
        onCancel: () => {
          toDoDefineFormDs.reset();
          toDoDefineFormDs.loadData([]);
        },
      });
    },
    [toDoDefineFormDs, toDoDefinitionDs]
  );
  /**
   * 关注定义 --动态配置
   */
  const childRef = useRef({});
  const handleDynamicConfig = useCallback(
    ({ record }) => {
      Modal.open({
        title: intl.get('swbh.common.view.button.focusDefine').d('关注定义'),
        drawer: true,
        closable: true,
        style: { width: 800 },
        destroyOnClose: true,
        children: (
          <ExpressionTerm
            childRef={childRef}
            currentRecord={record}
            formDs={dynamicDefineDs}
            isTenant={isTenant}
            activeKey={activeKey}
            triggerRuleDs={triggerRuleDs}
          />
        ),
        okText: intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        onOk: async () => {
          const { getExpressionEngineJson, getSubExpressionEngineJson } = childRef.current || {};
          const generateCondJson = await getExpressionEngineJson();
          const subscriberJson = await getSubExpressionEngineJson();
          const isValid = await triggerRuleDs.validate();
          if (isValid && generateCondJson && subscriberJson) {
            saveRoleDynamicDefine({
              ...record.data,
              generateCondJson,
              subscriberJson,
            }).then((res) => {
              if (getResponse(res)) {
                notification.success();
                dynamicDefineDs.query();
              }
            });
          } else {
            return false;
          }
        },
      });
    },
    [dynamicDefineDs, triggerRuleDs, isTenant, childRef, activeKey]
  );
  /**
   * 待办定义 --动态配置
   */
  const handleToDoConfig = useCallback(
    ({ record }) => {
      Modal.open({
        title: intl.get('swbh.common.view.button.toDoDefine').d('待办定义'),
        drawer: true,
        closable: true,
        style: { width: 800 },
        destroyOnClose: true,
        children: (
          <ExpressionTerm
            childRef={childRef}
            currentRecord={record}
            formDs={toDoDefinitionDs}
            isTenant={isTenant}
            activeKey={activeKey}
            triggerRuleDs={triggerRuleDs}
          />
        ),
        okText: intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        onOk: async () => {
          const { getExpressionEngineJson, getSubExpressionEngineJson } = childRef.current || {};
          const generateCondJson = await getExpressionEngineJson();
          const subscriberJson = await getSubExpressionEngineJson();
          const isValid = await triggerRuleDs.validate();
          if (isValid && generateCondJson && subscriberJson) {
            saveRoleToDo({
              ...record.data,
              generateCondJson,
              subscriberJson,
            }).then((res) => {
              if (getResponse(res)) {
                notification.success();
                toDoDefinitionDs.query();
              }
            });
          } else {
            return false;
          }
        },
      });
    },
    [toDoDefinitionDs, triggerRuleDs, childRef, isTenant, activeKey]
  );

  const openReferPredefinedModal = (type = 'dynamicDefine') => {
    const tableDs =
      type === 'dynamicDefine' ? new DataSet(dynamicDefineDS('quote')) : new DataSet(toDoDefinitionDS('quote'));
    const columns =
      type !== 'dynamicDefine'
        ? [
            {
              name: 'combineName',
            },
            {
              name: 'todoCode',
            },
            {
              name: 'todoTitle',
            },
            {
              name: 'type',
            },
          ]
        : [
            {
              name: 'combineName',
            },
            {
              name: 'actionCode',
            },
            {
              name: 'actionTitle',
            },
          ];
    tableDs.query();
    const title = intl.get('hzero.common.button.referencePredefinedDynamic').d('引用预定义动态');
    Modal.open({
      title,
      key: Modal.key(),
      drawer: true,
      closable: true,
      style: { width: '742px' },
      destroyOnClose: true,
      children: (
        <Table style={{ maxHeight: 'calc(100vh - 220px)' }} queryFieldsLimit={2} dataSet={tableDs} columns={columns} />
      ),
      // okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      // footer: (okBtn, cancelBtn) => (status !== 'view' ? [okBtn, cancelBtn] : cancelBtn),
      // onOk: async () => {},
      onOk: async () => {
        const { selected } = tableDs;
        if (selected?.length === 0) {
          return;
        }
        if (isTenant) {
          const confirmRes = await Modal.confirm({
            title: intl.get('swbh.common.model.common.pleaseNote').d('请注意'),
            children: (
              <div>
                {intl
                  .get('swbh.common.model.common.confirm')
                  .d(
                    '租户级定义任意一条关注/待办事件后，平台级的关注/待办将失效，如需定义租户级事件，请将本租户所需的事件全部引用到租户级。'
                  )}
              </div>
            ),
          });

          if (confirmRes === 'cancel') {
            return false;
          }
        }

        return new Promise((resolve) => {
          if (type === 'dynamicDefine') {
            const actionIds = selected?.map((ele) => {
              const data = ele?.toData();
              return data?.actionId;
            });
            getDynamicDefine({ actionIds }).then((res) => {
              if (res && !res?.failed) {
                dynamicDefineDs.query();
                resolve();
              } else {
                notification.error({ message: res?.message });
                resolve();
              }
            });
          } else {
            const todoIds = selected?.map((ele) => {
              const data = ele?.toData();
              return data?.todoId;
            });
            getToDoDefine({ todoIds }).then((res) => {
              if (res && !res?.failed) {
                toDoDefinitionDs.query();
                resolve();
              } else {
                notification.error({ message: res?.message });
                resolve();
              }
            });
          }
        });
      },
      onCancel: () => {
        // dynamicDefineFormDs.reset();
        // dynamicDefineFormDs.loadData([]);
      },
    });
  };

  /**
   * 引用平台--预定义动态
   */
  const handleReferPredefined = useCallback(
    async (type) => {
      if (type === 'dynamicType') {
        // 关注类型
        const res = await getResponse(getDynamicType());
        if (res) {
          dynamicTypeDs.query();
        }
      } else if (type === 'dynamicDefine') {
        // 关注定义
        // const res = await getResponse(getDynamicDefine());
        // if (res) {
        //   dynamicTypeDs.query();
        // }
        openReferPredefinedModal('dynamicDefine');
      } else {
        // 待办定义
        // const res = await getResponse(getToDoDefine());
        // if (res) {
        //   dynamicTypeDs.query();
        // }
        openReferPredefinedModal('toDoDefine');
      }
    },
    [dynamicTypeDs]
  );
  const headerButton = useCallback(() => {
    return useObserver(() => [
      activeKey === 'dynamicType' && (
        <>
          <Button
            icon="add"
            color={ButtonColor.primary}
            onClick={() =>
              handleCreateType(
                { status: 'add' },
                intl.get('swbh.common.view.message.title.createFocusType').d('新建关注类型')
              )
            }
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {isTenant && (
            <Button style={{ marginRight: 10 }} icon="filter_none" onClick={() => handleReferPredefined('dynamicType')}>
              {intl.get('hzero.common.button.referencePredefinedDynamic').d('引用预定义动态')}
            </Button>
          )}
        </>
      ),
      activeKey === 'dynamicDefine' && (
        <>
          <Button
            icon="add"
            color={ButtonColor.primary}
            onClick={() =>
              handleCreateDefine(
                { status: 'add' },
                intl.get('swbh.common.view.message.title.createDefine').d('新建关注定义')
              )
            }
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {isTenant && (
            <Button
              style={{ marginRight: 10 }}
              icon="filter_none"
              onClick={() => handleReferPredefined('dynamicDefine')}
            >
              {intl.get('hzero.common.button.referencePredefinedDynamicDefine').d('引用预定义关注')}
            </Button>
          )}
        </>
      ),
      activeKey === 'toDoDefine' && ( // 待办定义
        <>
          {/* {!isTenant && ( */}
          <Button
            icon="add"
            color={ButtonColor.primary}
            onClick={() => handleCreateTodo({ status: 'add' }, intl.get('hzero.common.button.create').d('新建'))}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {/* )} */}
          {isTenant && (
            <Button style={{ marginRight: 10 }} icon="filter_none" onClick={() => handleReferPredefined('toDoDefine')}>
              {intl.get('hzero.common.button.referencePredefinedToDoDefine').d('引用预定义待办')}
            </Button>
          )}
        </>
      ),
    ]);
  }, [activeKey, isTenant]);
  const value = useMemo(() => {
    return {
      history,
      location,
      dynamicTypeDs,
      dynamicDefineDs,
      toDoDefinitionDs,
      dynamicTypeFormDs,
      dynamicDefineFormDs,
      toDoDefineFormDs,
      dynamicConfigDs,
      activeKey,
      isTenant,
      setActiveKey,
      handleCreateType,
      handleCreateDefine,
      handleCreateTodo,
      handleDynamicConfig,
      handleToDoConfig,
      headerButton,
    };
  }, [
    history,
    location,
    dynamicTypeDs,
    dynamicDefineDs,
    toDoDefinitionDs,
    dynamicTypeFormDs,
    dynamicDefineFormDs,
    toDoDefineFormDs,
    dynamicConfigDs,
    activeKey,
    isTenant,
    setActiveKey,
    handleCreateType,
    handleCreateDefine,
    handleCreateTodo,
    handleDynamicConfig,
    handleToDoConfig,
    headerButton,
  ]);

  useEffect(() => {
    dynamicTypeDs.query();
    dynamicDefineDs.query();
    toDoDefinitionDs.query();
  }, []);
  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};
export default compose(
  formatterCollections({
    code: ['swbh.rdConfig', 'swbh.common'],
  }),
  withProps(
    () => {
      const triggerRuleDs = new DataSet(triggerRuleDS());
      const dynamicTypeDs = new DataSet(dynamicTypeDS());
      const dynamicDefineDs = new DataSet(dynamicDefineDS());
      const toDoDefinitionDs = new DataSet(toDoDefinitionDS());
      const dynamicTypeFormDs = new DataSet(dynamicTypeForm());
      const dynamicDefineFormDs = new DataSet(dynamicDefineForm());
      const toDoDefineFormDs = new DataSet(toDoDefineForm());
      return {
        dynamicTypeDs,
        dynamicDefineDs,
        toDoDefinitionDs,
        dynamicTypeFormDs,
        dynamicDefineFormDs,
        toDoDefineFormDs,
        triggerRuleDs,
      };
    },
    { cacheState: true }
  ),
  observer
)(StoreProvider);
