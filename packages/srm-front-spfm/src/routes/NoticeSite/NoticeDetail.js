/**
 * notice - 公告管理-详情页面
 * @date: 2018-9-20
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNull, isUndefined } from 'lodash';
import moment from 'moment';
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Select,
  Modal,
  Table,
  Card,
  Tabs,
  Tooltip,
  Icon,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import qs from 'querystring';
import { openTab } from 'utils/menuTab';
// import TinymceEditor from 'components/TinymceEditor';
import RichTextEditor from 'components/RichTextEditor';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';
import Checkbox from 'components/Checkbox';

import {
  DETAIL_EDIT_FORM_CLASSNAME,
  DETAIL_CARD_CLASSNAME,
  DATETIME_MIN,
  DATETIME_MAX,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import AddMailRecipient from './AddMailRecipient';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
@formatterCollections({ code: 'spfm.notice' })
@Form.create({ fieldNameProp: null })
@connect(({ loading, noticeSite }) => ({
  noticeSite,
  createNoticeLoading: loading.effects['noticeSite/createNotice'],
  updateNoticeLoading: loading.effects['noticeSite/updateNotice'],
  publicNoticeLoading: loading.effects['noticeSite/publicNotice'],
  historyLoading: loading.effects['noticeSite/NoticeHistory'],
  queryNoticeLoading: loading.effects['noticeSite/queryNotice'],
  deleteNoticeLoading: loading.effects['noticeSite/deleteNotice'],
  fetchNoticeTenantLoading: loading.effects['noticeSite/fetchNoticeTenant'],
  fetchUdtTenantLoading: loading.effects['noticeSite/fetchUdtTenant'],
  addTenantLoading: loading.effects['noticeSite/addTenant'],
  removeTenantLoading: loading.effects['noticeSite/removeTenant'],
  userListLoading: loading.effects['noticeSite/fetchUserList'],
  tenantId: getCurrentOrganizationId(),
}))
export default class NoticeDetail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      attachmentUuid: uuidv4(),
      visibleModal: false,
      activeKey: 'tenantList',
    };
  }

  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { noticeId },
      },
    } = this.props;
    dispatch({
      type: 'noticeSite/init',
    });
    if (noticeId !== 'create') {
      this.queryNoticeDetail({ noticeId }).then(res => {
        if (res && res.attachmentUuid) {
          this.handleUuid(res);
        }
      });
    } else {
      dispatch({
        type: 'noticeSite/updateState',
        payload: {
          noticeHisotryList: [],
          noticeDetail: {
            noticeContent: {
              noticeBody: '',
            },
          },
          // noticeBodyWord: '',
        },
      });
      this.handleUuid();
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'noticeSite/updateState',
      payload: {
        noticeHisotryList: [],
        noticeDetail: {
          noticeContent: {
            noticeBody: undefined,
          },
        },
        noticeBodyWord: '',
      },
    });
  }

  /**
   * @function fetchNoticeDetail - 查询公告详情
   * @param {object} params - 查询参数
   */
  queryNoticeDetail(params = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { noticeId },
      },
    } = this.props;
    return dispatch({
      type: 'noticeSite/queryNotice',
      payload: { organizationId, noticeId, ...params },
    });
  }

  /**
   *跳转到预览页面
   *
   */
  @Bind()
  handleNoticePreview() {
    const {
      match: {
        params: { noticeId },
      },
    } = this.props;
    this.props.history.push({
      pathname: `/spfm/noticeSite/preview/${noticeId}/2`,
    });
  }

  /**
   * 文件上传
   */
  @Bind()
  uploadImage(payload, file) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'noticeSite/uploadImage',
      payload,
      file,
    });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleHistory(page = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { noticeId },
      },
    } = this.props;
    // 操作记录数据
    dispatch({
      type: 'noticeSite/NoticeHistory',
      payload: {
        page,
        organizationId,
        noticeId,
      },
    });
  }

  /**
   * 显示详情弹框
   * @param {object} record
   */
  @Bind()
  showModal() {
    this.setState(
      {
        visibleModal: true,
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
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    const { dispatch } = this.props;
    dispatch({
      type: 'noticeSite/updateState',
      payload: {
        noticeBodyWord: dataSource,
      },
    });
  }

  /**
   * @function handleCreateNotice - 保存公告信息
   */
  @Bind()
  handleCreateNotice() {
    const {
      dispatch,
      form,
      organizationId,
      noticeSite: { noticeDetail = {}, noticeBodyWord },
      history,
      match: {
        params: { noticeId },
      },
    } = this.props;
    const { noticeContent = {} } = noticeDetail;
    // const { noticeBody = '' } = noticeContent;
    let params = {};
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        // if (!noticeBodyWord) {
        //   return notification.warning({
        //     message: intl
        //       .get('spfm.notice.view.message.alert.noticeContentRequired')
        //       .d('请输入公告内容'),
        //   });
        // }
        if (noticeDetail.noticeId) {
          params = {
            type: 'noticeSite/updateNotice',
            payload: {
              ...noticeDetail,
              ...fieldsValue,
              startDate: moment(fieldsValue.startDate).format(DATETIME_MIN),
              endDate:
                (fieldsValue.endDate && moment(fieldsValue.endDate).format(DATETIME_MAX)) || '',
              attachmentUuid: this.state.attachmentUuid,
              // receiverTypeCode: fieldsValue.receiverTypeCode[0],
              // noticeCategoryCode: fieldsValue.receiverTypeCode[1] || '',
              noticeContent: {
                ...noticeContent,
                noticeBody: noticeBodyWord,
              },
            },
          };
        } else {
          params = {
            type: 'noticeSite/createNotice',
            payload: {
              ...fieldsValue,
              startDate: moment(fieldsValue.startDate).format(DATETIME_MIN),
              endDate:
                (fieldsValue.endDate && moment(fieldsValue.endDate).format(DATETIME_MAX)) || '',
              attachmentUuid: this.state.attachmentUuid,
              // receiverTypeCode: fieldsValue.receiverTypeCode[0],
              // noticeCategoryCode: fieldsValue.receiverTypeCode[1] || '',
              tenantId: organizationId,
              statusCode: 'DRAFT',
              noticeContent: { noticeBody: noticeBodyWord, tenantId: organizationId },
            },
          };
        }
        dispatch(params).then(res => {
          if (res) {
            notification.success();
            dispatch({
              type: 'noticeSite/updateState',
              payload: { noticeDetail: res },
            });
            if (noticeId === 'create') {
              form.setFieldsValue({
                noticeCode: res.noticeCode,
              });
              history.push(`/spfm/noticeSite/detail/${res.noticeId}`);
            }
          }
        });
      }
    });
  }

  /**
   * @function handlePublicNotice - 发布公告信息
   */
  @Bind()
  handlePublicNotice() {
    const {
      dispatch,
      form,
      noticeSite: { noticeDetail = {}, noticeBodyWord },
      history,
    } = this.props;
    const { noticeContent = {}, noticeId } = noticeDetail;
    Modal.confirm({
      title: intl.get(`spfm.notice.view.public.title.content`).d('确定发布吗?'),
      onOk: () => {
        let params = {};
        form.validateFields((err, fieldsValue) => {
          if (noticeId) {
            params = {
              type: 'noticeSite/publicNotice',
              payload: {
                ...noticeDetail,
                ...fieldsValue,
                startDate: moment(fieldsValue.startDate).format(DATETIME_MIN),
                endDate:
                  (fieldsValue.endDate && moment(fieldsValue.endDate).format(DATETIME_MAX)) || '',
                attachmentUuid: this.state.attachmentUuid,
                noticeContent: {
                  ...noticeContent,
                  noticeBody: noticeBodyWord,
                },
              },
            };
            dispatch(params).then(res => {
              if (res) {
                notification.success();
                history.push(`/spfm/noticeSite/list`);
              }
            });
          }
        });
      },
    });
  }

  /**
   * @function handleDeleteNotice - 删除公告信息
   */
  @Bind()
  handleDeleteNotice() {
    const {
      dispatch,
      organizationId,
      noticeSite: { noticeDetail },
      history,
    } = this.props;
    Modal.confirm({
      title: intl.get(`spfm.notice.view.shield.title.content`).d('确定删除吗？'),
      onOk: () => {
        dispatch({
          type: 'noticeSite/deleteNotice',
          payload: { organizationId, ...noticeDetail },
        }).then(res => {
          if (res) {
            notification.success();
            history.push(`/spfm/noticeSite/list`);
          }
        });
      },
    });
  }

  /**
   * handleUuid - 获取uuid
   * @param {object} data - 报价模板头数据
   *  @param {string} data.attachmentUuid - 文件上传下载所需的uuid
   */
  @Bind()
  handleUuid(data = {}) {
    if (data.attachmentUuid) {
      this.setState({
        attachmentUuid: data.attachmentUuid,
      });
    }
  }

  /**
   * changeFileList - 格式化已经上传的文件列表
   * @param {array} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   */
  @Bind()
  changeFileList(response) {
    return response.map((res, index) => {
      return {
        uid: index,
        name: res.fileName,
        status: 'done',
        url: res.fileUrl,
      };
    });
  }

  /**
   * removeFile - 删除文件
   * @param {object} file - 删除的文件对象
   */
  @Bind()
  removeFile(file) {
    const {
      dispatch,
      noticeSite: { noticeDetail },
    } = this.props;
    dispatch({
      type: 'noticeSite/removeFile',
      payload: {
        bucketName: PUBLIC_BUCKET,
        directory: 'spfm-notice-detail',
        attachmentUUID: this.state.attachmentUuid || noticeDetail.attachmentUuid,
        urls: [file.url],
      },
    }).then(res => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   *
   *
   * @param {*} activeKey
   * @memberof FlexRule
   */
  @Bind()
  onTabsChange(activeKey) {
    if (activeKey !== this.state.activeKey) {
      this.setState({
        activeKey,
      });
      if (activeKey === 'userList') {
        this.fetchUserList();
      }
      // else if(activeKey === 'tenantList'){
      //   this.
      // }
    }
  }

  @Bind()
  fetchUserList(page = {}) {
    const {
      dispatch,
      match,
      noticeSite: { noticeDetail = {} },
    } = this.props;
    const { noticeId } = match.params;
    const { includeAllFlag } = noticeDetail;
    dispatch({
      type: 'noticeSite/fetchUserList',
      payload: {
        page,
        noticeId,
        includeAllFlag,
      },
    });
  }

  @Bind()
  renderForm() {
    const {
      form,
      noticeSite = {},
      queryNoticeLoading,
      fetchNoticeTenantLoading,
      fetchUdtTenantLoading,
      addTenantLoading,
      removeTenantLoading,
      userListLoading,
      match,
      dispatch,
    } = this.props;
    const { activeKey } = this.state;
    const {
      noticeCategory = [],
      noticeDetail = {},
      langObject = [],
      noticeTenantList = [],
      noticeTenantPagination = {},
      tenantList = [],
      tenantPagination = {},
      userList = [],
      userPagination = {},
    } = noticeSite;
    const {
      title,
      noticeTypeCode,
      startDate,
      endDate,
      noticeContent,
      lang,
      noticeCode,
      tenantVisibleFlag,
      versionNumber,
      iterateFlag,
    } = noticeDetail;
    const { getFieldDecorator, getFieldValue } = form;
    const { noticeBody } = noticeContent;
    const { noticeId } = match.params;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };
    const formTitleLayout = {
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 18,
      },
    };

    const staticTextProps = {
      content: noticeBody,
      data: noticeBody,
      onEditorChange: this.onRichTextEditorChange,
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'spfm-notice-detail',
    };

    const AddMailRecipientProps = {
      dispatch,
      noticeId,
      noticeDetail,
      loading: fetchNoticeTenantLoading,
      fetchModalLoading: fetchUdtTenantLoading,
      removeLoading: removeTenantLoading,
      addLoading: addTenantLoading,
      list: noticeTenantList,
      pagination: noticeTenantPagination,
      modalList: tenantList,
      modalPagination: tenantPagination,
    };

    const columns = [
      {
        title: intl.get('spfm.notice.model.tenant.loginName').d('账号'),
        //   width: 300,
        dataIndex: 'loginName',
      },
      {
        title: intl.get('spfm.notice.model.tenant.realName').d('用户'),
        //   width: 300,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.notice.model.tenant.email').d('邮件'),
        //   width: 300,
        dataIndex: 'email',
      },
      {
        title: intl.get('spfm.notice.model.tenant.tenantName').d('租户名称'),
        //   width: 300,
        dataIndex: 'tenantName',
      },
    ];
    return (
      <React.Fragment loading={noticeId === 'create' ? false : queryNoticeLoading}>
        {/* <Spin spinning={noticeId === 'create' ? false : queryNoticeLoading}> */}
        <Form className={DETAIL_EDIT_FORM_CLASSNAME}>
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
            <Col span={12}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.title').d('公告标题')}
                {...formTitleLayout}
              >
                {getFieldDecorator('title', {
                  initialValue: title,
                  rules: [
                    {
                      type: 'string',
                      required: true,
                      message: intl
                        .get('spfm.notice.view.validation.titleNotContainTitle')
                        .d('请输入公告标题'),
                    },
                    // {
                    //   max: 25,
                    //   message: intl.get('hzero.common.validation.max', {
                    //     max: 25,
                    //   }),
                    // },
                    {
                      validator: (rule, value, callback) => {
                        const emoji = new RegExp(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g);
                        if (value && emoji.test(value)) {
                          callback(
                            new Error(
                              intl
                                .get('spfm.notice.view.validation.titleNotContainEmoji')
                                .d('标题不能含有表情符号')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.lang').d('语言')}
                {...formItemLayout}
              >
                {getFieldDecorator('lang', {
                  initialValue: lang,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.notice.model.notice.lang').d('语言'),
                      }),
                    },
                  ],
                })(
                  <Select>
                    {langObject.map(item => {
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
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
            <Col span={8}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.receiverTypeMeaning').d('公告类型')}
                {...formItemLayout}
              >
                {getFieldDecorator('noticeTypeCode', {
                  initialValue: noticeTypeCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.notice.model.notice.receiverTypeMeaning')
                          .d('公告类型'),
                      }),
                    },
                  ],
                })(
                  <Select>
                    {noticeCategory.map(item => {
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
            <Col span={8}>
              <FormItem
                label={intl.get('hzero.common.date.active.from').d('有效日期从')}
                {...formItemLayout}
              >
                {getFieldDecorator('startDate', {
                  initialValue: startDate && moment(startDate, DEFAULT_DATE_FORMAT),
                  rules: [
                    {
                      type: 'object',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hzero.common.date.active.from').d('有效日期从'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    allowClear
                    placeholder=""
                    format={getDateFormat()}
                    disabledDate={current => {
                      if (form.getFieldValue('endDate')) {
                        return moment(current).isAfter(form.getFieldValue('endDate'), 'day');
                      } else {
                        return moment(current).isBefore(
                          moment(form.getFieldValue('endDate')),
                          'day'
                        );
                      }
                    }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get('hzero.common.date.active.to').d('有效日期至')}
                {...formItemLayout}
              >
                {getFieldDecorator('endDate', {
                  initialValue: endDate && moment(endDate, DEFAULT_DATE_FORMAT),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    allowClear
                    format={getDateFormat()}
                    disabledDate={current => {
                      return (
                        form.getFieldValue('startDate') &&
                        moment(current).isBefore(form.getFieldValue('startDate'), 'day')
                      );
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
            <Col span={8}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.noticeCode').d('公告编码')}
                {...formItemLayout}
              >
                {getFieldDecorator('noticeCode', {
                  initialValue: noticeCode,
                  rules: [
                    {
                      pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/,
                      message: intl
                        .get('spfm.notice.view.validation.noticeCodeRegError')
                        .d(`公告编码只有由字母、数字、'-'、'_'组成`),
                    },
                  ],
                })(
                  <Input disabled={noticeId !== 'create'} inputChinese={false} typeCase="upper" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={
                  <span>
                    {intl.get('spfm.notice.model.notice.tenantVisible').d('租户级可查询')}
                    <Tooltip
                      title={intl
                        .get('spfm.notice.model.notice.tenantVisibleTip')
                        .d(
                          '勾选后，用户可在租户级公告管理功能中查看此公告内容。过期后信息也将保留。'
                        )}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
                {...formItemLayout}
              >
                {getFieldDecorator('tenantVisibleFlag', {
                  initialValue: tenantVisibleFlag || 0,
                })(<Checkbox />)}
              </FormItem>
            </Col>
            {['PTGG', 'POPUP'].includes(getFieldValue('noticeTypeCode')) && (
              <Col span={8}>
                <Form.Item
                  label={intl.get('spfm.notice.model.notice.iterateFlag').d('是否迭代公告')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('iterateFlag', {
                    initialValue: iterateFlag || 0,
                  })(<Checkbox />)}
                </Form.Item>
              </Col>
            )}
            <Col span={8}>
              <FormItem
                label={
                  <span>
                    {intl.get('spfm.notice.model.notice.systemVersion').d('系统版本')}
                    <Tooltip
                      title={intl
                        .get('spfm.notice.model.notice.systemVersionMsg')
                        .d(
                          '发布迭代发版更新公告时，可在此维护本迭代对应系统版本以做留存记录，如v1.47'
                        )}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
                {...formItemLayout}
              >
                {getFieldDecorator('versionNumber', {
                  initialValue: versionNumber,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          {/* <Row> */}
          {/* <Col span={8}>
            <FormItem
              label={intl.get('spfm.notice.model.notice.receiverTypeCode').d('发布对象类别')}
              {...formItemLayout}
            >
              {getFieldDecorator('receiverTypeCode', {
                initialValue: receiverTypeCode ? [receiverTypeCode, noticeCategoryCode] : [],
                rules: [
                  {
                    type: 'array',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfm.notice.model.notice.receiverTypeCode').d('发布对象类别'),
                    }),
                  },
                ],
              })(
                <Cascader
                  allowClear={false}
                  options={noticeCascaderType}
                  fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                  placeholder=""
                  expandTrigger="hover"
                />
              )}
            </FormItem>
          </Col> */}
          {/* <Col span={8}>
            <FormItem
              label={intl.get('spfm.notice.model.notice.lang').d('语言')}
              {...formItemLayout}
            >
              {getFieldDecorator('lang', {
                initialValue: lang,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfm.notice.model.notice.lang').d('语言'),
                    }),
                  },
                ],
              })(
                <Select>
                  {langList.map(item => {
                    return (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col> */}
          {/* <Col span={8}>
            <FormItem
              label={intl.get('hzero.common.upload.text').d('上传附件')}
              {...formItemLayout}
            >
              <UploadModal
                attachmentUUID={attachmentUuid}
                afterOpenUploadModal={Uuid => this.setState({ attachmentUuid: Uuid })}
                bucketName="public"
              />
            </FormItem>
          </Col> */}
          {/* </Row> */}
          {/* <Row gutter={24}>
            <Col span={24}>
              <FormItem>
                {noticeBody !== undefined && <RichTextEditor {...staticTextProps} />}
              </FormItem>
            </Col>
          </Row> */}
        </Form>
        <Row gutter={48}>
          <Col span={24}>
            {noticeId !== 'create' && getFieldValue('noticeTypeCode') === 'MAIL' && (
              <Card
                key="addMailRecipient"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`spfm.notice.view.message.addMailRecipient`).d('添加邮件接收租户')}
                  </h3>
                }
              >
                <Tabs activeKey={activeKey} onChange={this.onTabsChange} animated={false}>
                  <TabPane
                    tab={intl.get('spfm.notice.view.message.tenantList').d('邮件接收租户')}
                    key="tenantList"
                  >
                    <AddMailRecipient {...AddMailRecipientProps} />
                  </TabPane>
                  <TabPane
                    tab={intl.get('spfm.notice.view.message.userList').d('邮件接收用户')}
                    key="userList"
                  >
                    <Table
                      bordered
                      rowKey="loginName"
                      columns={columns}
                      loading={userListLoading}
                      dataSource={userList}
                      pagination={userPagination}
                      onChange={this.fetchUserList}
                    />
                  </TabPane>
                </Tabs>
              </Card>
            )}

            {noticeBody !== undefined && <RichTextEditor {...staticTextProps} />}
          </Col>
        </Row>
        {/* </Spin> */}
      </React.Fragment>
    );
  }

  /**
   *导入
   */
  @Bind()
  handleImport(noticeId) {
    const { noticeSite = {} } = this.props;
    const { noticeDetail = {} } = noticeSite;
    const { lang } = noticeDetail;
    openTab({
      auto: true,
      key: `/spfm/noticeSite/import-component/SPFM.NOTICE_IMPORT`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: qs.stringify({
        action: intl.get('hzero.common.button.import').d('导入'),
        noticeId,
        args: JSON.stringify({
          noticeId,
          noticeLang: lang,
        }),
      }),
    });
  }

  render() {
    const {
      updateNoticeLoading,
      createNoticeLoading,
      publicNoticeLoading,
      historyLoading,
      deleteNoticeLoading,
      noticeSite: {
        noticeDetail,
        noticeHisotryList = [],
        // noticeHisotrypagination = []
      },
      tenantId,
      match,
    } = this.props;
    const { attachmentUuid, visibleModal } = this.state;
    const { noticeId } = match.params;
    const uploadModalProps = {
      tenantId,
      filePreview: true,
      btnProps: {
        icon: 'paper-clip',
        disabled: noticeId === 'create',
      },
      btnText: intl.get(`spfm.notice.view.message.title.attachment`).d('上传附件'),
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'spfm-notice-detail',
      attachmentUUID:
        isUndefined(noticeDetail.attachmentUuid) || isNull(noticeDetail.attachmentUuid)
          ? attachmentUuid
          : noticeDetail.attachmentUuid,
      // onCloseUploadModal: this.handleAttachmentUUID,
      showFilesNumber: false,
      fileSize: 500 * 1024 * 1024,
    };
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
    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.notice.view.message.title.edit').d('公告编辑')}
          backPath="/spfm/noticeSite/list"
        >
          <Button
            type="primary"
            icon="save"
            loading={noticeDetail.noticeId ? updateNoticeLoading : createNoticeLoading}
            onClick={this.handleCreateNotice}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {/* {(statusCode === 'DRAFT' || statusCode === 'PUBLISHED') && ( */}
          <Button
            loading={publicNoticeLoading}
            onClick={this.handlePublicNotice}
            icon="rocket"
            disabled={
              isUndefined(noticeDetail.noticeId) || noticeDetail.pageStatusCode === 'EXPIRED'
            }
          >
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          {/* )} */}
          <Button
            disabled={isUndefined(noticeDetail.noticeId)}
            onClick={this.handleNoticePreview}
            icon="eye-o"
          >
            {intl.get('hzero.common.button.preview').d('预览')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <Button
            loading={deleteNoticeLoading}
            onClick={this.handleDeleteNotice}
            disabled={noticeDetail.statusCode !== 'NEW' || !isEmpty(noticeDetail.publishedDate)}
            icon="delete"
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            disabled={isUndefined(noticeDetail.noticeId)}
            onClick={this.showModal}
            icon="clock-circle-o"
          >
            {intl.get('spfm.notice.model.notice.actionHistory').d('操作记录')}
          </Button>
          <Button
            icon="to-top"
            onClick={() => this.handleImport(noticeDetail.noticeId)}
            disabled={isUndefined(noticeDetail.noticeId)}
          >
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Header>
        <Content>{this.renderForm()}</Content>
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
