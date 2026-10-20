/* eslint-disable no-shadow */
import React, { Fragment, useEffect, useState, memo, useMemo, useRef } from 'react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { getPostParams } from '@/routes/utils';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DataSet, Modal, Button, Icon, Table } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import { connect } from 'dva';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SRPM } from '_utils/config';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Tabs } from 'choerodon-ui';
import { compose, isEmpty, isFunction } from 'lodash';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  queryCount,
  batchPush, // 批量推送至平衡池
  batchSendBack, // 计划平衡中-退回
  batchMerge, // 计划平衡中-合并
  batchModify, // 计划平衡中-调整
  batchSubmit, // 计划平衡中-提交审批
  // queryBalanceList, // 计划平衡中-提交审批
  batchComplete, // 计划平衡中-合并确认 完成
  batchCancelMerge, // 计划平衡中-取消
  batchBalanceSendBack, // 已平衡待发放-退回
  batchRelease, // 已平衡待发放-计划发放
  // queryBlLineSource, // 行来源提报单列表
  queryPendingMergeList,
  queryBalanceMergeList,
  fetchPermissions,
  vtBalanceSplit,
  vtBalanceSplitSave,
  vtBalanceSplitDelete,
  vtBalanceSplitSubmit,
  rpBalanceSplit,
  rpBalanceSplitSave,
  rpBalanceSplitDelete,
  fetchDoExecute, // 读取业务规则配置
  fetchDefaultContainer,
} from '@/services/rpExecuteProgramService';
import styles from './index.less';

import CommonTable from './components/CommonTable';
import PendingTable from './components/PendingTable';
import Remark from './components/Remark';
import { listDs, pendingDs, balanceDs, vtBalanceSplitDs, blBalanceSplitDs } from './stores';
import {
  getTodoColumns,
  getPendingColumns,
  getSubmittedColumns,
  getSubmittedLineColumns,
  getReadyColumns,
  getReleasedColumns,
  getReleasedingColumns,
  getBalanceListColumns,
  getBlLineSourceColumns,
  getVtBalanceSplitListColumns,
  getBlBalanceSplitListColumns,
} from './defColumn';
// import { cancel } from '@/services/RequisitionPlanServices';

const { TabPane } = Tabs;
const commonPrompt = 'srpm.common.model.common';

const organizationId = getCurrentOrganizationId();

let currenttab;
let vtLineIds;
let submittedStatus = 'header';
const cuxTbDsList = {};

