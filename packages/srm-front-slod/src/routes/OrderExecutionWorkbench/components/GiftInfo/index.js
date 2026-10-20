/*
 * GiftInfo - 订单明细页-赠品行信息
 * @date: 2023/04/11 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */

import React, { useMemo, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 * @param {*} param
 * poHeaderId 明细页面赠品明细信息查询
 * @returns dsConfig
 */
export const giftInfoDsConfig = ({ poHeaderId, type, params: newParams = {} }) => {
  return {
    selection: false,
    dataToJSON: 'all',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    pageSize: 20,
    fields: [
      {
        name: 'order',
        label: intl.get('sodr.workspace.model.giftInfo.order').d('序号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sodr.workspace.model.giftInfo.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sodr.workspace.model.giftInfo.itemName').d('物料名称'),
      },
      {
        name: 'quantity',
        label: intl.get('sodr.workspace.model.giftInfo.quantity').d('数量'),
      },
      {
        name: 'uomId',
        label: intl.get('sodr.workspace.model.giftInfo.uomId').d('单位'),
      },
      {
        name: 'enteredTaxIncludedPrice',
        label: intl.get('sodr.workspace.model.giftInfo.enteredTaxIncludedPrice').d('单价(含税)'),
      },
      {
        name: 'unitPrice',
        label: intl.get('sodr.workspace.model.giftInfo.unitPrice').d('单价(不含税)'),
      },
      {
        name: 'categoryId',
        label: intl.get('sodr.workspace.model.giftInfo.categoryId').d('物料类别'),
      },
      {
        name: 'needByDate',
        label: intl.get('slod.orderExecution.model.common.needByDate').d('需求日期'),
        type: 'date',
      },
      {
        name: 'promiseDeliveryDate',
        label: intl.get('slod.orderExecution.model.common.promiseDeliveryDate').d('承诺交货日期'),
        type: 'date',
        dynamicProps: {
          required: ({ record }) =>
            record.get(
              type === 'toBeFeedback' ? 'deliveryDateEnableFlag' : 'deliveryDateEnableFlagConfirm'
            ),
        },
      },
      {
        name: 'giftSourceDisplayLineNum',
        label: intl.get('sodr.workspace.model.giftInfo.displayLineNum').d('赠品来源行号'),
      },
    ],
    transport: {
      read({ params }) {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line-gifts/${poHeaderId}`,
          method: 'get',
          params: { ...params, ...newParams },
        };
      },
    },
  };
};

export const GiftInfo = (props) => {
  const { ds, type, customizeTable, code } = props;
  const renderOrder = ({ dataSet, record }) => {
    return (dataSet.currentPage - 1) * dataSet.pageSize + record.index + 1;
  };
  const columns = useMemo(
    () => [
      {
        name: 'order',
        width: 50,
        renderer: renderOrder,
      },
      {
        name: 'itemCode',
        width: 180,
      },
      {
        name: 'itemName',
      },
      {
        name: 'quantity',
        width: 100,
      },
      {
        name: 'uomId',
        width: 150,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 100,
      },
      {
        name: 'unitPrice',
        width: 100,
      },
      {
        name: 'categoryId',
        width: 130,
        renderer: ({ record }) => record.get('categoryName'),
      },
      {
        name: 'needByDate',
        width: 130,
      },
      {
        name: 'promiseDeliveryDate',
        width: 130,
        editor: (record) =>
          record.get(
            type === 'toBeFeedback' ? 'deliveryDateEditFlag' : 'deliveryDateEditFlagConfirm'
          ) === 1,
      },
      {
        name: 'giftSourceDisplayLineNum',
        width: 120,
      },
    ],
    [type]
  );

  useEffect(() => {
    ds.query();
  }, []);
  return customizeTable ? (
    customizeTable({ code }, <Table dataSet={ds} columns={columns} />)
  ) : (
    <Table dataSet={ds} columns={columns} />
  );
};
