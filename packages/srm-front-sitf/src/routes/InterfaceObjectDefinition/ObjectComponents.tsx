import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { DataSet, Button, Modal, TextField, TextArea, Form, CodeArea, Upload  } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { isNil, isEmpty } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { SRM_ADAPTOR } from 'srm-front-boot/lib/utils/config';
// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { getResponse, getAccessToken } from 'hzero-front/lib/utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import notification from 'utils/notification';
import {ColumnAlign, SelectionMode, TableMode, ColumnLock} from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import {downloadFileByAxios } from 'services/api';
import { API_HOST } from 'utils/config';

import { objectData, treeNavData, fetchObjectDisabled, fetchObjectEnabled, fetchObjectDelete, fetchDeleteLine, fetchObjectSave, fetchImportJson, fetchViewJson } from './initialDataDs';
import TreeShow from './TreeShow';
import './treeshow.less';

const ObjectComponents = props => {
  const { formDataDs, id } = props;
  const {tenantId, objectId } = formDataDs.current?.toData() || {}; 
  const [navKey, setNavKey] = useState('');
  const [editorAllFlag, setEditorAllFlag] = useState(true);
  const [uploadLoading, handleUploadLoading] = useState(false);
  const [fieldsNameKey, setFieldsNameKey] = useState([]);
  const objectDataDs = useMemo(() => new DataSet(objectData()), []);
  const treeNavDataDs = useMemo(() => new DataSet(treeNavData()), []);

  useEffect(() => {
    if(id) {
      fetchNavData()
    }
    
  }, [id]);

  const fetchNavData = () => {
    treeNavDataDs.setQueryParameter('id', id);
    treeNavDataDs.setQueryParameter('tenantId', tenantId);
    treeNavDataDs.setQueryParameter('fieldSource', 'REQUEST');
    treeNavDataDs.query().then(res => {
      if (getResponse(res)) {
        // 设置导航栏默认值
        treeNavDataDs.find(record => {
          const fieldUniqueCode = record.get('fieldUniqueCode');
          const falg = fieldUniqueCode === res[0].fieldUniqueCode;
          if (falg) {
            treeNavDataDs.select(record);
            handleOnSelect('', {
              selectedNodes: [{ record }],
            });
          }
          return falg;
        });
      }
    });
  };
 

  const fetchData = (tenantId, fieldUniqueCodeProps) => {
    if (!isNil(id) && !isNil(tenantId) && !isNil(fieldUniqueCodeProps)) {
      objectDataDs.setQueryParameter('id', id);
      objectDataDs.setQueryParameter('tenantId', tenantId);
      objectDataDs.setQueryParameter('fieldSource', 'REQUEST');
      objectDataDs.setQueryParameter('sourceNode', fieldUniqueCodeProps);
      objectDataDs.query().then(res => {
        if (getResponse(res)) {
          objectDataDs.find(record => {
            const fieldUniqueCode = record.get('fieldUniqueCode');
            const falg = fieldUniqueCode === fieldUniqueCodeProps;
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
      const { fieldUniqueCode } = record.toData() || {};
      setFieldsNameKey(selectedKeys);
      setNavKey(fieldUniqueCode);
      fetchData(tenantId, fieldUniqueCode)
    },
    [navKey, tenantId]
  );

  // 字段行编辑，取消
  const handleLineEditor = useCallback((record) => {
    record.setState('editing', !record.getState('editing'))
  }, []);

  // 字段启用，禁用
  const handleLineDisabled = useCallback(async (record) => {
    const enabledFlag = [1, '1'].includes(record?.get('enabledFlag'));
    const currentData = record.toData();
    objectDataDs.setQueryParameter('fieldSource', 'REQUEST');
    const response = enabledFlag ? await fetchObjectDisabled(id, {tenantId, fieldSource: 'REQUEST'}, [currentData]) : await fetchObjectEnabled(id, {tenantId, fieldSource: 'REQUEST'}, [currentData]);
    const resp = getResponse(response);
    if(resp) {
      notification.success({});
      fetchData(tenantId, navKey);
    }
  }, [id, navKey, tenantId]);

  // 入参对象 - 行字段删除
  const handleLineDelete = useCallback((record) => {
    Modal.confirm({
      title: intl.get('scux.interfaceObjectDefinition.model.delete').d('删除'),
      children: intl.get('scux.interfaceObjectDefinition.view.message.current.fields').d('确认删除该字段?'),
      onOk: async () => {
        // 判断左侧导航树是否刷新
        const flag = ['OBJECT_ARRAY', 'OBJECT'].includes(record.get('record'));
        const response = await fetchObjectDelete(id, {tenantId, fieldSource: 'REQUEST'}, record.toData())
        const resp = getResponse(response);
        if(resp) {
          notification.success({});
          if(flag) {
            treeNavDataDs.query().then(res => {
              if(getResponse(res)) {
                treeNavDataDs.find(record => {
                  const fieldUniqueCode = record.get('fieldUniqueCode');
                  const falg = fieldUniqueCode === fieldsNameKey;
                  if (falg) {
                    treeNavDataDs.select(record);
                    handleOnSelect('', {
                      selectedNodes: [{record}],
                    });
                  }
                  return falg;
                });
              }
            });
          } else {
            fetchData(tenantId, navKey)
          }
        }
      },
    });
  }, [id, fieldsNameKey, navKey, tenantId]);

  // 添加字段说明
  const handleAddFieldInfo = useCallback((record) => {
    const fieldsInfoDataDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'remarkText',
          type: FieldType.string,
          label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.remark`).d('字段说明'),
        },
      ],
    });
    fieldsInfoDataDs.current?.set('remarkText', record.get('remark'))
    Modal.open({
      title: intl.get('scux.interfaceObjectDefinition.model.add.fields.info').d('添加字段说明'),
      children: (
        <Form dataSet={fieldsInfoDataDs} labelLayout={LabelLayout.float}>
          <TextArea name="remarkText"/>
        </Form>
      ),
      onOk: () => {
        record.set('remark', fieldsInfoDataDs.current?.get('remarkText'));
      },
    });
  }, []);

  const columns = useMemo((): ColumnProps[] => [
    {
      name: 'fieldCode',
      width: 220,
      renderer: ({record}) => record?.getState('editing') ? <TextField record={record} name="fieldCode"/> : <Tooltip title={record?.get('remark')}>{record?.get('fieldCode')}</Tooltip>
    },
    {
      name: 'fieldName',
      editor: record => record.getState('editing'),
    },
    {
      name: 'sourceNode',
    },
    {
      name: 'fieldType',
      editor: record => record.getState('editing'),
    },
    {
      name: 'enabledFlag',
      editor: record => record.getState('editing'),
    },
    {
      header: intl.get('scux.interfaceObjectDefinition.model.optionNew').d('操作'),
      width: 200,
      align: ColumnAlign.center,
      lock: ColumnLock.right,
      renderer: ({record}) => record?.get('fieldUniqueCode') && record?.get('fieldUniqueCode') !== navKey &&(
        <div className='optionNewStyle'>
        {record?.getState('editing') ? <Button funcType={FuncType.flat} onClick={() => handleLineEditor(record)}>{intl.get('scux.interfaceObjectDefinition.model.cancel').d('取消')}</Button> : <Button funcType={FuncType.flat} onClick={() => handleLineEditor(record)}>{intl.get('scux.interfaceObjectDefinition.model.editor').d('编辑')}</Button>}
        <Button funcType={FuncType.flat} onClick={() => handleAddFieldInfo(record)}>{intl.get('scux.interfaceObjectDefinition.model.add.fields.info').d('添加字段说明')}</Button>
        {[1, '1'].includes(record?.get('enabledFlag')) ? <Button funcType={FuncType.flat} onClick={() => handleLineDisabled(record)}>{intl.get('scux.interfaceObjectDefinition.model.disabled').d('禁用')}</Button> : <Button funcType={FuncType.flat} onClick={() => handleLineDisabled(record)}>{intl.get('scux.interfaceObjectDefinition.model.enable').d('启用')}</Button>}
        <Button funcType={FuncType.flat} onClick={() => handleLineDelete(record)}>{intl.get('scux.interfaceObjectDefinition.model.delete').d('删除')}</Button>
        </div>
      )
    },
  ], [navKey]);

  // 添加字段
  const handleAddField = useCallback(() => {
    let record;
    objectDataDs.find((item:any) => {
      const fieldUniqueCode = item.get('fieldUniqueCode');
      const flag = fieldUniqueCode === navKey;
      if(flag) {
        record = objectDataDs.create({sourceNode: fieldUniqueCode}, 0);
      }
      return flag;
    })
    record.setState('editing', true);
  }, [navKey]);

  // 批量删除
  const handleDelete = useCallback(() => {
    const selestedData = objectDataDs.treeSelected.map(item => item.toData());
    if(isEmpty(selestedData)) {
      notification.warning({
        message: intl.get('scux.interfaceObjectDefinition.message.notNul').d('请勾选数据!')
      });

      return;
    }
    Modal.confirm({
      title: intl.get(`scux.interfaceObjectDefinition.button.delete`).d('删除'),
      children: intl.get('scux.interfaceObjectDefinition.message.confirm.delete').d('确认要删除该字段嘛？'),
      onOk: async () => {
        let flag = false;
        const filterData = selestedData.filter((item: any) => !isEmpty(item.fieldUniqueCode));
        if(!isEmpty(filterData)) {
          const response = await fetchDeleteLine(id, {tenantId, fieldSource: 'REQUEST'}, filterData)
          const resp = getResponse(response);
          if(resp) {
            notification.success({});
            fetchData(tenantId, navKey)
            flag = true;
          }
        } else {
          objectDataDs.remove(objectDataDs.treeSelected);
          fetchData(tenantId, navKey)
          flag = true;
        }
        
        return flag;
      }
    });
    
  }, [objectDataDs, navKey, tenantId]);

  // 批量保存
  const handleObjectSave = useCallback(async () => {
    const validateFlag = await objectDataDs.validate();
    if(validateFlag) {
      const currentData = objectDataDs.toJSONData()
      const response = await fetchObjectSave(id, {tenantId, fieldSource: 'REQUEST'}, currentData);
      const resp = getResponse(response);
      if(resp) {
        notification.success({});
        fetchData(tenantId, navKey);
      }
    } else {
      notification.warning({
        message: intl.get('scux.interfaceObjectDefinition.view.message.notNull').d('请填写必填项!')
      });
    }
  }, [objectDataDs, navKey, tenantId]);

  // 批量编辑
  const handleEditorAll = useCallback(async (type) => {
    setEditorAllFlag(type === 1 ? false : true)
    objectDataDs.forEach(record => {
      if(record.get('fieldUniqueCode') !== navKey) {
        record.setState('editing', type === 1 ? true : false);
      }
    });
  }, [id, navKey, objectDataDs]);

  // 导入JSON
  const handleImportJson = useCallback(() => {
    const jsonDataDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'json',
          type: FieldType.string,
          required: true,
        }
      ],
    });
    Modal.open({
      title: intl.get(`scux.interfaceObjectDefinition.button.import.json`).d('JSON快捷导入'),
      drawer: true,
      children: (
        <CodeArea dataSet={jsonDataDs} name="json" style={{height: 'calc(100vh - 130px)'}} />
      ),
      onOk: async () => {
        const validateFlag = await jsonDataDs.validate();
        let flag = false;
        if(validateFlag) {
          const jsonData = jsonDataDs.current?.get('json');
          const response = await fetchImportJson(id, {tenantId, fieldSource: 'REQUEST'}, jsonData);
          const resp = getResponse(response);
          if(resp) {
            notification.success({});
            flag = true;
            fetchNavData();
          }
        } else {
          notification.warning({
            message: intl.get('scux.interfaceObjectDefinition.view.message.notNull').d('请填写必填项!')
          });
        }
        return flag;
      },
    });
  }, [formDataDs, tenantId]);

  // 预览Json
  const handleViewJson = useCallback(async () => {
    const response = await fetchViewJson(id, {tenantId, fieldSource: 'REQUEST'});
    const resp = getResponse(response);
    if(resp) {
      const content = JSON.stringify(resp);
      Modal.info({
        title: intl.get(`scux.interfaceObjectDefinition.button.view.json`).d('预览Json'),
        children: (
          <CodeArea formatter={JSONFormatter} value={content} style={{height: 'calc(100vh - 130px)', width: '470px'}} options={{mode: { name: 'javascript', json: true }}} />
        ),
        drawer: true,
        style: {widht: 800},
      });
    }
  }, [tenantId]);

  const handleUploadChange = ({ file }) => {
    const { status, response } = file;
    handleUploadLoading(status === 'uploading');
    if (status === 'done' && !response.failed) {
      notification.success({
        message: intl.get('hzero.common.upload.status.success').d('上传成功'),
      });
      fetchNavData();
    } else if (status === 'done' && response.failed) {
      notification.error({ message: response.message });
    } else if (status === 'error') {
      notification.error({});
    }
  };

  // 数据导出
  const exportTemplateData = useCallback(() => {
    const selestedData = objectDataDs.treeSelected.map(item => item.toData());
    const exportData = objectDataDs.toData() || [];
    console.log(selestedData, exportData.length);
    
    if (selestedData.length === 0 && exportData.length === 0) {
      notification.warning({
        description: intl
          .get('spfm.relTableAccess.view.message.noExportData')
          .d('当前无数据可导出'),
      });
    } else {
      const api = `${API_HOST}/sifc/v1/object-field-infos/${objectId}/export`;
      downloadFileByAxios({
        requestUrl: api,
        method: 'POST',
        queryParams: [
          {name: 'tenantId', value: tenantId},
          {name: 'fieldSource', value: 'REQUEST'},
        ],
        queryData: selestedData,
      });
    }
  }, [objectDataDs, tenantId, objectId]);

  const buttons = useMemo(() => [
    <Button icon="playlist_add" onClick={handleAddField}>{intl.get(`scux.interfaceObjectDefinition.button.add.field`).d('添加字段')}</Button>,
    <Button icon="delete" onClick={handleDelete}>{intl.get(`scux.interfaceObjectDefinition.button.delete`).d('删除')}</Button>,
    <Button icon="save" onClick={handleObjectSave}>{intl.get(`scux.interfaceObjectDefinition.button.editor.save`).d('保存')}</Button>,
    editorAllFlag ? <Button icon="mode_edit" onClick={() => handleEditorAll(1)}>{intl.get(`scux.interfaceObjectDefinition.button.editor.all`).d('批量编辑')}</Button> : (
        <Button icon="mode_edit" onClick={() => handleEditorAll(0)}>{intl.get(`scux.interfaceObjectDefinition.button.editor.cancel`).d('取消')}</Button>      
    ),
    <Button icon="export" onClick={exportTemplateData}>{intl.get(`scux.interfaceObjectDefinition.button.export.data`).d('数据导出')}</Button>,
    <div className='buttonsUploadStyle'>
      <Upload
      headers={{
        Authorization: `bearer ${getAccessToken()}`,
      }}
      accept={['.xls', '.xlsx']}
      name="excel"
      action={`${API_HOST}/sifc/v1/object-field-infos/${objectId}/import?tenantId=${tenantId}&fieldSource=REQUEST`}
      onChange={handleUploadChange}
      showUploadList={false}
    >
      <Button icon="cloud_download" loading={uploadLoading} funcType={FuncType.flat}>{intl.get(`scux.interfaceObjectDefinition.button.import.data`).d('数据导入')}</Button>
    </Upload>
    </div>,
    <Button icon="import_export" onClick={handleImportJson}>{intl.get(`scux.interfaceObjectDefinition.button.import.json`).d('Json快捷导入')}</Button>,
    <Button icon="pageview" onClick={handleViewJson}>{intl.get(`scux.interfaceObjectDefinition.button.view.json`).d('预览Json')}</Button>,
  ], [editorAllFlag, navKey]);

  return (
    <div className="enterStyle">
      <TreeShow
        treeNavDataDs={treeNavDataDs}
        objectDataDs={objectDataDs}
        handleOnSelect={handleOnSelect}
      />
      <div style={{ paddingLeft: '10px', overflow: 'hidden' }}>
        <FilterBarTable
          key="parameter"
          border={false}
          dataSet={objectDataDs}
          columns={columns}
          filterBarConfig={{
            autoQuery: false,
            collpaseble: true,
            defaultCollpase: true,
          }}
          mode={TableMode.tree}
          defaultRowExpanded={true}
          selectionMode={SelectionMode.treebox}
          style={{ maxHeight: 'calc(100vh - 156px)' }}
          buttons={ buttons as Buttons[] }
        />
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['scux.interfaceObjectDefinition', 'hzero.common'],
})(ObjectComponents);
