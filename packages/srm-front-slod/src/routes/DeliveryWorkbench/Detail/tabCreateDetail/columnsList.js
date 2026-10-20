/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import { showBigNumber } from '@/routes/components/utils';
import React from 'react';
import { NumberField, Button } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { FlexLink } from 'srm-front-cuz/components';

import { colorRender } from '../../globalFunction';

const columns = (props) => {
  const {
    remote,
    onOpenLinkChange = (e) => e,
    splitLine = (e) => e,
    nodeTemplateCode,
    doubleUnitEnabled,
  } = props;
  // 标签
  const labelColumns = {
    basic: [
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.lineStatus').d('状态'),
        name: 'lineStatusMeaning',
        width: 160,
        renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
      },
      {
        // title: intl.get(`hzero.common.button.action`).d('操作'),
        name: 'action',
        width: 80,
        renderer: ({ record }) => {
          return (
            <Button funcType="link" color="primary" onClick={() => splitLine(record)}>
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </Button>
          );
        },
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
        name: 'displayLabelLineNum',
        width: 80,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
        name: 'itemCode',
        width: 160,
        sortable: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
        name: 'itemName',
        width: 160,
      },
      doubleUnitEnabled && {
        name: 'secondaryDisplayUom',
        width: 100,
        editor: (record) =>
          record.get('itemId') && record.get('topNodeFlag') === 1 && doubleUnitEnabled === 2, // 当前节点是第一个事务节点、上游模块（订单、协议）未开启双单位、物流开启双单位的情况下，该字段可编辑
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
        name: 'displayUom',
        width: 100,
        header: doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
          : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
        name: 'sourceQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseSourceQuantity').d('来源单据基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
      },
      doubleUnitEnabled && {
        name: 'secondaryCanCreateQuantity',
        width: 120,
        renderer: ({ value, record }) => {
          if (Number(record?.get('unlimitedCreateFlag')) === 1) {
            return '+∞';
          }
          return showBigNumber(value);
        },
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
        name: 'canCreateQuantity',
        width: 110,
        renderer: ({ value, record }) => {
          if (Number(record?.get('unlimitedCreateFlag')) === 1) {
            return '+∞';
          }
          return showBigNumber(value);
        },
        header: doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity')
              .d('可创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      },
    ],
    // 唯一标签
    soleLabel: [
      {
        name: 'labelDetail', // 标签明细
        width: 120,
        hidden: true,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 160,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        // title: intl
        // .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantity')
        // .d('本单已生成标签数量'),
        name: 'actualQuantity',
        width: 160,
        renderer: ({ value }) => showBigNumber(value),
        header:
          nodeTemplateCode === 'PLAN'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                  .d('本次计划基本数量')
              : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
            : nodeTemplateCode === 'UNIQUE_LABEL'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BaseReceiptsLabelQuantitys')
                  .d('本单已生成标签基本数量')
              : intl
                  .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantitys')
                  .d('本单已生成标签数量')
            : doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                .d('本次创建基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
      },
    ],
    // 不唯一标签
    noSoleLabel: [
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 110,
        editor: (record) => (
          <NumberField
            numberGrouping
            precision={
              !isNil(record.get('secondaryUomPrecision')) ? record.get('secondaryUomPrecision') : 10
            }
          />
        ),
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
        name: 'actualQuantity',
        width: 110,
        editor: (record) => (
          <NumberField
            numberGrouping
            precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
          />
        ),
        header:
          nodeTemplateCode === 'PLAN'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                  .d('本次计划基本数量')
              : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
            : nodeTemplateCode === 'UNIQUE_LABEL'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BaseReceiptsLabelQuantitys')
                  .d('本单已生成标签基本数量')
              : intl
                  .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantitys')
                  .d('本单已生成标签数量')
            : doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                .d('本次创建基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
      },
    ],
    twoNum: [
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
        name: 'unitPackageQuantity',
        width: 110,
        editor: (record) => {
          const uomPrecision = doubleUnitEnabled
            ? record.get('secondaryUomPrecision')
            : record.get('uomPrecision');
          return (
            <NumberField numberGrouping precision={!isNil(uomPrecision) ? uomPrecision : 10} />
          );
        },
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数'),
        name: 'packageQuantity',
        width: 110,
        editor: (record) => {
          const uomPrecision = doubleUnitEnabled
            ? record.get('secondaryUomPrecision')
            : record.get('uomPrecision');
          return (
            nodeTemplateCode === 'UNIQUE_LABEL' && (
              <NumberField numberGrouping precision={!isNil(uomPrecision) ? uomPrecision : 10} />
            )
          );
        },
        renderer: ({ value }) => showBigNumber(value),
      },
    ],
    remainderQuantity: [
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.remainderQuantity').d('尾数'),
        name: 'remainderQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
    ],
    other: [
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.volumeLength').d('体积长（CM)'),
        name: 'volumeLength',
        width: 110,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.volumeWidth').d('体积宽（CM)'),
        name: 'volumeWidth',
        width: 110,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.volumeHeight').d('体积高（CM)'),
        name: 'volumeHeight',
        width: 110,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
        name: 'netWeight',
        width: 110,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
        name: 'grossWeight',
        width: 110,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.lotNum').d('批次号'),
        name: 'lotNum',
        width: 110,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.productionDate').d('生产日期'),
        name: 'productionDate',
        width: 160,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.lotExpirationDate').d('批次有效期'),
        name: 'lotExpirationDate',
        width: 160,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.serialNum').d('序列号'),
        name: 'serialNum',
        width: 160,
        editor: true,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
        name: 'purchaseLineRemark',
        width: 160,
        editor: true,
        // renderer: () => <TextArea rows={1} resize="both" />,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
        name: 'supplierLineRemark',
        width: 160,
      },
      {
        // title: intl
        // .get('slod.deliveryWorkbench.model.common.fromDisplayPoNum')
        // .d('来源订单号-行号'),
        name: 'fromDisplayPoNum', // 来源订单号
        width: 180,
        sortable: true,
        renderer: ({ value, record }) => {
          if (value) return `${value} - ${record.get('fromDisplayPoLineNum')}`;
        },
      },
      {
        // title: intl
        // .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        // .d('来源单据编号-行号'),
        name: 'sourceDisplayNum', // 来源单据编号
        width: 180,
        sortable: true,
        renderer: ({ value, record }) => {
          if (value) return `${value} - ${record.get('sourceDisplayLineNum')}`;
        },
      },
      {
        name: 'splitFlag',
        width: 120,
        renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        // title: intl.get('slod.deliveryWorkbench.model.common.occupiedQuantity').d('占用数量'),
        name: 'occupiedQuantity',
        width: 160,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'changingFlag',
        width: 80,
        hidden: true,
        renderer: ({ value }) => {
          if (Number(value) === 1) {
            return <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>;
          }
          if (Number(value) === 0) {
            return <span>{intl.get('hzero.common.no').d('否')}</span>;
          }
        },
      },
    ],
    linkBtn: [
      {
        name: 'linkFirst',
        width: 100,
        renderer: ({ record }) => (
          <FlexLink
            record={record}
            name="linkFirst"
            linkType="normal-btn"
            linkTitle={intl.get('hzero.common.view.button.edit').d('编辑')}
            disabled={!record?.get('labelLineId')}
            onClick={() =>
              onOpenLinkChange(
                record?.get('labelLineId'),
                record?.get('labelHeaderId'),
                Number(1),
                record
              )
            }
          />
        ),
      },
      {
        name: 'linkSecond',
        width: 100,
        renderer: ({ record }) => (
          <FlexLink
            record={record}
            name="linkSecond"
            linkType="normal-btn"
            linkTitle={intl.get('hzero.common.view.button.edit').d('编辑')}
            disabled={!record?.get('labelLineId')}
            onClick={() =>
              onOpenLinkChange(
                record?.get('labelLineId'),
                record?.get('labelHeaderId'),
                Number(2),
                record
              )
            }
          />
        ),
      },
      {
        name: 'projectTaskId',
        width: 110,
        hidden: true,
      },
    ],
  };

  // 计划
  const planColumns = [
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.lineStatus').d('状态'),
      name: 'lineStatusMeaning',
      width: 160,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      title: intl.get(`hzero.common.button.action`).d('操作'),
      name: 'action',
      width: 80,
      // lock: 'right',
      renderer: ({ record }) => {
        return (
          <Button funcType="link" color="primary" onClick={() => splitLine(record)}>
            {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
          </Button>
        );
      },
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
      name: 'displayPlanLineNum',
      width: 80,
    },
    {
      name: 'splitDisplayLineNum',
      width: 160,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
      name: 'itemCode',
      width: 160,
      sortable: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName',
      width: 160,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom',
      width: 100,
      editor: (record) =>
        record.get('itemId') && record.get('topNodeFlag') === 1 && doubleUnitEnabled === 2, // 当前节点是第一个事务节点、上游模块（订单、协议）未开启双单位、物流开启双单位的情况下，该字段可编辑
      // renderer: ({ record }) => record.get('secondaryUomName'),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
      name: 'displayUom',
      width: 100,
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    doubleUnitEnabled && {
      name: 'secondaryCanCreateQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      name: 'canCreateQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity').d('可创建基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 120,
      editor: (record) => (
        <NumberField
          numberGrouping
          precision={
            !isNil(record.get('secondaryUomPrecision')) ? record.get('secondaryUomPrecision') : 10
          }
        />
      ),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量'),
      name: 'actualQuantity',
      width: 120,
      editor: (record) => (
        <NumberField
          numberGrouping
          precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
        />
      ),
      header:
        nodeTemplateCode === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : nodeTemplateCode === 'UNIQUE_LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseReceiptsLabelQuantitys')
                .d('本单已生成标签基本数量')
            : intl
                .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantitys')
                .d('本单已生成标签数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    {
      // title: intl
      // .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
      // .d('本次计划到货日期'),
      name: 'plannedArrivalDate',
      width: 160,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      // title: intl
      // .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
      // .d('来源单据编号-行号'),
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.neededDate').d('需求日期'),
      name: 'neededDate',
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.promisedDate').d('承诺交货日期'),
      name: 'promisedDate',
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
      name: 'purchaseLineRemark',
      width: 160,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
      name: 'supplierLineRemark',
      width: 160,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.agentName').d('采购员'),
      name: 'agentName',
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.categoryName').d('品类'),
      name: 'categoryName',
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
      name: 'invOrganizationName',
      width: 120,
    },
    {
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
      name: 'deliveryAddress',
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
      name: 'receiveAddress',
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
      name: 'supplierCompanyName',
      width: 160,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.occupiedQuantity').d('占用数量'),
      name: 'occupiedQuantity',
      width: 160,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'changingFlag',
      width: 80,
      hidden: true,
      renderer: ({ value }) => {
        if (Number(value) === 1) {
          return <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>;
        }
        if (Number(value) === 0) {
          return <span>{intl.get('hzero.common.no').d('否')}</span>;
        }
      },
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 送货
  const asnColumns = [
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.lineStatus').d('状态'),
      name: 'lineStatusMeaning',
      width: 160,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      title: intl.get(`hzero.common.button.action`).d('操作'),
      name: 'action',
      width: 80,
      // lock: 'right',
      renderer: ({ record }) => {
        return (
          <Button funcType="link" color="primary" onClick={() => splitLine(record)}>
            {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
          </Button>
        );
      },
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
      name: 'displayAsnLineNum',
      width: 80,
    },
    {
      name: 'splitDisplayLineNum',
      width: 160,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
      name: 'itemCode',
      width: 160,
      sortable: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName',
      width: 160,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom',
      width: 100,
      editor: (record) =>
        record.get('itemId') && record.get('topNodeFlag') === 1 && doubleUnitEnabled === 2, // 当前节点是第一个事务节点、上游模块（订单、协议）未开启双单位、物流开启双单位的情况下，该字段可编辑
      // renderer: ({ record }) => record.get('secondaryUomName'),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
      name: 'displayUom',
      width: 100,
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    doubleUnitEnabled && {
      name: 'secondarySourceQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
      name: 'sourceQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseSourceQuantity').d('来源单据基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
    },
    doubleUnitEnabled && {
      name: 'secondaryCanCreateQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      name: 'canCreateQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity').d('可创建基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 110,
      editor: (record) => (
        <NumberField
          numberGrouping
          precision={
            !isNil(record.get('secondaryUomPrecision')) ? record.get('secondaryUomPrecision') : 10
          }
        />
      ),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
      name: 'actualQuantity',
      width: 110,
      editor: (record) => (
        <NumberField
          numberGrouping
          precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
        />
      ),
      header:
        nodeTemplateCode === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : nodeTemplateCode === 'UNIQUE_LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseReceiptsLabelQuantitys')
                .d('本单已生成标签基本数量')
            : intl
                .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantitys')
                .d('本单已生成标签数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
      name: 'unitPackageQuantity',
      width: 110,
      editor: (record) => {
        const uomPrecision = doubleUnitEnabled
          ? record.get('secondaryUomPrecision')
          : record.get('uomPrecision');
        return <NumberField numberGrouping precision={!isNil(uomPrecision) ? uomPrecision : 10} />;
      },
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数'),
      name: 'packageQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.remainderQuantity').d('尾数'),
      name: 'remainderQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
      name: 'netWeight',
      width: 110,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
      name: 'grossWeight',
      width: 110,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.weightUomName').d('重量单位'),
      name: 'weightUomId',
      width: 110,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.lotNum').d('批次号'),
      name: 'lotNum',
      width: 110,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.productionDate').d('生产日期'),
      name: 'productionDate',
      width: 160,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.lotExpirationDate').d('批次有效期'),
      name: 'lotExpirationDate',
      width: 160,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.serialNum').d('序列号'),
      name: 'serialNum',
      width: 160,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoLocationNum').d('发运号'),
      name: 'fromDisplayPoLocationNum', // 发运号
      width: 120,
    },
    {
      // title: intl
      // .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
      // .d('来源单据编号-行号'),
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value} - ${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
      name: 'purchaseLineRemark',
      width: 160,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
      name: 'supplierLineRemark',
      width: 160,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
      name: 'supplierCompanyName',
      width: 160,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
      name: 'deliveryAddress', // 发货地址
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.takeReceiveAddres').d('收货地址'),
      name: 'receiveAddress', // 收货地址
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.shipToLocContName').d('联系人'),
      name: 'shipToLocContName',
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.shipToLocTelNum').d('联系电话'),
      name: 'shipToLocTelNum',
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.productNum').d('商品编码'),
      name: 'productNum', // 商品编码
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.productName').d('商品名称'),
      name: 'productName', // 商品名称
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.catalogName').d('商品目录'),
      name: 'catalogName', // 商品目录
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建时间'),
      name: 'creationDate', // 创建时间
      width: 180,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.purchaseLineUuid').d('采购方行附件'),
      name: 'purchaseLineAttachmentUuid',
      width: 120,
      editor: true,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.supplierLineUuid').d('供应商行附件'),
      name: 'supplierLineAttachmentUuid',
      width: 120,
    },
    {
      name: 'changingFlag',
      width: 80,
      hidden: true,
      renderer: ({ value }) => {
        if (Number(value) === 1) {
          return <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>;
        }
        if (Number(value) === 0) {
          return <span>{intl.get('hzero.common.no').d('否')}</span>;
        }
      },
    },
    {
      name: 'linkFirst',
      width: 100,
      renderer: ({ record }) => (
        <FlexLink
          record={record}
          name="linkFirst"
          linkType="normal-btn"
          linkTitle={intl.get('hzero.common.view.button.edit').d('编辑')}
          disabled={!record?.get('asnLineId')}
          onClick={() =>
            onOpenLinkChange(
              record?.get('asnLineId'),
              record?.get('asnHeaderId'),
              Number(1),
              record
            )
          }
        />
      ),
    },
    {
      name: 'linkSecond',
      width: 100,
      renderer: ({ record }) => (
        <FlexLink
          record={record}
          name="linkSecond"
          linkType="normal-btn"
          linkTitle={intl.get('hzero.common.view.button.edit').d('编辑')}
          disabled={!record?.get('asnLineId')}
          onClick={() =>
            onOpenLinkChange(
              record?.get('asnLineId'),
              record?.get('asnHeaderId'),
              Number(2),
              record
            )
          }
        />
      ),
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
    {
      name: 'inventoryId',
      width: 110,
      editor: true,
    },
    {
      name: 'locationId',
      width: 110,
      editor: true,
    },
  ];
  if (nodeTemplateCode === 'LABEL') {
    const columnsLabel = labelColumns.basic.concat(
      labelColumns.noSoleLabel,
      labelColumns.twoNum,
      labelColumns.remainderQuantity,
      labelColumns.other,
      labelColumns.linkBtn
    ); // 不唯一标签;
    return remote ? remote.process('LABEL_DETAIL_LINE_COLUMNS', columnsLabel) : columnsLabel;
  } else if (nodeTemplateCode === 'PLAN') {
    return remote ? remote.process('PLAN_DETAIL_LINE_COLUMNS', planColumns) : planColumns;
  } else if (nodeTemplateCode === 'ASN') {
    return remote ? remote.process('ASN_DETAIL_LINE_COLUMNS', asnColumns, { props }) : asnColumns;
  } else {
    const columnsUniqueLabel = labelColumns.basic.concat(
      labelColumns.soleLabel,
      labelColumns.twoNum,
      labelColumns.other,
      labelColumns.linkBtn
    ); // 唯一标签
    return remote
      ? remote.process('UNIQUELABEL_DETAIL_LINE_COLUMNS', columnsUniqueLabel)
      : columnsUniqueLabel;
  }
};

export default columns;