const Index = ({
  dispatch,
  rpExecuteProgram,
  todoTableDs,
  pendingTableDs,
  submittedTableDs,
  readyTableDs,
  releasedTableDs,
  releasedingTableDs,
  submittedLineTableDs,
  customizeTable,
  customizeBtnGroup,
  customizeTabPane,
  history,
  remote,
}) => {
  const [tabsNumber, setTabsNumber] = useState({});
  const [othesTabsNum, setCuxTabCounts] = useState({});
  const [currentTab, setCurrentTab] = useState(rpExecuteProgram.rpCurrentTab);
  const [headerBtnLoading, setHeaderBtnLoading] = useState(false);
  const [containerId, setContainerId] = useState(null);
  const [splitNode, setSplitNode] = useState('NOT_SPLIT');
  const [splitMode, setsplitMode] = useState(null);
  const [releaseFlagCtrl, setReleaseFlag] = useState(null);
  // const [modalBtnLoading, setModalBtnLoading] = useState(false);
  const [submittedTableStatus, setSubmittedTableStatus] = useState(
    rpExecuteProgram.rpCurrentSubmittedTableStatus
  );
  const [permissonFlag, setPermissonFlag] = useState({});
  const remarkRef = useRef({});

  const containerDs = useMemo(
    () =>
      new DataSet({
        dataToJSON: 'all',
        primaryKey: 'containerId',
        fields: [
          {
            name: 'containerLov',
            type: 'object',
            required: true,
            lovCode: 'SRPM.RP_CONTAINER',
            valueField: 'containerId',
            textField: 'containerName',
            label: intl.get(`${commonPrompt}.container`).d('需求计划编码'),
          },
          {
            name: 'containerCode',
            bind: 'containerLov.containerCode',
          },
          {
            name: 'containerId',
            bind: 'containerLov.containerId',
          },
          {
            name: 'containerName',
            bind: 'containerLov.containerName',
          },
        ],
        events: {
          update: ({ name, value }) => {
            if (name === 'containerLov') {
              dispatch({
                type: 'rpExecuteProgram/updateState',
                payload: { containerLov: value },
              });
              setSplitNode(value?.splitNode);
              setsplitMode(value?.splitMode);
              allSetQueryParameter('containerId', value?.containerId ?? '');
              loadList(currenttab, submittedStatus);
            }
          },
        },
      }),
    []
  );

  const handleChangeSubmittedTableStatus = (status) => {
    if (status === submittedStatus) {
      return;
    }
    setSubmittedTableStatus(status);
    submittedStatus = status;
    dispatch({
      type: 'rpExecuteProgram/updateState',
      payload: { rpCurrentSubmittedTableStatus: status },
    });
    loadList(currenttab, status);
  };

  const getContainerId = () => {
    const [params] = containerDs.toJSONData();
    if (!params?.containerId) {
      notification.warning({
        message: `${intl
          .get(`${commonPrompt}.message.confirm.notSelectedContainerCode`)
          .d('请选择需求计划编码后操作！')}`,
      });
      setContainerId(null);
      return null;
    }
    const containerId = params?.containerId ?? '';
    setContainerId(containerId);
    return containerId;
  };

  const loadList = async (currentTab, status, unSelectedFlag) => {
    const tab = currentTab || currenttab;
    const currentSubmittedStatus = status || submittedStatus;
    const containerId = getContainerId();
    queryTabCount(containerId);

    if (!containerId) {
      switch (tab) {
        case 'todo': // 待处理申请单
          todoTableDs.loadData([]);
          break;
        case 'pending': // 计划平衡中
          pendingTableDs.loadData([]);
          break;
        case 'submitted': // 平衡结果审批中
          // if(submittedLineTableDs) {

          // }
          submittedTableDs.loadData([]);
          submittedLineTableDs.loadData([]);
          break;
        case 'ready': // 已平衡待发放
          readyTableDs.loadData([]);
          break;
        case 'releaseding': // 发放中
          releasedingTableDs.loadData([]);
          break;
        case 'released': // 已发放
          releasedTableDs.loadData([]);
          break;
        default:
          // 默认（待提交申请单）
          todoTableDs.loadData([]);
          break;
      }
      // return;
    }

    allSetQueryParameter('containerId', containerId);
    const currentDs = getCurrentDs(tab, currentSubmittedStatus);

    if (containerId && (!currentTab || currentDs.getState('initFlag'))) {
      if (unSelectedFlag) {
        currentDs.unSelectAll();
        currentDs.clearCachedSelected();
      }
      currentDs.query(currentDs.currentPage, {}, true);
    }

    currentDs.setState({
      initFlag: true,
    });
  };

  const queryTabCount = async (containerId) => {
    // 查询二开的tab的数量
    const { getTabDom = [] } = remote?.props?.process || {};
    const otherTab = {};
    if (!containerId) {
      setTabsNumber({
        todoCount: 0,
        pendingCount: 0,
        submittedCount: 0,
        readyCount: 0,
        releasedCount: 0,
        releasedingCount: 0,
      });
      return;
    }
    const params = {
      // ...searchParams,
      onlyCountLimit: 100,
      containerId,
    };
    const res = getResponse(await queryCount(params));
    Promise.all(getTabDom?.map((e) => e?.count({ params }))).then((res) => {
      getTabDom.forEach(({ key, aliasKey }, index) => {
        const counts = res[index] || {};
        otherTab[key] = counts[aliasKey];
        setCuxTabCounts({ ...otherTab });
      });
    });
    if (res && !res.failed) {
      setTabsNumber({
        todoCount: res.todo,
        pendingCount: res.pending,
        submittedCount: res.submitted,
        readyCount: res.ready,
        releasedCount: res.released,
        releasedingCount: res.releaseding,
      });
    } else {
      notification.error({
        message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
      });
    }
  };

  const getCurrentDs = (tab, currentSubmittedStatus) => {
    let currentDs = todoTableDs;
    if (
      !['todo', 'pending', 'submitted', 'ready', 'releaseding', 'released'].includes(tab) &&
      tab
    ) {
      return cuxTbDsList[tab];
    }
    switch (tab) {
      case 'todo': // 待处理申请单
        currentDs = todoTableDs;
        break;
      case 'pending': // 计划平衡中
        currentDs = pendingTableDs;
        break;
      case 'submitted': // 平衡结果审批中
        if (currentSubmittedStatus === 'header') {
          currentDs = submittedTableDs;
        } else {
          currentDs = submittedLineTableDs;
        }
        break;
      case 'ready': // 已平衡待发放
        currentDs = readyTableDs;
        break;
      case 'releaseding': // 发放中
        currentDs = releasedingTableDs;
        break;
      case 'released': // 已发放
        currentDs = releasedTableDs;
        break;
      default:
        // 默认（待提交申请单）
        currentDs = todoTableDs;
        break;
    }
    return currentDs;
  };

  const allSetQueryParameter = (key, value) => {
    todoTableDs.setQueryParameter(key, value);
    pendingTableDs.setQueryParameter(key, value);
    submittedTableDs.setQueryParameter(key, value);
    readyTableDs.setQueryParameter(key, value);
    releasedingTableDs.setQueryParameter(key, value);
    releasedTableDs.setQueryParameter(key, value);
    submittedLineTableDs.setQueryParameter(key, value);
    Object.keys(cuxTbDsList).forEach((objKeys) => {
      // eslint-disable-next-line no-unused-expressions
      cuxTbDsList[objKeys]?.setQueryParameter(key, value);
    });
  };

  // 筛选
  const search = async ({ params = {} }) => {
    // if (mountFlag && !getContainerId()) {
    //   return;
    // }
    const { customizeOrderField = undefined } = params;
    const currentDs = getCurrentDs(currenttab, submittedStatus);
    currentDs.setQueryParameter('advancedData', params);
    currentDs.setQueryParameter('customizeOrderField', customizeOrderField);
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = currentDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    currentDs?.queryDataSet?.current
      ? currentDs?.queryDataSet?.current?.set({
          // ...(params?.customizeOrderField ? clearParams : {}),
          ...clearParams,
          ...params,
        })
      : currentDs?.queryDataSet?.loadData([
          {
            // ...(params?.customizeOrderField ? clearParams : {}),
            ...clearParams,
            ...params,
          },
        ]);
    loadList();
  };

  const getVtLineIds = () => {
    if (vtLineIds.length > 0) {
      return vtLineIds.join(',');
    } else {
      return null;
    }
  };

  let balanceListDsTotalCount = 0;
  const handleBalanceModalBtn = async (
    type = 'submit',
    balanceListDs,
    vtLineIdsArr = [],
    setModalBtnLoading
  ) => {
    balanceListDsTotalCount = balanceListDsTotalCount || balanceListDs.totalCount;
    const { selected } = balanceListDs;
    if (selected.length < 1) {
      notification.error({
        message: intl.get(`${commonPrompt}.modal.unSelectMsg`).d('请选中之后点击'),
      });
      return;
    }
    if (setModalBtnLoading) {
      setModalBtnLoading(true);
      console.log(balanceListDs.getState('modalBtnLoading'));
      balanceListDs.setState('modalBtnLoading', true);
    }
    const selectedVtLineIds = [];
    const childrenRpData = [];
    const selectedData = selected.map((ele) => {
      const data = ele.toData();

      if (ele.children && type !== 'cancel') {
        ele.children.forEach((element) => {
          if (element) {
            childrenRpData.push(element.toData());
          }
        });
      }
      selectedVtLineIds.push(data.vtLineId);
      return data;
    });
    const isSelectedAll = selected.length === balanceListDsTotalCount;
    const validateArray = [];
    if (type !== 'cancel') {
      // eslint-disable-next-line no-param-reassign
      selected.forEach(async (ele) => {
        const errorMsg = ele.getValidationErrors().map((item) => item.errors[0]);
        if (ele.children) {
          ele.children.forEach((element) => {
            if (element) {
              const childrenRpErrorMsg = element
                .getValidationErrors()
                .map((item) => item.errors[0]);
              if (currentTab === 'pending') {
                if (element.get('mergeQuantity') === 0) {
                  if (isEmpty(childrenRpErrorMsg)) {
                    validateArray.push({
                      lineNum:
                        element.get('mergeFlag') || element.get('splitFlag')
                          ? `${element.get('vtNum') ?? '-'}-${element.get('lineNum') ?? '-'}`
                          : `${element.get('rpNum') ?? '-'}-${
                              element.get('rpDisplayLineNum') ?? '-'
                            }`,
                      errors: [
                        {
                          ruleName: 'customError',
                          validationMessage: intl
                            .get(`srpm.common.message.mustExceedZero`)
                            .d('数量必须大于零'),
                        },
                      ],
                    });
                  } else {
                    validateArray.push({
                      lineNum:
                        element.get('mergeFlag') || element.get('splitFlag')
                          ? `${element.get('vtNum') ?? '-'}-${element.get('lineNum') ?? '-'}`
                          : `${element.get('rpNum') ?? '-'}-${
                              element.get('rpDisplayLineNum') ?? '-'
                            }`,
                      errors: childrenRpErrorMsg,
                    });
                  }
                } else if (!isEmpty(childrenRpErrorMsg)) {
                  validateArray.push({
                    lineNum:
                      element.get('mergeFlag') || element.get('splitFlag')
                        ? `${element.get('vtNum') ?? '-'}-${element.get('lineNum') ?? '-'}`
                        : `${element.get('rpNum') ?? '-'}-${
                            element.get('rpDisplayLineNum') ?? '-'
                          }`,
                    errors: childrenRpErrorMsg,
                  });
                }
              }
            }
          });
        }
        if (currentTab === 'pending') {
          if (ele.get('mergeQuantity') === 0) {
            if (isEmpty(errorMsg)) {
              validateArray.push({
                lineNum:
                  ele.get('mergeFlag') || ele.get('splitFlag')
                    ? `${ele.get('vtNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                    : `${ele.get('rpNum') ?? '-'}-${ele.get('rpDisplayLineNum') ?? '-'}`,
                errors: [
                  {
                    ruleName: 'customError',
                    validationMessage: intl
                      .get(`srpm.common.message.mustExceedZero`)
                      .d('数量必须大于零'),
                  },
                ],
              });
            } else {
              validateArray.push({
                lineNum:
                  ele.get('mergeFlag') || ele.get('splitFlag')
                    ? `${ele.get('vtNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                    : `${ele.get('rpNum') ?? '-'}-${ele.get('rpDisplayLineNum') ?? '-'}`,
                errors: errorMsg,
              });
            }
          } else if (!isEmpty(errorMsg)) {
            validateArray.push({
              lineNum:
                ele.get('mergeFlag') || ele.get('splitFlag')
                  ? `${ele.get('vtNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                  : `${ele.get('rpNum') ?? '-'}-${ele.get('rpDisplayLineNum') ?? '-'}`,
              errors: errorMsg,
            });
          }
        }
      });
      if (!isEmpty(validateArray)) {
        const linesErrorMsg = [];
        validateArray.forEach((ele) => {
          const lineErrorMsg = [];
          const requiredFields = [];
          ele.errors.forEach((data) => {
            if (data.ruleName === 'valueMissing') {
              requiredFields.push(`【${data.injectionOptions.label}】`);
            } else {
              lineErrorMsg.push(data.validationMessage);
            }
          });
          if (!isEmpty(requiredFields)) {
            lineErrorMsg.unshift(
              intl
                .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
            );
          }
          linesErrorMsg.push(
            `${intl.get('srpm.common.model.common.line').d('行')}【${
              ele.lineNum
            }】 ${lineErrorMsg.join('')}`
          );
        });

        notification.error({ message: linesErrorMsg.join(';') });
        if (setModalBtnLoading) {
          balanceListDs.setState('modalBtnLoading', true);
        }
        return false;
      }
    }

    let request;
    let params = [...selectedData, ...childrenRpData];

    switch (type) {
      case 'save': // 完成
        request = batchComplete;
        break;
      case 'cancel': // 取消
        request = batchCancelMerge;
        break;
      default:
        // 提交审批
        request = batchSubmit;
        params = { selectedData: params, updateFlag: true };
        break;
    }

    return new Promise((resolve) => {
      request(params).then((res) => {
        if (res && !res.failed) {
          notification.success();
          if (isSelectedAll) {
            Modal.destroyAll();
            pendingTableDs.unSelectAll();
            pendingTableDs.clearCachedSelected();
            loadList();
          } else {
            const newVtLineIds = vtLineIdsArr.filter(
              (vtLineId) => !selectedVtLineIds.includes(vtLineId)
            );
            vtLineIds = newVtLineIds;
            balanceListDs.query().then((res) => {
              if (res && !res.failed) {
                balanceListDs.loadData(res.content);
                balanceListDsTotalCount = res.totalElements;
              }
            });
          }
        } else {
          notification.error({
            message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
          });
        }
        if (setModalBtnLoading) {
          setModalBtnLoading(false);
          balanceListDs.setState('modalBtnLoading', false);
          console.log(balanceListDs.getState('modalBtnLoading'));
        }
        resolve(true);
      });
    });
  };

  const BalanCancelBtn = observer(({ dataSet }) => {
    const modalBtnLoading = dataSet.getState('modalBtnLoading');
    console.log(modalBtnLoading);

    return (
      <Button
        color="primary"
        funcType="raised"
        onClick={() => {
          return new Promise((resolve) => {
            const selectedData = dataSet.map((ele) => {
              const data = ele.toData();
              return data;
            });
            batchCancelMerge(selectedData.filter((item) => item.mergeFlag === 1)).then((res) => {
              if (res && !res.failed) {
                // notification.success();
                // pendingTableDs.unSelectAll();
                // pendingTableDs.clearCachedSelected();
                // loadList();
              } else {
                notification.error({
                  message:
                    res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
                });
              }
              resolve(true);
              pendingTableDs.unSelectAll();
              pendingTableDs.clearCachedSelected();
              loadList();
              Modal.destroyAll();
            });
          });
        }}
        loading={modalBtnLoading || headerBtnLoading}
      >
        {intl.get(`hzero.common.button.cancel`).d('取消')}
      </Button>
    );
  });

  const openBalanceModal = async (data = {}) => {
    const { containerName = '', sourceTotal = '' } = data;
    vtLineIds = data.vtLineIds || [];
    if (vtLineIds.length < 1) {
      notification.error({
        message: intl.get(`${commonPrompt}.noBalanceLineMsg`).d('暂无可合并行，请重新选择！'),
      });
      return;
    }
    const balanceListDs = new DataSet({
      ...balanceDs(getVtLineIds, vtLineIds),
      forceValidate: true,
    });

    Modal.open({
      title: intl.get(`${commonPrompt}.BalancingTreatment`).d('平衡处理'),
      closable: false,
      style: {
        width: '1090px',
      },
      bodyStyle: {
        padding: 0,
      },
      drawer: true,
      children: (
        <div className={styles.balanceModalBody}>
          <div className={styles.info}>
            <Icon type="error" />
            {intl
              .get(`${commonPrompt}.balanceModalInfo`, {
                containerName,
                sourceTotal,
              })
              .d(
                `此次操作根据 ${containerName} 合并规则合并 ${sourceTotal} 条数据。详情如下表所示。`
              )}
          </div>
          <div className={styles.modalTableBox}>
            <PendingTable
              tableDs={balanceListDs}
              columns={getBalanceListColumns()}
              customizeTable={customizeTable}
              unitCode="SRPM.RP_EXECUTE_PLATFORM.BALANCE_MODAL.LIST"
              searchCode="SRPM.RP_EXECUTE_PLATFORM.BALANCE_MODAL.LIST.SEARCH_BAR"
              appendQuery={queryBalanceMergeList}
              searchTextField="multiSelectHeaderNums"
              vtLineIds={vtLineIds}
              modalFlag={1}
              remote={remote}
              handleBalanceModalBtn={handleBalanceModalBtn}
              searchPlaceholder={intl.get('srpm.common.modal.enterPrNum').d('请输入需求计划单号')}
              // lovDs={containerDs}
            />
          </div>
        </div>
      ),
      footer: () => <BalanCancelBtn dataSet={balanceListDs} />,
    });
  };

  const handleBalanceSplitBottomBtn = async (type = 'submit', dataSet, setModalBtnLoading) => {
    if (type === 'return') {
      Modal.destroyAll();
      loadList();
      return;
    }
    const { selected } = dataSet;

    setModalBtnLoading(true);
    dataSet.setState('modalBtnLoading', true);
    const validateArray = [];
    if (type !== 'delete') {
      // eslint-disable-next-line no-param-reassign
      dataSet.current.status = 'update';
      // validateFlag = await dataSet.validate();
      const data = isEmpty(selected) ? dataSet.data : selected;
      data.forEach(async (ele) => {
        const errorMsg = ele.getValidationErrors().map((item) => item.errors[0]);
        if (currentTab === 'pending') {
          if (ele.get('mergeQuantity') === 0) {
            if (isEmpty(errorMsg)) {
              validateArray.push({
                lineNum:
                  ele.get('mergeFlag') || ele.get('splitFlag')
                    ? `${ele.get('vtNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                    : `${ele.get('rpNum') ?? '-'}-${ele.get('rpDisplayLineNum') ?? '-'}`,
                errors: [
                  {
                    ruleName: 'customError',
                    validationMessage: intl
                      .get(`srpm.common.message.mustExceedZero`)
                      .d('数量必须大于零'),
                  },
                ],
              });
            } else {
              validateArray.push({
                lineNum:
                  ele.get('mergeFlag') || ele.get('splitFlag')
                    ? `${ele.get('vtNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                    : `${ele.get('rpNum') ?? '-'}-${ele.get('rpDisplayLineNum') ?? '-'}`,
                errors: errorMsg,
              });
            }
          } else if (!isEmpty(errorMsg)) {
            validateArray.push({
              lineNum:
                ele.get('mergeFlag') || ele.get('splitFlag')
                  ? `${ele.get('vtNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                  : `${ele.get('rpNum') ?? '-'}-${ele.get('rpDisplayLineNum') ?? '-'}`,
              errors: errorMsg,
            });
          }
        }

        if (currentTab === 'ready') {
          if (ele.get('quantity') === 0) {
            if (isEmpty(errorMsg)) {
              validateArray.push({
                lineNum:
                  ele && (ele.get('blNum') || ele.get('lineNum'))
                    ? `${ele.get('blNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                    : null,
                errors: [
                  {
                    ruleName: 'customError',
                    validationMessage: intl
                      .get(`srpm.common.message.mustExceedZero`)
                      .d('数量必须大于零'),
                  },
                ],
              });
            } else {
              validateArray.push({
                lineNum:
                  ele && (ele.get('blNum') || ele.get('lineNum'))
                    ? `${ele.get('blNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                    : null,
                errors: errorMsg,
              });
            }
          } else if (!isEmpty(errorMsg)) {
            validateArray.push({
              lineNum:
                ele && (ele.get('blNum') || ele.get('lineNum'))
                  ? `${ele.get('blNum') ?? '-'}-${ele.get('lineNum') ?? '-'}`
                  : null,
              errors: errorMsg,
            });
          }
        }
      });
      if (!isEmpty(validateArray)) {
        const linesErrorMsg = [];
        validateArray.forEach((ele) => {
          const lineErrorMsg = [];
          const requiredFields = [];
          ele.errors.forEach((data) => {
            if (data.ruleName === 'valueMissing') {
              requiredFields.push(`【${data.injectionOptions.label}】`);
            } else {
              lineErrorMsg.push(data.validationMessage);
            }
          });
          if (!isEmpty(requiredFields)) {
            lineErrorMsg.unshift(
              intl
                .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
            );
          }
          linesErrorMsg.push(
            `${intl.get('srpm.common.model.common.line').d('行')}【${
              ele.lineNum
            }】 ${lineErrorMsg.join('')}`
          );
        });

        notification.error({ message: linesErrorMsg.join(';') });
        setModalBtnLoading(false);
        dataSet.setState('modalBtnLoading', false);
        return false;
      }
    }
    const allData =
      currentTab === 'pending'
        ? dataSet.toData().filter((ele) => ele.submittedFlag !== 1)
        : dataSet.toData().filter((ele) => ele.releasedFlag === 0);

    const selectedData = isEmpty(selected) ? allData : selected.map((ele) => ele.toData());

    let request;
    const params = { selectedData: [...selectedData], ...dataSet?.queryParameter };

    switch (type) {
      case 'save': // 完成
        request = currentTab === 'pending' ? vtBalanceSplitSave : rpBalanceSplitSave;
        break;
      case 'delete': // 删除
        request = currentTab === 'pending' ? vtBalanceSplitDelete : rpBalanceSplitDelete;
        break;
      case 'finish': // 完成
        request = vtBalanceSplitSave;
        break;
      default:
        // 提交审批
        request = vtBalanceSplitSubmit;
        break;
    }
    return new Promise((resolve) => {
      request(params).then((res) => {
        resolve(true);
        if (res && !res.failed) {
          notification.success();
          if (type === 'finish' || (type === 'submit' && allData.length === selected.length)) {
            Modal.destroyAll();
            if (currentTab === 'pending') {
              pendingTableDs.unSelectAll();
              pendingTableDs.clearCachedSelected();
            } else {
              releasedingTableDs.unSelectAll();
              releasedingTableDs.clearCachedSelected();
            }
            loadList();
          } else {
            const {
              containerName,
              totalSplitQuantity,
              beSplitVtLineId,
              beSplitBlLineId,
              containerId,
            } = res;
            dataSet.setQueryParameter('containerId', containerId);
            if (currentTab === 'pending') {
              dataSet.setQueryParameter('vtLineId', beSplitVtLineId);
            } else {
              dataSet.setQueryParameter('blLineId', beSplitBlLineId);
            }
            dataSet.query();
            dataSet.setState({
              containerName,
              totalSplitQuantity,
            });
          }
        } else {
          notification.error({
            message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
          });
        }
        setModalBtnLoading(false);
        dataSet.setState('modalBtnLoading', false);
      });
    });
  };

  const BalanceSplitBottomBtn = observer(({ dataSet }) => {
    const { selected } = dataSet;

    const deleteFlag = selected.every((record) => record.get('splitFlag'));
    const pendingFlag = selected.every((record) => record.get('submittedFlag') !== 1);
    const readyFlag = selected.every((record) => record.get('releasedFlag') === 0);
    const [modalBtnLoading, setModalBtnLoading] = useState(false);

    return (
      <div>
        {currentTab === 'pending' ? (
          <>
            <Button
              color="primary"
              funcType="flat"
              icon="check"
              onClick={() => handleBalanceSplitBottomBtn('submit', dataSet, setModalBtnLoading)}
              loading={modalBtnLoading || headerBtnLoading}
              disabled={selected.length < 1 || !pendingFlag || modalBtnLoading}
            >
              {intl.get(`${commonPrompt}.submitForApproval`).d('提交审批')}
            </Button>
            <Button
              funcType="flat"
              icon="check"
              onClick={() => handleBalanceSplitBottomBtn('finish', dataSet, setModalBtnLoading)}
              disabled={selected.length < 1 || modalBtnLoading}
            >
              {intl.get(`${commonPrompt}.finish`).d('完成')}
            </Button>
            <Button
              funcType="flat"
              icon="delete_sweep"
              onClick={() => handleBalanceSplitBottomBtn('delete', dataSet, setModalBtnLoading)}
              loading={modalBtnLoading}
              disabled={selected.length < 1 || !deleteFlag || !pendingFlag || modalBtnLoading}
            >
              {intl.get(`hzero.common.button.batchDelete`).d('删除')}
            </Button>
            <Button
              funcType="flat"
              icon="save"
              onClick={() => handleBalanceSplitBottomBtn('save', dataSet, setModalBtnLoading)}
              loading={modalBtnLoading}
              disabled={selected.length < 1 || !pendingFlag || modalBtnLoading}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          </>
        ) : (
          <>
            <Button
              color="primary"
              funcType="flat"
              icon="save"
              onClick={() => handleBalanceSplitBottomBtn('save', dataSet, setModalBtnLoading)}
              loading={modalBtnLoading}
              disabled={selected.length < 1 || modalBtnLoading}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
            <Button
              funcType="flat"
              onClick={() => handleBalanceSplitBottomBtn('delete', dataSet, setModalBtnLoading)}
              icon="delete_sweep"
              loading={modalBtnLoading}
              disabled={selected.length < 1 || !deleteFlag || !readyFlag || modalBtnLoading}
            >
              {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
            </Button>
          </>
        )}
      </div>
    );
  });

  const BalanceSplitContent = observer(({ dataSet }) => {
    const containerName = dataSet.getState('containerName');
    const totalSplitQuantity = dataSet.getState('totalSplitQuantity');
    return (
      <div className={styles.balanceModalBody}>
        <div className={styles.info}>
          <Icon type="error" />
          {intl
            .get(`${commonPrompt}.balanceModalSplitInfo`, {
              containerName,
              totalSplitQuantity,
            })
            .d(
              `此次操作根据 ${containerName} 拆分规则拆分 ${totalSplitQuantity} 条数据。详情如下表所示。`
            )}
        </div>
        <div className={styles.modalTableBox}>
          {currentTab === 'pending' ? (
            <PendingTable
              tableDs={dataSet}
              columns={getVtBalanceSplitListColumns(containerId, currentTab)}
              customizeTable={customizeTable}
              unitCode="SRPM.RP_EXECUTE_PLATFORM.SPLIT_LIST"
              searchCode="SRPM.RP_EXECUTE_PLATFORM.SPLIT_LIST_SEARCH"
              appendQuery={queryBalanceMergeList}
              searchTextField="multiSelectHeaderNums"
              BalanceSplitBtn={BalanceSplitBottomBtn}
              modalFlag={2}
              searchPlaceholder={intl.get('srpm.common.modal.enterPrNum').d('请输入需求计划单号')}
              // lovDs={containerDs}
            />
          ) : (
            <CommonTable
              className={styles.splitTable}
              tableDs={dataSet}
              columns={getBlBalanceSplitListColumns(containerId, currentTab)}
              customizeTable={customizeTable}
              code="SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_LIST"
              searchCode="SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_LIST_SEARCH"
              searchTextField="multiSelectHeaderNums"
              BalanceSplitBtn={BalanceSplitBottomBtn}
              searchPlaceholder={intl.get('srpm.common.modal.enterPrNum').d('请输入需求计划单号')}
              // lovDs={containerDs}
              modalFlag={2}
            />
          )}
        </div>
      </div>
    );
  });

  // 平衡处理-拆分弹框
  const openBalanceSplitModal = async (data = {}) => {
    const { containerName = '', totalSplitQuantity = '', beSplitVtLineId, beSplitBlLineId } = data;

    const balanceListDs = new DataSet({
      ...(currentTab === 'pending' ? vtBalanceSplitDs() : blBalanceSplitDs()),
      forceValidate: true,
    });
    balanceListDs.setQueryParameter('containerId', containerId);
    if (currentTab === 'pending') {
      balanceListDs.setQueryParameter('vtLineId', beSplitVtLineId);
    } else {
      balanceListDs.setQueryParameter('blLineId', beSplitBlLineId);
    }

    balanceListDs.query();

    balanceListDs.setState({
      containerName,
      totalSplitQuantity,
    });

    Modal.open({
      title: intl.get(`${commonPrompt}.BalancingTreatment`).d('平衡处理'),
      closable: false,
      style: {
        width: '70%',
      },
      bodyStyle: {
        padding: 0,
      },
      drawer: true,
      children: (
        <BalanceSplitContent
          dataSet={balanceListDs}
          BalanceSplitBottomBtn={BalanceSplitBottomBtn}
        />
      ),
      footer: (okBtn) => okBtn,
      onOk: () => {
        loadList(undefined, undefined, true);
      },
      okText: intl.get(`hzero.common.button.close`).d('关闭'),
    });
  };

  const handleBlLineSourceModal = (record) => {
    const blLineId = record && record?.get('blLineId') ? record?.get('blLineId') : '';
    const tableDs = new DataSet(listDs('blLineSourceModal', blLineId));
    tableDs.query();
    // queryBlLineSource({ blLineId }).then(res => {
    //   if (res && !res.failed) {
    //     tableDs.loadData(res);
    //   } else {
    //     notification.error({
    //       message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
    //     });
    //   }
    // });

    Modal.open({
      title: intl.get(`${commonPrompt}.sourceDocument`).d('来源单据'),
      drawer: true,
      style: {
        width: 742,
      },
      bodyStyle: { padding: 20 },
      children: (
        <div>
          {customizeTable(
            {
              code: 'SRPM.RP_EXECUTE_PLATFORM.DOC_SOURCE_LIST', // 必传，和unitCode一一对应
              dataSet: tableDs,
            },
            <Table
              selectionMode="none"
              dataSet={tableDs}
              columns={getBlLineSourceColumns({ releaseFlagCtrl })}
            />
          )}
        </div>
      ),
      okText: intl.get('srpm.common.model.common.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleJumpPrDetail = (prHeaderId) => {
    window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewDetail';
    history.push({
      pathname: `/sprm/purchase-platform/noerp-detail/${prHeaderId}`,
    });
  };

  // 计划平衡 合并/调整/拆分
  const handleBatchPending = async (type) => {
    setHeaderBtnLoading(true);
    const flag = await pendingTableDs.validate();
    if (!flag) {
      setHeaderBtnLoading(false);
      return;
    }

    const hasZeroFlag = [];
    const { selected } = pendingTableDs;
    const selectedData = selected.map((ele) => ele.toData());

    selected.forEach((record) => {
      if (record.get('mergeQuantity') < 0 || !record.get('mergeQuantity')) {
        hasZeroFlag.push(
          record.get('mergeFlag') ||
            record.get('rpNum') ||
            record.get('vtNum') ||
            record.get('rpDisplayLineNum')
            ? record.get('mergeFlag')
              ? `${record.get('vtNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
              : `${record.get('rpNum') ?? '-'}-${record.get('rpDisplayLineNum') ?? '-'}`
            : null
        );
      }
    });
    if (!isEmpty(hasZeroFlag)) {
      notification.error({
        message: intl
          .get(`${commonPrompt}.hasZeroFlag`, { value: hasZeroFlag.join(',') })
          .d(`${hasZeroFlag.join(',')} 行平衡数量小于0`),
      });
      setHeaderBtnLoading(false);
      return;
    }

    const containerId = getContainerId();
    if (!containerId) {
      setHeaderBtnLoading(false);
      return;
    }

    let request = batchModify;

    switch (type) {
      case 'merge': // 待处理申请单
        request = batchMerge;
        break;
      case 'modify': // 计划平衡中
        request = batchModify;
        break;
      case 'split': // 平衡结果审批中
        request = vtBalanceSplit;
        break;
      default:
        request = batchModify;
        break;
    }
    // const containerId = getContainerId();
    request({ selectedData, containerId }).then((res) => {
      if (res && !res?.failed) {
        if (type !== 'split' && res?.vtLineIds) {
          openBalanceModal(res);
        }
        if (type === 'split' && res?.beSplitVtLineId) {
          openBalanceSplitModal(res);
        }
      } else {
        notification.error({
          message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
        });
      }

      setHeaderBtnLoading(false);
    });
  };

  const pendingReturnFunc = (okCb = () => {}, cancelCb = () => {}, params = []) => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.returnReason`).d('退回原因'),
      children: (
        <Remark
          ref={remarkRef}
          remarkLabel={intl.get(`${commonPrompt}.returnReason`).d('退回原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        const remarkCurrent = remarkRef.current?.saveCurrentData();
        const [{ returnReason, ...other }] = remarkCurrent.toData();
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          okCb(params.map((ele) => ({ ...ele, returnReason, other })));
        } else {
          return false;
        }
      },
      movable: false,
      destroyOnClose: true,
      onCancel: () => {
        cancelCb();
      },
      style: { width: '380px' },
    });
  };

  const openReturnModal = (okCb = () => {}, cancelCb = () => {}, params = []) => {
    const splitLines = [];
    const beSplitLines = [];
    params.forEach((item) => {
      if (item.splitFlag === 1) {
        splitLines.push(
          currentTab === 'pending'
            ? `${item.vtNum ?? '-'}-${item.lineNum ?? '-'}`
            : `${item.blNum ?? '-'}-${item.lineNum ?? '-'}`
        );
      }
      if (item.beSplitFlag === 1) {
        beSplitLines.push(
          currentTab === 'pending'
            ? `${item.vtNum ?? '-'}-${item.lineNum ?? '-'}`
            : `${item.blNum ?? '-'}-${item.lineNum ?? '-'}`
        );
      }
    });
    if (isEmpty(splitLines) && isEmpty(beSplitLines)) {
      return currentTab === 'pending' ? pendingReturnFunc(okCb, cancelCb, params) : okCb(params);
    } else {
      const splitMsg = splitLines.reduce((a, b) => `${a}【${b}】`, '');
      const beSplitMsg = beSplitLines.reduce((a, b) => `${a}【${b}】`, '');
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {`${
              !isEmpty(splitLines)
                ? intl
                    .get(`${commonPrompt}.splitLineTiprMsg`, { splitMsg })
                    .d(`需求计划行${splitMsg}为拆分行，退回将删除该行。`)
                : ''
            }${
              !isEmpty(beSplitLines)
                ? intl
                    .get(`${commonPrompt}.beSplitLineTiprMsg`, { beSplitMsg })
                    .d(`需求计划行${beSplitMsg}已被拆分，退回将删除拆分行。`)
                : ''
            }`}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          return currentTab === 'pending'
            ? pendingReturnFunc(okCb, cancelCb, params)
            : okCb(params);
        }
      });
    }
  };

  const handleJumpDetail = (record, isReady = 0, releasedDetailFlag = 0) => {
    const id = record && record.get('blHeaderId') ? record.get('blHeaderId') : '';
    if (isReady) {
      const currentSelected = record.toData();
      dispatch({
        type: 'rpExecuteProgram/updateState',
        payload: { currentSelected: [currentSelected] },
      });
    }
    history.push({
      pathname: `/srpm/rp-execute-platform/detail/${id}`,
      search: `?isReady=${isReady}&splitNode=${splitNode}&releasedDetailFlag=${releasedDetailFlag}`,
    });
  };

  const handleHeaderBtn = (request, successCb = () => {}, type = '') => {
    setHeaderBtnLoading(true);
    if (!getContainerId()) {
      setHeaderBtnLoading(false);
      return;
    }
    let currentDs = todoTableDs;
    switch (currentTab) {
      case 'pending':
        currentDs = pendingTableDs;
        break;
      case 'ready':
        currentDs = readyTableDs;
        break;
      default:
        currentDs = todoTableDs;
        break;
    }
    const { selected } = currentDs;
    const { handleCuxSubmit } = remote?.props?.process || {};
    if (isFunction(handleCuxSubmit)) {
      const flag = handleCuxSubmit({ currentTab, currentDs, type });
      if (!flag) {
        setHeaderBtnLoading(false);
        return;
      }
    }
    const mergeQuantityField = currentDs.getField('mergeQuantity');
    // 判断rp行平衡数量是否进行了修改
    const changeQuantityArr = [];
    const selectedData = selected.map((record) => {
      if (
        type === 'batchSubmit' &&
        mergeQuantityField.isDirty(record) &&
        !record.get('mergeFlag')
      ) {
        changeQuantityArr.push(
          `${record.get('rpNum') ?? '-'}-${record.get('rpDisplayLineNum') ?? '-'}`
        );
      }
      return record.toData();
    });
    let params = selectedData;
    if (type === 'batchSubmit') {
      params = { selectedData, updateFlag: false };
      const rpNumAndlineNumArr = [];
      const flag = selectedData.some((ele) => {
        if (ele.mergeQuantity === 0) {
          rpNumAndlineNumArr.push(
            ele.mergeFlag || ele.splitFlag
              ? `${ele.vtNum ?? '-'}-${ele.lineNum ?? '-'}`
              : `${ele.rpNum ?? '-'}-${ele.rpDisplayLineNum ?? '-'}`
          );
          return true;
        } else {
          return false;
        }
      });
      if (flag) {
        const rpNumAndlineNums = rpNumAndlineNumArr.reduce((a, b) => `${a}【${b}】`, '');
        notification.error({
          message: intl
            .get(`${commonPrompt}.pendingSubmitErrorMsg`, { rpNumAndlineNums })
            .d(`${rpNumAndlineNums}平衡数量为0，不可以提交审批`),
        });
        setHeaderBtnLoading(false);
        return;
      }
    }

    if (type === 'split') {
      params = { selectedData, containerId };
      if (selectedData[0]?.quantity === 0) {
        const data = selectedData[0];
        const blNumAndlineNum =
          data.blNum || data.lineNum ? `${data.blNum ?? '-'}-${data.lineNum ?? '-'}` : null;
        notification.error({
          message: intl
            .get(`${commonPrompt}.readSplitErrorMsg`, { blNumAndlineNum })
            .d(`需求计划【${blNumAndlineNum}】数量为0，请检查数据`),
        });
        setHeaderBtnLoading(false);
        return;
      }
    }

    const requestFunc = (param) => {
      request(param).then((res) => {
        if (res && !res.failed) {
          notification.success();
          successCb(res);
        } else {
          notification.error({
            message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
          });
        }
        currentDs.unSelectAll();
        currentDs.clearCachedSelected();
        setHeaderBtnLoading(false);
      });
    };

    if (type === 'sendBack') {
      openReturnModal(requestFunc, setHeaderBtnLoading(false), params);
    } else if (!isEmpty(changeQuantityArr)) {
      const docRpNumAndlineNums = changeQuantityArr.reduce((a, b) => `${a}【${b}】`, '');
      Modal.confirm({
        children: (
          <div>
            {intl
              .get(`${commonPrompt}.beforeSubmitAlert`, { value: docRpNumAndlineNums })
              .d(
                `${docRpNumAndlineNums}未平衡，直接修改平衡数量无法生效，如需调整数量请进行“调整”操作。请确认是否继续提交。`
              )}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          requestFunc(params);
        } else {
          setHeaderBtnLoading(false);
        }
      });
    } else {
      requestFunc(params);
    }
  };

  const getQueryFrom = (ds, otherQueryPara, listSetting) => {
    const currentDs = ds || pendingTableDs;
    const { selected } = currentDs;
    const selectedData = selected.map((ele) => ele.toData());
    if (selectedData.length > 0) {
      const { listName = 'vtLineIdList', primaryKey = 'vtLineId' } = listSetting || {};
      const idList = selectedData.map((ele) => ele[primaryKey]);
      return { containerId, [listName]: idList };
    } else {
      const queryData = currentDs.queryParameter;
      const queryTitleDatas = currentDs?.queryDataSet?.toJSONData() || [];
      const { multiSelectHeaderNums, multiSelectHeaderAndLineNums } = queryTitleDatas[0] || {};
      const { advancedData = {}, containerId = '' } = queryData;
      const currentQueryDate = {
        ...advancedData,
        multiSelectHeaderNums,
        multiSelectHeaderAndLineNums,
        containerId,
      };

      return getPostParams({
        ...currentQueryDate,
        ...otherQueryPara,
      });
    }
  };

  const DoneAllBtn = observer(() => {
    const { selected } = pendingTableDs;
    const splitFlag =
      isEmpty(selected) || isEmpty(containerId)
        ? true
        : selected.some((record) =>
            record.get('beSplitFlag')
              ? false
              : record.get('splitFlag') ||
                (splitMode === 'ORIGINAL_LINE_SPLIT' && record.get('mergeFlag')) ||
                (splitMode === 'MERGE_LINE_SPLIT' && !record.get('mergeFlag'))
          );
    const mergeFlag = isEmpty(selected)
      ? true
      : selected.some((record) => record.get('splitFlag') || record.get('beSplitFlag'));
    const headerBtnList = [];

    const docCreateList = [
      {
        name: 'merge',
        btnType: 'c7n-pro',
        hidden: !permissonFlag.mergeBtnFlag,
        child: intl.get(`${commonPrompt}.merge`).d('合并'),
        btnProps: {
          onClick: () => {
            handleBatchPending('merge');
          },
          wait: 300,
          disabled: selected?.length < 2 || mergeFlag || headerBtnLoading,
        },
      },
      {
        name: 'modify',
        btnType: 'c7n-pro',
        hidden: !permissonFlag.modifyBtnFlag,
        child: intl.get(`${commonPrompt}.modify`).d('调整'),
        btnProps: {
          onClick: () => handleBatchPending('modify'),
          wait: 300,
          disabled: selected?.length < 1 || mergeFlag || headerBtnLoading,
        },
      },
      {
        name: 'split',
        btnType: 'c7n-pro',
        hidden: !(splitNode === 'BALANCE_SPLIT' && permissonFlag.splitBtnFlag),
        child: intl.get(`${commonPrompt}.split`).d('拆分'),
        btnProps: {
          onClick: () => handleBatchPending('split'),
          wait: 300,
          disabled: selected?.length !== 1 || splitFlag || headerBtnLoading,
        },
      },
    ];

    if (currentTab === 'todo') {
      headerBtnList.push({
        name: 'pushToPlanBalance',
        btnComp: Button,
        btnProps: {
          icon: 'near_me',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          wait: 300,
          loading: headerBtnLoading,
          disabled: todoTableDs.selected.length < 1 || headerBtnLoading,
          onClick: () =>
            handleHeaderBtn(batchPush, () => {
              loadList();
            }),
          permissionList: [
            {
              code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.push`,
              type: 'button',
              meaning: '推送至计划平衡',
            },
          ],
        },
        child: intl.get(`${commonPrompt}.pushToPlanBalance`).d('推送至计划平衡'),
      });
    } else if (currentTab === 'pending') {
      headerBtnList.push(
        {
          name: 'submitForApproval',
          btnComp: PermissionButton,
          btnProps: {
            icon: 'check',
            type: 'c7n-pro',
            color: 'primary',
            funcType: 'raised',
            wait: 300,
            loading: headerBtnLoading,
            disabled: pendingTableDs.selected.length < 1 || headerBtnLoading,
            onClick: () => {
              handleHeaderBtn(
                batchSubmit,
                () => {
                  loadList();
                },
                'batchSubmit'
              );
            },
            permissionList: [
              {
                code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.vt.submit`,
                type: 'button',
                meaning: '提交审批',
              },
            ],
          },
          child: intl.get(`${commonPrompt}.submitForApproval`).d('提交审批'),
        },
        {
          name: 'dropdownPendding',
          group: true,
          btnType: 'c7n-pro',
          children: docCreateList,
          btnProps: {
            funcType: 'flat',
          },
          child: (text) => (
            <Button icon="amp_stories" style={{ marginLeft: 8 }} type="c7n-pro" funcType="flat">
              {text || intl.get(`${commonPrompt}.pending`).d('计划平衡')}
              <Icon type="expand_more" />
            </Button>
          ),
        },
        {
          name: 'sendback',
          btnComp: PermissionButton,
          btnProps: {
            icon: 'reply',
            type: 'c7n-pro',
            funcType: 'flat',
            wait: 300,
            loading: headerBtnLoading,
            disabled: pendingTableDs.selected.length < 1 || headerBtnLoading,
            onClick: () => {
              handleHeaderBtn(
                batchSendBack,
                () => {
                  loadList();
                },
                'sendBack'
              );
            },
            permissionList: [
              {
                code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.vt.sendback`,
                type: 'button',
                meaning: '退回',
              },
            ],
          },
          child: intl.get(`${commonPrompt}.return`).d('退回'),
        },
        {
          name: 'newExport',
          noNest: true,
          child: (text) => (
            <ExcelExportPro
              data-name="newExport"
              {...{
                templateCode: 'SRPM_REQUEST_PLAN_VT_EXPORT',
                method: 'POST',
                allBody: true,
                buttonText:
                  text ||
                  (pendingTableDs.selected?.length > 0
                    ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                    : intl.get('hzero.common.export.new').d('导出-新')),
                requestUrl: `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/pending-list/export/${containerId}?containerId=${containerId}`,
                queryParams: () => {
                  return getQueryFrom(
                    pendingTableDs,
                    {
                      customizeUnitCode:
                        'SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST.SEARCH_BAR,SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST',
                    },
                    { listName: 'vtLineIdList', primaryKey: 'vtLineId' }
                  );
                },
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  disabled: !containerId,
                },
              }}
            />
          ),
        }
      );
    } else if (currentTab === 'ready') {
      headerBtnList.push(
        {
          name: 'planToIssue',
          btnComp: PermissionButton,
          btnProps: {
            icon: 'near_me',
            type: 'c7n-pro',
            color: 'primary',
            funcType: 'raised',
            wait: 300,
            loading: headerBtnLoading,
            disabled: readyTableDs.selected.length < 1 || headerBtnLoading,
            onClick: () => {
              handleHeaderBtn(batchRelease, (res) => {
                dispatch({
                  type: 'rpExecuteProgram/updateState',
                  payload: { documentList: res },
                });

                history.push({
                  pathname: '/srpm/rp-execute-platform/ready-modal',
                });
              });
            },
            permissionList: [
              {
                code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.bl.release`,
                type: 'button',
                meaning: '计划发放',
              },
            ],
          },
          child: intl.get(`${commonPrompt}.planToIssue`).d('计划发放'),
        },
        {
          name: 'sendback',
          btnComp: PermissionButton,
          btnProps: {
            icon: 'reply',
            type: 'c7n-pro',
            funcType: 'flat',
            wait: 300,
            loading: headerBtnLoading,
            disabled: readyTableDs.selected.length < 1 || headerBtnLoading,
            onClick: () => {
              handleHeaderBtn(
                batchBalanceSendBack,
                () => {
                  loadList();
                },
                'sendBack'
              );
            },
            permissionList: [
              {
                code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.vt.sendback`,
                type: 'button',
                meaning: '退回',
              },
            ],
          },
          child: intl.get(`${commonPrompt}.return`).d('退回'),
        },
        {
          name: 'splitReading',
          btnComp: PermissionButton,
          btnProps: {
            icon: 'amp_stories',
            type: 'c7n-pro',
            funcType: 'flat',
            wait: 300,
            loading: headerBtnLoading,
            disabled:
              readyTableDs.selected.length !== 1 ||
              headerBtnLoading ||
              readyTableDs.selected.some((record) => record.get('splitFlag')),
            onClick: () => {
              handleHeaderBtn(
                rpBalanceSplit,
                (res) => {
                  openBalanceSplitModal(res);
                },
                'split'
              );
            },
          },
          hidden: !(splitNode === 'RELEASE_SPLIT' && permissonFlag.splitBtnFlag),
          child: intl.get(`${commonPrompt}.split`).d('拆分'),
        },
        {
          name: 'newExport',
          noNest: true,
          child: (text) => (
            <ExcelExportPro
              templateCode="SRPM_REQUEST_PLAN_BL"
              buttonText={
                text || readyTableDs.selected.length > 0
                  ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                  : intl.get('hzero.common.export.new').d('导出-新')
              }
              method="POST"
              requestUrl={`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/ready-list/export`}
              queryParams={() =>
                getQueryFrom(readyTableDs, {}, { listName: 'blLineIds', primaryKey: 'blLineId' })
              }
              otherButtonProps={{
                type: 'c7n-pro',
                funcType: 'flat',
                disabled: !containerId,
                permissionList: [
                  {
                    code:
                      'hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.new-pending-export',
                    type: 'button',
                  },
                ],
              }}
            />
          ),
        }
      );
    }
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_BTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerBtnList} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </>
    );
  });

  // 查询权限
  const fetchCurrentRulePermissions = async () => {
    const buttonPermissionList = [
      'hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.vt.merge',
      'hzero.srm.requirement.requisition.plan.rp-execute-platform.button.split',
      'hzero.srm.requirement.requisition.plan.rp-execute-platform.button.vt.adjustment',
    ];
    await fetchPermissions(buttonPermissionList).then((res) => {
      if (res && !res.failed) {
        setPermissonFlag({
          mergeBtnFlag: res.find((ele) => ele.code === buttonPermissionList[0])?.approve || false,
          splitBtnFlag: res.find((ele) => ele.code === buttonPermissionList[1])?.approve || false,
          modifyBtnFlag: res.find((ele) => ele.code === buttonPermissionList[2])?.approve || false,
        });
      }
    });
  };

  const handleJumpReleasedingDetail = (record) => {
    const obj = record.get('prHeaderMap') || {};

    const data = Object.keys(obj).map((ele) => {
      return {
        prHeaderId: ele,
        prNum: obj[ele]?.split('-')[0].replace('[', ''),
      };
    });

    dispatch({
      type: 'rpExecuteProgram/updateState',
      payload: { documentList: data },
    });

    history.push({
      pathname: '/srpm/rp-execute-platform/ready-modal',
    });
  };

  const {
    todoCount = 0,
    pendingCount = 0,
    submittedCount = 0,
    readyCount = 0,
    releasedCount = 0,
    releasedingCount = 0,
  } = tabsNumber;

  useEffect(() => {
    fetchCurrentRulePermissions();
    if (rpExecuteProgram.containerLov && rpExecuteProgram.containerLov?.containerId) {
      containerDs.loadData([rpExecuteProgram.containerLov]);
      setSplitNode(rpExecuteProgram.containerLov?.splitNode);
      setsplitMode(rpExecuteProgram.containerLov?.splitMode);
      setContainerId(rpExecuteProgram.containerLov?.containerId);
      if (currentTab === 'pending') {
        queryTabCount(rpExecuteProgram.containerLov?.containerId);
      }
    } else {
      fetchDefaultContainer().then((res) => {
        if (getResponse(res)) {
          console.log(res);
          if (res?.containerId) {
            containerDs.loadData([res]);
            dispatch({
              type: 'rpExecuteProgram/updateState',
              payload: { containerLov: res },
            });
            setSplitNode(res?.splitNode);
            setsplitMode(res?.splitMode);
            allSetQueryParameter('containerId', res?.containerId ?? '');
            loadList(currenttab, submittedStatus);
          }
        }
      });
    }
    fetchDoExecute([{ fullPathCode: 'SITE.SRPM.BL_RELEASE_EXECUTION_RULE' }]).then((res) => {
      if (res && !res.failed) {
        setReleaseFlag(res[0]);
      } else {
        notification.error({ message: res?.message });
      }
    });
  }, []);

  useEffect(() => {
    const { getTabDom = [] } = remote?.props?.process || {};
    // eslint-disable-next-line no-unused-expressions
    getTabDom?.forEach(({ key, domProps }) => {
      cuxTbDsList[key] = domProps?.cuxTbDs;
    });
  }, []);

  const getCuxTabDom = () => {
    // eslint-disable-next-line no-unused-expressions
    const { getTabDom = [] } = remote?.props?.process || {};
    const getTabDomList = (getTabDom || []).map((e) => {
      const { domProps, key, meaning } = e || {};
      return (
        <TabPane key={key} tab={meaning} count={othesTabsNum[key] || '0'}>
          {domProps && domProps.type === 'pending' && cuxTbDsList[key] && (
            <PendingTable
              tableDs={cuxTbDsList[key]}
              columns={
                splitNode === 'BALANCE_SPLIT' ? getPendingColumns(true) : getPendingColumns()
              }
              customizeTable={customizeTable}
              unitCode="SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST"
              searchCode="SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST.SEARCH_BAR"
              appendQuery={queryPendingMergeList}
              lovDs={containerDs}
              search={search}
              searchTextField="multiSelectHeaderNums"
              searchPlaceholder={intl
                .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                .d('请输入需求计划单号查询')}
            />
          )}
        </TabPane>
      );
    });
    return getTabDomList;
  };

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.programTitle`).d('需求计划执行工作台')}>
        <DoneAllBtn dataSet={todoTableDs} />
      </Header>
      <Content className={styles.main}>
        {customizeTabPane(
          {
            code: 'SRPM.RP_EXECUTE_PLATFORM.TABS',
          },
          <Tabs
            className={styles.tabs}
            defaultActiveKey={currentTab}
            onChange={(value) => {
              setCurrentTab(value);
              currenttab = value;
              dispatch({
                type: 'rpExecuteProgram/updateState',
                payload: { rpCurrentTab: value },
              });
              loadList(value);
            }}
          >
            <TabPane
              tab={
                <>
                  {intl.get(`${commonPrompt}.todoTitle`).d('待处理提报单')}
                  <span>&nbsp;{` ${todoCount > 99 ? '99+' : todoCount}`}</span>
                </>
              }
              key="todo"
            >
              <CommonTable
                tableDs={todoTableDs}
                columns={getTodoColumns()}
                customizeTable={customizeTable}
                code="SRPM.RP_EXECUTE_PLATFORM.TODO.LIST"
                searchCode="SRPM.RP_EXECUTE_PLATFORM.TODO.LIST.SEARCH_BAR"
                lovDs={containerDs}
                search={search}
                searchTextField="multiSelectHeaderAndLineNums"
                searchPlaceholder={intl
                  .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                  .d('请输入需求计划单号查询')}
              />
            </TabPane>
            <TabPane
              tab={
                <>
                  {intl.get(`${commonPrompt}.pendingTitle`).d('计划平衡中')}
                  <span>&nbsp;{` ${pendingCount > 99 ? '99+' : pendingCount}`}</span>
                </>
              }
              key="pending"
            >
              <PendingTable
                tableDs={pendingTableDs}
                columns={
                  splitNode === 'BALANCE_SPLIT' ? getPendingColumns(true) : getPendingColumns()
                }
                customizeTable={customizeTable}
                unitCode="SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST"
                searchCode="SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST.SEARCH_BAR"
                appendQuery={queryPendingMergeList}
                lovDs={containerDs}
                search={search}
                searchTextField="multiSelectHeaderNums"
                searchPlaceholder={intl
                  .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                  .d('请输入需求计划单号查询')}
              />
            </TabPane>
            <TabPane
              tab={
                <>
                  {intl.get(`${commonPrompt}.submittedTitle`).d('计划审批中')}
                  <span>&nbsp;{` ${submittedCount > 99 ? '99+' : submittedCount}`}</span>
                </>
              }
              key="submitted"
            >
              {submittedTableStatus === 'header' && (
                <CommonTable
                  tableDs={submittedTableDs}
                  columns={getSubmittedColumns(handleJumpDetail)}
                  customizeTable={customizeTable}
                  code="SRPM.RP_EXECUTE_PLATFORM.SUBMITTED.LIST"
                  searchCode="SRPM.RP_EXECUTE_PLATFORM.SUBMITTED.LIST.SEARCH_BAR"
                  selectionMode="none"
                  lovDs={containerDs}
                  search={search}
                  searchTextField="multiSelectHeaderNums"
                  searchPlaceholder={intl
                    .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                    .d('请输入需求计划单号查询')}
                  showRightConfig
                  submittedTableStatus={submittedTableStatus}
                  handleChangeSubmittedTableStatus={handleChangeSubmittedTableStatus}
                />
              )}
              {submittedTableStatus === 'line' && (
                <CommonTable
                  tableDs={submittedLineTableDs}
                  columns={getSubmittedLineColumns(handleJumpDetail, handleBlLineSourceModal)}
                  customizeTable={customizeTable}
                  code="SRPM.RP_EXECUTE_PLATFORM.SUBMITTED_LINE.LIST"
                  searchCode="SRPM.RP_EXECUTE_PLATFORM.SUBMITTED_LINE.LIST.SEARCH_BAR"
                  selectionMode="none"
                  lovDs={containerDs}
                  search={search}
                  searchTextField="multiSelectHeaderAndLineNums"
                  searchPlaceholder={intl
                    .get('srpm.common.modal.enterPrNumAndLineNumSearch')
                    .d('请输入需求计划单号-行号查询')}
                  showRightConfig
                  submittedTableStatus={submittedTableStatus}
                  handleChangeSubmittedTableStatus={handleChangeSubmittedTableStatus}
                />
              )}
            </TabPane>
            <TabPane
              tab={
                <>
                  {intl.get(`${commonPrompt}.readyTitle`).d('计划待发放')}
                  <span>&nbsp;{` ${readyCount > 99 ? '99+' : readyCount}`}</span>
                </>
              }
              key="ready"
            >
              <CommonTable
                tableDs={readyTableDs}
                columns={getReadyColumns(handleJumpDetail, handleBlLineSourceModal)}
                customizeTable={customizeTable}
                code="SRPM.RP_EXECUTE_PLATFORM.READY.LIST"
                searchCode="SRPM.RP_EXECUTE_PLATFORM.READY.LIST.SEARCH_BAR"
                lovDs={containerDs}
                search={search}
                searchTextField="multiSelectHeaderAndLineNums"
                searchPlaceholder={intl
                  .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                  .d('请输入需求计划单号查询')}
              />
            </TabPane>
            <TabPane
              tab={
                <>
                  {intl.get(`${commonPrompt}.releaseding`).d('计划发放中')}
                  <span>&nbsp;{` ${releasedingCount > 99 ? '99+' : releasedingCount}`}</span>
                </>
              }
              key="releaseding"
            >
              <CommonTable
                tableDs={releasedingTableDs}
                columns={getReleasedingColumns(handleJumpReleasedingDetail)}
                customizeTable={customizeTable}
                code="SRPM.RP_EXECUTE_PLATFORM.RELEASEDING_LIST"
                searchCode="SRPM.RP_EXECUTE_PLATFORM.RELEASEDING_LIST_SEARCH_BAR"
                lovDs={containerDs}
                search={search}
                selectionMode="none"
                searchTextField="multiSelectHeaderAndLineNums"
                searchPlaceholder={intl
                  .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                  .d('请输入需求计划单号查询')}
              />
            </TabPane>
            <TabPane
              tab={
                <>
                  {intl.get(`${commonPrompt}.releasedTitle`).d('计划已发放')}
                  <span>&nbsp;{` ${releasedCount > 99 ? '99+' : releasedCount}`}</span>
                </>
              }
              key="released"
            >
              <CommonTable
                tableDs={releasedTableDs}
                columns={getReleasedColumns(handleBlLineSourceModal, handleJumpPrDetail)}
                customizeTable={customizeTable}
                code="SRPM.RP_EXECUTE_PLATFORM.RELEASED.LIST"
                searchCode="SRPM.RP_EXECUTE_PLATFORM.RELEASED.LIST.SEARCH_BAR"
                selectionMode="none"
                lovDs={containerDs}
                search={search}
                searchTextField="multiSelectHeaderAndLineNums"
                searchPlaceholder={intl
                  .get('srpm.common.modal.enterPrNumOrLineNumSearch')
                  .d('请输入需求计划单号查询')}
              />
            </TabPane>

            {getCuxTabDom()}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ rpExecuteProgram }) => ({
    rpExecuteProgram,
  })),
  formatterCollections({
    code: [
      'srpm.common',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'hzero.common',
      'sprm.common',
    ],
  }),
  cuxRemote(
    {
      code: 'SRPM_EXECUTE_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleCuxSubmit: undefined,
        getTabDom: [],
      },
    }
  ),
  withCustomize({
    unitCode: [
      'SRPM.RP_EXECUTE_PLATFORM.BALANCE_MODAL.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.BALANCE_MODAL.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.TODO.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.SUBMITTED.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.SUBMITTED_LINE.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.READY.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.RELEASED.LIST',
      'SRPM.RP_EXECUTE_PLATFORM.FILTER_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.SPLIT_LIST',
      'SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_LIST',
      'SRPM.RP_EXECUTE_PLATFORM.DOC_SOURCE_LIST',
      'SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_BTNS',
      'SRPM.RP_EXECUTE_PLATFORM.TABS',
      'SRPM.RP_EXECUTE_PLATFORM.SPLIT_LIST_SEARCH',
      'SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_LIST_SEARCH',
      'SRPM.RP_EXECUTE_PLATFORM.TODO.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.SUBMITTED.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.SUBMITTED_LINE.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.READY.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.RELEASED.LIST.SEARCH_BAR',
      'SRPM.RP_EXECUTE_PLATFORM.RELEASEDING_LIST',
      'SRPM.RP_EXECUTE_PLATFORM.RELEASEDING_LIST_SEARCH_BAR',
    ],
  }),
  withProps(
    () => {
      const todoTableDs = new DataSet(listDs('todo'));
      const pendingTableDs = new DataSet(pendingDs({}));
      const submittedTableDs = new DataSet(listDs('submitted'));
      const submittedLineTableDs = new DataSet(listDs('submittedLine'));
      const readyTableDs = new DataSet(listDs('ready'));
      const releasedingTableDs = new DataSet(listDs('releaseding'));
      const releasedTableDs = new DataSet(listDs('released'));
      return {
        todoTableDs,
        pendingTableDs,
        submittedTableDs,
        readyTableDs,
        releasedTableDs,
        releasedingTableDs,
        submittedLineTableDs,
      };
    },
    { cacheState: true }
  )
)(memo(Index));
