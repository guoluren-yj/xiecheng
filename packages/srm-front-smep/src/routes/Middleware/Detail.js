import React, { useEffect, useState } from 'react';
import { Form, Lov, TextField, Spin } from 'choerodon-ui/pro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { fetchPolling, fetchEditPolling, fetchNewPolling } from '@/services/middware';

export default function Detail({ dataSet, readOnly, isTenant, modal, callBack = (e) => e }) {
  const [loading, setLoading] = useState(false);
  const [initTenants, setInitTenants] = useState([]);
  modal.handleOk(() => handleOk());
  useEffect(() => {
    if (isTenant && readOnly) {
      initData();
    }
  }, []);

  async function initData() {
    const { ecCode, pullType } = dataSet.current.get(['ecCode', 'pullType']);
    setLoading(true);
    const res = await fetchPolling({
      ecCode,
      pullType,
      type: 'TENANT',
    });
    setLoading(false);
    const _data = (res?.tenantList || []).map((m) => ({ ...m, tenantId: String(m.tenantId) }));
    setInitTenants(_data);
    dataSet.current.set('tenantLov', _data);
  }

  async function handleOk() {
    const flag = await dataSet.current.validate();
    if (flag) {
      const { tenantLov, ...other } = dataSet.current.toData();
      const api = other?.pullId ? fetchEditPolling : fetchNewPolling;
      let addTenants = [];
      let deleteOrigins = [];
      if (readOnly && isTenant) {
        addTenants = tenantLov
          .filter((f) => !initTenants.some((s) => s.tenantId === f.tenantId))
          .map((m) => ({ ...m, action: 'create' }));
        deleteOrigins = initTenants
          .filter((f) => !tenantLov.some((i) => i.tenantId === f.tenantId))
          .map((m) => ({ ...m, action: 'delete' }));
      }
      const res = await api({
        ...other,
        type: isTenant ? 'TENANT' : undefined,
        tenantList: readOnly ? addTenants.concat(deleteOrigins) : tenantLov,
        tenantId: getCurrentOrganizationId(),
      });
      if (getResponse(res)) {
        callBack();
        return true;
      }
    } else {
      return false;
    }
  }
  return (
    <Spin spinning={loading}>
      <Form dataSet={dataSet} columns={1} labelLayout="float">
        <TextField name="ecMeaning" />
        <Lov name="pullTypeLov" disabled={readOnly} />
        <Lov name="rateLov" />
        {isTenant && (
          <Lov
            name="tenantLov"
            viewMode="drawer"
            tableProps={{ style: { maxHeight: 'calc(100vh - 240px)' } }}
          />
        )}
      </Form>
    </Spin>
  );
}
