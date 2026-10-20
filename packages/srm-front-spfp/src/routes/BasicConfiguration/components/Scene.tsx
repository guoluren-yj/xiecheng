import React, { useContext, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Button, Modal, Dropdown, Menu } from 'choerodon-ui/pro';
import { Icon, Tabs } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import SceneContent from './SceneContent';
import style from '../index.less';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import SceneAdd from './SceneAdd';

const { TabPane } = Tabs;


const { Item } = Menu;

const Scene = observer(() =>
{

  const { sceneMenuDs, handleSetActiveKey, activeKey, queryActiveFieldData, remoteProps } = useContext<StoreValueType>(Store);


  const onOk = useCallback((scenarioConfigId) =>
  {
    // eslint-disable-next-line no-unused-expressions
    sceneMenuDs?.query();
    if (scenarioConfigId && queryActiveFieldData)
    {
      // 重新查询字段信息
      queryActiveFieldData(scenarioConfigId);
    }

  }, [sceneMenuDs, queryActiveFieldData]);

  const handleScene = useCallback(
    (record) =>
    {
      Modal.open({
        title: record ?
          intl.get('spfp.basicConfiguration.button.updateScene').d('修改场景信息')
          :
          intl.get('spfp.basicConfiguration.button.addSceneInfo').d('新增场景信息'),
        destroyOnClose: true,
        children: <SceneAdd data={record?.toData()} onOk={onOk} />,
      });

    },
    [onOk],
  );


  const handleMenuClick = useCallback(
    async (key, record) =>
    {
      record.setState('isEdit', true);
      if (key === 'delete')
      {
        const res = await sceneMenuDs.delete([record], {
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('spfp.basicConfiguration.view.message.isDeleteSelectedLines').d('确认删除选中行？'),
        });
        if (res && sceneMenuDs.length > 0)
        {
          const scenarioConfigId = sceneMenuDs.records[0].get('scenarioConfigId');
          if (scenarioConfigId)
          {
            queryActiveFieldData(scenarioConfigId);
          }

        }
      } else if (key === 'update') {
        handleScene(record);
      }
    },
    [queryActiveFieldData, sceneMenuDs, handleScene],
  );



  const getPanes = useCallback(() =>
  {

    return sceneMenuDs.map(record =>
    {
      const tabClassNameCux = remoteProps ? remoteProps.process('SPFP.BASIC_CONFIGURATION_DETAIL_CUX.SCENEE_CLASSNAME', '', {
        record,
      }) : '';
      return {
        key: record.get('scenarioConfigId'),
        tab: (
          <div className={style['spfp-basic-config-scene-tab-item']}>
            <span className={`scenario-name ${tabClassNameCux}`}>{record.get('scenarioName')}</span>
            <Dropdown
              overlay={
                <Menu onClick={({ key }) => handleMenuClick(key, record)}>
                  <Item key="delete">{intl.get('spfp.basicConfiguration.button.deleteScene').d('删除场景')}</Item>
                  <Item key="update">{intl.get('spfp.basicConfiguration.button.updateScene').d('修改场景信息')}</Item>
                  {remoteProps
                      ? remoteProps.process('SPFP.BASIC_CONFIGURATION_DETAIL_CUX.SCENEE_OPERATE', '', {
                        record,
                        sceneMenuDs,
                        onOk,
                      })
                    : ''}
                </Menu>
            }
            >
              <Icon type="more_horiz" className='scenario-icon' />
            </Dropdown>
          </div>
        ),
        content: <SceneContent recordProps={record} />,
      };
    });
  }, [sceneMenuDs, handleMenuClick, remoteProps, onOk]);


  return (
    <Tabs
      tabPosition={TabsPosition.left}
      className={style['spfp-basic-config-tabpane-scene']}
      flex
      activeKey={activeKey}
      // inkBarStyle={{ display: 'none' }}
      onChange={handleSetActiveKey}
      tabBarExtraContent={
        <div style={{ fontSize: '14px' }}>
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ marginTop: 10 }}
            onClick={() => handleScene(undefined)}
          >
            {intl.get('spfp.basicConfiguration.button.addScene').d('新增场景')}
          </Button>
          <div>
            {intl.get('spfp.basicConfiguration.tabpane.description').d('可以维护和切换')}
          </div>
        </div>}
    >
      {
        getPanes().map((pane) =>
        {
          const { tab, content, key } = pane;
          return <TabPane tab={tab} key={key}>{content}</TabPane>;
        })

      }
    </Tabs>
  );
});

export default Scene;
