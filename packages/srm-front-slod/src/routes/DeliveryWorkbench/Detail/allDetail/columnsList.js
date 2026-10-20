import { showBigNumber } from '@/routes/components/utils';
import { handleFieldsRender } from '@/routes/components/utils/utils';

import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import { FlexLink } from 'srm-front-cuz/components';

import { colorRender, exportRender, lebelDetailModal } from '../../globalFunction';
import moment from 'moment';

const statusValidate = (record) => {
  return ['CONFIRMED', 'CHANGE_SUPPLIER_REJECTED', 'CHANGE_PURCHASER_REJECTED']?.includes(
    record.get('lineStatus')
  );
};

const columns = (props) => {
  const {
    edit,
    remote,
    change,
    lineDs,
    docFlow,
    tplInfo,
    sourceFromPub,
    changeMarkFlag,
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
        name: 'lineExportStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          if (value) {
            return (
              <Button
                funcType="link"
                color="primary"
                disabled={Number(docFlow) === 1}
                onClick={() => exportRender(value, record, nodeTemplateCode, docFlow, remote)}
              >
                {value}
              </Button>
            );
          } else {
            return '-';
          }
        },
      },
      {
        name: 'lineStatusMeaning',
        width: 80,
        renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
      },
      {
        name: 'action',
        width: 80,
        hidden: true,
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
          : intl.get('slod.deliveryWorkbench.model.common.actualQuantity').d('来源单据数量'),
      },
      doubleUnitEnabled && {
        name: 'secondaryCanCreateQuantity',
        width: 110,
        renderer: ({ value, record }) => {
          if (Number(record?.get('unlimitedCreateFlag')) === 1) {
            return '+∞';
          }
          return showBigNumber(value);
        },
      },
      {
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
      doubleUnitEnabled && {
        name: 'fillSecondaryQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        // title: intl
        //   .get('slod.deliveryWorkbench.model.common.thisTimeuantity')
        //   .d('本单已生成标签数量'),
        name: 'quantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
        header:
          nodeTemplateCode === 'UNIQUE_LABEL'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantitys')
                  .d('本单已生成标签基本数量')
              : intl
                  .get('slod.deliveryWorkbench.model.common.thisTimeuantitys')
                  .d('本单已生成标签数量')
            : nodeTemplateCode === 'LABEL'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                  .d('本次创建基本数量')
              : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量')
            : doubleUnitEnabled
            ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmNumber').d('确认基本数量')
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
        // title: intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
        name: 'quantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
        header:
          nodeTemplateCode === 'UNIQUE_LABEL'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantitys')
                  .d('本单已生成标签基本数量')
              : intl
                  .get('slod.deliveryWorkbench.model.common.thisTimeuantitys')
                  .d('本单已生成标签数量')
            : nodeTemplateCode === 'LABEL'
            ? doubleUnitEnabled
              ? intl
                  .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                  .d('本次创建基本数量')
              : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量')
            : doubleUnitEnabled
            ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmNumber').d('确认基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
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
    ],
    remainderQuantity: [
      {
        name: 'remainderQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
    ],
    other: [
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
    // 唯一标签
    soleLabelDetail: [
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
    other_two: [
      {
        name: 'purchaseLineRemark',
        width: 160,
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
        name: 'splitFlag',
        width: 120,
        renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'occupiedQuantity',
        width: 160,
        renderer: ({ value }) => showBigNumber(value),
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
      name: 'lineExportStatusMeaning',
      width: 120,
      renderer: ({ value, record }) => {
        if (value) {
          return (
            <Button
              funcType="link"
              color="primary"
              disabled={Number(docFlow) === 1}
              onClick={() => exportRender(value, record, nodeTemplateCode, docFlow, remote)}
            >
              {value}
            </Button>
          );
        } else {
          return '-';
        }
      },
    },
    {
      name: 'lineStatusMeaning',
      width: 80,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'displayPlanLineNum',
      width: 80,
      renderer: ({ value, record }) => {
        if (record.get('planLineId')) {
          return <apan>{value || '-'}</apan>;
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
      name: 'action',
      width: 80,
      hidden: !isNil(change),
      renderer: ({ record, dataSet }) => {
        if (
          (changeMarkFlag &&
            (!isNil(change) &&
              ['PURCHASER'].includes(record.get('createCampCode')) &&
              ['CONFIRMED'].includes(record.get('lineStatus')))) ||
          (changeMarkFlag &&
            (!isNil(change) &&
              ['SUPPLIER'].includes(record.get('createCampCode')) &&
              ['CONFIRMED'].includes(record.get('lineStatus')) &&
              ['PURCHASER'].includes(dataSet?.getState('interactiveCampCode')) &&
              ['CAN_SPLIT_UPDATE'].includes(record.get('demolitionUpdateCode'))))
        ) {
          return (
            <Button funcType="link" color="primary" onClick={() => splitLine(record)}>
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </Button>
          );
        } else {
          return '-';
        }
      },
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
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 130,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('actualQuantity'),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'actualQuantity',
          editFlag: statusValidate(record) && lineDs.getState('actualQuantity'),
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
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'quantity',
      width: 110,
      renderer: ({ value, record }) => {
        const data = { ...record?.get(['changeFieldMap', 'changingFlag']), fieldName: 'quantity' };
        return showBigNumber(value, -1, {}, data);
      },
      editor: (record) => !sourceFromPub && statusValidate(record) && lineDs.getState('quantity'),
      header:
        nodeTemplateCode === 'UNIQUE_LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantitys')
                .d('本单已生成标签基本数量')
            : intl
                .get('slod.deliveryWorkbench.model.common.thisTimeuantitys')
                .d('本单已生成标签数量')
          : nodeTemplateCode === 'LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                .d('本次创建基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量')
          : doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmNumber').d('确认基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
    },
    {
      name: 'plannedArrivalDate',
      width: 160,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('plannedArrivalDate'),
      renderer: ({ value, record }) => {
        const flag = statusValidate(record) && lineDs.getState('plannedArrivalDate');
        const data =
          value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : flag ? null : '-';
        return handleFieldsRender(
          data,
          record.get('changeFieldMap'),
          'plannedArrivalDate',
          record.get('changingFlag')
        );
      },
    },
    {
      name: 'confirmArrivalDate',
      width: 160,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('confirmArrivalDate'),
      renderer: ({ value, record }) => {
        const flag = statusValidate(record) && lineDs.getState('confirmArrivalDate');
        const data =
          value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : flag ? null : '-';
        return handleFieldsRender(
          data,
          record.get('changeFieldMap'),
          'confirmArrivalDate',
          record.get('changingFlag')
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
        !sourceFromPub && statusValidate(record) && lineDs.getState('purchaseLineRemark'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'purchaseLineRemark',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('purchaseLineRemark')
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
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      name: 'deliveryAddress',
      width: 120,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('deliveryAddress'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'deliveryAddress',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('deliveryAddress')
        ),
    },
    {
      name: 'receiveAddress',
      width: 120,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('receiveAddress'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'receiveAddress',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('receiveAddress')
        ),
    },
    {
      name: 'supplierCompanyName',
      width: 160,
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
      name: 'lineExportStatusMeaning',
      width: 120,
      renderer: ({ value, record }) => {
        if (value) {
          return (
            <Button
              funcType="link"
              color="primary"
              disabled={Number(docFlow) === 1}
              onClick={() => exportRender(value, record, nodeTemplateCode, docFlow, remote)}
            >
              {value}
            </Button>
          );
        } else {
          return '-';
        }
      },
    },
    {
      name: 'lineStatusMeaning',
      width: 80,
      renderer: ({ value, record }) => colorRender(value, record, 'lineStatus'),
    },
    {
      name: 'action',
      width: 80,
      hidden: !isNil(change),
      renderer: ({ record, dataSet }) => {
        if (
          (changeMarkFlag &&
            (!isNil(change) &&
              ['PURCHASER'].includes(record.get('createCampCode')) &&
              ['CONFIRMED'].includes(record.get('lineStatus')))) ||
          (changeMarkFlag &&
            (!isNil(change) &&
              ['SUPPLIER'].includes(record.get('createCampCode')) &&
              ['CONFIRMED'].includes(record.get('lineStatus')) &&
              ['PURCHASER'].includes(dataSet?.getState('interactiveCampCode')) &&
              ['CAN_SPLIT_UPDATE'].includes(record.get('demolitionUpdateCode'))))
        ) {
          return (
            <Button funcType="link" color="primary" onClick={() => splitLine(record)}>
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
          return <apan>{value || '-'}</apan>;
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
        : intl.get('slod.deliveryWorkbench.model.common.actualQuantity').d('来源单据数量'),
    },
    doubleUnitEnabled && {
      name: 'secondaryQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'actualQuantity',
      width: 130,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('actualQuantity'),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'actualQuantity',
          editFlag: statusValidate(record) && lineDs.getState('actualQuantity'),
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
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'quantity',
      width: 110,
      editor: (record) => !sourceFromPub && statusValidate(record) && lineDs.getState('quantity'),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'quantity',
          editFlag: statusValidate(record) && lineDs.getState('quantity'),
        };
        return showBigNumber(value, -1, {}, data);
      },
      header:
        nodeTemplateCode === 'UNIQUE_LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantitys')
                .d('本单已生成标签基本数量')
            : intl
                .get('slod.deliveryWorkbench.model.common.thisTimeuantitys')
                .d('本单已生成标签数量')
          : nodeTemplateCode === 'LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                .d('本次创建基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量')
          : doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmNumber').d('确认基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
    },
    {
      name: 'unitPackageQuantity',
      width: 110,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('unitPackageQuantity'),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'unitPackageQuantity',
          editFlag: statusValidate(record) && lineDs.getState('unitPackageQuantity'),
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
      editor: (record) => !sourceFromPub && statusValidate(record) && lineDs.getState('netWeight'),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'netWeight',
          editFlag: statusValidate(record) && lineDs.getState('netWeight'),
        };
        return showBigNumber(value, -1, {}, data);
      },
    },
    {
      name: 'grossWeight',
      width: 110,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('grossWeight'),
      renderer: ({ value, record }) => {
        const data = {
          ...record?.get(['changeFieldMap', 'changingFlag']),
          fieldName: 'grossWeight',
          editFlag: statusValidate(record) && lineDs.getState('grossWeight'),
        };
        return showBigNumber(value, -1, {}, data);
      },
    },
    {
      name: 'weightUomId',
      width: 110,
      renderer: ({ record }) => record?.get('displayWeightUom') || '-',
    },
    {
      name: 'lotNum',
      width: 110,
      editor: (record) => !sourceFromPub && statusValidate(record) && lineDs.getState('lotNum'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'lotNum',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('lotNum')
        ),
    },
    {
      name: 'productionDate',
      width: 160,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('productionDate'),
      renderer: ({ value, record }) => {
        const flag = statusValidate(record) && lineDs.getState('productionDate');
        const data =
          value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : flag ? null : '-';
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
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('lotExpirationDate'),
      renderer: ({ value, record }) => {
        const flag = statusValidate(record) && lineDs.getState('lotExpirationDate');
        const data =
          value && !isNil(value) ? moment(value).format('YYYY-MM-DD') : flag ? null : '-';
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
      editor: (record) => !sourceFromPub && statusValidate(record) && lineDs.getState('serialNum'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'serialNum',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('serialNum')
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
        !sourceFromPub && statusValidate(record) && lineDs.getState('purchaseLineRemark'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'purchaseLineRemark',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('purchaseLineRemark')
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
      name: 'deliveryAddress', // 发货地址
      width: 120,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('deliveryAddress'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'deliveryAddress',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('deliveryAddress')
        ),
    },
    {
      name: 'receiveAddress', // 收货地址
      width: 120,
      editor: (record) =>
        !sourceFromPub && statusValidate(record) && lineDs.getState('receiveAddress'),
      renderer: ({ value, record }) =>
        handleFieldsRender(
          value,
          record.get('changeFieldMap'),
          'receiveAddress',
          record.get('changingFlag'),
          statusValidate(record) && lineDs.getState('receiveAddress')
        ),
    },
    {
      name: 'shipToLocContName',
      width: 120,
      editor: !sourceFromPub && edit,
    },
    {
      name: 'shipToLocTelNum',
      width: 120,
      editor: !sourceFromPub && edit,
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
      name: 'splitFlag',
      width: 120,
      renderer: ({ record }) => record?.get('splitFlagMeaning') || '-',
    },
    {
      name: 'purchaseLineAttachmentUuid',
      width: 120,
    },
    {
      name: 'supplierLineAttachmentUuid',
      width: 120,
      editor: (record) => {
        const { getEditorFlag } = remote?.props?.process || {};
        const editFlag = false;
        if (typeof getEditorFlag === 'function') {
          return getEditorFlag({ editFlag, record, edit, change });
        }
        return editFlag;
      },
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
      renderer: ({ value, record }) => {
        if (value) {
          return <span>{record?.get('inventoryName')}</span>;
        } else {
          return '-';
        }
      },
    },
    {
      name: 'locationId',
      width: 110,
      renderer: ({ value, record }) => {
        if (value) {
          return <span>{record?.get('locationName')}</span>;
        } else {
          return '-';
        }
      },
    },
  ];

  if (nodeTemplateCode === 'LABEL') {
    const columnsLabel = labelColumns.basic.concat(
      labelColumns.noSoleLabel,
      labelColumns.twoNum,
      labelColumns.remainderQuantity,
      labelColumns.other,
      labelColumns.other_two,
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
      labelColumns.soleLabel,
      labelColumns.twoNum,
      labelColumns.other,
      labelColumns.soleLabelDetail,
      labelColumns.other_two,
      labelColumns.linkBtn
    ); // 唯一标签
    return remote
      ? remote.process('UNIQUELABEL_DETAIL_LINE_COLUMNS', columnsUniqueLabel, { dataSet: lineDs })
      : columnsUniqueLabel;
  }
};

export default columns;
