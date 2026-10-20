/* eslint-disable import/no-cycle */
import React, { useMemo } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';

import { detailDsFieldsMap, detailConfig } from './data';
import { detailDs } from './ds';
import LogModal from './LogModal';
import styles from './log.less';

function SubTable(props) {

  const { subKey, parentKey, recordData } = props;
  const ds = useMemo(() => new DataSet(detailDs(subKey, parentKey, detailConfig(recordData)[subKey], recordData)), [subKey]);
  return (
    <div className={styles['sub-table']} style={{ height: 'calc(100vh - 152px)' }}>
      <SearchBarTable
        style={{ maxHeight: `calc(100% - 22px)` }}
        dataSet={ds}
        columns={detailDsFieldsMap(subKey, recordData)[parentKey]}
        customizedCode={detailConfig()[subKey].customizedCode}
        searchCode={detailConfig()[subKey].searchCode}
        searchBarConfig={detailConfig(recordData)[subKey].searchBarConfig}
      />
    </div>
  );
};

function openModal(props) {

  const { key, record = undefined, parentKey = '', title } = props;
  const modal = c7nModal({
    title: title || intl.get('smodr.ecBill.view.docDetail').d('单据详情'),
    style: { width: '1090px' },
    children: (
      <SubTable subKey={key} parentKey={parentKey} recordData={record} />
    ),
    footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.ecBill.view.close').d('关闭')}</Button>,
  });
}

function openLogModal(props) {

  const { record, key, lastRecord } = props;
  const lastData = lastRecord?.toJSONData();
  const modal = c7nModal({
    title: intl.get('smodr.ecBill.view.log').d('日志'),
    style: { width: '742px' },
    children: (
      <LogModal data={record.toData()} type={key} lastData={lastData} />
    ),
    footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.ecBill.view.close').d('关闭')}</Button>,
  });
}

export { openModal, openLogModal };
