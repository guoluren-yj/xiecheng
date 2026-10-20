import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';

const Index = (props) => {
  const { isEdit, dataSet, dynamicColumns } = props;

  // const AddChildButton = observer((btnProps) => {
  //   const {
  //     // dataSet: { current },
  //     record,
  //   } = btnProps;
  //   return (
  //     <a disabled={!record?.get('bomDetailsLineId')} onClick={() => handleCreate(record)}>
  //       {intl.get('hzero.common.button.newChild').d('新增下级')}
  //     </a>
  //   );
  // });

  const columns = useMemo(
    () =>
      [
        ...dynamicColumns.map((item) => ({ ...item })),
        // isEdit && {
        //   name: 'action',
        //   width: 120,
        //   lock: 'right',
        //   renderer: ({ record }) => <AddChildButton dataSet={dataSet} record={record} />,
        // },
      ].filter((item) => item),
    [isEdit, dynamicColumns]
  );

  const handleCreate = (record) => {
    if (record) {
      record.set({ expand: true });
      dataSet.create({
        parentId: record.get('bomDetailsLineId'),
      });
    } else {
      dataSet.create({}, 0);
    }
  };

  const handleDelete = async () => {
    const selectedRows = dataSet.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    dataSet.remove(newAddRows);
    // 删除线上数据
    const res = await dataSet.delete(existedRows, {
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
    if (getResponse(res)) {
      dataSet.query();
    }
  };

  const TableButtons = observer((btnProps) => {
    const { ds } = btnProps;
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };
    return [
      <Button
        data-name="add"
        icon="playlist_add"
        onClick={() => handleCreate()}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>,
      <Button
        data-name="delete"
        icon="delete_sweep"
        disabled={isEmpty(ds.selected)}
        onClick={handleDelete}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
    ];
  });

  return (
    <Table
      customizable
      customizedCode="SPC.PRICE_BOM_WORKBENCH.DETAIL.TABLE"
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 430 }}
      buttons={isEdit && [<TableButtons ds={dataSet} />]}
      // rowNumber
      // mode="tree"
      filterBarConfig={{
        autoQuery: false,
        collpaseble: true,
      }}
    />
  );
};

export default Index;
