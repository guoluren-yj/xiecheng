/**
 * index - 应收单审批
 * @date: 2019-11-19
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import UploadModal from 'components/Upload/index';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz';

import HeaderInfo from './Header';
import DeatilList from './DeatilList';
import OperationRecord from '../../components/AcceptanceOperation';

/**
 * 应收单审批详情界面
 *
 * @export
 * @class Reception - 详情界面
 * @extends {Component} - React.Component
 * @reactProps {object} acceptanceSheetApproved - 数据源
 * @reactProps {boolean} fetchLoading - 获取数据状态
 * @reactProps {function} dispatch - redux dispatch
 * @returns React.element
 */
@withCustomize({
  unitCode: [
    'SINV.ACCEPTANCE_APPROVED_DETAIL.HEADER',
    'SINV.ACCEPTANCE_APPROVED_DETAIL.LINE',
    'SINV.ACCEPTANCE_APPROVED_DETAIL.AGREEMENT',
    'SINV.ACCEPTANCE_APPROVED_DETAIL.ORDER',
  ],
})
@connect(({ loading, acceptanceSheetApproved }) => ({
  fetchHeaderLoading: loading.effects['acceptanceSheetApproved/fetchApproveHeader'],
  fetchListLoading: loading.effects['acceptanceSheetApproved/fetchApproveDetailList'],
  approveLoading: loading.effects['acceptanceSheetApproved/approveAcceptance'],
  rejectLoading: loading.effects['acceptanceSheetApproved/rejectAcceptance'],
  acceptanceSheetApproved,
}))
@formatterCollections({
  code: [
    'sinv.acceptanceSheetCreate',
    'sinv.acceptanceSheet',
    'entity.supplier',
    'entity.item',
    'sinv.common',
    'entity.company',
    'sinv.deliveryApproved',
    'hzero.common',
    'sinv.acceptance',
    'sinv.acceptanceSheetCreate',
    'sinv.acceptanceApproved',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationRecordId: '', // table中打开的对应操作记录的id
      operationRecordModalVisible: false, // 修改操作记录模态框
      customizeCode: '', // 行个性化编码
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询表单请求
   * @params {object} page - 分页
   */
  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'acceptanceSheetApproved/fetchApproveHeader',
      payload: {
        id: match.params.id,
        customizeUnitCode: 'SINV.ACCEPTANCE_APPROVED_DETAIL.HEADER',
      },
    }).then((res) => {
      if (res) {
        this.setCustomizeCode();
        this.fetchList();
      }
    });
  }

  // 根据头单据来源获取不同的列个性化编码
  @Bind()
  setCustomizeCode() {
    const { match } = this.props;
    const { sourceCode } = match.params;
    if (sourceCode === 'ORDER') {
      this.setState({ customizeCode: 'SINV.ACCEPTANCE_APPROVED_DETAIL.ORDER' });
    } else if (sourceCode === 'CONTRACT') {
      this.setState({ customizeCode: 'SINV.ACCEPTANCE_APPROVED_DETAIL.AGREEMENT' });
    } else {
      this.setState({ customizeCode: 'SINV.ACCEPTANCE_APPROVED_DETAIL.LINE' });
    }
  }

  // 查询
  @Bind()
  fetchList(page = {}) {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    const { customizeCode } = this.state;
    dispatch({
      type: 'acceptanceSheetApproved/fetchApproveDetailList',
      payload: {
        id,
        page,
        customizeUnitCode: customizeCode,
      },
    });
  }

  /**
   * 审批详情通过
   */
  @Bind()
  handleDetailApproved() {
    const { dispatch, history } = this.props;
    const {
      acceptanceSheetApproved: { approveHeader = {} },
    } = this.props;
    const values = filterNullValueObject(this.headerInfoForm.getFieldsValue());
    const value = { ...approveHeader, ...values };
    dispatch({
      type: 'acceptanceSheetApproved/approveAcceptance',
      payload: [value],
    }).then((res) => {
      if (res) {
        notification.success();
        history.push({
          pathname: '/sinv/acceptance-sheet-approved/list',
        });
      }
    });
  }

  /**
   * 审批详情拒绝
   */
  @Bind()
  handleDetailReject() {
    const { dispatch, history } = this.props;
    const {
      acceptanceSheetApproved: { approveHeader = {} },
    } = this.props;
    const values =
      this.headerInfoForm && filterNullValueObject(this.headerInfoForm.getFieldsValue());
    const value = { ...approveHeader, ...values };
    dispatch({
      type: 'acceptanceSheetApproved/rejectAcceptance',
      payload: [value],
    }).then((res) => {
      if (res) {
        notification.success();
        history.push({
          pathname: '/sinv/acceptance-sheet-approved/list',
        });
      }
    });
  }

  @Bind()
  handleOperationRecord(flag, id) {
    this.setState({
      operationRecordId: id,
      operationRecordModalVisible: !!flag,
    });
  }

  /**
   * @returns React.element
   * @memberof Reception
   */
  render() {
    const {
      acceptanceSheetApproved: {
        approveDetailList = [],
        approveDetailListPagination = {},
        approveHeader = {},
      },
      match: {
        params: { sourceCode },
      },
      fetchHeaderLoading,
      fetchListLoading,
      approveLoading,
      rejectLoading,
      customizeForm,
      customizeTable,
    } = this.props;
    const headerInfoProps = {
      approveHeader,
      customizeForm,
      // loading: queryDetailHeaderLoading,
      onRef: (node) => {
        this.headerInfoForm = node.props.form;
      },
    };
    const { operationRecordModalVisible, operationRecordId, customizeCode } = this.state;
    const detailInfoProps = {
      sourceCode,
      customizeCode,
      customizeTable,
      loading: fetchListLoading,
      pagination: approveDetailListPagination,
      dataSource: approveDetailList,
      handleSearch: this.fetchList,
      headerInfo: approveHeader,
    };
    const operationRecordProps = {
      operationRecordId,
      visible: operationRecordModalVisible,
      hideModal: () => this.handleOperationRecord(false),
    };
    const uploadProps = {
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-acceptance',
      btnText: intl.get(`hzero.common.upload.view`).d('查看附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      attachmentUUID: approveHeader.attachmentUuid,
      viewOnly: true,
      showFilesNumber: false,
    };
    return (
      <Fragment>
        <Header
          backPath="/sinv/acceptance-sheet-approved/list"
          title={intl.get(`sinv.acceptanceSheetCreate.title.acceptanceDetail`).d('验收单明细')}
        >
          <Button
            type="primary"
            icon="check"
            loading={approveLoading}
            onClick={this.handleDetailApproved}
          >
            {intl.get(`sinv.acceptanceSheet.view.message.Approve`).d('审批通过')}
          </Button>
          <Button icon="close" onClick={this.handleDetailReject} loading={rejectLoading}>
            {intl.get(`sinv.acceptanceSheet.view.message.refuse`).d('审批拒绝')}
          </Button>
          <UploadModal {...uploadProps} />
          <Button
            icon="clock-circle-o"
            onClick={() => this.handleOperationRecord(true, approveHeader.acceptListHeaderId)}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchHeaderLoading}>
            <HeaderInfo {...headerInfoProps} />
            <DeatilList {...detailInfoProps} />
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
