import intl from 'utils/intl';
import React from 'react';
import moment from 'moment';
import notification from 'utils/notification';
import { SRM_SPRM } from '_utils/config';
import { DataSet, Table, Modal, DatePicker, Tooltip } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import {
  saveDetail,
  saveSupplierDetail,
  deleteLines,
} from '@/services/forecastTemplateDefOrgService';
import { getResponse } from 'hzero-front/lib/utils/utils';

// 预测类型数据
const initLinesValue = () => [
  {
    value: 'fcstQuantity',
    meaning: intl.get('sprm.forecastMgt.model.common.fcstQuantity').d('预测数量'),
    orderSeq: 10,
  },
  {
    value: 'fcstAmountIncTax',
    meaning: intl.get('sprm.forecastMgt.model.common.fcstAmountIncTax').d('预测金额（含税）'),
    orderSeq: 10,
  },
  {
    value: 'fcstAmountExcTax',
    meaning: intl.get('sprm.forecastMgt.model.common.fcstAmountExcTax').d('预测金额（不含税）'),
    orderSeq: 10,
  },
  {
    value: 'feedbackQuantity',
    meaning: intl.get('sprm.forecastMgt.model.common.feedbackQuantity').d('供应商确认'),
    orderSeq: 20,
  },
  {
    value: 'diffQiantity',
    meaning: intl.get('sprm.forecastMgt.model.common.diffQiantity').d('系统比差'),
    orderSeq: 30,
  },
];

// 默认展示字段
const initCols = [
  { name: 'fcstNum' },
  { name: 'lineNum' },
  { name: 'fcstStatus' },
  { name: 'releaseStatus' },
  { name: 'supplierLov' },
  { name: 'displaySupplierName' },
  { name: 'itemId' },
  { name: 'categoryId' },
  { name: 'itemName' },
  { name: 'itemSpecs' },
  { name: 'itemModel' },
  { name: 'uomId' },
  { name: 'companyId' },
  { name: 'ouId' },
  { name: 'purchaseOrgId' },
  { name: 'purchaseAgentId' },
  { name: 'invOrganizationId' },
];

// 设置动态列字段类型
const getFieldType = (fieldType) => {
  // todo
  switch (fieldType) {
    case 'LOV':
      return 'object';
    case 'SELECT':
      return 'string';
    case 'SWITCH':
      return 'boolean';
    case 'INPUT_NUMBER':
      return 'number';
    case 'DATE_PICKER':
      return 'date';
    default:
      return 'string';
  }
};

const forecastDetailDs = ({
  fcstHeaderId,
  fcstLineId,
  version,
  viewedBy,
  queryType,
  activeLine,
  fcrtType,
  editorFlag,
  currentTab,
  predictionDimensionCnf,
}) => {
  return {
    autoQuery: true,
    dataToJSON: 'all',
    selection:
      editorFlag && activeLine === fcrtType && viewedBy === 'purchase' ? 'multiple' : false,
    primaryKey: 'fcstLineDetailId',
    fields: [
      {
        name: 'fcstDeliveryDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        label: intl.get(`sprm.forecastMgt.model.common.fcstDeliveryDate`).d('预计交货日期'),
      },
      {
        name: 'fcstQuantity',
        type: 'number',
        min: 0,
        precision: 10,
        required: viewedBy === 'purchase',
        label:
          predictionDimensionCnf === 'QUANTITY'
            ? intl.get(`sprm.forecastMgt.model.common.fcstQuantity`).d('要求到货数量')
            : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
            ? intl.get(`sprm.forecastMgt.model.common.fcstAmountTax`).d('要求到货金额（含税）')
            : intl.get(`sprm.forecastMgt.model.common.fcstAmountNoTax`).d('要求到货金额（不含税）'),
      },
      {
        name: 'purchaserRemark',
        label: intl.get(`sprm.forecastMgt.model.common.purchaserRemark`).d('采购方备注'),
      },
      {
        name: 'feedbackDeliveryDate',
        format: DEFAULT_DATE_FORMAT,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        label: intl.get(`sprm.forecastMgt.model.common.feedbackDeliveryDate`).d('供应商反馈交期'),
      },
      {
        name: 'feedbackQuantity',
        type: 'number',
        min: 0,
        precision: 10,
        required: viewedBy === 'supplier',
        // label: intl.get(`sprm.forecastMgt.model.detail.feedbackQuantity`).d('供应商反馈数量'),
        label:
          predictionDimensionCnf === 'QUANTITY'
            ? intl.get(`sprm.forecastMgt.model.detail.feedbackQuantity`).d('供应商反馈数量')
            : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
            ? intl
                .get(`sprm.forecastMgt.model.common.feedbackAmountTax`)
                .d('供应商反馈金额（含税）')
            : intl
                .get(`sprm.forecastMgt.model.common.feedbackAmountNoTax`)
                .d('供应商反馈金额（不含税）'),
      },
      {
        name: 'supplierRemark',
        label: intl.get(`sprm.forecastMgt.model.detail.supplierRemark`).d('供应商备注'),
      },
      {
        name: 'enoughFlag',
        defaultValue: 0,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`sprm.forecastMgt.model.detail.enoughFlag`).d('是否满足'),
      },
    ],
    events: {
      update: ({ record, name, value = {} }) => {
        if (name === 'feedbackQuantity') {
          record.set({ enoughFlag: value >= record.get('fcstQuantity') ? 1 : 0 });
        }
        if (name === 'fcstQuantity') {
          record.set({
            enoughFlag:
              record.get('feedbackQuantity') && value >= record.get('feedbackQuantity') ? 1 : 0,
          });
        }
      },
    },
    transport: {
      read: () => {
        let url = '';
        if (viewedBy === 'history') {
          url = `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/fcst-line-detail-ver/list`;
        } else if (viewedBy === 'purchase') {
          url = `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/fcst-line-details/list`;
        } else {
          url = `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/fcst-supply-line-details/list`;
        }
        return {
          url,
          method: 'GET',
          data: { fcstHeaderId, fcstLineId, version, queryType, currentTab },
        };
      },
    },
  };
};

