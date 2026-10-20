import React from 'react';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';

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
    {
      name: 'remark',
      tooltip: 'overflow',
      renderer: ({ value, record }) => record.get('remarkMeaning') || value,
    },
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
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    style: { width },
    afterClose: () => {
      tableDs.reset();
    },
    title,
    children: <Table dataSet={tableDs} columns={columns || commonCols} />,
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
  const buttonsList = buttons.map(btnProps => <Item dataSet={tableDs} item={btnProps} />);
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

// 协议操作记录弹窗
export function agmRecordModal({ url = '', params = {}, width = 700 }, type = 'PUR') {
  const purColumns = [
    { name: 'realName' },
    { name: 'operatedTime' },
    { name: 'operationCodeMeaning' },
    {
      name: 'operatedRemark',
      tooltip: 'overflow',
      renderer: ({ value, record }) => record.get('operatedRemarkMeaning') || value,
    },
  ];
  const purFields = [
    { name: 'realName', label: intl.get('small.common.view.operateName').d('操作人') },
    { name: 'operatedTime', label: intl.get('small.common.view.operateTime').d('操作时间') },
    { name: 'operationCodeMeaning', label: intl.get('hzero.common.action').d('操作') },
    { name: 'operatedRemark', label: intl.get('small.common.view.description').d('描述') },
  ];
  const saleColumns = [
    { name: 'operateByName' },
    { name: 'operateDate' },
    { name: 'actionMeaning' },
    {
      name: 'remark',
      tooltip: 'overflow',
      renderer: ({ value, record }) => record.get('remarkMeaning') || value,
    },
  ];
  const saleFields = [
    { name: 'operateByName', label: intl.get('sagm.common.view.operateName').d('操作人') },
    { name: 'operateDate', label: intl.get('sagm.common.view.operateTime').d('操作时间') },
    { name: 'actionMeaning', label: intl.get('hzero.common.action').d('操作') },
    { name: 'remark', label: intl.get('sagm.common.view.description').d('描述') },
  ];
  const agmMap = {
    PUR: { columns: purColumns, fields: purFields, prefix: '/sagm' },
    SALE: { columns: saleColumns, fields: saleFields, prefix: '/sagm' },
  };
  const { columns = [], fields = [], prefix = '/sagm' } = agmMap[type] || {};
  return showRecordModal({
    params,
    width,
    fields,
    columns,
    url: `${prefix}/${url}`,
  });
}

// 弹窗导入
export function openImport(
  { footer, width = 1200, title, afterClose } = {},
  { args = {}, ...otherProps } = {}
) {
  const importProps = {
    sync: false,
    auto: false,
    historyButton: 'true',
    refreshButton: 'true',
    dataImportButton: 'true',
    prefixPatch: undefined,
    backPath: undefined,
    autoRefreshInterval: 5000,
    action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
    args: JSON.stringify(args),
    ...otherProps,
  };
  return c7nModal({
    footer,
    style: { width },
    title,
    afterClose,
    okCancel: false,
    children: <CommonImport {...importProps} />,
  });
}

export function openList({ columns = [], title, data, width = 380 }) {
  const ds = new DataSet({ paging: false, data, selection: false });
  const _columns = columns.map(m => ({ name: m.dataIndex, header: m.title, ...m }));
  return c7nModal({
    title,
    style: { width },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <Table dataSet={ds} columns={_columns} />,
  });
}

export function confirm({ title = intl.get('hzero.common.message.confirm.title').d('提示'), content, onOk = e => e, onCancel = e => e, ...otherProps }) {
  Modal.confirm({
    title: <span>{title}</span>,
    children: <span>{content}</span>,
    onOk,
    onCancel,
    ...otherProps,
  });
}

export function openSelectList({ code, data, title }) {
  const values = data.map(value => ({ value }));
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
