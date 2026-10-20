/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo, useCallback } from 'react';
import { Table, Button, Select, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { deleteTenantLanguage } from '@/services/tenantsService';

function LanguageTable({ maxSize, tableDs }) {
  const handleDelete = useCallback(
    record => {
      if (record.status === 'add') {
        tableDs.delete(record, false);
      } else {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.remove').d('确定删除选择数据？'),
          onOk: async () => {
            const res = await deleteTenantLanguage({ tenantLanguageId: record.get('id') });
            if (getResponse(res)) {
              notification.success();
              tableDs.remove(record, true);
            }
          },
        });
      }
    },
    [tableDs]
  );

  const columns = useMemo(
    () => [
      {
        name: 'lang',
        editor: (record, name) => {
          if (!record || record.status !== 'add') {
            return false;
          }
          return (
            <Select
              record={record}
              name={name}
              clearButton={false}
              optionsFilter={option => {
                if (option && tableDs.records.length > 0) {
                  return (
                    option.get('value') === record.get(name) ||
                    tableDs.every(r => r.get(name) !== option.get('value'))
                  );
                }
                return true;
              }}
            />
          );
        },
      },
      {
        name: "langRequiredFlag",
        editor: true,
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        width: 120,
        renderer: ({ record }) => {
          if (tableDs.length <= 1) {
            return;
          }
          return (
            <Button funcType="link" onClick={() => handleDelete(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          );
        },
      },
    ],
    [tableDs, tableDs.length, handleDelete]
  );

  const tableButtons = useMemo(() => {
    if (tableDs.length >= maxSize) {
      return [];
    } else {
      return ['add'];
    }
  }, [maxSize, tableDs.length]);

  return (
    <Table dataSet={tableDs} columns={columns} buttons={tableButtons} />
  );
}

export default observer(LanguageTable);
