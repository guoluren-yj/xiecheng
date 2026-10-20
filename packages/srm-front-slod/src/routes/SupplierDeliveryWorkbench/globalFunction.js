/* eslint-disable no-unused-expressions */
/*
 * @Description: index-function
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { createElement } from 'react';
import { Icon, Modal, Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import { isNil, isString } from 'lodash';
import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { stringify } from 'querystring';
import { Tag } from 'choerodon-ui';
// import C7nPopover from './hook.js';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import {
  handleOff,
  createData,
  handlePrint,
  handleCancel,
  handleDelete,
  handleSubmit,
  handleAffirm,
  handleClose,
  handleRecall,
  createDataAll,
  handleExport,
  handleCancelChangeApi,
  handleRevokeApprovalChange,
} from '@/services/DeliveryWorkbenchServices';
import { createColumns } from './ColumnsAndDs/creatIndex';
import { submitColumns } from './ColumnsAndDs/submitIndex';
import { affirmColumns } from './ColumnsAndDs/affirmIndex';
import { allColumns } from './ColumnsAndDs/allIndex';
import UniqueLineList from './components/uniqueModule/uniqueLineList';
import ExportStatus from './components/exportStatus/index';
import ExecutionRecord from '../components/ExecutionRecord';

import styles from './index.less';

const campKey = 's';

/**
 * columns汇总
 * @columns columns
 * @_object object 传入的参数对象
 * @others object 传入的参数对象
 * @tabKey string tab栏状态
 * */
const getColumns = (_object, props) => {
  const { tabKey } = _object;
  let columns;
  switch (tabKey) {
    case 'create':
      columns = createColumns(_object);
      break;
    case 'submit':
      columns = submitColumns({ ..._object, allDetailEntrance }, props);
      break;
    case 'affirm':
      columns = affirmColumns({ ..._object, allDetailEntrance, lebelDetailModal }, props);
      break;
    case 'all':
      columns = allColumns({ ..._object, allDetailEntrance, lebelDetailModal }, props);
      break;
    default:
      columns = createColumns(_object);
      break;
  }
  return columns;
};

/**
 * 单/行切换
 * @object props
 * */
