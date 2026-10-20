/**
 * 功能定义-Tabs
 * @date: 2022-05-22
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useCallback, useState, useContext, useMemo, useEffect } from 'react';
import { List } from 'choerodon-ui';
import { Icon, Tabs, TextField, Spin, ModalProvider, Form, IntlField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel, getResponse } from 'utils/utils';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import { HZERO_PLATFORM } from 'utils/config';
import { Store } from './store';
import { platform, tenant } from '../MenuGroup/SrmMenuGroup';
import styles from './index.less';

const { TabPane } = Tabs;
const FunctionTabPane = (props) => {
  const { paneType, editStatus } = props;
  const Modal = ModalProvider.useModal();
  const {
    functionDs: dataSet,
    handleActiveMenu,
    activeMenus,
    setActiveMenus,
    functionContentDs,
    activeTabKey,
  } = useContext(Store);
  const [searchValue, setSearchValue] = useState('');
  const [editId, setEditId] = useState(null);
  const [records, setRecords] = useState([]);
  const activeMenusId = useMemo(() => {
    if (activeMenus[paneType]) {
      return activeMenus[paneType].id;
    }
    return null;
  }, [activeMenus]);

  const openModal = () => {
    const record = dataSet.create({ tenantId: getCurrentOrganizationId() }, 0);
    Modal.open({
      title: intl.get('hzero.common.button.create').d('新建'),
      children: (
        <Form record={record}>
          <IntlField name="name" />
        </Form>
      ),
      onOk: () => {
        dataSet.submit();
      },
    });
  };

  const updateMenu = async (e, record) => {
    e.stopPropagation();
    record.setState('updateName', true);
    await dataSet.submit();
  };

  const deleteMenu = async (e, record) => {
    e.stopPropagation();
    dataSet.delete(record);
  };

  const updateEditId = (e, id) => {
    e.stopPropagation();
    setEditId(id);
  };

  useEffect(() => {
    queryDs('');
  }, []);

  const queryDs = (value) => {
    setSearchValue(value);
    setActiveMenus((preState) => {
      const currentState = { ...preState };
      currentState[paneType] = null;
      return currentState;
    });
    if (dataSet) {
      dataSet.setQueryParameter('name', value);
      dataSet.query().then((res) => {
        setRecords(res);
      });
    }
  };

  // 清除
  const onClear = useCallback(() => {
    queryDs('');
  }, [dataSet]);

  // 搜索
  const onSearch = useCallback(
    (value) => {
      if (value) {
        queryDs(value);
      } else {
        onClear();
      }
    },
    [dataSet]
  );

  const getAllMenus = () => {
    setActiveMenus((preState) => {
      const currentState = { ...preState };
      currentState[paneType] = null;
      return currentState;
    });
    functionContentDs.setQueryParameter('both', true);
    functionContentDs.query();
  };

  const onEditBlur = useCallback((record) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      if (!record.getState('updateName')) {
        record.set('name', record.getPristineValue('name'));
      }
      setEditId(0);
    }, 200);
  }, []);

  const renderItem = useCallback(
    (record) => {
      if (record) {
        const { id, name } = record;
        const compare = <Icon type="account_tree" />;
        const className = activeMenusId === id ? 'active-item' : '';
        if (editId === id) {
          return (
            <List.Item key={id} className={className}>
              <span>
                {compare}
                <IntlField
                  name="name"
                  dataSet={dataSet}
                  record={record}
                  onBlur={() => onEditBlur(record)}
                  autoFocus
                />
                <Icon type="check_circle_outline-o" onClick={(e) => updateMenu(e, record)} />
              </span>
            </List.Item>
          );
        }
        return (
          <List.Item
            onClick={() => handleActiveMenu(record, activeTabKey)}
            key={id}
            className={className}
          >
            <span>
              {compare}
              {name}
            </span>
            {editStatus ? <Icon type="border_color" onClick={(e) => updateEditId(e, id)} /> : null}
            {activeMenusId !== id ? (
              <Icon type="close" onClick={(e) => deleteMenu(e, record)} />
            ) : null}
          </List.Item>
        );
      }
      return null;
    },
    [dataSet, editId, activeMenusId, activeTabKey, editStatus]
  );

  return (
    <Spin dataSet={dataSet}>
      <TextField
        placeholder={intl
          .get('hiam.menuConfig.view.modal.module.name.search')
          .d('请输入模块名称查询')}
        value={searchValue}
        clearButton
        onClear={onClear}
        onChange={onSearch}
        className="function-search"
      />
      <div className="function-list-header">
        <span className={activeMenusId ? '' : 'header-gl'} onClick={getAllMenus}>
          {intl.get('hzero.common.status.all').d('全部')}
        </span>
        {editStatus ? <Icon type="add" disabled={!editStatus} onClick={openModal} /> : null}
      </div>
      <div className="function-list-container">{records.map((record) => renderItem(record))}</div>
    </Spin>
  );
};

const FunctionTabs = () => {
  const { activeTabKey, setActiveTabKey, handleActiveMenu, activeMenus, functionDs } = useContext(
    Store
  );
  const [editStatus, setEditStatus] = useState(false);

  useEffect(() => {
    request(`${HZERO_PLATFORM}/v1/profile-value?profileName=MODULE_CONFIG_ENABLE`).then((res) => {
      if (getResponse(res)) {
        setEditStatus(res === 1);
      }
    });
  }, []);

  // 切换tab
  const onChange = useCallback(
    (value) => {
      setActiveTabKey(value);
      handleActiveMenu(activeMenus[value], value);
    },
    [activeMenus, functionDs]
  );

  return (
    <Tabs defaultActiveKey={activeTabKey} onChange={onChange} className={styles['function-tabs']}>
      {isTenantRoleLevel() ? null : (
        <TabPane
          tab={intl.get('hiam.menuConfig.view.tab.level.platform').d('平台层')}
          key={platform}
        >
          <FunctionTabPane paneType={platform} editStatus={editStatus} />
        </TabPane>
      )}
      <TabPane tab={intl.get('hiam.menuConfig.view.tab.level.tenant').d('租户层')} key={tenant}>
        <FunctionTabPane paneType={tenant} editStatus={editStatus} />
      </TabPane>
    </Tabs>
  );
};

export default formatterCollections({
  code: ['hiam.menuConfig'],
})(FunctionTabs);
