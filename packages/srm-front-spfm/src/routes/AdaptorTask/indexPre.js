/**
 * index.js
 * 适配器列表
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  DataSet,
  Button,
  Modal,
  CheckBox,
  Lov,
  Spin,
  Tooltip,
  Form,
  TextField,
} from 'choerodon-ui/pro';
import { Menu, Icon, message } from 'choerodon-ui';
import { isEmpty, omit } from 'lodash';
import copy from 'copy-to-clipboard';
import crypto from 'crypto-js';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getResponse, getCurrentUserId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import {
  deleteAdaptorTask,
  setAdaptorEnabled,
  getComplementaryWordsService,
  queryAdaptorService,
  addAdaptorFavorite,
  deleteAdaptorFavorite,
  saveAdaptorScript,
} from '@/services/adaptorTaskService';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import { getAdaptorTaskDs, getQueryFormDs } from './store/adaptorTaskDsPre';
import { getAdaptorTaskLineDs, getAdaptorTaskHeadDs } from './store/taskDetailDs';
import style from './index.less';
import NewAdaptorModal from './components/NewAdaptorModal';

const currentUserId = getCurrentUserId();
const LOCAL_STORAGE_KEY = 'adaptorRunningService';
const MARMOTSCRIPT_QUEUE = 5;

function AdaptorTask(props = {}) {
  const { adaptorTaskDs, adaptorFavoritesDs, queryFormDs } = props.valueDs;
  const { query } = props.location;
  const [tableVisible, handleTableVisible] = useState(false);
  const [chooseTenant, handleChooseTenant] = useState(false);
  const [complementaryWords, handleComplementaryWords] = useState([]);
  const [currentService, handleCurrentService] = useState('');
  const [leftTreeDs, handleLeftTreeDs] = useState([]);
  const [showFavorites, handleShowFavorites] = useState(false); // true: 列表是收藏夹，false: 列表是服务列表
  const [topMenu, handleTopMenu] = useState([]);
  const adaptorTaskLineDs = new DataSet(getAdaptorTaskLineDs());
  const adaptorTaskHeadDs = new DataSet(getAdaptorTaskHeadDs());
  const contentRef = useRef();
  useEffect(() => {
    if (query) {
      const { runningService, taskCode, applyTenantNum, applyTenantName } = query;
      handleShowFavorites(false);
      handleCurrentService(runningService);
      adaptorTaskDs.setQueryParameter('runningService', runningService);
      adaptorTaskDs.setQueryParameter('applyTenantNum', applyTenantNum);
      queryFormDs.current.set('applyTenantNum', applyTenantNum);
      queryFormDs.current.set('applyTenantName', applyTenantName);
      adaptorTaskDs.queryDataSet.reset();
      adaptorTaskDs.queryDataSet.create({});
      adaptorTaskDs.queryDataSet.current.set('taskCode', taskCode);
      adaptorTaskDs.query();
      handleTableVisible(true);
    }
  }, [query]);

  useEffect(() => {
    const topMenuCache = getRunningServiceCache('runningService');
    if (topMenuCache) {
      handleTopMenu(topMenuCache);
    }
    getComplementaryWordsService().then((res) => {
      if (getResponse(res)) {
        if (!isEmpty(res)) {
          handleComplementaryWords(crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)));
        }
      }
    });
    queryAdaptorService().then((res) => {
      if (res && res.length === 0) {
        handleLeftTreeDs([0]);
      } else if (res) {
        getSortMenu(res, topMenuCache);
      }
    });
  }, []);

  // 切换所属服务
  const witchMenu = (e) => {
    handleShowFavorites(false);
    handleCurrentService(e.key);
    adaptorTaskDs.setQueryParameter('runningService', e.key);
    adaptorTaskDs.getField('task').set('lovPara', {
      service: e.key,
      tableCode: 'adaptor_static_code',
    });
    adaptorTaskDs.queryDataSet.getField('task').set('lovPara', {
      service: e.key,
      tableCode: 'adaptor_static_code',
    });
    adaptorTaskDs.queryDataSet.reset();
    adaptorTaskDs.query();
    handleTableVisible(true);
  };

  // 数据操作成功后处理
  const successAction = () => {
    notification.success();
    adaptorTaskDs.query();
  };

  const onDeleteAdaptorTask = (record) => {
    Modal.confirm({
      style: { width: 500 },
      title: intl
        .get('spfm.adaptorTask.view.message.ifAllClean')
        .d('确认删除该适配器及其所有历史脚本代码？'),
      onOk: () => {
        const deleteData = record.data;
        deleteAdaptorTask(deleteData).then((res) => {
          if (getResponse(res)) {
            successAction();
            if (showFavorites) {
              adaptorFavoritesDs.query();
            } else {
              adaptorTaskDs.query();
            }
          }
        });
      },
    });
  };

  const changeEnabledFlag = (value, record = {}) => {
    const currentDs = showFavorites ? adaptorFavoritesDs : adaptorTaskDs;
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
          }
          currentDs.query();
        });
      },
      onCancel: () => {
        record.reset();
      },
    });
  };

  const copyAdaptor = (record) => {
    const list = record.get('adaptorTaskLines');
    const isCopy = true;
    list[0].id = undefined;
    list[0].headerId = undefined;
    // 该条record不是create出来的，所以要手动改_status
    list[0]._status = 'create';
    const newRecord = adaptorTaskDs.create({ ...record.toData() }, 0);
    newRecord.set('adaptorTaskLines', list);
    newRecord.set('id', undefined);
    newRecord.set('applyTenant', undefined);
    Modal.open({
      title: intl.get('spfm.adaptorTask.model.placeholder.replicationAdapter').d('复制适配器'),
      drawer: true,
      children: <NewAdaptorModal newRecord={newRecord} isCopy={isCopy} />,
      onOk: async () => {
        const res = await adaptorTaskDs.validate();
        if (res) {
          adaptorTaskDs.submit();
        } else {
          return false;
        }
      },
      onCancel: () => adaptorTaskDs.remove(newRecord),
      onClose: () => adaptorTaskDs.query(),
    });
  };

  const addNewRecord = () => {
    const newRecord = adaptorTaskDs.create({}, 0);
    const { applyTenant } = queryFormDs.current.toData();
    newRecord.set('applyTenant', applyTenant);
    newRecord.set('runningService', currentService);
    newRecord.set('inputEntityCode', 'ANYTHING');
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.model.create').d('新建'),
      children: (
        <Form record={newRecord}>
          <Lov name="task" />
          <TextField name="runningService" disabled />
          <Lov name="applyTenant" disabled={chooseTenant} />
          <TextField name="scriptVersion" disabled />
          <TextField name="description" />
        </Form>
      ),
      onOk: async () => {
        // 将行数据放在头数据中一起提交
        const res = await adaptorTaskDs.validate();
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
          await adaptorTaskDs.submit();
          adaptorTaskDs.query();
        } else {
          return false;
        }
      },
      onCancel: () => {
        adaptorTaskDs.remove(newRecord);
      },
    });
  };

  const editAdaptor = (record) => {
    const currentDs = showFavorites ? adaptorFavoritesDs : adaptorTaskDs;
    const recordAdaptorTaskLines = record.get('adaptorTaskLines');
    const recordResultInvoke =
      recordAdaptorTaskLines[0] && recordAdaptorTaskLines[0].resultInvoke
        ? recordAdaptorTaskLines[0].resultInvoke
        : '';
    record.set('resultInvoke', recordResultInvoke);
    const isEdit = true;
    Modal.open({
      title: intl.get('hzero.common.button.edit').d('编辑'),
      drawer: true,
      children: <NewAdaptorModal newRecord={record} isEdit={isEdit} />,
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

  const queryFavorite = () => {
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
      adaptorTaskDs.query();
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
        adaptorTaskDs.query();
      }
    });
  };

  const changeTenant = () => {
    const applyTenantNum = queryFormDs.current.get('applyTenantNum');
    if (applyTenantNum) {
      handleChooseTenant(true);
    } else {
      handleChooseTenant(false);
    }
    adaptorTaskDs.setQueryParameter('applyTenantNum', applyTenantNum);
    adaptorTaskDs.setQueryParameter('runningService', currentService);
    adaptorTaskDs.query();
  };

  const copyUniqueCode = (record) => {
    const text = `${record.get('applyTenantNum')}|ADAPTOR|${record.get('taskCode')}`;
    copy(text);
    message.destroy();
    message.config({ duration: 2 });
    message.success(
      intl.get('spfm.adaptorTask.button.copy.success').d('复制成功'),
      undefined,
      undefined,
      'bottomRight'
    );
  };

  const content = (record) => {
    return (
      <span className="action-link">
        <a onClick={() => copyUniqueCode(record)}>
          {intl.get('spfm.adaptorTask.button.only.copy').d('唯一编码')}
        </a>
        {record.get('scriptVersion') === '2' ? (
          ''
        ) : (
          <a onClick={() => copyAdaptor(record)}>
            {intl.get('spfm.adaptorTask.model.placeholder.replicationAdapter').d('复制适配器')}
          </a>
        )}
        <a onClick={() => editAdaptor(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
        <a onClick={() => onDeleteAdaptorTask(record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </a>
      </span>
    );
  };

  /**
   * 向 localStorage 中储存服务置顶列表
   * @param {String} saveData 服务名
   * @returns Array Boolean
   */
  const setRunningServiceCache = (saveData) => {
    const cacheKey = 'runningService';
    const runningServiceCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    let cacheData = runningServiceCache[cacheKey];
    if (cacheData && cacheData.length > 0) {
      if (cacheData.indexOf(saveData) !== -1) {
        return true;
      }
      if (cacheData.length >= MARMOTSCRIPT_QUEUE) {
        cacheData.pop();
      }
      cacheData.unshift(saveData);
    } else {
      cacheData = [saveData];
    }
    cacheData = Array.from(new Set(cacheData));
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...runningServiceCache,
        [cacheKey]: cacheData,
      })
    );
    return cacheData;
  };

  /**
   * 向 localStorage 中获取服务置顶列表
   * @param {String} targetKey 服务名
   * @returns Array
   */
  const getRunningServiceCache = (targetKey) => {
    const runningServiceCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    const data = runningServiceCache[targetKey];
    if (data) {
      return data;
    }
    return null;
  };

  /**
   * 取消置顶该服务
   * @param {String} cutData 服务名
   * @returns Array Boolean
   */
  const cutRunningServiceCache = (cutData) => {
    const cacheKey = 'runningService';
    const runningServiceCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    let cacheData = runningServiceCache[cacheKey];
    if (cacheData && cacheData.length > 0) {
      if (cacheData.indexOf(cutData) === -1) {
        return false;
      } else {
        cacheData.splice(cacheData.indexOf(cutData), 1);
      }
    } else {
      return false;
    }
    cacheData = Array.from(new Set(cacheData));
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...runningServiceCache,
        [cacheKey]: cacheData,
      })
    );
    return cacheData;
  };

  /**
   * 服务置顶
   * @param {String} value 服务名
   */
  const toTop = (value) => {
    const topMenuCache = setRunningServiceCache(value);
    if (topMenuCache) {
      handleTopMenu(topMenuCache);
    }
    getSortMenu(leftTreeDs, topMenuCache);
  };

  /**
   * 服务列表排序
   * @param {Array} res 服务列表
   * @param {Array} topMenuCache 置顶服务列表
   */
  const getSortMenu = (res, topMenuCache) => {
    const sortRes = Array.from(res).sort((a, b) => {
      if (a[0].charCodeAt() !== b[0].charCodeAt()) {
        return a[0].charCodeAt() - b[0].charCodeAt();
      } else if (a[1].charCodeAt() !== b[1].charCodeAt()) {
        return a[1].charCodeAt() - b[1].charCodeAt();
      } else {
        return b.length - a.length;
      }
    });
    let resp = sortRes;
    if (topMenuCache) {
      resp = topMenuCache.concat(resp);
    }
    handleLeftTreeDs(Array.from(new Set(resp)));
  };

  /**
   * 取消服务置顶
   * @param {String} value 服务名
   */
  const notTop = (value) => {
    const cutData = cutRunningServiceCache(value);
    if (topMenu.indexOf(value) !== -1) {
      const cutTop = topMenu;
      cutTop.splice(cutTop.indexOf(value), 1);
      handleTopMenu(cutTop);
    }
    if (cutData) {
      getSortMenu(leftTreeDs, cutData);
    }
  };

  const tenantCol = chooseTenant
    ? []
    : [
        {
          name: 'applyTenant',
          width: 200,
        },
      ];

  const publicCol = [
    {
      name: 'description',
      minWidth: 220,
    },
    {
      name: 'scriptVersion',
      width: 150,
      align: 'center',
      renderer: ({ value }) => <p>V{value}</p>,
    },
    {
      name: 'creatorName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 100,
      renderer: ({ value }) => <span>{value && value.slice(0, 11) ? value.slice(0, 11) : ''}</span>,
    },
    {
      name: 'enabledFlag',
      width: 60,
      lock: 'right',
      editor: (record) => (
        <CheckBox name="enabledFlag" onChange={(value) => changeEnabledFlag(value, record)} />
      ),
    },
    {
      name: 'action',
      width: 200,
      lock: 'right',
      renderer: ({ record }) => {
        const currentTableDs = showFavorites ? adaptorFavoritesDs : adaptorTaskDs;
        const current = record.toData();
        const saveScriptKey = `${current.taskCode}|${current.applyTenantNum}`;
        const {
          trustful,
          scriptVersion,
          applyTenantNum: debugTenantNum,
          bindRoutePrefix,
          taskCode,
        } = current;
        // const headerData = omit(current, ['applyTenantName', 'applyTenantNum']);
        const lineData = current.adaptorTaskLines
          ? current.adaptorTaskLines.map((item) => {
              return { ...item, taskCode };
            })
          : current.adaptorTaskLines;
        return (
          <span className="action-link">
            <MarmotScriptButton
              saveScriptKey={saveScriptKey}
              scriptCacheKey="adaptorTask|MarmotScript"
              name="scriptContent"
              complementaryWords={complementaryWords}
              marmotScriptInput={
                lineData && lineData[0] && lineData[0].inputContent ? lineData[0].inputContent : ''
              }
              bindRoutePrefix={bindRoutePrefix}
              scriptVersion={scriptVersion}
              showSelectVersion
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
                adaptorTaskHeadDs
                  .validate()
                  .then((headerRes) => {
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
                          resole(false);
                          return false;
                        }
                        const saveData = {
                          ...header,
                          adaptorTaskLines: lines.map((line) =>
                            omit(line, ['outputEntity', 'resultInvokeLov'])
                          ),
                        };
                        saveAdaptorScript(saveData)
                          .then(async (res) => {
                            if (getResponse(res)) {
                              const resLine = res.adaptorTaskLines;
                              await adaptorTaskHeadDs.loadData([res]);
                              await adaptorTaskLineDs.loadData(resLine);
                              arg[2]({
                                record: adaptorTaskLineDs.current,
                              });
                              arg[3](false);
                              notification.success();
                              currentTableDs.query();
                            }
                          })
                          .finally(() => {
                            resole(false);
                          });
                      }
                    });
                  })
                  .catch(() => {
                    resole(false);
                  });
              }}
            />
            {record.get('favorite') ? (
              <a onClick={() => deleteFavorites(record)}>
                {intl.get('spfm.adaptorTask.title.remove.favorite').d('移出收藏')}
              </a>
            ) : (
              <a onClick={() => addToFavorites(record)}>
                {intl.get('spfm.adaptorTask.title.add.favorite').d('收藏')}
              </a>
            )}
            <Tooltip
              getPopupContainer={(triggerNode) => contentRef.current || triggerNode}
              title={() => content(record)}
              placement="top"
              theme="light"
            >
              <a>{intl.get('hzero.common.button.more').d('更多')}</a>
            </Tooltip>
          </span>
        );
      },
    },
  ];

  const columns = [
    {
      name: 'task',
      width: 280,
    },
    ...tenantCol,
    ...publicCol,
  ];

  const favoriteColumns = [
    {
      name: 'applyTenant',
      width: 200,
    },
    {
      name: 'runningService',
      width: 180,
    },
    {
      name: 'task',
      width: 240,
    },
    ...publicCol,
  ];

  const buttons = [
    <Button icon="playlist_add" onClick={() => addNewRecord()} key="add">
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
  ];

  return (
    <React.Fragment>
      <Header>
        <Button
          color="primary"
          onClick={() => {
            openTab({
              key: `/spfm/marmot-workbench`, // 打开 tab 的 key
              title: intl.get('spfm.adaptorTask.title.marmot.workbench').d('Marmot工作台'), // tab的标题
            });
          }}
        >
          {intl.get('spfm.adaptorTask.title.marmot.workbench').d('Marmot工作台')}
        </Button>
      </Header>
      <Content>
        <div style={{ display: 'flex' }}>
          <div className={style['left-left']}>
            <div className="left-head">
              <Lov
                className="left-head-span"
                dataSet={queryFormDs}
                name="applyTenant"
                placeholder={intl.get('hzero.common.view.tenantSelect.title').d('选择租户')}
                onChange={() => changeTenant()}
              />
              <Button onClick={() => queryFavorite()} className="left-head-bottom" color="primary">
                {intl.get('spfm.adaptorTask.model.adaptorTask.favorites').d('收藏夹')}
              </Button>
            </div>
            <div className="left-body">
              <Menu
                style={{ width: 300 }}
                onClick={isEmpty(leftTreeDs) || leftTreeDs[0] === 0 ? () => {} : witchMenu}
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
                    {intl.get('spfm.adaptorTask.view.no.service').d('暂无可用服务，请联系管理员')}
                  </Menu.Item>
                ) : (
                  leftTreeDs.map((value, index) => {
                    if (index < topMenu.length) {
                      return (
                        <Menu.Item
                          key={value}
                          style={{
                            fontSize: 16,
                            height: 30,
                            width: 300,
                            lineHeight: '30px',
                            border: '1px dashed #e8e8e8',
                          }}
                          className={style['left-body-menu']}
                        >
                          {value}
                          <Icon
                            type="star"
                            onClick={() => notTop(value)}
                            className="left-body-menu-top"
                            style={{ color: '#ffd966' }}
                          />
                        </Menu.Item>
                      );
                    }
                    return (
                      <Menu.Item
                        key={value}
                        style={{
                          fontSize: 16,
                          height: 30,
                          width: 300,
                          lineHeight: '30px',
                          border: '1px dashed #e8e8e8',
                        }}
                        className={style['left-body-menu']}
                      >
                        {value}
                        <Icon
                          type="file_upload"
                          onClick={() => toTop(value)}
                          className="left-body-menu-icon"
                        />
                      </Menu.Item>
                    );
                  })
                )}
              </Menu>
            </div>
          </div>
          <div style={{ width: 'calc(100% - 300px)' }}>
            <div className={style['adaptor-task-form']} ref={contentRef}>
              {showFavorites ? (
                <Table
                  dataSet={adaptorFavoritesDs}
                  queryBar={() => <></>}
                  columns={favoriteColumns}
                  style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
                />
              ) : tableVisible ? (
                <Table
                  dataSet={adaptorTaskDs}
                  buttons={buttons}
                  columns={columns}
                  style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
                />
              ) : (
                <div className="adaptor-task-black">
                  <div className="blank-pic" />
                  <div className="blank-title">
                    {intl
                      .get('spfm.adaptorTask.modal.title.blankTitle')
                      .d('请从左侧选择租户和服务')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Content>
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
      const adaptorTaskDs = new DataSet(getAdaptorTaskDs());
      const adaptorFavoritesDs = new DataSet(getAdaptorTaskDs('favorites'));
      const queryFormDs = new DataSet(getQueryFormDs());
      const valueDs = {
        adaptorTaskDs,
        adaptorFavoritesDs,
        queryFormDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AdaptorTask)
);
