
/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { stringify } from 'querystring';
import intl from 'hzero-front/lib/utils/intl';
import { SRM_SPUC } from 'srm-front-boot/lib/utils/config.js';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { custNode } from './_utils';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

/**
   * 状态颜色控制
   */
const colorRender = (_value) => {
  const value = String(_value);
  if (['1'].includes(value)) {
    // 绿色: 启用
    return (
      <Tag style={{ border: 'none' }} color="green">
        <span>{intl.get('hzero.common.bomViewStatus.enable').d('启用')}</span>
      </Tag>
    );
  } else if (['0'].includes(value)) {
    //  灰色: 禁用
    return (
      <Tag style={{ border: 'none' }} color="red">
        <span>{intl.get('hzero.common.status.disabled').d('禁用')}</span>
      </Tag>
    );
  } else {
    return '-';
  }
};

/**
 * 收货管理配置 - 行信息
 * @delivery {*} params
 * return arr
 */
function lineColumns(history, workFlag, handleSaveEnableChange): any{
  /**
   * 收货管理配置 - 节点信息
   * @delivery {*} params
   * return arr
   */
  const nodeColumns = [
    {
        name: 'nodeConfigCode',
        type: 'number',
        width: 70,
        label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
    },
    {
        name: 'nodeConfigName',
        type: 'string',
        width: 100,
        label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
    },
    {
        name: 'nodeOrderTypeMeaning',
        type: 'string',
        custHidden: workFlag,
        width: 70,
        label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
    },
    {
        name: 'nodeCodeRuleMeaning',
        type: 'string',
        // width: 180,
        label: intl.get('sinv.receiptManage.model.receipt.nodeCodeRule').d('单号编码规则'),
        renderer: ({ value, record }) =>
        record.get('nodeOrderType') === 'RCV' && value ? value : '',
    },
    {
        name: 'refRcvTypeCode',
        type: 'string',
        // width: 180,
        label: intl
            .get('sinv.receiptManage.model.receipt.receiptRcvTrxTypCode')
        .d('平台收货类型编码'),
        help: intl
          .get('sinv.receiptManage.model.receipt.receiptExplain')
          .d(
            '单据不显示此类型，仅用于系统判断是否需将收货数据匹配到订单/送货单；请在【租户收货类型】中维护明细用于体现业务数据分类'
          ),
    },
    {
        name: 'rcvTypeName',
        type: 'string',
        width: 140,
        label: intl.get('sinv.receiptManage.model.receipt.receiptRcvName').d('平台收货类型描述'),
    },
    {
      name: 'nodeConfigIndexAbc',
      type: 'string',
      width: 110,
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigIndexAbc').d('关联个性化单元'),
      renderer: ({value }) => value&& custNode(value) || '-',
    },
    {
        name: 'reverseEnable',
        type: 'string',
        width: 70,
        label: intl.get('sinv.receiptManage.model.receipt.yesReturns').d('可退货'),
        renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'detailMaintain',
      type: 'string',
      width: 80,
      label: intl.get('sinv.receiptManage.model.receipt.operate').d('操作'),
      headerStyle: {
        textAlign: 'left',
      },
      renderer: ({ record }) => {
        const dis = record.get('nodeOrderType') !== 'RCV';
        return (
          [
            <div className={styles['operate-syle']}>
              <Button
                disabled={dis}
                color={ButtonColor.primary}
                funcType={FuncType.link}
                onClick={() => detailLink(record, 'node', "1", "1")}
              >
                {intl.get('sinv.receiptManage.view.button.edit').d('编辑')}
              </Button>
              {/* {!(record.get('trxLineCount') > 0) && ( <a onClick={()=>handleDeleteList(record, 'node')}>{intl.get(`hzero.common.button.delete`).d('删除')}</a>)} */}
            </div>,
         ]
        );
      },
    },
  ];
  /**
   * 收货管理配置 - 策略信息
   * @delivery {*} params
   * return arr
   */
  const strategyColumns = [
    {
      name: 'enabledFlag',
      type: 'string',
      width: 80,
      label: intl.get('hzero.common.common.status').d('状态'),
      renderer: ({ value }) => colorRender(value),
    },
    {
      name: 'detailMaintain',
      type: 'string',
      align: 'left',
      width: 150,
      label: intl.get('sinv.receiptManage.model.receipt.operate').d('操作'),
      renderer: ({record}) => {
        return (
          [
            <div>
              <Button
                color={ButtonColor.primary}
                funcType={FuncType.link}
                onClick={() => detailLink(record, 'strategy', "1", "1")}
              >{intl.get('sinv.receiptManage.view.button.edit').d('编辑')}
              </Button>
              {["0"].includes(record?.get('enabledFlag')) && (
                <Button
                  color={ButtonColor.primary}
                  funcType={FuncType.link}
                  onClick={() => handleSaveEnableChange(record, "1")}
                >{intl.get('hzero.common.bomViewStatus.enable').d('启用')}
                </Button>
              )}
              {["1"].includes(record?.get('enabledFlag')) && (
                <Button
                  color={ButtonColor.primary}
                  funcType={FuncType.link}
                  onClick={() => handleSaveEnableChange(record, "0")}
                >{intl.get('hzero.common.status.disabled').d('禁用')}
                </Button>
              )}
            </div>,
        ]
        );
      },
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.strategyCode').d('策略编号'),
      renderer: ({value, record }) => {
        return (
          <Button
            color={ButtonColor.primary}
            funcType={FuncType.link}
            onClick={() => detailLink(record, 'strategy', "0", null)}
          >{value}
          </Button>
        );
      },
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.strategyName').d('策略名称'),
    },
    {
      name: 'sourceOrderTypeMeaning',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.sourceOrderType').d('单据来源'),
    },
    {
      name: 'scheduledDeliveryFlag',
      type: 'string',
      custHidden: workFlag,
      label: intl.get('sinv.receiptManage.model.receipt.scheduledDeliveryes').d('按计划排程送货'),
      renderer: ({ value }) => yesOrNoRender(+value),
    },
  ];



  const detailLink=(record, type, readOnly, edKey): any => {
    const { nodeConfigId = '', nodeStrategyId = '' } = record.toData();
    const id = type === 'node' ? nodeConfigId : nodeStrategyId;
    const params = filterNullValueObject({
      tabsKey: type,
      editor: readOnly,
      edKey,
    });
    history.push({
      pathname: `/sinv/receipt-manage-config/detail/${id}`,
      search: stringify(params),
    });
  };
  return { nodeColumns, strategyColumns };
}

/**
 * 收货管理配置 - 节点查询
 * @delivery {*} params
 * return arr
 */
const queryingNodeData = (data) => {
  const { params, ...other } = data;
  const queryData = filterNullValueObject({ ...params, ...other });
  return {
    url: `${SRM_SPUC}/v1/${organizationId}/rcv-node-configs`,
    method: 'GET',
    data: {
      ...queryData,
      tenantId: organizationId,
    },
  };
};

/**
 * 收货管理配置 - 策略查询
 * @delivery {*} params
 * return arr
 */
const queryingStrategyData = (data) => {
  const { params, ...other } = data;
  const queryData = filterNullValueObject({ ...params, ...other });
  console.log(queryData, "queryData");
  return {
    url: `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-headers`,
    method: 'GET',
    data: {
      ...queryData,
      tenantId: organizationId,
    },
  };
};

const cuxLoad = (dataSet, dispatch) => {
  dispatch({
    type: 'receiptManageConfig/updateState',
    payload: {
      currentPages: dataSet?.currentPage,
    },
  });
};

export {lineColumns, queryingNodeData, queryingStrategyData, cuxLoad };
