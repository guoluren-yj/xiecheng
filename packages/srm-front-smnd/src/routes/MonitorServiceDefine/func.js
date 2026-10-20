import React, { useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Form, TextField, Select, Table, DataSet, Lov } from 'choerodon-ui/pro';
import { addServiceDefine } from '@/services/monitorService';
import { c7nModal } from '@/routes/util';
import notification from 'utils/notification';
// import RulesForm from './rulesForm';

const ServiceForm = (props) => {
  const { type, ds, data } = props;
  useEffect(() => {
    if (type === 'edit') ds.loadData([data]);
  }, []);

  return (
    <Form labelLayout="float" columns={1} dataSet={ds}>
      <Select name="tenantId" />
      <Select name="enableFlag" />
      <Select name="type" />
      <TextField name="settingCode" />
      <Lov name="blacklistObj" />
      <TextField name="requestService" />
      <TextField name="retentionTime" />
      <TextField name="routingKey" />
      <TextField name="interfaceName" />
      <TextField name="requestModule" />
      <Select name="responseModuleCode" />
      <TextField name="responseService" />
      <TextField name="tableName" />
    </Form>
  );
};

async function handleCreate(dataSet, type, record) {
  if (type === 'add') dataSet.create({});
  return c7nModal({
    title:
      type === 'add'
        ? intl.get(`smnd.monitorDashboard.view.message.addServiceDefine`).d('新建接口服务定义')
        : intl.get(`smnd.monitorDashboard.view.message.editServiceDefine`).d('编辑接口服务定义'),
    children: <ServiceForm type {...record} ds={dataSet} />,
    width: 520,
    onOk: async () => {
      const flag = await dataSet.validate();
      const params = {
        ...dataSet.current.toData(),
      };
      if (flag) {
        const res = await addServiceDefine(params);
        if (getResponse(res)) {
          notification.success();
          dataSet.query();
        }
        return true;
      }
      return false;
    },
    onCancel: () => dataSet.reset(),
    afterClose: () => dataSet.reset(),
  });
}

function CustomModal(props) {
  const customDataSet = () => ({
    selection: false,
    modifiedCheck: false,
    dataToJSON: 'all',
    primaryKey: 'key',
    fields: [
      {
        name: 'key',
        type: 'string',
        label: intl.get(`smnd.monitorDashboard.model.interfaceName`).d('报文字段'),
      },
      {
        name: 'keyMeaning',
        type: 'string',
        label: intl.get(`smnd.monitorDashboard.model.keyMeaning`).d('报文含义'),
      },
      {
        name: 'value',
        type: 'string',
        label: intl.get(`smnd.monitorDashboard.model.value`).d('展示字段'),
      },
    ],
  });
  const customDs = useMemo(() => new DataSet(customDataSet()), []);

  const { dataSource = [], ds, settingId, type } = props;
  useEffect(() => {
    customDs.appendData(dataSource);
  }, []);

  const columns = [
    {
      name: 'key',
      width: 400,
    },
    {
      name: 'keyMeaning',
      width: 100,
      editor: true,
    },
    {
      name: 'value',
      width: 100,
      editor: true,
    },
  ];
  const tableProps = {
    columns,
    dataSet: customDs,
    pagination: false,
  };
  const text =
    type === 'requestMapping'
      ? intl.get(`smnd.monitorDashboard.model.common.requestMapping`).d('请求报文字段映射')
      : intl.get(`smnd.monitorDashboard.model.common.responseMapping`).d('返回报文字段映射');

  const showRecordModal = () => {
    return c7nModal({
      okCancel: true,
      okText: intl.get('hzero.common.button.save').d('保存'),
      style: { width: 742 },
      title: text,
      children: <Table {...tableProps} />,
      onOk: async () => {
        const tableData = ds.toData();
        const mapRef = tableData.filter((i) => i.settingId === settingId)[0];
        for (const key in mapRef) {
          if (key === type) {
            if (type === 'requestMapping') {
              mapRef.requestMapping = customDs.toData();
            } else if (type === 'responseMapping') {
              mapRef.responseMapping = customDs.toData();
            }
          }
        }
        const flag = await customDs.validate();
        if (flag) {
          const res = await addServiceDefine(mapRef);
          if (getResponse(res)) {
            notification.success();
            ds.query();
          }
          return true;
        }
        return false;
      },
    });
  };
  return <a onClick={showRecordModal}>{text}</a>;
}

function ExceptionModal() {
  const text = intl.get(`smnd.monitorDashboard.view.message.exceptionDefinition`).d('异常定义');
  const showRecordModal = () => {
    return c7nModal({
      okCancel: true,
      okText: intl.get('hzero.common.button.save').d('保存'),
      style: { width: 742 },
      title: text,
      // children: <RulesForm />,
    });
  };
  return <a onClick={showRecordModal}>{text}</a>;
}

export { handleCreate, CustomModal, ExceptionModal };
