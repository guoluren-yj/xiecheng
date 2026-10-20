import React from 'react';
import { NumberField, Button } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import moment from 'moment';

import { showBigNumber } from '@/routes/components/utils';
import { handleFieldsRender } from '@/routes/components/utils/utils';
import { FlexLink } from 'srm-front-cuz/components';

import { colorRender, lebelDetailModal } from '../../globalFunction';

const columns = (props) => {
  const {
    remote,
    lineDs,
    tplInfo,
    lineType,
    sourceFromPub,
    customizeTable,
    nodeTemplateCode,
    doubleUnitEnabled,
    splitLine = (e) => e,
    onOpenLinkChange = (e) => e,
  } = props;
  // 标签
  const labelColumns = {
    basic: [
      {
        name: 'lineStatusMeaning',
        width: 160,
        renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
      },
      {
        name: 'action',
        width: 80,
        renderer: ({ record }) => {
          if (
            record.get('demolitionUpdateCode') === 'CAN_SPLIT_UPDATE' &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left'
          ) {
            return (
              <a onClick={() => splitLine(record)}>
                {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
              </a>
            );
          } else {
            return '-';
          }
        },
      },
      {
        name: 'displayLabelLineNum',
        width: 80,
      },
      {
        name: 'itemCode',
        width: 160,
        sortable: true,
      },
      {
        name: 'itemName',
        width: 160,
      },
      doubleUnitEnabled && {
        name: 'secondaryDisplayUom',
        width: 100,
      },
      {
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
        name: 'sourceQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseSourceQuantity').d('来源单据基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 130,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'actualQuantity',
        width: 130,
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
    // 唯一标签
    oneLabel: [
      doubleUnitEnabled && {
        name: 'fillSecondaryQuantity',
        width: 160,
        editor: (record) =>
          ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
            record.get('demolitionUpdateCode')
          ) &&
          ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
          lineType === 'left' && (
            <NumberField
              numberGrouping
              precision={
                !isNil(record.get('secondaryUomPrecision'))
                  ? record.get('secondaryUomPrecision')
                  : 10
              }
            />
          ),
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'quantity',
        width: 160,
        editor: (record) =>
          ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
            record.get('demolitionUpdateCode')
          ) &&
          ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
          lineType === 'left' && (
            <NumberField
              numberGrouping
              precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
            />
          ),
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmQuality').d('确认基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
      },
    ],
    // 不唯一标签
    noSoleLabel: [
      doubleUnitEnabled && {
        name: 'fillSecondaryQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'quantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmQuality').d('确认基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
      },
    ],
    remainderQuantity: [
      {
        name: 'remainderQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
    ],
    twoNum: [
      {
        name: 'unitPackageQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'packageQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'volumeLength',
        width: 110,
      },
      {
        name: 'volumeWidth',
        width: 110,
      },
      {
        name: 'volumeHeight',
        width: 110,
      },
      {
        name: 'netWeight',
        width: 110,
      },
      {
        name: 'grossWeight',
        width: 110,
      },
      {
        name: 'lotNum',
        width: 110,
      },
      {
        name: 'productionDate',
        width: 160,
      },
      {
        name: 'lotExpirationDate',
        width: 160,
      },
      {
        name: 'serialNum',
        width: 160,
      },
    ],
    soleLabel: [
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
                  tplInfo,
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
    ],
    others: [
      {
        name: 'purchaseLineRemark',
        width: 160,
        editor: (record) =>
          ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED', 'SUPPLIER_FEEDBACK'].includes(
            record.get('lineStatus')
          ) && lineType === 'left',
      },
      {
        name: 'supplierLineRemark',
        width: 160,
      },
      {
        name: 'fromDisplayPoNum', // 来源订单号
        width: 180,
        sortable: true,
        renderer: ({ value, record }) => {
          if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
        },
      },
      {
        name: 'sourceDisplayNum', // 来源单据编号
        width: 180,
        sortable: true,
        renderer: ({ value, record }) => {
          if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
        },
      },
      {
        name: 'sourceNodeConfigName', // 来源单据类型
        width: 120,
      },
      {
        name: 'splitFlag',
        width: 120,
        renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
      },
      {
        name: 'createCampCodeMeaning', // 创建方
        width: 120,
      },
      {
        name: 'createdName', // 创建人
        width: 120,
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
            linkTitle={intl.get('hzero.common.button.look').d('查看')}
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
            linkTitle={intl.get('hzero.common.button.look').d('查看')}
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
      name: 'lineStatusMeaning',
      width: 160,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'action',
      width: 80,
      renderer: ({ record }) => {
        if (
          Number(record?.get('changingFlag')) !== 1 &&
          record.get('demolitionUpdateCode') === 'CAN_SPLIT_UPDATE' &&
          ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
          lineType === 'left'
        ) {
          return (
            <Button
              funcType="link"
              color="primary"
              onClick={() => splitLine(record)}
              disabled={record.get('changedFlag') === 1}
            >
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </Button>
          );
        } else {
          return '-';
        }
      },
    },
    {
      name: 'displayPlanLineNum',
      width: 80,
      renderer: ({ value, record }) => {
        if (record.get('planLineId')) {
          return <apan>{value}</apan>;
        } else {
          return `${value}-${intl.get('slod.deliveryWorkbench.model.common.chai').d('拆')}`;
        }
      },
    },
    {
      name: 'splitDisplayLineNum',
      width: 160,
    },
    {
      name: 'itemCode',
      width: 160,
      sortable: true,
    },
    {
      name: 'itemName',
      width: 160,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom',
      width: 100,
    },
    {
      name: 'displayUom',
      width: 100,
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 130,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 130,
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'actualQuantity',
        };
        return showBigNumber(value, -1, {}, data);
      },
      header:
        nodeTemplateCode === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    {
      name: 'plannedArrivalDate',
      width: 160,
      renderer: ({ value, record }) => {
        const data = value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : '-';
        return handleFieldsRender(
          data,
          record.get('changeFieldMap'),
          'plannedArrivalDate',
          record.get('changingFlag')
        );
      },
    },
    doubleUnitEnabled && {
      name: 'fillSecondaryQuantity',
      width: 130,
      editor: (record) =>
        record.get('changedFlag') !== 1 &&
        !sourceFromPub &&
        ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(record.get('demolitionUpdateCode')) &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
        lineType === 'left' && (
          <NumberField
            numberGrouping
            required={doubleUnitEnabled}
            precision={
              !isNil(record.get('secondaryUomPrecision')) ? record.get('secondaryUomPrecision') : 10
            }
          />
        ),
      renderer: ({ value, record }) => {
        const flag =
          record?.get('fillSecondaryQuantity') !== record?.get('secondaryQuantity') &&
          record?.get('changedFlag') === 0 &&
          !(
            record.get('changedFlag') !== 1 &&
            !sourceFromPub &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left'
          );
        return showBigNumber(value, -1, {}, { fieldName: 'fillSecondaryQuantity' }, flag);
      },
    },
    {
      name: 'quantity',
      width: 110,
      editor: (record) =>
        record.get('changedFlag') !== 1 &&
        !sourceFromPub &&
        ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(record.get('demolitionUpdateCode')) &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
        lineType === 'left' && (
          <NumberField
            numberGrouping
            precision={
              !isNil(record.get('secondaryUomPrecision')) ? record.get('secondaryUomPrecision') : 10
            }
          />
        ),
      renderer: ({ value, record }) => {
        const data = { ...record?.get(['changeFieldMap', 'changingFlag']), fieldName: 'quantity' };
        const flag =
          record?.get('quantity') !== record?.get('actualQuantity') &&
          record?.get('changedFlag') === 0 &&
          !(
            record.get('changedFlag') !== 1 &&
            !sourceFromPub &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left'
          );
        return showBigNumber(value, -1, {}, data, flag);
      },
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmQuality').d('确认基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
    },
    {
      name: 'confirmArrivalDate',
      width: 160,

      editor: (record) =>
        record.get('changedFlag') !== 1 &&
        !sourceFromPub &&
        ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(record.get('demolitionUpdateCode')) &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
        lineType === 'left',
      renderer: ({ value, record }) => {
        const flag =
          record.get('changedFlag') !== 1 &&
          ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
            record.get('demolitionUpdateCode')
          ) &&
          ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
          lineType === 'left';
        const data =
          value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : flag ? null : '-';
        const confirmArrivalDate = moment(record?.get('confirmArrivalDate')).format('YYYY-MM-DD');
        const plannedArrivalDate = moment(record?.get('plannedArrivalDate')).format('YYYY-MM-DD');
        const feedbackFlag =
          confirmArrivalDate !== plannedArrivalDate &&
          record.get('changedFlag') !== 1 &&
          !(
            !sourceFromPub &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left'
          );
        return handleFieldsRender(
          data,
          record.get('changeFieldMap'),
          'confirmArrivalDate',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left',
          feedbackFlag
        );
      },
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
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
      name: 'purchaseLineRemark',
      width: 160,
      editor: (record) =>
        record.get('changedFlag') !== 1 &&
        !sourceFromPub &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED', 'SUPPLIER_FEEDBACK'].includes(
          record.get('lineStatus')
        ) &&
        lineType === 'left',
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'purchaseLineRemark',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED', 'SUPPLIER_FEEDBACK'].includes(
              record.get('lineStatus')
            ) &&
            lineType === 'left'
        ),
    },
    {
      name: 'supplierLineRemark',
      width: 160,
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'supplierLineRemark',
          record.get('changingFlag')
        ),
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
      name: 'deliveryAddress',
      width: 120,
      editor: (record) => !sourceFromPub && record.get('changedFlag') !== 1 && lineType === 'left',
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'deliveryAddress',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 && lineType === 'left'
        ),
    },
    {
      name: 'receiveAddress',
      width: 120,
      editor: (record) => !sourceFromPub && record.get('changedFlag') !== 1 && lineType === 'left',
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'receiveAddress',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 && lineType === 'left'
        ),
    },
    {
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
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
      name: 'occupiedQuantity',
      width: 160,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'changingFlag',
      width: 80,
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
      name: 'lineStatusMeaning',
      width: 160,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'action',
      width: 80,
      renderer: ({ record }) => {
        if (
          Number(record?.get('changingFlag')) !== 1 &&
          record.get('demolitionUpdateCode') === 'CAN_SPLIT_UPDATE' &&
          ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
          lineType === 'left'
        ) {
          return (
            <Button
              funcType="link"
              color="primary"
              onClick={() => splitLine(record)}
              disabled={record.get('changedFlag') === 1}
            >
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </Button>
          );
        } else {
          return '-';
        }
      },
    },
    {
      name: 'displayAsnLineNum',
      width: 80,
      renderer: ({ value, record }) => {
        if (record.get('asnLineId')) {
          return <apan>{value}</apan>;
        } else {
          return `${value}-${intl.get('slod.deliveryWorkbench.model.common.chai').d('拆')}`;
        }
      },
    },
    {
      name: 'splitDisplayLineNum',
      width: 160,
    },
    {
      name: 'itemCode',
      width: 160,
      sortable: true,
    },
    {
      name: 'itemName',
      width: 160,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom',
      width: 100,
    },
    {
      name: 'displayUom',
      width: 100,
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 130,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 130,
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'actualQuantity',
        };
        return showBigNumber(value, -1, {}, data);
      },
      header:
        nodeTemplateCode === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    doubleUnitEnabled && {
      name: 'fillSecondaryQuantity',
      width: 110,
      editor: (record) =>
        !sourceFromPub &&
        record.get('changedFlag') !== 1 &&
        ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(record.get('demolitionUpdateCode')) &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
        lineType === 'left' && (
          <NumberField
            numberGrouping
            required={doubleUnitEnabled}
            precision={
              !isNil(record.get('secondaryUomPrecision')) ? record.get('secondaryUomPrecision') : 10
            }
          />
        ),
      renderer: ({ value, record }) => {
        const flag =
          record?.get('fillSecondaryQuantity') !== record?.get('secondaryQuantity') &&
          record?.get('changedFlag') === 0 &&
          !(
            record.get('changedFlag') !== 1 &&
            !sourceFromPub &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left'
          );
        return showBigNumber(value, -1, {}, { fieldName: 'fillSecondaryQuantity' }, flag);
      },
    },
    {
      name: 'quantity',
      width: 110,
      editor: (record) =>
        record.get('changedFlag') !== 1 &&
        !sourceFromPub &&
        ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(record.get('demolitionUpdateCode')) &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
        lineType === 'left' && (
          <NumberField
            numberGrouping
            precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
          />
        ),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'quantity',
          editFlag:
            record.get('changedFlag') !== 1 &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left',
        };
        const flag =
          record?.get('quantity') !== record?.get('actualQuantity') &&
          record?.get('changedFlag') === 0 &&
          !(
            record.get('changedFlag') !== 1 &&
            !sourceFromPub &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record.get('demolitionUpdateCode')
            ) &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED'].includes(record.get('lineStatus')) &&
            lineType === 'left'
          );
        return showBigNumber(value, -1, {}, data, flag);
      },
      header: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmQuality').d('确认基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
    },
    {
      name: 'unitPackageQuantity',
      width: 110,
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'unitPackageQuantity',
        };
        return showBigNumber(value, -1, {}, data);
      },
    },
    {
      name: 'packageQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'remainderQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'netWeight',
      width: 110,
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'netWeight',
          record.get('changingFlag')
        ),
    },
    {
      name: 'grossWeight',
      width: 110,
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'grossWeight',
          record.get('changingFlag')
        ),
    },
    {
      name: 'lotNum',
      width: 110,
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'lotNum',
          record.get('changingFlag')
        ),
    },
    {
      name: 'productionDate',
      width: 160,
      renderer: ({ value, record }) => {
        const data = value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : '-';
        return handleFieldsRender(
          data,
          record.get('changeFieldMap'),
          'productionDate',
          record.get('changingFlag')
        );
      },
    },
    {
      name: 'lotExpirationDate',
      width: 160,
      renderer: ({ value, record }) => {
        const data = value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : '-';
        return handleFieldsRender(
          data,
          record.get('changeFieldMap'),
          'lotExpirationDate',
          record.get('changingFlag')
        );
      },
    },
    {
      name: 'serialNum',
      width: 160,
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'serialNum',
          record.get('changingFlag')
        ),
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'fromDisplayPoLocationNum', // 发运号
      width: 120,
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号
      width: 180,
      sortable: true,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
    },
    {
      name: 'purchaseLineRemark',
      width: 160,
      editor: (record) =>
        record.get('changedFlag') !== 1 &&
        !sourceFromPub &&
        ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED', 'SUPPLIER_FEEDBACK'].includes(
          record.get('lineStatus')
        ) &&
        lineType === 'left',
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'purchaseLineRemark',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 &&
            ['SUPPLIER_PUBLISHED', 'SUPPLIER_REJECTED', 'SUPPLIER_FEEDBACK'].includes(
              record.get('lineStatus')
            ) &&
            lineType === 'left'
        ),
    },
    {
      name: 'supplierLineRemark',
      width: 160,
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'supplierLineRemark',
          record.get('changingFlag')
        ),
    },
    {
      name: 'deliveryAddress',
      width: 120,
      editor: (record) => record.get('changedFlag') !== 1 && !sourceFromPub && lineType === 'left',
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'deliveryAddress',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 && !sourceFromPub && lineType === 'left'
        ),
    },
    {
      name: 'receiveAddress',
      width: 120,
      editor: (record) => (record.get('changedFlag') !== 1 || sourceFromPub) && lineType === 'left',
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'receiveAddress',
          record.get('changingFlag'),
          record.get('changedFlag') !== 1 && !sourceFromPub && lineType === 'left'
        ),
    },
    {
      name: 'shipToLocContName',
      width: 120,
      editor: (record) => (record.get('changedFlag') !== 1 || sourceFromPub) && lineType === 'left',
    },
    {
      name: 'shipToLocTelNum',
      width: 120,
      editor: (record) => (record.get('changedFlag') !== 1 || sourceFromPub) && lineType === 'left',
    },
    {
      name: 'productNum', // 商品编码
      width: 120,
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
      name: 'creationDate', // 创建时间
      width: 180,
    },
    {
      name: 'createdName', // 创建人
      width: 120,
    },
    {
      name: 'purchaseLineAttachmentUuid',
      width: 120,
      editor: (record) => record.get('changedFlag') !== 1 && !sourceFromPub && lineType === 'left',
    },
    {
      name: 'supplierLineAttachmentUuid',
      width: 120,
    },
    {
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      name: 'occupiedQuantity',
      width: 160,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'changingFlag',
      width: 80,
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
          linkTitle={intl.get('hzero.common.button.look').d('查看')}
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
          linkTitle={intl.get('hzero.common.button.look').d('查看')}
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
      labelColumns.remainderQuantity,
      labelColumns.twoNum,
      labelColumns.others,
      labelColumns.linkBtn
    ); // 不唯一标签;
    return remote
      ? remote.process('LABEL_DETAIL_LINE_COLUMNS', columnsLabel, { dataSet: lineDs })
      : columnsLabel;
  } else if (nodeTemplateCode === 'PLAN') {
    return remote
      ? remote.process('PLAN_DETAIL_LINE_COLUMNS', planColumns, { dataSet: lineDs })
      : planColumns;
  } else if (nodeTemplateCode === 'ASN') {
    return remote
      ? remote.process('ASN_DETAIL_LINE_COLUMNS', asnColumns, { dataSet: lineDs, props })
      : asnColumns;
  } else {
    const columnsUniqueLabel = labelColumns.basic.concat(
      labelColumns.oneLabel,
      labelColumns.twoNum,
      labelColumns.soleLabel,
      labelColumns.others,
      labelColumns.linkBtn
    ); // 唯一标签
    return remote
      ? remote.process('UNIQUELABEL_DETAIL_LINE_COLUMNS', columnsUniqueLabel, { dataSet: lineDs })
      : columnsUniqueLabel;
  }
};

export default columns;