const columns = ({
  cycleEndTime,
  cycleStartTime,
  activeLine,
  fcrtType,
  editorFlag,
  viewedBy,
  fcstStartDate,
}) => [
  {
    name: 'fcstDeliveryDate',
    editor: editorFlag && viewedBy === 'purchase' && activeLine === fcrtType && (
      <DatePicker min={moment(cycleStartTime)} max={moment(cycleEndTime)} />
    ),
  },
  {
    name: 'fcstQuantity',
    editor: editorFlag && activeLine === fcrtType && viewedBy === 'purchase',
  },
  {
    name: 'purchaserRemark',
    editor: editorFlag && activeLine === fcrtType && viewedBy === 'purchase',
  },
  {
    name: 'feedbackDeliveryDate',
    editor: (record) =>
      editorFlag &&
      viewedBy === 'supplier' &&
      activeLine === fcrtType && (
        <DatePicker
          min={
            record.get('fcstDeliveryDate')
              ? moment(record.get('fcstDeliveryDate'))
              : moment(fcstStartDate)
          }
        />
      ),
  },
  {
    name: 'feedbackQuantity',
    editor: editorFlag && activeLine === fcrtType && viewedBy === 'supplier',
  },
  {
    name: 'supplierRemark',
    editor: editorFlag && activeLine === fcrtType && viewedBy === 'supplier',
  },
  { name: 'enoughFlag', renderer: ({ value }) => yesOrNoRender(value) },
];

const deleteFc = (dataSet) => {
  const { selected } = dataSet;
  const deleUpdateArr = selected.filter((ele) => ele.get('fcstLineDetailId'));
  if (deleUpdateArr.length > 0) {
    const deleteLine = deleUpdateArr?.map((ele) => ele.toJSONData());
    deleteLines(deleteLine).then((res) => {
      if (res && res.failed) {
        notification.error({ message: res.message });
      }
      if (res && !res.failed) {
        dataSet.unSelectAll();
        dataSet.clearCachedSelected();
        dataSet.query();
        notification.success();
      }
    });
  } else {
    dataSet.remove(selected);
  }
};

