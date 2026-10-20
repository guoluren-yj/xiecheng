/*
 * @Date: 2024-06-28 17:50:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { observer } from 'mobx-react';
import { Divider } from 'choerodon-ui';
import { Output, useDataSet } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import styles from './styles.less';
import { getFormDs, getTableDs } from './getOccupyDS';
import { MutlTextFieldSearch } from '../../MultipleSearch';

const searchCode = 'SPCM.WORKSPACE_COMMON.OCCUPY_SEARCH_BAR';

let searchBarRef; // 筛选器ref

const OccupyCard = ({ dataSet, name }) => {
  const field = dataSet?.getField(name);
  const label = field?.get('label') || '-';
  return (
    <div className="occupy-card">
      <div className="occupy-card-content">
        <span>{label}</span>
        <div className="occupy-card-amount">
          <Output dataSet={dataSet} name={name} />
          <span>{dataSet?.current?.get('executeCurrencyCode')}</span>
        </div>
      </div>
    </div>
  );
};

const OccupyWrap = observer(({ record }) => {
  const { pcHeaderId, pcSubjectId } = record?.get(['pcHeaderId', 'pcSubjectId']) || {};

  const formDs = useDataSet(() => getFormDs(), [pcHeaderId]);
  const tableDs = useDataSet(() => getTableDs(), [pcHeaderId]);

  const { amountField } = formDs?.current?.get(['amountField']) || {};

  const handleQuery = ({ params, currentPage }) => {
    formDs.setQueryParameter('pcHeaderId', pcHeaderId);
    formDs.setQueryParameter('pcSubjectId', pcSubjectId);
    tableDs.setQueryParameter('pcHeaderId', pcHeaderId);
    tableDs.setQueryParameter('pcSubjectId', pcSubjectId);
    tableDs.setQueryParameter('customizeUnitCode', searchCode);
    if (tableDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = tableDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
      tableDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      formDs.query();
      tableDs.query(currentPage);
    } else {
      // 解决设置默认值查询不生效问题
      searchBarRef.handleQuery(true);
    }
  };

  const letfRender = useCallback((_, ds) => (
    <MutlTextFieldSearch
      dataSet={ds}
      multiple={false}
      name="multiPoNum"
      style={{ width: '200px' }}
      placeholder={intl.get('spcm.common.model.search.poNumAndLine').d('请输入单据编号-行号查询')}
    />
  ));

  const columns = useMemo(
    () =>
      [
        {
          name: 'displayPoNumAndLineNum',
        },
        {
          name: 'executeTaxIncludedAmount',
          width: 150,
        },
        {
          name: 'executeAmount',
          width: 150,
        },
        {
          name: 'executeCurrencyCode',
        },
        {
          name: 'executeDate',
        },
        amountField === 'TAX_INCLUDED_PRICE' && {
          name: 'calculateTaxIncludedAmount',
        },
        amountField === 'NET_PRICE' && {
          name: 'calculateAmount',
        },
        {
          name: 'lastUpdateDate',
        },
      ].filter(Boolean),
    [amountField]
  );

  return (
    <Fragment>
      <div className={styles['occupy-card-wrap']}>
        <OccupyCard dataSet={formDs} name="remainOccupiedAmount" />
        <div className="occupy-symbol">=</div>
        <OccupyCard dataSet={formDs} name="totalAmount" />
        <div className="occupy-symbol">-</div>
        <OccupyCard dataSet={formDs} name="totalOccupiedAmount" />
      </div>
      <Divider style={{ margin: '16px 0' }} />
      <SearchBarTable
        dataSet={tableDs}
        columns={columns}
        searchCode={searchCode}
        customizedCode="SPCM.OCCUPY_MODAL"
        style={{ maxHeight: 'calc(100vh - 260px)' }}
        searchBarRef={(ref) => {
          searchBarRef = ref;
        }}
        searchBarConfig={{
          expandable: false,
          defaultExpand: false,
          closeFilterSelector: false,
          onQuery: handleQuery,
          left: {
            render: letfRender,
          },
        }}
      />
    </Fragment>
  );
});

export default OccupyWrap;
