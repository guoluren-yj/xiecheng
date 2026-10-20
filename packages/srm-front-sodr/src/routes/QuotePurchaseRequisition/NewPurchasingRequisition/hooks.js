import React, { useCallback } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import abnormal from '@/assets/abnormal.svg';
import urgentImg from '@/assets/icon-expedited.svg';
import styles from './index.less';

export function useTable(dataSet, columns, props) {
  return <Table dataSet={dataSet} columns={columns} virtual {...props} />;
}

export function usePrNumRender(handleToDetail) {
  return useCallback(
    (props) => {
      const { record, value } = props;
      return (
        <div className={styles['row-agent-column']}>
          {handleToDetail && <a onClick={() => handleToDetail(record)}>{value}</a>}
          {record.get('incorrectFlag') === 1 ? (
            <Tooltip title={record.get('incorrectMsg')}>
              <img src={abnormal} alt="img" />
            </Tooltip>
          ) : handleToDetail ? null : (
            value
          )}
          {record.get('urgentFlag') === 1 && (
            <Tooltip
              title={intl.get(`sodr.orderMaintenanceEntry.model.common.urgent`).d('订单加急')}
            >
              <img src={urgentImg} alt="img" />
            </Tooltip>
          )}
        </div>
      );
    },
    [handleToDetail]
  );
}
