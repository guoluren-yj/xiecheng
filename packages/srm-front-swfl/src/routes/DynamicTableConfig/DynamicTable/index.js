import React, { useMemo, useCallback } from 'react';
import { DataSet, Button, Modal, Form, TextField, Lov, CheckBox } from 'choerodon-ui/pro';

import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { enableTagRender } from 'hzero-front/lib/utils/renderer';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import { tableDS, formDS } from './store';

function DynamicTable() {
  const tableDs = useMemo(() => new DataSet(tableDS()), []);

  const columns = useMemo(() => {
    return [
      { name: 'tenantName' },
      { name: 'dynamicLabel' },
      { name: 'migrateFlag' },
      { name: 'enableFlag', width: 150, renderer: ({ value }) => enableTagRender(value) },
      {
        key: 'action',
        width: 120,
        header: intl.get('hzero.common.button.action').d('操作'),
        renderer: ({ record }) => {
          return [
            <Button funcType="link" onClick={() => handleEdit(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>,
            <Button funcType="link" onClick={() => handleDelete(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
          ];
        },
      },
    ];
  }, [handleEdit, handleDelete]);

  const handleEdit = useCallback((record) => {
    openDrawer({ data: record.toData(), isEdit: true });
  }, []);

  const handleDelete = useCallback(
    async (record) => {
      const res = await tableDs.delete(record, {
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hwfp.dynamicTable.confirm.delete').d('是否删除此条记录？'),
      });
      if (getResponse(res)) {
        tableDs.query();
      }
    },
    [tableDs]
  );

  const handleCreate = useCallback(() => {
    openDrawer({ data: {}, isEdit: false });
  }, [openDrawer]);

  const openDrawer = useCallback(
    ({ data, isEdit }) => {
      const formDs = new DataSet(formDS());
      const record = formDs.create(data);
      Modal.open({
        title: isEdit
          ? intl.get('hzero.common.button.edit').d('编辑')
          : intl.get('hzero.common.create').d('新建'),
        drawer: true,
        style: { width: '380px' },
        children: (
          <Form record={record} labelLayout="float" columns={1}>
            <Lov name="tenantLov" />
            <TextField name="dynamicLabel" />
            <CheckBox name="enableFlag" />
          </Form>
        ),
        onOk: async () => {
          record.status = 'update';
          const flag = await record.validate();
          if (!flag) {
            return false;
          }
          return new Promise((resolve) => {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: isEdit
                ? intl.get('hwfp.dynamicTable.confirm.edit').d('确定修改吗？')
                : intl.get('hwfp.dynamicTable.confirm.save').d('确定保存吗？'),
              onOk: async () => {
                const res = await formDs.submit();
                if (getResponse(res)) {
                  tableDs.query();
                  resolve(true);
                } else {
                  resolve(false);
                }
              },
              onCancel: () => resolve(false),
            });
          });
        },
      });
    },
    [tableDs]
  );

  return (
    <FilterBarTable
      dataSet={tableDs}
      columns={columns}
      filterBarConfig={{
        collpaseble: true,
        collpase: true,
      }}
      buttons={[
        <Button icon="add" color="primary" onClick={handleCreate}>
          {intl.get('hzero.common.create').d('新建')}
        </Button>,
      ]}
    />
  );
}

export default formatterCollections({ code: ['hwfp.dynamicTable', 'entity.tenant'] })(DynamicTable);
