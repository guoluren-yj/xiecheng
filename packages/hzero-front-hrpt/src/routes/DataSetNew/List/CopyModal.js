import React, {
  useMemo,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { createByCopyModal } from '@/services/dataSetService';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { getCopyModalTableDs } from './store';

const CopyModal = ({ copyModalRef, tenantId }) => {
  const tableDs = useMemo(() => new DataSet(getCopyModalTableDs()), []);
  const columns = useMemo(() => [{ name: 'datasetCode' }, { name: 'datasetName' }], []);
  useImperativeHandle(copyModalRef, () => ({
    submit,
  }));

  useEffect(() => {
    tableDs.setQueryParameter('tenantId', tenantId);
    tableDs.query();
  }, []);

  const submit = useCallback(async () => {
    const { selected } = tableDs;
    if (!selected || selected.length === 0) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    let flag = false;
    tableDs.status = DataSetStatus.loading;
    const datasetCode = selected[0].get('datasetCode');
    const result = await createByCopyModal({
      tenantId,
      datasetCode,
    });
    if (getResponse(result)) {
      flag = true;
    }
    tableDs.status = DataSetStatus.ready;
    return flag;
  }, [tableDs]);

  return <Table dataSet={tableDs} columns={columns} queryFieldsLimit={2} />;
};

export default CopyModal;