const handleEditModal = (
  record,
  {
    fieldCode,
    cycleEndTime,
    needFeedback,
    cycleStartTime,
    allowChange,
    fcstLineType,
    feedbackChangeCnf,
    viewedBy,
    activeLine,
    predictionDimensionCnf,
  }
) => {
  const {
    fcstStatus,
    version,
    latestFeedbackVersion,
    fcrtType,
    sourcePlatform,
    fcstStartDate,
    latestReleaseVersion,
    currentTab,
  } = record.get([
    'fcstStatus',
    'version',
    'latestFeedbackVersion',
    'latestReleaseVersion',
    'fcstStartDate',
    'fcrtType',
    'sourcePlatform',
    'currentTab',
  ]);

  const fcstLineList = record.parent
    ? record.parent.get('fcstLineList')
    : record.get('fcstLineList');

  const range = record.get(`${fieldCode}Range`);
  const currentDs = record?.dataSet;
  const currentItem = fcstLineList.find((ele) => ele.fcstDate === fieldCode);
  const { fcstHeaderId, fcstLineId } = currentItem || {};
  let queryType;
  if (Number(latestFeedbackVersion) !== Number(version) && fcstStatus === 'FEEDBACK') {
    queryType = 3;
  }
  if (Number(latestReleaseVersion) !== Number(version) && fcstStatus === 'RELEASED') {
    queryType = 2;
  }
  const editorFlag =
    viewedBy === 'purchase'
      ? (['RELEASED', 'FEEDBACK_REJECTED'].includes(fcstStatus) &&
          allowChange === 1 &&
          Number(latestReleaseVersion) === Number(version)) ||
        (['ALL', 'PURCHASE'].includes(feedbackChangeCnf) &&
          Number(latestFeedbackVersion) === Number(version) &&
          fcstStatus === 'FEEDBACK') ||
        ['NEW', 'UNRELEASED', 'CHANGED'].includes(fcstStatus)
      : fcrtType === 'feedbackQuantity' &&
        needFeedback === 1 &&
        fcstStatus !== 'CLOSED' &&
        ((['ALL', 'SUPPLIER'].includes(feedbackChangeCnf) && fcstStatus === 'FEEDBACK') ||
          fcstStatus !== 'FEEDBACK');
  const tableDs = new DataSet(
    forecastDetailDs({
      fcstHeaderId,
      fcstLineId,
      viewedBy,
      queryType,
      activeLine,
      fcrtType,
      editorFlag,
      currentTab,
      predictionDimensionCnf,
    })
  );
  return Modal.open({
    key: Modal.key(),
    drawer: true,
    style: { width: 1080 },
    bodyStyle: { paddingTop: '16px' },
    title:
      fcstLineType === 'WEEK'
        ? intl.get(`sprm.forecastMgt.model.common.weekDetail`).d('周度预测详情')
        : intl.get(`sprm.forecastMgt.model.common.monthDetail`).d('月度预测详情'),
    children: (
      <Table
        dataSet={tableDs}
        style={{ maxHeight: 'calc(100vh - 250px)' }}
        columns={columns({
          cycleEndTime: range?.cycleEndTime || cycleEndTime,
          activeLine,
          fcrtType,
          cycleStartTime: range?.cycleStartTime || cycleStartTime,
          editorFlag,
          viewedBy,
          fcstStartDate,
        })}
        customizedCode={
          viewedBy === 'purchase'
            ? 'sprm_frst_purchase_month_list'
            : 'sprm_frst_supplier_month_list'
        }
        buttons={
          viewedBy === 'purchase' &&
          editorFlag &&
          activeLine === fcrtType &&
          sourcePlatform === 'SRM'
            ? [
                'add',
                [
                  'delete',
                  {
                    name: 'delete',
                    onClick: () => deleteFc(tableDs, { fcstHeaderId, fcstLineId }),
                  },
                ],
              ]
            : []
        }
      />
    ),
    closable: true,
    movable: false,
    destroyOnClose: true,
    onOk: async () => {
      const validateFlag = await tableDs.validate();
      if (validateFlag) {
        const tableData = tableDs.toJSONData()?.map((ele) => ({
          ...ele,
          tenantId: getCurrentOrganizationId(),
          fcstHeaderId,
          fcstLineId,
        }));
        const res =
          viewedBy === 'purchase'
            ? getResponse(await saveDetail(tableData))
            : getResponse(await saveSupplierDetail(tableData));
        if (res || res === 0) {
          if (viewedBy === 'purchase' && ['FEEDBACK', 'RELEASED'].includes(fcstStatus)) {
            record.reset();
          }
          currentDs.query(currentDs?.currentPage || 1, {}, true);
        } else {
          return false;
        }
      } else {
        notification.error({ message: '当前界面存在必填信息未填写' });
        return false;
      }
    },
    okText: intl.get('hzero.common.button.ok').d('确定'),
    cancelText: !(viewedBy === 'supplier' && !needFeedback)
      ? intl.get('hzero.common.button.cancel').d('取消')
      : intl.get('hzero.common.button.close').d('关闭'),
    onCancel: () => {},
    footer: (okBtn, cancelBtn) => (
      <div>
        {!(viewedBy === 'supplier' && !needFeedback) && (
          <Tooltip title="点击确定后，该行数据（已发布或已反馈的行）会被重置" placement="left">
            {okBtn}
          </Tooltip>
        )}
        {cancelBtn}
      </div>
    ),
  });
};

