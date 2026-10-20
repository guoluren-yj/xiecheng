import React, { useMemo } from 'react';
import { Form, DataSet, TextField, NumberField } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { fetchSaveSubCatalog } from '@/services/catalogManage';

import { formDs } from './ds';

export default function Detail(props) {
  const { record = {}, modal, isSubCatalog, refresh = (e) => e } = props;
  const { catalogId } = record;
  const ds = useMemo(() => new DataSet(formDs()), []);
  if (catalogId && !isSubCatalog) {
    ds.create(record);
  }
  modal.handleOk(async () => {
    const {
      record: { catalogLevel },
    } = props;
    const flag = await ds.current.validate();
    if (flag) {
      const data = ds.current.toJSONData();
      const res = await fetchSaveSubCatalog({
        ...data,
        catalogLevel: !catalogId ? 1 : isSubCatalog ? catalogLevel + 1 : catalogLevel,
        parentCatalogId: isSubCatalog ? catalogId : -1,
      });
      if (getResponse(res)) {
        notification.success();
        refresh();
      }
      return true;
    }
    return false;
  });
  return (
    <Form columns={1} labelLayout="float" dataSet={ds}>
      <TextField name="catalogCode" disabled={catalogId && !isSubCatalog} />
      <TextField name="catalogName" />
      <NumberField name="orderSeq" />
    </Form>
  );
}
