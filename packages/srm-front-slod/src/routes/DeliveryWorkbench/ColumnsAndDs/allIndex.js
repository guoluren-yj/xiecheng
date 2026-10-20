import React from 'react';
import { Button } from 'choerodon-ui/pro';
// import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';

import intl from 'utils/intl';

import { yesOrNoRender } from 'utils/renderer';
import OperationRecord from '_components/OperationRecord';
import DocFlow from '_components/DocFlow';
import { showBigNumber } from '@/routes/components/utils';
import BtnApprovalCmp from '../components/BtnApprovalCmp';
import RenderExportComp from '../../DeliveryWorkbench/components/ExportStatusComp';
import {
  colorRender,
  onDownstreamNodeInfoRender,
  handleApprovalList,
  handleRevokeApprovalList,
  progressView,
} from '../globalFunction';
import { RenderChat } from '../../../components/Chat/index';

const allColumns = (_object, props) => {
  const {
    hdKey,
    tabKey,
    summarization,
    allDetailEntrance = (e) => e,
    lebelDetailModal = (e) => e,
    doubleUnitEnabled,
  } = _object;
  const { remote } = props;
  const dataSet = props?.tableConfigRef?.dataSet[`${tabKey}_${hdKey}`];

  // 标签-全部-按单 - label
  const labelDanColumns = [
    {
      name: 'operate',
      width: 150,
      renderer: ({ record }) => {
        const btnProps = {
          record,
          handleApprovalList,
          handleRevokeApprovalList,
          nodeConfigCode: summarization,
          tableConfigRef: props.tableConfigRef,
        };
        return <BtnApprovalCmp props={btnProps} dataSet={dataSet} />;
      },
    },
    {
      name: 'statusCodeMeaning',
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'displayLabelNum',
      width: 180,
      renderer: ({ value, record }) => {
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
      name: 'viewApproval',
      renderer: progressView,
      width: 150,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    {
      name: 'createdName',
      width: 120,
    },
    {
      name: 'createCampCodeMeaning',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 180,
    },
    {
      name: 'processingNodeMeaning',
      width: 120,
    },
    {
      name: 'submitSyncStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <RenderExportComp
          isByOrder
          value={value}
          record={record}
          summarization={summarization}
          remote={remote}
        />
      ),
    },
    {
      name: 'operating',
      width: 120,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_label_header"
          tablePk={record.get('labelHeaderId')}
          businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];
  // 标签-全部-按行 - label
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
      name: 'fillSecondaryQuantity', // 标签数量
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
    summarization === 'UNIQUE_LABEL' && {
      name: 'printFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(+value),
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
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
      // renderer: ({ value, record }) => {
      //   if (record.get('sourceType') !== 'PO') {
      //     return value;
      //   }
      // },
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
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'strategyDataVersion', // 发货策略版本
      width: 120,
    },
    {
      name: 'submitSyncStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <RenderExportComp
          value={value}
          record={record}
          summarization={summarization}
          remote={remote}
        />
      ),
    },
    {
      name: 'processDocuments',
      width: 100,
      renderer: ({ record }) => (
        <DocFlow
          tableName="slod_label_line"
          tablePk={record.get('labelLineId')}
          buttonType="button"
        />
      ),
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 计划-全部-按单 - Plan
  const planDanColumns = [
    {
      name: 'statusCodeMeaning',
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'operate',
      width: 150,
      renderer: ({ record }) => {
        const btnProps = {
          record,
          handleApprovalList,
          handleRevokeApprovalList,
          nodeConfigCode: summarization,
          // tableConfigRef: props.tableConfigRef,
        };
        if (record.get('allowChangeFlag') === 1) {
          return (
            <>
              <Button
                funcType="link"
                color="primary"
                onClick={() =>
                  allDetailEntrance(
                    record.get('planHeaderId'),
                    { ..._object, change: 'change' },
                    props
                  )
                }
              >
                {intl.get('slod.deliveryWorkbench.model.view.change').d('变更')}
              </Button>
              <BtnApprovalCmp props={btnProps} dataSet={dataSet} />
            </>
          );
        } else {
          return <BtnApprovalCmp props={btnProps} dataSet={dataSet} />;
        }
      },
    },
    {
      name: 'displayPlanNum',
      width: 180,
      renderer: ({ value, record }) => {
        return (
          <RenderChat
            value={value}
            id={record?.get('planHeaderId')}
            data={dataSet?.getState('chatList')}
          >
            <a onClick={() => allDetailEntrance(record.get('planHeaderId'), _object, props)}>
              {value}
            </a>
          </RenderChat>
        );
      },
    },
    {
      name: 'viewApproval',
      renderer: progressView,
      width: 150,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    {
      name: 'createdName',
      width: 120,
    },
    {
      name: 'createCampCodeMeaning',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 180,
    },
    {
      name: 'processingNodeMeaning',
      width: 120,
    },
    {
      name: 'submitSyncStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <RenderExportComp
          isByOrder
          value={value}
          record={record}
          summarization={summarization}
          remote={remote}
        />
      ),
    },
    {
      name: 'operating',
      width: 120,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_plan_header"
          tablePk={record.get('planHeaderId')}
          businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];

  // 计划-全部-按行 - Plan
  const pianHangColumns = [
    {
      name: 'lineStatusMeaning', // 状态
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'displayPlanNum', // 单据编号-行号
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
    {
      name: 'netPlanQuantity',
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
      name: 'receiveStatus', // 接收状态
      width: 120,
      renderer: ({ record }) => {
        return `${record.get('receiveStatusMeaning')}`;
      },
    },
    {
      name: 'downstreamNodeInfoList',
      width: 150,
      renderer: ({ value }) => onDownstreamNodeInfoRender(value, 'actualQuantity'),
      onCell: () => {
        return {
          style: {
            textAlign: 'center',
          },
        };
      },
    },
    {
      name: 'downstreamEnInfoList',
      width: 150,
      renderer: ({ record }) =>
        onDownstreamNodeInfoRender(record?.get('downstreamNodeInfoList'), 'transitQuantity'),
      onCell: () => {
        return {
          style: {
            textAlign: 'center',
          },
        };
      },
    },
    {
      name: 'receiveQuantity', // 接收数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
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
      // renderer: ({ value, record }) => {
      //   if (record.get('sourceType') !== 'PO') {
      //     return value;
      //   }
      // },
    },
    {
      name: 'poTypeName', // 订单类型
      width: 120,
    },
    {
      name: 'neededDate', // 需求日期
      width: 120,
    },
    {
      name: 'promisedDate', // 承诺交货日期
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
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
      name: 'receiveAddress',
      width: 140,
    },
    {
      name: 'splitFlag',
      width: 140,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      name: 'createdName',
      width: 120,
    },
    {
      name: 'updatedName',
      width: 120,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'strategyDataVersion', // 发货策略版本
      width: 120,
    },
    {
      name: 'submitSyncStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <RenderExportComp
          value={value}
          record={record}
          summarization={summarization}
          remote={remote}
        />
      ),
    },
    {
      name: 'processDocuments',
      width: 100,
      renderer: ({ record }) => (
        <DocFlow
          tableName="slod_plan_line"
          tablePk={record.get('planLineId')}
          buttonType="button"
        />
      ),
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 计划-全部-按日期 - Plan
  const planDateolumns = [
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
      name: 'fromDisplayPoLocationNum', // 发运号
      width: 120,
    },
    {
      name: 'poQuantity', // 订单数量
      width: 120,
    },
  ];

  // 送货-全部-按单 - asn
  const asnDanColumns = [
    {
      name: 'statusCodeMeaning',
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
    },
    {
      name: 'operate',
      width: 150,
      renderer: ({ record }) => {
        const btnProps = {
          record,
          handleApprovalList,
          handleRevokeApprovalList,
          nodeConfigCode: summarization,
          tableConfigRef: props.tableConfigRef,
        };
        if (record.get('allowChangeFlag') === 1) {
          return (
            <>
              <Button
                funcType="link"
                color="primary"
                onClick={() =>
                  allDetailEntrance(
                    record.get('asnHeaderId'),
                    { ..._object, change: 'change' },
                    props
                  )
                }
              >
                {intl.get('slod.deliveryWorkbench.model.view.change').d('变更')}
              </Button>
              <BtnApprovalCmp props={btnProps} dataSet={dataSet} />
            </>
          );
        } else {
          return <BtnApprovalCmp props={btnProps} dataSet={dataSet} />;
        }
      },
    },
    {
      name: 'displayAsnNum',
      width: 180,
      renderer: ({ value, record }) => {
        return (
          <RenderChat
            value={value}
            id={record?.get('asnHeaderId')}
            data={dataSet?.getState('chatList')}
          >
            <a onClick={() => allDetailEntrance(record.get('asnHeaderId'), _object, props)}>
              {value}
            </a>
          </RenderChat>
        );
      },
    },
    {
      name: 'viewApproval',
      renderer: progressView,
      width: 150,
    },
    {
      name: 'asnTypeCodeMeaning',
      width: 130,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    {
      name: 'printFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'shipDate',
      width: 120,
    },
    {
      name: 'expectedArriveDate',
      width: 120,
    },
    {
      name: 'invOrganizationName',
      width: 120,
    },
    {
      name: 'receiveAddress',
      width: 140,
    },
    {
      name: 'shipToLocContName', // 联系人
      width: 120,
      renderer: ({ value, record }) =>
        summarization === 'ASN' ? record?.get('contactName') : value,
    },
    {
      name: 'shipToLocTelNum', // 联系电话
      width: 130,
      renderer: ({ value, record }) =>
        summarization === 'ASN' ? record?.get('contactTelNum') : value,
    },
    {
      name: 'expressNum',
      width: 130,
    },
    {
      name: 'carNumber',
      width: 120,
    },
    {
      name: 'acceptTime',
      width: 180,
    },
    {
      name: 'createdName',
      width: 120,
    },
    {
      name: 'createCampCodeMeaning',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 180,
    },
    {
      name: 'processingNodeMeaning',
      width: 120,
    },
    {
      name: 'submitSyncStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <RenderExportComp
          isByOrder
          value={value}
          record={record}
          summarization={summarization}
          remote={remote}
        />
      ),
    },
    {
      name: 'operating',
      width: 120,
      renderer: ({ record }) => (
        <OperationRecord
          tableName="slod_asn_header"
          tablePk={record.get('asnHeaderId')}
          businessKey={record.get('businessKey')}
          commentRecordFlag
          commentStartFlag
          needMerge
        />
      ),
    },
  ];

  // 送货-待确认-按行 -asn
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
      name: 'receiveStatus', // 接收状态
      width: 120,
      renderer: ({ record }) => {
        return `${record.get('receiveStatusMeaning')}`;
      },
    },
    {
      name: 'receiveQuantity', // 接收数量
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
      name: 'lotExpirationDate', // 批次有效期
      width: 120,
    },
    {
      name: 'serialNum', // 序列号
      width: 120,
    },
    {
      name: 'purchaseLineRemark', // 采购方行备注
      width: 150,
    },
    {
      name: 'supplierLineRemark', // 供应商行备注
      width: 150,
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
      title: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
      // renderer: ({ value, record }) => {
      //   if (record.get('sourceType') !== 'PO') {
      //     return value;
      //   }
      // },
    },
    {
      name: 'shipToLocContName',
      width: 120,
    },
    {
      name: 'shipToLocTelNum',
      width: 130,
    },
    {
      name: 'productNum', // 商品编码
      width: 130,
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
      title: intl.get('slod.deliveryWorkbench.model.common.strategyName').d('发货策略'),
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'strategyDataVersion', // 发货策略版本
      width: 120,
    },
    {
      name: 'submitSyncStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <RenderExportComp
          value={value}
          record={record}
          summarization={summarization}
          remote={remote}
        />
      ),
    },
    {
      name: 'processDocuments',
      width: 100,
      renderer: ({ record }) => (
        <DocFlow tableName="slod_asn_line" tablePk={record.get('asnLineId')} buttonType="button" />
      ),
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  if (hdKey === 'right') {
    if (summarization === 'PLAN') return pianHangColumns; // 计划
    if (summarization === 'ASN') return asnHangColumns; // 送货
    if (summarization === 'LABEL') return labelHangColumns; // 标签
    if (summarization === 'UNIQUE_LABEL') return labelHangColumns; // 唯一标签
  }
  if (hdKey === 'left') {
    if (summarization === 'PLAN') return planDanColumns; // 计划
    if (summarization === 'ASN') return asnDanColumns; // 送货
    if (summarization === 'LABEL') return labelDanColumns; // 标签
    if (summarization === 'UNIQUE_LABEL') return labelDanColumns; // 唯一标签
  }
  if (hdKey === 'date') {
    if (summarization === 'PLAN') return planDateolumns;
  }
};

export { allColumns };
