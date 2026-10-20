import React, { useMemo, useEffect } from 'react';
import { Form, TextField, Lov, DataSet } from 'choerodon-ui/pro';

import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { openCatalog, openCategory } from '@/routes/pageTree';
import { editDS, fieldMap } from './ds';
import { saveHotMapping } from './api';

export default function EditForm({ tabKey, modal, record, query = () => null }) {
  const isCategory = tabKey === 'CATEGORY';
  const isEdit = record;
  const ds = useMemo(() => new DataSet(editDS(tabKey)), []);
  useEffect(() => {
    if (record && record.get('hotWordMappingId')) {
      const field = fieldMap[tabKey];
      ds.loadData([
        {
          hotWord: record.get('hotWord'),
          [field.LovName]: {
            [field.textField]: record.get(field.textField),
            [field.valueField]: record.get('dataId'),
          },
        },
      ]);
    }
  }, []);
  modal.handleOk(async () => {
    if (ds.current.status === 'sync') return true;
    const flag = await ds.current.validate();
    if (!flag) return false;
    const data = ds.current.toJSONData();
    let editParams = {};
    if (isEdit) {
      editParams = record.toData();
    }
    const method = isEdit ? 'PUT' : 'POST';
    const res = getResponse(
      await saveHotMapping(
        [
          filterNullValueObject({
            ...editParams,
            ...data,
            tenantId: getCurrentOrganizationId(),
            mappingType: tabKey,
            creationType: editParams.creationType || 'manual',
            dataId: isCategory ? data?.categoryId : data?.catalogId,
          }),
        ],
        method
      )
    );
    if (res) {
      notification.success();
      query();
      return true;
    }
    return false;
  });
  return (
    // <Spin dataSet={ds}>
    <Form dataSet={ds} columns={1} labelLayout="float">
      <TextField name="hotWord" disabled={record && record.get('creationType') === 'quote'} />
      {tabKey === 'CATEGORY' && (
        <Lov
          clearButton={false}
          name="categoryLov"
          onClick={() => {
            openCategory({
              drawer: false,
              name: 'categoryLov',
              record: ds.current,
              // onChange: (item) => {
              //   handleCategoryChange(item);
              // },
            });
          }}
        />
      )}
      {tabKey === 'CATALOG' && (
        <Lov
          clearButton={false}
          name="catalogLov"
          onClick={() => {
            openCatalog({
              drawer: false,
              name: 'catalogLov',
              record: ds.current,
            });
          }}
        />
      )}
    </Form>
    // </Spin>
  );
}
