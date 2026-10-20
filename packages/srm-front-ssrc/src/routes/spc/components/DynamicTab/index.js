import React, { useCallback, useState, useEffect } from 'react';
import { Button, Menu, Icon, Dropdown, Output, Tabs, Switch, Form } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import { ReactComponent as DynamicTabTipsImg } from '@/assets/dynamic-tab-tips.svg';

import intl from 'utils/intl';
import styles from './style.less';

const { TabPane } = Tabs;
const { Item } = Menu;

const Index = (props) => {
  const {
    isEdit,
    activeKey,
    dataSet,
    tabName,
    onAddTab = noop,
    onChangeTab = noop,
    onEditTab = noop,
    renderTabPane = noop,
    addAllStageDs,
    selectAllFlag = 0,
  } = props;

  const [hiddenFlag, setHiddenFlag] = useState(!!selectAllFlag);

  useEffect(() => {
    handleSwitchChange(selectAllFlag);
  }, [selectAllFlag]);

  const handleAddTab = useCallback((firstCreate = false) => {
    onAddTab();
    // 第一次新建，BOM名称非必填
    if (firstCreate) {
      addAllStageDs.current.set('includeAllFlag', 1);
      handleSwitchChange(1);
    }
  });

  const handleChangeTab = useCallback((ladderId) => {
    onChangeTab(ladderId);
  });

  const handleMenuClick = useCallback(
    async (key, record) => {
      if (key === 'delete') {
        await dataSet.delete([record], {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        });
        handleChangeTab();
      } else {
        onEditTab(record);
      }
    },
    [dataSet]
  );

  const renderTabPanes = (ds) => {
    // return ds?.length === 0 ? (
    //   <div className={styles['table-wrapper']} />
    // ) : (
    return ds
      ?.filter((record) => !record.get('hiddenFlag'))
      .map((record, index) => (
        <TabPane
          tab={
            <div className={styles['tab-item']}>
              <Output name={tabName} record={record} className={styles['ladder-name']} />
              {isEdit && (
                <Dropdown
                  overlay={
                    <Menu onClick={({ key }) => handleMenuClick(key, record, index)}>
                      <Item key="update">{intl.get('hzero.common.button.edit').d('编辑')}</Item>
                      <Item key="delete">{intl.get('hzero.common.button.delete').d('删除')}</Item>
                    </Menu>
                  }
                >
                  <Icon className={styles['ladder-operate']} type="more_vert" />
                </Dropdown>
              )}
            </div>
          }
          key={record.key}
        >
          {renderTabPane(record)}
        </TabPane>
      ));
    // );
  };

  const handleSwitchChange = useCallback(
    (value) => {
      const hiddenTabFlag = !!value;
      setHiddenFlag(hiddenTabFlag);
      // 隐藏非激活页签
      dataSet.forEach((record) => {
        if (record.key !== activeKey) {
          record.set('hiddenFlag', hiddenTabFlag);
        } else {
          record.set('hiddenFlag', false);
        }
      });
      // 隐藏BOM名称
      dataSet.setState('hiddenBom', hiddenTabFlag);
    },
    [activeKey]
  );

  const otherProps = {
    tabBarExtraContent: (
      <>
        <Form
          columns={1}
          dataSet={addAllStageDs}
          labelLayout="float"
          className={styles['tabs-wrapper-extra-form']}
          disabled={!isEdit}
        >
          <Switch name="includeAllFlag" onChange={handleSwitchChange} />
        </Form>
        <Button
          icon="playlist_add"
          color="primary"
          funcType="flat"
          onClick={() => handleAddTab()}
          hidden={hiddenFlag || !isEdit}
        >
          {intl.get('spc.formulaManage.view.placeholder.addLadder').d('新增阶梯')}
        </Button>
      </>
    ),
    className: styles['edit-tabs-wrapper'],
  };

  return dataSet?.length === 0 ? (
    <div className={styles['no-content-wrapper']}>
      <div className={styles['no-content']}>
        <span className={styles['no-content-img']}>
          <DynamicTabTipsImg />
        </span>
        <span className={styles['no-content-tips']}>
          {intl.get('spc.formulaManage.view.message.noContentTips').d('暂无阶梯')}
        </span>
        {isEdit && (
          <Button color="primary" onClick={() => handleAddTab(true)}>
            {intl.get('spc.formulaManage.view.placeholder.addLadder').d('新增阶梯')}
          </Button>
        )}
      </div>
    </div>
  ) : (
    <Tabs
      onChange={handleChangeTab}
      activeKey={activeKey}
      tabPosition="left"
      className={styles['tabs-wrapper']}
      {...otherProps}
    >
      {renderTabPanes(dataSet)}
    </Tabs>
  );
};

export default Index;
