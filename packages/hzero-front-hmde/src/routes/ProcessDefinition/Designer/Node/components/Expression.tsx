// 构建表达式/构造出参
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, Icon, Button, message } from 'choerodon-ui';
import {
  Form,
  Select,
  CodeArea,
  Menu,
  Dropdown,
  TextField,
  DataSet,
  TreeSelect,
  Output,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import {
  constructCreateExpression,
  constructExpressionCodeArea,
} from '@/routes/ProcessDefinition/datasets/constructCreateExpression';
import {
  getExpression,
  buildExpression,
  getCustomVariable,
  getInputParameter,
} from '@/services/processDefinition';
import { levelLoop } from '@/routes/ProcessDefinition/Designer/Node/Node';
import { cloneDeep } from 'lodash';
import classnames from 'classnames';
// TODO: 提测前删除
import { getUrlParamHref } from '@/utils/common';
import { drill } from '@/services/businessObjectService';
import DrillComponent, { EDrillMainKeyType } from '@/components/DrillComponent';
import styles from '../index.less';

const { TabPane } = Tabs;
const { TreeNode } = TreeSelect;
const { Option } = Select;

interface Expression {
  id: number | string;
  name: string;
  value: string;
  editing?: boolean;
}

interface IProps {
  modal: any;
  graph: any;
  nodeArr: any;
  handleConfirm?: any;
  initContent?: any;
  versionDisabled?: boolean;
  viewType?: string;
}

export default observer((props: IProps) => {
  const {
    modal,
    handleConfirm,
    initContent = '',
    nodeArr,
    graph,
    versionDisabled,
    viewType,
  } = props;
  const flowId = getUrlParamHref('flowId');
  const [list, setList] = useState<Expression[]>([]);
  const [sourceType, setSourceType] = useState<string>('');
  const [activeId, setActiveId] = useState<string | number>('');
  const [variableOptions, setVariableOptions] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [outputPara, setOutputPara] = useState([]);
  const [editorInstance, setEditor] = useState({} as any);
  const [businessObjectCode, setBusinessObjectCode] = useState<string>('');
  const graphData = graph.current.toJSON();
  const [primaryCode, setPrimaryCode] = useState('');
  // const [associatedFieldOptions] = useState([]);

  const buildTreeData = item => {
    if (item.children.length) {
      return React.createElement(
        TreeNode,
        {
          value: item.id,
          // disabled: true,
          title: item.businessObjectFieldName || item.businessObjectName || item.code,
        },
        [item.children.map(i => buildTreeData(i))]
      );
    } else {
      return React.createElement(TreeNode, {
        value: item.id,
        title: item.businessObjectFieldName || item.businessObjectName || item.code,
      });
    }
  };
  const treeData = originData => {
    return originData.map(item => buildTreeData(item));
  };

  // on: init //
  const createExpression = useMemo(() => {
    return constructCreateExpression();
  }, []);

  const expressionCodeArea = useMemo(() => {
    return constructExpressionCodeArea(initContent);
  }, []);

  useEffect(() => {
    if (!handleConfirm) {
      // 获取表达式列表
      getExpression(flowId).then(res => {
        const { expression = '[]' } = res;
        setList(JSON.parse(expression));
        // 表达式列表为空的情况默认添加一条
        if (!expression || expression === '[]') {
          handleAdd('表达式一');
        } else {
          // 默认选中第一条
          handleActive(JSON.parse(expression)[0]);
        }
      });
    }
  }, []);

  const handleAdd = (name?: string) => {
    const curList = cloneDeep(list);
    const initData = { name: name || '表达式', value: '', id: new Date().valueOf() };
    curList.push(initData);
    // 无数据的情况,默认选中新增的数据
    if (name) handleActive(initData);
    setList(curList);
  };

  const handleEdit = data => {
    const num = list.findIndex(val => val.id === data.id);
    const curList = cloneDeep(list);
    curList.splice(num, 1, data);
    setList(curList);
  };

  const handleDelete = data => {
    const curList = cloneDeep(list);
    setList(curList.filter(val => val.id !== data.id));
    if (activeId === data.id) setActiveId('');
  };

  const handleSource = useCallback(async type => {
    let result: any = [];
    if (type === 'inputParameter') {
      // 入参
      result = await getInputParameter(flowId);
      setFieldOptions(result || []);
    } else if (type === 'customVariable') {
      // 自定义变量
      result = await getCustomVariable(flowId);
      setVariableOptions(result || []);
    } else if (type === 'nodeOutputParameter') {
      console.log(graphData?.cells);
      result = graphData?.cells
        ?.filter((item: any) => ['IR', 'UR', 'SR', 'SCRIPT']?.includes(item?.nodeCode))
        .map(i => nodeArr?.current.get(i?.id))
        .filter(i => i);
      setOutputPara(result || []);
    }
    setSourceType(type);
  }, []);

  // 查找父节点
  const familyTree = (arr, id) => {
    const temp: any = [];
    const forFn = function(lists, iid) {
      for (let i = 0; i < lists.length; i++) {
        const item = lists[i];
        if (item.id === iid) {
          temp.push(item);
          forFn(arr, item.parentId);
          break;
        } else if (item.children) {
          forFn(item.children, iid);
        }
      }
    };
    forFn(arr, id);
    return temp;
  };

  const handleInsert = () => {
    const expression = createExpression.current;
    if (expression?.get('source') === 'inputParameter') {
      let fieldSelection = '';
      if (expression.get('fieldSelection')?.businessObjectCode) {
        if (expression.get('fieldSelection')?.parentValue) {
          const arr = levelLoop(cloneDeep(fieldOptions)).filter((i: any) =>
            expression.get('fieldSelection')?.parentValue.includes(i.id)
          );
          if (arr[0].inputParamType === 'custom') {
            // 自定义入参
            const parentNodes = familyTree(
              arr,
              expression?.get('fieldSelection')?.businessObjectCode
            );
            fieldSelection = parentNodes.reduce((pre, cur, index) => {
              return cur.type === 'Array<object>' && index !== 0
                ? `[${cur.code}][0]${pre}`
                : `[${cur.code}]${pre}`;
            }, '');
          } else {
            fieldSelection = `[${expression.get('fieldSelection').parentValue}][${
              expression.get('fieldSelection').businessObjectCode
            }]`;
          }
        } else {
          fieldSelection = `[${expression.get('fieldSelection').businessObjectCode}]`;
        }
      }
      editorInstance.replaceSelection(
        expression.get('associatedFieldSelection')
          ? `#execute('${expression.get('associatedFieldSelection')}',{${primaryCode}:${
              expression.get('source') ? `#${expression.get('source')}` : ''
            }${fieldSelection}})`
          : `${expression.get('source') ? `#${expression.get('source')}` : ''}${fieldSelection}`
      );
    } else if (expression?.get('source') === 'customVariable') {
      editorInstance.replaceSelection(
        `${expression.get('source') ? `#${expression.get('source')}` : ''}${
          expression.get('variableSelection') ? `[${expression.get('variableSelection')}]` : ''
        }`
      );
    } else if (expression?.get('source') === 'nodeOutputParameter') {
      editorInstance.replaceSelection(
        `${expression.get('source') ? `#${expression.get('source')}` : ''}${
          expression.get('point') ? `[${expression.get('point')}][result]` : ''
        }`
      );
    }
    setTimeout(() => {
      const codeArea = editorInstance.getValue();
      expressionCodeArea.loadData([
        {
          content: codeArea,
        },
      ]);
      const curList = list.map(val => {
        if (val.id === activeId) {
          return { ...val, value: codeArea };
        }
        return val;
      });
      setList(curList);
    }, 0);
  };

  const handleActive = data => {
    expressionCodeArea.deleteAll(false);
    expressionCodeArea.loadData([
      {
        content: data.value,
      },
    ]);
    setActiveId(data.id);
  };

  modal.handleOk(async () => {
    if (!handleConfirm) {
      const res = await buildExpression({
        flowId,
        expression: JSON.stringify(list),
      });
      if (!res?.failed) {
        message.success('操作成功');
        return true;
      } else {
        message.error('操作失败');
        return false;
      }
    } else {
      handleConfirm(expressionCodeArea?.current?.get('content'));
    }
  });

  const handleCodeArea = value => {
    const curList = list.map(val => {
      if (val.id === activeId) {
        return { ...val, value };
      }
      return val;
    });
    setList(curList);
  };

  const handleOk = params => {
    const { value } = params;
    if (createExpression.current) createExpression.current.set('associatedFieldSelection', value);
  };

  const drillRenderer = () => {
    return (
      <DrillComponent
        onOk={handleOk}
        onClear={() => createExpression.current?.set('associatedFieldSelection', null)}
        name="associatedFieldSelection"
        initValue={createExpression.current?.get('associatedFieldSelection')}
        businessObjectCode={businessObjectCode}
        drillMainKeyType={EDrillMainKeyType.ALL}
      />
    );
  };

  // on: update //
  return (
    <div className={styles.expression}>
      {!handleConfirm ? (
        <div className={styles.list}>
          {list.map((item: Expression) => (
            <Expression
              key={item.id}
              data={item}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleActive={handleActive}
              active={activeId}
              versionDisabled={versionDisabled}
              viewType={viewType}
            />
          ))}
          {!versionDisabled && viewType === 'detail' && (
            <div className={styles['list-add']} onClick={() => handleAdd()}>
              <Icon type="add" />
              <span>新增表达式</span>
            </div>
          )}
        </div>
      ) : null}
      <div className={styles.codearea}>
        <CodeArea
          id="expressionArea"
          dataSet={expressionCodeArea}
          name="content"
          style={{ height: 268 }}
          onChange={handleCodeArea}
          options={{ lineWrapping: true, lineNumbers: false }}
          disabled={versionDisabled || viewType !== 'detail'}
          editorDidMount={editor => {
            setEditor(editor);
          }}
        />
      </div>
      <div className={styles.tabs}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="参考字段" key="1">
            <Form dataSet={createExpression} disabled={versionDisabled || viewType !== 'detail'}>
              {/* 字段来源 */}
              <Select name="source" onChange={handleSource} />
              {/* 字段选择 */}
              {sourceType === 'inputParameter' ? (
                <TreeSelect
                  name="fieldSelection"
                  onChange={val => {
                    const res: any =
                      fieldOptions.find((item: any) => item?.id === val?.businessObjectCode) || {};
                    if (
                      res &&
                      !res?.businessObjectCode &&
                      res?.componentType &&
                      res?.componentType?.indexOf('RELATION') !== -1
                    ) {
                      const parentData: any = fieldOptions?.find(
                        (item: any) => item?.id === res.parentId
                      );
                      drill({
                        query: {
                          businessObjectCode: parentData?.businessObjectCode,
                          drillMainKeyFlag: true,
                        },
                      }).then(r => {
                        if (getResponse(r)) {
                          setPrimaryCode(r?.businessObjectFields?.[0]?.businessObjectFieldCode);
                          const businessObjectField = r.businessObjectFields.find(
                            item => item.businessObjectFieldCode === res?.businessObjectFieldCode
                          );
                          if (businessObjectField?.masterBusinessObjectCode) {
                            setBusinessObjectCode(businessObjectField?.masterBusinessObjectCode);
                          } else {
                            setBusinessObjectCode(parentData.businessObjectCode);
                          }
                        }
                      });
                    } else if (createExpression.current) {
                      createExpression.current.set('associatedFieldSelection', undefined);
                      setBusinessObjectCode('');
                    }
                  }}
                >
                  {treeData(levelLoop(cloneDeep(fieldOptions)))}
                </TreeSelect>
              ) : null}
              {/* 关联字段选择 -- 字段钻取 */}
              {sourceType === 'inputParameter' && businessObjectCode ? (
                <Output name="associatedFieldSelection" renderer={() => drillRenderer()} />
              ) : null}
              // {/* 变量选择 */}
              {sourceType === 'customVariable' ? (
                <Select
                  name="variableSelection"
                  options={
                    new DataSet({
                      data: variableOptions,
                    })
                  }
                />
              ) : null}
              {sourceType === 'nodeOutputParameter' ? (
                <Select name="point">
                  {outputPara.map((arr: any) => {
                    return (
                      <Option value={arr?.nodeCode}>
                        {`${arr?.nodeName}【${arr?.nodeCode}】`}
                      </Option>
                    );
                  })}
                </Select>
              ) : null}
            </Form>
            <div className={styles.insert}>
              <Button
                icon="format_indent_decrease"
                onClick={handleInsert}
                disabled={(!handleConfirm && !activeId) || versionDisabled || viewType !== 'detail'}
              >
                插入
              </Button>
            </div>
          </TabPane>
          {/* <TabPane tab="公式" key="2" />
          <TabPane tab="函数" key="3" /> */}
        </Tabs>
      </div>
    </div>
  );
});

function Expression(props) {
  const { data, handleEdit, handleDelete, handleActive, active, versionDisabled, viewType } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const menu = (
    <Menu>
      <Menu.Item>
        <div onClick={() => setEditing(true)}>
          <Icon type="edit-o" />
          <span>编辑</span>
        </div>
      </Menu.Item>
      <Menu.Item>
        <div onClick={() => handleDelete(data)}>
          <Icon type="delete_forever-o" />
          <span>删除</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      className={classnames({
        [styles['list-item']]: true,
        [styles['list-item-active']]: data.id === active,
      })}
      onClick={() => handleActive(data)}
    >
      {editing ? (
        <TextField
          defaultValue={data?.name || ''}
          onChange={name => {
            if (name) handleEdit({ ...data, name });
          }}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <span className={styles['list-item-name']}>
          {String(data.name).length < 8 ? data.name : `${data?.name?.substring(0, 7)}...`}
        </span>
      )}
      {!versionDisabled && viewType === 'detail' && (
        <Dropdown overlay={menu} placement={Placements.bottomLeft}>
          <Icon className={styles['list-item-icon']} type="more_horiz" />
        </Dropdown>
      )}
    </div>
  );
}
