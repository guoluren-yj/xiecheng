import React from 'react';
import OperationRecord from '_components/OperationRecord';

import { colorRender } from '../globalFunction';
// import intl from 'utils/intl';

/**
 * tab页面参数
 * @menuMarkId 是否为数据池数据
 * @_key 各个tab的页面
 * * */
// 待提交
export const submitColumns = (_object, props) => {
  const { hdKey, summarization, doubleUnitEnabled, allDetailEntrance = (e) => e } = _object;

  // 标签-待提交
  const labelColumns = [
    {
      name: 'statusCodeMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'displayLabelNum', // 单据编号
      width: 180,
      renderer: ({ value, record }) => {
        return (
          <a onClick={() => allDetailEntrance(record.get('labelHeaderId'), _object, props)}>
            {value}
          </a>
        );
      },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 150,
    },
    {
      name: 'invOrganizationName', // 收货组织
      width: 120,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'creationDate', // 创建时间
      width: 160,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'operating', // 操作记录
      width: 100,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_label_header"
          tablePk={record.get('labelHeaderId')}
          // businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];
  // 计划-待提交
  const planColumns = [
    {
      name: 'statusCodeMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'displayPlanNum', // 单据编号
      width: 180,
      renderer: ({ value, record }) => {
        return (
          <a onClick={() => allDetailEntrance(record.get('planHeaderId'), _object, props)}>
            {value}
          </a>
        );
      },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 150,
    },
    // {
    //   name: 'invOrganizationName', // 收货组织 先注释调 后端没有去值逻辑
    //   width: 120,
    // },
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
      width: 100,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_plan_header"
          tablePk={record.get('planHeaderId')}
          // businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];
  // 计划-待提交-按行
  const planHangColumns = [
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
      // renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 120,
    },
    {
      name: 'plannedArrivalDate',
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
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
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
      name: 'createdName', // 创建人
      width: 120,
    },
  ];
  // 送货-待提交
  const asnColumns = [
    {
      name: 'statusCodeMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'displayAsnNum', // 单据编号
      width: 180,
      renderer: ({ value, record }) => {
        return (
          <a onClick={() => allDetailEntrance(record.get('asnHeaderId'), _object, props)}>
            {value}
          </a>
        );
      },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 150,
    },
    {
      name: 'invOrganizationName', // 收货组织
      width: 120,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'creationDate', // 创建时间
      width: 160,
    },
    {
      name: 'strategyName', // 发货策略
      width: 160,
    },
    {
      name: 'sourceCodeMeaning', // 来源系统
      width: 120,
    },
    {
      name: 'operating', // 操作记录
      width: 100,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_asn_header"
          tablePk={record.get('asnHeaderId')}
          // businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];
  if (hdKey === 'left') {
    if (summarization === 'PLAN') return planColumns; // 计划
    if (summarization === 'ASN') return asnColumns; // 送货
    if (summarization === 'LABEL') return labelColumns; // 标签
    if (summarization === 'UNIQUE_LABEL') return labelColumns; // 唯一标签
  }
  if (hdKey === 'right') {
    if (summarization === 'PLAN') return planHangColumns; // 计划
  }
};