// 动态数字类字段编辑｜展示逻辑
const dynamicArrComp = (dynamicColumnFields, config, viewedBy) => {
  const daysObj = {
    DAY: intl.get('hzero.common.date.unit.day').d('天'),
    MONTH: intl.get('hzero.common.view.month').d('月'),
    WEEK: intl.get('hzero.common.view.week').d('周'),
    YEAR: intl.get('hzero.common.view.year').d('年'),
  };
  const activeLine = viewedBy === 'purchase' ? 'fcstQuantity' : 'feedbackQuantity';
  const {
    allowChange,
    feedbackChangeCnf,
    detailFeedbackFlag,
    needFeedback,
    fcstDateRangeStart,
    fcstDateRangeEnd,
    predictionDimensionCnf,
  } = config;
  const dynamicArr = dynamicColumnFields?.map(
    ({
      fieldCode,
      cycleEndTime,
      cycleStartTime,
      fcstLineType,
      width,
      editable,
      fcstSeq,
      fieldName,
    }) => {
      const label = fcstSeq
        ? `${intl
            .get(`sprm.forecastMgt.model.common.daysOrMonth`, {
              type: daysObj[fcstLineType],
              number: fcstSeq,
            })
            .d(`第${fcstSeq}${daysObj[fcstLineType]}`)}`
        : fieldName;
      return {
        fieldName,
        header:
          viewedBy !== 'purchase' || fcstDateRangeStart === fcstDateRangeEnd ? fieldName : label,
        width,
        fcstSeq,
        renderer: ({ text, value, record, name }) =>
          detailFeedbackFlag === 1 &&
          ['WEEK', 'MONTH'].includes(fcstLineType) &&
          (viewedBy === 'purchase' || viewedBy === 'supplier') ? (
            record.get('fcstHeaderId') || record.get('fcstHeaderIdMain') ? (
              <a
                onClick={() =>
                  handleEditModal(record, {
                    viewedBy,
                    fieldCode,
                    cycleEndTime,
                    cycleStartTime,
                    allowChange,
                    fcstLineType,
                    activeLine,
                    feedbackChangeCnf,
                    needFeedback,
                    predictionDimensionCnf,
                  })
                }
              >
                {text ||
                  (viewedBy === 'supplier' && record.get(`${fieldCode}-fcstQuantity`) ? '0' : null)}
              </a>
            ) : (
              text ||
              (viewedBy === 'supplier' && record.get(`${fieldCode}-fcstQuantity`) ? '0' : null)
            )
          ) : (
            <span
              style={{
                color:
                  !['feedbackQuantity', 'fcstQuantity'].includes(record.get('fcrtType')) &&
                  Number(value) < 0
                    ? 'red'
                    : '#333',
              }}
            >
              {!record.get('forecastCategoryType')
                ? text || (name.includes('sum') ? '-' : '')
                : yesOrNoRender(Number(value))}
            </span>
          ),
        fcstLineType,
        name:
          fcstLineType === 'DAY' && viewedBy === 'purchase'
            ? `${fcstLineType}${fcstSeq}`
            : fieldCode,
        // 已发布的+允许变更 || 已反馈的+版本最新的+允许采购方更改 || 状态=新建，待发布，已变更的数据
        // 在fcrtType === fcstQuantity，不启用明细反馈，且字段可以编辑的情况下可以编辑
        editor: (record) => {
          const {
            fcstStatus,
            latestFeedbackVersion,
            latestReleaseVersion,
            version,
            fcrtType,
            sourceType,
          } = record.get([
            'fcstStatus',
            'latestFeedbackVersion',
            'latestReleaseVersion',
            'version',
            'fcrtType',
            'sourceType',
          ]);
          // 关闭行不可编辑，明细反馈下，非日期的要点击a标签，不可编辑
          if (
            editable === 0 ||
            ['CLOSED', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL'].includes(
              record.get('fcstStatus')
            ) ||
            (detailFeedbackFlag === 1 && !['DAY', 'YEAR'].includes(fcstLineType)) ||
            sourceType === 'version'
          ) {
            return false;
          } else if (viewedBy === 'purchase') {
            return (
              ((['RELEASED', 'FEEDBACK_REJECTED'].includes(fcstStatus) &&
                allowChange === 1 &&
                Number(latestReleaseVersion) === Number(version)) ||
                (['ALL', 'PURCHASE'].includes(feedbackChangeCnf) &&
                  Number(latestFeedbackVersion) === Number(version) &&
                  fcstStatus === 'FEEDBACK') ||
                ['NEW', 'UNRELEASED', 'CHANGED'].includes(fcstStatus)) &&
              fcrtType === 'fcstQuantity'
            );
          } else {
            // 供应商： 在开启需要反馈，供应商反馈数量行可以编辑。已反馈的数据在开供应商可变更的情况下可以再次编辑
            return (
              fcrtType === 'feedbackQuantity' &&
              needFeedback === 1 &&
              ((['ALL', 'SUPPLIER'].includes(feedbackChangeCnf) && fcstStatus === 'FEEDBACK') ||
                fcstStatus !== 'FEEDBACK')
            );
          }
        },
      };
    }
  );
  return dynamicArr;
};

