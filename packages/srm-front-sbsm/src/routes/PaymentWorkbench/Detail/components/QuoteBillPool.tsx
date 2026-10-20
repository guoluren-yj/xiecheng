import React, { useContext, useMemo, useCallback, useEffect, Fragment } from 'react';
import { isEmpty } from 'lodash';
import { observer } from'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import { PaperLineAddCodeMap } from '../../utils/type';
import { openEmbedPage } from '../../../../utils/utils';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { usableListDS } from '../../../BankBillPool/List/stores/listDS';

const QuoteBillPool = observer((props) => {

  const { modal } = props;
  const { boolMap, headerDs, customizeTable } = useContext(Store);

  const billPoolDs = useMemo(() => new DataSet(usableListDS()), []);

  const noSelected = isEmpty(billPoolDs.selected);
  const { companyId, payHeaderId } = headerDs.current?.get(['companyId', 'payHeaderId']);

  useEffect(() => {
    // 有payHeaderId则为新增行
    if (companyId) {
      billPoolDs.setQueryParameter('companyId', companyId);
      billPoolDs.setQueryParameter('payHeaderId', payHeaderId);
      billPoolDs.setQueryParameter('customizeUnitCode', Object.values(PaperLineAddCodeMap).join());
    };
  }, [billPoolDs, companyId, payHeaderId]);

  const handleOk = useCallback(async () => {
    const res = await billPoolDs
      .setState('submitType', 'addStatementLine')
      .forceSubmit();
    if (!res) return;
    headerDs.query(undefined, undefined, true);
  }, [billPoolDs, headerDs]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk, boolMap]);

  useEffect(() => {
    if (modal) {
      modal.update({ okProps: { disabled: noSelected } });
    }
  }, [modal, boolMap, noSelected]);

  const handleViewBillPoolDetail = useCallback((paperId) => {
    openEmbedPage({
      href: `/sbsm/bank-bill-pool/detail/${paperId}`,
      params: { paperId },
    });
  }, []);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      { name: 'paperSystemStatus', width: 150, renderer: statusTagRender },
      {
        name: 'paperNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => handleViewBillPoolDetail(record?.get('paperId'))}>
            {value}
          </a>
        ),
       },
      { name: 'companyNum', width: 150 },
      { name: 'companyName', width: 220 },
      { name: 'dataSourceMeaning', width: 150 },
      { name: 'paperTypeMeaning', width: 150 },
      { name: 'paperStatus', width: 150 },
      { name: 'bankName', width: 150 },
      { name: 'drawer', width: 150 },
      { name: 'acceptor', width: 150 },
      { name: 'payer', width: 150 },
      { name: 'invoiceDate', width: 120 },
      { name: 'issueDate', width: 120 },
      { name: 'draftsDeadLine', width: 120 },
      { name: 'paperAmount', width: 150 },
      { name: 'associatePayNum', width: 150 },
      { name: 'associateStatementLineNum', width: 150 },
      { name: 'createdByName', width: 150 },
      { name: 'creationDate', width: 150 },
      { name: 'sourcePaperNum', width: 150 },
      { name: 'attachmentUuid', width: 150 },
    ];
  }, [handleViewBillPoolDetail]);

  return (
    <Fragment>
      {customizeTable(
        { code: PaperLineAddCodeMap.Grid },
        <SearchBarTable
          columns={columns}
          dataSet={billPoolDs}
          searchCode={PaperLineAddCodeMap.Filter}
          style={{ maxHeight: 'calc(100vh - 170px)' }}
          searchBarConfig={{
            expandable: false,
            closeFilterSelector: true,
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="paperNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.bankBillPool.view.placeholder.enterBillNumToQuery')
                    .d('请输入票号查询')}
                />
              ),
            },
          }}
        />
      )}
    </Fragment>
  );
});

export default QuoteBillPool;
