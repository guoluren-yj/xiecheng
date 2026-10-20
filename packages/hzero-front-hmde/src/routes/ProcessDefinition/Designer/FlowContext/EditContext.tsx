import React, { useMemo, useState, useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { Collapse, Input } from 'choerodon-ui';
import {
  Form,
  TextField,
  Lov,
  Switch,
  Table,
  Select,
  TextArea,
  Output,
  Button,
  CodeArea,
} from 'choerodon-ui/pro';
// import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { notification } from 'choerodon-ui/pro/lib';
import {
  flowContextEditDataSet,
  flowContextCustomEditDataSet,
  flowContextTableDataSet,
  analyticalParamsDataSet,
} from '../../datasets/constructCreateFlowContextDataSet';
import styles from './FlowContext.less';

const { Column } = Table;
const { Option } = Select;

interface IProps {
  tenantId?: number | string;
  update: Function;
  commonType?: string; // input 入参 output 出参 custom 自定义变量
  data: any;
  getJsonParseFlag: (val: boolean) => void;
}

export default function EditContext(props: IProps) {
  const { update, commonType, data, tenantId, getJsonParseFlag } = props;
  const [show, setShow] = useState<boolean>(false);
  const [businessObjectCode, setBusinessObjectCode] = useState<string>('');
  const [paramType, setParamType] = useState<string>('');
  const [showParamsCollapse, setShowParamsCollapse] = useState<boolean>(false);
  const [codeContext, setCodeContext] = useState<string>('');

  const handleUpdate = async ({ name, value, record }) => {
    if (name === 'partFlag') {
      setShow(!!value);
      if (value) {
        tableDataSet.query();
      } else {
        // 清空table选中状态
        tableDataSet.setQueryParameter(
          'businessObjectCodeList',
          record?.get('businessObject').businessObjectCode
        );
        await tableDataSet.query();
        handleSelect(tableDataSet);
      }
    } else if (name === 'businessObject') {
      setBusinessObjectCode(value?.businessObjectCode);
      if (value?.businessObjectCode) {
        tableDataSet.setQueryParameter('businessObjectCodeList', value.businessObjectCode);
        await tableDataSet.query();
        const res: any = tableDataSet.map((item) => {
          const { businessObjectFieldCode, businessObjectFieldName, componentType } = item.toData();
          return {
            businessObjectFieldCode,
            businessObjectFieldName,
            componentType,
            parentId: value?.businessObjectCode,
            id: businessObjectFieldCode,
          };
        });
        update({ data: editDataSet, selected: res });
      }
    }

    if (name === 'formattedObject') {
      getJsonParseFlag(false);
    }

    if (name === 'datasetData') {
      update({ data: editDataSet });
    }

    if (commonType === 'custom') {
      update({ data: customEditDataSet });
    } else if (!record?.get('businessObject')) {
      update({ data: editDataSet });
    }
  };

  const editDataSet = useMemo(() => {
    return flowContextEditDataSet({ handleUpdate, commonType });
  }, []);

  const analyParamsDataSet = useMemo(() => {
    return analyticalParamsDataSet();
  }, []);

  const customEditDataSet = useMemo(() => {
    return flowContextCustomEditDataSet({ handleUpdate });
  }, []);

  const handleSelect = (list?) => {
    const selected: any = (list || tableDataSet.selected).map((record) => {
      const { businessObjectFieldCode, businessObjectFieldName, componentType } = record.toData();
      return {
        businessObjectFieldCode,
        businessObjectFieldName,
        componentType,
        parentId: tableDataSet.getQueryParameter('businessObjectCodeList'),
        id: businessObjectFieldCode,
      };
    });
    update({ data: editDataSet, selected });
  };

  const tableDataSet = useMemo(() => {
    return flowContextTableDataSet({ handleSelect: (list?) => handleSelect(list) });
  }, []);

  useEffect(() => {
    // 添加默认请求参数
    tableDataSet.setQueryParameter('primaryKeyFlag', true);
    // 判断table选中状态
    if (!data) return;
    if (commonType === 'custom') {
      customEditDataSet.loadData([data.toData()]);
    } else {
      editDataSet.loadData([data.toData()]);
      setParamType(data.toData().inputParamType);
      if (commonType === 'input' && data.toData().inputParamType === 'custom') {
        // 自定义入参
        const json = JSON.stringify(data.get('formattedObject'));
        if (data.get('formattedObject')) {
          setCodeContext(json);
          handleAnalysisJson(json);
        }
      } else {
        setShow(!!data.get('partFlag'));
        if (data.get('businessObjectCode')) {
          tableDataSet.setQueryParameter('businessObjectCodeList', data.get('businessObjectCode'));
          setBusinessObjectCode(data.get('businessObjectCode'));
          const { businessField } = data.toData();
          tableDataSet.query().then(() => {
            if (businessField?.length) {
              businessField.map((val) => {
                tableDataSet.map((v) => {
                  if (val.businessObjectFieldCode === v.get('businessObjectFieldCode')) {
                    tableDataSet.select(v);
                    // eslint-disable-next-line
                    // v.isSelected = true;
                  }
                  return v;
                });
                return val;
              });
            }
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    editDataSet.setState('businessObjectType', commonType === 'output' ? 'SINGLE' : '');
  }, [commonType]);

  const parseJsonString = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed) {
        return {
          status: true,
          parsed,
        };
      } else {
        notification.open({
          message: '入参JSON解析失败',
          description: '',
        });
        return {
          status: false,
          parsed: null,
        };
      }
    } catch (error) {
      notification.open({
        message: '入参JSON解析失败',
        description: '',
      });
      return {
        status: false,
        parsed: null,
      };
    }
  };

  interface FlattenedArrayItem {
    key: string;
    type: string;
    id: number;
    parentId: number;
    generic?: string;
  }

  function convertDataForDS(parsed: any) {
    const flattenedArray: FlattenedArrayItem[] = [];

    dfs('root', parsed, 0, flattenedArray);

    flattenedArray.shift(); // remove root

    const neatenedArray = flattenedArray.map((item, index, array) => {
      let _parentId: any;

      if (item.parentId && item.parentId !== 1) {
        if (item.parentId === item.id) {
          _parentId = array[index - 1]?.parentId;
        } else {
          _parentId = item.parentId;
        }
      }

      const _type = ['null', 'undefined'].includes(item.type) ? 'any' : item.type;
      const t = item.generic ? `Array<${_type}>` : _type;
      return {
        code: item.key,
        type: t,
        id: item.id,
        parentId: _parentId,
        remark: '',
      };
    });
    return {
      neatenedArray,
      formattedTree: parsed,
    };
  }

  /**
   * todo:
   * 泛型record还是保留输出，因为需要用它的id
   * 最后遍历整个array的时候合并泛型record
   * 【新方案】
   * 在节点迭代中动态下沉数组入口节点
   */
  const dfs = (entry: string, datas: any, prevID: number, flattenedArray: FlattenedArrayItem[]) => {
    let newData;
    let generic: any;
    let currID = -1;

    if (
      flattenedArray.length > 0 &&
      flattenedArray[flattenedArray.length - 1].type === 'Array' &&
      flattenedArray[flattenedArray.length - 1].key === entry
    ) {
      const entryArray = flattenedArray.pop()!;
      // eslint-disable-next-line
      prevID = entryArray.parentId;
      generic = entryArray.type;
    }

    currID = flattenedArray.length + 1;

    if (preciseType(datas) === 'array') {
      newData = [];

      if (datas.length > 0) {
        flattenedArray.push({
          key: entry,
          type: 'Array',
          id: currID,
          parentId: prevID,
          generic,
        });
      }
      newData = dfs(entry, datas[0], currID, flattenedArray);
    } else if (preciseType(datas) === 'object') {
      newData = {};
      if (entry === 'root' || generic) {
        flattenedArray.push({
          key: entry,
          type: 'object',
          id: currID,
          parentId: prevID,
          generic,
        });
      } else {
        currID = prevID;
      }
      Object.keys(datas).forEach((item) => {
        newData[item] = dfs(item, datas[item], currID, flattenedArray);
      });
    } else {
      newData = datas;

      flattenedArray.push({
        key: entry,
        type: preciseType(newData),
        id: currID,
        parentId: prevID,
        generic,
      });
    }
    return newData;
  };

  const preciseType = (datas) => {
    const dict = {
      '[object Array]': 'array',
      '[object Object]': 'object',
      '[object Number]': 'number',
      '[object Function]': 'function',
      '[object String]': 'string',
      '[object Null]': 'null',
      '[object Undefined]': 'undefined',
      '[object Boolean]': 'boolean',
    };

    return dict[Object.prototype.toString.call(datas)];
  };

  // 解析入参JSON结构
  const handleAnalysisJson = async (jsonText: string) => {
    if (!jsonText) {
      await editDataSet.current?.set('formattedObject', null);
      await editDataSet.current?.set('datasetData', []);
      analyParamsDataSet.loadData([]);
      getJsonParseFlag(true);
      return;
    }
    let tableParams: any = {};
    setShowParamsCollapse(true);
    const parsedResult = parseJsonString(jsonText);
    if (parsedResult.status) {
      tableParams = convertDataForDS(parsedResult.parsed);
      analyParamsDataSet.loadData(tableParams.neatenedArray);
      await editDataSet.current?.set('formattedObject', tableParams.formattedTree);
      await editDataSet.current?.set('datasetData', tableParams.neatenedArray);
      getJsonParseFlag(true);
    } else {
      await editDataSet.current?.set('formattedObject', null);
      await editDataSet.current?.set('datasetData', []);
      analyParamsDataSet.loadData([]);
    }
  };

  if (commonType === 'custom') {
    return (
      <>
        <Form dataSet={customEditDataSet}>
          <TextField name="code" disabled={!!data} />
          <Select name="type" />
          <TextArea name="remark" />
        </Form>
      </>
    );
  } else {
    return (
      <>
        <Form dataSet={editDataSet}>
          {commonType === 'input' && (
            <Select
              name="inputParamType"
              disabled={!!data}
              placeholder="请选择"
              onChange={async (value) => {
                setParamType(value);
                await editDataSet.current?.set('businessObject', null);
              }}
            >
              <Option value="businessObject">业务对象</Option>
              <Option value="custom">自定义</Option>
            </Select>
          )}
          {(commonType === 'output' ||
            (commonType === 'input' && paramType === 'businessObject')) && (
            <>
              <Output
                label={intl.get('hmde.processDefinition.view.flowContext.code').d('编码')}
                value={
                  editDataSet.current?.get('code')
                    ? `${editDataSet.current?.get('code')}_${tenantId}`
                    : ''
                }
              />
              <Lov
                name="businessObject"
                disabled={!!data}
                onChange={() => show && tableDataSet.query()}
              />
              <Switch name="partFlag" disabled={!businessObjectCode} />
            </>
          )}
        </Form>
        {commonType === 'input' && paramType === 'custom' && (
          <>
            <Form dataSet={editDataSet}>
              <TextField name="code" disabled={!!data} />
            </Form>
            <div className={styles['analysis-title']}>
              <h4>入参JSON结构</h4>
            </div>
            <CodeArea
              style={{ height: 310 }}
              value={codeContext}
              onChange={(val) => {
                setCodeContext(val);
                // eslint-disable-next-line no-unused-expressions
                editDataSet.current?.set('formattedObject', val);
              }}
              formatter={JSONFormatter}
            />
            <div className={styles['analysis-btn']}>
              <Button
                funcType={FuncType.raised}
                color={ButtonColor.default}
                style={{ border: 'none', color: '#0840F8' }}
                icon="format_indent_decrease"
                onClick={() => handleAnalysisJson(codeContext)}
              >
                解析
              </Button>
            </div>
            {showParamsCollapse && (
              <Collapse className="params-collapse" defaultActiveKey={['in']}>
                <Collapse.Panel className="params-collapse-item" header="解析参数" key="in">
                  <Table
                    mode={'tree' as any}
                    dataSet={analyParamsDataSet}
                    size={'small' as any}
                    // rowHeight={22}
                  >
                    <Table.Column name="code" />
                    <Table.Column name="type" />
                  </Table>
                </Collapse.Panel>
              </Collapse>
            )}
          </>
        )}
        {show && businessObjectCode && paramType !== 'custom' && (
          <div>
            <div className={styles['select-field-title']}>
              {intl.get('hmde.processDefinition.view.flowContext.title').d('选择字段')}
            </div>
            <div className={styles['select-field-search']}>
              <Input.Search
                placeholder={intl
                  .get('hmde.processDefinition.view.flowContext.businessObjectFieldName')
                  .d('字段')}
                onSearch={(val) => {
                  tableDataSet.setQueryParameter('businessObjectFieldName', val);
                  tableDataSet.query();
                }}
                enterButton
                style={{ width: 200 }}
              />
            </div>
            <Table dataSet={tableDataSet}>
              <Column name="businessObjectFieldName" />
              <Column name="componentType" />
            </Table>
          </div>
        )}
      </>
    );
  }
}