const handleReadModal = (record, { fieldCode, predictionDimensionCnf, fcstLineType, viewedBy }) => {
  const fcstLineVerList = record.get('fcstLineVerList');
  const currentItem = fcstLineVerList.find((ele) => ele.fcstDate === fieldCode);
  const { fcstHeaderId, fcstLineId, version } = currentItem || {};
  const tableDs = new DataSet(
    forecastDetailDs({
      fcstHeaderId,
      fcstLineId,
      version,
      viewedBy: 'history',
      predictionDimensionCnf,
    })
  );
  return Modal.open({
    key: Modal.key(),
    drawer: true,
    style: { width: 1080 },
    bodyStyle: { paddingTop: '16px' },
    title:
      fcstLineType === 'WEEK'
        ? intl.get(`sprm.forecastMgt.model.common.weekDetail`).d('周度预测详情')
        : intl.get(`sprm.forecastMgt.model.common.monthDetail`).d('月度预测详情'),
    children: (
      <Table
        dataSet={tableDs}
        columns={columns({ editorFlag: false })}
        style={{ maxHeight: 'calc(100vh - 250px)' }}
        customizedCode={
          viewedBy === 'purchase'
            ? 'sprm_frst_purchase_month_list'
            : 'sprm_frst_supplier_month_list'
        }
      />
    ),
    closable: true,
    movable: false,
    destroyOnClose: true,
    onCancel: () => {},
    footer: (cancelBtn) => <div>{cancelBtn}</div>,
  });
};
const hisotryArrComp = (dynamicColumnFields, config) => {
  const { detailFeedbackFlag, predictionDimensionCnf, viewedBy } = config;
  return dynamicColumnFields?.map(({ name, fieldCode, fcstLineType, fieldName }) => ({
    name: name || fieldCode,
    fieldCode,
    header: fieldName || fieldCode,
    align: 'right',
    renderer: ({ record, text }) => {
      const value = record.get(fieldCode);
      const colorStyle = record.get(`${fieldCode}Color`) || value < 0 ? { color: 'red' } : {};
      const ALinkComp = record.get(`${fieldCode}Color`) ? (
        <Tooltip>
          <a
            style={{ color: 'red' }}
            onClick={() =>
              handleReadModal(record, { fieldCode, predictionDimensionCnf, fcstLineType, viewedBy })
            }
          >
            {record.get(fieldCode)}
          </a>
        </Tooltip>
      ) : (
        <a
          style={{ ...colorStyle }}
          onClick={() =>
            handleReadModal(record, { fieldCode, predictionDimensionCnf, fcstLineType, viewedBy })
          }
        >
          {text}
        </a>
      );
      if (
        detailFeedbackFlag === 1 &&
        !['DAY', 'YEAR', 'SUM_BY_YEAR', 'SUM_BY_MONTH', 'SUM_BY_DAY', 'SUM_BY_WEEK'].includes(
          fcstLineType
        ) &&
        !record.get('forecastCategoryType')
      ) {
        return ALinkComp;
      } else {
        return record.get(`${fieldCode}Color`) ? (
          <Tooltip
            title={intl
              .get(`sprm.forecastMgt.model.beforeChanged`, {
                value: record.get(`${fieldCode}Color`),
              })
              .d(`变更前：${record.get(`${fieldCode}Color`)}`)}
          >
            <span style={{ color: record.get(`${fieldCode}Color`) ? 'red' : '#333' }}>
              {!record.get('forecastCategoryType')
                ? record.get(fieldCode)
                : yesOrNoRender(Number(fieldCode))}
            </span>
          </Tooltip>
        ) : (
          <span style={{ color: value < 0 ? 'red' : '#333' }}>
            {!record.get('forecastCategoryType')
              ? record.get(fieldCode)
              : yesOrNoRender(Number(fieldCode))}
          </span>
        );
      }
    },
  }));
};
export { initLinesValue, initCols, getFieldType, dynamicArrComp, hisotryArrComp };
