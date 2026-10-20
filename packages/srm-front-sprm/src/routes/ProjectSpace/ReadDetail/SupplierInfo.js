/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../commonDetail/sotreProvider';

const SupplierInfo = function SupplierInfo({ code }) {
  const { supplierDs, customizeTable } = useContext(Store);
  console.log(code || 'SIEC.PROJECT_READ.SUPPLIER');
  const cols = [
    { name: 'supplierCodeLov' },
    { name: 'displaySupplierName' },
    { name: 'contact' },
    {
      name: 'contactPhone',
      renderer: ({ value, record }) =>
        value ? `${record.get('internationalTelCode') || ''} ${value}` : '',
    },
    { name: 'contactEmail' },
  ];
  return (
    <div className="content-padding">
      <h3 className="content-title">
        {intl.get(`sprm.project.model.common.supplier`).d('供应商')}
      </h3>
      {customizeTable(
        {
          code: code || 'SIEC.PROJECT_READ.SUPPLIER',
        },
        <Table dataSet={supplierDs} columns={cols} style={{ maxHeight: `calc(100vh - 300px)` }} />
      )}
    </div>
  );
};

export default SupplierInfo;
