/*
 * GiftInfo - 订单明细页-赠品行信息
 * @date: 2023/04/11 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */

import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 * @param {*} param
 * poHeaderId 明细页面赠品明细信息查询
 * poHeaderIds 列表页批量提交预览 || 明细页提交预览
 * @returns dsConfig
 */
export const giftInfoDsConfig = ({ poHeaderId, poHeaderIds, params: newParams = {} }) => {
  return {
    selection: false,
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
        label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
        type: 'date',
      },
      {
        name: 'promiseDeliveryDate',
        label: intl.get('sodr.workspace.model.common.promiseDeliveryDate').d('承诺交货日期'),
        type: 'date',
      },
      {
        name: 'giftSourceDisplayLineNum',
        label: intl.get('sodr.workspace.model.giftInfo.displayLineNum').d('赠品来源行号'),
      },
    ],
    transport: {
      read({ params }) {
        return poHeaderId
          ? {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line-gifts/${poHeaderId}`,
              method: 'get',
              params: { ...params, ...newParams },
            }
          : {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line-gifts/batch-submit`,
              method: 'post',
              data: { poHeaderIds },
              params: { ...params, ...newParams },
            };
      },
    },
  };
};

export const GiftInfo = (props) => {
  /**
   * ds 赠品行dataSet
   * sourceMaintenance 是否来源于维护页面（控制 需求日期/承诺交货日期 字段显示逻辑）
   * customizeTable 个性化表格
   * code 个性化编码
   */
  const { ds, sourceMaintenance, customizeTable, code } = props;
  const renderOrder = ({ dataSet, record }) => {
    return (dataSet.currentPage - 1) * dataSet.pageSize + record.index + 1;
  };
  const columns = useMemo(() => {
    const defaultColumns = [
      {
        name: 'order',
        // width: 50,
        renderer: renderOrder,
      },
      {
        name: 'itemCode',
        // width: 180,
      },
      {
        name: 'itemName',
      },
      {
        name: 'quantity',
        // width: 100,
      },
      {
        name: 'uomId',
        // width: 150,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'enteredTaxIncludedPrice',
        // width: 100,
      },
      {
        name: 'unitPrice',
        // width: 100,
      },
      {
        name: 'categoryId',
        // width: 130,
        renderer: ({ record }) => record.get('categoryName'),
      },
      !sourceMaintenance && {
        name: 'needByDate',
      },
      !sourceMaintenance && {
        name: 'promiseDeliveryDate',
      },
      {
        name: 'giftSourceDisplayLineNum',
        // width: 120,
      },
    ];
    return defaultColumns.filter((i) => i);
  }, []);

  return customizeTable ? (
    customizeTable(
      {
        code,
      },
      <Table dataSet={ds} columns={columns} />
    )
  ) : (
    <Table dataSet={ds} columns={columns} />
  );
};
