/**
 * index - 采购申请汇总查询页面
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { isEmpty, isUndefined, isArray, isNil, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { Button as PermissionButton } from 'components/Permission';
import { stringify, parse } from 'querystring';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { filterNullValueObject, createPagination, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { BudgetCheckTable } from '@/routes/components/BudgetCheckTable';
import List from './List';
import Search from './Search';
import OperationRecord from '../components/OperationRecord/OperationRecord';
import CopyModal from './CopyModal';

const messagePrompt = 'sprm.purchaseReqCreation.view.message';
const titlePrompt = 'sprm.purchaseReqCreation.view.title';
const commonPrompt = 'sprm.common.model.common';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [purchaseRequisitionCreation={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [batchSubmitDeliveryLoading=false] - 批量提交送货单处理中
 * @reactProps {boolean} [queryOperationRecordLoading=false] - 查询操作记录处理中
 * @reactProps {boolean} [batchDeleteDeliveryLoading=false] - 批量删除处理中
 * @reactProps {boolean} [batchCreateDeliveryLoading=false] - 批量创建处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建数据处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护送货单处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_CREATION.LIST.FILTER',
    'SPRM.PURCHASE_REQUISITION_CREATION.LIST.GRID',
    'SPRM.PURCHASE_REQUISITION_CREATION.LIST_BTNS',
  ],
})
@cuxRemote(
  {
    code: 'SPRM_PURCHASE_CREATION_LIST_REMOTE',
    name: 'remote',
  },
  {
    process: {
      handleFuncPath: undefined, // 三生需要根据路由等条件新增创建时，返回路由backPath
      handlePageDefault: undefined, // 三生列表查询+复制弹窗需要加默认查询条件
      handleCuxBtnDom: undefined, // 三生列表加二开按钮
    },
  }
)
@connect(({ loading = {}, purchaseRequisitionCreation = {} }) => ({
  batchSubmitDeliveryLoading: loading.effects['purchaseRequisitionCreation/batchSubmitDelivery'],
  queryOperationRecordLoading: loading.effects['purchaseRequisitionCreation/queryOperationRecord'],
  batchDeleteDeliveryLoading: loading.effects['purchaseRequisitionCreation/batchDeleteDelivery'],
  batchCreateDeliveryLoading: loading.effects['purchaseRequisitionCreation/batchCreateDelivery'],
  queryListLoading: loading.effects['purchaseRequisitionCreation/queryList'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionCreation/fetchOperationRecordList'],
  submitting:
    loading.effects['purchaseRequisitionCreation/submit'] ||
    loading.effects['purchaseRequisitionCreation/budgetCheck'],
  confirmCopyLoading: loading.effects['purchaseRequisitionCreation/confirmCopy'],
  queryCopyPrListLoading: loading.effects['purchaseRequisitionCreation/queryCopyPrList'],
  purchaseRequisitionCreation,
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseRequisitionCreation',
    'sprm.purchasePlatform',
    'sprm.purchaseReqCreation',
    'entity.organization',
    'entity.business',
    'entity.company',
    'entity.roles',
    'hzero.common',
    'sprm.common',
  ],
})
export default class PurchaseRequisitionCreation extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { lotNum } = parse(search.substr(1));
    this.state = {
      record: {},
      lotNum,
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
      copyModalVisible: false,
      copyList: [],
      copyPagination: {},
      dataSource: [],
      pagination: {},
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { lotNum } = state;
    const {
      location: { search },
    } = props;
    const { lotNum: nextLotNum } = parse(search.substr(1));
    if (nextLotNum && lotNum !== nextLotNum) {
      return { lotNum: nextLotNum };
    }
    return null;
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      purchaseRequisitionCreation: { pagination = {} },
      custLoading,
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else if (!custLoading) {
      this.fetchList();
    }
    this.fetchEnum();
    window.PurchaseRequisitionCreationFetchList = () => {
      this.fetchList();
    };
  }

  getSnapshotBeforeUpdate(prevProps, preState) {
    const { lotNum } = preState;
    const {
      location: { search },
    } = this.props;
    const { lotNum: nextLotNum } = parse(search.substr(1));
    if (nextLotNum && lotNum !== nextLotNum) {
      return nextLotNum;
    } else {
      return false;
    }
  }

  componentDidUpdate(prevProps, prevState, lotNum) {
    const { custLoading } = this.props;
    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (lotNum || custLoadingChange) {
      this.fetchList();
    }
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, _, sorter = {}) {
    const { lotNum } = this.state;
    const { dispatch, remote } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { handlePageDefault } = remote?.props?.process || {};
    const cuxDefaultParams = isFunction(handlePageDefault) ? handlePageDefault() : {};
    dispatch({
      type: 'purchaseRequisitionCreation/updateState',
      payload: {
        selectedRows: [],
      },
    });
    let sort = {};
    const { field, order } = sorter;
    switch (true) {
      case field === 'requestedBy':
        sort = { order, field: 'requestedBy' };
        break;
      case ['companyName', 'ouName', 'purchaseOrgName', 'purchaseAgentName'].includes(field):
        sort = { order, field: field.replace('Name', 'Id') };
        break;
      default:
        sort = sorter;
        break;
    }
    dispatch({
      type: 'purchaseRequisitionCreation/queryList',
      payload: {
        page,
        lotNum,
        sort,
        ...filterValues,
        ...cuxDefaultParams,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_CREATION.LIST.FILTER,SPRM.PURCHASE_REQUISITION_CREATION.LIST.GRID',
        requestDateEnd:
          filterValues.requestDateEnd && filterValues.requestDateEnd.format(DATETIME_MAX),
        requestDateStart:
          filterValues.requestDateStart && filterValues.requestDateStart.format(DATETIME_MIN),
      },
      setPagination: (pagination) => this.setState({ pagination }),
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.dataSource,
          pagination: res.pagination,
        });
      }
    });
  }

  /**
   * 重置URL的批次号
   */
  @Bind()
  handleReset() {
    const { history, remote } = this.props;
    const { handleFuncPath = undefined } = remote?.props?.process || {};
    const cuxPath = isFunction(handleFuncPath) ? handleFuncPath() : {};
    history.push(cuxPath?.cuxBackPath || '/sprm/purchase-requisition-creation/list');
    this.setState({ lotNum: undefined });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionCreation/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      record,
      operationRecordModalVisible: true,
      prHeaderId: record.prHeaderId,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseRequisitionCreation/fetchEnum',
    });
  }

  /**
   * 手动处理提交接口返回数据
   * @param {Object} res
   */
  @Bind()
  handleSubmitResponse(res) {
    const { dataSource, pagination } = this.state;
    const { errorDataVOList } = res;
    let selectedRows = [];
    const selectedRowKeys = [];
    const errorMsgArray = [];
    if (isArray(errorDataVOList) && !isEmpty(errorDataVOList)) {
      errorDataVOList.forEach((n) => {
        selectedRowKeys.push(n.rowKey);
        errorMsgArray.push(n.message);
      });
      const msgDom = (
        <Fragment>
          {errorMsgArray?.map((n) => (
            <p>{n}</p>
          ))}
        </Fragment>
      );
      notification.error({ message: msgDom });
      selectedRows = dataSource.filter((n) => selectedRowKeys.includes(n.prHeaderId));
    }
    this.fetchList(pagination, selectedRows);
  }

  @Bind()
  @Throttle(500)
  submit() {
    const { dispatch, purchaseRequisitionCreation } = this.props;
    const { selectedRows } = purchaseRequisitionCreation;
    const haveFreight =
      selectedRows
        ?.filter((item) => item.freight && item.freight > 0)
        ?.map((item) => item.displayPrNum) || [];
    const srmList = selectedRows.filter((item) => item.prSourcePlatform === 'SRM');
    // 提示信息
    let tipMessage = null;
    if (haveFreight.length > 0) {
      const prArray = haveFreight.join(',');
      tipMessage = intl
        .get(`${messagePrompt}.preSubmit`, {
          displayPrNum: prArray,
        })
        .d(`采购申请${prArray}的行单价将受运费影响产生变动，确定提交吗？`);
    }

    tipMessage = (
      <div>
        {tipMessage}
        {intl.get(`sprm.common.model.common.confirmSubmit`).d('请确认是否继续提交')}
        {/* <div>
          {intl
            .get(`sprm.common.model.common.budgetCheckSubmit`)
            .d('以下申请行已超预警线或超量占用，请确认是否继续提交？')}
        </div> */}
      </div>
    );

    if (!isEmpty(srmList)) {
      dispatch({
        type: 'purchaseRequisitionCreation/budgetCheck',
        payload: srmList,
      }).then((checkMsg) => {
        if (checkMsg) {
          // 预算不足的行
          const failedList = [];

          // 需要检查提示的行
          const checkList = [];

          checkMsg.forEach((header) => {
            const lineList = header.prLineList;
            if (!isEmpty(lineList)) {
              lineList.forEach((line) => {
                if (line?.failed === '1') {
                  failedList.push({
                    ...line,
                    displayPrNum: header.displayPrNum,
                  });
                } else if (['02', '03'].includes(line.errorStatusCode)) {
                  checkList.push({
                    ...line,
                    displayPrNum: header.displayPrNum,
                  });
                }
              });
            }
          });

          if (!isEmpty(failedList)) {
            const prListStr = failedList?.map((e) => `${e.displayPrNum}|${e.lineNum}`).join(', ');
            notification.error({
              message:
                intl.get(`${commonPrompt}.prNum`).d('采购申请编号') +
                prListStr +
                failedList[0].errorMessage,
            });
          } else if (!isEmpty(checkList)) {
            // 余额已超过预警线 或者  余额不足，未超过预算允差范围
            C7nModal.open({
              bodyStyle: { padding: '20px' },
              drawer: true,
              style: { width: '742px' },
              closable: true,
              title: intl.get(`${commonPrompt}.budgetCheckTip`).d('预算校验提示'),
              border: true,
              children: <BudgetCheckTable data={checkList} tipMessage={tipMessage} />,
              okText: intl.get(`sprm.purchaseReqCreation.view.message.confirmOk`).d('确定'),
              cancelText: intl
                .get(`sprm.purchaseReqCreation.view.message.confirmCancelText`)
                .d('取消'),
              onOk: () => {
                dispatch({
                  type: 'purchaseRequisitionCreation/submit',
                  payload: { prHeaderList: selectedRows },
                }).then((res) => {
                  if (res && isArray(res)) {
                    let submitMsg = '';
                    res.forEach((ele) => {
                      submitMsg = ele.messageFlag === 1 ? (submitMsg += `${ele.responseMsg}`) : '';
                    });
                    if (submitMsg) {
                      notification.warning({ message: submitMsg });
                    } else {
                      notification.success();
                    }
                    this.fetchList();
                  } else {
                    this.handleSubmitResponse(res);
                  }
                });
              },
            });
          } else {
            Modal.confirm({
              title: tipMessage,
              okText: intl.get(`${messagePrompt}.confirmOk`).d('确定'),
              cancelText: intl.get(`${messagePrompt}.confirmCancelText`).d('取消'),
              onOk: () => {
                dispatch({
                  type: 'purchaseRequisitionCreation/submit',
                  payload: { prHeaderList: selectedRows },
                }).then((res) => {
                  if (res && isArray(res)) {
                    let submitMsg = '';
                    res.forEach((ele) => {
                      submitMsg = ele.messageFlag === 1 ? (submitMsg += `${ele.responseMsg}`) : '';
                    });
                    if (submitMsg) {
                      notification.warning({ message: submitMsg });
                    } else {
                      notification.success();
                    }
                    this.fetchList();
                  } else {
                    this.handleSubmitResponse(res);
                  }
                });
              },
            });
          }
        }
      });
      return;
    }
    Modal.confirm({
      title: tipMessage,
      okText: intl.get(`${messagePrompt}.confirmOk`).d('确定'),
      cancelText: intl.get(`${messagePrompt}.confirmCancelText`).d('取消'),
      onOk: () => {
        dispatch({
          type: 'purchaseRequisitionCreation/submit',
          payload: { prHeaderList: selectedRows },
        }).then((res) => {
          if (res && isArray(res)) {
            let submitMsg = '';
            res.forEach((ele) => {
              submitMsg = ele.messageFlag === 1 ? (submitMsg += `${ele.responseMsg}`) : '';
            });
            if (submitMsg) {
              notification.warning({ message: submitMsg });
            } else {
              notification.success();
            }
            this.fetchList();
          } else {
            this.handleSubmitResponse(res);
          }
        });
      },
    });
  }

  /**
   * 跳转到明细页
   * @param {String} prHeaderId
   */
  @Bind()
  @Throttle(500)
  redirectDetail(prHeaderId) {
    const { dispatch, remote } = this.props;
    const { handleFuncPath = undefined } = remote?.props?.process || {};
    const cuxPath = isFunction(handleFuncPath) ? handleFuncPath() : {};
    if (cuxPath && cuxPath.cuxCreatePath) {
      dispatch(
        routerRedux.push({
          pathname: cuxPath.cuxCreatePath,
          search: prHeaderId
            ? stringify({ prHeaderId })
            : stringify({ prSourcePlatform: 'SRM', ...cuxPath.cuxParams }),
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-requisition-creation/detail`,
          search: prHeaderId ? stringify({ prHeaderId }) : stringify({ prSourcePlatform: 'SRM' }),
        })
      );
    }
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseRequisitionCreation/updateState',
      payload: {
        selectedRows,
      },
    });
  }

  // 显示复制采购申请行弹框
  @Bind()
  @Throttle(500)
  showCopyModal() {
    this.setState({
      copyModalVisible: true,
    });
    this.fetchCopyModalList();
  }

  // 关闭复制采购申请行弹框
  @Bind()
  closeCopyModal() {
    this.setState({
      copyModalVisible: false,
    });
  }

  @Bind()
  handleConfirmCopy(selectedRow = {}) {
    const { dispatch, remote } = this.props;
    const { handleFuncPath = undefined } = remote?.props?.process || {};
    const cuxPath = isFunction(handleFuncPath) ? handleFuncPath() : {};
    if (!isEmpty(selectedRow)) {
      dispatch({
        type: 'purchaseRequisitionCreation/confirmCopy',
        payload: selectedRow,
      }).then((res) => {
        if (res) {
          const { prHeaderId } = res;
          if (!isNil(prHeaderId)) {
            const searchCopy = prHeaderId
              ? stringify({ prHeaderId })
              : stringify({ prSourcePlatform: 'SRM' });

            dispatch(
              routerRedux.push({
                pathname: cuxPath?.cuxCreatePath || `/sprm/purchase-requisition-creation/detail`,
                search: `${searchCopy}&isCopy=1`,
              })
            );
          }
        }
      });
    }
  }

  @Bind()
  fetchCopyModalList(page = {}) {
    const { dispatch, remote } = this.props;
    const { handlePageDefault } = remote?.props?.process || {};
    const cuxDefaultParams = isFunction(handlePageDefault) ? handlePageDefault() : {};
    const filterValues = isUndefined(this.copyForm) ? {} : this.copyForm.getFieldsValue();
    const searchValues = filterNullValueObject(filterValues);
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'purchaseRequisitionCreation/queryCopyPrList',
      payload: {
        page,
        tenantId,
        ...cuxDefaultParams,
        ...searchValues,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          copyList: res.content || [],
          copyPagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const {
      queryListLoading,
      submitting,
      purchaseRequisitionCreation,
      fetchOperationRecordListLoading,
      queryCopyPrListLoading,
      confirmCopyLoading,
      customizeFilterForm,
      customizeTable,
      customizeBtnGroup,
      remote,
    } = this.props;
    const { handleCuxBtnDom } = remote?.props?.process || {};
    const { enumMap, selectedRows = [] } = purchaseRequisitionCreation;
    const {
      record,
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      copyModalVisible = false,
      copyList = [],
      copyPagination = {},
      pagination = {},
      dataSource = [],
    } = this.state;
    const searchProps = {
      enumMap,
      pagination,
      onReset: this.handleReset,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      customizeFilterForm,
      onFetchList: this.fetchList,
    };
    const operationRecordProps = {
      record,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const listProps = {
      dataSource,
      pagination,
      selectedRows,
      purchaseRequisitionCreation,
      loading: queryListLoading,
      onHide: this.openOperationRecord,
      onChange: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
      redirectDetail: this.redirectDetail,
      customizeTable,
    };

    // 复制采购申请弹框
    const copyModalProps = {
      queryLoading: queryCopyPrListLoading,
      confirmCopyLoading,
      modalVisible: copyModalVisible,
      onCloseModal: this.closeCopyModal,
      onConfirmCopy: this.handleConfirmCopy,
      onChange: this.fetchCopyModalList,
      searchList: this.fetchCopyModalList,
      onRef: (node) => {
        this.copyForm = node.props.form;
      },
      dataSource: copyList,
      pagination: copyPagination,
    };
    const CuxDom = handleCuxBtnDom ? handleCuxBtnDom() : [];
    return (
      <Fragment>
        <Header title={intl.get(`${titlePrompt}.purchaseCreation`).d('需求创建')}>
          {customizeBtnGroup({ code: 'SPRM.PURCHASE_REQUISITION_CREATION.LIST_BTNS' }, [
            <PermissionButton
              icon="plus"
              data-name="new"
              type="primary"
              onClick={() => this.redirectDetail()}
              permissionList={[
                {
                  code: 'hzero.srm.requirement.prm.pr-creation.ps.new',
                  type: 'button',
                  meaning: '新建按钮权限',
                },
              ]}
            >
              {intl.get(`sprm.purchasePlatform.view.button.create`).d('新建')}
            </PermissionButton>,
            <PermissionButton
              icon="check"
              loading={submitting}
              onClick={this.submit}
              data-name="batchSubmit"
              disabled={isEmpty(selectedRows)}
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-creation.ps.batch_submit`,
                  type: 'button',
                  meaning: '提交按钮权限',
                },
              ]}
            >
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </PermissionButton>,
            <PermissionButton
              icon="copy"
              // loading={submitting}
              onClick={this.showCopyModal}
              data-name="copyPurchase"
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-creation.ps.copy`,
                  type: 'button',
                  meaning: '复制采购申请按钮权限',
                },
              ]}
            >
              {intl
                .get('sprm.purchaseReqCreation.view.button.copyPurchaseRequisition')
                .d('复制采购申请')}
            </PermissionButton>,
            ...CuxDom,
          ])}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <OperationRecord {...operationRecordProps} />
        </Content>
        <CopyModal {...copyModalProps} />
      </Fragment>
    );
  }
}
