import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  DataSet,
  Form,
  Spin,
  IntlField,
  Icon,
  Modal,
  Select,
  TreeSelect,
  Output,
  Button,
} from 'choerodon-ui/pro';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';
import { FieldType, DataSetSelection, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';

import { drill } from '@/services/businessObjectService';
import {
  // getFlowNodeDetail,
  // createFlowNode,
  getInputParameter,
  getCustomVariable,
  getMessageTemplate,
  getExpression,
  getBoFieldList,
} from '@/services/processDefinition';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import { getUrlParamHref, lowcodeOrganizationURL } from '@/utils/common';
import { HZERO_HMDE } from '@/utils/config';
import uuid from 'uuid/v4';
import ImgIcon from '@/utils/ImgIcon';
import DrillComponent, { EDrillMainKeyType } from '@/components/DrillComponent';

import { NodeConfig, fieldsConfig } from './DataSetConfig';
import FieldAssign from './components/FieldAssign';
import styles from './index.less';
import ConditionBranch from './components/ConditionBranch';
import Expression from './components/Expression';

const { Option } = Select;
const { TreeNode } = TreeSelect;

const tenantId = getCurrentOrganizationId();
const createExpressionKey = Modal.key();

interface ILineData {
  executeParameters: any[];
  branches: any[];
  filterParameters: any[];
  setParams: any[];
  templateParams: any[];
}

export function levelLoop(arr, parentId = 1) {
  const tree: any = [];
  arr.forEach(item => {
    if (item.parentId === parentId) {
      // 递归寻找
      item.children = levelLoop(arr, item.id); // eslint-disable-line
      tree.push(item);
    }
  });

  return tree;
}

const categoryMap = new Map([
  ['IR', 'IR-FieldAssign'],
  ['DR', 'DR-FieldAssign'],
  ['UR', 'UR-FieldAssign'],
  ['SR', 'SR-FieldAssign'],
  ['CONDITION', 'CONDITION-FieldAssign'],
  ['SCRIPT', 'SCRIPT-FieldAssign'],
  ['VA', 'VA-FieldAssign'],
  ['MN', 'MN-FieldAssign'],
]);

const Node = props => {
  const flowId = getUrlParamHref('flowId');
  const { title, graph, nodeArr, versionDisabled, setChangeDisabled, flowDetail, viewType } = props;
  // const { flowNodeId } = props;
  const { formValidate } = props;
  const HeaderDataSetRef = useRef({} as any);
  const conditionBranchDs = useRef([{} as DataSet]);
  const detailResponse = useRef({} as any);
  const lineData: ILineData = {
    executeParameters: [],
    branches: [],
    filterParameters: [],
    setParams: [],
    templateParams: [],
  };
  const [loading, setLoading] = useState(false);
  // const [preArr, setPre] = useState([] as any);
  console.log('file: Node.tsx ~ line 24 ~ Node ~ conditionBranchDs', conditionBranchDs);
  const { selectedNode } = props;
  const selectedNodeJson = selectedNode.toJSON();
  const { nodeCode } = selectedNodeJson;
  const category = categoryMap.get(nodeCode);
  const currentNodeConfig = NodeConfig.get(nodeCode) || {
    headerArea: [] as any,
    assignmentArea: {} as any,
    conditionArea: {} as any,
    setTemplateParamArea: {} as any,
    conditionBranchArea: {} as any,
    setParamArea: {} as any,
  };
  console.log(
    'file: Node.tsx ~ line 20 ~ currentNodeConfig ~ currentNodeConfig',
    currentNodeConfig
  );
  const {
    headerArea,
    assignmentArea,
    conditionArea,
    setTemplateParamArea,
    conditionBranchArea,
    setParamArea,
  } = currentNodeConfig;
  // 业务对象字段
  const [businessObjectFields, setBusinessObjectFields] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [filterParameters, setFilterParameters] = useState<any[]>([]);
  const [expressionList, setExpressionList] = useState([] as any);
  const [setParams, setSetParams] = useState<any[]>([]);
  const [templateParams, setTemplateParams] = useState<any[]>([]);
  const templateParamsRef = useRef<any[]>([]);
  const [allBusinessObjectFields, setAllBusinessObjectFields] = useState<any[]>([]);
  // 入参数据
  const [inputParameterData, setInputParameterData] = useState([]);
  const [inputParameterOriginData, setInputParameterOriginData] = useState<any[]>([]);
  const inputParameterOriginDataRef = useRef<any[]>([]);
  const [inputParameterId, setInputParameterId] = useState('' as any);
  const [sourceType, setSourceType] = useState('' as any);
  const [selectField, setSelectField] = useState([] as any);
  // 业务对象非必填字段
  // const [notRequiredFields, setNotRequiredFields] = useState<any[]>([]);
  const optionDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        transport: {
          read: () => {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/flow-scripts/${flowId}/inputParameter`,
              method: 'GET',
              transformResponse(d) {
                const res = JSON.parse(d);
                res.forEach(item => {
                  item.text = item.businessObjectFieldName // eslint-disable-line
                    ? item.businessObjectFieldName
                    : item.businessObjectName;
                });
                return res;
              },
            };
          },
        },
        selection: DataSetSelection.single,
        idField: 'id',
        parentField: 'parentId',
      }),
    []
  );

  const fields: any = useRef(
    headerArea.map(item => {
      let field: any = fieldsConfig.get(item);
      if (item === 'curNodeName') {
        if (nodeCode === 'SCRIPT') {
          field = {
            ...field,
            defaultValue: title,
            render: () => (
              <IntlField
                key="curNodeName"
                name="curNodeName"
                suffix={<Icon type="language" />}
                disabled
              />
            ),
          };
        } else {
          field = {
            ...field,
            defaultValue: title,
          };
        }
      }
      return field;
    })
  );
  fields.current.push(
    ...[
      {
        name: 'type',
        type: FieldType.string,
        defaultValue: nodeCode,
      },
    ]
  );
  if (nodeCode === 'DR' || nodeCode === 'UR') {
    fields.current.push(
      ...[
        {
          name: 'sourceType',
          type: FieldType.string,
          label: '来源',
          required: true,
          computedProps: {},
        },
        {
          name: 'inputParameterId',
          type: FieldType.string,
          label: '业务对象code',
          computedProps: {
            required: ({ record }) => record.get('sourceType') === 'inputParameter',
          },
        },
        {
          name: 'inputParameter',
          type: FieldType.string,
          label: '必填',
          computedProps: {
            required: () => {
              return false;
              // const _inputParameterId = record.get('inputParameterId');
              // const data = inputParameterOriginDataRef.current.find(
              //   (item) => item.id === _inputParameterId
              // );
              // if (record.get('sourceType') === 'inputParameter') {
              //   if (record.get('type') && record.get('type') === 'any') {
              //     return false;
              //   }
              //   return data?.parentId === 1 || data?.componentType?.indexOf('RELATION') !== -1;
              // } else {
              //   return false;
              // }
            },
          },
        },
        {
          name: 'expression',
          type: FieldType.string,
          label: '必填',
          computedProps: {
            required: ({ record }) => record.get('sourceType') === 'expression',
          },
        },
      ]
    );
  }

  const setInputParameterIdFunc = async id => {
    let splitArray = [];
    if (id) {
      splitArray = id.split('.');
    }
    if (splitArray.length) {
      id = splitArray[splitArray.length - 1]; // eslint-disable-line
    }
    const curData = inputParameterOriginDataRef.current.find(item => item.id === id);
    if (curData && curData.parentId && curData.parentId === 1) {
      // 说明是头字段
      setInputParameterId(curData.businessObjectCode);
    } else if (
      curData &&
      curData.componentType &&
      curData.componentType.indexOf('RELATION') !== -1
    ) {
      const parentData = inputParameterOriginDataRef.current.find(
        item => item.id === curData.parentId
      );
      await drill({
        query: { businessObjectCode: parentData.businessObjectCode, drillMainKeyFlag: true },
      }).then(res => {
        const businessObjectField = res.businessObjectFields.find(
          item => item.businessObjectFieldCode === curData.businessObjectFieldCode
        );
        if (businessObjectField.masterBusinessObjectCode) {
          setInputParameterId(businessObjectField.masterBusinessObjectCode);
        } else {
          setInputParameterId(parentData.businessObjectCode);
        }
      });
    } else {
      setInputParameterId('');
    }
  };

  const HeaderDataSet = useMemo(() => {
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        ...fields.current,
        {
          name: 'scriptObject',
          type: FieldType.object,
          label: '脚本',
          textField: 'scriptName',
          valueField: 'scriptCode',
          lovCode: 'HMDE.SCRIPT',
          lovPara: {
            tenantId: flowDetail?.current?.tenantId,
          },
        },
        {
          name: 'message',
          type: FieldType.object,
          label: '消息通知',
          lovCode: 'HMDE.MSG_SENG_CONFIG',
          lovPara: {
            tenantId: flowDetail?.current?.tenantId,
          },
          ignore: FieldIgnore.always,
        },
        { name: 'expressionList', type: FieldType.object, ignore: FieldIgnore.always },
        { name: 'expressionId', type: FieldType.number },
      ],
      events: {
        update: ({ name, value, record, oldValue }) => {
          console.log('业务对象', name, value);
          if (name === 'expressionId') {
            if (value) {
              const cur = HeaderDataSet?.current
                ?.get('expressionList')
                .filter(i => i?.id === value)?.[0]?.value;
              // eslint-disable-next-line no-unused-expressions
              HeaderDataSet?.current?.set('expression', cur);
            } else {
              // eslint-disable-next-line no-unused-expressions
              HeaderDataSet?.current?.set('expression', null);
            }
          }
          if (name === 'businessObject') {
            if (value && value.businessObjectCode) {
              // 选择了业务对象，然后调列表接口
              getBoFieldList({
                query: {
                  businessObjectCodeList: (value as any).businessObjectCode,
                  primaryKeyFlag: true,
                  tenantId: flowDetail?.current?.tenantId,
                },
              }).then(res => {
                if (getResponse(res)) {
                  res.forEach(item => {
                    delete item.sourceType; // eslint-disable-line
                  });
                  // 删除who字段
                  const _res = res.filter(
                    item =>
                      item.businessObjectFieldCode !== 'tenantId' &&
                      item.businessObjectFieldCode !== 'createdBy' &&
                      item.businessObjectFieldCode !== 'creationDate' &&
                      item.businessObjectFieldCode !== 'lastUpdatedBy' &&
                      item.businessObjectFieldCode !== 'lastUpdateDate' &&
                      item.businessObjectFieldName !== '主键' &&
                      item.businessObjectFieldCode !== 'objectVersionNumber'
                  );
                  if (nodeCode === 'SR' || nodeCode === 'UR') {
                    // 查询节点，修改节点不自动带出必填节点
                    if (nodeCode === 'SR') {
                      setAllBusinessObjectFields(
                        res.map(item => {
                          item.fieldCode = item.businessObjectFieldCode; // eslint-disable-line
                          item.requiredFlag = false; // eslint-disable-line
                          return item;
                        })
                      );
                      setBusinessObjectFields([]);
                    } else {
                      setAllBusinessObjectFields(
                        res
                          .filter(
                            r =>
                              r.businessObjectFieldCode !== 'tenantId' &&
                              r.businessObjectFieldCode !== 'createdBy' &&
                              r.businessObjectFieldCode !== 'creationDate' &&
                              r.businessObjectFieldCode !== 'lastUpdatedBy' &&
                              r.businessObjectFieldCode !== 'lastUpdateDate' &&
                              r.businessObjectFieldName !== '主键'
                          )
                          .map(item => {
                            item.fieldCode = item.businessObjectFieldCode; // eslint-disable-line
                            item.requiredFlag = false; // eslint-disable-line
                            return item;
                          })
                      );
                      setBusinessObjectFields(
                        res
                          .filter(r => r?.businessObjectFieldCode === 'objectVersionNumber')
                          .map(i => {
                            return { ...i, requiredFlag: true };
                          })
                      );
                    }
                  } else {
                    setAllBusinessObjectFields(
                      _res.map(item => {
                        item.fieldCode = item.businessObjectFieldCode; // eslint-disable-line
                        return item;
                      })
                    );
                    setBusinessObjectFields(
                      _res
                        .filter(item => (item as any).requiredFlag)
                        .map(item => {
                          item._id = uuid(); // eslint-disable-line
                          item.fieldCode = item.businessObjectFieldCode; // eslint-disable-line
                          return item;
                        })
                    );
                  }
                  setFilterParameters(
                    _res
                      .filter(item => (item as any).requiredFlag)
                      .map(item => {
                        item._id = uuid(); // eslint-disable-line
                        item.fieldCode = item.businessObjectFieldCode; // eslint-disable-line
                        return item;
                      })
                  );
                  setSetParams(
                    _res
                      .filter(item => (item as any).requiredFlag)
                      .map(item => {
                        item._id = uuid(); // eslint-disable-line
                        item.fieldCode = item.businessObjectFieldCode; // eslint-disable-line
                        return item;
                      })
                  );
                }
              });
            } else {
              setBusinessObjectFields([]);
              setFilterParameters([]);
            }
            record.set('conditionRelation', '');
          }
          if (name === 'scriptObject') {
            if (value) {
              setSetParams([]);
              const selectedData = value;
              record.set('curNodeName', selectedData.scriptName);
              const params: any = selectedData?.inputReference
                ? JSON.parse(selectedData?.inputReference)?.datasetData
                : [];
              params.forEach(item => {
                item.requiredFlag = true; // eslint-disable-line
              });
              setTimeout(() => {
                setSetParams(params);
              }, 0);
            } else {
              // 清空
              setSetParams([]);
            }
          }
          if (name === 'message') {
            if (value) {
              getMessageTemplate(value.tenantId, value.messageCode, getCurrentLanguage()).then(
                res => {
                  if (getResponse(res)) {
                    setTemplateParams([]);
                    res.forEach(item => {
                      delete item.sourceType; // eslint-disable-line
                    });
                    console.log('模板res', res);
                    const map = new Map();
                    res.forEach(item => {
                      map.set(item.templateCode, item);
                    });
                    templateParamsRef.current = [...map.values()].map(item => {
                      if (item.templateArgs) {
                        item.templateArgs.forEach(i => {
                          i.templateCode = item.templateCode; // eslint-disable-line
                          i.requiredFlag = true; // eslint-disable-line
                          i.fieldCode = i.argName; // eslint-disable-line
                        });
                      }
                      return {
                        templateCode: item.templateCode,
                        templateName: item.templateName,
                        templateArgs: item?.templateArgs || [],
                      };
                    });
                    setTemplateParams(templateParamsRef.current);
                  }
                }
              );
            } else {
              templateParamsRef.current = [];
              setTemplateParams(templateParamsRef.current);
            }
          }
          if (name === 'inputParameterId') {
            if (value) {
              setInputParameterIdFunc(value);
              if (value !== oldValue) {
                record.set('inputParameter', '');
              }
            } else {
              // 清空入参的同时，清空字段钻取
              setInputParameterIdFunc('');
              record.set('inputParameter', '');
            }
          }
          if (name === 'sourceType') {
            setSourceType(value);
          }
        },
        load: ({ dataSet }) => {
          const data = dataSet.current.toData();
          console.log('业务对象');
          // 变量赋值节点，不从业务对象里获取值
          if (
            nodeCode !== 'VA' &&
            nodeCode !== 'SCRIPT' &&
            nodeCode !== 'CONDITION' &&
            nodeCode !== 'MN'
          ) {
            if (dataSet.current.get('businessObject')) {
              // 选择了业务对象，然后调列表接口
              getBoFieldList({
                query: {
                  businessObjectCodeList: dataSet.current.get('businessObject')?.businessObjectCode,
                  primaryKeyFlag: true,
                  tenantId: flowDetail?.current?.tenantId,
                },
              }).then(res => {
                if (getResponse(res)) {
                  // 删除who字段
                  const _res = res.filter(
                    item =>
                      item.businessObjectFieldCode !== 'tenantId' &&
                      item.businessObjectFieldCode !== 'objectVersionNumber' &&
                      item.businessObjectFieldCode !== 'createdBy' &&
                      item.businessObjectFieldCode !== 'creationDate' &&
                      item.businessObjectFieldCode !== 'lastUpdatedBy' &&
                      item.businessObjectFieldCode !== 'lastUpdateDate' &&
                      item.businessObjectFieldName !== '主键' &&
                      item.businessObjectFieldCode !== 'objectVersionNumber'
                  );
                  if (nodeCode === 'SR') {
                    setAllBusinessObjectFields(res);
                  } else if (nodeCode === 'UR') {
                    setAllBusinessObjectFields(
                      res.filter(
                        r =>
                          r.businessObjectFieldCode !== 'tenantId' &&
                          r.businessObjectFieldCode !== 'createdBy' &&
                          r.businessObjectFieldCode !== 'creationDate' &&
                          r.businessObjectFieldCode !== 'lastUpdatedBy' &&
                          r.businessObjectFieldCode !== 'lastUpdateDate' &&
                          r.businessObjectFieldName !== '主键'
                      )
                    );
                  } else {
                    setAllBusinessObjectFields(_res);
                  }
                  setBusinessObjectFields(
                    lineData.executeParameters.map(item => {
                      item._id = uuid(); // eslint-disable-line
                      return item;
                    })
                  );
                  setFilterParameters(
                    lineData.filterParameters.map(item => {
                      item._id = uuid(); // eslint-disable-line
                      return item;
                    })
                  );
                  setSetParams(
                    lineData.setParams.map(item => {
                      item._id = uuid(); // eslint-disable-line
                      return item;
                    })
                  );
                  console.log(
                    'file: Node.tsx ~ line 166 ~ HeaderDataSet ~ executeParameters.current',
                    lineData.executeParameters
                  );
                }
              });
            }
          } else {
            if (nodeCode === 'CONDITION') {
              setBranches(
                lineData.branches.map(item => {
                  item._id = uuid(); // eslint-disable-line
                  return item;
                })
              );
            }
            if (nodeCode === 'SCRIPT') {
              setSetParams(
                lineData.setParams.map(item => {
                  item._id = uuid(); // eslint-disable-line
                  return item;
                })
              );
            }
            if (nodeCode === 'VA') {
              setBusinessObjectFields(
                lineData.executeParameters.map(item => {
                  item._id = uuid(); // eslint-disable-line
                  return item;
                })
              );
            }
            if (nodeCode === 'MN') {
              // todo
              templateParamsRef.current = lineData.templateParams;
              setTemplateParams(templateParamsRef.current);
            }
          }
          if (nodeCode === 'DR' || nodeCode === 'UR') {
            setSourceType(data.sourceType);
            if (data.sourceType === 'inputParameter') {
              setInputParameterIdFunc(data.inputParameterId);
            }
          }
        },
      },
    });
    (ds as any).childrenDs = new Map();
    return ds;
  }, []);
  useEffect(() => {
    getInputParameter(flowId).then(res => {
      const newParams = filterInputParameterOriginData(nodeCode, res);
      console.log('入参数据', res);
      setInputParameterOriginData([...newParams]);
      setInputParameterData(levelLoop(newParams));
      inputParameterOriginDataRef.current = [...newParams];
    });
    // 获取表达式
    getExpression(flowId).then(res => {
      if (res.expression) {
        setExpressionList(JSON.parse(res.expression));
      }
    });
    // 节点初始化数据
    if (nodeCode === 'VA') {
      // 变量赋值节点，获取自定义变量
      getCustomVariable(flowId).then(res => {
        console.log('自定义变量res', res);
        if (getResponse(res)) {
          setAllBusinessObjectFields(res);
        } else {
          setAllBusinessObjectFields([]);
        }
        setBusinessObjectFields([]);
      });
    }
    detailResponse.current = nodeArr?.current?.get(selectedNode.id) || {};
    if (detailResponse?.current?.nodeConfig) {
      const nodeConfig = JSON.parse(detailResponse?.current?.nodeConfig) || {};
      lineData.branches = nodeConfig?.branches || [];
      lineData.executeParameters = nodeConfig?.executeParameters || [];
      lineData.filterParameters = nodeConfig?.filterParameters || [];
      lineData.setParams = nodeConfig?.setParams || [];
      lineData.templateParams = nodeConfig?.templateParams || [];
      HeaderDataSet.loadData([{ ...nodeConfig }]);
    }
    HeaderDataSetRef.current = HeaderDataSet;
  }, []);

  useEffect(() => {
    const data = HeaderDataSet?.current?.toData();
    if (data.sourceType === 'inputParameter') {
      setInputParameterIdFunc(data.inputParameterId);
    }
  }, [inputParameterOriginDataRef.current]);

  useEffect(() => {
    const data = HeaderDataSet?.current?.toData();
    // eslint-disable-next-line no-unused-expressions
    HeaderDataSet?.current?.set('expressionList', expressionList);
    if (!data?.expressionId && data?.expression) {
      const curId = expressionList.filter(i => i?.value === data?.expression)?.[0]?.id;
      // eslint-disable-next-line no-unused-expressions
      HeaderDataSet?.current?.set('expressionId', curId);
    }
  }, [expressionList]);

  const fn = (resolve, reject) => {
    HeaderDataSetRef.current.validate().then(r => {
      if (r) {
        resolve();
      } else {
        reject();
      }
    });
  };

  const submitFn = resolve => {
    setLoading(true);
    setChangeDisabled(true);
    const data = (HeaderDataSet.current as any).toData();
    if (headerArea.includes('branches')) {
      // 构建条件节点参数
      const buildData = dataSet => {
        return [...(dataSet as any).childrenDs.values()].map((item, index) => {
          const flag = item?.childrenDs ? [...item?.childrenDs].length : false;
          if (flag) {
            delete item?.inputParameterOriginData; // eslint-disable-line
            return { ...item.toData()[0], conditions: [...buildData(item)] };
          } else {
            delete item?.inputParameterOriginData; // eslint-disable-line
            return {
              ...item.toData()?.[0],
              orderSeq: Number(index) + 1,
            };
          }
        });
      };
      data.defalutBranch = { branchName: 'default', branchCode: 'default_code' };
      data.branches = buildData(HeaderDataSet); // eslint-disable-line
    }
    if (headerArea.includes('executeParameters')) {
      // 构建节点参数
      const buildData = dataSet => {
        return [...(dataSet as any).childrenDs.values()].map(item => {
          delete item?.inputParameterOriginData; // eslint-disable-line
          return item.toData()[0];
        });
      };
      data.executeParameters = buildData(HeaderDataSet); // eslint-disable-line
    }
    if (headerArea.includes('filterParameters')) {
      // 构建查询节点参数
      const buildData = dataSet => {
        return [...(dataSet as any).childrenDs.values()].map((item, index) => {
          delete item?.inputParameterOriginData; // eslint-disable-line
          return {
            ...item.toData()?.[0],
            orderSeq: Number(index) + 1,
          };
        });
      };
      data.filterParameters = buildData(HeaderDataSet); // eslint-disable-line
    }
    if (headerArea.includes('setParams')) {
      // 构建脚本节点参数
      const buildData = dataSet => {
        return [...(dataSet as any).childrenDs.values()].map(item => {
          delete item?.inputParameterOriginData; // eslint-disable-line
          return item.toData()[0];
        });
      };
      data.setParams = buildData(HeaderDataSet); // eslint-disable-line
    }
    if (headerArea.includes('templateParams')) {
      // 构建消息节点参数
      const buildData = dataSet => {
        const map = new Map();
        const exeData = [...(dataSet as any).childrenDs.values()].map(item => {
          delete item?.inputParameterOriginData; // eslint-disable-line
          if (map.get(item.current.get('templateCode'))) {
            map.set(
              item.current.get('templateCode'),
              map.get(item.current.get('templateCode')).concat(item.toData())
            );
          } else {
            map.set(item.current.get('templateCode'), item.toData());
          }
          return item.toData()[0];
        });
        const templateData: any = [];
        templateParamsRef.current.forEach(item => {
          templateData.push({
            templateCode: item?.templateCode,
            templateName: item?.templateName,
            templateArgs: map?.get(item?.templateCode) || [],
          });
        });
        return {
          templateData,
          exeData,
        };
      };
      data.executeParameters = buildData(HeaderDataSet)?.exeData;
      data.templateParams = buildData(HeaderDataSet)?.templateData; // eslint-disable-line
    }

    const pre = graph.current.model.getPredecessors(selectedNode, { distance: 1 }).map(i => i?.id);
    const preNodeIdArr = pre
      .map(item => {
        return nodeArr.current.get(item)?.nodeCode;
      })
      .filter(i => i);

    data.preNodes = preNodeIdArr;

    if (nodeCode === 'CONDITION') {
      const graphData = graph.current.toJSON();
      const outEdge = graph.current.model?.getOutgoingEdges(selectedNode) || [];

      outEdge.forEach((item: any) => {
        const outCell = graphData?.cells?.filter(i => i?.id === item?.id);
        if (outCell?.[0]?.branchCode) {
          const branch = data?.branches?.find(br => br?.branchCode === outCell?.[0]?.branchCode);
          if (outCell?.[0]?.labels?.[0]?.attrs?.branchCode !== 'default_code') {
            item.setLabels({
              attrs: {
                label: { text: branch ? branch?.branchName : '' },
                branchCode: branch ? branch?.branchCode : '',
                branchName: branch ? branch?.branchName : '',
              },
            });
          }
        }
      });
    }

    const inParam = {
      ...detailResponse.current,
      flowId,
      tenantId,
      nodeName: data.curNodeName,
      nodeCode: data.nodeCode,
      nodeConfig: JSON.stringify(data),
    };

    console.log('最终构建的数据', data);

    nodeArr.current.set(selectedNode.id, inParam);
    if (selectedNode?.toJSON()?.nodeCode !== 'END') {
      if (nodeCode === 'CONDITION') {
        selectedNode.attrs = {
          ...selectedNode.attrs,
          label: {
            text:
              data.curNodeName?.length > 6
                ? `${data?.curNodeName.substring(0, 5)}...`
                : data?.curNodeName,
          },
        };
      } else {
        selectedNode.attrs = {
          ...selectedNode.attrs,
          label: {
            text:
              data.curNodeName?.length > 7
                ? `${data?.curNodeName.substring(0, 6)}...`
                : data?.curNodeName,
          },
        };
      }
    }
    // selectedNode.detail = inParam;

    detailResponse.current = inParam;
    const nodeConfig = JSON.parse(detailResponse.current.nodeConfig);
    lineData.branches = nodeConfig?.branches || [];
    lineData.executeParameters = nodeConfig?.executeParameters || [];
    lineData.filterParameters = nodeConfig?.filterParameters || [];
    lineData.setParams = nodeConfig?.setParams || [];
    lineData.templateParams = nodeConfig?.templateParams || [];
    HeaderDataSet.loadData([{ ...nodeConfig }]);
    (formValidate as any).remove('validate');
    (formValidate as any).remove('submit');
    notification.success({ message: '操作成功' });
    resolve();
  };

  useEffect(() => {
    formValidate.remove('validate', fn);
    formValidate.listen('validate', fn);
    formValidate.remove('submit', submitFn);
    formValidate.listen('submit', submitFn);
  }, []);

  // 新增字段赋值
  const addField = (type: string) => {
    const conditionRelation = HeaderDataSet?.current?.get('conditionRelation');
    switch (type) {
      case 'filterParameters':
        setFilterParameters([
          ...filterParameters,
          {
            _id: uuid(),
            businessObjectFieldCode: '',
          },
        ]);
        if (HeaderDataSet.current) {
          if (conditionRelation) {
            HeaderDataSet.current.set(
              'conditionRelation',
              `${conditionRelation} AND ${filterParameters.length + 1}`
            );
          } else {
            HeaderDataSet.current.set('conditionRelation', `1`);
          }
        }
        break;
      case 'executeParameters':
        setBusinessObjectFields([
          ...businessObjectFields,
          {
            _id: uuid(),
            businessObjectFieldCode: '',
          },
        ]);
        break;

      default:
        break;
    }
  };

  // 删除字段赋值
  const deleteField = index => {
    if (conditionArea?.FieldAssign) {
      filterParameters.splice(index, 1);
      setFilterParameters([...filterParameters]);
      if (HeaderDataSet.current) {
        const conditionRelation: number[] = [];
        filterParameters.forEach((item, idx) => {
          conditionRelation.push(idx + 1);
        });
        HeaderDataSet.current.set('conditionRelation', conditionRelation.join(' AND '));
      }
    }
    if (assignmentArea?.FieldAssign) {
      businessObjectFields.splice(index, 1);
      setBusinessObjectFields([...businessObjectFields]);
    }
    if (setParamArea?.FieldAssign) {
      setParams.splice(index, 1);
      setSetParams([...setParams]);
    }
  };

  // 新增条件分支
  const addBranch = () => {
    setBranches([
      ...branches,
      {
        branchId: uuid(),
        branchName: `分支${branches.length + 1}`,
        branchCode: '',
        conditions: [{}],
      },
    ]);
  };

  const handleOk = params => {
    const { result, value } = params;
    console.log('file: FieldAssign.tsx ~ line 121 ~ handleOk ~ params', params);
    if (HeaderDataSet.current) {
      HeaderDataSet.current.set('componentType', result.componentType);
      HeaderDataSet.current.set('inputParameter', value);
      // HeaderDataSet.current.set('refField', value);
    }
  };

  const drillRenderer = () => {
    return (
      <DrillComponent
        onOk={handleOk}
        onClear={() => HeaderDataSet?.current?.set('inputParameter', '')}
        name="inputParameter"
        initValue={HeaderDataSet?.current?.get('inputParameter')}
        businessObjectCode={inputParameterId}
        drillMainKeyType={EDrillMainKeyType.ALL}
      />
    );
  };

  const buildTreeData = item => {
    if (item.type === 'boolean') return;
    if (item.children.length) {
      return React.createElement(
        TreeNode,
        {
          value: item.id,
          title: item.businessObjectFieldName || item.businessObjectName || item.code,
          disabled: true,
        },
        [item.children.map(i => buildTreeData(i))]
      );
    } else {
      return React.createElement(TreeNode, {
        value:
          item?.parentId?.toString() === '1'
            ? `${item.id}`
            : `${item.parentId}.${item.code || item.id}`,
        title: item.businessObjectFieldName || item.businessObjectName || item.code,
      });
    }
  };
  const treeData = originData => {
    return originData.map(item => buildTreeData(item));
  };

  // 构建表达式
  const buildExpression = () => {
    Modal.open({
      title: '构建表达式',
      children: (
        <Expression
          nodeArr={nodeArr}
          modal={props.modal as any}
          graph={graph}
          viewType={viewType}
          versionDisabled={versionDisabled}
        />
      ),
      drawer: false,
      onOk: () => {
        setTimeout(() => {
          getExpression(flowId).then(res => {
            if (res.expression) {
              const data = JSON.parse(res.expression) || [];
              const cur = data.filter(
                i => i?.id === HeaderDataSet?.current?.get('expressionId')
              )?.[0]?.value;
              setExpressionList(JSON.parse(res.expression));
              // eslint-disable-next-line no-unused-expressions
              HeaderDataSet?.current?.set('expression', cur);
              // eslint-disable-next-line no-unused-expressions
              // HeaderDataSet?.current?.set('expression', JSON.parse(res.expression)?.value);
            }
          });
        }, 100);
      },
      style: {
        width: 957,
      },
    });
  };

  // 结束节点出参配置
  const handleOutputConfig = () => {
    const initContent = HeaderDataSet.current ? HeaderDataSet.current.get('outputConfig') : '';
    Modal.open({
      key: createExpressionKey,
      title: '构建表达式',
      children: (
        <Expression
          nodeArr={nodeArr}
          versionDisabled={versionDisabled}
          viewType={viewType}
          graph={graph}
          modal={props.modal as any}
          handleConfirm={val => {
            if (HeaderDataSet.current) {
              HeaderDataSet.current.set('outputConfig', val);
            }
          }}
          initContent={initContent}
        />
      ),
      drawer: false,
      style: {
        width: 957,
      },
    });
  };

  const deleteBranch = id => {
    const data = branches.filter(item => {
      return item.branchId !== id;
    });
    setBranches([...data]);
  };

  // 过滤自定义入参
  const filterParams = (data, types) => {
    const params = data
      ?.filter(item => item?.parentId.toString() === '1')
      .reduce((result, cur) => {
        if (cur.inputParamType === 'businessObject') {
          result.push(cur, ...cur.businessField);
        } else {
          const customData = cur.datasetData?.filter(
            i => i.parentId === cur.id && types.includes(i?.type)
          );
          if (customData?.length) {
            result.push(cur, ...customData);
          }
        }
        return result;
      }, []);
    return params;
  };

  // 过滤节点入参
  const filterInputParameterOriginData = (nodeType, data) => {
    let newParams: any = [];
    let types: any = [];
    if (['IR', 'UR'].includes(nodeType)) {
      types = ['string', 'number', 'boolean'];
    } else if (nodeType === 'DR') {
      types = ['string', 'number'];
    } else if (['SR', 'CONDITION'].includes(nodeType)) {
      types = ['string', 'number', 'boolean', 'Array<string>', 'Array<number>', 'Array<boolean>'];
    } else if (['SCRIPT', 'VA', 'MN'].includes(nodeType)) {
      types = [
        'string',
        'number',
        'boolean',
        'Array<string>',
        'Array<number>',
        'Array<boolean>',
        'Array<object>',
      ];
    }
    newParams = filterParams(data, types);
    return newParams;
  };

  return (
    <div>
      <Spin spinning={loading}>
        <Form
          dataSet={HeaderDataSet}
          labelAlign={LabelAlign.left}
          disabled={versionDisabled || viewType !== 'detail'}
        >
          {fields.current
            .filter(item => item.name !== 'conditionRelation')
            .filter(item => item.name !== 'receiver')
            .filter(item => item.name !== 'outputConfig')
            .map(
              item =>
                item.render &&
                (item.name !== 'curNodeName' || !(nodeCode === 'SCRIPT' || nodeCode === 'END')) &&
                item.render()
            )}
          {fields.current
            ?.filter(item => item.name === 'outputConfig')
            .map(item => item.render && item.render({ handle: handleOutputConfig }))}
          {(category === 'DR-FieldAssign' || category === 'UR-FieldAssign') && (
            <Form.Item label={`${category === 'DR-FieldAssign' ? '删除' : '修改'}记录值`}>
              <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '10px' }}>
                  <Select name="sourceType">
                    <Option value="inputParameter">入参</Option>
                    <Option value="expression">表达式</Option>
                  </Select>
                </div>
                {sourceType === 'inputParameter' && (
                  <>
                    <TreeSelect style={{ marginRight: '10px' }} name="inputParameterId">
                      {treeData(inputParameterData)}
                    </TreeSelect>
                    {inputParameterId && (
                      <Output
                        style={{ marginRight: '10px' }}
                        // name="inputParameter"
                        renderer={drillRenderer}
                      />
                    )}
                  </>
                )}
                {sourceType === 'expression' && (
                  <div style={{ display: 'flex' }}>
                    <Select name="expressionId" style={{ marginRight: '5px' }}>
                      {expressionList.map(item => (
                        <Option value={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                    <ImgIcon
                      name="goujian.svg"
                      size={16}
                      style={{ marginTop: '6px' }}
                      onClick={() => buildExpression()}
                    />
                  </div>
                )}
              </div>
            </Form.Item>
          )}
        </Form>
        {conditionArea?.FieldAssign && (
          <div className={styles.header}>
            <div>过滤条件</div>
            <Button
              disabled={versionDisabled || viewType !== 'detail'}
              style={{ border: 'none' }}
              onClick={() => addField('filterParameters')}
            >
              +&nbsp;新增过滤条件
            </Button>
          </div>
        )}
        {conditionArea?.FieldAssign &&
          filterParameters.map((item, index) => (
            <div className={styles['field-area']} key={item._id}>
              <div>{index + 1}</div>
              <FieldAssign
                versionDisabled={versionDisabled}
                viewType={viewType}
                graph={graph}
                nodeArr={nodeArr}
                category={category}
                deleteField={deleteField}
                index={index}
                curRecord={item}
                parentDataSet={HeaderDataSet}
                allBusinessObjectFields={allBusinessObjectFields}
                businessObjectFields={filterParameters}
                expressionList={expressionList}
                setExpressionList={setExpressionList}
                // notRequiredFields={notRequiredFields}
                cols={5}
                formValidate={formValidate}
                optionDs={optionDs}
                inputParameterData={inputParameterData}
                inputParameterOriginData={inputParameterOriginData}
                delBtnFlag
              />
            </div>
          ))}
        {setTemplateParamArea?.FieldAssign && (
          <div className={styles.header}>
            <div>模板参数配置</div>
            <div />
          </div>
        )}
        {setTemplateParamArea?.FieldAssign &&
          templateParams.map((item, index) => (
            <div key={item._id}>
              <div className={styles['template-item']}>{item.templateName}</div>
              <div>
                {item.templateArgs.map((i, Index) => (
                  <>
                    <FieldAssign
                      versionDisabled={versionDisabled}
                      viewType={viewType}
                      graph={graph}
                      nodeArr={nodeArr}
                      category={category}
                      deleteField={deleteField}
                      index={`${index}-${Index}`}
                      curRecord={i}
                      parentDataSet={HeaderDataSet}
                      formValidate={formValidate}
                      allBusinessObjectFields={allBusinessObjectFields}
                      businessObjectFields={templateParams}
                      expressionList={expressionList}
                      setExpressionList={setExpressionList}
                      optionDs={optionDs}
                      inputParameterData={inputParameterData}
                      inputParameterOriginData={inputParameterOriginData}
                      cols={4}
                    />
                  </>
                ))}
              </div>
            </div>
          ))}
        <Form
          dataSet={HeaderDataSet}
          labelAlign={LabelAlign.left}
          disabled={versionDisabled || viewType !== 'detail'}
        >
          {fields.current
            .filter(item => item.name === 'conditionRelation')
            .map(item => {
              return item.render && item.render();
            })}
          {fields.current
            .filter(item => item.name.indexOf('relBusinessObject') !== -1)
            .map(item => {
              return item.render && item.render();
            })}
          {fields.current
            .filter(item => item.name.indexOf('receiver') !== -1)
            .map(item => {
              return item.render && item.render();
            })}
        </Form>
        {assignmentArea?.FieldAssign && (
          <div className={styles.header}>
            <div>{nodeCode === 'VA' ? '变量赋值' : '字段赋值'}</div>
            <Button
              disabled={versionDisabled || viewType !== 'detail'}
              style={{ border: 'none' }}
              onClick={() => addField('executeParameters')}
            >
              +&nbsp;新增{nodeCode === 'VA' ? '变量赋值' : '字段赋值'}
            </Button>
          </div>
        )}
        {assignmentArea?.FieldAssign &&
          businessObjectFields.map((item, index) => (
            <div className={styles['field-area']} key={item._id}>
              <div>{index + 1}</div>
              <FieldAssign
                versionDisabled={versionDisabled}
                viewType={viewType}
                graph={graph}
                nodeArr={nodeArr}
                category={category}
                deleteField={deleteField}
                index={index}
                curRecord={item}
                parentDataSet={HeaderDataSet}
                // notRequiredFields={notRequiredFields}
                formValidate={formValidate}
                // executeParameters={businessObjectFields}
                allBusinessObjectFields={allBusinessObjectFields}
                selectField={selectField}
                setSelectField={setSelectField}
                businessObjectFields={businessObjectFields}
                expressionList={expressionList}
                setExpressionList={setExpressionList}
                optionDs={optionDs}
                inputParameterData={inputParameterData}
                inputParameterOriginData={inputParameterOriginData}
                delBtnFlag
              />
            </div>
          ))}
        {conditionBranchArea?.FieldAssign && (
          <div className={styles.header}>
            <div>条件分支配置</div>
            <Button
              disabled={versionDisabled || viewType !== 'detail'}
              style={{ border: 'none' }}
              onClick={() => addBranch()}
            >
              +&nbsp;新增条件分支
            </Button>
          </div>
        )}
        {conditionBranchArea?.FieldAssign && (
          <div>
            <div className={styles['default-branch']}>
              <div className={styles['default-branch-title']}>默认分支</div>
              <div className={styles['default-branch-content']}>
                <div>标识</div>
                <div>default_code</div>
              </div>
            </div>
            {branches.map((item, index) => (
              <div>
                <ConditionBranch
                  versionDisabled={versionDisabled}
                  viewType={viewType}
                  graph={graph}
                  nodeArr={nodeArr}
                  branchIndex={index}
                  deleteBranch={deleteBranch}
                  curRecord={item}
                  parentDataSet={HeaderDataSet}
                  formValidate={formValidate}
                  inputParameterData={inputParameterData}
                  inputParameterOriginData={inputParameterOriginData}
                  expressionList={expressionList}
                  setExpressionList={setExpressionList}
                />
              </div>
            ))}
          </div>
        )}
        {setParamArea?.FieldAssign && (
          <div className={styles.header}>
            <div>设置参数</div>
            <div />
          </div>
        )}
        {setParamArea?.FieldAssign &&
          setParams.map((item, index) => (
            <div>
              <FieldAssign
                versionDisabled={versionDisabled}
                viewType={viewType}
                graph={graph}
                nodeArr={nodeArr}
                category={category}
                deleteField={deleteField}
                index={index}
                curRecord={item}
                parentDataSet={HeaderDataSet}
                // notRequiredFields={notRequiredFields}
                formValidate={formValidate}
                // executeParameters={businessObjectFields}
                allBusinessObjectFields={allBusinessObjectFields}
                businessObjectFields={setParams}
                expressionList={expressionList}
                setExpressionList={setExpressionList}
                optionDs={optionDs}
                inputParameterData={inputParameterData}
                inputParameterOriginData={inputParameterOriginData}
                cols={5}
              />
            </div>
          ))}
      </Spin>
    </div>
  );
};

export default Node;
