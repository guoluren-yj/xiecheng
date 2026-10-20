import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet } from 'choerodon-ui/pro';
import FilterBarTable from '_components/FilterBarTable';
import { getResponse } from 'utils/utils';

import { saveInvoicePromptParams } from '../utils/api';
import { optionalParamLineDS } from '../stores/detailDS';

const Add = ({ lang, modal, onOk }: { lang: string, modal?: any, onOk?: () => void }) => {

  const tableDs = useMemo(() => new DataSet(optionalParamLineDS({ lang })), [lang]);
  const { selected } = tableDs;

  const handleOk = useCallback(async () => {
    Object.assign(tableDs, { dataToJSON: 'selected' });
    const res = getResponse(await saveInvoicePromptParams(tableDs.toJSONData()));
    Object.assign(tableDs, { dataToJSON: 'dirty' });
    if (!res) return false;
    if (onOk) onOk();
  }, [tableDs, onOk]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
      modal.update({
        okProps: {
          disabled: selected.length === 0,
        },
      });
    }
  }, [modal, selected, handleOk]);

  const columns = useMemo(() => [
    {
      name: 'paramObject',
      width: 100,
    },
    {
      name: 'paramName',
      width: 180,
    },
    {
      name: 'paramCode',
      width: 180,
    },
    {
      name: 'paramType',
      width: 120,
    },
    {
      name: 'fieldType',
      width: 120,
    },
  ], []);

  return (
    <FilterBarTable
      dataSet={tableDs}
      columns={columns}
      filterBarConfig={{
        checkDataSetStatus: false,
        autoQuery: true,
        collpaseble: false,
        expandable: false,
      }}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    />
  );
};

export default observer(Add);