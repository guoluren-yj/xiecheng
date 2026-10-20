/* eslint-disable react/jsx-filename-extension */
/**
 * @description 外部接口定义
 * @export ExternalInterfaceDefinition
 * @class ExternalInterfaceDefinition
 * @extends {Component}
 */

import React, { Fragment, useCallback, useMemo } from 'react';
import { stringify } from 'querystring';
import { DataSet, IntlField, Modal, Spin, Form, TextField, Lov, Button, Select, Table } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse } from 'hzero-front/lib/utils/utils';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import {ColumnAlign, ColumnLock} from 'choerodon-ui/pro/lib/table/enum';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { tableData, formData, recordsView, fetchCreate, fetchDelete, fetchEnabled, fetchDisabled } from './initialDataDs';
import OperationRecord from './OperationRecord';


const ExternalInterfaceDefinition: React.FC<any> = (props) => {
  const tableDs = useMemo(() => new DataSet(tableData()), []);

  const handleJump = useCallback((record) => {
    props.history.push(`/sitf/external-interface-definition/details/${record.get('id')}`);
  }, []);

  // 新建 -  编辑
  const handleEditor = useCallback((type, record) => {
    const formDataDs = new DataSet(formData());
    if(type === 1) {
      formDataDs.loadData([record.toData()]);
    }
    Modal.open({
      title: type === 1 ? intl.get('scux.externalInterfaceDefinition.model.editor').d('编辑') : intl.get('hzero.common.button.add').d('新建'),
      drawer: true,
      children: (
        <Spin dataSet={formDataDs}>
          <Form dataSet={formDataDs} labelWidth={100}>
            <Select name="releaseStatus" disabled />
            <TextField name="code" disabled={type === 1} />
            <IntlField name="name" />
            <Lov name="tenantIdLov" disabled={type === 1} />
            <Lov name="interfaceCodeLov" />
            <TextField name="interfaceName" disabled />
            <Lov name="objectCodeLov" disabled={type === 1} />
            <Select name="enabledFlag" disabled={type === 1} />
            <TextField name="version" disabled={type === 1} />
            <TextField name="externalSystem" />
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
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!'),
          });
        }
        return flag;
      },
    });
  }, []);

  // 行删除
  const handleDelete = useCallback((record) => {
    const currentData = record.toData();
    Modal.confirm({
      title: intl.get('scux.externalInterfaceDefinition.view.title.delete').d('删除'),
      children: <span>{intl.get('scux.externalInterfaceDefinition.view.message.delete.confirm').d('确定要删除该数据嘛？')}</span>,
      onOk: async () => {
        const response = await fetchDelete(currentData);
        const resp = getResponse(response);
        if(resp) {
          notification.success({});
          tableDs.query();
        }
      },
    });
  }, []);

  // 禁用 - 启用
  const handleOption = useCallback(async (record) => {
    const {id, tenantId} = record.get(['id', 'tenantId']);
    if(id) {
      const response = await fetchDisabled(id, tenantId);
      const resp = getResponse(response);
      if(resp) {
        notification.success({});
        tableDs.query();
      }
    } else {
      const response = await fetchEnabled(id, tenantId);
      const resp = getResponse(response);
      if(resp) {
        notification.success({});
        tableDs.query();
      }
    }
  }, []);

  const handleDetailsDesign = useCallback((record, type) => {
    const {tenantId, constantsUniqueCode, objectCode, name} = record.get(['tenantId', 'constantsUniqueCode', 'objectCode', 'name']);
    props.history.push({
      pathname: `/sitf/external-interface-definition/details-desigin/${record.get('id')}`,
      search: stringify({
        tenantId,
        objectCode,
        editorType: type,
      }),
      state: {
        constantsUniqueCode,
        name,
      },
    });
  }, []);

  const handleOpenModifyingRecords = useCallback((record) => {
    Modal.open({
      title: intl.get(`scux.externalInterfaceDefinition.view.title.view.modification.records`).d('查看修改记录'),
      drawer: true,
      style: { width: 800},
      children: <OperationRecord record={record} history={props.history} />,
    });
  }, []);

  const handleRecordsView = useCallback((recordP) => {
    const recordsViewDs = new DataSet(recordsView());
    recordsViewDs.setQueryParameter('extItfId', recordP.get('id'));
    recordsViewDs.setQueryParameter('tenantId', recordP.get('tenantId'));
    recordsViewDs.query();
    const recordsColumns: ColumnProps[] = [
      {
        name: 'version',
        width: 80,
        renderer: ({value, record}) => <a onClick={() => handleDetailsDesign(record, 'viewRcord')}>{value}</a>,
      },
      {
        name: 'creationDate',
        width: 130,
      },
      {
        name: 'remark',
      },
    ];
    Modal.open({
      title: intl.get('scux.externalInterfaceDefinition.model.version.records.view').d('查看版本记录'),
      style: {width: 600},
      children: <Table dataSet={recordsViewDs} columns={recordsColumns} />,
    });
  }, []);


  const columns = useMemo((): ColumnProps[] => [
    {
      name: 'releaseStatus',
    },
    {
      name: 'version',
    },
    {
      name: 'code',
      renderer: ({value, record}) => <a onClick={() => handleJump(record)}>{value}</a>,
    },
    {
      name: 'name',
    },
    {
      name: 'externalSystem',
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
      name: 'objectName',
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.version.records').d('版本记录'),
      align: ColumnAlign.center,
      renderer: ({record}) => <a onClick={() => handleRecordsView(record)}>{intl.get('scux.externalInterfaceDefinition.model.version.records.view').d('查看版本记录')}</a>,
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.modifying.records').d('修改记录'),
      align: ColumnAlign.center,
      renderer: ({record}) => <a onClick={() => handleOpenModifyingRecords(record)}>{intl.get('scux.externalInterfaceDefinition.model.modifying.records.view').d('查看修改记录')}</a>,
    },
    {
      name: 'enabledFlag',
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.operation').d('操作'),
      width: 180,
      lock: ColumnLock.right,
      renderer: ({record}) => (
        <>
          <a onClick={() => handleEditor(1, record)} style={{marginRight: '8px'}}>{intl.get('scux.externalInterfaceDefinition.model.editor').d('编辑')}</a>
          <a onClick={() => handleDetailsDesign(record, 'editor')}>{intl.get('scux.externalInterfaceDefinition.model.detailed.design').d('详细设计')}</a>
          <a onClick={() => handleOption(record)} style={{marginRight: '8px', marginLeft: '8px'}}>{[1, '1'].includes(record?.get('enabledFlag')) ? intl.get('scux.externalInterfaceDefinition.model.disabled').d('禁用') : intl.get('scux.externalInterfaceDefinition.model.enabled').d('启用')}</a>
          {record?.get('releaseStatus') === 'UNPUBLISHED' && <a onClick={() => handleDelete(record)}>{intl.get('scux.externalInterfaceDefinition.model.delete').d('删除')}</a>}
        </>
      ),
    },
  ], []);

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.externalInterfaceDefinition.view.title.externalInterfaceDefinition`)
          .d('外部接口定义')}
      >
        <Button icon="add" color={ButtonColor.primary} onClick={() => handleEditor(0, {})}>{intl.get('hzero.common.button.add').d('新建')}</Button>
      </Header>
      <Content>
        <FilterBarTable
          key="externalInterfaceDefinition"
          cacheState
          border={false}
          customizable
          customizedCode='SCUX.CUSTOMIZEABLE.SITF.EXTERNALINTERFACEFINITION'
          filterBarConfig={{
            cacheKey: 'externalInterfaceDefinition',
          }}
          dataSet={tableDs}
          columns={columns}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.common'],
})(ExternalInterfaceDefinition);
