import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import Context, { IStore } from '@/routes/ProcessDefinition/Designer/store';
import { Collapse, Icon, Popover, Breadcrumb } from 'choerodon-ui';
import { Modal, Button, DataSet, Select, Switch, Tooltip } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { Dom, Addon } from '@antv/x6';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import ImgIcon from '@/utils/ImgIcon';
import { Header } from 'components/Page';
import {
  // getFlowNodes,
  deployProcessDefinition,
  getFlowDetail,
  forbiddenFlow,
  startUseFlow,
  publishFlow,
  // createFlowNode,
} from '@/services/processDefinition';
import { getUrlParamHref, lowcodeOrganizationURL } from '@/utils/common';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { HZERO_HPFM } from '@/utils/config';
import { Toolbar } from '@/components/UiComponents/toolbar';
import { ToolbarGroup } from '@/components/UiComponents/toolbar/group';
import { ToolbarItem } from '@/components/UiComponents/toolbar/item';

import init from './init';
import styles from './index.less';
import { nodes, regularNode, conditionNode, endNode } from './Node/constant';
import Node from './Node/Node';
import FlowContext from './FlowContext/FlowContext';
import ModalConfig from './ModalConfig';
import { installEvent } from '../utils/util';
import { flowNodesSave } from '../utils/useUpdateData';
import Edge from './Edge/Edge';
import { flowContextFormDataSet } from '../datasets/constructCreateFlowContextDataSet';

const { Dnd } = Addon; // eslint-disable-line
const { Panel } = Collapse;

const tenantId = getCurrentOrganizationId();

