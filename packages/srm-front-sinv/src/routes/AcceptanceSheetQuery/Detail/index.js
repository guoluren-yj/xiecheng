/**
 * index - 验收单详情
 * @date: 2019-11-19
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import UploadModal from 'components/Upload/index';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz';

import HeaderInfo from './Header';
import DeatilList from './DeatilList';
import OperationRecord from '../../components/AcceptanceOperation';

/**
 * 验收单详情界面
 *
 * @export
 * @class Reception - 详情界面
 * @extends {Component} - React.Component
 * @reactProps {object} acceptanceSheetQuery - 数据源
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
@connect(({ loading, acceptanceSheetQuery }) => ({
  fetchLoading: loading.effects['acceptanceSheetQuery/fetchDetailList'],
  fetchHeaderLoading: loading.effects['acceptanceSheetQuery/fetchHeader'],
  resyncAcceptanceLoading: loading.effects['acceptanceSheetQuery/resyncAcceptance'],
  acceptanceSheetQuery,
}))
@formatterCollections({
  code: [
    'sinv.acceptanceSheetQuery',
    'sinv.acceptanceApproved',
    'sinv.acceptanceSheetCreate',
    'sinv.acceptance',
    'entity.supplier',
    'entity.item',
    'sinv.common',
    'entity.company',
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
      type: 'acceptanceSheetQuery/fetchHeader',
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
      type: 'acceptanceSheetQuery/fetchDetailList',
      payload: {
        id,
        page,
        customizeUnitCode: customizeCode,
      },
    });
  }

  @Bind()
  handleOperationRecord(flag, id) {
    this.setState({
      operationRecordId: id,
      operationRecordModalVisible: !!flag,
    });
  }

  // 重新同步
  @Bind()
  resyncAcceptance() {
    const { dispatch, acceptanceSheetQuery = {} } = this.props;
    const { header } = acceptanceSheetQuery;
    dispatch({
      type: 'acceptanceSheetQuery/resyncAcceptance',
      payload: header,
    }).then((res) => {
      if (res) {
        this.handleSearch();
        notification.success();
      }
    });
  }

  /**
   * @returns React.element
   * @memberof Reception
   */
  render() {
    const {
      acceptanceSheetQuery: {
        detailHeaderDataSource = [],
        detailHeaderDataPagination = {},
        header = {},
      },
      match: {
        params: { sourceCode },
        path,
      },
      fetchLoading,
      fetchHeaderLoading,
      customizeForm,
      customizeTable,
      resyncAcceptanceLoading,
    } = this.props;
    const { operationRecordId, operationRecordModalVisible, customizeCode } = this.state;

    const headerInfoProps = {
      header,
      customizeForm,
    };
    const detailInfoProps = {
      customizeCode,
      customizeTable,
      loading: fetchLoading,
      pagination: detailHeaderDataPagination,
      dataSource: detailHeaderDataSource,
      headerInfo: header,
      handleSearch: this.fetchList,
      sourceCode,
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
        type: 'primary',
      },
      attachmentUUID: header.attachmentUuid,
      viewOnly: true,
      showFilesNumber: false,
    };
    const headerFlag = path !== '/pub/sinv/acceptance-sheet-query/detail/:id/:sourceCode';
    return (
      <Fragment>
        {headerFlag ? (
          <Header
            backPath="/sinv/acceptance-sheet-query/list"
            title={intl.get(`sinv.acceptanceApproved.view.message.detail`).d('验收单查询')}
          >
            <UploadModal {...uploadProps} />
            <Button
              icon="clock-circle-o"
              onClick={() => this.handleOperationRecord(true, header.acceptListHeaderId)}
            >
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </Button>
            {header.erpSyncStatus === 'FAIL' && (
              <Button
                icon="sync"
                // disabled={!(detailHeaderInfo.closeSyncStatus === 'FAIL')}
                loading={resyncAcceptanceLoading}
                onClick={this.resyncAcceptance}
              >
                {intl.get(`sinv.common.view.button.resync`).d('重新同步')}
              </Button>
            )}
          </Header>
        ) : (
          ''
        )}
        <Content>
          <Spin spinning={fetchHeaderLoading}>
            {!headerFlag ? (
              <h2>{intl.get(`sinv.acceptanceApproved.view.message.detail`).d('验收单查询')}</h2>
            ) : (
              ''
            )}
            <HeaderInfo {...headerInfoProps} />
            <DeatilList {...detailInfoProps} />
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
