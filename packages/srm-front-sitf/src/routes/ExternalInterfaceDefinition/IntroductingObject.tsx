import React, { Fragment, useCallback, useMemo, useEffect, useState } from 'react';
import { DataSet, Button, Table, Form, TextField, Lov, Switch, Modal } from 'choerodon-ui/pro';
import { isNil, isEmpty } from 'lodash';
import {observer} from 'mobx-react-lite';
import { Card } from 'choerodon-ui';

import intl from 'hzero-front/lib/utils/intl';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';

import { baseInfoData, fetchDeleteObject, outputData, inputData, fetchInputOuputSave, fetchIntroducingObjectSave } from './initialDataDs';
import './index.less';
import './treeshow.less';

const inputColumns = [
  {
    name: 'code',
  },
  {
    name: 'name',
  },
  {
    name: 'typeMeaning',
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

const outputColumns = [
  {
    name: 'enabledFlag',
    editor: true,
  },
  {
    name: 'code',
  },
  {
    name: 'name',
  },
  {
    name: 'typeMeaning',
  },
];

const IntroductingObject: React.FC<any> = ({dataSource, introducingObjectDataDs}) => {
  const {tenantId, id, extItfId} = dataSource;

  useEffect(() => {
    if(!isNil(tenantId) && !isNil(extItfId) && !isNil(id))
    introducingObjectDataDs.setQueryParameter('tenantId', tenantId);
    introducingObjectDataDs.setQueryParameter('extItfId', extItfId);
    introducingObjectDataDs.setQueryParameter('fieldId', id);
    introducingObjectDataDs.query()
  }, [tenantId, extItfId, id]);

  const handleLineDeleteObject = useCallback(async (type, record) => {
    let currentData;
    if(type === 1) {
      const {selected} = introducingObjectDataDs;
      const selectedData = selected.map(item => item.toData());
      const filterData = selectedData.filter(item => !isNil(item.id));
      if(isEmpty(selectedData)) {
        notification.warning({
          message: intl.get('scux.externalInterfaceDefinition.view.message.notSelected').d('请勾选数据!')
        });
      return;
      }
      if(isEmpty(filterData)) {
        introducingObjectDataDs.remove(selected);
        return;
      } else {
        currentData = filterData.map(item => ({...item, extItfId, tenantId, fieldId: id}));
      }
    } else {
      currentData = [{
        ...record.toData(),
        extItfId,
        tenantId,
        fieldId: id, 
      }];
    }
    const res = await fetchDeleteObject(id, currentData);
    const resp = getResponse(res);
    if(resp) {
      notification.success({});
      introducingObjectDataDs.query();
    }
  }, [extItfId, tenantId, id]);

  
  const handleLineEditorObject = useCallback((record) => {
    if(record.getState('editing')) {
      record.reset();
      record.setState('editing', false);
    } else {
      record.setState('editing', true);
    }
  }, []);

  const handleInputOutput = useCallback((record) => {
    const baseInfoDataDs = new DataSet(baseInfoData(dataSource));
    const outputDataDs = new DataSet(outputData(dataSource));
    const inputDataDs = new DataSet(inputData(dataSource));
    baseInfoDataDs.setQueryParameter('objVariableId', record.get('id'));
    outputDataDs.setQueryParameter('objVariableId', record.get('id'));
    inputDataDs.setQueryParameter('objVariableId', record.get('id'));
    baseInfoDataDs.query();
    outputDataDs.query();
    inputDataDs.query();

    Modal.open({
      title: intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.inpurt.ouput').d('输入输出'),
      drawer: true,
      style: { width: 600 },
      children: (
        <div className="contentStyle">
          <Card>
            <div className="titleTag">
              {intl.get(`scux.externalInterfaceDefinition.view.title.baseInfo`).d('基础信息')}
            </div>
            <Form dataSet={baseInfoDataDs} columns={2} labelLayout={LabelLayout.float}>
              <TextField name="functionCode" disabled />
              <TextField name="functionName" disabled />
              <TextField name="functionTypeMeaning" disabled />
              <TextField name="applyFieldTypesMeaning" disabled />
              <TextField name="remark" disabled colSpan={2} />
            </Form>
          </Card>
          <Card>
            <div className="titleTag">
              {intl.get(`scux.externalInterfaceDefinition.view.title.inPut`).d('输入')}
            </div>
            <Table
              dataSet={inputDataDs}
              columns={inputColumns}
            />
          </Card>
          <Card>
          <div className="titleTag">
            {intl.get(`scux.externalInterfaceDefinition.view.title.outPut`).d('输出')}
          </div>
          <Table
            dataSet={outputDataDs}
            columns={outputColumns}
          />
        </Card>
        </div>
      ),
      onOk: async () => {
        let flag = true;
        const validateFlag = await outputDataDs.validate();
        if(validateFlag) {
          const currentData = [...outputDataDs.toData(), ...inputDataDs.toJSONData()];
          const res = await fetchInputOuputSave(record.get('id'), currentData);
          if(getResponse(res)) {
            notification.success({});
          } else {
            flag = false;
          }
        } else {
          flag = false;
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
        }

        return flag;
      },
    });
    
  }, [dataSource]);
   
    const columns = useMemo((): ColumnProps[] =>[
      {
        name: 'code',
        editor: record => record.getState('editing'),
      },
      {
        name: 'name',
        editor: record => record.getState('editing'),
      },
      {
        name: 'functionCodeLov',
        editor: record => record.getState('editing'),
      },
      {
        header: intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.option').d('操作'),
        width: 150,
        renderer: ({record}) => (
          <div className='optionNewStyle'>
            <Button funcType={FuncType.flat} hidden={isNil(record?.get('id'))} onClick={() => handleLineEditorObject(record)}>{record?.getState('editing') ? intl.get('scux.externalInterfaceDefinition.model.cancel').d('取消') : intl.get('scux.externalInterfaceDefinition.model.editor').d('编辑')}</Button>
            <Button funcType={FuncType.flat} hidden={isNil(record?.get('id'))} onClick={() => handleLineDeleteObject(2, record)}>{intl.get('scux.externalInterfaceDefinition.model.delete').d('删除')}</Button>
            <Button funcType={FuncType.flat} hidden={isNil(record?.get('id'))} onClick={() => handleInputOutput(record)}>{intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.inpurt.ouput').d('输入输出')}</Button>
          </div>
        ),
      },
    ], []);

  useEffect(() => {
    if(id) {
      introducingObjectDataDs.setQueryParameter('fieldId', id);
      introducingObjectDataDs.query();
    }
  }, [id]);

  const handleAdd = useCallback(() => {
    const record = introducingObjectDataDs.create({} ,0);
    record.setState('editing', true);
  }, []);

  const handleSave = useCallback(async () => {
    const validateFlag = await introducingObjectDataDs.validate();
        if(validateFlag) {
          const currentData = introducingObjectDataDs.toJSONData() || [];
          const data = currentData.map(item => ({...item, tenantId, extItfId, fieldId: id}))
          const res = await fetchIntroducingObjectSave(id, data);
          if(getResponse(res)) {
            notification.success({});
            introducingObjectDataDs.query();
          }
        } else {
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
        }
  }, []);

  const buttonsObject = [
    <Button icon="add" funcType={FuncType.flat} onClick={handleAdd}>{intl.get('hzero.common.button.add').d('新增')}</Button>,
    <Button icon="delete" funcType={FuncType.flat} onClick={() => handleLineDeleteObject(1, {})}>{intl.get('hzero.common.button.delete').d('删除')}</Button>,
    <Button icon="save" funcType={FuncType.flat} onClick={handleSave}>{intl.get('hzero.common.button.save').d('保存')}</Button>
  ];

  return (
    <Fragment>
      <Table dataSet={introducingObjectDataDs} columns={columns} buttons={buttonsObject as Buttons[]} />
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.common'],
})(IntroductingObject);
