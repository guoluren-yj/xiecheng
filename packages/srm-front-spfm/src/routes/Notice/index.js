/**
 * notice - 公告管理
 * @date: 2018-9-20
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
  Button,
  Table,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Select,
  Popconfirm,
  Tooltip,
  Icon,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
// import Checkbox from 'components/Checkbox';
import cacheComponent from 'components/CacheComponent';
import ValueList from 'components/ValueList';

import { valueMapMeaning, dateRender, yesOrNoRender, dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as ButtonPermission } from 'components/Permission';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DATETIME_MIN,
  DATETIME_MAX,
  DEFAULT_DATETIME_FORMAT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import NoticeReadDetail from './NoticeReadDetail';
import RecordDrawer from './RecordDrawer';

const FormItem = Form.Item;
// const RadioButton = Radio.Button;
// const RadioGroup = Radio.Group;
const { Option } = Select;
@WithCustomize({
  unitCode: ['SPFM.NOTICES.LIST', 'SPFM.NOTICES.QUERY'],
})
@connect(({ loading, notice }) => ({
  notice,
  organizationId: getCurrentOrganizationId(),
  publicLoading: loading.effects['notice/publicNotice'],
  deleteLoading: loading.effects['notice/deleteNotice'],
  fetchNoticeLoading: loading.effects['notice/fetchNotice'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hptl.notice', 'hptl.common', 'spfm.notice', "spfm.configServer", "spfm.registerEnterprise", "spfm.customerConfiguration"] })
@cacheComponent({ cacheKey: '/spfm/notices/list' })
export default class Notice extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isExpendSearch: false,
      showNoticeReadDetail: false,
      showNoticeReadRecord: null,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'notice/init',
    });
    this.fetchNotice({
      containsDeletedDataFlag: 1,
    });
  }

  /**
   * @function fetchEmail - 获取公告列表数据
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 页数
   */
  fetchNotice(params = {}) {
    const {
      dispatch,
      form,
      organizationId,
      notice: { pagination = {} },
    } = this.props;
    // 格式化时间
    const {
      creationDateFrom,
      creationDateTo,
      publishedDateFrom,
      publishedDateTo,
      startDate,
      endDate,
      tenantVisibleFlag,
    } = form.getFieldsValue();
    const dateParams = {
      creationDateFrom:
        creationDateFrom && moment(creationDateFrom).format(DEFAULT_DATETIME_FORMAT),
      creationDateTo: creationDateTo && moment(creationDateTo).format(DEFAULT_DATETIME_FORMAT),
      publishedDateFrom:
        publishedDateFrom && moment(publishedDateFrom).format(DEFAULT_DATETIME_FORMAT),
      publishedDateTo: publishedDateTo && moment(publishedDateTo).format(DEFAULT_DATETIME_FORMAT),
      startDate: startDate && moment(startDate).format(DATETIME_MIN),
      endDate: endDate && moment(endDate).format(DATETIME_MAX),
      withSiteNoticeFlag: Number(tenantVisibleFlag) === 0 ? 0 : 1,
    };
    dispatch({
      type: 'notice/fetchNotice',
      payload: {
        organizationId,
        page: pagination,
        ...form.getFieldsValue(),
        ...dateParams,
        ...params,
        customizeUnitCode: 'SPFM.NOTICES.LIST',
      },
    });
  }

  /**
   * @function handleCreate - 新建
   */
  @Bind()
  handleCreate() {
    const { history } = this.props;
    history.push('/spfm/notices/detail/create');
  }

  /**
   * @function handlePagination - 分页操作
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchNotice({
      page: pagination,
    });
  }

  /**
   *跳转到预览页面
   *
   */
  @Bind()
  handleNoticePreview(record) {
    this.props.history.push({
      pathname: `/spfm/notices/preview/${record.noticeId}/1`,
    });
  }

  /**
   * @function handleExpendSearch - 显示高级查询条件
   * @param {boolean} flag - 显示高级查询标识
   */
  @Bind()
  handleExpendSearch() {
    const { isExpendSearch } = this.state;
    this.setState({ isExpendSearch: !isExpendSearch });
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function handleSearch - 搜索公告
   */
  @Bind()
  handleSearch() {
    this.fetchNotice({ page: {} });
  }

  /**
   * @function handleNoticeTypeChange - 切换类别
   * @param {*} e - 事件对象
   */
  @Bind()
  handleNoticeTypeChange(e) {
    this.fetchNotice({ receiverTypeCode: e.target.value });
  }

  /**
   * 显示详情弹框
   * @param {object} record
   */
  @Bind()
  showModal(record = {}) {
    const { organizationId } = this.props;
    const { noticeId, businessKey } = record;

    Modal.open({
      title: intl.get('spfm.notice.model.notice.actionHistory').d('操作记录'),
      children: (
        <RecordDrawer
          noticeId={noticeId}
          businessKey={businessKey}
          organizationId={organizationId}
        />
      ),
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 720 },
      closable: true,
      okText: intl.get(`hzero.common.status.closed`).d('关闭'),
      onOk: this.hiddenModal,
      footer: (okBtn) => <>{okBtn}</>,
    });
  }

  /**
   * 隐藏详情弹框
   */
  @Bind()
  hiddenModal() {
    this.props.dispatch({
      type: 'notice/updateState',
      payload: {
        noticeHisotryList: [],
        approveHistoryList: [],
      },
    });
  }

  /**
   * @function handlePublicNotice - 发布公告信息
   * @param {string} organizationId - 租户ID
   * @param {object} record - 公告信息行数据
   * @param {string} record.noticeId - 公告信息ID
   */
  @Bind()
  handlePublicNotice(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'notice/publicNotice',
      payload: { ...record, noticeCondClearFlag: 0 },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchNotice();
      }
    });
  }

  /**
   * @function handleRevokeNotice - 撤销删除公告信息
   * @param {string} organizationId - 租户ID
   * @param {object} record - 公告信息行数据
   * @param {string} record.noticeId - 公告信息ID
   */
  @Bind()
  handleRevokeNotice(record) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'notice/revokeNotice',
      payload: { organizationId, noticeId: record.noticeId, record },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchNotice({
          containsDeletedDataFlag: 1,
        });
      }
    });
  }

  /**
   * @function handleDeleteNotice - 删除公告信息
   * @param {string} organizationId - 租户ID
   * @param {object} record - 公告信息行数据
   * @param {string} record.noticeId - 公告信息ID
   */
  @Bind()
  handleDeleteNotice(record = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'notice/deleteNotice',
      payload: { organizationId, ...record },
    }).then((res) => {
      if (res) {
        notification.success();
        // this.fetchNoticeCountDelete(record.noticeId);
        this.fetchNotice();
      }
    });
  }

  @Bind()
  fetchNoticeCountDelete(noticeId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'notice/fetchNoticeCountDelete',
      payload: {
        noticeId,
      },
    });
  }

  @Bind()
  showRecordReadDetail(record) {
    this.setState({
      showNoticeReadDetail: true,
      showNoticeReadRecord: record,
    });
  }

  @Bind()
  handleCloseNoticeRecordDetail() {
    this.setState({
      showNoticeReadDetail: false,
      showNoticeReadRecord: null,
    });
    this.props.dispatch({
      type: 'notice/updateState',
      payload: {
        noticeReadPurchaseList: [],
        noticeReadPurchasePagination: {},
        noticeUnReadPurchaseList: [],
        noticeUnReadPurchasePagination: {},
        noticeReadSupplierList: [],
        noticeReadSupplierPagination: {},
        noticeUnReadSupplierList: [],
        noticeUnReadSupplierPagination: {},
      },
    });
  }

  /**
   * @function renderFilterForm - 渲染筛选查询表单
   */
  @Bind()
  renderFilterForm() {
    const {
      form,
      customizeFilterForm,
      notice: { noticeCategory = [], noticeStatus = [], noticeObject = [], langObject = [] },
    } = this.props;
    const { getFieldDecorator } = form;
    const { isExpendSearch } = this.state;
    return customizeFilterForm(
      {
        code: 'SPFM.NOTICES.QUERY',
        form,
        expand: isExpendSearch,
      },
      <Form>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.title').d('公告标题')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('title')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.pageStatusCode').d('公告状态')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pageStatusCode')(
                    <Select allowClear style={{ width: '100%' }}>
                      {noticeStatus.map((item) => {
                        return (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.noticeTypeCode').d('公告类别')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('noticeTypeCode')(
                    <Select allowClear style={{ width: '100%' }}>
                      {noticeCategory.map((item) => {
                        return (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isExpendSearch ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.create').d('创建人')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('realName')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('hzero.common.date.active.from').d('有效日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('startDate')(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={DATETIME_MIN}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('endDate') &&
                        moment(form.getFieldValue('endDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('hzero.common.date.active.to').d('有效日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('endDate')(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={DATETIME_MAX}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('startDate') &&
                        moment(form.getFieldValue('startDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('hzero.common.date.release.from').d('发布日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishedDateFrom')(
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('publishedDateTo') &&
                        moment(form.getFieldValue('publishedDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('hzero.common.date.release.to').d('发布日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishedDateTo')(
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('publishedDateFrom') &&
                        moment(form.getFieldValue('publishedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.noticeCategoryCode').d('公告对象')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('noticeCategoryCode')(
                    <Select allowClear style={{ width: '100%' }}>
                      {noticeObject.map((item) => {
                        return (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.lang').d('语言')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('lang')(
                    <Select allowClear style={{ width: '100%' }}>
                      {langObject.map((item) => {
                        return (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.platformNotice').d('平台级公告')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('tenantVisibleFlag')(
                    <ValueList lovCode="HPFM.FLAG" allowClear style={{ width: '100%' }} />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.systemVersion').d('系统版本')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('versionNumber')(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleExpendSearch}>
                {isExpendSearch
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      fetchNoticeLoading,
      publicLoading,
      deleteLoading,
      notice: {
        noticeList = [],
        pagination = {},
        noticeCategory = [],
        // noticeHisotrypagination = [],
      },
      customizeTable,
    } = this.props;
    const { showNoticeReadDetail = false, showNoticeReadRecord = {} } = this.state;

    const columns = [
      {
        title: intl.get('hzero.common.view.orderSeq').d('排序号'),
        width: 100,
        dataIndex: 'lineNum',
      },
      {
        title: intl.get('spfm.notice.model.notice.title').d('公告标题'),
        dataIndex: 'title',
        width: 250,
        render: (val, record) => <a onClick={() => this.handleNoticePreview(record)}>{val}</a>,
      },
      {
        title: intl.get('spfm.notice.model.notice.pageStatusMeaning').d('状态'),
        width: 100,
        dataIndex: 'pageStatusMeaning',
      },
      {
        title: intl.get('spfm.notice.model.notice.lang').d('语言'),
        width: 100,
        dataIndex: 'langMeaning',
      },
      {
        title: intl.get('spfm.notice.model.notice.noticeTypeMeaning').d('公告类别'),
        width: 100,
        dataIndex: 'noticeTypeCode',
        render: (val) => valueMapMeaning(noticeCategory, val),
      },
      {
        title: intl.get('spfm.notice.model.notice.noticeCategoryMeaning').d('公告对象'),
        width: 100,
        dataIndex: 'noticeCategoryMeaning',
      },
      {
        title: (
          <Tooltip
            title={
              <>
                {intl.get('spfm.notice.model.notice.publicNotInTooltip').d('公开不记录公告阅读量')}
                <br />
                {intl
                  .get('spfm.notice.model.notice.readCountsTooltip')
                  .d('非公开公告按照登录后子账户记录阅读量')}
              </>
            }
          >
            {intl.get('spfm.notice.model.notice.readRecord').d('阅读记录')}
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'readTime',
        render: (val, record) => {
          if (record.noticeCategoryCode === 'PUBLIC' || record.tenantVisibleFlag === 1) {
            return '-';
          }
          if (['OGYS', 'OBUYER', 'OCGF', "OROLES"].includes(record.noticeCategoryCode)) {
            if (record.totalReadCount) {
              return (
                <a onClick={() => this.showRecordReadDetail(record)}>
                  {`${val || 0}/${record.totalReadCount}`}
                </a>
              );
            } else {
              return <a onClick={() => this.showRecordReadDetail(record)}>{`${val || 0}`}</a>;
            }
          }
          return val;
        },
      },
      {
        title: intl.get('hzero.common.date.active.from').d('有效日期从'),
        width: 120,
        dataIndex: 'startDate',
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.date.active.to').d('有效日期至'),
        width: 120,
        dataIndex: 'endDate',
        render: dateRender,
      },
      {
        title: intl.get('spfm.notice.model.notice.create').d('创建人'),
        width: 150,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.notice.model.notice.publishedDate').d('发布日期'),
        width: 150,
        dataIndex: 'publishedDate',
        render: dateTimeRender,
      },
      {
        title: (
          <Tooltip
            title={intl
              .get('spfm.notice.model.notice.platformNoticeTip')
              .d(
                '此类公告由平台层统一发布，一般用于迭代更新内容发布或重大通知，租户层仅做留档查看'
              )}
          >
            {intl.get('spfm.notice.model.notice.platformNotice').d('平台级公告')}
            <Icon type="question-circle-o" style={{ marginLeft: 6 }} />
          </Tooltip>
        ),
        width: 150,
        dataIndex: 'tenantVisibleFlag',
        render: (val) => {
          return yesOrNoRender(val || 0);
        },
      },
      {
        title: intl.get('spfm.notice.model.notice.systemVersion').d('系统版本'),
        width: 100,
        dataIndex: 'versionNumber',
        render: (val) => val||"-",
      },
      {
        title: intl.get('spfm.notice.model.notice.actionHistory').d('操作记录'),
        dataIndex: 'actionHistory',
        // width: 100,
        render: (_, record) => {
          const { tenantVisibleFlag } = record;
          const showFlag = tenantVisibleFlag !== 1;
          return showFlag ? (
            <a onClick={() => this.showModal(record)}>
              {intl.get('spfm.notice.model.notice.actionHistory').d('操作记录')}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        width: 200,
        fixed: 'right',
        render: (text, record) => {
          const { tenantVisibleFlag } = record;
          const showFlag = tenantVisibleFlag !== 1;
          return showFlag ? (
            <span className="action-link">
              {(record.statusCode === 'NEW' || record.statusCode === 'WORKFLOW_CANCEL') &&
                record.pageStatusCode === 'DRAFT' &&
                isEmpty(record.publishedDate) && (
                  <React.Fragment>
                    <Link to={`/spfm/notices/detail/${record.noticeId}`}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </Link>
                    <Popconfirm
                      title={intl.get('hzero.common.message.confirm.publish').d('是否发布此条公告')}
                      onConfirm={() => {
                        this.handlePublicNotice(record);
                      }}
                    >
                      <a>{intl.get('hzero.common.button.release').d('发布')}</a>
                    </Popconfirm>
                    <Popconfirm
                      title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                      onConfirm={() => {
                        this.handleDeleteNotice(record);
                      }}
                    >
                      <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                    </Popconfirm>
                  </React.Fragment>
                )}
              {record.statusCode === 'WORKFLOW_REJECTED' &&
                record.pageStatusCode === 'APPROVE_REJECT' && (
                  <React.Fragment>
                    <Link to={`/spfm/notices/detail/${record.noticeId}`}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </Link>
                    <Popconfirm
                      title={intl.get('hzero.common.message.confirm.publish').d('是否发布此条公告')}
                      onConfirm={() => {
                        this.handlePublicNotice(record);
                      }}
                    >
                      <a>{intl.get('hzero.common.button.release').d('发布')}</a>
                    </Popconfirm>
                    {isEmpty(record.publishedDate) && (
                      <Popconfirm
                        title={intl
                          .get('hzero.common.message.confirm.delete')
                          .d('是否删除此条记录')}
                        onConfirm={() => {
                          this.handleDeleteNotice(record);
                        }}
                      >
                        <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                      </Popconfirm>
                    )}
                  </React.Fragment>
                )}
              {(record.statusCode === 'NEW' || record.statusCode === 'WORKFLOW_CANCEL') &&
                record.pageStatusCode === 'DRAFT' &&
                !isEmpty(record.publishedDate) && (
                  <React.Fragment>
                    <Link to={`/spfm/notices/detail/${record.noticeId}`}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </Link>
                    <Popconfirm
                      title={intl.get('hzero.common.message.confirm.publish').d('是否发布此条公告')}
                      onConfirm={() => {
                        this.handlePublicNotice(record);
                      }}
                    >
                      <a>{intl.get('hzero.common.button.release').d('发布')}</a>
                    </Popconfirm>
                  </React.Fragment>
                )}
              {record.statusCode === 'RELEASED' && record.pageStatusCode === 'WAIT_EXHIBIT' && (
                <React.Fragment>
                  <a onClick={() => this.handleRevokeNotice(record)}>
                    {intl.get('hzero.common.button.revoke').d('撤销')}
                  </a>
                </React.Fragment>
              )}
              {record.statusCode === 'RELEASED' && record.pageStatusCode === 'EXHIBITING' && (
                <React.Fragment>
                  <a onClick={() => this.handleRevokeNotice(record)}>
                    {intl.get('hzero.common.button.revoke').d('撤销')}
                  </a>
                </React.Fragment>
              )}
              {record.statusCode === 'RELEASED' && record.pageStatusCode === 'EXPIRED' && (
                <React.Fragment>
                  <Link to={`/spfm/notices/detail/${record.noticeId}`}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Link>
                </React.Fragment>
              )}
              {record.statusCode === 'REVOKED' && record.pageStatusCode === 'DRAFT' && (
                <React.Fragment>
                  <Link to={`/spfm/notices/detail/${record.noticeId}`}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Link>
                  <Popconfirm
                    title={intl.get('hzero.common.message.confirm.publish').d('是否发布此条公告')}
                    onConfirm={() => {
                      this.handlePublicNotice(record);
                    }}
                  >
                    <a>{intl.get('hzero.common.button.release').d('发布')}</a>
                  </Popconfirm>
                </React.Fragment>
              )}
            </span>
          ) : (
            '-'
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.notice.view.message.title.list').d('公告管理')}>
          <ButtonPermission
            permissionList={[
              {
                code: 'srm.bg.manager.portal.notice.button.create',
                type: 'button',
                meaning: '公告管理-新建',
              },
            ]}
            type="primary"
            onClick={this.handleCreate}
          >
            {intl.get('spfm.notice.button.createNotice').d('创建公告')}
          </ButtonPermission>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          {customizeTable(
            {
              code: 'SPFM.NOTICES.LIST',
            },
            <Table
              bordered
              rowKey="noticeId"
              loading={fetchNoticeLoading || publicLoading || deleteLoading}
              dataSource={noticeList}
              columns={columns}
              scroll={{ x: tableScrollWidth(columns) }}
              pagination={pagination}
              onChange={this.handlePagination}
            />
          )}
        </Content>
        {showNoticeReadDetail && (
          <NoticeReadDetail
            record={showNoticeReadRecord}
            onClose={this.handleCloseNoticeRecordDetail}
          />
        )}
      </React.Fragment>
    );
  }
}
