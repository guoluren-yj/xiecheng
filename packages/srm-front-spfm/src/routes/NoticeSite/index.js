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
  Modal,
  // Tooltip,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
// import Checkbox from 'components/Checkbox';
import cacheComponent from 'components/CacheComponent';
import ValueList from 'components/ValueList';

import { dateTimeRender, valueMapMeaning, yesOrNoRender } from 'utils/renderer';

import notification from 'utils/notification';
import { getCurrentOrganizationId, getDateTimeFormat, tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DEFAULT_DATETIME_FORMAT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';

const FormItem = Form.Item;
// const RadioButton = Radio.Button;
// const RadioGroup = Radio.Group;
const { Option } = Select;

@connect(({ loading, noticeSite }) => ({
  noticeSite,
  organizationId: getCurrentOrganizationId(),
  publicLoading: loading.effects['noticeSite/publicNotice'],
  fetchNoticeLoading: loading.effects['noticeSite/fetchNotice'],
  historyLoading: loading.effects['noticeSite/NoticeHistory'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hptl.notice', 'hptl.common', 'entity.customer', 'spfm.notice'] })
@cacheComponent({ cacheKey: '/spfm/noticeSite/list' })
export default class NoticeSite extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isExpendSearch: false,
      actionNoticeId: '',
      visibleModal: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'noticeSite/init',
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
      noticeSite: { pagination = {} },
    } = this.props;
    // 格式化时间
    const {
      creationDateFrom,
      creationDateTo,
      publishedDateFrom,
      publishedDateTo,
      startDate,
      endDate,
    } = form.getFieldsValue();
    const dateParams = {
      creationDateFrom:
        creationDateFrom && moment(creationDateFrom).format(DEFAULT_DATETIME_FORMAT),
      creationDateTo: creationDateTo && moment(creationDateTo).format(DEFAULT_DATETIME_FORMAT),
      publishedDateFrom:
        publishedDateFrom && moment(publishedDateFrom).format(DEFAULT_DATETIME_FORMAT),
      publishedDateTo: publishedDateTo && moment(publishedDateTo).format(DEFAULT_DATETIME_FORMAT),
      startDate: startDate && moment(startDate).format(DEFAULT_DATETIME_FORMAT),
      endDate: endDate && moment(endDate).format(DEFAULT_DATETIME_FORMAT),
    };
    dispatch({
      type: 'noticeSite/fetchNotice',
      payload: {
        organizationId,
        page: pagination,
        ...form.getFieldsValue(),
        ...dateParams,
        ...params,
      },
    });
  }

  /**
   * @function handleCreate - 新建
   */
  @Bind()
  handleCreate() {
    const { history } = this.props;
    history.push('/spfm/noticeSite/detail/create');
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
      pathname: `/spfm/noticeSite/preview/${record.noticeId}/1`,
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
    const { noticeId } = record;
    this.setState(
      {
        visibleModal: true,
        actionNoticeId: noticeId,
      },
      () => {
        this.handleHistory();
      }
    );
  }

  /**
   * 隐藏详情弹框
   */
  @Bind()
  hiddenModal() {
    this.setState({
      visibleModal: false,
    });
    this.props.dispatch({
      type: 'noticeSite/updateState',
      payload: {
        noticeHisotryList: [],
      },
    });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleHistory(page = {}) {
    const { dispatch, organizationId } = this.props;
    const { actionNoticeId } = this.state;
    // 操作记录数据
    dispatch({
      type: 'noticeSite/NoticeHistory',
      payload: {
        page,
        organizationId,
        noticeId: actionNoticeId,
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
    this.setState({ actionNoticeId: record.noticeId });
    dispatch({
      type: 'noticeSite/publicNotice',
      payload: { ...record },
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
      type: 'noticeSite/revokeNotice',
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
      type: 'noticeSite/deleteNotice',
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

  /**
   * @function renderFilterForm - 渲染筛选查询表单
   */
  @Bind()
  renderFilterForm() {
    const {
      form,
      noticeSite: { noticeCategory = [], noticeStatus = [], langObject = [] },
    } = this.props;
    const { getFieldDecorator } = form;
    const { isExpendSearch } = this.state;
    return (
      <Form>
        {/* <Row type="flex" justify="start">
          <Col>
            <FormItem>
              {getFieldDecorator('receiverTypeCode', {
                initialValue: '',
              })(
                <RadioGroup onChange={this.handleNoticeTypeChange}>
                  <RadioButton value="">
                    {intl.get('hptl.notice.model.notice.receiverTypeCode.All').d('全部公告')}
                  </RadioButton>
                  {noticeReceiverType.map(item => {
                    return (
                      <RadioButton value={item.value} key={item.value}>
                        {item.meaning}
                      </RadioButton>
                    );
                  })}
                </RadioGroup>
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              style={{ display: 'flex', justifyContent: 'start', marginLeft: 12 }}
              label={intl.get('hptl.notice.model.notice.containsDeletedDataFlag').d('显示已删除')}
            >
              {getFieldDecorator('containsDeletedDataFlag', {
                initialValue: 1,
              })(<Checkbox />)}
            </FormItem>
          </Col>
        </Row> */}
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
                      showTime
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('creationDateTo') &&
                        moment(form.getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
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
                      showTime
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('creationDateFrom') &&
                        moment(form.getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isExpendSearch ? 'block' : 'none' }}>
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
                      format={getDateTimeFormat()}
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
                      format={getDateTimeFormat()}
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
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isExpendSearch ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.notice.model.notice.tenantVisible').d('租户级可查询')}
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
      historyLoading,
      noticeSite: {
        noticeList = [],
        pagination = {},
        noticeHisotryList = [],
        noticeCategory = [],
        // noticeHisotrypagination = [],
      },
    } = this.props;
    const { visibleModal } = this.state;

    const actionColumns = [
      {
        title: intl.get('spfm.notice.model.actionDetail.realName').d('操作人'),
        width: 150,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.notice.model.actionDetail.processStatusMeaning').d('动作'),
        width: 80,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('spfm.notice.model.actionDetail.processDate').d('操作时间'),
        width: 150,
        dataIndex: 'processDate',
      },
    ];

    const columns = [
      {
        title: intl.get('spfm.notice.model.notice.noticeCode').d('公告编码'),
        dataIndex: 'noticeCode',
        width: 150,
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
      // {
      //   title: (
      //     <Tooltip
      //       title={
      //         <>
      //           {intl.get('spfm.notice.model.notice.publicNotInTooltip').d('公开不记录公告阅读量')}
      //           <br />
      //           {intl
      //             .get('spfm.notice.model.notice.readCountsTooltip')
      //             .d('非公开公告按照登录后子账户记录阅读量')}
      //         </>
      //       }
      //     >
      //       {intl.get('spfm.notice.model.notice.readTime').d('阅读量')}
      //     </Tooltip>
      //   ),
      //   width: 100,
      //   dataIndex: 'readTime',
      // },
      {
        title: intl.get('hzero.common.date.active.from').d('有效日期从'),
        width: 120,
        dataIndex: 'startDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.date.active.to').d('有效日期至'),
        width: 120,
        dataIndex: 'endDate',
        render: dateTimeRender,
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
        title: intl.get('spfm.notice.model.notice.tenantVisible').d('租户级可查询'),
        width: 150,
        dataIndex: 'tenantVisibleFlag',
        render: yesOrNoRender,
      },
      {
        title: intl.get('spfm.notice.model.notice.systemVersion').d('系统版本'),
        width: 100,
        dataIndex: 'versionNumber',
        render: (value)=>value||"-",
      },
      {
        title: intl.get('spfm.notice.model.notice.actionHistory').d('操作记录'),
        dataIndex: 'actionHistory',
        // width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => this.showModal(record)}>
              {intl.get('spfm.notice.model.notice.actionHistory').d('操作记录')}
            </a>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        fixed: 'right',
        render: (text, record) => {
          return (
            <span className="action-link">
              {['NEW', 'REVOKED'].includes(record.statusCode) &&
                record.pageStatusCode === 'DRAFT' && ( // 草稿
                  <React.Fragment>
                    <Link to={`/spfm/noticeSite/detail/${record.noticeId}`}>
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
                    {record.statusCode === 'NEW' && isEmpty(record.publishedDate) && (
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
              {record.statusCode === 'RELEASED' &&
                record.pageStatusCode === 'WAIT_EXHIBIT' && ( // 待展出
                  <React.Fragment>
                    <Link to={`/spfm/noticeSite/detail/${record.noticeId}`}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </Link>
                    <a onClick={() => this.handleRevokeNotice(record)}>
                      {intl.get('hzero.common.button.revoke').d('撤销')}
                    </a>
                  </React.Fragment>
                )}
              {record.statusCode === 'RELEASED' &&
                record.pageStatusCode === 'EXHIBITING' && ( // 展出中
                  <React.Fragment>
                    <a onClick={() => this.handleRevokeNotice(record)}>
                      {intl.get('hzero.common.button.revoke').d('撤销')}
                    </a>
                  </React.Fragment>
                )}
              {record.statusCode === 'RELEASED' &&
                record.pageStatusCode === 'EXPIRED' && ( // 已过期
                  <React.Fragment>
                    <Link to={`/spfm/noticeSite/detail/${record.noticeId}`}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </Link>
                  </React.Fragment>
                )}
              {/* <Link to={`/spfm/notices/detail/${record.noticeId}`}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Link>
              {record.statusCode === 'DELETED' ? (
                <a onClick={() => this.handleRevokeNotice(record)}>
                  {intl.get('hptl.common.button.revoke').d('撤销')}
                </a>
              ) : (
                <React.Fragment>
                  {publicLoading && record.noticeId === actionNoticeId ? (
                    <Icon type="loading" />
                  ) : (
                    <a onClick={() => this.handlePublicNotice(record)}>
                      {intl.get('hzero.common.button.release').d('发布')}
                    </a>
                  )}
                  <Popconfirm
                    title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                    onConfirm={() => {
                      this.handleDeleteNotice(record);
                    }}
                  >
                    <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                  </Popconfirm>
                </React.Fragment>
              )} */}
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.notice.view.message.title.list').d('公告管理')}>
          <Button type="primary" onClick={this.handleCreate}>
            {intl.get('spfm.notice.button.createNotice').d('创建公告')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            rowKey="noticeId"
            loading={fetchNoticeLoading}
            dataSource={noticeList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
        </Content>
        {visibleModal && (
          <Modal
            destroyOnClose
            title={intl.get('spfm.notice.model.notice.actionHistory').d('操作记录')}
            visible={visibleModal}
            width={500}
            onCancel={this.hiddenModal}
            footer={null}
          >
            <Table
              bordered
              loading={historyLoading}
              dataSource={noticeHisotryList}
              columns={actionColumns}
              onChange={this.handleHistory}
              pagination={false}
            />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
