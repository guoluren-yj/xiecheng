import React, { useMemo, useCallback } from 'react';
import { Table, Modal, DataSet, Tooltip } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import intl from 'utils/intl';

import DetailDrawer from './DetailDrawerNew';
import { settleLineDS } from '../../../stores/EcAutoBillDS';
import styles from './index.less';
import commonStyles from '../../common.less';

const SettleLineModal = (props) =>
{

  const {
    record,
    customizeTable,
  } = props;

  const settleLineDs = useMemo<DataSet>(() => new DataSet(settleLineDS(record)), [record]);

  const handleViewSettleDetail = useCallback(
    (record) =>
    {
      const title = intl.get('hzero.common.button.viewDetail').d('查看详情');
      Modal.open({
        title,
        drawer: true,
        closable: true,
        destroyOnClose: true,
        className: commonStyles['ssta-detailDrawer-modal'],
        children: <DetailDrawer {...props} record={record} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [props]
  );

  const settleLineColumns = useMemo<ColumnProps[]>(
    () => [
      {
        name: 'settleNum',
        width: 170,
      },
      {
        name: 'souceSettleAndLineNum',
        width: 180,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'netPriceMeaning',
        width: 180,
      },
      {
        name: 'unitPriceBatch',
        width: 120,
      },
      {
        name: 'netAmountMeaning',
        width: 180,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'taxAmount',
        width: 180,
      },
      {
        name: 'taxIncludedPriceMeaning',
        width: 180,
        renderer: ({ text, record }) =>
        {
          const { priceDifferenceFlag } = record?.get(['priceDifferenceFlag']) || {};
          return (
            <span>
              {text}
              {Number(priceDifferenceFlag) === 1 && (
                <Tooltip
                  title={
                  intl
                    .get('ssta.ecAutoBill.model.tooltip.priceValueWarning')
                    .d('请注意：当前子订单中的商品因赠品售后或售后破损等问题，您需要向京东赔付差额')
                }
                  placement="top"
                > <span className={styles["ssta-ecauto-price-warn"]}>!</span>
                </Tooltip>
              )
              }
            </span>
          );

        },
      },
      {
        name: 'taxIncludedAmountMeaning',
        width: 180,
      },
      {
        name: 'settleMatchDimensionMeaning',
        width: 180,
      },
      {
        name: 'settleBasePriceMeaning',
        width: 180,
      },
      {
        name: 'enableQuantity',
        width: 150,
      },
      {
        name: 'orignPriceMeaning',
        width: 150,
      },
      {
        name: 'enableAmountMeaning',
        width: 150,
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewSettleDetail(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ],
    [handleViewSettleDetail]
  );

  return customizeTable(
    { code: 'SSTA.ECAUTO_BILL_DETAIL.SETTLEMENTINFORMATION' },
    <Table columns={settleLineColumns} dataSet={settleLineDs} style={{ maxHeight: 'calc(100vh - 210px)' }} />
  );
};

export default SettleLineModal;
