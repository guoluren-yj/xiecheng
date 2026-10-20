/* eslint-disable no-param-reassign */
/**
 * index.js 收货执行
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, Button, Table, TextArea } from 'choerodon-ui/pro';
import { Tabs, Steps, Tree, Spin, Input } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty, isNil, cloneDeep } from 'lodash';
import uuid from 'uuid/v4';

import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import moment from 'moment';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import {
  handleExecute,
  fetchTreeList,
  fetchProcessList,
  queryExecLov,
} from '@/services/receiptExecutionService';
import { exTableDS, peTableDS, deTableDS, allTableDS } from './store/lineDS';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import styles from './index.less';
import { showBigNumber } from '../components/utils';

window.moment = moment;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Search } = Input;

const organizationId = getCurrentOrganizationId();

function getUnitCode() {
  const code = [];
  for (let i = 0; i < 10; i++) {
    const index = String.fromCharCode(65 + i);
    code.push(
      `SINV.RECEIPT_EXECUTE_WAITING.${index}`,
      `SINV.RECEIPT_EXECUTE_DOING.${index}`,
      `SINV.RECEIPT_EXECUTE_FINISHED.${index}`,
      `SINV.RECEIPT_EXECUTE_ALL_FINISHED.${index}`,
      `SINV.RECEIPT_EXECUTE_WAITING.${index}_FILTER`,
      `SINV.RECEIPT_EXECUTE_DOING.${index}_FILTER`,
      `SINV.RECEIPT_EXECUTE_FINISHED.${index}_FILTER`,
      `SINV.RECEIPT_EXECUTE_ALL_FINISHED.${index}_FILTER`
    );
  }
  return code;
}
@WithCustomize({
  unitCode: getUnitCode(),
})
@formatterCollections({
  code: [
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.purchaserDelivery',
    'entity.company',
    'sinv.receiptExecution',
  ],
})
export default class ReceiptExecution extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      execLoading: false,
      execAllLoading: false,
      processLoading: false,
      listStatus: 'WAITING',
      activeKey: 'detail',
      display: false,
      editFlag: false,
      queryFlag: true,
      treeList: [],
      processList: {},
      unitCode: '',
      allDataset: {},
      inDataset: {},
    };
  }

  componentDidMount() {
    // this.fetchTreeList();
    this.fetchTreeList({ receiptExecuteQueryType: 'node_count' }, true);
  }

  /*
   * 待执行
   */
  exTableDs = new DataSet(exTableDS());

  /*
   * 执行中
   */
  peTableDs = new DataSet(peTableDS());

  /*
   * 已完成明细列表
   */
  deTableDs = new DataSet(deTableDS(this.handleEditChange));

  /*
   * 已完成整单列表
   */
  allTableDs = new DataSet(allTableDS());

  /**
   * 节点树查询
   */
  @Bind()
  async fetchTreeList(param = {}, Flag) {
    this.setState({ loading: true });
    const res = getResponse(await fetchTreeList(param));
    if (Array.isArray(res) && res.length > 0) {
      const data = res.map((i) => {
        if (i.children) {
          const children = i.children.map((item) => ({
            ...item,
            ...param,
            title: `${item.actionName}(${item.actionCount > 99 ? '99+' : item.actionCount || 0})`,
            parentId: item.nodeConfigId,
          }));
          return {
            ...i,
            parentId: null,
            pkId: i.nodeConfigId,
            children,
          };
        }
        return { ...i, parentId: null, pkId: i.nodeConfigId };
      });
      const params = (data[0] && data[0].children && data[0].children[0]) || {};
      if (Flag) {
        const ajaxWait = this.fetchTreeList({ receiptExecuteQueryType: 'waiting_count' });
        const ajaxDoing = this.fetchTreeList({ receiptExecuteQueryType: 'doing_count' });
        const ajaxFinish = this.fetchTreeList({ receiptExecuteQueryType: 'finished_count' });

        Promise.all([ajaxWait, ajaxDoing, ajaxFinish]).then((resp) => {
          if (Array.isArray(resp) && resp.length) {
            const mergeAB = this.changeArr(this.state.treeList, resp[0], 0);
            const mergeBC = this.changeArr(mergeAB, resp[1] || [], 1);
            const mergeCD = this.changeArr(mergeBC, resp[2] || [], 2);
            const p =
              (data[0] &&
                mergeCD?.length &&
                mergeCD[0]?.children?.length &&
                mergeCD[0]?.children[0]) ||
              {};
            this.setState({
              loading: false,
              treeList: mergeCD,
              selectedKeys: [p.pkId && p.pkId.toString()],
            });
          }
        });
        this.setState({
          loading: false,
          treeList: data,
          selectedKeys: [params.pkId && params.pkId.toString()],
        });
        this.handleFetch(params);
        return false;
      }
      this.setState({
        loading: false,
        treeList: data,
        selectedKeys: [params.pkId && params.pkId.toString()],
      });
      if (param.receiptExecuteQueryType === 'node_count' || param.allSource) {
        this.handleFetch(params);
      }
      return data;
    }
  }

  changeArr = (A, B, index) => {
    if (Array.isArray(A) && Array.isArray(B) && A.length && B.length) {
      A.forEach((x) => {
        B.forEach((y) => {
          if (x.nodeConfigId === y.nodeConfigId) {
            x.children[index] = cloneDeep(y.children[index]);
          }
        });
      });
      return A || [];
    }
  };

  /**
   * 列表查询处理
   * @param {*} params
   */
  @Bind()
  handleFetch(params = {}) {
    const {
      actionCode,
      authorityCode, // 可操作权限
      nodeConfigId,
      nodeConfigIndexAbc,
      allSource,
      reverseEnable, // 可冲销标识
    } = params;
    this.setState(
      {
        execParams: { nodeConfigId },
        listStatus: actionCode,
        display:
          authorityCode &&
          authorityCode.includes('UPDATE') &&
          (actionCode === 'FINISHED' ? !!reverseEnable : true),
        unitCode: `${actionCode}.${nodeConfigIndexAbc}`,
        nodeConfigIndexAbc,
        inDataset: params,
        allSource,
        queryFlag: true,
      },
      () => {
        const currentDs = this.getCurrentDs(actionCode);
        currentDs.setQueryParameter('params', {
          nodeConfigId,
          allSource,
          customizeUnitCode: `SINV.RECEIPT_EXECUTE_${actionCode}.${nodeConfigIndexAbc},SINV.RECEIPT_EXECUTE_${actionCode}.${nodeConfigIndexAbc}_FILTER`,
        });
        currentDs.query();
        // currentDs.query().then((res) => {
        //   if (res && res.content && !isEmpty(res.content)) {
        //     const { rcvTrxHeaderId, rcvTrxLineId } = res.content[0];
        //     this.fetchProcessList({ rcvTrxHeaderId, rcvTrxLineId });
        //   } else {
        //     this.setState({ processList: {} });
        //   }
        // });
      }
    );
  }

  /**
   * 进度条查询
   */
  @Bind()
  async fetchProcessList(params) {
    this.setState({ processLoading: true });
    const res = getResponse(await fetchProcessList(params, this.state.listStatus));
    this.setState({ processList: res || {}, processLoading: false });
  }

  @Bind()
  onSelect(selectedKeys, e) {
    const dataRef = e.node.props.dataRef || {};
    if (!isEmpty(selectedKeys)) {
      this.setState({ selectedKeys, activeKey: 'detail' });
      this.handleFetch(dataRef);
    }
  }

  @Bind()
  handleFetchAll(name) {
    const { listStatus, nodeConfigId, nodeConfigIndexAbc } = this.state;
    if (isNil(name) || name.length === 0) {
      const currentDs = this.getCurrentDs(listStatus);
      currentDs.setQueryParameter('params', {
        nodeConfigId,
        allSource: null,
        customizeUnitCode: `SINV.RECEIPT_EXECUTE_${listStatus}.${nodeConfigIndexAbc},SINV.RECEIPT_EXECUTE_${listStatus}.${nodeConfigIndexAbc}_FILTER`,
      });
    }
    this.fetchTreeList({ allSource: name });
  }

  /**
   * 渲染进度条
   */
  @Bind()
  renderStep(list = []) {
    const { processList } = this.state;
    const data = list.map((i) => ({ ...i, id: uuid() }));
    const current = data.findIndex((i) => i.lineSeq === processList.lineSeq);
    let step = null;
    step = (
      <div className={list.length > 0 ? 'steps' : ''}>
        <Steps current={current} size="default">
          {data.map((s) => {
            const { id = null, nodeConfigName = null } = s;
            return <Step key={id} title={nodeConfigName} />;
          })}
        </Steps>
      </div>
    );
    return step;
  }

  @Bind()
  getCurrentDs(listStatus, activeKey = 'detail') {
    const { allDataset = {}, inDataset = {} } = this.state;
    const currentDsName = `${
      listStatus === 'FINISHED' ? `${listStatus}${activeKey}` : `${listStatus}`
    }${inDataset.pkId}`;
    if (allDataset[currentDsName]) {
      return allDataset[currentDsName];
    }
    let currentDs;
    switch (listStatus) {
      case 'WAITING':
        currentDs = new DataSet(exTableDS());
        break;
      case 'DOING':
        currentDs = new DataSet(peTableDS());
        break;
      case 'FINISHED':
        if (activeKey === 'detail') {
          currentDs = new DataSet(deTableDS(this.handleEditChange));
        } else {
          currentDs = new DataSet(allTableDS());
        }
        break;
      default:
        currentDs = new DataSet(exTableDS());
        break;
    }
    this.setState({
      allDataset: { ...allDataset, [currentDsName]: currentDs },
    });
    return currentDs;
  }

  @Bind()
  async handleSave(dataSet) {
    const flag = await dataSet.validate();
    if (flag) {
      const res = await dataSet.submit();
      if (res && !res.failed) {
        dataSet.query(dataSet.currentPage);
      }
    }
  }

  @Bind()
  async batchSetExec(lovRecord = {}, allFlag = false) {
    const { listStatus, unitCode, nodeConfigIndexAbc } = this.state;
    this.setState({
      [!allFlag ? 'execLoading' : 'execAllLoading']: true,
    });
    const currentDs = this.getCurrentDs(listStatus);
    const selectedRecords = currentDs.selected;
    const lines = selectedRecords.map((i) => i.toData());
    let rev = {};
    if (listStatus === 'WAITING') {
      const { rcvTypeCode, rcvTrxTypeId } = lovRecord;
      rev = !allFlag
        ? { rcvTypeCode, rcvTrxTypeId }
        : {
            rcvTypeCode,
            rcvTrxTypeId,
            ...currentDs.queryParameter.params,
            ...currentDs.queryDataSet?.toData()[0],
          };
    } else if (listStatus === 'FINISHED') {
      const { nodeConfigId, rcvTrxTypeId } = lovRecord;
      rev = { nodeConfigId, rcvTrxTypeId };
    }
    const customizeUnitCode = `SINV.RECEIPT_EXECUTE_${unitCode},SINV.RECEIPT_EXECUTE_${unitCode}_FILTER`;
    const res = getResponse(
      await handleExecute({ lines, listStatus, ...rev, customizeUnitCode, allFlag })
    );
    this.setState({
      [!allFlag ? 'execLoading' : 'execAllLoading']: false,
    });
    if (res) {
      if (listStatus === 'WAITING' || listStatus === 'FINISHED') {
        if (res.sendCode === 'ASYN_DO_SINV_EXCUTE') {
          notification.info({
            message: `${intl
              .get(`sinv.receiptExecution.model.receipt.selectedRecordsTip`)
              .d('当前执行数量超过')}[${res?.sendSize}]${intl
              .get(`sinv.receiptExecution.view.message.showSelectedRecordsTip`)
              .d('条，程序转为后台执行，执行结果可前往消息中心进行查看.')}`,
          });
          currentDs.query();
          return false;
        }
        this.props.history.push({
          pathname: `/sinv/receipt-execution/${
            listStatus === 'WAITING' ? 'detail' : 'return-detail'
          }/${res.rcvTrxHeaderId}`,
          search: `type=DOING&execFlag=EXEC&nodeIndex=${nodeConfigIndexAbc}`,
        });
      } else {
        notification.success();
        currentDs.query();
      }
    }
  }

  @Bind()
  batchSetExecAll(lovRecord = {}) {
    this.batchSetExec(lovRecord, true);
  }

  /**
   * 执行
   */
  @Bind()
  async handleBatchExec(allFlag = false) {
    const { listStatus, execParams } = this.state;
    const currentDs = this.getCurrentDs(listStatus);
    const selectedRecords = currentDs.selected;
    const selectedList = selectedRecords.filter((item) => item.toData().updateQuantity === 0);
    const permissionRecords = allFlag ? currentDs.data : selectedRecords;
    const selectedNoPermitList = permissionRecords.filter(
      (item) => item.toData().updatePermissionFlag === 0
    );
    const warning = (
      <ul>
        {selectedList.map((item) => {
          return (
            <li>
              {`${intl.get(`sinv.receiptExecution.model.receipt.trxNum`).d('单据编号')}：${
                item?.toData().trxNum
              }${intl
                .get(`sinv.receiptExecution.view.message.trxUpdateQuantity`)
                .d('可退回数量为0，不可执行！')}`}
            </li>
          );
        })}
      </ul>
    );
    const permitWarning = (
      <div>
        <p>
          {intl
            .get(`sinv.receiptExecution.view.message.trxNotAuthorized`)
            .d('当前角色无以下单据的操作权限：')}
        </p>
        <ul>
          {selectedNoPermitList.map((item) => {
            return (
              <li>
                {`${intl.get(`sinv.receiptExecution.model.receipt.trxNum`).d('单据编号')}：${
                  item.toData().trxNum
                } | ${item.toData().trxLineNum}`}
              </li>
            );
          })}
        </ul>
      </div>
    );
    if (selectedList.length !== 0) {
      notification.warning({
        description: warning,
      });
    } else if (selectedNoPermitList.length !== 0) {
      notification.warning({
        description: permitWarning,
      });
    } else {
      const flag = await Promise.all(
        selectedRecords.map((i) => {
          return i.validate(true);
        })
      );
      if (!flag.includes(false)) {
        if (listStatus === 'DOING') {
          this.batchSetExec();
        } else {
          const params = filterNullValueObject({
            listStatus,
            ...execParams,
            tenantId: organizationId,
            lovCode: listStatus === 'WAITING' ? 'SPUC.SINV_MOVE_TYPE' : '',
            strategyLineIds:
              listStatus === 'WAITING'
                ? ''
                : selectedRecords.map((i) => i.get('strategyLineId')).join(','),
          });
          this.setState({
            [!allFlag ? 'execLoading' : 'execAllLoading']: true,
          });
          const res = getResponse(await queryExecLov(params));
          this.setState({
            [!allFlag ? 'execLoading' : 'execAllLoading']: false,
          });
          if (res && !res.failed) {
            if (isEmpty(res.content)) {
              notification.error({
                message: intl
                  .get('sinv.receiptExecution.model.receipt.not.transactionType')
                  .d('找不到对应的事务类型'),
              });
            } else if (res.totalElements === 1) {
              this.batchSetExec(res.content[0], allFlag);
            } else if (!allFlag) this.catalog.onSearchBtnClick();
            else this.catalogAll.onSearchBtnClick();
          }
        }
      } else {
        notification.error({
          message: intl
            .get('sinv.receiptExecution.model.receipt.check')
            .d('数据检验未通过，请检查'),
        });
      }
    }
  }

  @Bind()
  handleToDetail(record, type) {
    const { rcvTrxHeaderId, returnedFlag, updatePermissionFlag } = record.toData() || {};
    const { nodeConfigIndexAbc, display } = this.state;
    const execFlag = display ? 'EXEC' : 'NOTEXEC';
    const permissionFlag = updatePermissionFlag === 0 ? 'disabled' : 'edit';
    this.props.history.push({
      pathname: `/sinv/receipt-execution/${
        returnedFlag === 1 ? 'return-detail' : 'detail'
      }/${rcvTrxHeaderId}`,
      search: `type=${type}&execFlag=${execFlag}&nodeIndex=${nodeConfigIndexAbc}&permissionFlag=${permissionFlag}`,
    });
  }

  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
    const {
      listStatus,
      allSource,
      queryFlag,
      unitCode,
      execParams: { nodeConfigId },
    } = this.state;
    if (activeKey === 'list' && queryFlag) {
      const currentDs = this.getCurrentDs(listStatus, activeKey);
      currentDs.setQueryParameter('params', {
        nodeConfigId,
        allSource,
        customizeUnitCode: `SINV.RECEIPT_EXECUTE_ALL_${unitCode},SINV.RECEIPT_EXECUTE_ALL_${unitCode}_FILTER`,
      });
      currentDs.query().then((res) => {
        if (res && !res.failed) this.setState({ queryFlag: false });
      });
    }
  }

  @Bind()
  handleEditChange() {
    this.setState({ editFlag: false });
  }

  @Bind()
  handleEdit() {
    const currentDs = this.getCurrentDs(this.state.listStatus);
    this.setState(
      {
        editFlag: !this.state.editFlag,
      },
      () => {
        currentDs
          // .filter(i => i.updatePermissionFlag === 1)
          .forEach((i) => {
            i.setState('editAble', this.state.editFlag);
            if (!this.state.editFlag) i.reset();
          });
      }
    );
  }

  @Bind()
  getStatus() {
    const { listStatus, display, editFlag } = this.state;
    if (listStatus !== 'FINISHED') {
      return display;
    } else if (display) return editFlag;
  }

  @Bind()
  getCurrentKey(listStatus, activeKey) {
    let currentPrimaryKey;
    let exportUrl;
    switch (listStatus) {
      case 'WAITING':
        currentPrimaryKey = 'rcvTrxLineId';
        exportUrl = `waiting/export`;
        break;
      case 'DOING':
        currentPrimaryKey = 'rcvTrxHeaderId';
        exportUrl = `doing/export`;
        break;
      case 'FINISHED':
        if (activeKey === 'detail') {
          currentPrimaryKey = 'rcvTrxLineId';
          exportUrl = `finish/line/export`;
        } else {
          currentPrimaryKey = 'rcvTrxHeaderId';
          exportUrl = `finish/header/export`;
        }
        break;
      default:
        currentPrimaryKey = 'rcvTrxLineId';
        exportUrl = `waiting/export`;
        break;
    }
    return { currentPrimaryKey, exportUrl };
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const uomName = record.get('uomNameShow'); // 注意，因需求冲突此处取uomNameShow字段
    const uomCode = record.get('uomCode');
    const unitCodeIsShow = record?.get('unitCodeIsShow');
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  getColumns = (listStatus, activeKey) => {
    let currentCol;
    const columns = {
      // 待执行
      exColumns: [
        {
          name: 'orderTypeName',
          width: 100,
        },
        {
          name: 'trxNum',
          width: 140,
        },
        {
          name: 'trxLineNum',
          width: 60,
        },
        {
          name: 'itemCode',
          width: 100,
          sortable: true,
        },
        {
          name: 'itemName',
          width: 135,
        },
        {
          name: 'quantity',
          width: 100,
          editor: (record) =>
            record?.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={!isNil(record?.get('uomPrecision')) ? record?.get('uomPrecision') : 10}
              />
            ),
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'leftQuantity',
          width: 90,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'taxIncludedAmount',
          width: 100,
          editor: (record) =>
            record?.get('subjectType') === 'AMOUNT' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={
                  !isNil(record.get('financialPrecision')) ? record?.get('financialPrecision') : 10
                }
              />
            ),
          renderer: ({ value, record }) => showBigNumber(value, record?.get('financialPrecision')),
        },
        {
          name: 'leftTaxAmount',
          width: 90,
          renderer: ({ value, record }) => showBigNumber(value, record?.get('financialPrecision')),
        },
        {
          name: 'taxRateLov',
          editor: (record) =>
            record?.get('subjectType') === 'QUANTITY' &&
            (record?.get('orderTypeCode') === 'PC' ||
              record?.get('orderTypeCode') === 'ASN' ||
              record?.get('orderTypeCode') === 'ORDER') &&
            !record?.get('fromRcvTrxLineId'),
        },
        {
          name: 'netPrice',
          width: 100,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'taxIncludedPrice',
          width: 80,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'trxDate',
          width: 135,
          editor: true,
        },
        {
          name: 'inventoryNameLov',
          width: 110,
          editor: true,
        },
        {
          name: 'locationNameLov',
          width: 110,
          editor: true,
        },
        {
          name: 'organizationName',
          width: 120,
          sortable: true,
        },
        {
          name: 'orgQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'uomName',
          width: 90,
          renderer: ({ record }) => this.showUomText(record),
        },
        {
          name: 'productNum',
          width: 100,
          sortable: true,
        },
        {
          name: 'dueDate',
          width: 100,
          sortable: true,
        },
        {
          name: 'supplierName',
          width: 140,
          renderer: ({ record }) =>
            record?.get('supplierId')
              ? record?.get('supplierName')
              : record?.get('supplierCompanyName'),
        },
        {
          name: 'companyName',
          width: 140,
        },
        {
          name: 'sourceHeaderNum',
          width: 150,
        },
        {
          name: 'sourceLineNum',
          width: 70,
        },
        {
          name: 'strategyCode',
        },
        {
          name: 'checkType',
          width: 100,
        },
        {
          name: 'stageName',
          width: 80,
        },
        {
          name: 'purchaseAgentName',
          width: 120,
        },
        {
          name: 'creationName',
          width: 120,
        },
        {
          name: 'customSpecsJson',
          width: 120,
          renderer: ({ value }) => {
            return (
              <a onClick={() => showRecordModal(value ? JSON.parse(value) : [])}>
                {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
              </a>
            );
          },
        },
      ],
      // 执行中
      peColumns: [
        {
          name: 'sugRcvStatusCode',
          width: 100,
          editor: (record) =>
            record?.get('rcvStatusCode') === '10_NEW' ||
            record?.get('rcvStatusCode') === '30_REJECTED',
        },
        {
          name: 'remark',
          width: 180,
          editor: (record) => record?.get('sugRcvStatusCode') && <TextArea />, // 选择策略后可编辑
        },
        {
          name: 'rcvStatusCodeMeaning',
          width: 100,
        },
        {
          name: 'rcvTypeName',
          width: 100,
        },
        {
          name: 'returnedFlag',
          width: 70,
          renderer: ({ value }) => yesOrNoRender(+value),
        },
        {
          name: 'trxNum',
          width: 120,
          renderer: ({ record, value }) => (
            <a onClick={() => this.handleToDetail(record, 'DOING')}>{value}</a>
          ),
        },
        {
          name: 'supplierName',
          width: 140,
          renderer: ({ record }) =>
            record?.get('supplierId')
              ? record?.get('supplierName')
              : record?.get('supplierCompanyName'),
        },
        {
          name: 'companyName',
          width: 140,
        },
        {
          name: 'strategyCode',
        },
        {
          name: 'creationName',
          width: 120,
        },
      ],
      // 已完成按明细
      deColumns: [
        {
          name: 'rcvTypeName',
          width: 100,
        },
        {
          name: 'trxNum',
          width: 140,
          sortable: true,
        },
        {
          name: 'trxLineNum',
          width: 70,
          sortable: true,
        },
        {
          name: 'itemCode',
          width: 120,
          sortable: true,
        },
        {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'quantity',
          width: 70,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'leftQuantity',
          width: 80,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'updateQuantity',
          width: 100,
          editor: (record) =>
            record.getState('editAble') &&
            record.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={!isNil(record.get('uomPrecision')) ? record?.get('uomPrecision') : 10}
              />
            ),
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'moveReason',
          width: 120,
          editor: (record) => record?.getState('editAble'),
        },
        {
          name: 'reversedQuantity',
          width: 70,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'leftTaxAmount',
          width: 80,
          renderer: ({ value, record }) => showBigNumber(value, record?.get('financialPrecision')),
        },
        {
          name: 'updateTaxAmount',
          width: 100,
          editor: (record) =>
            record?.getState('editAble') && record?.get('subjectType') === 'AMOUNT',
          renderer: ({ value, record }) => showBigNumber(value, record?.get('financialPrecision')),
        },
        {
          name: 'reversedTaxAmount',
          width: 70,
          renderer: ({ value, record }) => showBigNumber(value, record?.get('financialPrecision')),
        },
        {
          name: 'taxRateLov',
        },
        {
          name: 'netPrice',
          width: 80,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'taxIncludedPrice',
          width: 70,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'trxDate',
          width: 130,
          sortable: true,
        },
        {
          name: 'inventoryName',
          width: 120,
        },
        {
          name: 'locationName',
          width: 120,
        },
        {
          name: 'organizationName',
          width: 120,
          sortable: true,
        },
        {
          name: 'uomName',
          width: 90,
          renderer: ({ record }) => this.showUomText(record),
        },
        {
          name: 'productNum',
          width: 100,
          sortable: true,
        },
        {
          name: 'dueDate',
          width: 120,
          sortable: true,
        },
        {
          name: 'supplierName',
          width: 140,
          renderer: ({ record }) =>
            record?.get('supplierId')
              ? record?.get('supplierName')
              : record?.get('supplierCompanyName'),
        },
        {
          name: 'companyName',
          width: 140,
        },
        {
          name: 'sourceHeaderNum',
          width: 120,
          sortable: true,
        },
        {
          name: 'sourceLineNum',
          width: 70,
          sortable: true,
        },
        {
          name: 'strategyCode',
        },
        {
          name: 'checkType',
          width: 100,
        },
        {
          name: 'stageName',
          width: 80,
        },
        {
          name: 'creationName',
          width: 120,
        },
        {
          name: 'customSpecsJson',
          width: 120,
          renderer: ({ value }) => {
            return (
              <a onClick={() => showRecordModal(value ? JSON.parse(value) : [])}>
                {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
              </a>
            );
          },
        },
      ],
      fiColumns: [
        {
          name: 'rcvStatusCodeMeaning',
          width: 110,
        },
        {
          name: 'rcvTypeName',
          width: 120,
        },
        {
          name: 'returnedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(+value),
        },
        {
          name: 'trxNum',
          width: 200,
          renderer: ({ record, value }) => (
            <a onClick={() => this.handleToDetail(record, 'ALL')}>{value}</a>
          ),
        },
        {
          name: 'supplierName',
          width: 150,
          renderer: ({ record }) =>
            record.get('supplierId')
              ? record.get('supplierName')
              : record.get('supplierCompanyName'),
        },
        {
          name: 'companyName',
          width: 150,
        },
        {
          name: 'strategyCode',
        },
        {
          name: 'creationName',
          width: 120,
        },
      ],
    };
    switch (listStatus) {
      case 'WAITING':
        currentCol = columns?.exColumns;
        break;
      case 'DOING':
        currentCol = columns?.peColumns;
        break;
      case 'FINISHED':
        if (activeKey === 'detail') {
          currentCol = columns?.deColumns;
        } else {
          currentCol = columns?.fiColumns;
        }
        break;
      default:
        currentCol = columns?.exTableDs;
        break;
    }
    return currentCol;
  };

  getCustomizeUnitCode = () => {
    const { unitCode, listStatus, activeKey } = this.state;
    let filterCode;
    let code;
    if (listStatus === 'FINISHED' && activeKey === 'list') {
      filterCode = `SINV.RECEIPT_EXECUTE_ALL_${unitCode}_FILTER`;
      code = `SINV.RECEIPT_EXECUTE_ALL_${unitCode}`;
      return { filterCode, code };
    } else {
      filterCode = `SINV.RECEIPT_EXECUTE_${unitCode}_FILTER`;
      code = `SINV.RECEIPT_EXECUTE_${unitCode}`;
      return { filterCode, code };
    }
  };

  loop = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode
            className="tree-node-title"
            title={item?.nodeConfigName}
            key={item?.pkId}
            dataRef={item}
            selectable={false}
          >
            {this.loop(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode title={item.title} key={item.pkId} dataRef={item} />;
    });
  };

  onRow = (record) => {
    const { processList, listStatus, activeKey } = this.state;
    const { currentPrimaryKey } = this.getCurrentKey(listStatus, activeKey);
    const { rcvTrxHeaderId, rcvTrxLineId } = record.data || {};
    return {
      onClick: () => {
        if (processList[currentPrimaryKey] !== record.get(currentPrimaryKey)) {
          this.fetchProcessList({ rcvTrxHeaderId, rcvTrxLineId });
        }
      },
    };
  };

  getBtn = () => {
    const {
      execLoading,
      execAllLoading,
      listStatus,
      display,
      editFlag,
      activeKey,
      allDataset,
      inDataset,
    } = this.state;
    const currentDs =
      allDataset[
        `${listStatus === 'FINISHED' ? `${listStatus}${activeKey}` : `${listStatus}`}${
          inDataset.pkId
        }`
      ];
    const HeaderButtons = observer(({ dataSet }) => {
      return (
        <Fragment>
          {listStatus === 'FINISHED' && activeKey === 'detail' && display && (
            <Button icon="mode_edit" color="primary" funcType="flat" onClick={this.handleEdit}>
              {!editFlag
                ? intl.get('hzero.common.status.edit').d('编辑')
                : intl.get('sinv.receiptExecution.model.receipt.cancel').d('取消编辑')}
            </Button>
          )}
          {this.getStatus() && (
            <Button
              loading={execLoading}
              icon="trending_up"
              color="primary"
              funcType="flat"
              key="exec"
              disabled={dataSet.selected.length === 0}
              onClick={() => this.handleBatchExec(false)}
            >
              {intl.get('sinv.receiptExecution.model.receipt.execution').d('执行')}
            </Button>
          )}
          {this.getStatus() && listStatus === 'WAITING' && (
            <Button
              loading={execAllLoading}
              icon="done_all"
              color="primary"
              funcType="flat"
              key="allexec"
              disabled={dataSet.length === 0}
              onClick={() => this.handleBatchExec(true)}
            >
              {intl.get('sinv.receiptExecution.model.receipt.execution.all').d('全选执行')}
            </Button>
          )}
        </Fragment>
      );
    });
    return [<HeaderButtons dataSet={currentDs} />];
  };

  render() {
    const {
      loading,
      processLoading,
      listStatus,
      execParams,
      // unitCode,
      activeKey,
      treeList = [],
      processList: { children = [] },
      selectedKeys,
      allDataset = {},
      inDataset = {},
    } = this.state;
    const {
      custLoading,
      customizeTable = () => {},
      match: { path },
    } = this.props;
    const buttons = this.getBtn();
    const { filterCode, code } = this.getCustomizeUnitCode();
    const { exportUrl, currentPrimaryKey } = this.getCurrentKey(listStatus, activeKey);
    const currentDs =
      allDataset[
        `${listStatus === 'FINISHED' ? `${listStatus}${activeKey}` : `${listStatus}`}${
          inDataset.pkId
        }`
      ];
    const listProps = {
      buttons,
      custLoading,
      dataSet: currentDs,
      sortQueryFieldsByCustomize: true,
      columns: this.getColumns(listStatus, activeKey),
      queryFieldsLimit: 3,
      onRow: ({ record }) => this.onRow(record),
    };
    const lovProps = {
      code: listStatus === 'WAITING' ? 'SPUC.SINV_MOVE_TYPE' : 'SPUC.SINV_REVERSE_NODE_URL',
      queryParams: filterNullValueObject({
        ...execParams,
        tenantId: organizationId,
        strategyLineIds:
          listStatus === 'WAITING'
            ? ''
            : `${currentDs?.selected.map((i) => i.toData().strategyLineId?.toString())},`,
      }),
      style: { display: 'none' },
    };
    const ExportBtn = observer(({ dataSet }) => {
      const queryParams = filterNullValueObject({
        ...dataSet?.queryParameter.params,
        ...dataSet?.queryDataSet.toData()[0],
      });
      const trxIds = dataSet?.selected.map((i) => i.get(currentPrimaryKey));
      return (
        <Fragment>
          {listStatus === 'WAITING' && (
            <PermissionButton
              icon="save"
              type="primary"
              permissionList={[
                {
                  code: `${path}.button.receiptExecution`,
                  type: 'button',
                  meaning: '收货执行-待执行保存',
                },
              ]}
              onClick={() => this.handleSave(dataSet)}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </PermissionButton>
          )}
          {listStatus === 'WAITING' && (
            <ExcelExportPro
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'srm.logistics.receive.execution.ps.button.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              buttonText={
                isEmpty(dataSet?.selected)
                  ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              requestUrl={
                activeKey === 'detail'
                  ? `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}/new`
                  : `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}`
              }
              queryParams={
                isEmpty(dataSet?.selected)
                  ? queryParams
                  : { ...queryParams, [`${currentPrimaryKey}s`]: trxIds }
              }
              templateCode={
                listStatus === 'WAITING'
                  ? 'SPUC_SINV_RCV_TRX_WAITING_EXPORT'
                  : listStatus === 'FINISHED' && activeKey === 'detail'
                  ? 'SPUC_SINV_RCV_TRX_FINISH_LINE_EXPORT'
                  : listStatus === 'DOING'
                  ? 'SPUC_SINV_RCV_TRX_DOING_EXPORT'
                  : 'SPUC_SINV_RCV_TRX_FINISH_EXPORT'
              }
            />
          )}
          {listStatus !== 'WAITING' && (
            <ExcelExportPro
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'srm.logistics.receive.execution.ps.button.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              buttonText={
                isEmpty(dataSet?.selected)
                  ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              requestUrl={
                activeKey === 'detail'
                  ? `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}/new`
                  : `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}`
              }
              queryParams={
                isEmpty(dataSet?.selected)
                  ? queryParams
                  : { ...queryParams, [`${currentPrimaryKey}s`]: trxIds }
              }
              templateCode={
                listStatus === 'WAITING'
                  ? 'SPUC_SINV_RCV_TRX_WAITING_EXPORT'
                  : listStatus === 'FINISHED' && activeKey === 'detail'
                  ? 'SPUC_SINV_RCV_TRX_FINISH_LINE_EXPORT'
                  : listStatus === 'DOING'
                  ? 'SPUC_SINV_RCV_TRX_DOING_EXPORT'
                  : 'SPUC_SINV_RCV_TRX_FINISH_EXPORT'
              }
            />
          )}
          <ExcelExport
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}`}
            queryParams={queryParams}
            otherButtonProps={{
              icon: 'export',
              permissionList: [
                {
                  code: 'srm.logistics.receive.execution.button.export',
                  type: 'c7n-pro',
                },
              ],
            }}
          />
          <ExcelExport
            buttonText={intl.get(`sinv.purchaserDelivery.view.button.checkExport`).d('勾选导出')}
            otherButtonProps={{
              icon: 'export',
              disabled: isEmpty(dataSet?.selected),
              permissionList: [
                {
                  code: 'srm.logistics.receive.execution.button.check.export',
                  type: 'c7n-pro',
                },
              ],
            }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}`}
            queryParams={{ ...queryParams, [`${currentPrimaryKey}s`]: trxIds }}
          />
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              color: 'primary',
              permissionList: [
                {
                  code:
                    'srm.logistics.receive.execution.sinv.receipt-execution.list.button.receiptExecution',
                  type: 'c7n-pro',
                },
              ],
            }}
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
            }
            requestUrl={
              activeKey === 'detail'
                ? `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}/new`
                : `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${exportUrl}`
            }
            queryParams={
              isEmpty(dataSet?.selected)
                ? queryParams
                : { ...queryParams, [`${currentPrimaryKey}s`]: trxIds }
            }
            templateCode={
              listStatus === 'WAITING'
                ? 'SPUC_SINV_RCV_TRX_WAITING_EXPORT'
                : listStatus === 'FINISHED' && activeKey === 'detail'
                ? 'SPUC_SINV_RCV_TRX_FINISH_LINE_EXPORT'
                : listStatus === 'DOING'
                ? 'SPUC_SINV_RCV_TRX_DOING_EXPORT'
                : 'SPUC_SINV_RCV_TRX_FINISH_EXPORT'
            }
          />
        </Fragment>
      );
    });

    return (
      <Fragment>
        <Header title={intl.get('sinv.receiptExecution.view.title.receiptExecution').d('收货执行')}>
          <ExportBtn dataSet={currentDs} />
        </Header>
        <Content>
          <Lov
            {...lovProps}
            ref={(c) => {
              this.catalog = c;
            }}
            onChange={(_, lovRecord) => this.batchSetExec(lovRecord)}
          />
          <Lov
            {...lovProps}
            ref={(c) => {
              this.catalogAll = c;
            }}
            onChange={(_, lovRecord) => this.batchSetExecAll(lovRecord)}
          />
          <div className={styles['execution-content']}>
            <div className="left-content">
              <Search
                enterButton
                onSearch={this.handleFetchAll}
                placeholder={intl
                  .get('sinv.receiptExecution.model.delivery.order.trxNum')
                  .d('送货单号/订单号/事务单号')}
              />
              <Spin spinning={loading}>
                {treeList?.length > 0 && (
                  <Tree defaultExpandAll selectedKeys={selectedKeys} onSelect={this.onSelect}>
                    {this.loop(treeList)}
                  </Tree>
                )}
              </Spin>
            </div>
            <div className="right-content">
              {currentDs && (
                <Fragment>
                  <Spin spinning={processLoading}>
                    <div className="process-header">
                      {children?.length > 0 && this.renderStep(children)}
                    </div>
                  </Spin>
                  {listStatus !== 'FINISHED' ? (
                    customizeTable(
                      { code, filterCode, queryLovIgnore: false },
                      <Table {...listProps} />
                    )
                  ) : (
                    <Tabs animated={false} activeKey={activeKey} onChange={this.handleTabsChange}>
                      <TabPane
                        tab={intl
                          .get('sinv.receiptExecution.view.message.detailSearch')
                          .d('按明细查询')}
                        key="detail"
                      >
                        {customizeTable(
                          { code, filterCode, queryLovIgnore: false },
                          <Table {...listProps} />
                        )}
                      </TabPane>
                      <TabPane
                        tab={intl
                          .get('sinv.receiptExecution.view.message.listSearch')
                          .d('按单查询')}
                        key="list"
                      >
                        {customizeTable(
                          { code, filterCode, queryLovIgnore: false },
                          <Table {...listProps} />
                        )}
                      </TabPane>
                    </Tabs>
                  )}
                </Fragment>
              )}
            </div>
          </div>
        </Content>
      </Fragment>
    );
  }
}
