import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { DataSet, Button, Modal, Lov, Form, Table, Radio, Output, Select, TextField } from 'choerodon-ui/pro';
import { isNil, isEmpty } from 'lodash';
import { Tooltip } from 'choerodon-ui';

import intl from 'hzero-front/lib/utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
// 引入格式化器
import { getResponse } from 'hzero-front/lib/utils/utils';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import MarmotScriptButton from "srm-front-boot/lib/components/MarmotScript/MarmotScriptButton";
import ExpressionEngine from "srm-front-boot/lib/components/ExpressionEngine";
import ExpressionEngineRule from "srm-front-boot/lib/components/ExpressionEngineRule";
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import notification from 'hzero-front/lib/utils/notification';
import {SelectionMode, TableMode, ColumnLock} from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import crypto from 'crypto-js';

import { moreSettingData, fetchObjectSave, commonData, sortData, introducingObjectData, fetchValueMethodCode, getComplementaryWordsService, fetchDeleteLine} from './initialDataDs';
import TreeShow from './TreeShow';
import MoreSettings from './MoreSettings';
import IntroductingObject from './IntroductingObject';
import './treeshow.less';

// 记录marmot编辑器每次保存后的版本
let newObjectVersionNumber = null;

const RequestMapping = props => {

  const { tenantId, id, source, requestTreeNavDataDs, requestDataDs, editorType } = props;
  const [navKey, setNavKey] = useState('');
  const [complementaryWords, setComplementaryWords] = useState([]);
  const [editorAllFlag, setEditorAllFlag] = useState(true);


  useEffect(() => {
    if(!isNil(id) && !isNil(tenantId) && source) {
      fetchNavData()
      getComplementaryWordsService().then(res => {
        if (getResponse(res)) {
          // 自定义的代码提示
          if (!isEmpty(res)) {
            setComplementaryWords(crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)));
          }
        }
      });
  
    }
    
  }, [id, tenantId, source]);

  const fetchNavData = () => {
    requestTreeNavDataDs.setQueryParameter('extItfId', id);
    requestTreeNavDataDs.setQueryParameter('tenantId', tenantId);
    requestTreeNavDataDs.setQueryParameter('source', source);
    requestTreeNavDataDs.query().then(res => {
      if (getResponse(res)) {
        // 设置导航栏默认值
        requestTreeNavDataDs.find(record => {
          const uniqueCode = record.get('uniqueCode');
          const falg = uniqueCode === res[0].uniqueCode;
          if (falg) {
            requestTreeNavDataDs.select(record);
            handleOnSelect('', {
              selectedNodes: [{ record }],
            });
          }
          return falg;
        });
      }
    });
  };
 

  const fetchData = (tenantIdP, fieldUniqueCodeProps) => {
    if (!isNil(id) && !isNil(tenantIdP) && !isNil(fieldUniqueCodeProps)) {
      requestDataDs.setQueryParameter('extItfId', id);
      requestDataDs.setQueryParameter('tenantId', tenantIdP);
      requestDataDs.setQueryParameter('source', source);
      requestDataDs.setQueryParameter('sourceNode', fieldUniqueCodeProps);
      requestDataDs.query().then(res => {
        if (getResponse(res)) {
          requestDataDs.find(record => {
            const uniqueCode = record.get('uniqueCode');
            const falg = uniqueCode === fieldUniqueCodeProps;
            if (falg) {
              record.selectable = false;
            }
            return falg;
          });
        }
      });
    }
  };

  // 入参对象 - 导航树选择操作
  const handleOnSelect = useCallback(
    (selectedKeys, info) => {
      const { record } = info.selectedNodes[0] || {};
      const { uniqueCode } = record.toData() || {};
      setNavKey(uniqueCode);
      fetchData(tenantId, uniqueCode)
    },
    [navKey, tenantId]
  );

  // 字段行编辑，取消id
  const handleLineEditor = useCallback((record) => {
    record.setState('editing', !record.getState('editing'))
  }, []);

  // 更多设置
  const handleMoreSetting = useCallback((record) => {
  const moreSettingDataDs = new DataSet(moreSettingData());
  moreSettingDataDs.loadData([record.toData()])
    Modal.open({
      title: `${intl.get('scux.externalInterfaceDefinition.model.more.setting').d('更多设置')} - ${record.get('code')}`,
      drawer: true,
      style: {width: 600},
      children: <MoreSettings moreSettingDataDs={moreSettingDataDs} record={record} />,
      onOk: async () => {
        let flag = false;
        const validateFlag = await moreSettingDataDs.validate();
        if(validateFlag) {
          const currentData = {
            ...record.toData(),
            ...moreSettingDataDs.current?.toData(),
          };
          const response = await fetchObjectSave(id, {tenantId, source: source}, [currentData])
          if(getResponse(response)) {
            notification.success({});
            flag = true;
            requestDataDs.query();
          }
        } else {
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
        }
      },
    });
  }, [source]);

  // 引入对象变量
  const handleIntroducingObject = useCallback((recordP) => {
    const {tenantId, type, id, extItfId} = recordP.toData()
    const introducingObjectDataDs = new DataSet(introducingObjectData(tenantId, type));
    Modal.open({
      title: `${intl.get('scux.externalInterfaceDefinition.model.more.introducing.object.variables').d('引入对象变量')} - ${recordP.get('code')}`,
      style: {width: 700},
      children: <IntroductingObject dataSource={recordP.toData()} introducingObjectDataDs={introducingObjectDataDs}/>,
      onOk: () => {
        fetchNavData()
      },
      cancelButton: false,
    });
  }, []);

  const handleChangeMethod = useCallback(async (record, value) => {
    const { extItfId, id, tenantId } = record.get(['extItfId', 'id', 'tenantId']);
    record.set('valueMethodMeansLov', null);
      if (value === 'script') {
        return fetchValueMethodCode(extItfId, id, { tenantId, source: 'REQUEST' }, record.toData()).then(
          res => {
            const resp = getResponse(res);
            if (resp) {
              const { valueMethodMeans, sceneCode } = resp;
              record.set({ valueMethodMeans, sceneCode });
            }
          }
        );
      }
  },[]);

    // 条件表达式
    const handleConditionalExpression = useCallback(async (record, params) => {
      const {objectCode, source, valueCode, valueSourceNode } = params;
      const { extItfId, id, tenantId, valueMethod } = record.get(['extItfId', 'id', 'tenantId', 'valueMethod']);
      const rr = await fetchValueMethodCode(extItfId, id, { tenantId, source: 'REQUEST' }, record.toData());
      if(getResponse(rr)) {
        const {valueMethodMeans} = rr;
        const queryParams = {
          id: params.id,
          tenantId,
          extItfId: id,
          objectCode,
          source,
          type: 'STRING',
          valueSource: 'current_data',
          valueMethod,
          parentValueCode: valueCode,
          parentValueSourceNode: valueSourceNode,
        };
        Modal.open({
          title: intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.conditional.expression').d('条件表达式'),
          drawer: true,
          style: {width: 600},
          children: <ExpressionEngine code={valueMethodMeans} leftValueLovQueryPara={queryParams} leftValueCode="SITF.MAPPING_VALUE_FIELD_ENGINE" />
        });
      } 
      
    }, []);

    // 执行表达式
    const handleExecuteExpression = useCallback(async (record, params) => {
      const {valueSource, type, objectCode, source, valueCode, valueSourceNode } = params;
      const { extItfId, id, tenantId, valueMethod } = record.get(['extItfId', 'id', 'tenantId', 'valueMethod']);
      const rr = await fetchValueMethodCode(extItfId, id, { tenantId, source: 'REQUEST' }, record.toData());
      if(getResponse(rr)) {
        const {valueMethodMeans, sceneCode} = rr;
        const queryParams = {
          id: params.id,
          tenantId,
          extItfId: id,
          objectCode,
          source,
          type,
          valueSource,
          valueMethod,
          parentValueCode: valueCode,
          parentValueSourceNode: valueSourceNode,
        };
        Modal.open({
          title: intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.execute.expression').d('执行表达式'),
          drawer: true,
          style: {width: 600},
          children: <ExpressionEngineRule leftValueCode="SITF.MAPPING_DATA_VALUE_FIELD" leftValueLovQueryPara={queryParams} showTitle code={valueMethodMeans} sceneCode={sceneCode} dataSource={params} params={params} />
        });
      }
    }, []);

  const handleChangeColumnType = useCallback((values, dataSet) => {
    if(values) {
      dataSet.setQueryParameter('type', 'INPUT');
    dataSet.setQueryParameter('functionId', values?.functionId);
    dataSet.query().then(res => {
      const resp = getResponse(res);
      if(resp) {
        dataSet.loadData(resp.functionLibraryDetailList)
      }
    });
    }
    
  }, []);

  // 函数编辑器
  const handleOpenCommonFunction = useCallback((record) => {
    const {tenantId, type, extItfId, objectCode, valueMethodMeansCommonFunctions} = record.toData() || {};
    const {functionLibrary={}, functionLibraryDetailList=[]} = valueMethodMeansCommonFunctions || {};
    const {parent} = record || {};
    const { valueCode, valueSourceNode } = parent?.toData() || {};

    const commonDataDs = new DataSet(commonData(extItfId, valueCode, valueSourceNode, source, objectCode));
    const commonLov = new DataSet({
      autoCreate: true,
      forceValidate: true,
      data: [functionLibrary],
      fields: [
        {
          name: 'columnTypeLov',
          type: FieldType.object,
          required: true,
          label: intl
            .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.common.functions`)
            .d('常用函数'),
          lovCode: 'SITF_FUNCTION_LIBRARY_LOV_FUNCTION',
          lovPara: { tenantId, fieldType: type},
          ignore: FieldIgnore.always,
        },
        {
          name: 'functionCode',
          bind: 'columnTypeLov.functionCode'
        },
        {
          name: 'functionName',
          bind: 'columnTypeLov.functionName'
        },
        {
          name: 'functionId',
          bind: 'columnTypeLov.functionId'
        },
      ],
    });
    const columns = [
      {
        name: 'columnCode',
      },
      {
        name: 'columnName',
      },
      {
        name: 'columnType',
      },
      {
        name: 'valueSource',
        editor: true,
      },
      {
        name: 'valueCodeLov',
        editor: true,
      },
      {
        name: 'valueSourceNode',
      },
    ];
    commonDataDs.loadData(functionLibraryDetailList || [])
    Modal.open({
      title: intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.common.editor').d('编辑函数'),
      style: {width: 800},
      children: (
        <div>
          <Form dataSet={commonLov} columns={2} labelLayout={LabelLayout.float} style={{marginBottom: '12px'}}>
            <Lov name="columnTypeLov" onChange={(value) => handleChangeColumnType(value, commonDataDs)} />
          </Form>
          <Table dataSet={commonDataDs} columns={columns} />
        </div>
      ),
      onOk: async () => {
        const validateFlag = await commonLov.validate() && await commonDataDs.validate();
        let flag = true;
        if(validateFlag) {
          const {tenantId, functionId, functionCode, functionName} = commonLov.current?.toJSONData() || {};
          const lineData = commonDataDs.toJSONData();
          const currentData = {
            functionLibrary: {
              tenantId, functionId, functionCode, functionName
            },
            functionLibraryDetailList: lineData,
          };
          record.set('valueMethodMeansCommonFunctions', currentData);
        } else {
          flag= false;
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
        }
        return flag;
      },
    });
  }, [source]);

  // 排序规则
  const handleSortingRules = useCallback((record) => {
    const {sort} = record.get('valueMethodMeansFirstLine') || {};
    const sortDataDs = new DataSet(sortData(source, record.toData()));
    sortDataDs.loadData([sort]);
    Modal.open({
      title: intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sorting.rules').d('排序规则'),
      style: {width: 600},
      children: (
        <Form dataSet={sortDataDs} columns={2} labelLayout={LabelLayout.float}>
          <Lov name="propertyNameLov" />
          <Output renderer={() => (
            <>
            <Radio name="direction" dataSet={sortDataDs} value="ASC">
            {intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.asc').d('升序')}
          </Radio>
          <Radio name="direction"  dataSet={sortDataDs} value="DESC">
            {intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.desc').d('降序')}
          </Radio>
            </>
          )}/>
          
        </Form>
      ),
      onOk: async () => {
        let flag = true;
        const validateFlag = await sortDataDs.validate();
        if(validateFlag) {
          const currentData = sortDataDs.current?.toJSONData() || {};
          record.set('valueMethodMeansFirstLine', {sort: currentData})
        } else {
          flag= false;
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
        }
        return flag;
      },
    })
  }, [source]);

  const handleMarmotSave = useCallback(async (resole, reject, marmotScriptContent, record) => {
  const currentData = {
    contentInput: marmotScriptContent.inputContent,
    content: marmotScriptContent.scriptContent,
    objectVersionNumber: newObjectVersionNumber,
    ...record.toData(),
  };
   const res = await await fetchObjectSave(id, {tenantId, source: source}, [currentData]);;
   if(getResponse(res)) {
    notification.success({});
    newObjectVersionNumber = res.scriptObjectVersionNumber;
    requestDataDs.query();
   }
  }, [newObjectVersionNumber, id])

  const optionsFilter = (recordP, record) => {
    const {type, valueType} = record.toData() || {};
    const {value} = recordP.toData() || {};
    const flag1 = type === 'OBJECT' && valueType === 'OBJECT_ARRAY';
    const flag2 = type === 'OBJECT_ARRAYOBJECT' && valueType === 'OBJECT';
    if(flag1) {
      return value !== 'one_by_one';
    } else if(flag2) {
      return !(['first_line', 'either_line'].includes(value));
    } else {
      return true
    }
   
  };

  const columns = useMemo((): ColumnProps[] => [
    {
      name: 'code',
      width: 220,
      hideable: false,
      renderer: ({record}) => record?.getState('editing') && source==='RESPONSE_MAPPING' ? <TextField record={record} name="code"/> : <Tooltip title={record?.get('remark')}>{record?.get('code')}</Tooltip>
    },
    {
      name: 'name',
      hideable: false,
      editor: record => record.getState('editing') && source==='RESPONSE_MAPPING',
    },
    {
      name: 'sourceNode',
    },
    {
      name: 'type',
      hideable: false,
      editor: record => record.getState('editing') && source==='RESPONSE_MAPPING',
    },
    {
      name: 'enabledFlag',
      editor: record => record.getState('editing'),
    },
    {
      name: 'valueSource',
      editor: record => record.getState('editing'),
    },
    {
      name: 'valueMethod',
      editor: record => record.getState('editing') && <Select record={record} onChange={(value) => handleChangeMethod(record, value)} name="valueMethod" optionsFilter={(value) => optionsFilter(value, record)}/>,
    },
    {
      name: 'valueCodeLov',
      editor: record => record.getState('editing'),
    },
    {
      name: 'valueMethodMeansLov',
      hideable: false,
      className: 'valueMethodMeansLov',
      renderer: (values) => {
        const {record, value} = values;
        const {valueMethod, sceneCode, id, tenantId, objectCode, source, valueSource, valueType, type, debugTenantNum} = record?.toData() || {};
        const {valueCode, valueSourceNode} = record?.parent?.toData() || {}; 
        const params = {
          valueMethodMeans: value, valueSourceNode, type,
          valueMethod, sceneCode, id, tenantId, objectCode, source, valueSource, valueCode, valueType
        };
        let aDiv = <></>;
        switch(valueMethod) {
          case 'script': aDiv =  <MarmotScriptButton
          name="content"
          record={record}
          scriptCacheKey={record?.get('valueMethodMeans')}
          complementaryWords={complementaryWords}
          scriptContent={record?.get('content')}
          testParam={{debugTenantNum}}
          marmotScriptInput={record?.get('contentInput')}
          beforeOpenModal={() => {
            if(record){
              newObjectVersionNumber = record.get('objectVersionNumber');
            }
          }}
          onClose={() => {
            newObjectVersionNumber = null;
          }}
          buttonName={intl
            .get('scux.externalInterfaceDefinition.view.title.externalInterfaceDefinition.mamort')
            .d('marmot工作台')}
          onSave={(resole, reject, marmotScriptContent) => handleMarmotSave(resole, reject, marmotScriptContent, record)}

          />;break;
          case 'conditional_expression': aDiv = <Button funcType={FuncType.flat} onClick={() => handleConditionalExpression(record, params)}>{intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.conditional.expression').d('条件表达式')}</Button>;break;
          case 'execute_expression': aDiv = <Button funcType={FuncType.flat} onClick={() => handleExecuteExpression(record, params)}>{intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.execute.expression').d('执行表达式')}</Button>;break;
          case 'first_line': aDiv = <Button funcType={FuncType.flat} onClick={() => handleSortingRules(record)}>{intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sorting.rules').d('排序规则')}</Button>;break;
          case 'common_functions': aDiv = <Button funcType={FuncType.flat} onClick={() => handleOpenCommonFunction(record)}>{intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.function.editor').d('函数编辑器')}</Button>;break;
          default: <></>;break;
        }
        return record?.get('valueMethod') === 'lov_idp' && record?.getState('editing') ? <Lov name="valueMethodMeansLov" record={record} validationRenderer={() => <></>} showHelp={ShowHelp.tooltip} /> : aDiv;
      },
    },
    {
      name: 'valueSourceNode',
      hideable: false,
    },
    {
      name: 'valueTypeMeaning',
      hideable: false,
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.optionNew').d('操作'),
      hideable: false,
      hidden: editorType ==='viewRcord',
      lock: ColumnLock.right,
      renderer: ({record}) => (
        <div className='optionNewStyle'>
        {record?.getState('editing') ? <Button funcType={FuncType.flat} onClick={() => handleLineEditor(record)}>{intl.get('scux.externalInterfaceDefinition.model.cancel').d('取消')}</Button> : <Button funcType={FuncType.flat} onClick={() => handleLineEditor(record)}>{intl.get('scux.externalInterfaceDefinition.model.editor').d('编辑')}</Button>}
        {!(['OBJECT', 'OBJECT_ARRAY'].includes(record?.get('type'))) ? <Button funcType={FuncType.flat} onClick={() => handleMoreSetting(record)}>{intl.get('scux.externalInterfaceDefinition.model.more.setting').d('更多设置')}</Button> : <Button funcType={FuncType.flat} onClick={() => handleIntroducingObject(record)}>{intl.get('scux.externalInterfaceDefinition.model.more.introducing.object.variables').d('引入对象变量')}</Button>}
        </div>
      )
    },
    {
      name: 'lastUpdatedBy',
    },
    {
      name: 'lastUpdateDate',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'createdBy',
    },
    {
      name: 'requiredFlag',
      renderer: ({value}) => yesOrNoRender(value),
    },
  ], [source, navKey]);

  // 批量保存
  const handleObjectSave = useCallback(async () => {
    const validateFlag = await requestDataDs.validate();
    if(validateFlag) {
      const currentData = requestDataDs.toJSONData()
      const response = await fetchObjectSave(id, {tenantId, source: source}, currentData);
      const resp = getResponse(response);
      if(resp) {
        notification.success({});
        fetchData(tenantId, navKey);
      }
    } else {
      notification.warning({
        message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
      });
    }
  }, [requestDataDs, navKey, tenantId, source]);

  // 批量编辑
  const handleEditorAll = useCallback(async (type) => {
    setEditorAllFlag(type === 1 ? false : true)
    requestDataDs.forEach(record => {
      if(record.get('uniqueCode') !== navKey) { 
        record.setState('editing', type === 1 ? true : false);
      }
    });
  }, [id, navKey, requestDataDs]);

  // 添加字段
  const handleAddField = useCallback(() => {
    let record;
    requestDataDs.find((item:any) => {
      const uniqueCode = item.get('uniqueCode');
      const flag = uniqueCode === navKey;
      if(flag) {
        record = requestDataDs.create({sourceNode: uniqueCode, tenantId, extItfId: id }, 0);
      }
      return flag;
    })
    record.setState('editing', true);
  }, [navKey, tenantId, id, requestDataDs]);

  // 批量删除
  const handleDelete = useCallback(() => {
    const selestedData = requestDataDs.treeSelected.map(item => item.toData());
    if(isEmpty(selestedData)) {
      notification.warning({
        message: intl.get('scux.externalInterfaceDefinition.message.notNul').d('请勾选数据!')
      });

      return;
    }
    Modal.confirm({
      title: intl.get(`scux.externalInterfaceDefinition.button.delete`).d('删除'),
      children: intl.get('scux.externalInterfaceDefinition.message.confirm.delete').d('确认要删除该字段嘛？'),
      onOk: async () => {
        let flag = false;
        const filterData = selestedData.filter((item: any) => !isEmpty(item.uniqueCode));
        if(!isEmpty(filterData)) {
          const response = await fetchDeleteLine(id, {tenantId, source: 'REQUEST'}, filterData)
          const resp = getResponse(response);
          if(resp) {
            notification.success({});
            fetchData(tenantId, navKey)
            flag = true;
          }
        } else {
          requestDataDs.remove(requestDataDs.treeSelected);
          fetchData(tenantId, navKey)
          flag = true;
        }
        
        return flag;
      }
    });
    
  }, [requestDataDs, navKey, tenantId]);

  const buttons = useMemo(() => [
    <Button icon="playlist_add" hidden={source==='REQUEST_MAPPING'} onClick={handleAddField}>{intl.get(`scux.externalInterfaceDefinition.button.add.field`).d('添加字段')}</Button>,
    <Button icon="delete" hidden={source==='REQUEST_MAPPING'} onClick={handleDelete}>{intl.get(`scux.externalInterfaceDefinition.button.delete`).d('删除')}</Button>,
    <Button icon="save" onClick={handleObjectSave}>{intl.get(`scux.externalInterfaceDefinition.button.editor.save`).d('保存')}</Button>,
    editorAllFlag ? <Button icon="mode_edit" onClick={() => handleEditorAll(1)}>{intl.get(`scux.externalInterfaceDefinition.button.editor.all`).d('批量编辑')}</Button> : (
    <Button icon="mode_edit" onClick={() => handleEditorAll(0)}>{intl.get(`scux.externalInterfaceDefinition.button.editor.cancel`).d('取消')}</Button>      
    ),
  ], [editorAllFlag, navKey, source]);

  return (
    <div className="enterStyle">
      <TreeShow
        treeNavDataDs={requestTreeNavDataDs}
        objectDataDs={requestDataDs}
        handleOnSelect={handleOnSelect}
      />
      <div style={{ paddingLeft: '10px', overflow: 'hidden' }}>
        <FilterBarTable
          key="parameter"
          border={false}
          dataSet={requestDataDs}
          columns={columns}
          filterBarConfig={{
            autoQuery: false,
            collpaseble: true,
            defaultCollpase: true,
          }}
          customizable
          customizedCode='SITF.CUSTOMIZEDCODE.REQUESTMAPPING'
          mode={TableMode.tree}
          defaultRowExpanded={true}
          selectionMode={SelectionMode.treebox}
          style={{ maxHeight: 'calc(100vh - 156px)' }}
          buttons={editorType ==='viewRcord' ? [] : buttons as Buttons[] }
        />
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.commom'],
})(RequestMapping);
