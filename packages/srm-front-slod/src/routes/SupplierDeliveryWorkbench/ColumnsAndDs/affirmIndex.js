/*
 * @Description: 发货工作台-待确认
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import OperationRecord from '_components/OperationRecord';
import { showBigNumber } from '@/routes/components/utils';
import { RenderChat } from '../../../components/Chat/index';
import { colorRender } from '../globalFunction';

const affirmColumns = (_object, props) => {
  const {
    menuMarkId,
    summarization,
    hdKey,
    allDetailEntrance = (e) => e,
    lebelDetailModal = (e) => e,
    doubleUnitEnabled,
  } = _object;
  // 标签-待确认-按单
  const labelDanColumns = [
    {
      name: 'statusCodeMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    // {
    //   title: intl.get('slod.deliveryWorkbench.model.common.operate').d('操作'),
    //   name: 'operate', // 操作
    //   width: 120,
    // },
    {
      name: 'displayLabelNum', // 单据编号
      width: 170,
      renderer: ({ value, record, dataSet }) => {
        return (
          <RenderChat
            value={value}
            id={record?.get('labelHeaderId')}
            data={dataSet?.getState('chatList')}
          >
            <a onClick={() => allDetailEntrance(record.get('labelHeaderId'), _object, props)}>
              {value}
            </a>
          </RenderChat>
        );
      },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 200,
    },
    {
      name: 'createCampCodeMeaning', // 创建方
      width: 120,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'creationDate', // 创建时间
      width: 180,
    },
    {
      name: 'processingNodeMeaning', // 当前处理节点
      width: 120,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'operating', // 操作记录
      width: 120,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_label_header"
          tablePk={record.get('labelHeaderId')}
          color="#1D2129"
          // businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];

  // 标签-待确认-按行
  const labelHangColumns = [
    {
      name: 'lineStatusMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'processingNodeMeaning', // 当前处理节点
      width: 120,
    },
    {
      name: 'displayLabelNum', // 单据编号-行号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) {
          return (
            <a onClick={() => allDetailEntrance(record.get('labelHeaderId'), _object, props)}>
              {`${value}-${record.get('displayLabelLineNum')}`}
            </a>
          );
        }
        return '-';
      },
    },
    {
      name: 'itemCode', // 物料编码
      width: 140,
    },
    {
      name: 'itemName', // 物料名称
      width: 140,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom', // 基本单位
      width: 80,
    },
    {
      name: 'displayUom', // 单位
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'fillSecondaryQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'quantity', // 标签数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'unitPackageQuantity', // 单包装数
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'packageQuantity', // 比例份数
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'remainderQuantity', // 尾数
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'volumeLength', // 体积长
      width: 120,
    },
    {
      name: 'volumeWidth', // 体积宽
      width: 120,
    },
    {
      name: 'volumeHeight', // 体积高
      width: 120,
    },
    {
      name: 'netWeight', // 净重
      width: 120,
    },
    {
      name: 'grossWeight', // 毛重
      width: 120,
    },
    {
      name: 'lotNum', // 批次号
      width: 120,
    },
    {
      name: 'productionDate', // 生产日期
      width: 120,
    },
    {
      name: 'lotExpirationDate', // 批次有效期
      width: 120,
    },
    {
      name: 'serialNum', // 序列号
      width: 120,
    },
    {
      name: 'labelDetail', // 标签明细   -  - - - - - - 跳转字段
      width: 120,
      renderer: ({ record }) => {
        return (
          <Button
            funcType="link"
            color="primary"
            onClick={() =>
              lebelDetailModal(record.get('labelLineId'), {
                ..._object,
                customizeTable: props.customizeTable,
              })
            }
          >
            {intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细')}
          </Button>
        );
      },
    },
    {
      name: 'purchaseLineRemark', // 采购方行备注
      width: 140,
    },
    {
      name: 'supplierLineRemark', // 供应商行备注
      width: 140,
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 140,
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 200,
    },
    {
      name: 'createCampCodeMeaning', // 创建方
      width: 120,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 计划-待确认-按单
  const planDanColumns = [
    {
      name: 'statusCodeMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'displayPlanNum', // 单据编号
      width: 180,
      renderer: ({ value, record, dataSet }) => {
        const _obj =
          record?.get('statusCode') === 'CHANGE_PURCHASER_REJECTED'
            ? { ..._object, change: 'change', tabKey: 'all' }
            : _object;
        return (
          <RenderChat
            value={value}
            id={record?.get('planHeaderId')}
            data={dataSet?.getState('chatList')}
          >
            <a onClick={() => allDetailEntrance(record.get('planHeaderId'), _obj, props)}>
              {value}
            </a>
          </RenderChat>
        );
      },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 200,
    },
    {
      name: 'createCampCodeMeaning', // 创建方   值集 SLOD.CAMP_CODE  头-行
      type: 'string',
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'creationDate', // 创建时间
      width: 180,
    },
    {
      name: 'processingNodeMeaning', // 当前处理节点
      width: 120,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'sourceCodeMeaning', // 来源系统
      width: 120,
    },
    {
      name: 'operating', // 操作记录
      width: 120,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_plan_header"
          tablePk={record.get('planHeaderId')}
          color="#1D2129"
          // businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];

  // 计划-待确认-按行
  const pianHangColumns = [
    {
      name: 'lineStatusMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'displayPlanNum', // 行号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) {
          return (
            <a onClick={() => allDetailEntrance(record.get('planHeaderId'), _object, props)}>
              {`${value}-${record.get('displayPlanLineNum')}`}
            </a>
          );
        }
        return '-';
      },
    },
    {
      name: 'itemCode', // 物料编码
      width: 140,
    },
    {
      name: 'itemName', // 物料名称
      width: 130,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom', // 基本单位
      width: 80,
    },
    {
      name: 'displayUom', // 单位
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'plannedArrivalDate',
      width: 140,
    },
    doubleUnitEnabled && {
      name: 'fillSecondaryQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'quantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'confirmArrivalDate',
      width: 120,
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 140,
    },
    {
      name: 'neededDate',
      width: 120,
    },
    {
      name: 'promisedDate',
      width: 120,
    },
    {
      name: 'purchaseLineRemark', // 采购方行备注
      width: 140,
    },
    {
      name: 'supplierLineRemark', // 供应商行备注
      width: 140,
    },
    {
      name: 'companyName', // 公司
      width: 120,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 200,
    },
    {
      name: 'agentName',
      width: 120,
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'invOrganizationName',
      width: 140,
    },
    {
      name: 'receiveAddress',
      width: 150,
    },
    {
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'updatedName',
      width: 120,
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 送货-待确认-按单
  const asnDanColumns = [
    {
      name: 'statusCodeMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'displayAsnNum', // 单据编号
      width: 180,
      renderer: ({ value, record, dataSet }) => {
        const _obj =
          record?.get('statusCode') === 'CHANGE_PURCHASER_REJECTED'
            ? { ..._object, change: 'change', tabKey: 'all' }
            : _object;
        return (
          <RenderChat
            value={value}
            id={record?.get('asnHeaderId')}
            data={dataSet?.getState('chatList')}
          >
            <a onClick={() => allDetailEntrance(record.get('asnHeaderId'), _obj, props)}>{value}</a>
          </RenderChat>
        );
      },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 200,
    },
    {
      name: 'invOrganizationName', // 收货组织
      width: 140,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'creationDate', // 创建时间
      width: 180,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'sourceCodeMeaning', // 来源系统
      width: 120,
    },
    {
      name: 'operating', // 操作记录
      width: 120,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_asn_header"
          tablePk={record.get('asnHeaderId')}
          color="#1D2129"
          // businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];

  // 送货-待确认-按行
  const asnHangColumns = [
    {
      name: 'lineStatusMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'displayAsnNum', // 单据编号-行号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) {
          return (
            <a onClick={() => allDetailEntrance(record.get('asnHeaderId'), _object, props)}>
              {`${value}-${record.get('displayAsnLineNum')}`}
            </a>
          );
        }
        return '-';
      },
    },
    {
      name: 'itemCode', // 物料编码
      width: 140,
    },
    {
      name: 'itemName', // 物料名称
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom', // 基本单位
      width: 80,
    },
    {
      name: 'displayUom', // 单位
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    doubleUnitEnabled && {
      name: 'fillSecondaryQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'quantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'unitPackageQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'packageQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'remainderQuantity', // 尾数
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'netWeight', // 净重
      width: 120,
    },
    {
      name: 'grossWeight', // 毛重
      width: 120,
    },
    {
      name: 'weightUomName',
      width: 120,
      renderer: ({ record }) => record?.get('displayWeightUom') || '-',
    },
    {
      name: 'lotNum', // 批次号
      width: 120,
    },
    {
      name: 'productionDate', // 生产日期
      width: 120,
    },
    {
      name: 'shelfLife',
      width: 120,
    },
    {
      name: 'lotExpirationDate', // 批次有效期
      width: 120,
    },
    {
      name: 'serialNum', // 序列号
      width: 120,
    },
    {
      name: 'purchaseLineRemark', // 采购方行备注
      width: 140,
    },
    {
      name: 'supplierLineRemark', // 供应商行备注
      width: 140,
    },
    {
      name: 'companyName', // 公司
      width: 120,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 200,
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 140,
    },
    {
      name: 'shipToLocContName',
      width: 120,
    },
    {
      name: 'shipToLocTelNum',
      width: 120,
    },
    {
      name: 'productNum', // 商品编码
      width: 140,
    },
    {
      name: 'productName', // 商品名称
      width: 120,
    },
    {
      name: 'catalogName', // 商品目录
      width: 120,
    },
    {
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      name: 'creationDate', // 创建时间
      width: 180,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'updatedName',
      width: 120,
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  if (hdKey === 'right') {
    if (menuMarkId === 'all') {
      let columns;
      switch (summarization) {
        case 'PLAN':
          columns = pianHangColumns;
          break;
        case 'ASN':
          columns = asnHangColumns;
          break;
        case 'LABEL':
          columns = labelHangColumns;
          break;
        case 'UNIQUE_LABEL':
          columns = labelHangColumns;
          break;
        default:
          // columns=labelColumns;
          break;
      }
      return columns;
    } else {
      if (summarization === 'PLAN') return pianHangColumns; // 计划
      if (summarization === 'ASN') return asnHangColumns; // 送货
      if (summarization === 'LABEL') return labelHangColumns; // 标签
      if (summarization === 'UNIQUE_LABEL') return labelHangColumns; // 唯一标签
    }
  } else if (hdKey === 'left') {
    if (menuMarkId === 'all') {
      let columns;
      switch (summarization) {
        case 'PLAN':
          columns = planDanColumns;
          break;
        case 'ASN':
          columns = asnDanColumns;
          break;
        case 'LABEL':
          columns = labelDanColumns;
          break;
        case 'UNIQUE_LABEL':
          columns = labelDanColumns;
          break;
        default:
          // columns=labelColumns;
          break;
      }
      return columns;
    } else {
      if (summarization === 'PLAN') return planDanColumns; // 计划
      if (summarization === 'ASN') return asnDanColumns; // 送货
      if (summarization === 'LABEL') return labelDanColumns; // 标签
      if (summarization === 'UNIQUE_LABEL') return labelDanColumns; // 唯一标签
    }
  }
};
export { affirmColumns };
