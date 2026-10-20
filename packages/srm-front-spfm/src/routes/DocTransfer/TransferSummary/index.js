/**
 * index.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { transferSummaryDs } from './dataSets';

function TransferSummary() {
  const tableDs = useMemo(() => new DataSet(transferSummaryDs(intl)), []);
  const columns = useMemo(
    () => [
      {
        name: 'deliverType',
      },
      {
        name: 'docCode',
      },
      {
        name: 'docName',
      },
      {
        name: 'deliverSource',
      },
      {
        name: 'mainTableName',
      },
      {
        name: 'mainTableColumn',
      },
      {
        name: 'businessDocId',
      },
      {
        name: 'businessDocNum',
      },
      {
        name: 'deliverFromName',
        renderer: ({ record, text, value }) => {
          return value !== undefined ? `${text}(${record.get('deliverFrom')})` : null;
        },
      },
      {
        name: 'deliverToName',
        renderer: ({ record, text, value }) => {
          return value !== undefined ? `${text}(${record.get('deliverTo')})` : null;
        },
      },
      {
        name: 'createByName',
        renderer: ({ record, text, value }) => {
          return value !== undefined ? `${text}(${record.get('createBy')})` : null;
        },
      },
      {
        name: 'creationDate',
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Header
        title={intl.get('spfm.docTransfer.view.header.recordsDetail').d('单据转交记录汇总查询')}
        backPath="/spfm/doc-transfer/list"
      />
      <Content>
        <FilterBarTable
          dataSet={tableDs}
          columns={columns}
          customizable
          customizedCode="SPFM.DOC_TRANSFER.SUMMARY.TABLE"
        />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.docTransfer', 'hzero.common'],
})(TransferSummary);