export default function Designer(prop) {
  const {
    history,
    location: { state },
  } = prop;
  const {
    match: {
      params: { type: viewType },
    },
  } = prop;
  const flowId = getUrlParamHref('flowId');
  const { store } = useContext<{ store: IStore }>(Context as any);
  const dataOperateNodes = nodes.filter((item) => item.category === 'DATA_OPERATE') || [];
  const flowDefinitionNodes = nodes.filter((item) => item.category === 'FLOW_DEFINITION') || [];
  const otherNodes = nodes.filter((item) => item.category === 'OTHER') || [];
  const graph = useRef() as any;
  const dnd = useRef() as any;
  const flowDetail = useRef() as any;
  // 用来传给子组件，储存保存后node的flowNodeId
  const nodeMap = useRef(new Map()) as any;
  const nodeArr = useRef(new Map()) as any;
  // const [selectedNode, setSelectedNode] = useState();
  // 发布状态
  const [flowStatus, setFlowStatus] = useState('N');
  // 启用、禁用
  const [enabledFlag, setEnabledFlag] = useState(false);
  // 版本
  const [versionDisabled, setVersionDisabled] = useState(false);
  const [changeDisabled, setChangeDisabled] = useState(false);
  // const [curVersion, setCueVersion] = useState(1);
  const versionDisabledRef = useRef() as any;
  useEffect(() => {
    versionDisabledRef.current = versionDisabled;
  }, [versionDisabled]);

  const formValidate = {};
  installEvent(formValidate);

  const validate = async (callback?) => {
    return (formValidate as any).trigger('validate', callback);
  };

  const submit = async () => {
    await (formValidate as any).trigger('submit');
  };

  const pageInit = () => {
    // 获取明细
    getFlowDetail({ flowId }).then((res) => {
      if (getResponse(res)) {
        console.log('明细response', res);
        flowDetail.current = res;
        setEnabledFlag(res.enabledFlag);
        setFlowStatus(res.flowStatus);
        if (versionDs.current) {
          versionDs.loadData([
            {
              version: res.version,
            },
          ]);
        }
        if (res?.flowConfig) {
          const config = JSON.parse(res?.flowConfig);
          graph.current = init(config);
          // eslint-disable-next-line no-unused-expressions
          config?.cells?.forEach((item) => {
            nodeArr.current.set(item?.id, item?.detail);
          });
        } else {
          // 初始化graph对象
          graph.current = init();
        }
        graph.current.centerContent();
        // 初始化拖拽对象
        dnd.current = new Dnd({
          target: graph.current, // eslint-disable-line
          scaled: false,
          animation: true,
          validateNode(droppingNode, options) {
            return droppingNode.shape === 'html'
              ? new Promise((resolve) => {
                  const { draggingNode, draggingGraph } = options;
                  const view = draggingGraph.findView(draggingNode);
                  const contentElem = view?.findOne('foreignObject > body > div');
                  if (contentElem) {
                    Dom.addClass(contentElem, 'validating');
                    setTimeout(() => {
                      Dom.removeClass(contentElem, 'validating');
                      resolve(true);
                    }, 3000);
                  }
                })
              : true;
          },
        });
        // 节点点击事件
        graph.current.cleanClipboard();
        graph.current.on('node:dblclick', (props) => {
          console.log('file: Designer.tsx ~ line 57 ~ graph.current.on ~ props', props);
          const { node } = props;
          const { id } = node;
          const flowNodeId = node?.toJSON()?.flowNodeId
            ? node.toJSON().flowNodeId
            : nodeMap?.current?.get(id);
          console.log('file: Designer.tsx ~ line 131 ~ graph.current.on ~ flowNodeId', flowNodeId);
          const nodeCode = node?.toJSON()?.nodeCode;
          // 先清空观察者对象中所有的函数
          (formValidate as any).remove('validate');
          (formValidate as any).remove('submit');
          if (nodeCode !== 'START') {
            // setSelectedNode(node);
            console.log('file: Designer.tsx ~ line 66 ~ graph.current.on ~ node', node);
            // setNodeName(node?.attrs?.label?.text);
            const text = nodeCode === 'END' ? '结束' : node?.attrs?.label?.text;
            Modal.open(
              ModalConfig({
                title: `节点-${text}`,
                children: (
                  <Node
                    selectedNode={node}
                    formValidate={formValidate}
                    nodeMap={nodeMap}
                    nodeArr={nodeArr}
                    flowNodeId={flowNodeId}
                    title={text}
                    graph={graph}
                    versionDisabled={versionDisabledRef.current}
                    setChangeDisabled={setChangeDisabled}
                    flowDetail={flowDetail}
                    viewType={viewType}
                  />
                ),
                okProps: { disabled: versionDisabledRef.current },
                onOk: async () => {
                  const val = await validate();
                  if (val === 'success') {
                    await submit();
                    return true;
                  }
                  return false;
                },
              })
            );
          }
        });
        // 节点点击事件
        // 如果不是条件节点的边，点击没有反应
        graph.current.on('edge:click', (props) => {
          console.log('点击边', props);
          const { edge } = props;
          const { id } = edge;
          const flowNodeId = edge?.toJSON()?.flowNodeId
            ? edge.toJSON().flowNodeId
            : nodeMap?.current?.get(id);
          const edgeJSONData = edge.toJSON();
          const graphJSONData = graph.current.toJSON();
          const { cells } = graphJSONData;
          const sourceNode = cells.find((item) => item.id === edgeJSONData.source.cell);
          // 已选条件
          const sourceNodeEdges = cells
            .filter((item) => item.id !== id)
            .filter((item) => item?.source?.cell === sourceNode.id);
          const selectedConditions: any = [];
          sourceNodeEdges.forEach((item) => {
            if (item.labels && item.labels[0].attrs) {
              selectedConditions.push(item.labels[0].attrs.branchCode);
            }
          });
          if (!sourceNode.flowNodeId) {
            sourceNode.flowNodeId = nodeMap?.current?.get(sourceNode.id);
          }
          if (sourceNode.nodeCode === 'CONDITION') {
            Modal.open(
              ModalConfig({
                title: `边`,
                children: (
                  <Edge
                    selectedEdge={edge}
                    nodeArr={nodeArr}
                    formValidate={formValidate}
                    flowNodeId={flowNodeId}
                    sourceNode={sourceNode}
                    versionDisabled={versionDisabledRef.current}
                    nodeMap={nodeMap}
                    selectedConditions={selectedConditions}
                    setChangeDisabled={setChangeDisabled}
                  />
                ),
              })
            );
          }
        });
        graph.current.on('node:added', () => {
          setChangeDisabled(true);
        });
        graph.current.on('edge:added', () => {
          setChangeDisabled(true);
        });
        graph.current.on('node:removed', () => {
          setChangeDisabled(true);
        });
        graph.current.on('edge:removed', () => {
          setChangeDisabled(true);
        });
      }
    });
    // // 获取节点列表
    // getFlowNodes({ flowId }).then((res) => {
    //   if (getResponse(res)) {
    //     console.log('file: Designer.tsx ~ line 51 ~ pageInit ~ res', res);
    //     // todo
    //   }
    // });
  };

  useEffect(() => {
    pageInit();
  }, []);

  const startDrag = (e, item) => {
    const { type, name, code } = item;
    let node = {} as any;
    if (type === 'regular') {
      const _regularNode = regularNode();
      _regularNode.nodeCode = code;
      _regularNode.attrs.label.text = name;
      // regularNode.attrs.image = {
      //   x: 16,
      //   y: 16,
      //   width: 56,
      //   height: 56,
      //   xlinkHref: switchJpg,
      // };
      node = graph.current.createNode(_regularNode);
    }
    if (type === 'condition') {
      conditionNode.nodeCode = code;
      conditionNode.attrs.label.text = name;
      node = graph.current.createNode(conditionNode);
    }
    if (type === 'end') {
      conditionNode.nodeCode = code;
      conditionNode.attrs.label.text = name;
      node = graph.current.createNode(endNode);
    }
    dnd.current.start(node, e.nativeEvent);
  };

  const formDataSet = useMemo(() => {
    return flowContextFormDataSet(flowId);
  }, []);

  // 设置流程上下文
  const editFlowContext = () => {
    const content = (
      <div>
        <div>代表一个完整的业务对象</div>
        <div>代表业务对象中某些字段组合而成的映射对象</div>
        <div>代表业务对象某一字段,但仍具有该字段的业务属性</div>
      </div>
    );
    Modal.open({
      title: (
        <div className={styles['flow-context-modal_comp']}>
          <span className={styles['flow-context-modal_title']}>流程上下文</span>
          <Popover placement="bottomLeft" content={content} trigger="hover">
            <Icon className={styles['flow-context-modal_icon']} type="help_outline" />
          </Popover>
        </div>
      ),
      drawer: true,
      children: (
        <FlowContext
          store={store}
          versionDisabled={versionDisabledRef.current}
          viewType={viewType}
          version={versionDs.current}
        />
      ), // 流程上下文入口
      onOk: async () => {
        if (versionDisabledRef.current || viewType !== 'detail') {
          return true;
        } else {
          const inputDataSet: any = store.getState('inputDataSet');
          const outputDataSet: any = store.getState('outputDataSet');
          const customDataSet: any = store.getState('customDataSet');
          const data = new Record({
            inputParameter: JSON.stringify(inputDataSet.toData().slice(1)),
            outputParameter: JSON.stringify(outputDataSet.toData().slice(1)),
            customVariable: JSON.stringify(customDataSet.toData().slice(1)),
          });
          formDataSet.removeAll();
          formDataSet.push(data);
          formDataSet.setState('params', store.getState('extraParams'));
          const result = await formDataSet.submit();
          if (result?.success) {
            store.clearFlow();
            getFlowDetail({ flowId }).then((res) => {
              if (getResponse(res)) {
                flowDetail.current = res;
                setEnabledFlag(res.enabledFlag);
                setFlowStatus(res.flowStatus);
                optionDs.query();
                if (versionDs) {
                  versionDs.loadData([
                    {
                      version: res.version,
                    },
                  ]);
                }
              }
            });
            return true;
          }
          return false;
        }
      },
    });
  };

  // toolbar操作
  const handleClick = (name) => {
    const cells = graph.current.getSelectedCells();
    const map = new Map();
    // 清空复制节点的flowNodeId
    cells.forEach((item) => {
      map.set(item.store.data.id, item.store.data.flowNodeId);
    });
    switch (name) {
      case 'undo':
        if (graph.current.history.canUndo()) {
          graph.current.history.undo();
        }
        break;
      case 'redo':
        if (graph.current.history.canRedo()) {
          graph.current.history.redo();
        }
        break;
      case 'copy':
        if (cells && cells.length) {
          // 先删除flowNodeId
          cells.forEach((item) => {
            delete item.store.data.flowNodeId; // eslint-disable-line
          });
          graph.current.copy(cells);
          // 还原flowNodeId;
          cells.forEach((item) => {
            item.store.data.flowNodeId = map.get(item.store.data.id); // eslint-disable-line
          });
        } else {
          notification.warning({ message: '请先选中节点再复制' });
        }
        break;
      case 'paste':
        if (graph.current.isClipboardEmpty()) {
          notification.warning({ message: '剪切板为空，不可粘贴' });
        } else {
          graph.current.paste();
          graph.current.cleanSelection();
          // this.graph.select(cells)
          // message.success('粘贴成功')
        }
        break;
      // case 'delete':
      //   if (selectedNode) {
      //     graph.current.removeCell(selectedNode);
      //   }
      //   break;
      case 'zoomIn':
        graph.current.zoom(-0.1);
        break;
      case 'zoomOut':
        graph.current.zoom(0.1);
        break;
      default:
        break;
    }
  };

  const optionDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        paging: false,
        transport: {
          read: () => {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HPFM,
              })}/lovs/data?lovCode=HMDE.FLOW_VERSION`,
              method: 'GET',
              params: {
                flowId,
              },
            };
          },
        },
      }),
    []
  );

  // 版本
  const versionDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'version',
            type: FieldType.number,
            textField: 'version',
            valueField: 'version',
            options: optionDs,
          },
        ],
        events: {
          update: ({ value }) => {
            console.log('version', value);
            optionDs.query().then(() => {
              const option: any = optionDs.toData() || [];
              if (value !== option?.[0]?.version) {
                setVersionDisabled(true);
              } else {
                setVersionDisabled(false);
              }
              getFlowDetail({ flowId, version: value }).then((res) => {
                if (getResponse(res)) {
                  flowDetail.current = res;
                  setEnabledFlag(res.enabledFlag);
                  setFlowStatus(res.flowStatus);
                  if (res?.flowConfig) {
                    graph.current.fromJSON(JSON.parse(res?.flowConfig));
                    const config = JSON.parse(res?.flowConfig);
                    // eslint-disable-next-line no-unused-expressions
                    config?.cells?.forEach((item) => {
                      nodeArr.current.set(item?.id, item?.detail);
                    });
                  }
                }
              });
            });
            // record
            //   .getField(name)
            //   .fetchLookup()
            //   .then((res) => {
            //     if (value !== res?.[0]?.version) {
            //       setVersionDisabled(true);
            //     } else {
            //       setVersionDisabled(false);
            //     }
            //   });
          },
          // load: ({ dataSet }) => {
          //   const data = dataSet?.current?.toData() || {};
          //   console.log('version', data);
          // },
        },
      }),
    []
  );

  const globalDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      paging: false,
      fields: [
        {
          name: 'globalTransactionFlag',
          type: FieldType.boolean,
          defaultValue: true,
          label: (
            <span>
              事务一致性
              <Tooltip
                placement="top"
                title="开启后流内节点的事务将保持一致性，即：当某个节点执行报错时，将回退前面节点的操作"
              >
                <Icon type="help_outline" style={{ fontSize: 16 }} />
              </Tooltip>
            </span>
          ),
        },
      ],
      events: {
        update: () => {
          setChangeDisabled(true);
        },
      },
    });
  }, []);

  // 保存事务处理流
  const save = async () => {
    const graphData = graph.current.toJSON();
    // 如果结束节点未保存，先保存结束节点，再进行大保存
    const _endNode = graphData.cells.find((item) => item?.nodeCode === 'END');
    const edges = graphData.cells
      ?.filter((item) => item?.shape === 'edge')
      ?.filter((i) => i?.target?.cell === _endNode?.id)
      ?.map((i) => i?.source?.cell);
    const preNodeArr = edges
      ?.map((item) => {
        return nodeArr.current.get(item)?.nodeCode;
      })
      .filter((i) => i);

    if (_endNode && !nodeArr.current.get(_endNode?.id)) {
      const nodeCode = `END${new Date().getTime()}`;
      const inParam = {
        flowId,
        tenantId,
        nodeName: '结束',
        nodeCode,
        nodeConfig: JSON.stringify({
          curNodeName: '结束',
          nodeCode,
          outputConfig: '',
          type: 'END',
          preNodes: preNodeArr,
        }),
      };
      nodeArr.current.set(_endNode?.id, inParam);
    }
    graphData.cells = graphData.cells.map((i) => {
      if (i?.labels && i?.shape === 'edge') {
        return {
          ...i,
          branchCode: i?.labels?.[0]?.attrs?.branchCode ? i?.labels?.[0]?.attrs?.branchCode : '',
          branchName: i?.labels?.[0]?.attrs?.branchName ? i?.labels?.[0]?.attrs?.branchName : '',
        };
      } else {
        return i;
      }
    });

    const data = {
      cells: graphData.cells.map((item) => {
        if (item?.shape === 'edge' || item.nodeCode === 'START') {
          return item;
        } else {
          return {
            ...item,
            detail: nodeArr.current.get(item.id) || {},
          };
        }
      }),
    };
    data.cells.forEach((item) => {
      if (item?.flowNodeId === '') {
        // eslint-disable-next-line no-param-reassign
        delete item?.flowNodeId;
      }
    });

    console.log(data);
    if (flowNodesSave(graphData, nodeArr, graph)) {
      // 先判断结束节点有没有配置，如果没有自动生成配置，再进行大保存
      const body = {
        ...flowDetail.current,
        flowConfig: JSON.stringify(data),
        globalTransactionFlag: globalDs?.current?.get('globalTransactionFlag'),
      };
      console.log('file: Designer.tsx ~ line 195 ~ save ~ body', body);
      deployProcessDefinition({ body }).then((res) => {
        if (getResponse(res)) {
          setChangeDisabled(false);
          getFlowDetail({ flowId, version: res.version }).then((_res) => {
            if (getResponse(_res)) {
              flowDetail.current = _res;
              setEnabledFlag(_res.enabledFlag);
              setFlowStatus(_res.flowStatus);
              if (_res?.flowConfig) {
                const config = JSON.parse(_res?.flowConfig);
                graph.current.fromJSON(config);
                // eslint-disable-next-line no-unused-expressions
                config?.cells?.forEach((item) => {
                  nodeArr.current.set(item?.id, item?.detail);
                });
              }
            }
          });
          setFlowStatus(res.flowStatus);
          optionDs.query();
          if (versionDs) {
            versionDs.loadData([
              {
                version: res.version,
              },
            ]);
          }
          console.log('file: Designer.tsx ~ line 51 ~ pageInit ~ res', res);
          notification.success({ message: '操作成功' });
        }
      });
    }
  };

  // 禁用事务处理流
  const forbidden = () => {
    forbiddenFlow(flowId).then((res) => {
      if (getResponse(res)) {
        console.log('禁用res', res);
        getFlowDetail({ flowId }).then((r) => {
          if (getResponse(r)) {
            console.log('明细response', r);
            setFlowStatus(r.flowStatus);
            setEnabledFlag(r.enabledFlag);
            flowDetail.current = r;
          }
        });
      }
    });
  };

  // 启用事务处理流
  const startUse = () => {
    startUseFlow(flowId).then((res) => {
      if (getResponse(res)) {
        console.log('禁用res', res);
        getFlowDetail({ flowId }).then((r) => {
          if (getResponse(r)) {
            console.log('明细response', r);
            setFlowStatus(r.flowStatus);
            setEnabledFlag(r.enabledFlag);
            flowDetail.current = r;
          }
        });
      }
    });
  };

  // 发布事务处理流
  const publish = () => {
    publishFlow(flowId).then((res) => {
      if (getResponse(res)) {
        notification.success({ message: '发布成功' });
        console.log('发布res', res);
        getFlowDetail({ flowId }).then((r) => {
          if (getResponse(r)) {
            console.log('明细response', r);
            setFlowStatus(r.flowStatus);
            flowDetail.current = r;
            optionDs.query();
            if (versionDs) {
              versionDs.loadData([
                {
                  version: r.version,
                },
              ]);
            }
          }
        });
      }
    });
  };

  return (
    <div className={styles.designer}>
      <Header
        title={
          <Breadcrumb style={{ marginLeft: '10px' }}>
            <Breadcrumb.Item
              style={{ cursor: 'pointer' }}
              onClick={() => {
                console.log('state', state);
                if (state?.keyword) {
                  sessionStorage.setItem('queryState', state?.keyword);
                }
                if (state?.page) {
                  sessionStorage.setItem('pageState', state?.page);
                }
                history.push({
                  pathname: '/hmde/definition/list',
                });
              }}
            >
              <span>事务处理流</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span>配置</span>
            </Breadcrumb.Item>
          </Breadcrumb>
        }
        // backPath="/hmde/definition/list"
      >
        {viewType === 'detail' && (
          <Button color={ButtonColor.primary} onClick={() => save()} disabled={versionDisabled}>
            <ImgIcon name="baochun.svg" size={16} style={{ margin: '0px 4px' }} />
            保存
          </Button>
        )}
        {viewType === 'detail' && (
          <Button
            onClick={() => {
              Modal.confirm({
                children: <span>请确认是否发布该事务处理流</span>,
                okText: '确定',
                onOk: () => {
                  publish();
                },
              });
            }}
            disabled={versionDisabled || flowStatus === 'Y' || changeDisabled}
          >
            <ImgIcon name="fabu.svg" size={16} style={{ margin: '0px 4px' }} />
            发布
          </Button>
        )}
        {viewType === 'detail' ? (
          <div>
            {!!enabledFlag && (
              <Button icon="not_interested" onClick={() => forbidden()} disabled={versionDisabled}>
                禁用{' '}
              </Button>
            )}

            {!enabledFlag && (
              <Button onClick={() => startUse()} disabled={versionDisabled}>
                <ImgIcon name="qiyong.svg" size={16} style={{ margin: '0px 4px' }} />
                启用
              </Button>
            )}
          </div>
        ) : null}
      </Header>
      <div className={styles['content-box']}>
        <div className={styles.content}>
          <div className={styles['left-panel']}>
            <div className={styles['left-panel-tabs']}>
              <div>节点</div>
              <div className={styles['flow-context']} onClick={() => editFlowContext()}>
                <ImgIcon name="liuchen14.svg" size={16} style={{ margin: '0px 4px' }} />
                流程上下文
              </div>
            </div>
            {!versionDisabled && viewType === 'detail' && (
              <div>
                <Collapse bordered={false} defaultActiveKey={['1', '2', '3']}>
                  <Panel header="数据操作" key="1">
                    {dataOperateNodes.map((item) => (
                      <div className={styles['node-item']} onMouseDown={(e) => startDrag(e, item)}>
                        <ImgIcon name={item.icon} size={16} style={{ margin: '0px 4px' }} />
                        {item.name}
                      </div>
                    ))}
                  </Panel>
                  <Panel header="流程定义" key="2">
                    {flowDefinitionNodes.map((item) => (
                      <div className={styles['node-item']} onMouseDown={(e) => startDrag(e, item)}>
                        <ImgIcon name={item.icon} size={16} style={{ margin: '0px 4px' }} />
                        {item.name}
                      </div>
                    ))}
                  </Panel>
                  <Panel header="其他" key="3">
                    {otherNodes.map((item) => (
                      <div className={styles['node-item']} onMouseDown={(e) => startDrag(e, item)}>
                        <ImgIcon name={item.icon} size={16} style={{ margin: '0px 4px' }} />
                        {item.name}
                      </div>
                    ))}
                  </Panel>
                </Collapse>
              </div>
            )}
          </div>
          <div className={styles['right-panel']}>
            {
              <div className={styles['app-toolbar']}>
                {viewType === 'detail' && (
                  <div className={styles['app-toolbar-left']}>
                    <div style={{ fontWeight: 400, fontSize: '18px', marginBottom: '5px' }}>
                      {flowDetail?.current?.flowName || ''}
                    </div>
                    <div style={{ color: '#bbb' }}>{flowDetail?.current?.flowCode || ''}</div>
                  </div>
                )}
                <div className={styles['app-toolbar-right']}>
                  {viewType === 'detail' && (
                    <div style={{ display: 'flex' }}>
                      <span>
                        <span style={{ color: '#7c859b', fontSize: 12, marginTop: 3 }}>
                          事务一致性
                        </span>
                        <Tooltip
                          placement="top"
                          title="开启后流内节点的事务将保持一致性，即：当某个节点执行报错时，将回退前面节点的操作"
                        >
                          <Icon type="help_outline" style={{ fontSize: 14, marginRight: 5 }} />
                        </Tooltip>
                      </span>
                      <div style={{ marginRight: 8 }}>
                        <Switch
                          dataSet={globalDs}
                          name="globalTransactionFlag"
                          disabled={versionDisabled || viewType !== 'detail'}
                        />
                      </div>
                    </div>
                  )}
                  {viewType === 'detail' && (
                    <div>
                      <span className={styles['right-title']}>状态</span>
                      {enabledFlag ? (
                        <span className={styles.enable}>启用</span>
                      ) : (
                        <span className={styles.disable}>禁用</span>
                      )}
                      {flowStatus === 'Y' && <span className={styles.published}>发布</span>}
                      {flowStatus === 'N' && <span className={styles.unpublished}>未发布</span>}
                      {flowStatus === 'R' && <span className={styles.republished}>需重新发布</span>}
                    </div>
                  )}
                  <div className={styles['version-box']}>
                    <span className={styles['right-title']}>当前版本</span>
                    <div>
                      <Select
                        dataSet={versionDs}
                        name="version"
                        clearButton={false}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            }
            <div style={{ position: 'relative', width: '100%' }}>
              <div id="app-content" className={styles['app-content']} />
              {
                <div className={styles['app-toolbar-tool']}>
                  <div className={styles['app-toolbar-left-tool']}>
                    <Toolbar size="big" onClick={handleClick}>
                      <ToolbarGroup>
                        <ToolbarItem
                          name="undo"
                          // tooltip="Undo (Cmd + Z)"
                          icon={<ImgIcon name="undo@v4.0.svg" size={16} />}
                        />
                        <ToolbarItem
                          name="redo"
                          // tooltip="Redo (Cmd + Shift + Z)"
                          icon={<ImgIcon name="redo@v4.0.svg" size={16} />}
                        />
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem
                          name="copy"
                          tooltip="复制"
                          icon={<ImgIcon name="copy@v4.0.svg" size={16} />}
                        />
                        <ToolbarItem
                          name="paste"
                          tooltip="粘贴"
                          icon={<ImgIcon name="paste@v4.0.svg" size={16} />}
                        />
                        {/* <ToolbarItem
                      name="delete"
                      tooltip="删除"
                      icon={<ImgIcon name="delete@v4.0.svg" size={16} />}
                    /> */}
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem
                          name="zoomIn"
                          tooltip="缩小"
                          icon={<ImgIcon name="narrow@v4.0.svg" size={16} />}
                        />
                        <ToolbarItem
                          name="zoomOut"
                          tooltip="放大"
                          icon={<ImgIcon name="enlarge@v4.0.svg" size={16} />}
                        />
                      </ToolbarGroup>
                    </Toolbar>
                  </div>
                </div>
              }
            </div>
            <div id="app-minimap" className={styles['app-minimap']} />
          </div>
        </div>
      </div>
    </div>
  );
}
