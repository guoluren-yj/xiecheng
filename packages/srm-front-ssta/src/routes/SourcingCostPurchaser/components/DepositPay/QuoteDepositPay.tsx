import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { Card } from 'choerodon-ui';
import { Button, Modal, DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import { isEmpty, flow } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import DepositDetail from '../../DepositDetail';
import { quoteDepositPayDS, depositListDS, payRecordInputDS } from './storeDS';
import styles from './index.less';
import commonStyles from '../../../common.less';

interface QuoteDepositPayProps {
  depositRecord: DSRecord | null | undefined,
  okCallback: Function,
  remote?: any,
}

export enum DepositQuotePayCode {
  SEARCH = 'SSTA.DEPOSIT_DETAIL_PUR.SEARCH_QUOTE_PAY',
  GRID = 'SSTA.DEPOSIT_DETAIL_PUR.GRID_QUOTE_PAY',
}
export const depositQuotePayOtherCode = 'SSTA.DEPOSIT_DETAIL_PUR.QUOTE_DEPOSIT_PAY_OTHER';

const QuoteDepositPay = flow(
  observer,
  withCustomize({
    unitCode: [depositQuotePayOtherCode, DepositQuotePayCode.GRID],
  })
)((props) => {

  const { modal, depositRecord, okCallback, customizeForm, customizeTable, remote } = props;

  const depositDsProps = useMemo( () =>  {
    return remote ? remote.process('SSTA.DEPOSIT_DETAIL_PUR.QUOTE_DEPOSIT_PAY_DEPOSIT_LIST_DDS' ,depositListDS(), props ) : depositListDS()
  },[remote, depositListDS]);

  const depositListDs = useMemo<DataSet>(() => new DataSet(depositDsProps), []);
  const payRecordInputDs = useMemo<DataSet>(() => new DataSet(payRecordInputDS()), []);
  const quoteDepositPayDs = useMemo<DataSet>(() => new DataSet({
    ...quoteDepositPayDS(depositRecord),
    children: {
      depositList: depositListDs,
      depositPayRecordInputList: payRecordInputDs,
    },
  }), [depositRecord, depositListDs, payRecordInputDs]);
  const { selected } = depositListDs;

  // 缴纳确认
  const handleSubmit = useCallback(async () => {
    const res = await quoteDepositPayDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [quoteDepositPayDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  useEffect(() => {
    if (modal) modal.update({ okProps: { disabled: isEmpty(selected) } });
  }, [modal, selected]);


  // 查看详情
  const handleViewDetail = useCallback((depositId) => {
    Modal.open({
      title: intl.get('ssta.sourcingCost.view.message.depositDetail').d('保证金详情'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      resizable: true,
      bodyStyle: { padding: 0 },
      className: commonStyles['ssta-large-modal'],
      children: <DepositDetail match={{ params: { depositId } }} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const columns = useMemo<ColumnProps[]>(() => {
    const _columns = [
      {
        name: 'depositNum',
        width: 150,
      },
      {
        name: 'depositDetail',
        width: 120,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleViewDetail(record?.get('depositId'))}
          >
            {intl.get('ssta.sourcingCost.view.message.depositDetail').d('保证金详情')}
          </Button>
        ),
      },
      {
        name: 'remainingRefundableAmount',
        width: 150,
      },
      {
        name: 'depositTransferDepositAmount',
        width: 150,
        editor: true,
      },
    ];
    return remote ? remote.process('SSTA.DEPOSIT_DETAIL_PUR.QUOTE_DEPOSIT_PAY_DEPOSIT_LIST_COLUMNS' , _columns, {} ) : _columns
  }, [
    remote,
    handleViewDetail,
  ]);

  return (
    <Fragment>
      <Card
        key="amount"
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.sourcingCost.view.title.amountInfo`).d('金额信息')}
      >
        <div className={`${commonStyles['ssta-no-expand-search-bar-wrapper']} ${styles['ssta-deposit-pay-search-bar-wrapper']}`}>
          {customizeTable(
            { code: DepositQuotePayCode.GRID },
            <SearchBarTable
              customizable
              columns={columns}
              searchCode={DepositQuotePayCode.SEARCH}
              dataSet={depositListDs}
              style={{ maxHeight: 510 }}
              searchBarConfig={{ autoQuery: false, expandable: false, closeFilterSelector: true }}
            />
          )}
        </div>
      </Card>
      <Card
        key="other"
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.sourcingCost.view.title.otherInfo`).d('其他信息')}
      >
        {customizeForm(
          { code: depositQuotePayOtherCode },
          <Form
            columns={2}
            useColon={false}
            dataSet={payRecordInputDs}
            labelLayout={LabelLayout.float}
          >
            <TextArea name="remark" resize={ResizeType.vertical} />
          </Form>
        )}
      </Card>
    </Fragment>
  );
}) as (props: QuoteDepositPayProps) => ReactElement;

export default QuoteDepositPay;
