import React from 'react';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
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
// export function showRecordModal({
//   url = '',
//   params = {},
//   fields,
//   columns,
//   queryFields = false,
//   width = 500,
//   title = intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
// }) {
//   const commonCols = [
//     { name: 'operationTime' },
//     { name: 'userName' },
//     { name: 'description' },
//     { name: 'sourceSystemMeaning', tooltip: 'overflow' },
//   ];
//   const commonFields = [
//     { name: 'operationTime', label: intl.get('smodr.common.model.creationDate').d('日期时间') },
//     { name: 'userName', label: intl.get('smodr.common.model.operatorName').d('操作人') },
//     { name: 'description', label: intl.get('smodr.common.model.description').d('内容') },
//     {
//       name: 'sourceSystemMeaning',
//       label: intl.get('smodr.common.model.sourceSystem').d('操作系统'),
//     },
//   ];
//   const tableDs = new DataSet({
//     selection: false,
//     autoQuery: false,
//     queryFields,
//     fields: fields || commonFields,
//     transport: {
//       read({ data }) {
//         return {
//           url,
//           method: 'GET',
//           data: { ...data, ...params },
//         };
//       },
//     },
//   });
//   tableDs.query();
//   const modal = c7nModal({
//     footer: (
//       <Button
//         onClick={() => modal?.close()}
//         style={{ color: '#fff', backgroundColor: '#36C2CF', border: 'none' }}
//       >
//         {intl.get('smodr.common.model.close').d('关闭')}
//       </Button>
//     ),
//     style: { width },
//     afterClose: () => {
//       tableDs.reset();
//     },
//     title,
//     children: <Table dataSet={tableDs} columns={columns || commonCols} />,
//   });
//   return modal;
// }

// export function operateRecord({
//   url = '',
//   params = {},
//   fields,
//   columns,
//   queryFields = false,
//   width = 500,
//   title = intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
// }) {}

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

// 弹窗导入
// export function openImport(
//   { footer, width = 1200, title, afterClose } = {},
//   { args = {}, ...otherProps } = {}
// ) {
//   const importProps = {
//     sync: false,
//     auto: false,
//     prefixPatch: undefined,
//     backPath: undefined,
//     autoRefreshInterval: 5000,
//     action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
//     args: JSON.stringify(args),
//     ...otherProps,
//   };
//   return c7nModal({
//     footer,
//     style: { width },
//     title,
//     afterClose,
//     okCancel: false,
//     children: <CommonImport {...importProps} />,
//   });
// }
