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
    footer: null,
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

export async function confirm({ title, content, onOk = (e) => e, onCancel = (e) => e, footer }) {
  Modal.confirm({
    title: (
      <span style={{ fontSize: 18 }}>
        {title || intl.get('hzero.common.message.confirm.title').d('提示')}
      </span>
    ),
    children: <span style={{ fontSize: 14 }}>{content}</span>,
    footer,
    onOk,
    onCancel,
  });
}
