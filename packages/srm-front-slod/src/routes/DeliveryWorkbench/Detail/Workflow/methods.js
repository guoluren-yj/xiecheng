/*
 * @Description: 发货工作台-工作流（目前仅用于唯一标签）
 * @Date: 2021-12-25 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2023, Hand
 */
import React from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'hzero-front/lib/utils/intl';
import { SRM_SLOD } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

import { lebelDetailModal } from '../../globalFunction';

const organizationId = getCurrentOrganizationId();

// 个性化单元
const setCustCodeFunction = () => {
  const custCode = [
    'SLOD.DELIVERY__WORKBENCH_WORKFLOW.UNIQUE_LABEL.BASIC',
    'SLOD.DELIVERY__WORKBENCH_WORKFLOW.UNIQUE_LABEL.BTN',
    'SLOD.DELIVERY__WORKBENCH_WORKFLOW.UNIQUE_LABEL.EXTRA',
    'SLOD.DELIVERY__WORKBENCH_WORKFLOW.UNIQUE_LABEL.LINE',
    'SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_A.DETAIL_UNLBBEL',
  ]
    ?.filter((i) => !!i)
    ?.join(',');
  return custCode;
};

// 列表colmuns/ds-fields
const workflowColumns = ({ doubleUnitEnabled, customizeTable, tplInfo }) => {
  const basicColumns = [
    {
      name: 'displayLabelNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
    },
    {
      name: 'statusCodeMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCode').d('状态'),
    },
    {
      name: 'createdName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
    },
    {
      name: 'createCampCodeMeaning', // 创建方   值集 SLOD.CAMP_CODE  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createCampCode').d('创建方'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建日期'),
    },
  ];
  const extraColumns = [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
    },
    {
      name: 'purchaseRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseRemark').d('采购方备注'),
    },
    {
      name: 'supplierRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierRemark').d('供应商备注'),
    },
  ];
  const lineColumns = [
    {
      name: 'displayLabelLineNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
    },
    {
      name: 'secondaryDisplayUom',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryDisplayUom').d('单位'),
      custHidden: !doubleUnitEnabled, // 自定义属性，控制字段展示隐藏
    },
    {
      name: 'displayUom',
      type: 'string',
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    {
      name: 'secondaryQuantity', // 本次计划数量  计划  行
      type: 'number',
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantity')
        .d('本次创建数量'),
    },
    {
      name: 'labelDetail', // 标签明细 -- 跳转字段  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
      renderer: ({ record }) => {
        return (
          <Button
            funcType="link"
            color="primary"
            onClick={() =>
              lebelDetailModal(record.get('labelLineId'), {
                tplInfo: tplInfo?.current,
                customizeTable,
                modalType: true,
              })
            }
          >
            {intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细')}
          </Button>
        );
      },
    },
    {
      name: 'fromDisplayPoNum',
      type: 'string', // fromDisplayPoLineNum
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'sourceDisplayNum',
      type: 'string', // sourceDisplayLineNum
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
    },
    {
      name: 'receiveAddress', // 收货地址   行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.takeReceiveAddres').d('收货地址'),
    },
    // {
    //   name: 'shipToLocContName', // 联系人  送货  行
    //   type: 'string',
    //   label: intl.get('slod.deliveryWorkbench.model.common.shipToLocContName').d('联系人'),
    // },
    // {
    //   name: 'shipToLocTelNum', // 联系电话  送货  行
    //   type: 'string',
    //   label: intl.get('slod.deliveryWorkbench.model.common.shipToLocTelNum').d('联系电话'),
    // },
  ];
  return { basicColumns, extraColumns, lineColumns };
};

// 基本信息查询
const fetchHeaderChange = (data) => {
  const { nodeTemplateCode, nodeConfigId, headerId, campKey, tplInfo } = data?.params || {};
  const unitCode = `SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.BASIC,SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.EXTRA`;
  const {
    templateCode,
    templateVersion,
    cuszTplStageCode = 'SUBMIT',
    cuszTplPageCode = 'DELIVERY_WORKBENCH.DETAIL',
  } = tplInfo || {};
  let param;
  if (unitCode) {
    param = {
      customizeUnitCode: unitCode,
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
      cuszTplStageCode,
      cuszTplPageCode,
    };
  }
  // console.log(param, 'param');
  return {
    url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/detail/header/${headerId}?campKey=${campKey}`,
    method: 'GET',
    data: param,
  };
};

// 行信息查询
const fetchLineChange = (data) => {
  const { params } = data;
  const { nodeTemplateCode, nodeConfigId, headerId, campKey, tplInfo } = params || {};
  const unitCode = `SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.LINE`;
  const {
    templateCode,
    templateVersion,
    cuszTplStageCode = 'SUBMIT',
    cuszTplPageCode = 'DELIVERY_WORKBENCH.DETAIL',
  } = tplInfo || {};
  let param;
  if (unitCode) {
    param = {
      cuszTplStageCode,
      cuszTplPageCode,
      pageSourceKey: 'affirm',
      customizeUnitCode: unitCode,
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
      operationType: 'waitConfirmDetail',
    };
  }
  const queryData = filterNullValueObject({ ...param });
  return {
    url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/detail/line/${headerId}?campKey=${campKey}`,
    method: 'GET',
    data: queryData,
  };
};

export { fetchHeaderChange, fetchLineChange, workflowColumns, setCustCodeFunction };
