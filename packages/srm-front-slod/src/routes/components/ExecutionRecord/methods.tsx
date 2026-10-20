
import React from 'react';

import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
// import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'hzero-front/lib/utils/intl';
import { SRM_SLOD } from 'srm-front-boot/lib/utils/config.js';
// import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

import indexDataSet, {lineDataColumns} from '@/components/CustomWrapperDs';

const organizationId = getCurrentOrganizationId();

const queryList = (data) => {
    const { nodeTemplateCode, nodeConfigId } = data;
    // const queryData = filterNullValueObject({ ...params, ...other });
    return {
      url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/async-record/header/page`,
      method: 'GET',
    //   data: {
    //     ...queryData,
    //     tenantId: organizationId,
    //   },
    };
};

const queryListLine = (data) => {
  const { nodeTemplateCode, nodeConfigId, recordHeaderId } = data;
  // const queryData = filterNullValueObject({ ...params, ...other });
  return {
    url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/async-record/line/page?recordHeaderId=${recordHeaderId}`,
    method: 'GET',
  //   data: {
  //     ...queryData,
  //     tenantId: organizationId,
  //   },
  };
};

const handleOpenLineLink = (_object) => {
  const { doubleUnitEnabled, nodeTemplateCode, nodeConfigId, recordHeaderId } = _object;
  const columns = [
    {
        name: 'itemCode',
        type: 'string',
        width: 150,
        label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName',
      type: 'string',
      width: 150,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
      name: 'supplierCompanyName',
      type: 'string',
      width: 150,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
      name: 'companyName',
      type: 'string',
      width: 150,
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondarySourceQuantity')
        .d('来源单据数量'),
      name: 'secondarySourceQuantity',
      type: 'number',
      custHidden: !doubleUnitEnabled,
    },
    {
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseSourceQuantity').d('来源单据基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
      name: 'sourceQuantity', // 基本来源单据数量
      type: 'number',
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondaryCanCreateQuantity')
        .d('可创建数量'),
      name: 'secondaryCanCreateQuantity', // 可创建数量
      type: 'number',
      custHidden: !doubleUnitEnabled,
    },
    {
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity').d('可创建基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      name: 'canCreateQuantity', // 基本可创建数量
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
      name: 'fromDisplayPoNum', // 来源订单号-行号 fromDisplayPoLineNum 行号
      type: 'string',
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoLocationNum').d('发运号'),
      name: 'fromDisplayPoLocationNum', // 发运号
      type: 'string',
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
      name: 'sourceDisplayNum', // 来源单据编号-行号 sourceDisplayLineNum 行号
      type: 'string',
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.sourceTypeMeaning').d('来源单据类型'),
      name: 'sourceNodeConfigName', // 来源单据类型
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.poTypeCode').d('订单类型'),
      name: 'poTypeName', // 订单类型
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.neededDate').d('需求日期'),
      name: 'neededDate', // 需求日期
      type: 'date',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.promisedDate').d('承诺交货日期'),
      name: 'promisedDate', // 承诺交货日期
      type: 'date',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.strategyName').d('发货策略'),
      name: 'strategyName', // 发货策略
      type: 'string',
      width: 150,
    },
    {
      name: 'createdName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.processStatusMeanings').d('执行状态'),
      renderer: ({ value, record }) => {
        const processStatus = record?.get('processStatus') || null;
        const _color = { 1: "yellow", 2: "green", 3: "red"};
        return (
          <Tag color={_color[processStatus]} style={{ border: 'none' }}>
            {value}
          </Tag>
          );
    },
    },
    {
      name: 'processMessage',
      type: 'string',
      width: 190,
      label: intl.get('slod.deliveryWorkbench.model.common.processMessage').d('原因'),
    },
  ];

  const indexDs = new DataSet(indexDataSet({
    componentData: columns,
    queryParams: null,
    autoQuery: true,
    selection: false,
    pageSize: 10,
    paging: true,
    read: ()=> queryListLine({nodeTemplateCode, nodeConfigId, recordHeaderId}),
  }));

  Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      resizable: true,
      style: { width: '852px', minWidth: '600px', padding: 0 },
      title: intl.get('slod.common.model.receipt.executionRecordLineDetail').d('行明细'),
    children: <Table
      virtual
      virtualCell
      columns={lineDataColumns(columns)}
      dataSet={indexDs}
      style={{ maxHeight: `calc(100vh - 200px)` }}
    />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
   });
};

export { queryList, handleOpenLineLink };