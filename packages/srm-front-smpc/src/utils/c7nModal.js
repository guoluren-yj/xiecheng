import React from 'react';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import CommonImport from 'hzero-front-himp/lib/components/CommonImport';

// 封装通用c7nModal
export default function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

// c7n通用弹窗
export function showRecordModal({
  url = '',
  params = {},
  fields,
  columns,
  queryFields = false,
  width = 500,
  title = intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
}) {
  const commonCols = [
    { name: 'operateByName' },
    { name: 'operateDate' },
    { name: 'actionMeaning' },
    { name: 'remark', tooltip: 'overflow' },
  ];
  const commonFields = [
    { name: 'operateByName', label: intl.get('sagm.common.view.operateName').d('操作人') },
    { name: 'operateDate', label: intl.get('sagm.common.view.operateTime').d('操作时间') },
    { name: 'actionMeaning', label: intl.get('hzero.common.action').d('操作') },
    { name: 'remark', label: intl.get('sagm.common.view.description').d('描述') },
  ];
  const tableDs = new DataSet({
    selection: false,
    autoQuery: false,
    pageSize: 20,
    queryFields,
    fields: fields || commonFields,
    transport: {
      read({ data }) {
        return {
          url,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  });
  tableDs.query();
  return c7nModal({
    // footer: null,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    style: { width },
    afterClose: () => {
      tableDs.reset();
    },
    title,
    children: (
      <Table
        dataSet={tableDs}
        columns={columns || commonCols}
        customizedCode="COMMON.RECORD.LIST"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    ),
  });
}

// c7n通用可勾选表格弹窗
export function showSelectionModal({
  url = '',
  params = {},
  fields = [],
  buttons = [],
  columns = [],
  queryFields = false,
  width = 500,
  title = '',
  events = {},
  paging = true,
}) {
  const tableDs = new DataSet({
    autoQuery: true,
    queryFields,
    paging,
    fields,
    events,
    transport: {
      read({ data }) {
        return {
          url,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  });
  const Item = observer(({ item = {}, dataSet }) => {
    return (
      <Button
        funcType="flat"
        color="primary"
        onClick={() => (isFunction(item.handleWay) ? item.handleWay(dataSet) : null)}
        disabled={item.selectedFlag && dataSet.selected.length === 0}
      >
        {item.label}
      </Button>
    );
  });
  const buttonsList = buttons.map((btnProps) => <Item dataSet={tableDs} item={btnProps} />);
  return c7nModal({
    footer: null,
    style: { width },
    afterClose: () => {
      tableDs.reset();
    },
    title,
    drawer: false,
    children: <Table buttons={buttonsList} dataSet={tableDs} columns={columns} />,
  });
}

export function openList({ columns = [], title, data, width = 380 }) {
  const ds = new DataSet({ paging: false, data, selection: false });
  const _columns = columns.map((m) => ({ name: m.dataIndex, header: m.title, ...m }));
  return c7nModal({
    title,
    style: { width },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: (
      <Table
        dataSet={ds}
        columns={_columns}
        customizedCode="READONLY.DRAWER.LIST"
        style={{ maxHeight: `calc(100vh - 160px)` }}
      />
    ),
  });
}

export function openSelectList({ code, data, title }) {
  const values = data.map((value) => ({ value }));
  const ds = new DataSet({
    paging: false,
    data: values,
    selection: false,
    fields: [{ name: 'value', label: title, lookupCode: code }],
  });
  const columns = [{ name: 'value' }];
  return c7nModal({
    title,
    style: { width: 380 },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <Table dataSet={ds} columns={columns} border={false} />,
  });
}
