/**
 * index.js - 协议审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { Button } from 'hzero-ui';
import { isUndefined, isArray, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { DATETIME_MIN } from 'utils/constants';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Bind, Throttle } from 'lodash-decorators';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';
import RejectModal from './RejectModal';
import RejectModalOk from './RejectModalOk';
import Search from './Search';
import List from './List';

const viewMessagePrompt = 'spcm.contractApproval.view.message';
@connect(({ loading = {}, contractApproval = {} }) => ({
  queryListLoading: loading.effects['contractApproval/queryList'],
  approveListLoading: loading.effects['contractApproval/approveList'],
  updateStateLoading: loading.effects['contractApproval/contractApproval/updateState'],
  updateLoading: loading.effects['contractApproval/contractApproval/update'],
  getLineAttachmentUuidLoading: loading.effects['contractApproval/getLineAttachmentUuid'],
  fetchOperationRecordListLoading: loading.effects['contractApproval/fetchOperationRecordList'],
  // submitting: loading.effects['contractApproval/submit'],
  rejecting: loading.effects['contractApproval/rejectApprovalList'],
  contractApproval,
}))
@formatterCollections({
  code: [
    'spcm.contractApproval',
    'spcm.common',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
    'entity.business',
  ],
})
@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_APPROVAL.LIST', 'SPCM.PURCHASE_CONTRACT_APPROVAL.LIST.FILTER'],
})
export default class AgreementApproval extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      operationRecordVisible: false,
      rejectModalVisible: false,
      agreeModalVisible: false,
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractApproval: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { contractApproval } = this.props;
    const { dataSource = [] } = contractApproval;
    dataSource.forEach((item) => item.$form && item.$form.resetFields());
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { tenantId } = this.state;
    const { dispatch } = this.props;
    const formValue = this.filterForm.getFieldsValue();
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject({
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        });
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    this.resetDataForm();
    dispatch({
      type: 'contractApproval/queryList',
      payload: {
        page,
        // pcHeaderId,
        tenantId,
        ...handleFormValues,
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_APPROVAL.LIST,SPCM.PURCHASE_CONTRACT_APPROVAL.LIST.FILTER',
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractApproval/init',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-approval/detail`,
        search: pcHeaderId
          ? querystring.stringify({ pcHeaderId })
          : querystring.stringify({ prSourcePlatform: 'SRM' }),
      })
    );
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleListRowSelectChange(newSelectedRowKeys, newSelectedRows) {
    this.setState({ selectedRows: newSelectedRows });
  }

  /**
   * 选中行回调
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * handleVisible - 通过协议-打开模态框
   */
  @Bind()
  handleAgreeApproval(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * 通过协议-发送数据
   * @param {*} values
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  handleAgree(values) {
    const { selectedRows = [] } = this.state;
    const { contractApproval, dispatch } = this.props;
    const { pagination = {}, dataSource = [] } = contractApproval;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const pcHeaderList = dataSource.filter((item) => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);

    dispatch({
      type: 'contractApproval/approveList',
      payload: { ...values, pcHeaderList },
    }).then((res) => {
      if (res) {
        this.fetchList(pagination);
        this.setState({ selectedRows: [] });
        notification.success();
      }
    });
  }

  /**
   * handleVisible - 拒绝协议-打开模态框
   */
  @Bind()
  handleRejectApproval(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * 拒绝协议--发送数据
   * @param {*} values
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  handleReject(values) {
    const { selectedRows = [] } = this.state;
    const { contractApproval, dispatch } = this.props;
    const { pagination = {}, dataSource = [] } = contractApproval;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const pcHeaderList = dataSource.filter((item) => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    dispatch({
      type: 'contractApproval/rejectApprovalList',
      payload: { ...values, pcHeaderList },
    }).then((res) => {
      if (res) {
        // this.handleSearch(pagination);
        this.setState({ selectedRows: [] });
        notification.success();
        this.resetDataForm();
        this.handleModalVisible();
        this.fetchList(pagination);
      }
    });
  }

  /**
   * 控制文本对比modal显隐
   * @param {*} pcHeaderId
   */
  @Bind()
  handleControlComparison(params) {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible, ...params });
  }

  render() {
    const {
      form,
      queryListLoading,
      contractApproval,
      rejecting,
      approveListLoading,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { enumMap = [], pagination = {}, dataSource = [] } = contractApproval;
    const {
      rejectModalVisible = false,
      agreeModalVisible = false,
      textComparisonVisible,
    } = this.state;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
    } = this.state;
    const searchProps = {
      enumMap,
      customizeFilterForm,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      form,
      dataSource,
      pagination,
      selectedRows,
      customizeTable,
      selectedRowKeys,
      contractApproval,
      onSearch: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const agreetModalProps = {
      approveListLoading,
      visible: agreeModalVisible,
      onOk: this.handleAgree,
      onCancel: () => this.handleModalVisible('agreeModalVisible', false),
    };

    const rejectModalProps = {
      rejecting,
      visible: rejectModalVisible,
      onOk: this.handleReject,
      onCancel: () => this.handleModalVisible('rejectModalVisible', false),
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.agreementForApproval`).d('协议审批')}>
          <Button
            type="primary"
            // onClick={this.handlePassApproval}
            onClick={() => this.handleAgreeApproval('agreeModalVisible', true)}
            icon="check"
            loading={approveListLoading}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
          >
            {intl.get('spcm.common.button.approval').d('审批通过')}
          </Button>

          <Button
            onClick={() => this.handleRejectApproval('rejectModalVisible', true)}
            icon="close"
            loading={rejecting}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
          >
            {intl.get('spcm.common.button.reject').d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <RejectModal {...rejectModalProps} />
        <RejectModalOk {...agreetModalProps} />
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}
