
/**
 * index.js 关联单据
 * @date: 2024-01-29
 * @author: zuoxiangyu <xaingyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2024, Hand
 */
import React from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { SRM_SPUC } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';


const organizationId = getCurrentOrganizationId();

/**
 * 收货管理配置 - 行信息
 * @delivery {*} params
 * return arr
 */
function lineColumns(history): any{

  const nodeColumns = [
    {
        name: 'displayTrxNum',
        type: 'string',
        label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNum_num')
              .d('收货单据编号-行号'),
          renderer: ({ value, record }) => {
            if (record?.get("orderLinkId") > 0) {
              return (
                <a onClick={() => {
                    history.push({
                        pathname: `/sinv/receipt-workbench/detail/${record?.get('rcvTrxHeaderId')}`,
                        search: `?ttype=END&from=three&viewType=wide&nodeConfigIndexAbc=${record?.get('nodeConfigIndexAbc')}`,
                      });
                  }}
                >{`${value}-${record?.get("trxLineNum")}`}
                </a>
            );
            } else {
              return <span>{`${value}-${record?.get("trxLineNum")}`}</span>;
            }
        },
    },
    {
        name: 'rcvStatusMeaning',
        type: 'string',
        label: intl
          .get('sinv.receiptExecution.model.receipt.orderTypeName.rcvNumStatusCodeMeaning')
          .d('收货单据状态'),
    },
    {
        name: 'rcvTrxTypeName',
        type: 'string',
        label: intl
          .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNodeType')
          .d('执行类型'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('sinv.receiptWorkbench.model.receipt.executesQuantity').d('执行数量'),
    },
    {
      name: 'creationDate',
      type: 'string',
      width: 140,
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
      renderer: ({ value }) => {
        if (value) {
          return value;
        } else {
          return "-";
        }
      },
    },
    {
      name: 'createdUserName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
  ];
  return { nodeColumns };
}

// const queryingNodeData = (asnLineId) => {

//   const url = `${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/asn-rcv-records-new?customizeUnitCode=SINV.PURCHASER_DELIVERY_LIST.CARDS`;
//   return request(url, {
//     method: 'POST',
//     body: {asnLineId},
//   });
// };

const queryingNodeData = (data) => {
  const { params, ...other } = data;
  const queryData = filterNullValueObject({ ...params, ...other });
  return {
    url: `${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/asn-rcv-records-new?customizeUnitCode=SINV.PURCHASER_DELIVERY_LIST.CARDS`,
    method: 'GET',
    data: {
      ...queryData,
      tenantId: organizationId,
    },
  };
};

export {lineColumns, queryingNodeData };
