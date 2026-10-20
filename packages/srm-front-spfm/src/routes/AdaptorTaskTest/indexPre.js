/**
 * index.js
 * 适配器列表
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  DataSet,
  Button,
  Modal,
  CheckBox,
  Tree,
  TextField,
  Form,
  Lov,
  Icon,
  Spin,
  Tooltip,
} from 'choerodon-ui/pro';
import { isNil, isEmpty, omit } from 'lodash';
import crypto from 'crypto-js';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import {
  deleteAdaptorTask,
  setAdaptorEnabled,
  getComplementaryWordsService,
  saveAdaptorScript,
} from '@/services/adaptorTaskService';
import { getAdaptorTaskDs, getAdaptorTaskTreeDs, getQueryFormDs } from './store/adaptorTaskDsPre';
import { getAdaptorTaskLineDs, getAdaptorTaskHeadDs } from './store/taskDetailDs';
import style from './index.less';
import NewAdaptorModal from './components/NewAdaptorModal';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';

function AdaptorTask(props = {}) {
  const { adaptorTaskDs, adaptorTaskTreeDs, queryFormDs } = props.valueDs;
  const [tableVisible, handleTableVisible] = useState(false);
  const [treeSpinning, handleTreeSpinning] = useState(false);
  const [preRecord, handlePreRecord] = useState({}); // 储存当前点击的子节点，用来点下一个子节点时取消上个
  const [preNode, handlePreNode] = useState({}); // 储存当前点击的子节点，用来点下一个子节点时取消上个
  const [complementaryWords, handleComplementaryWords] = useState([]);
  const {
    location: { state: { _back } = {} },
  } = props;
  const adaptorTaskLineDs = new DataSet(getAdaptorTaskLineDs());
  const adaptorTaskHeadDs = new DataSet(getAdaptorTaskHeadDs());

  useEffect(() => {
    getComplementaryWordsService().then((res) => {
      if (getResponse(res)) {
        handleComplementaryWords(crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)));
      }
    });
  }, []);

  useEffect(() => {
    if (_back === -1) {
      const { taskCode } = adaptorTaskDs.queryParameter;
      adaptorTaskTreeDs.query();
      if (isNil(taskCode)) {
        handleTableVisible(false);
      } else {
        handleTableVisible(true);
        adaptorTaskDs.query();
      }
    }
  }, [_back]);

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
            if (!isEmptyQueryFormDs()) {
              queryTaskCode();
            }
          }
        });
      },
    });
  };

  const changeEnabledFlag = (value, record = {}) => {
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
            adaptorTaskDs.query();
          }
        });
      },
      onCancel: () => {
        record.reset();
      },
    });
  };

  const copyAdaptor = (record) => {
    const list = record.get('adaptorTaskLines');
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
      children: <NewAdaptorModal newRecord={newRecord} />,
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

  const isEmptyQueryFormDs = () => {
    if (
      !queryFormDs.current.get('taskCode') &&
      !queryFormDs.current.get('description') &&
      !queryFormDs.current.get('applyTenantNum')
    ) {
      return true;
    } else {
      return false;
    }
  };

  const addNewRecord = async (record, addFrom) => {
    const newRecord = adaptorTaskDs.create({}, 0);
    if (record.get('taskCode')) {
      newRecord.set('taskCode', record.get('taskCode'));
    } else {
      adaptorTaskDs.getField('task').set('lovPara', {
        service: record && record.get('runningService') ? record.get('runningService') : undefined,
      });
      const { applyTenant } = queryFormDs.current.toData();
      newRecord.set('applyTenant', applyTenant);
    }
    newRecord.set('runningService', record.get('runningService'));
    newRecord.set('inputEntityCode', 'ANYTHING');
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.model.create').d('新建'),
      children: <NewAdaptorModal newRecord={newRecord} addFrom={addFrom} />,
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
          if (addFrom === 'fromNode' && !isEmptyQueryFormDs()) {
            queryTaskCode(); // 当从node上进行增加spq且搜索框里的内容不为空时 要刷新左侧树结构
          }
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
    record.set('resultInvoke', record.get('adaptorTaskLines')[0]?.resultInvoke);
    const isEdit = true;
    Modal.open({
      title: intl.get('hzero.common.button.edit').d('编辑'),
      drawer: true,
      children: <NewAdaptorModal newRecord={record} isEdit={isEdit} />,
      onOk: async () => {
        const res = await adaptorTaskDs.validate();
        if (res) {
          record.set('adaptorTaskLines', []);
          adaptorTaskDs.submit();
        } else {
          return false;
        }
      },
      onCancel: () => {
        if (record.dirty) {
          adaptorTaskDs.reset(record);
        }
      },
    });
  };

  const setQueryAdaptorTaskDs = async (record) => {
    handleTableVisible(true);
    const { description, applyTenantNum } = queryFormDs.current.toData();
    adaptorTaskDs.setQueryParameter('runningService', record.get('runningService'));
    adaptorTaskDs.setQueryParameter('taskCode', record.get('taskCode'));
    adaptorTaskDs.setQueryParameter('description', description);
    adaptorTaskDs.setQueryParameter('applyTenantNum', applyTenantNum);
    await adaptorTaskDs.query();
  };

  const nodeCover = ({ record }) => {
    return record.get('hasChild')
      ? {
          title: () => (
            <div className={style['adaptor-task-node']}>
              <Icon type="library_books-o" style={{ marginRight: 5 }} />
              <div
                className="adaptor-task-node-left"
                onClick={() => {
                  if (!isEmpty(preNode)) {
                    preNode.setState('needAdd', false);
                  }
                  const lastNode = preNode;
                  handlePreNode(record);
                  record.setState('needAdd', true);
                  if (!isEmpty(preNode) && lastNode === record) {
                    handlePreNode({});
                    record.setState('needAdd', false);
                  }
                }}
              >
                <span>{record.get('runningService')}</span>
              </div>
              {record.getState('needAdd') ? (
                <Icon
                  className="adaptor-task-node-icon"
                  style={{ color: '#4FD2DB' }}
                  type="library_add-o"
                  onClick={() => {
                    addNewRecord(record, 'fromNode');
                  }}
                />
              ) : (
                ''
              )}
            </div>
          ),
          isLeaf: false,
          key: record.get('runningService'),
        }
      : {
          title: () => (
            <div className={style['adaptor-task-transform']}>
              <div
                onClick={() => {
                  if (!isEmpty(preRecord)) {
                    preRecord.setState('onClick', false);
                  }
                  handlePreRecord(record);
                  setQueryAdaptorTaskDs(record);
                  record.setState('onClick', true);
                }}
              >
                <div style={{ fontSize: 14 }}>{record.get('taskCode')}</div>
                <div
                  style={{
                    color: '#adadad',
                    textIndent: 5,
                    width: 360,
                  }}
                >
                  {record.get('description') ? (
                    <>
                      <Tooltip
                        placement="topLeft"
                        title={record.get('description')}
                        mouseEnterDelay={5000}
                      >
                        <span className={style['adaptor-task-description']}>
                          <Icon style={{ fontSize: 12 }} type="subdirectory_arrow_right" />
                          {record.get('description')}
                        </span>
                      </Tooltip>
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              {record.getState('onClick') ? (
                <Icon
                  className="adaptor-task-transform-img"
                  style={{ color: '#4FD2DB', fontSize: 30 }}
                  type="library_add-o"
                  onClick={() => {
                    addNewRecord(record);
                  }}
                />
              ) : (
                ''
              )}
            </div>
          ),
          isLeaf: true,
        };
  };

  const onExpandNode = (_, { expanded, node }) => {
    if (expanded && (!node.children || node.children.length <= 0)) {
      handleTreeSpinning(true);
      request(`${SRM_ADAPTOR}/v1/adaptor-task-headers/by-service`, {
        method: 'GET',
        query: {
          runningService: node.key,
        },
      })
        .then((res) => {
          const remainData = adaptorTaskTreeDs.toData();
          adaptorTaskTreeDs.loadData([...remainData, ...res]);
          handleTreeSpinning(false);
        })
        .catch((err) => {
          handleTreeSpinning(false);
          notification.err({
            message: err,
          });
        });
    }
  };

  const queryTaskCode = () => {
    const { taskCode, applyTenantNum, description } = queryFormDs.current.toData();
    adaptorTaskTreeDs.removeAll();
    adaptorTaskTreeDs.setQueryParameter('taskCode', taskCode);
    adaptorTaskTreeDs.setQueryParameter('applyTenantNum', applyTenantNum);
    adaptorTaskTreeDs.setQueryParameter('description', description);
    adaptorTaskTreeDs.query();
  };

  const content = (record) => {
    return (
      <span className="action-link">
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

  const columns = [
    {
      name: 'applyTenant',
      width: 220,
    },
    {
      name: 'description',
    },
    {
      name: 'trustful',
      width: 100,
      renderer: ({ value }) => (
        <span>
          {value === true ? (
            <p>{intl.get('hzero.common.button.yes').d('是')}</p>
          ) : (
            <p>{intl.get('hzero.common.button.no').d('否')}</p>
          )}
        </span>
      ),
    },
    {
      name: 'scriptVersion',
      width: 100,
      renderer: ({ value }) => <p>V{value}</p>,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: (record) => (
        <CheckBox name="enabledFlag" onChange={(value) => changeEnabledFlag(value, record)} />
      ),
    },
    {
      name: 'creatorName',
      width: 100,
    },
    {
      name: 'action',
      width: 130,
      renderer: ({ record }) => {
        const current = record.toData();
        const saveScriptKey = `${current.taskCode}|${current.applyTenantNum}`;
        const {
          trustful,
          scriptVersion,
          applyTenantNum: debugTenantNum,
          bindRoutePrefix,
        } = current;
        const headerData = omit(current, ['applyTenantName', 'applyTenantNum']);
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
                adaptorTaskHeadDs.loadData([headerData]);
                adaptorTaskLineDs.loadData(lineData);
                coverPropsFnc({
                  record: adaptorTaskLineDs.current,
                });
              }}
              onSave={(resole, reject, data, coverPropsFnc) => {
                adaptorTaskHeadDs.validate().then((headerRes) => {
                  adaptorTaskLineDs.validate().then((lineRes) => {
                    if (headerRes && lineRes) {
                      const header = omit(adaptorTaskHeadDs.current.toJSONData(), [
                        'applyTenant',
                        'inputEntity',
                        'task',
                      ]);
                      const lines = adaptorTaskLineDs.toJSONData();
                      const saveData = {
                        ...header,
                        adaptorTaskLines: lines.map((line) =>
                          omit(line, ['outputEntity', 'resultInvokeLov'])
                        ),
                      };
                      saveAdaptorScript(saveData).then((res) => {
                        if (getResponse(res)) {
                          // 手动重新处理record数据
                          const resLine = res.adaptorTaskLines;
                          adaptorTaskHeadDs.loadData([res]);
                          adaptorTaskLineDs.loadData(resLine);
                          coverPropsFnc({
                            record: adaptorTaskLineDs.current,
                          });
                          notification.success();
                          adaptorTaskDs.query();
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

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.adaptorTask.view.header.title').d('适配器定义')}>
        <Button
          color="primary"
          onClick={() => {
            openTab({
              key: `/spfm/adaptor/console`, // 打开 tab 的 key
              title: intl.get('spfm.adaptorTask.title.adapter.console').d('MarmotScript控制台'), // tab的标题
            });
          }}
        >
          {intl.get('spfm.adaptorTask.title.adapter.console').d('MarmotScript控制台')}
        </Button>
        <Button
          onClick={() => {
            openTab({
              key: `/spfm/adaptor/monitor`, // 打开 tab 的 key
              title: intl.get('spfm.adaptorTask.title.adapter.monitor').d('适配器监控'), // tab的标题
            });
          }}
        >
          {intl.get('spfm.adaptorTask.title.adapter.monitor').d('适配器监控')}
        </Button>
      </Header>
      <div className={style['adaptor-task']}>
        <div className="adaptor-task-content">
          <div className="adaptor-task-tree">
            <Form dataSet={queryFormDs} columns={3}>
              <TextField
                colSpan={1}
                name="taskCode"
                placeholder={intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码')}
                clearButton
                onChange={(e) => queryTaskCode(e)}
              />
              <Lov
                name="applyTenant"
                colSpan={1}
                placeholder={intl
                  .get('spfm.adaptorTask.model.adaptorTask.applyTenant')
                  .d('所属租户')}
                onChange={() => queryTaskCode()}
              />
              <TextField
                colSpan={1}
                name="description"
                clearButton
                placeholder={intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述')}
                onChange={() => queryTaskCode()}
              />
            </Form>
            <Spin spinning={treeSpinning}>
              <Tree
                dataSet={adaptorTaskTreeDs}
                treeNodeRenderer={nodeCover}
                multiple={false}
                onExpand={onExpandNode}
              />
            </Spin>
          </div>
          <div className="adaptor-task-form">
            {tableVisible ? (
              <Table dataSet={adaptorTaskDs} columns={columns} style={{ marginTop: '0.2rem' }} />
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
      const adaptorTaskTreeDs = new DataSet(getAdaptorTaskTreeDs());
      const queryFormDs = new DataSet(getQueryFormDs());
      const valueDs = {
        adaptorTaskDs,
        adaptorTaskTreeDs,
        queryFormDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AdaptorTask)
);
