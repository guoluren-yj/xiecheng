/*
 * OUInfo - OU层信息
 * @Date: 2023-04-12 17:26:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isArray } from 'lodash';
import React, { useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchSupplierBasicInfo } from '@/services/supplierInformCompareService';
import { getOuDS } from '@/routes/SupplierInformNew/stores/getLocationInfoDS';
import styles from '../../styles.less';

const OUInfo = ({ record, custLoading, customizeTable, handleCompareRender }) => {
  const newDs = new DataSet(getOuDS({ compareFlag: true }));
  const oldDs = new DataSet(getOuDS({ compareFlag: true }));
  const { changeReqId, supChangeAddId } = record.get(['changeReqId', 'supChangeAddId']);

  useEffect(() => {
    fetchSupplierBasicInfo({
      key: 'ouMessage',
      changeReqId,
      supChangeAddId,
    }).then(response => {
      const res = getResponse(response);
      if (res && isArray(res)) {
        newDs.loadData(res[1]);
        oldDs.loadData(res[0]);
      }
    });
  }, [changeReqId, supChangeAddId]);

  const columns = [
    {
      width: 140,
      name: 'ouId',
      type: 'object',
      displayField: 'ouName',
    },
    {
      width: 200,
      name: 'billPeriod',
      type: 'select',
    },
    {
      width: 120,
      name: 'typeCode',
      type: 'object',
      displayField: 'typeName',
    },
    {
      width: 120,
      name: 'ticketDay',
    },
    {
      width: 160,
      name: 'termCode',
      type: 'object',
      displayField: 'termName',
    },
    {
      width: 120,
      name: 'bankCode',
      type: 'object',
      displayField: 'bankCode',
    },
    {
      width: 160,
      name: 'bankName',
    },
    {
      width: 160,
      name: 'bankFirm',
    },
    {
      width: 160,
      name: 'bankBranchName',
    },
    {
      width: 160,
      name: 'bankAccountName',
    },
    {
      width: 160,
      name: 'bankAccountNum',
    },
    {
      width: 120,
      name: 'taxId',
      type: 'object',
      displayField: 'taxRate',
    },
    {
      width: 120,
      type: 'object',
      name: 'currencyCode',
      displayField: 'currencyName',
    },
    {
      width: 120,
      type: 'date',
      name: 'creationDate',
    },
    {
      width: 130,
      type: 'date',
      name: 'expirationDate',
    },
  ].map(column => {
    const { type, displayField, ...others } = column;
    return {
      renderer: ({ value, record: renderRecord, name }) =>
        handleCompareRender({ value, record: renderRecord, name, type, displayField }),
      ...others,
    };
  });

  return (
    <div className={styles['compare-container']} style={{ height: '100%' }}>
      <div className={styles['compare-header']}>
        <div style={{ paddingLeft: 20 }}>
          {intl.get('sslm.common.view.compare.currentVersion').d('当前版本')}
        </div>
        <div>{intl.get('sslm.common.view.compare.historyVersion').d('历史版本')}</div>
      </div>
      <div className={styles['compare-content']}>
        <div>
          <div className={styles['compare-content-detail']}>
            {customizeTable(
              {
                code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU',
                readOnly: true,
              },
              <Table
                columns={columns}
                dataSet={newDs}
                pagination={false}
                selectionMode="none"
                custLoading={custLoading}
                style={{ maxHeight: 430, padding: '20px 0' }}
              />
            )}
          </div>
        </div>
        <div>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU',
              readOnly: true,
            },
            <Table
              columns={columns}
              dataSet={oldDs}
              pagination={false}
              selectionMode="none"
              custLoading={custLoading}
              style={{ maxHeight: 430, padding: '20px 0' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OUInfo;
