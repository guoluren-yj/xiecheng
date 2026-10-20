import React, { useEffect, useMemo, useImperativeHandle, useState } from 'react';
import { toJS } from 'mobx';
import { Button, DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';

import PopoverField, { PopoverFieldType } from '@/components/PopoverField';
import { unitTypeColorMap } from '@/utils/constConfig';
import {
  unitFilterFormDS,
  ImportUnitTableDs,
  ImportFieldTableDs,
  ImportStatusRenderer,
} from './util';
import ImportFieldDetail from './ImportFieldDetail';
import styles from '../index.less';

let detailModal;

const ImportDetail = ({
  headerId,
  lineRef,
  isSearchBarUnit,
}) => {
  const importUnitTableDs = useMemo(() => new DataSet(ImportUnitTableDs()), []);
  const importFieldTableDs = useMemo(() => new DataSet(ImportFieldTableDs()), []);
  const unitFilterFormDs = useMemo(() => new DataSet(unitFilterFormDS()), []);

  const [custTypeObj, setCustTypeObj] = useState({});
  const [unitTypeObj, setUnitTypeObj] = useState({});
  useEffect(()=>{
    queryMapIdpValue({
      custType: 'HPFM.CUST.FIELD_CUST_TYPE',
      unitType: 'HPFM.CUST.UNIT_TYPE',
    }).then(res => {
      if(getResponse(res)){
        const _custTypeObj = {};
        const _unitTypeObj = {};
        res.custType.forEach(i => {
          _custTypeObj[i.value] = i.meaning;
        });
        res.unitType.forEach(i => {
          _unitTypeObj[i.value] = i.meaning;
        });
        setCustTypeObj(_custTypeObj);
        setUnitTypeObj(_unitTypeObj);
      }
    });
  }, []);
  useEffect(() => {
    unitFilterFormDs.addEventListener('update', handleFilterFormDsUpdate);
    return () => {
      unitFilterFormDs.removeEventListener('update', handleFilterFormDsUpdate);
    };
  }, []);

  useImperativeHandle(lineRef, () => ({
    fetchData,
    setData,
  }));

  useEffect(() => {
    unitFilterFormDs.loadData([]);
    fetchData();
  }, [headerId]);

  const fetchData = () => {
    if (!headerId) {
      return;
    }
    importUnitTableDs.setQueryParameter('headerId', headerId);
    importUnitTableDs.query();
  };

  const setData = data => {
    const unitTableData = isEmpty(data) ? [] : data;
    importUnitTableDs.loadData(unitTableData);
    if (unitTableData.length > 0) {
      const fieldTableData = isEmpty(unitTableData[0].cnfLogList)
        ? []
        : unitTableData[0].cnfLogList;
      importFieldTableDs.loadData(fieldTableData);
    }
  };

  const handleFilterFormDsUpdate = ({ record }) => {
    if (record) {
      const { status, unitName, unitCode } = record.get(['status', 'unitName', 'unitCode']);
      importUnitTableDs.setQueryParameter('status', status);
      importUnitTableDs.setQueryParameter('unitName', unitName);
      importUnitTableDs.setQueryParameter('unitCode', unitCode);
    }
    importUnitTableDs.query();
  };

  const importUnitTableCols = useMemo(
    () => [
      {
        name: 'status',
        width: 100,
        renderer: ({ value }) => renderStatusIcon(value),
      },
      {
        name: 'unitName',
        width: 240,
        renderer: ({ value, record }) => (
          <div className={styles['unit-info']}>
            <div>
              <Tag color={unitTypeColorMap[record.get('unitType')]}>
                {(unitTypeObj || {})[record.get('unitType')]}
              </Tag>
              <span>{value}</span>
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>{record.get('menuName')}</div>
          </div>
        ),
      },
      { name: 'message', tooltip: 'overflow' },
      {
        header: intl.get('hzero.common.table.column.options').d('操作'),
        width: 120,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleShowDetail(record)}>
              {intl.get('hpfm.individual.model.import.viewDetail').d('查看明细')}
            </a>
          );
        },
      },
    ],
    [unitTypeObj]
  );

  const renderStatusIcon = (status = 'warn') => {
    const StatusType = {
      pass: intl.get('hpfm.individual.import.status.pass').d('成功'),
      error: intl.get('hpfm.individual.import.status.error').d('失败'),
      warn: intl.get('hpfm.individual.import.status.warn').d('异常'),
    };
    const color = {
      pass: '#47B881',
      error: '#F56349',
      warn: '#FCA000',
    };
    if (!status) {
      return;
    }
    return (
      <span className={styles['list-item-icon']} style={{ color: color[status] }}>
        {ImportStatusRenderer(status)}
        {StatusType[status]}
      </span>
    );
  };

  const handleShowDetail = record => {
    const fieldList = toJS(record.get('cnfLogList'));
    const filterLogList = toJS(record.get('filterLogList'));
    if (fieldList) {
      importFieldTableDs.loadData(fieldList);
    }
    detailModal = Modal.open({
      title: intl.get('hpfm.individual.model.import.viewDetail').d('查看明细'),
      style: { width: '800px' },
      drawer: true,
      children: (
        <ImportFieldDetail
          fieldList={fieldList}
          filterLogList={filterLogList}
          custTypeObj={custTypeObj}
          isSearchBarUnit={isSearchBarUnit}
        />
      ),
      footer: (
        <Button onClick={closeDetailModal}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  const closeDetailModal = () => {
    importFieldTableDs.loadData([]);
    if (detailModal && detailModal.close) {
      detailModal.close();
    }
  };

  return (
    <div className={styles['content-wrapper']}>
      <div className={styles['filter-form']}>
        <PopoverField
          key="status"
          dataSet={unitFilterFormDs}
          name="status"
          label={intl.get('hpfm.individual.import.status').d('状态')}
          type={PopoverFieldType.select}
          options={[
            { value: 'pass', meaning: intl.get('hpfm.individual.import.status.success').d('成功') },
            { value: 'warn', meaning: intl.get('hpfm.individual.import.status.warn').d('异常') },
            { value: 'error', meaning: intl.get('hpfm.individual.import.status.error').d('失败') },
          ]}
        />
        <PopoverField
          key="unitName"
          dataSet={unitFilterFormDs}
          name="unitName"
          label={intl.get('hpfm.individual.import.unitName').d('单元名称')}
        />
        <PopoverField
          key="unitCode"
          dataSet={unitFilterFormDs}
          name="unitCode"
          label={intl.get('hpfm.individual.import.unitCode').d('单元编码')}
        />
        <Table
          border={false}
          rowHeight={40}
          dataSet={importUnitTableDs}
          columns={importUnitTableCols}
          className={styles['list-table']}
        />
      </div>
    </div>
  );
};

export default ImportDetail;
