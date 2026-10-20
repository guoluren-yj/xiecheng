import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataSet, Table, Form, TextField, Button } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';
import intl from 'hzero-front/lib/utils/intl';

import { addFieldFormDs } from './store';
import styles from './index.less';

const SelectField = observer(({ tenantId, usedFileds, businessObjectCode, tableDs }) => {
  const [tableData, setTableData] = useState([]);
  const formDs = useMemo(() => new DataSet(addFieldFormDs()), []);
  const columns = useMemo(() => [{ name: 'fieldName' }, { name: 'businessObjectFieldCode' }], []);

  useEffect(() => {
    tableDs.setQueryParameter('businessObjectCode', businessObjectCode);
    tableDs.setQueryParameter('tenantId', tenantId);
    tableDs
      .query()
      .then((data) => {
        let canUseFields = data;
        if (usedFileds && usedFileds.length) {
          canUseFields = canUseFields.filter((field) =>
            usedFileds.every((f) => f.businessObjectFieldCode !== field.businessObjectFieldCode)
          );
        }
        tableDs.loadData(canUseFields);
        setTableData(canUseFields);
      })
      .catch(() => {
        setTableData([]);
      });
  }, []);

  const handleSearch = useCallback(() => {
    tableDs.unSelectAll();
    if (!formDs.current) {
      tableDs.loadData(tableData);
      return;
    }
    const {
      fieldName: searchFieldName,
      businessObjectFieldCode: searchFieldCode,
    } = formDs.current.get(['fieldName', 'businessObjectFieldCode']);
    if (isNil(searchFieldName) && isNil(searchFieldCode)) {
      tableDs.loadData(tableData);
    } else if (tableData && tableData.length > 0) {
      const filterData = tableData.filter((item) => {
        let flag = true;
        if (!isNil(searchFieldName)) {
          flag = !!item.fieldName && item.fieldName.includes(searchFieldName);
        }
        if (flag && !isNil(searchFieldCode)) {
          flag =
            !!item.businessObjectFieldCode &&
            item.businessObjectFieldCode.toLowerCase().includes(searchFieldCode.toLowerCase());
        }
        return flag;
      });
      tableDs.loadData(filterData);
    }
  }, [tableData, tableDs, formDs]);

  const handleReset = useCallback(() => {
    formDs.loadData([]);
  }, [formDs]);

  return (
    <div className={styles['right-panel']}>
      <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
        <Form
          dataSet={formDs}
          columns={2}
          labelLayout="float"
          style={{ flex: 'auto' }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              handleSearch();
            }
          }}
        >
          <TextField name="fieldName" />
          <TextField name="businessObjectFieldCode" />
        </Form>
        <div
          style={{
            marginLeft: '16px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button onClick={handleReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
          <Button dataSet={null} color="primary" onClick={handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </div>
      </div>
      <Table dataSet={tableDs} columns={columns} />
    </div>
  );
});

export default SelectField;
