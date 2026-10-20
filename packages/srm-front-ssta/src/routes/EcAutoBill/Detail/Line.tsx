import React, { Fragment, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import type { DataSet } from 'choerodon-ui/pro';
import { Table, Modal, Tooltip, Pagination } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';

import intl from 'utils/intl';
import SearchBar from '_components/SearchBarTable/SearchBar';

import arrow from '../../../assets/connect.svg';
import SettleLineModal from './SettleLineModal';
import MultiTextFilter from '../../Components/MultiTextFilter';
import styles from './index.less';
import commonStyles from '../../common.less';

interface LineProps
{
  lineDs: DataSet;
  updateFlag: boolean;
  isPoAllFlag: boolean;
  lineTotalCount: number;
  customizeTable: Function;
  className?: string;
}

const Line = observer((props: LineProps) =>
{

  const {
    lineDs,
    updateFlag,
    isPoAllFlag,
    lineTotalCount,
    customizeTable,
  } = props;

  const handleViewSettleLine = useCallback(
    (record) =>
    {
      Modal.open({
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        className: commonStyles['ssta-large-modal'],
        title: intl.get('hzero.common.button.viewDetail').d('查看详情'),
        children: <SettleLineModal {...props} record={record} customizeTable={customizeTable} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [customizeTable, props]
  );

  const eCColumns = useMemo<ColumnProps[]>(
    () =>
      [
        (!isPoAllFlag && {
          name: 'asnLineNum',
          width: 120,
        }) as ColumnProps,
        {
          name: 'ecPoSubNum',
          width: 180,
        },
        {
          name: 'asnNum',
          width: 180,
        },
        ...(!isPoAllFlag
          ? [
            {
              name: 'itemCode',
              width: 120,
            },
            {
              name: 'itemName',
              width: 150,
            },
            {
              name: 'taxIncludedPrice',
              width: 120,
            },
            {
              name: 'quantity',
              width: 120,
            },
            {
              name: 'taxRate',
              width: 120,
            },
          ]
          : []),
        {
          name: 'taxIncludedAmount',
          width: 120,
        },
        (!isPoAllFlag && {
          name: 'netAmount',
          width: 160,
        }) as ColumnProps,
      ].filter((item) => item),
    [isPoAllFlag]
  );
  const optionColumns = useMemo<ColumnProps[]>(
    () => [
      {
        name: 'billStatus',
        width: 120,
        editor: updateFlag,
      },
      {
        name: 'billRemark',
        width: 200,
        editor: updateFlag,
      },
      {
        name: 'billResultMeaning',
        width: 120,
        renderer: ({ record, value }) =>
          value ? (
            <span
              className={
                ['TRUE'].includes(record?.get('billResult'))
                  ? styles['ssta-ecauto-cell-green']
                  : styles['ssta-ecauto-cell-red']
              }
            >
              {value}
            </span>
          ) : null,
      },
    ],
    [updateFlag]
  );
  const priceColumns = useMemo<ColumnProps[]>(
    () => [
      {
        name: 'afterSalesStatusMeaning',
        width: 120,
      },
      (!isPoAllFlag && {
        name: 'settleTaxIncludedPrice',
        width: 120,
        // headerClassName: 'ssta-ecauto-header-style',
        header: ({ dataSet, title }: any) =>
        {
          const isTooltipShow = dataSet.find((record) =>
            ['PO_NOT_RECONCILABLE'].includes(record.get('billResult'))
          );
          return isTooltipShow ? (
            <Fragment>
              <Tooltip
                title={intl
                  .get('ssta.ecAutoBill.model.tooltip.priceWarning')
                  .d('此价格为临时价格，在发票流程结束后将继承开票时的价格信息')}
                placement="topLeft"
              >
                {title}
                <span className="ssta-ecauto-mark-style">!</span>
              </Tooltip>
            </Fragment>
          ) : (
            title
          );
        },
        renderer: ({ text, record }) =>
        {
          const { priceDifferenceFlag } = record.get(['priceDifferenceFlag']);
          return (
            <span>
              {text}
              {Number(priceDifferenceFlag) === 1 && (
                <Tooltip title={
                  intl
                    .get('ssta.ecAutoBill.model.tooltip.priceValueWarning')
                    .d('请注意：当前子订单中的商品因赠品售后或售后破损等问题，您需要向京东赔付差额')
                }
                  placement="bottom" > <span className={styles["ssta-ecauto-price-warn"]} >!</span></Tooltip >
              )
              }
            </span>
          );

        },
      }) as any,
      {
        name: 'sumQuantity',
        width: 120,
      },
      {
        name: 'srmTaxRate',
        width: 120,
      },
      {
        name: 'sumTaxIncludedAmount',
        width: 120,
      },
      {
        name: 'sumNetAmount',
        width: 120,
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        name: 'requestedByRealName',
        width: 120,
      },
      {
        name: 'settleDetail',
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewSettleLine(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ].filter(item => item),
    [handleViewSettleLine, isPoAllFlag]
  );

  return (
    <div className={styles['ssta-ecauto-content']}>
      <SearchBar
        expandable={false}
        closeFilterSelector
        dataSet={[lineDs]}
        searchCode="SSTA.ECAUTO_BILL_DETAIL.FILTER"
        fieldProps={{
          itemName: {
            dynamicProps: {
              disabled: () => lineDs.getState('isPoAllFlag'),
            },
          },
        }}
        left={{
          render: (_, customizeDs) => (
            <MultiTextFilter
              className={styles['ssta-autobill-multi-text-filter']}
              style={{ marginBottom: '3px', width: 300, fontSize: '14px' }}
              name="asnLineNums"
              dataSet={customizeDs}
              placeholder={intl
                .get(`ssta.ecAutoBill.model.ecAutoBill.placeHolder.asnLineNum`)
                .d('请输入电商送货单行号')}
            />
          ),
        }}
      />

      <div className={styles['ssta-ecauto-tables']}>
        <div className={styles['ssta-ecauto-tables-item']}>
          {customizeTable(
            { code: 'SSTA.ECAUTO_BILL_DETAIL.EC' },
            <Table
              dataSet={lineDs}
              columns={eCColumns}
              pagination={false}
              queryBar={TableQueryBarType.none}
            />
          )}
        </div>
        <div className={styles['ssta-ecauto-tables-item']}>
          <img src={arrow} alt="" className={styles['ssta-ecauto-tables-arrow']} />
          {customizeTable(
            { code: 'SSTA.ECAUTO_BILL_DETAIL.OPTION' },
            <Table
              dataSet={lineDs}
              columns={optionColumns}
              pagination={false}
              queryBar={TableQueryBarType.none}
            />
          )}
        </div>
        <div className={styles['ssta-ecauto-tables-item']}>
          <img src={arrow} alt="" className={styles['ssta-ecauto-tables-arrow']} />
          {customizeTable(
            { code: 'SSTA.ECAUTO_BILL_DETAIL.PRICE' },
            <Table
              dataSet={lineDs}
              columns={priceColumns}
              queryBar={TableQueryBarType.none}
              className={styles['ssta-ecauto-price-line']}
              pagination={false}
            />
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', marginTop: 10 }}>
        <Pagination dataSet={lineDs} showQuickJumper />
        <span style={{ textAlign: 'right' }}>
          {intl
            .get(`ssta.ecAutoBill.view.ecAutoBill.showLines`, {
              lineTotalCount,
              totalCount: lineDs.totalCount,
            })
            .d(`当前对账单共计 {lineTotalCount} 行，您当前有权限查看 {totalCount} 行`)}
        </span>
      </div>
    </div>
  );
});

export default Line;