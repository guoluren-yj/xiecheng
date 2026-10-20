import React, { useMemo, useEffect, Fragment, useCallback } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import type { ReactElement } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { flow, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import { yesOrNoRender } from 'utils/renderer';

import { quoteDeliveryTempListDS } from '../stores/indexDS';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TempTableCustCode, TempSearchCustCode } from '../../utils/type';
import styles from '../../../common.less';

// PPAP工作台和PPAP模板使用
interface DeliveryTempDefinitionListProps {
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
  onOk: Function;
  modal?;
  quoteDeliveryTempListDs: DataSet;
}


const QuoteDeliveryTempModal = (props: DeliveryTempDefinitionListProps) => {
  const { onOk, modal, customizeTable, quoteDeliveryTempListDs } = props;
  // const quoteDeliveryTempListDs: DataSet = useMemo(() => new DataSet(quoteDeliveryTempListDS()), []);
  const { selected } = quoteDeliveryTempListDs;

  const handleOk = useCallback(async () => {
    // 仅用于把模板里的附件uuid 复制给交付物列表里的附件uuid 不是真正的提交
    const res = getResponse(await quoteDeliveryTempListDs.submit());
    if (!res) return;
    const { content = [] } = res || {};
    onOk(content);
  }, [onOk, quoteDeliveryTempListDs]);

  useEffect(() => {
    modal.handleOk(handleOk);
    modal.update({
      okProps: { disabled: isEmpty(selected) },
    });
  }, [selected, modal, handleOk]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'documentNum',
        width: 120,
      },
      {
        name: 'enableFlag',
        width: 80,
        renderer: ({ value, text }) => (
          <StatusTag value={text} flag color={value === 1 ? 'green' : 'red'} />
        ),
      },
      {
        name: 'documentName',
      },
      {
        name: 'documentAttachmentUuid',
      },
      {
        name: 'autoReferAttachmentFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'camp',
      },
      {
        name: 'supplierVisibleFlag',
        width: 150,
        renderer: ({ value, record }) => record?.get('camp') === 'PURCHASER' && yesOrNoRender(Number(value)),
      },
      {
        name: 'documentUploadPoint',
      },
      {
        name: 'approveMethod',
      },
      {
        name: 'approveType',
      },
      {
        name: 'employeeName',
      },
      {
        name: 'visibleEmployeeName',
      },
    ];
  }, []);

  return (
    <Fragment>
      <div
        style={{ height: 'calc(100vh - 200px)' }}
        className={styles['content-table-grid']}
      >
        {customizeTable(
          { code: TempTableCustCode },

          <SearchBarTable
            cacheState
            customizable
            dataSet={quoteDeliveryTempListDs}
            columns={columns}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
            searchCode={TempSearchCustCode}
            searchBarConfig={{ expandable: false, closeFilterSelector: true }}
          />
        )}
      </div>
    </Fragment>
  );

};

export default flow(
  observer,
  withCustomize({
    unitCode: [
      TempTableCustCode, TempSearchCustCode,
    ],
  }),
  withProps(
    (() => {
      const quoteDeliveryTempListDs: DataSet = new DataSet(quoteDeliveryTempListDS());
      return {
        quoteDeliveryTempListDs,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['sqam.deliveryTemplateDefinition', 'hzero.common'] }))(QuoteDeliveryTempModal) as (props: any) => ReactElement;