const rightBarTable = (props) => {
  const { hdKey, useHdChange = (e) => e, tabKey, nodeTemplateCode } = props;
  if (
    tabKey === 'affirm' ||
    tabKey === 'all' ||
    (nodeTemplateCode === 'PLAN' && tabKey === 'submit')
  ) {
    return (
      <div
        className={styles['toggle-key']}
        // style={{ width: nodeTemplateCode === 'PLAN' && tabKey === 'all' ? '131px' : '86px' }}
      >
        <div
          onClick={() => useHdChange('left')}
          className={styles[hdKey === 'left' ? 'activity' : 'toggle-key-btn']}
        >
          <Tooltip
            placement="topLeft"
            title={intl.get('slod.deliveryWorkbench.model.common.receiptsbtn').d('按单')}
          >
            <span className={styles['toggle-btn']}>
              {intl.get('slod.deliveryWorkbench.model.common.receiptsbtn').d('按单')}
            </span>
          </Tooltip>
        </div>
        <div
          onClick={() => useHdChange('right')}
          className={styles[hdKey === 'right' ? 'activity' : 'toggle-key-btn']}
        >
          <Tooltip
            placement="topRight"
            title={intl.get('slod.deliveryWorkbench.model.common.linebtn').d('按行')}
          >
            <span>{intl.get('slod.deliveryWorkbench.model.common.linebtn').d('按行')}</span>
          </Tooltip>
        </div>
        {nodeTemplateCode === 'PLAN' && tabKey === 'all' && (
          <div
            onClick={() => useHdChange('date')}
            className={styles[hdKey === 'date' ? 'activity-date' : 'toggle-key-btn-date']}
          >
            <Tooltip
              placement="topRight"
              title={intl.get('slod.deliveryWorkbench.model.common.lineDate').d('按日期')}
            >
              <span>{intl.get('slod.deliveryWorkbench.model.common.lineDate').d('按日期')}</span>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
};
/**
 * 提取公共参数
 * @object _object
 * */
const conditionList = (_object, key) => {
  const { dataSet, composite } = _object;
  const nodeTemplateCode = composite.summarization;
  const nodeConfigId = composite.menuMarkId;
  const operationType = 'tabulation'; // 列表/明细
  const data = dataSet.selected.map((item) => item.toJSONData());
  const condition = {
    campKey: key,
    nodeTemplateCode,
    hdKey: composite.hdKey,
    operationType,
    nodeConfigId,
    deliveryLineDTOList: data,
  };
  return condition;
};

/**
 * 提取公共方法
 * @function _function
 * @dataSet dataSet
 * */
const shareFunction = (_function, _dataSet, loadingFlag) => {
  try {
    const res = _function;
    if (getResponse(res)) {
      loadingFlag(false);
      _dataSet.clearCachedSelected(); // 初始化时清除缓存的勾选记录
      _dataSet.unSelectAll(); // 初始化时清除缓存的勾选记录
      _dataSet.query();
      notification.success();
    } else {
      loadingFlag(false);
    }
  } catch (e) {
    throw e;
  } finally {
    loadingFlag(false);
  }
};

/**
 * 创建按钮是否进入并单
 * @object _object
 * */

const combineTab = (res, composite, history) => {
  const { mergeFlag = null, deliveryHeaderId, cacheKey } = res;
  const { summarization, menuMarkId, nodeTitle } = composite;
  if (mergeFlag === 1) {
    history.push({
      pathname: `/slod/supplier-delivery-workbench/detail/tab-create`,
      search: `nodeTemplateCode=${summarization}&nodeConfigId=${menuMarkId}&headerId=${deliveryHeaderId}&cacheKey=${cacheKey}&nodeConfigName=${nodeTitle}`,
    });
  } else {
    history.push({
      pathname: `/slod/supplier-delivery-workbench/detail/create/`,
      search: `nodeTemplateCode=${summarization}&nodeConfigId=${menuMarkId}&headerId=${deliveryHeaderId}`,
    });
  }
};

/**
 * 创建按钮
 * @object _object
 * */
const creationButton = async (_object, props) => {
  const {
    type,
    dataSet,
    history,
    composite = {},
    unitCuzCode = '',
    loadingFlag = (e) => e,
  } = _object;
  const { remote } = props;
  const id =
    composite.menuMarkId === 'all' ? composite.dataPool.split('@')[0] : composite.menuMarkId;
  const fieldObj = {
    nodeConfigId: id,
    customizeUnitCode: unitCuzCode || null,
    customizeCode: composite.customizeCode || null,
    nodeTemplateCode: composite.summarization || null,
  };
  const query = {
    campKey: 's', // 采购方标识
    customizeUnitCode: unitCuzCode,
  };
  const beforeCreation = await (remote
    ? remote.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_BEFORE_CREATION', true, {
        composite,
        type,
        dataSet,
      })
    : true);
  if (!beforeCreation) return;
  if (type === 'select') {
    const data = dataSet.selected.map((item) => item.toJSONData());
    if (data.length > 0) {
      loadingFlag(true);
      try {
        const res = await createData({ ...fieldObj, data, query });
        if (getResponse(res)) {
          if (!isNil(res.asyncBatchNum)) {
            notification.warning({
              message: intl
                .get('slod.deliveryWorkbench.view.title.asyncbatchNumMessage')
                .d(
                  '当前执行数量超过500条，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看'
                ),
            });
            return;
          }
          // eslint-disable-next-line no-param-reassign
          props.tableConfigRef.cache = true;
          // eslint-disable-next-line no-param-reassign
          props.tableConfigRef.page = 'detail';
          notification.success();
          loadingFlag(false);
          combineTab(res, composite, history);
        } else {
          loadingFlag(false);
        }
      } catch (e) {
        throw e;
      } finally {
        loadingFlag(false);
      }
    }
  } else {
    const queryData = dataSet?.queryDataSet?.toData()[0];
    const queryParams = filterNullValueObject({
      ...dataSet?.queryParameter?.params,
      ...queryData,
    });
    Modal.confirm({
      contentStyle: { width: '550px' },
      children: (
        <span style={{ fontSize: '14px' }}>
          {intl
            .get('slod.deliveryWorkbench.model.view.wantToCreateAllTheData')
            .d(
              '当前操作为获取已查询出来的所有待创建数据进行全部创建，当数据量超过500行，系统会进行异步创建流程（可通过【异步执行记录】查看），确认执行全选创建操作？'
            )}
        </span>
      ),
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        loadingFlag(true);
        try {
          const res = await createDataAll({ ...fieldObj, queryParams, query });
          if (getResponse(res)) {
            if (!isNil(res.asyncBatchNum)) {
              notification.warning({
                message: intl
                  .get('slod.deliveryWorkbench.view.title.asyncbatchNumMessage')
                  .d(
                    '当前执行数量超过500条，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看'
                  ),
              });
              return;
            }
            // eslint-disable-next-line no-param-reassign
            props.tableConfigRef.cache = true;
            // eslint-disable-next-line no-param-reassign
            props.tableConfigRef.page = 'detail';
            notification.success();
            loadingFlag(false);
            combineTab(res, composite, history);
          } else {
            loadingFlag(false);
          }
        } catch (e) {
          throw e;
        } finally {
          loadingFlag(false);
        }
      },
      onCancel: () => {
        loadingFlag(false);
      },
    });
  }
};

/**
 * 删除按钮
 * @object _object
 * */
const handleDeleteList = async (_object) => {
  const { dataSet, composite = {}, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  const data = dataSet?.selected?.map((item) => item.toJSONData()) || [];
  const params = {
    campKey,
    headerInfo: data,
    nodeTemplateCode: composite.summarization || null,
    nodeConfigId: composite.menuMarkId || null,
  };
  const tips = dataSet.selected
    .map((i) => i.toData())
    .map((i) => {
      return i?.displayLabelLineNum || i?.displayPlanLineNum || i?.displayAsnLineNum
        ? ` ${i?.nodeConfigName} ${i?.displayLabelNum ||
            i?.displayPlanNum ||
            i?.displayAsnNum}-${i?.displayLabelLineNum ||
            i?.displayPlanLineNum ||
            i?.displayAsnLineNum}`
        : ` ${i?.nodeConfigName}${i?.displayLabelNum || i?.displayPlanNum || i?.displayAsnNum}`;
    })
    .join(',');
  Modal.confirm({
    contentStyle: { width: '550px' },
    title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
    children: (
      <div>
        <span>{intl.get('slod.deliveryWorkbench.view.message.deliveryDelete').d(`确认删除`)}</span>
        {tips}
        {'?'}
      </div>
    ),
    okText: intl.get('hzero.common.button.sure').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    onOk: async () => {
      loadingFlag(true);
      shareFunction(await handleDelete(params), dataSet, loadingFlag);
      queryTabCountList(
        { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
        composite.menuMarkId
      );
    },
  });
};

/**
 * 提交按钮
 * @object _object
 * */
const handleSubmitList = async (_object) => {
  const {
    dataSet,
    composite = {},
    loadingFlag = (e) => e,
    queryTabCountList = (e) => e,
    remote = (e) => e,
  } = _object;
  loadingFlag(true);
  const params = conditionList(_object, campKey);
  if (remote.event) {
    const remoteFlag = await remote.event.fireEvent('remoteBeforeSubmit', {
      params,
      dataSet,
      loadingFlag,
    });
    if (!remoteFlag) {
      return loadingFlag(false);
    }
  }
  shareFunction(await handleSubmit(params), dataSet, loadingFlag);
  queryTabCountList(
    { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
    composite.menuMarkId
  );
};

/**
 * 确认按钮
 * @object _object
 * */
const handleAffirmList = async (_object) => {
  const { dataSet, composite = {}, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  loadingFlag(true);
  const params = conditionList(_object, campKey);
  shareFunction(await handleAffirm(params), dataSet, loadingFlag);
  queryTabCountList(
    { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
    composite.menuMarkId
  );
};

/**
 * 拒绝按钮
 * @object _object
 * */
const handleCloseList = async (_object) => {
  const { dataSet, composite = {}, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  const params = conditionList(_object, campKey);
  const tips = dataSet.selected
    .map((i) => i.toData())
    .map((i) => {
      return i?.displayLabelLineNum || i?.displayPlanLineNum || i?.displayAsnLineNum
        ? ` ${i.nodeConfigName} ${i?.displayLabelNum ||
            i?.displayPlanNum ||
            i?.displayAsnNum}-${i?.displayLabelLineNum ||
            i?.displayPlanLineNum ||
            i?.displayAsnLineNum}`
        : ` ${i?.nodeConfigName}${i?.displayLabelNum || i?.displayPlanNum || i?.displayAsnNum}`;
    })
    .join(',');
  Modal.confirm({
    contentStyle: { width: '550px' },
    title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
    children: (
      <div>
        <span>{intl.get('slod.deliveryWorkbench.view.message.sureCloses').d('是否拒绝')}</span>
        {tips}
        {'?'}
      </div>
    ),
    okText: intl.get('hzero.common.button.sure').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    onOk: async () => {
      loadingFlag(true);
      shareFunction(await handleClose(params), dataSet, loadingFlag);
      queryTabCountList(
        { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
        composite.menuMarkId
      );
    },
  });
};

/**
 * 撤回按钮
 * @object _object
 * */
const handleRecallList = async (_object) => {
  const { dataSet, composite = {}, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  loadingFlag(true);
  const params = conditionList(_object, campKey);
  shareFunction(await handleRecall(params), dataSet, loadingFlag);
  queryTabCountList(
    { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
    composite.menuMarkId
  );
};

/**
 * 关闭按钮
 * @object _object
 * */
const handleOffList = async (_object) => {
  const { dataSet, composite = {}, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  const params = conditionList(_object, campKey);
  const tips = dataSet.selected
    .map((i) => i.toData())
    .map((i) => {
      return i?.displayLabelLineNum || i?.displayPlanLineNum || i?.displayAsnLineNum
        ? ` ${i.nodeConfigName}${i?.displayLabelNum ||
            i.displayPlanNum ||
            i.displayAsnNum}-${i?.displayLabelLineNum ||
            i?.displayPlanLineNum ||
            i?.displayAsnLineNum}`
        : ` ${i?.nodeConfigName}${i?.displayLabelNum || i?.displayPlanNum || i?.displayAsnNum}`;
    })
    .join(',');
  Modal.confirm({
    contentStyle: { width: '550px' },
    children: (
      <span>
        {intl.get('slod.deliveryWorkbench.model.view.sureClose').d('确定要关闭')}
        {tips}
        {'?'}
      </span>
    ),
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    okText: intl.get('hzero.common.button.sure').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    onOk: async () => {
      loadingFlag(true);
      shareFunction(await handleOff(params), dataSet, loadingFlag);
      queryTabCountList(
        { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
        composite.menuMarkId
      );
    },
    onCancel: () => {
      loadingFlag(false);
    },
  });
};

/**
 * 导出按钮-下载
 * @object _object
 * */
const handleExportList = async (_object = {}) => {
  const { queryParamsDate, unitCuzCode, loadingFlag = (e) => e } = _object;
  loadingFlag(true);
  const params = conditionList(_object, campKey);
  const res = await handleExport({ ...params, unitCuzCode, queryParamsDate });
  if (res && res.type && res.type.includes('application/json')) {
    const reader = new FileReader();
    reader.readAsText(res, 'utf-8');
    reader.onload = () => {
      const readers = reader.result;
      const parseObj = JSON.parse(readers);
      notification.error({ message: parseObj.message });
    };
    loadingFlag(false);
    return;
  }
  const file = new Blob([res], {
    type: 'application/vnd.ms-excel',
  });
  const fileURL = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = fileURL;
  a.download = intl.get('slod.deliveryWorkbench.model.common.exportFile').d('全部计划单按日期导出');
  a.click();
  loadingFlag(false);
};

/**
 * 取消按钮
 * @object _object
 * */
const handleCancelList = async (_object) => {
  const { dataSet, composite, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  loadingFlag(true);
  const params = conditionList(_object, campKey);
  shareFunction(await handleCancel(params), dataSet, loadingFlag);
  queryTabCountList(
    { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
    composite.menuMarkId
  );
};

/**
 * 打印按钮
 * @object _object
 * */
const handlePrintList = async (_object = {}, flag) => {
  const printFlag = checkPrintWindow();
  const params = conditionList(_object, campKey);
  const data = params?.deliveryLineDTOList?.map((item) => {
    return {
      ...item,
      patchFlag: 1,
    };
  });
  const patchParams = {
    ...params,
    responseType: printFlag ? 'blob' : 'json',
    headers: printFlag ? {} : { 's-print-using-preview': '1' },
    deliveryLineDTOList: flag ? data : params?.deliveryLineDTOList,
  };
  const res = await handlePrint(patchParams);
  if (printFlag) {
    if (res && res.type && res.type.includes('application/json')) {
      const reader = new FileReader();
      reader.readAsText(res, 'utf-8');
      reader.onload = () => {
        const readers = reader.result;
        const parseObj = JSON.parse(readers);
        notification.error({ message: parseObj.message });
      };
    } else if (res) {
      const file = new Blob([res], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const printWindow = window.open(fileURL);
      if (printWindow) printWindow.print();
    }
  }
  if (!printFlag) {
    // if (res && res.type && res.type.includes('application/json')) {
    //   const reader = new FileReader();
    //   reader.readAsText(res, 'utf-8');
    //   reader.onload = () => {
    //     const readers = reader.result;
    //     const parseObj = JSON.parse(readers);
    //     notification.error({ message: parseObj.message });
    //   };
    // } else {
    //   // 添加如下代码
    //   const { fileUrl, bucketName, fileToken } = res;
    //   const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
    //   window.open(url);
    // }
    if (getResponse(res)) {
      // 添加如下代码
      const { fileUrl, bucketName, fileToken } = res;
      const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
      window.open(url);
    }
  }
};

/**
 * 撤销变更按钮
 * @object _object
 * */
const handleCancelChangeList = async (_object = {}) => {
  const { dataSet, composite = {}, loadingFlag = (e) => e, queryTabCountList = (e) => e } = _object;
  // .every((item) => item.statusCode === "CHANGE_PURCHASER_REJECTED")
  const list = dataSet.selected.map((item) => item.toData());
  const tips = (list || [])
    ?.map((i) => {
      return ` ${i?.nodeConfigName} ${i?.displayPlanNum || i?.displayAsnNum}`;
    })
    .join(',');
  Modal.confirm({
    contentStyle: { width: '550px' },
    children: (
      <span>
        {intl.get('slod.deliveryWorkbench.model.view.cancelChangeOk').d('确定要撤销变更')}
        {tips}
        {'?'}
      </span>
    ),
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    okText: intl.get('hzero.common.button.sure').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    onOk: async () => {
      loadingFlag(true);
      const params = conditionList(_object, campKey);
      shareFunction(await handleCancelChangeApi(params), dataSet, loadingFlag);
      queryTabCountList(
        { nodeTemplateCode: composite.summarization, nodeConfigId: composite.menuMarkId },
        composite.menuMarkId
      );
    },
    onCancel: () => {
      loadingFlag(false);
    },
  });
  return false;
};

/**
 * 跳转明细-汇总
 * @object _object :record
 * */
const allDetailEntrance = async (headerId = null, params = {}, props) => {
  const { remote } = props || {};
  if (isNil(headerId)) return false;
  const operationBefore = await (remote
    ? remote.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_BEFORE_OPERATION', false, {
        params,
        headerId,
      })
    : false);
  if (operationBefore) return;
  // eslint-disable-next-line no-param-reassign
  props.tableConfigRef.cache = true;
  // eslint-disable-next-line no-param-reassign
  props.tableConfigRef.page = 'detail';
  const param = filterNullValueObject({
    headerId,
    from: params.tabKey,
    nodeConfigId: params.menuMarkId,
    customizeCode: params.customizeCode,
    nodeTemplateCode: params.summarization,
    change: params.change,
  });
  params.history.push({
    pathname: `/slod/supplier-delivery-workbench/detail/${params.tabKey}`,
    search: stringify(param),
  });
};

// 标签明细弹框
const lebelDetailModal = (lineId = null, _object = {}) => {
  const uniqueProps = {
    lineId,
    modalFlag: true,
    ..._object,
  };
  Modal.open({
    closable: true,
    title: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
    drawer: true,
    resizable: true,
    style: { width: '1090px', padding: 0 },
    children: <UniqueLineList {...uniqueProps} />,
    // footer: false,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

const setShow = () => {};

/**
 * 状态颜色控制
 */
const colorRender = (_value, record, name = '') => {
  // const { data } = record;
  if (isNil(_value)) return;
  const value = record && record?.get(name);
  if (
    [
      'PURCHASER_SUBMITTED',
      'SUPPLIER_SUBMITTED',
      'PURCHASER_PUBLISHED',
      'SUPPLIER_PUBLISHED',
      'PART_PROCESSED',
      'PURCHASER_FEEDBACK',
      'CONFIRMED',
      'SUPPLIER_FEEDBACK',
    ].includes(value)
  ) {
    // 绿色: 采购方已提交、供应商已提交、采购方已发布、供应商已发布、部分处理、采购方已反馈、已确认、供应商已反馈
    return (
      <Tag color="green" style={{ border: 'none' }}>
        <span onClick={() => setShow(record)}>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else if (['NEW', 'WFL_WITHDRAWN', 'CLOSE_APPROVAL'].includes(value)) {
    // 橙色: 新建、工作流已撤回、关闭审批中
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        <span onClick={() => setShow(record)}>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else if (
    [
      'WITHDRAWN',
      'PURCHASER_REJECTED',
      'APPROVAL_REJECTED',
      'SUPPLIER_REJECTED',
      'CHANGE_PURCHASER_REJECTED',
      'CHANGE_SUPPLIER_REJECTED',
    ].includes(value)
  ) {
    // 红色: 已撤回、采购方已拒绝、审批拒绝、供应商已拒绝
    return (
      <Tag color="red" style={{ border: 'none' }}>
        <span onClick={() => setShow(record)}>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else if (['CLOSED', 'DELETED'].includes(value)) {
    //  灰色: 已关闭、已删除
    return (
      <Tag color="gray" style={{ border: 'none' }}>
        <span onClick={() => setShow(record)}>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else {
    return <>-</>;
  }
};

const btnNumber = (arr = [], btnsNum = 5) => {
  const showBtns = [];
  const foldBtns = [];
  arr
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary' : 'default');
      const pushArr = index < btnsNum ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          group: true,
          children: foldBtns,
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
};

const exportRender = (_value = '', record, code = '', docFlow, remote) => {
  const id = {
    LABEL: 'labelLineId',
    PLAN: 'planLineId',
    ASN: 'asnLineId',
    UNIQUE_LABEL: 'labelLineId',
  };
  const headId = {
    LABEL: 'labelHeaderId',
    PLAN: 'planHeaderId',
    ASN: 'asnHeaderId',
    UNIQUE_LABEL: 'labelHeaderId',
  };

  const listProps = {
    record,
    code,
    remote,
    lineId: _value === 'header' ? null : record.get(id[code]),
    headerId: _value === 'header' ? record : record.get(headId[code]),
  };
  Modal.open({
    closable: true,
    title: `${intl.get('slod.deliveryWorkbench.model.common.exportDetailStatus').d('状态明细')}`,
    drawer: true,
    size: 'large',
    style: {
      width: 742,
    },
    okCancel: false,
    children: <ExportStatus {...listProps} />,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

const unitCodeMapList = (summarization, tabKey, hdKey, customizeCode) => {
  const beforeCode = customizeCode?.slice(0, 5);
  const afterCode = customizeCode?.slice(5);
  const code = `${beforeCode}SUPPLIER.${afterCode}`;
  const unitCodeMap = {
    'PLAN-create': `${code}.SEARCH.CREATE,${customizeCode}.CREATE`,
    'PLAN-submit': `${code}.SEARCH.SUBMIT,${customizeCode}.SUBMIT`,
    'PLAN-submit-right': `${code}.SEARCH.SUBMIT_H,${customizeCode}.SUBMIT_H`,
    'PLAN-affirm-left': `${code}.SEARCH.AFFIRM_D,${customizeCode}.AFFIRM_D`,
    'PLAN-affirm-right': `${code}.SEARCH.AFFIRM_H,${customizeCode}.AFFIRM_H`,
    'PLAN-all-left': `${code}.SEARCH.ALL_D,${customizeCode}.ALL_D`,
    'PLAN-all-right': `${code}.SEARCH.ALL_H,${customizeCode}.ALL_H`,
    'PLAN-all-date': `${code}.SEARCH.ALL_R,${customizeCode}.ALL_R`,
    'LABEL-create': `${code}.SEARCH.CREATE,${customizeCode}.CREATE`,
    'LABEL-submit': `${code}.SEARCH.SUBMIT,${customizeCode}.SUBMIT`,
    'LABEL-affirm-left': `${code}.SEARCH.AFFIRM_D,${customizeCode}.AFFIRM_D`,
    'LABEL-affirm-right': `${code}.SEARCH.AFFIRM_H,${customizeCode}.AFFIRM_H`,
    'LABEL-all-left': `${code}.SEARCH.ALL_D,${customizeCode}.ALL_D`,
    'LABEL-all-right': `${code}.SEARCH.ALL_H,${customizeCode}.ALL_H`,
    'ASN-create': `${code}.SEARCH.CREATE,${customizeCode}.CREATE`,
    'ASN-submit': `${code}.SEARCH.SUBMIT,${customizeCode}.SUBMIT`,
    'ASN-affirm-left': `${code}.SEARCH.AFFIRM_D,${customizeCode}.AFFIRM_D`,
    'ASN-affirm-right': `${code}.SEARCH.AFFIRM_H,${customizeCode}.AFFIRM_H`,
    'ASN-all-left': `${code}.SEARCH.ALL_D,${customizeCode}.ALL_D`,
    'ASN-all-right': `${code}.SEARCH.ALL_H,${customizeCode}.ALL_H`,
    'UNIQUE_LABEL-create': `${code}.SEARCH.CREATE,${customizeCode}.CREATE`,
    'UNIQUE_LABEL-submit': `${code}.SEARCH.SUBMIT,${customizeCode}.SUBMIT`,
    'UNIQUE_LABEL-affirm-left': `${code}.SEARCH.AFFIRM_D,${customizeCode}.AFFIRM_D`,
    'UNIQUE_LABEL-affirm-right': `${code}.SEARCH.AFFIRM_H,${customizeCode}.AFFIRM_H`,
    'UNIQUE_LABEL-all-left': `${code}.SEARCH.ALL_D,${customizeCode}.ALL_D`,
    'UNIQUE_LABEL-all-right': `${code}.SEARCH.ALL_H,${customizeCode}.ALL_H`,
    'UNIQUE_LABEL-all-date': `${code}.SEARCH.ALL_R,${customizeCode}.ALL_R`,
  };
  if (tabKey === 'create' || tabKey === 'submit') {
    if (summarization === 'PLAN' && tabKey === 'submit' && hdKey === 'right') {
      return unitCodeMap[`${summarization}-${tabKey}-${hdKey}`];
    } else {
      return unitCodeMap[`${summarization}-${tabKey}`];
    }
  } else {
    return unitCodeMap[`${summarization}-${tabKey}-${hdKey}`];
  }
};

const getCustomize = () => {
  const unitCodeMap = [];
  const nodeTemplateCode = [
    'PLAN_A',
    'PLAN_B',
    'LABEL_A',
    'LABEL_B',
    'ASN_A',
    'UNIQUE_LABEL_A',
    'UNIQUE_LABEL_B',
  ];
  nodeTemplateCode.forEach((item) => {
    unitCodeMap.push(
      `SLOD.DELIVERY__WORKBENCH_${item}.CREATE`,
      `SLOD.DELIVERY__WORKBENCH_${item}.SUBMIT`,
      `SLOD.DELIVERY__WORKBENCH_${item}.AFFIRM_D`,
      `SLOD.DELIVERY__WORKBENCH_${item}.AFFIRM_H`,
      `SLOD.DELIVERY__WORKBENCH_${item}.ALL_D`,
      `SLOD.DELIVERY__WORKBENCH_${item}.ALL_H`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.CREATE`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.SUBMIT`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.AFFIRM_D`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.AFFIRM_H`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.AFFIRM_R`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.ALL_D`,
      `SLOD.SUPPLIER.DELIVERY__WORKBENCH_${item}.SEARCH.ALL_H`,
      `SLOD.DELIVERY__WORKBENCH_${item}.BTNS`,
      `SLOD.DELIVERY__WORKBENCH_${item}.BTN_SUBMIT`,
      `SLOD.DELIVERY__WORKBENCH_${item}.BTN_AFFIRM.LEFT`,
      `SLOD.DELIVERY__WORKBENCH_${item}.BTN_AFFIRM.RIGHT`,
      `SLOD.DELIVERY__WORKBENCH_${item}.BTN_ALL.LEFT`,
      `SLOD.DELIVERY__WORKBENCH_${item}.BTN_ALL.RIGHT`,
      `SLOD.DELIVERY__WORKBENCH_PLAN_A.BTN_ALL.DATE`,
      `SLOD.DELIVERY__WORKBENCH_PLAN_B.BTN_ALL.DATE`,
      `SLOD.DELIVERY__WORKBENCH_PLAN_A.SUBMIT_H`,
      `SLOD.DELIVERY__WORKBENCH_PLAN_B.SUBMIT_H`,
      `SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_A.LIST_UNLBBEL`,
      `SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_B.LIST_UNLBBEL`
    );
  });
  return unitCodeMap;
};

/**
 * searchCode汇总
 * @columns columns
 * @_object object 传入的参数对象
 * */
const searchBarCode = (_object = {}) => {
  const { summarization, tabKey, hdKey, customizeCode } = _object;
  let searchCode;
  switch (summarization) {
    case 'PLAN':
      searchCode = tabCode(tabKey, summarization, hdKey, customizeCode);
      break;
    case 'LABEL':
      searchCode = tabCode(tabKey, summarization, hdKey, customizeCode);
      break;
    case 'ASN':
      searchCode = tabCode(tabKey, summarization, hdKey, customizeCode);
      break;
    case 'UNIQUE_LABEL':
      searchCode = tabCode(tabKey, summarization, hdKey, customizeCode);
      break;
    default:
      searchCode = tabCode(tabKey, summarization, hdKey, customizeCode);
      break;
  }
  return searchCode;
};
/**
 * tabCode
 * @columns columns
 * @_object object 传入的参数对象
 * */
const tabCode = (tabKey, nodeTemplateCode, hdKey, customizeCode) => {
  const beforeCode = customizeCode?.slice(0, 5);
  const afterCode = customizeCode?.slice(5);
  const custCode = `${beforeCode}SUPPLIER.${afterCode}`;
  const code = hdKey === 'left' ? 'D' : hdKey === 'right' ? 'H' : 'R';
  let tabSearchCode;
  switch (tabKey) {
    case 'create':
      tabSearchCode = `${custCode}.SEARCH.CREATE`;
      break;
    case 'submit':
      if (nodeTemplateCode === 'PLAN' && hdKey === 'right') {
        tabSearchCode = `${custCode}.SEARCH.SUBMIT_H`;
      } else {
        tabSearchCode = `${custCode}.SEARCH.SUBMIT`;
      }
      break;
    case 'affirm':
      tabSearchCode = `${custCode}.SEARCH.AFFIRM_${code}`;
      break;
    case 'all':
      tabSearchCode = `${custCode}.SEARCH.ALL_${code}`;
      break;
    default:
      tabSearchCode = `${custCode}.SEARCH.CREATE`;
      break;
  }
  return tabSearchCode;
};

/**
 * 清除勾选缓存
 * @object props
 * */
const deleteCache = (key, props) => {
  const currentDs = props.tableConfigRef?.dataSet[key];
  currentDs?.clearCachedSelected(); // 初始化时清除缓存的勾选记录
  currentDs?.unSelectAll(); // 初始化时清除缓存的勾选记录
};

const tableViewList = (arr) => {
  const tabList = [
    { name: intl.get('slod.deliveryWorkbench.view.title.waitCreate').d('待新建'), key: 'create' },
    { name: intl.get('slod.deliveryWorkbench.view.title.waitSubmit').d('待提交'), key: 'submit' },
    { name: intl.get('slod.deliveryWorkbench.view.title.waitAffirm').d('待确认'), key: 'affirm' },
    { name: intl.get('slod.deliveryWorkbench.view.title.waitAll').d('全部'), key: 'all' },
  ];
  // 临时数组存放
  const tempArray1 = []; // 临时数组1
  tabList.forEach((item) => {
    if (arr.includes(item.key)) {
      tempArray1.push(item);
    }
  });
  return tempArray1;
};

const idMapList = (summarization, tabKey, hdKey) => {
  const code = summarization === 'UNIQUE_LABEL' ? 'label' : summarization?.toLowerCase();
  let id;
  switch (tabKey) {
    case 'create':
      id = `${code}LineId`;
      break;
    case 'submit':
      if (hdKey === 'left') {
        id = `${code}HeaderId`;
      } else {
        id = `${code}LineId`;
      }
      break;
    case 'affirm':
      if (hdKey === 'left') {
        id = `${code}HeaderId`;
      } else {
        id = `${code}LineId`;
      }
      break;
    case 'all':
      if (hdKey === 'left') {
        id = `${code}HeaderId`;
      } else {
        id = `${code}LineId`;
      }
      break;
    default:
      id = `${code}LineId`;
      break;
  }
  return id;
};

// TODO : 这段逻辑非常耗费性能--产品需要
const textRender = (val, record, fieldCode, query) => {
  const _textObject = {};
  const _title = `${fieldCode} 00:00:00`;
  const { dateInfoList = [] } = record.toData();
  dateInfoList.forEach((ele) => {
    if (ele.planDate === _title) {
      _textObject[fieldCode] = ele.confirmQuantity;
    }
  });
  const _a = _textObject[fieldCode];
  if (query?.quantityDimension === '3') {
    return (
      <>
        <span style={{ marginRight: 4 }}>{val}</span>
        {!isNil(_a) && (
          <span style={{ color: math.eq(_a, val) ? 'none' : 'red', marginLeft: '4px' }}>
            {`(${_a})`}
          </span>
        )}
        {isNil(_a) && <span>-</span>}
      </>
    );
  } else {
    return val;
  }
};

// TODO : 这段逻辑非常耗费性能--产品需要
const renderColor = (record, column, fieldCode) => {
  const _textObject = {};
  const _title = `${fieldCode} 00:00:00`;
  const { dateInfoList = [] } = record.toData();
  dateInfoList.forEach((ele) => {
    if (ele.planDate === _title) {
      _textObject[fieldCode] = ele.confirmFlag;
    }
  });
  const _cell = _textObject[fieldCode];
  return {
    style: {
      backgroundColor: _cell === 0 ? '#8db8e2' : 'none',
    },
  };
};
const onDownstreamNodeInfoRender = (data = [], name) => {
  if (data.length === 1) {
    return data
      .map((it) => {
        return { ...it, [name]: `${it[name]}` };
      })
      .map((item) => {
        return <span>{item[name]}</span>;
      });
  } else if (data.length > 1) {
    return data
      .map((it, i) => {
        if (i !== data?.length - 1) {
          return {
            ...it,
            [name]: (
              <>
                <span style={{ color: '#29bedb', cursor: 'pointer' }}>{it[name]}</span>
                <span>/</span>
              </>
            ),
          };
        } else {
          return {
            ...it,
            [name]: <span style={{ color: '#29bedb', cursor: 'pointer' }}>{it[name]}</span>,
          };
        }
      })
      .map((item) => {
        return (
          <Tooltip title={item?.nodeConfigName} theme="light">
            <span>{item[name]}</span>
          </Tooltip>
        );
      });
  } else {
    return <span>0</span>;
  }
};
const handleExecutionRecord = (_object) => {
  const { composite } = _object;
  const modalProps = {
    nodeConfigId: composite.menuMarkId,
    nodeTemplateCode: composite.summarization,
    doubleUnitEnabled: composite.doubleUnitEnabled,
  };
  Modal.open({
    mask: true,
    drawer: true,
    closable: true,
    resizable: true,
    style: { width: '742px', minWidth: '742px', padding: 0 },
    title: intl.get('slod.common.model.receipt.executionRecordDetail').d('异步执行记录明细'),
    children: <ExecutionRecord {...modalProps} />,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okBtn) => okBtn,
  });
};

const detailCustomizeUnitCodes = (nodeTemplateCode, _arrKey = []) => {
  const custCode = [];
  const unitCodeMap = {
    [`${nodeTemplateCode}-header`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
    [`${nodeTemplateCode}-line`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_LIST`,
    [`${nodeTemplateCode}-btn-sub`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_DETAIL_A`,
    [`${nodeTemplateCode}-btn-afi`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_DETAIL_B`,
    [`${nodeTemplateCode}-btn-all-edi`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_DETAIL`,
    [`${nodeTemplateCode}-btn-all-redy`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_DETAIL.EDIT`,
    [`${nodeTemplateCode}-collapse`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.COLLAPSE_SUBMIT`,
    [`${nodeTemplateCode}-unique`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_UNLBBEL`,
    [`${nodeTemplateCode}-batch-btn`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_LINE_DETAIL`,
    [`${nodeTemplateCode}-batch-btn-aff`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_LINE_DETAIL_CONFIRM`,
    // 送货单专属
    [`${nodeTemplateCode}-shipment`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_SHIPMENTS`,
    [`${nodeTemplateCode}-receiving`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_DELIVERY`,
    [`${nodeTemplateCode}-attachment`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ATTACHMENT`,
    [`${nodeTemplateCode}-batch`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BATCH_MAINTAIN`,
    [`${nodeTemplateCode}-batch-btn`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_LINE_DETAIL`,
    [`${nodeTemplateCode}-line-item`]: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ITEM_LIST`,
  };
  _arrKey.forEach((item) => {
    const key = `${nodeTemplateCode}-${item}`;
    const code = unitCodeMap[key];
    custCode.push(code);
  });
  // console.log(custCode?.filter((i) => !!i)?.join(','), "custCode");
  return custCode?.filter((i) => !!i)?.join(',');
};

const detailAttachmentUuidChange = (_object) => {
  const { attachmentDs } = _object;
  const uuid = attachmentDs?.current?.get('uuidNum') || 0;
  const uuidNum = Number(uuid) + 1;
  attachmentDs?.current?.set('uuidNum', uuidNum);
};

// 审批
const handleApprovalList = (_object) => {
  const { taskId, processInstanceId, dataSet } = _object;
  openApproveModal({
    modalProps: {
      closable: true,
    },
    taskId,
    processInstanceId,
    onSuccess: () => {
      dataSet?.query();
    },
  });
};

// 撤销审批
const handleRevokeApprovalList = ({ record, dataSet }) => {
  const businessKey = record?.get('businessKey');
  Modal.confirm({
    contentStyle: { width: '550px' },
    title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
    children: (
      <div>
        <span>
          {intl
            .get('slod.deliveryWorkbench.view.message.revokeApprovalMessage')
            .d('是否确认撤销审批？撤销后您仍可在此提交发起审批（仅工作流审批发起人可执行撤销）')}
        </span>
      </div>
    ),
    okText: intl.get('hzero.common.button.sure').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    onOk: async () => {
      const res = await handleRevokeApprovalChange({ businessKey });
      if (isString(res)) {
        notification.error({
          message: intl.get('hzero.common.status.mistake').d('错误'),
          description: res,
        });
      } else if (res && !res.failed) {
        dataSet?.query();
        notification.success({
          message: intl.get('hzero.common.notification.success').d('操作成功'),
          description: intl
            .get('slod.deliveryWorkbench.view.message.approvalSuccess')
            .d('撤销审批成功'),
        });
      }
    },
  });
};

// 审批进度
const progressView = ({ record, dataSet }) => {
  const simpleApprovalHistoryList = dataSet?.getState('simpleApprovalHistoryList') || {};
  return <ApproveRecordSimple data={simpleApprovalHistoryList[record?.get('businessKey')]} />;
};

export {
  idMapList,
  btnNumber,
  textRender,
  getColumns,
  renderColor,
  deleteCache,
  colorRender,
  progressView,
  getCustomize,
  exportRender,
  tableViewList,
  searchBarCode,
  rightBarTable,
  handleOffList,
  creationButton,
  handlePrintList,
  handleCloseList,
  unitCodeMapList,
  handleDeleteList,
  handleSubmitList,
  handleAffirmList,
  handleRecallList,
  handleCancelList,
  lebelDetailModal,
  handleExportList,
  handleApprovalList,
  handleExecutionRecord,
  handleCancelChangeList,
  detailCustomizeUnitCodes,
  handleRevokeApprovalList,
  onDownstreamNodeInfoRender,
  detailAttachmentUuidChange,
};
