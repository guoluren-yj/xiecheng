/**
 * adaptorTenant.js
 * 适配器租户级
 * @date: 2021-10-19
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  DataSet,
  Button,
  Modal,
  CheckBox,
  TextField,
  Form,
  Lov,
  Tooltip,
} from 'choerodon-ui/pro';
import { Menu, Spin, Icon } from 'choerodon-ui';
import { isEmpty, omit } from 'lodash';
import crypto from 'crypto-js';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getResponse, getCurrentUserId } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getComplementaryWordsService,
  setAdaptorEnabled,
  deleteAdaptorTask,
  queryAdaptorServiceOrg,
  addAdaptorFavorite,
  deleteAdaptorFavorite,
  saveAdaptorScript,
} from '@/services/adaptorTaskService';
import style from './index.less';
import { getAdaptorTenantDs, getAdaptorTaskLineDs, getAdaptorTaskHeadDs } from './store';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import ScriptSearch from '../script/Search';

const currentUserId = getCurrentUserId();
function AdaptorTenant(props = {}) {
  const { adaptorTenantDs, adaptorFavoritesDs } = props.valueDs;
  const [complementaryWords, handleComplementaryWords] = useState([]);
  const [tableVisible, handleTableVisible] = useState(false);
  const [currentService, handleCurrentService] = useState('');
  const [leftTreeDs, handleLeftTreeDs] = useState([]);
  const [showScriptSearch, handleShowScriptSearch] = useState(false);
  const [showFavorites, handleShowFavorites] = useState(false); // true: 列表是收藏夹，false: 列表是服务列表

  const adaptorTaskLineDs = new DataSet(getAdaptorTaskLineDs());
  const adaptorTaskHeadDs = new DataSet(getAdaptorTaskHeadDs());

  useEffect(() => {
    getComplementaryWordsService().then((res) => {
      if (getResponse(res)) {
        if (!isEmpty(res)) {
          handleComplementaryWords(crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)));
        }
      }
    });
    queryAdaptorServiceOrg().then((res) => {
      if (res && res.length === 0) {
        handleLeftTreeDs([0]);
      } else if (res) {
        handleLeftTreeDs(Array.from(res));
      }
    });
  }, []);

  // 切换所属服务
  const witchMenu = (e) => {
    handleShowFavorites(false);
    handleCurrentService(e.key);
    adaptorTenantDs.setQueryParameter('runningService', e.key);
    adaptorTenantDs.getField('task').set('lovPara', {
      service: e.key,
    });
    adaptorTenantDs.query();
    handleTableVisible(true);
  };

  // 改变编码启用状态
  const changeEnabledFlag = (value, record = {}) => {
    const currentDs = showFavorites ? adaptorFavoritesDs : adaptorTenantDs;
    const recordData = record.toJSONData();
    Modal.confirm({
      title: intl.get('spfm.adaptorTask.view.message.ifChange').d('是否要修改适配器状态？'),
      onOk: () => {
        setAdaptorEnabled({
          taskCode: recordData.taskCode,
          applyTenantNum: recordData.applyTenantNum,
          enabledFlag: value,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            currentDs.query();
          }
        });
      },
      onCancel: () => {
        record.reset();
      },
    });
  };

  // 新建和编辑的模态框
  const adaptorModal = (newRecord, isEnabled = false) => {
    return (
      <Form record={newRecord} disabled={newRecord.get('enabledFlag')}>
        <Lov name="task" disabled={isEnabled} />
        <TextField name="runningService" disabled />
        <TextField name="description" />
      </Form>
    );
  };

  // 编辑编码信息
  const editAdaptorTenant = (record) => {
    const currentDs = showFavorites ? adaptorFavoritesDs : adaptorTenantDs;
    const isEdit = true;
    Modal.open({
      title: intl.get('hzero.common.button.edit').d('编辑'),
      drawer: true,
      children: adaptorModal(record, isEdit),
      onOk: async () => {
        const res = await currentDs.validate();
        if (res) {
          record.set('adaptorTaskLines', []);
          const resp = await currentDs.submit();
          if (getResponse(resp)) {
            currentDs.query();
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      onCancel: () => {
        if (record.dirty) {
          currentDs.reset(record);
        }
      },
    });
  };

  // 新增编码，只能在服务列表中新增，不能在收藏夹中新增
  const addAdaptorTenant = () => {
    const newRecord = adaptorTenantDs.create({}, 0);
    newRecord.set('runningService', currentService);
    newRecord.set('inputEntityCode', 'ANYTHING');
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.model.create').d('新建'),
      children: adaptorModal(newRecord),
      onOk: async () => {
        // 将行数据放在头数据中一起提交
        const res = await adaptorTenantDs.validate();
        if (res) {
          const newTaskLineRecord = adaptorTaskLineDs.create();
          if (!newRecord.get('adaptorTaskLines')) {
            newTaskLineRecord.set('outputEntityCode', 'ANYTHING');
            newTaskLineRecord.set('priority', 1);
            newTaskLineRecord.set('resultInvoke', newRecord.get('resultInvoke'));
            const line = adaptorTaskLineDs.toJSONData();
            newRecord.set('adaptorTaskLines', line);
          }
          adaptorTaskLineDs.remove(newTaskLineRecord); // 提交结束 需要将行数据的ds中的改record remove掉
          await adaptorTenantDs.submit();
          adaptorTenantDs.query();
        } else {
          return false;
        }
      },
      onCancel: () => {
        adaptorTenantDs.remove(newRecord);
      },
    });
  };

  const deleteAdaptorTenant = (record) => {
    Modal.confirm({
      style: { width: 500 },
      title: intl
        .get('spfm.adaptorTask.view.message.ifAllClean')
        .d('确认删除该适配器及其所有历史脚本代码？'),
      onOk: () => {
        const deleteData = record.data;
        deleteAdaptorTask(deleteData).then((res) => {
          if (getResponse(res)) {
            notification.success();
            if (showFavorites) {
              adaptorFavoritesDs.query();
            } else {
              adaptorTenantDs.query();
            }
          }
        });
      },
    });
  };

  const queryFavoriteOrg = () => {
    adaptorFavoritesDs.setQueryParameter('userId', currentUserId);
    adaptorFavoritesDs.query();
    handleShowFavorites(true);
  };

  const addToFavorites = (record) => {
    const { applyTenantNum, taskCode } = record.toData();
    addAdaptorFavorite({ userId: currentUserId, applyTenantNum, taskCode }).then((res) => {
      if (getResponse(res)) {
        notification.success();
      }
      adaptorTenantDs.query();
    });
  };

  const deleteFavorites = (record) => {
    const { applyTenantNum, taskCode } = record.toData();
    deleteAdaptorFavorite({ userId: currentUserId, applyTenantNum, taskCode }).then((res) => {
      if (getResponse(res)) {
        notification.success();
      }
      if (showFavorites) {
        adaptorFavoritesDs.query();
      } else {
        adaptorTenantDs.query();
      }
    });
  };

  const content = (record) => {
    return (
      <span className="action-link">
        <a onClick={() => editAdaptorTenant(record)}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>
        {record.get('favorite') ? (
          <a onClick={() => deleteFavorites(record)}>
            {intl.get('spfm.adaptorTask.title.remove.favorite').d('移出收藏')}
          </a>
        ) : (
          <a onClick={() => addToFavorites(record)}>
            {intl.get('spfm.adaptorTask.title.add.favorite').d('收藏')}
          </a>
        )}
        <a onClick={() => deleteAdaptorTenant(record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </a>
      </span>
    );
  };

  const columns = [
    {
      name: 'task',
      width: 320,
    },
    {
      name: 'description',
    },
    {
      name: 'creatorName',
      width: 150,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: (record) => (
        <CheckBox name="enabledFlag" onChange={(value) => changeEnabledFlag(value, record)} />
      ),
    },
    {
      name: 'action',
      width: 130,
      renderer: ({ record }) => {
        const currentTableDs = showFavorites ? adaptorFavoritesDs : adaptorTenantDs;
        const current = record.toData();
        const saveScriptKey = `${current.taskCode}|${current.applyTenantNum}`;
        const {
          trustful,
          scriptVersion,
          applyTenantNum: debugTenantNum,
          bindRoutePrefix,
        } = current;
        const lineData = current.adaptorTaskLines;
        return (
          <span className="action-link">
            <MarmotScriptButton
              saveScriptKey={saveScriptKey}
              scriptCacheKey="adaptorTask|MarmotScript"
              name="scriptContent"
              complementaryWords={complementaryWords}
              marmotScriptInput={lineData && lineData[0]?.inputContent}
              bindRoutePrefix={bindRoutePrefix}
              scriptVersion={scriptVersion}
              testParam={{
                saveScriptKey,
                trustful,
                debugTenantNum,
              }}
              beforeOpenModal={(coverPropsFnc) => {
                adaptorTaskHeadDs.loadData([current]);
                adaptorTaskLineDs.loadData(lineData);
                coverPropsFnc({
                  record: adaptorTaskLineDs.current,
                });
              }}
              onSave={(resole, ...arg) => {
                adaptorTaskHeadDs.validate().then((headerRes) => {
                  adaptorTaskLineDs.validate().then((lineRes) => {
                    if (headerRes && lineRes) {
                      const header = omit(adaptorTaskHeadDs.current.toJSONData(), [
                        'applyTenant',
                        'inputEntity',
                        'task',
                      ]);
                      adaptorTaskLineDs.current.set('inputContent', arg[1].inputContent);
                      const lines = adaptorTaskLineDs.toJSONData();
                      // 当不修改时行信息会为空，这时候不能请求
                      if (isEmpty(lines)) {
                        notification.warning({
                          message: intl
                            .get('spfm.adaptorTask.model.message.changeSubmit')
                            .d('请修改后保存'),
                        });
                        return false;
                      }
                      const saveData = {
                        ...header,
                        adaptorTaskLines: lines.map((line) =>
                          omit(line, ['outputEntity', 'resultInvokeLov'])
                        ),
                      };
                      saveAdaptorScript(saveData).then((res) => {
                        if (getResponse(res)) {
                          const resLine = res.adaptorTaskLines;
                          adaptorTaskHeadDs.loadData([res]);
                          adaptorTaskLineDs.loadData(resLine);
                          arg[2]({
                            record: adaptorTaskLineDs.current,
                          });
                          notification.success();
                          currentTableDs.query();
                          resole();
                        }
                      });
                    }
                  });
                });
              }}
            />
            <Tooltip title={() => content(record)} placement="top" theme="light">
              <a>{intl.get('hzero.common.button.more').d('更多')}</a>
            </Tooltip>
          </span>
        );
      },
    },
  ];

  const buttons = [
    <Button icon="playlist_add" onClick={() => addAdaptorTenant()} key="add">
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
  ];

  const findAdaptor = (runningService, taskCode) => {
    handleShowScriptSearch(false);
    handleShowFavorites(false);
    handleCurrentService(runningService);
    adaptorTenantDs.setQueryParameter('runningService', runningService);
    adaptorTenantDs.queryDataSet.reset();
    adaptorTenantDs.queryDataSet.create({});
    adaptorTenantDs.queryDataSet.current.set('taskCode', taskCode);
    adaptorTenantDs.query();
    handleTableVisible(true);
  };

  return (
    <React.Fragment>
      {!showScriptSearch ? (
        <>
          <Header title={intl.get('spfm.adaptorTask.view.header.title').d('适配器定义')}>
            <Button
              color="primary"
              onClick={() => {
                openTab({
                  key: `/spfm/marmot-script/console-org`, // 打开 tab 的 key
                  title: intl.get('spfm.adaptorTask.title.adapter.console').d('MarmotScript控制台'), // tab的标题
                });
              }}
            >
              {intl.get('spfm.adaptorTask.title.adapter.console').d('MarmotScript控制台')}
            </Button>
            <Button onClick={() => handleShowScriptSearch(true)}>
              {intl.get('spfm.adaptorTask.script.search.title').d('脚本查询')}
            </Button>
          </Header>
          <Content>
            <div style={{ display: 'flex' }}>
              <div>
                <div className={style['left-head']}>
                  <span className="left-head-span">
                    {intl
                      .get('spfm.adaptorTask.model.adaptorTask.runningServiceList')
                      .d('服务列表')}
                  </span>
                  <Button
                    onClick={() => queryFavoriteOrg()}
                    className="left-head-bottom"
                    color="primary"
                  >
                    {intl.get('spfm.adaptorTask.model.adaptorTask.favorites').d('收藏夹')}
                  </Button>
                </div>
                <div style={{ height: '76vh', overflowY: 'auto' }}>
                  <Menu
                    onClick={isEmpty(leftTreeDs) || leftTreeDs[0] === 0 ? () => {} : witchMenu}
                    width={250}
                    className={style['left-menu']}
                    defaultOpenKeys={['configurationItem']}
                    selectedKeys={[currentService]}
                    mode="inline"
                  >
                    {isEmpty(leftTreeDs) ? (
                      <Menu.Item>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Spin />
                        </div>
                      </Menu.Item>
                    ) : leftTreeDs[0] === 0 ? (
                      <Menu.Item style={{ fontSize: 16 }}>
                        {intl
                          .get('spfm.adaptorTask.view.no.service')
                          .d('暂无可用服务，请联系管理员')}
                      </Menu.Item>
                    ) : (
                      leftTreeDs.map((value) => {
                        return (
                          <Menu.Item key={value} style={{ fontSize: 16 }}>
                            <Icon type="library_books-o" style={{ marginRight: 5 }} />
                            {value}
                          </Menu.Item>
                        );
                      })
                    )}
                  </Menu>
                </div>
              </div>
              <div style={{ width: 'calc(100% - 300px)' }}>
                <div className={style['adaptor-task-form']}>
                  {showFavorites ? (
                    <div style={{ height: 700 }}>
                      <Table
                        dataSet={adaptorFavoritesDs}
                        queryBar={() => <></>}
                        columns={columns}
                        // autoHeight="true"
                        // pagination={{
                        //   hideOnSinglePage: true,
                        // }}
                        style={{ marginTop: '0.2rem' }}
                      />
                    </div>
                  ) : tableVisible ? (
                    <Table
                      dataSet={adaptorTenantDs}
                      buttons={buttons}
                      columns={columns}
                      style={{ marginTop: '0.2rem' }}
                    />
                  ) : (
                    <div className="adaptor-task-black">
                      <div className="blank-pic" />
                      <div className="blank-title">
                        {intl
                          .get('spfm.adaptorTask.view.title.blankTitle')
                          .d('请从左侧选择服务和任务编码')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Content>
        </>
      ) : (
        <>
          <Header
            title={
              <>
                <Tooltip
                  placement="bottom"
                  title={intl.get('spfm.adaptorTask.view.header.title').d('适配器定义')}
                >
                  <Icon
                    type="arrow_back"
                    onClick={() => handleShowScriptSearch(false)}
                    className={style['back-icon']}
                  />
                </Tooltip>
                <span>{intl.get('spfm.adaptorTask.script.search.title').d('脚本查询')}</span>
              </>
            }
          />
          <Content>
            <ScriptSearch findAdaptor={findAdaptor} />
          </Content>
        </>
      )}
    </React.Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.adaptorTask',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
    'spfm.adaptorTaskDetail',
  ],
})(
  withProps(
    () => {
      const adaptorTenantDs = new DataSet(getAdaptorTenantDs());
      const adaptorFavoritesDs = new DataSet(getAdaptorTenantDs('favorites'));
      const valueDs = {
        adaptorTenantDs,
        adaptorFavoritesDs,
      };
      return { valueDs };
    },
    //  { cacheState: true, keepOriginDataSet: true }
    { cacheState: true }
  )(AdaptorTenant)
);
