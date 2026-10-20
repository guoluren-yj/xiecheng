import React, { useEffect, useMemo } from 'react';
import { useDataSet, Table, Output } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import CollapseForm from '_components/CollapseForm';

import { ladderQuotationTableDS, ladderQuotationHeaderDS } from './store';
import styles from '../../index.less';

export default observer(function LadderLevelModal(props) {
  const {
    lineRecord = {},
    customizeTable = noop,
    customizeCollapseForm = noop,
    doubleUnitFlag = false,
  } = props || {};

  const { rfqQuotationId } = lineRecord?.get(['rfqQuotationId']) || {};

  const ladderQuotationTableDs = useDataSet(() => ladderQuotationTableDS(), []);

  const ladderQuotationHeaderDs = useDataSet(() => ladderQuotationHeaderDS(), []);

  useEffect(() => {
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setQueryParameter('rfqQuotationId', rfqQuotationId);
    ladderQuotationHeaderDs.setQueryParameter('rfqQuotationId', rfqQuotationId);
    ladderQuotationTableDs.query();
    ladderQuotationHeaderDs.query();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'secondaryLadderFrom',
        width: 120,
      },
      {
        name: 'secondaryLadderTo',
        width: 120,
      },
      {
        name: 'ladderFrom',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderTo',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderSecPrice',
        width: 120,
      },
      {
        name: 'ladderPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'netLadderSecPrice',
        width: 120,
      },
      {
        name: 'netLadderPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'remark',
        width: 120,
      },
    ],
    [doubleUnitFlag]
  );

  return (
    <React.Fragment>
      <h3 className={styles['ladder-sub-title']}>
        <div className={styles['ladder-sub-title-line']} />
        {intl.get('ssrc.quickInquiry.view.card.subtitle.itemInfo').d('物料信息')}
      </h3>
      {customizeCollapseForm(
        {
          code: `SSRC.QUICK_INQUIRY.LIST.QUO_LADDER_QUOTATION_HEADER`,
          dataSet: ladderQuotationHeaderDs,
        },
        <CollapseForm
          dataSet={ladderQuotationHeaderDs}
          labelLayout="vertical"
          columns={2}
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="itemCode" />
          <Output name="itemName" />
        </CollapseForm>
      )}
      <h3 className={styles['ladder-sub-title']} style={{ marginTop: '32px' }}>
        <div className={styles['ladder-sub-title-line']} />
        {intl.get('ssrc.quickInquiry.view.card.subtitle.quotationInfo').d('报价信息')}
      </h3>
      {customizeTable(
        {
          code: 'SSRC.QUICK_INQUIRY.LIST.QUO_LADDER_QUOTATION',
        },
        <Table
          dataSet={ladderQuotationTableDs}
          columns={columns}
          style={{ maxHeight: 'calc(100vh - 370px)' }}
        />
      )}
    </React.Fragment>
  );
});
