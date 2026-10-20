/*
 * C7nPriceModal - 工作台参考价格弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { observer } from 'mobx-react-lite';
import { isNil } from 'lodash';
import React, { useMemo, useEffect } from 'react';
import { Alert } from 'choerodon-ui';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { priceTable, ladderPrice } from './store/c7nPriceModalDs';
import { getFlexLink } from '@/routes/QuotePurchaseRequisition/utils';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();

const C7nPriceModal = (props) => {
  const {
    code,
    modal,
    params = {},
    customizeTable,
    readOnly = true, // 调用的api判断, 目前false只用在引用单据创建采购申请
    tableReadOnly, // 现仅埋点会传
    summaryFlag,
  } = props;
  const realTableReadOnly = useMemo(
    () => (isNil(tableReadOnly) ? summaryFlag === 1 || readOnly : tableReadOnly),
    [tableReadOnly, readOnly, summaryFlag]
  );
  useEffect(() => {
    if (modal) {
      const { update } = modal;
      const { onOk } = modal.props;
      update({
        onOk: () => onOk(priceTableDs),
      });
    }
    priceTableDs.query();
  }, []);

  const priceTableDs = useMemo(
    () =>
      new DataSet({
        ...priceTable(),
        transport: {
          read: ({ params: _params }) => {
            return readOnly
              ? {
                  url: `${SRM_SPUC}/v1/${tenantId}/po-header/reference-price`,
                  method: 'GET',
                  data: { ...params, customizeUnitCode: code },
                }
              : {
                  url: `${SRM_SPUC}/v1/${tenantId}/po-header/new-reference-price`,
                  method: 'PUT',
                  data: params,
                  params: { customizeUnitCode: code, ..._params },
                };
          },
        },
      }),
    []
  );
  const ladderPriceDs = useMemo(() => new DataSet(ladderPrice()));
  const ladderPriceColumns = useMemo(() => [
    {
      name: 'ladderLineNum',
    },
    {
      name: 'numberRange',
      renderer: ({ record }) => {
        const { ladderFrom, ladderTo } = record.get(['ladderFrom', 'ladderTo']);
        return `[${isNil(ladderFrom) ? '-' : ladderFrom},${isNil(ladderTo) ? '-' : ladderTo})`;
      },
    },
    {
      name: 'ladderPrice',
    },
    {
      name: 'ladderPriceRemark',
    },
  ]);

  const openLadderPriceModal = (record) => {
    ladderPriceDs.loadData(record.get('ladderPriceLibList') || []);
    Modal.open({
      title: intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格'),
      style: { width: 582 },
      drawer: true,
      destroyOnClose: true,
      children: <Table dataSet={ladderPriceDs} columns={ladderPriceColumns} />,
    });
  };
  const columns = useMemo(() => {
    const defaultColumns = [
      {
        name: 'taxPrice',
        width: 120,
      },
      {
        name: 'unitPrice',
        width: 120,
      },
      {
        name: 'uomCodeName',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'taxCode',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'ladderPrice',
        width: 120,
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') === 1 && (
            <a onClick={() => openLadderPriceModal(record)}>
              {intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格')}
            </a>
          ),
      },
      {
        name: 'priceSource',
        width: 120,
        renderer: ({ record }) => record.get('priceSourceMeaning'),
      },
      {
        name: 'orderNum',
        width: 150,
        renderer: ({ text, record }) => getFlexLink(text, record.toData(), 'c7n'),
      },
    ];
    const requestColumns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 210,
      },
    ];
    if (readOnly) {
      defaultColumns.unshift(...requestColumns);
    }
    return defaultColumns;
  }, []);

  const table = (
    <Table
      dataSet={priceTableDs}
      columns={columns}
      selectionMode={realTableReadOnly ? 'none' : 'rowbox'}
      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
      virtual
      virtualCell
    />
  );

  return (
    <>
      {!!priceTableDs?.totalCount && summaryFlag === 1 && (
        <Alert
          showIcon
          type="info"
          className={styles['order-top-title']}
          message={intl
            .get(`sodr.workspace.modal.common.reference.price.alert`)
            .d('当前订单需汇总取价，不支持单行选择参考价格变更单价')}
        />
      )}
      {customizeTable
        ? customizeTable(
            {
              code,
            },
            table
          )
        : table}
    </>
  );
};

export default observer(C7nPriceModal);
