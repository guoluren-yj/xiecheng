/* eslint-disable react/jsx-filename-extension */
/**
 * @description 交货计划-拆分
 * @export interfaceObjectDefinition
 * @class interfaceObjectDefinition
 * @extends {Component}
 */

import React, { Fragment, useCallback, useMemo } from 'react';
import { DataSet, IntlField, Modal, Spin, Form, TextField, Lov, Switch, Button, Select } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse } from 'hzero-front/lib/utils/utils';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import {ColumnAlign, ColumnLock} from 'choerodon-ui/pro/lib/table/enum';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { tableData, formData, fetchCreate, fetchDelete, fetchEnabled, fetchDisabled } from './initialDataDs';
import OperationRecord from './OperationRecord';


const InterfaceObjectDefinition: React.FC<any> = (props) => {
  const tableDs = useMemo(() => new DataSet(tableData()), []);

  const handleJump = useCallback((record) => {
    props.history.push(`/sitf/interface-object-definition/details/${record.get('objectId')}`);
  }, []);

  const handleEditor = useCallback((type, record) => {
    const formDataDs = new DataSet(formData());
    if(type === 1) {
      console.log(record.toData());
      
      formDataDs.loadData([record.toData()]);
    }
    Modal.open({
      title: type === 1 ? intl.get('scux.interfaceObjectDefinition.model.editor').d('编辑') : intl.get('hzero.common.button.add').d('新建'),
      drawer: true,
      children: (
        <Spin dataSet={formDataDs}>
          <Form dataSet={formDataDs} labelWidth={100}>
            <TextField name="objectCode" disabled={type === 1} />
            <IntlField name="objectName" />
            <Lov name="tenantNameLov" disabled={type === 1} />
            <Lov name="interfaceCodeLov" disabled={type === 1} />
            <TextField name="interfaceName" disabled />
            <Lov name="scriptCodeLov" disabled={type === 1} />
            <Switch name="enabledFlag" disabled={type === 1} />
            <Select name="objectSource" disabled={type === 1} />
            <TextField name="version" disabled={type === 1} />
          </Form>
        </Spin>
      ),
      onOk: async () => {
        const validateFlag = await formDataDs.validate();
        let flag = false;
        if(validateFlag) {
          const currentData = formDataDs.current?.toJSONData() || {};
          const response = await fetchCreate(type === 1 ? 'PUT' : 'POST', currentData);
          const resp = getResponse(response);
          if(resp) {
            notification.success({});
            flag = true;
            tableDs.query();
          }
        } else {
          notification.warning({
            message: intl.get('scux.interfaceObjectDefinition.view.message.notNull').d('请填写必填项!'),
          });
        }
        return flag;
      },
    });
  }, []);

  const handleDelete = useCallback((record) => {
    const id = record.get('objectId');
    Modal.confirm({
      title: intl.get('scux.interfaceObjectDefinition.view.title.delete').d('删除'),
      children: <span>{intl.get('scux.interfaceObjectDefinition.view.message.delete.confirm').d('确定要删除该数据嘛？')}</span>,
      onOk: async () => {
        const response = await fetchDelete(id);
        const resp = getResponse(response);
        if(resp) {
          notification.success({});
          tableDs.query();
        }
      },
    });
  }, []);

  const handleOption = useCallback(async (record) => {
    const {enabledFlag, objectId} = record.get(['enabledFlag', 'objectId']);
    if(enabledFlag) {
      const response = await fetchDisabled(objectId);
      const resp = getResponse(response);
      if(resp) {
        notification.success({});
        tableDs.query();
      }
    } else {
      const response = await fetchEnabled(objectId);
      const resp = getResponse(response);
      if(resp) {
        notification.success({});
        tableDs.query();
      }
    }
  }, []);

  const handleOpenOperation = useCallback((record) => {
    const {tenantId, objectId} = record?.get(['tenantId', 'objectId']) || {};
    Modal.open({
      title: intl.get(`scux.interfaceObjectDefinition.view.title.view.modification.records`).d('查看修改记录'),
      drawer: true,
      style: { width: 800},
      children: <OperationRecord tenantId={tenantId} objectId={objectId} /> 
    });
  }, []);


  const columns = useMemo((): ColumnProps[] => [
    {
      name: 'version',
    },
    {
      name: 'objectCode',
      renderer: ({value, record}) => <a onClick={() => handleJump(record)}>{value}</a>
    },
    {
      name: 'objectName',
    },
    {
      name: 'tenantName',
    },
    {
      name: 'interfaceCode',
    },
    {
      name: 'interfaceName',
    },
    {
      name: 'objectSource',
    },
    {
      name: 'scriptCode',
    },
    {
      header: intl.get('scux.interfaceObjectDefinition.model.option').d('操作记录'),
      renderer: ({record}) => <a onClick={() => handleOpenOperation(record)}>{intl.get('scux.interfaceObjectDefinition.model.option').d('操作记录')}</a>,
    },
    {
      name: 'enabledFlagMeaning',
    },
    {
      header: intl.get('scux.interfaceObjectDefinition.model.operation').d('操作'),
      align: ColumnAlign.center,
      width: 150,
      lock: ColumnLock.right,
      renderer: ({record}) => (
        <>
          <a onClick={() => handleEditor(1, record)}>{intl.get('scux.interfaceObjectDefinition.model.editor').d('编辑')}</a>
          <a onClick={() => handleOption(record)} style={{marginRight: '8px', marginLeft: '8px'}}>{record?.get('enabledFlag') === 1 ? intl.get('scux.interfaceObjectDefinition.model.disabled').d('禁用') : intl.get('scux.interfaceObjectDefinition.model.enabled').d('启用')}</a>
          <a onClick={() => handleDelete(record)}>{intl.get('scux.interfaceObjectDefinition.model.delete').d('删除')}</a>
        </>
      ),
    },
  ], []);

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.interfaceObjectDefinition.view.title.interfaceObjectDefinitionNew`)
          .d('接口对象定义')}
      >
        <Button icon="add" color={ButtonColor.primary} onClick={() => handleEditor(0, {})}>{intl.get('hzero.common.button.add').d('新建')}</Button>
      </Header>
      <Content>
        <FilterBarTable
          key="interfaceObjectDefinition"
          cacheState
          border={false}
          customizable
          customizedCode='SCUX.CUSTOMIZEABLE.SITF.INTERFAXEOBJECTDEFINITION'
          filterBarConfig={{
            cacheKey: 'interfaceObjectDefinition',
          }}
          dataSet={tableDs}
          columns={columns}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.interfaceObjectDefinition', 'hzero.common'],
})(InterfaceObjectDefinition);
