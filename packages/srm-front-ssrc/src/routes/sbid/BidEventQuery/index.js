/**
 * BidEventQuery - 招标事件查询入口界面
 * @date: 2019-7-11
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { routerRedux } from 'dva/router';
import queryString from 'querystring';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender, valueMapMeaning, dateTimeRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE } from '@/utils/SsrcRegx';
import FilterForm from './FilterForm';
import OperationRecord from '../components/OperationRecord';

@withCustomize({
  unitCode: ['SSRC.BID_EVENT_LIST.LIST', 'SSRC.BID_EVENT_LIST.HEADER_BUTTON'],
})
@formatterCollections({ code: ['ssrc.bidEventQuery', 'ssrc.common', 'ssrc.qualiExam'] })
@connect(({ bidEventQuery, commonModel, loading }) => ({
  bidEventQuery,
  commonModel,
  fetchDataLoading: loading.effects['bidEventQuery/fetchDataList'], // 列表数据
  organizationId: getCurrentOrganizationId(),
}))
export default class BidEventQuery extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    operationRecordModalVisible: false, // 操作记录模态框
    bidHeaderId: null,
    attachmentUuid: '', // 行数据上点击上传时候的uuid
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      bidEventQuery: { bidEventQueryPagination = {} },
    } = this.props;
    this.handleSearch(bidEventQueryPagination);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      bidStatus: 'SSRC.BID_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      quotationType: 'SSRC.QUOTATION_TYPE', // 投标方式
      bidType: 'SSRC.BID_TYPE', // 招标类别
    };
    dispatch({
      type: 'bidEventQuery/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  operationRender(record) {
    const { organizationId, dispatch } = this.props;
    const page = {};
    this.setState({
      operationRecordModalVisible: true,
      bidHeaderId: record.bidHeaderId,
    });
    dispatch({
      type: 'commonModel/operationRecord',
      payload: {
        page,
        organizationId,
        bidHeaderId: record.bidHeaderId,
      },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    dispatch({
      type: 'bidEventQuery/fetchDataList',
      payload: {
        page,
        ...handleFormValues,
        organizationId,
        customizeUnitCode: 'SSRC.BID_EVENT_LIST.LIST',
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['bidCreateStartDate'];
    const timeToArray = ['bidCreateEndDate'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 点击招标编号跳转到明细页面
   */
  @Bind()
  inquiryDetail(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-bid-query/bid-update/${record.bidHeaderId}`,
        search: queryString.stringify({
          source: record.subjectMatterRule,
          lastPath: 'bidEventQuery',
        }),
      })
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'commonModel/updateState',
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  /**
   * afterOpenUploadModal
   * 打开模态框的时候存储UUID
   */
  @Bind()
  afterOpenUploadModal(attachmentUuid) {
    this.setState({
      attachmentUuid,
    });
  }

  /**
   * uploadSuccess
   * 回调成功传递uuid
   */
  @Bind()
  uploadSuccess(record) {
    const { attachmentUuid } = this.state;
    const organizationId = getCurrentOrganizationId();
    const params = {
      archiveAttachmentUuid: attachmentUuid,
      bidHeaderId: record.bidHeaderId,
      organizationId,
    };
    const { dispatch } = this.props;
    dispatch({
      type: 'bidEventQuery/uploadAttachement',
      payload: params,
    });
  }

  /**
   * 价格 - 导出
   */

  @Bind()
  handleGetFormValue() {
    const values = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form && this.form.getFieldsValue());
    const queryParams = {
      ...values,
      bidCreateStartDate: values.bidCreateStartDate
        ? moment(values.bidCreateStartDate).format(DATETIME_MIN)
        : undefined,
      bidCreateEndDate: values.bidCreateEndDate
        ? moment(values.bidCreateEndDate).format(DATETIME_MAX)
        : undefined,
    };
    return queryParams;
  }

  render() {
    const {
      fetchDataLoading,
      dispatch,
      organizationId,
      customizeTable,
      bidEventQuery: {
        bidEventQueryList = [],
        bidEventQueryPagination = {},
        code: {
          sourceMethod = [],
          bidStatus = [],
          auctionDirection = [],
          quotationType = [],
          bidType = [],
        },
      },
      commonModel: { operationPagination = {}, operationData = [] },
      customizeBtnGroup = () => {},
    } = this.props;
    const { operationRecordModalVisible, bidHeaderId } = this.state;
    const formProps = {
      sourceMethod,
      bidStatus,
      auctionDirection,
      quotationType,
      bidType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    // 操作记录
    const operationRecordProps = {
      dispatch,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
      bidHeaderId,
    };
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'bidStatus',
        width: 100,
        fixed: 'left',
        render: (val) => valueMapMeaning(bidStatus, val),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidNum`).d('招标编号'),
        dataIndex: 'bidNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => this.inquiryDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidTitle`).d('招标事项'),
        dataIndex: 'bidTitle',
        width: 120,
        fixed: 'left',
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.bidEventQuery.model.bidHall.applicationDeadline`)
          .d('资格预审截止时间'),
        dataIndex: 'prequalEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.quotationStartTime`).d('投标开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.QuotationDeadLine`).d('投标截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidOpenDate`).d('开标时间'),
        dataIndex: 'bidOpenDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.preQualification`).d('资格预审'),
        dataIndex: 'preQualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get('hzero.common.components.dataAudit.version').d('版本'),
        dataIndex: 'versionNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidType`).d('招标类别'),
        dataIndex: 'bidTypeMeaning',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.tenderName`).d('招标员'),
        dataIndex: 'tenderName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.Archive`).d('归档文件'),
        dataIndex: 'archiveAttachmentUuid',
        width: 150,
        render: (_, record) => {
          if (record.createFlag) {
            return (
              <UploadModal
                filePreview
                bucketName={PRIVATE_BUCKET}
                fileSize={FIlESIZE}
                attachmentUUID={record.archiveAttachmentUuid}
                text={intl.get(`ssrc.qualiExam.model.button.upload`).d('上传附件')}
                afterOpenUploadModal={this.afterOpenUploadModal}
                uploadSuccess={() => this.uploadSuccess(record)}
              />
            );
          } else {
            return (
              <UploadModal
                filePreview
                bucketName={PRIVATE_BUCKET}
                viewOnly
                fileSize={FIlESIZE}
                attachmentUUID={record.archiveAttachmentUuid}
                text={intl.get(`ssrc.qualiExam.model.bidHall.uploadFile`).d('上传附件')}
              />
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.operateRecord`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.operationRender(record)}>
            {intl.get(`ssrc.bidEventQuery.view.message.button.operateRecord`).d('操作记录')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.bidEventQuery.view.message.title.bidEventQuery`).d('招标事件查询')}
        >
          {customizeBtnGroup({ code: 'SSRC.BID_EVENT_LIST.HEADER_BUTTON' }, [
            <ExcelExport
              requestUrl={`/ssrc/v1/${organizationId}/bid/list/all/excel`}
              queryParams={this.handleGetFormValue()}
              buttonText={intl.get('hzero.common.button.priceExport').d('批量导出')}
              name="export"
            />,
            <ExcelExportNew
              templateCode="SSRC_BID_EVENT_EXPORT"
              requestUrl={`/ssrc/v1/${organizationId}/bid/list/all/excel`}
              queryParams={this.handleGetFormValue()}
              buttonText={intl.get('hzero.common.button.priceExportNew').d('(新)批量导出')}
              icon="unarchive"
              otherButtonProps={{
                permissionList: [
                  {
                    code: `${this.props.match.path}.button.batch-export-new`,
                    type: 'button',
                    meaning:
                      intl
                        .get(`ssrc.bidEventQuery.view.message.title.bidEventQuery`)
                        .d('招标事件查询') -
                      intl.get('hzero.common.button.priceExportNew').d('(新)批量导出'),
                  },
                ],
              }}
              name="newExport"
            />,
          ])}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          {customizeTable(
            {
              code: 'SSRC.BID_EVENT_LIST.LIST',
            },
            <Table
              bordered
              loading={fetchDataLoading}
              rowKey="resultId"
              columns={columns}
              dataSource={bidEventQueryList}
              pagination={bidEventQueryPagination}
              onChange={this.handleSearch}
              scroll={{ x: this.scrollWidth(columns, 0) }}
            />
          )}
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
