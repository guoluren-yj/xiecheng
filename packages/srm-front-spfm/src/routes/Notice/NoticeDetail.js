/**
 * notice - 公告管理-详情页面
 * @date: 2018-9-20
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNull, isArray } from 'lodash';
import moment from 'moment';
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Select,
  InputNumber,
  Icon,
  Tooltip,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
// import TinymceEditor from 'components/TinymceEditor';
import RichTextEditor from 'components/RichTextEditor';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import MultipleLov from '@/routes/components/MultipleLov';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  DATETIME_MAX,
  DETAIL_EDIT_FORM_CLASSNAME,
} from 'utils/constants';
import { isUndefined } from 'util';
import RecordDrawer from './RecordDrawer';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
@WithCustomize({
  unitCode: ['SPFM.NOTICES.DETAIL.FORM'],
})
@formatterCollections({ code: ['spfm.notice', 'hzero.common', 'sslm.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ loading, notice }) => ({
  notice,
  createNoticeLoading: loading.effects['notice/createNotice'],
  updateNoticeLoading: loading.effects['notice/updateNotice'],
  publicNoticeLoading: loading.effects['notice/publicNotice'],
  queryNoticeLoading: loading.effects['notice/queryNotice'],
  deleteNoticeLoading: loading.effects['notice/deleteNotice'],
  tenantId: getCurrentOrganizationId(),
}))
export default class NoticeDetail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      attachmentUuid: uuidv4(),
      businessKey: '',
      noticeBodyFlag: true,
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
      type: 'notice/init',
    });
    if (noticeId !== 'create') {
      this.queryNoticeDetail({ noticeId }).then(res => {
        if (res && res.attachmentUuid) {
          this.handleUuid(res);
        }
        if (res && res.businessKey) {
          this.setState({ businessKey: res.businessKey });
        }
      });
    } else {
      dispatch({
        type: 'notice/updateState',
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
      type: 'notice/updateState',
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
      type: 'notice/queryNotice',
      payload: {
        organizationId,
        noticeId,
        ...params,
        customizeUnitCode: 'SPFM.NOTICES.DETAIL.FORM',
      },
    })
      .then(res => {
        if (res) {
          this.setState({ businessKey: res.businessKey });
        }
      })
      .finally(() => {
        this.setState({ noticeBodyFlag: false });
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
      pathname: `/spfm/notices/preview/${noticeId}/2`,
    });
  }

  /**
   * 文件上传
   */
  @Bind()
  uploadImage(payload, file) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'notice/uploadImage',
      payload,
      file,
    });
  }

  /**
   * 显示详情弹框
   * @param {object} record
   */
  @Bind()
  showModal() {
    const {
      organizationId,
      match: {
        params: { noticeId },
      },
    } = this.props;
    const { businessKey } = this.state;

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
      footer: okBtn => <>{okBtn}</>,
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
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    const { dispatch } = this.props;
    dispatch({
      type: 'notice/updateState',
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
      notice: { noticeDetail = {}, noticeBodyWord },
      history,
      match: {
        params: { noticeId },
      },
    } = this.props;
    const { noticeContent = {} } = noticeDetail;
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
        const {
          visibleSupplierList = [],
          visiblePurchaseAgentList = [],
          visibleUserList = [],
          visibleRoleList = [],
        } = fieldsValue;
        if (noticeDetail.noticeId) {
          params = {
            type: 'notice/updateNotice',
            payload: {
              ...noticeDetail,
              ...fieldsValue,
              startDate: moment(fieldsValue.startDate).format(DEFAULT_DATETIME_FORMAT),
              endDate:
                (fieldsValue.endDate && moment(fieldsValue.endDate).format(DATETIME_MAX)) || '',
              attachmentUuid: noticeDetail.attachmentUuid || this.state.attachmentUuid,
              visibleSupplierIds: isArray(visibleSupplierList)
                ? visibleSupplierList.map(ele => ele.partnerId)
                : [],
              visiblePurchaseAgentIds: visiblePurchaseAgentList.map(ele => ele.purchaseAgentId),
              visibleUserIds: visibleUserList.map(ele => ele.userId),
              visibleRoleIds: visibleRoleList.map(ele => ele.id),
              visibleSupplierList: null,
              visiblePurchaseAgentList: null,
              visibleUserList: null,
              visibleRoleList: null,
              // receiverTypeCode: fieldsValue.receiverTypeCode[0],
              // noticeCategoryCode: fieldsValue.receiverTypeCode[1] || '',
              noticeContent: {
                ...noticeContent,
                noticeBody: noticeBodyWord,
              },
              customizeUnitCode: 'SPFM.NOTICES.DETAIL.FORM',
            },
          };
        } else {
          params = {
            type: 'notice/createNotice',
            payload: {
              ...fieldsValue,
              startDate: moment(fieldsValue.startDate).format(DEFAULT_DATETIME_FORMAT),
              endDate:
                (fieldsValue.endDate && moment(fieldsValue.endDate).format(DATETIME_MAX)) || '',
              attachmentUuid: noticeDetail.attachmentUuid || this.state.attachmentUuid,
              // receiverTypeCode: fieldsValue.receiverTypeCode[0],
              // noticeCategoryCode: fieldsValue.receiverTypeCode[1] || '',
              visibleSupplierIds: isArray(visibleSupplierList)
                ? visibleSupplierList.map(ele => ele.partnerId)
                : [],
              visiblePurchaseAgentIds: visiblePurchaseAgentList.map(ele => ele.purchaseAgentId),
              visibleUserIds: visibleUserList.map(ele => ele.userId),
              visibleRoleIds: visibleRoleList.map(ele => ele.id),
              visibleSupplierList: null,
              visiblePurchaseAgentList: null,
              visibleUserList: null,
              visibleRoleList: null,
              tenantId: organizationId,
              statusCode: 'DRAFT',
              noticeContent: { noticeBody: noticeBodyWord, tenantId: organizationId },
              customizeUnitCode: 'SPFM.NOTICES.DETAIL.FORM',
            },
          };
        }
        dispatch(params).then(res => {
          if (res) {
            notification.success();
            this.queryNoticeDetail({ noticeId: res.noticeId });
            if (noticeId === 'create') {
              history.push(`/spfm/notices/detail/${res.noticeId}`);
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
      notice: { noticeDetail = {}, noticeBodyWord },
      history,
    } = this.props;
    const { noticeContent = {}, noticeId } = noticeDetail;
    Modal.confirm({
      title: intl.get(`spfm.notice.view.public.title.content`).d('确定发布吗?'),
      onOk: () => {
        let params = {};
        form.validateFields((err, fieldsValue) => {
          const {
            visibleSupplierList = [],
            visiblePurchaseAgentList = [],
            visibleUserList = [],
            visibleRoleList = [],
          } = fieldsValue;
          if (noticeId) {
            params = {
              type: 'notice/publicNotice',
              payload: {
                ...noticeDetail,
                ...fieldsValue,
                startDate: moment(fieldsValue.startDate).format(DEFAULT_DATETIME_FORMAT),
                endDate:
                  (fieldsValue.endDate && moment(fieldsValue.endDate).format(DATETIME_MAX)) || '',
                attachmentUuid: noticeDetail.attachmentUuid || this.state.attachmentUuid,
                visibleSupplierIds: isArray(visibleSupplierList)
                  ? visibleSupplierList.map(ele => ele.partnerId)
                  : [],
                visiblePurchaseAgentIds: visiblePurchaseAgentList.map(ele => ele.purchaseAgentId),
                visibleUserIds: visibleUserList.map(ele => ele.userId),
                visibleRoleIds: visibleRoleList.map(ele => ele.id),
                visibleSupplierList: null,
                visiblePurchaseAgentList: null,
                visibleUserList: null,
                visibleRoleList: null,
                noticeContent: {
                  ...noticeContent,
                  noticeBody: noticeBodyWord,
                },
              },
            };
            dispatch(params).then(res => {
              if (res) {
                notification.success();
                history.push(`/spfm/notices/list`);
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
      notice: { noticeDetail },
      history,
    } = this.props;
    Modal.confirm({
      title: intl.get(`spfm.notice.view.shield.title.content`).d('确定删除吗？'),
      onOk: () => {
        dispatch({
          type: 'notice/deleteNotice',
          payload: { organizationId, ...noticeDetail },
        }).then(res => {
          if (res) {
            notification.success();
            history.push(`/spfm/notices/list`);
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
      notice: { noticeDetail },
    } = this.props;
    dispatch({
      type: 'notice/removeFile',
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

  // 渲染额外的查询条件
  @Bind()
  renderExtraQueryCondition({ form: lovForm }) {
    const { getFieldDecorator } = lovForm || {};
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 14 },
      },
    };

    return (
      <Col span={12}>
        <FormItem
          {...formItemLayout}
          label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
        >
          {getFieldDecorator(`categoryIds`)(
            <MultipleLov
              allowClear
              code="SSLM.SUPPLIER_CATEGORY"
              lovOptions={{
                displayField: 'categoryDescription',
                valueField: 'categoryId',
              }}
              oldValueField="categoryList" // 再次打开勾选值还在
            />
          )}
        </FormItem>
      </Col>
    );
  }

  @Bind()
  handleNoticeCategoryChange(value) {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({
      noticeTypeCode: value === 'OGYSGF' ? 'JFGG' : undefined,
      visibleUserIds: undefined,
      visibleUserList: undefined,
      visibleUserNames: undefined,
    });
  }

  @Bind()
  renderForm() {
    const { noticeBodyFlag } = this.state;
    const {
      form,
      notice: { noticeCategory = [], noticeObject = [], noticeDetail = {}, langObject = [] },
      // queryNoticeLoading,
      // match,
      tenantId,
      customizeForm = () => {},
    } = this.props;
    const {
      noticeContent = {},
      title,
      noticeTypeCode,
      noticeCategoryCode,
      startDate,
      endDate,
      lineNum,
      lang,
      visibleSupplierIds,
      visibleSupplierNames,
      visiblePurchaseAgentIds,
      visiblePurchaseAgentNames,
      visibleUserIds,
      visibleUserNames,
      visibleRoleIds,
      visibleRoleNames,
    } = noticeDetail;
    const { noticeBody } = noticeContent;
    const { getFieldDecorator, getFieldsValue } = form;
    const {
      noticeCategoryCode: currentNoticeCategory,
      visibleUserList: currentVisibleUserList,
    } = getFieldsValue(['noticeCategoryCode', 'visibleUserList']);
    // const { noticeId } = match.params;
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

    const visibleSupplierNamesList = visibleSupplierNames ? visibleSupplierNames.split(',') : [];
    const visibleSupplierList = isArray(visibleSupplierIds)
      ? visibleSupplierIds.map((partnerId, index) => ({
          supplierCompanyName: visibleSupplierNamesList[index],
          partnerId,
        }))
      : [];

    const visiblePurchaseAgentNamesList = visiblePurchaseAgentNames
      ? visiblePurchaseAgentNames.split(',')
      : [];
    const visiblePurchaseAgentList = isArray(visiblePurchaseAgentIds)
      ? visiblePurchaseAgentIds.map((purchaseAgentId, index) => ({
          purchaseAgentName: visiblePurchaseAgentNamesList[index],
          purchaseAgentId,
        }))
      : [];

    // 可见采购方
    const visibleUserNamesList = visibleUserNames ? visibleUserNames.split(',') : [];
    const visibleUserList = isArray(visibleUserIds)
      ? visibleUserIds.map((userId, index) => ({
          [currentNoticeCategory === 'OGYSGF' ? 'realName' : 'userName']: visibleUserNamesList[
            index
          ],
          userId,
        }))
      : [];

    const visibleRoleNamesList = visibleRoleNames ? visibleRoleNames.split(',') : [];
    const visibleRoleList = isArray(visibleRoleIds)
      ? visibleRoleIds.map((userId, index) => ({
          id: userId,
          name: visibleRoleNamesList[index],
        }))
      : [];
    const noticeCategoryList = noticeCategory
      ? noticeCategory.filter(item =>
          currentNoticeCategory === 'OGYSGF' ? item.value === 'JFGG' : item.value !== 'JFGG'
        )
      : [];
    return [
      customizeForm(
        {
          code: 'SPFM.NOTICES.DETAIL.FORM', // 必传，和unitCode一一对应
          form, // 无论个性化单元是否只读，均必传
          dataSource: noticeDetail, // 必传，从后端接口获取到的数据
        },
        // <Spin spinning={noticeId === 'create' ? false : queryNoticeLoading}>
        <Form className={DETAIL_EDIT_FORM_CLASSNAME}>
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
            <Col span={12}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.title').d('公告标题')}
                // {...formTitleLayout}
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                className={styles['notice-title']}
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
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
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
                {...formTitleLayout}
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
                label={intl.get('spfm.notice.model.notice.noticeCategoryMeaning').d('公告对象')}
                {...formTitleLayout}
              >
                {getFieldDecorator('noticeCategoryCode', {
                  initialValue: noticeCategoryCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.notice.model.notice.noticeCategoryMeaning')
                          .d('公告对象'),
                      }),
                    },
                  ],
                })(
                  <Select onChange={this.handleNoticeCategoryChange}>
                    {noticeObject.map(item => {
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
            {currentNoticeCategory === 'OGYS' && (
              <Col span={8}>
                <FormItem
                  label={
                    <span>
                      {intl.get('spfm.notice.model.notice.visibleSupplierIds').d('可见供应商')}
                      <Tooltip
                        title={intl
                          .get('spfm.notice.model.notice.visibleSupplierMsg')
                          .d('若为空，本公告将展示给所有供应商')}
                      >
                        <Icon type="question-circle" style={{ fontSize: '12px', marginLeft: 4 }} />
                      </Tooltip>
                    </span>
                  }
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleSupplierIds`, {
                    initialValue: visibleSupplierIds,
                  })(
                    <MultipleLov
                      code="SPFM.PARTNER_SUPPLIER_WITH_CATEGORY"
                      textValue={visibleSupplierNames}
                      queryParams={{ tenantId }}
                      allowClear
                      lovOptions={{ displayField: 'supplierCompanyName' }}
                      oldValueField="visibleSupplierList"
                      oldValue={visibleSupplierList || []}
                      queryFilterField="categoryList" // 查询时过滤
                      renderExtraQueryCondition={this.renderExtraQueryCondition}
                    />
                  )}
                  {getFieldDecorator('visibleSupplierList', {
                    initialValue: visibleSupplierList,
                  })}
                </FormItem>
              </Col>
            )}
            {currentNoticeCategory === 'OBUYER' && (
              <Col span={8}>
                <FormItem
                  label={
                    <span>
                      {intl.get('spfm.notice.model.notice.visiblePurchaseAgentIds').d('可见采购员')}
                      <Tooltip
                        title={intl
                          .get('spfm.notice.model.notice.visibleUserMsg')
                          .d('若为空，本公告将展示给采购方下所有采购员')}
                      >
                        <Icon type="question-circle" style={{ fontSize: '12px', marginLeft: 4 }} />
                      </Tooltip>
                    </span>
                  }
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visiblePurchaseAgentIds`, {
                    initialValue: visiblePurchaseAgentIds,
                  })(
                    <MultipleLov
                      code="HPFM.ORGANIZATION_PURCHASE_AGENT"
                      textValue={visiblePurchaseAgentNames}
                      queryParams={{ tenantId }}
                      allowClear
                      lovOptions={{ displayField: 'purchaseAgentName' }}
                      oldValueField="visiblePurchaseAgentList"
                      oldValue={visiblePurchaseAgentList || []}
                    />
                  )}
                  {getFieldDecorator('visiblePurchaseAgentList', {
                    initialValue: visiblePurchaseAgentList,
                  })}
                </FormItem>
              </Col>
            )}
            {currentNoticeCategory === 'OCGF' && (
              <Col span={8}>
                <FormItem
                  label={
                    <span>
                      {intl.get('spfm.notice.model.notice.visibleUserIds').d('可见子账户')}
                      <Tooltip
                        title={intl
                          .get('spfm.notice.model.notice.visiblePurchaseAgentMsg')
                          .d('若为空，本公告将展示给采购方下所有子账户')}
                      >
                        <Icon type="question-circle" style={{ fontSize: '12px', marginLeft: 4 }} />
                      </Tooltip>
                    </span>
                  }
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleUserIds`, {
                    initialValue: visibleUserIds,
                  })(
                    <MultipleLov
                      code="HIAM.TENANT.ACCOUNT"
                      textValue={visibleUserNames}
                      queryParams={{ tenantId }}
                      allowClear
                      lovOptions={{ displayField: 'userName' }}
                      oldValueField="visibleUserList"
                      oldValue={visibleUserList || []}
                    />
                  )}
                  {getFieldDecorator('visibleUserList', {
                    initialValue: visibleUserList,
                  })}
                </FormItem>
              </Col>
            )}
            {currentNoticeCategory === 'OROLES' && (
              <Col span={8}>
                <FormItem
                  label={
                    <span>
                      {intl.get('spfm.notice.model.notice.visibleRoles').d('可见角色')}
                      <Tooltip
                        title={intl
                          .get('spfm.notice.model.notice.visibleRolesMsg')
                          .d('若为空，本公告将展示给采购方下所有角色')}
                      >
                        <Icon type="question-circle" style={{ fontSize: '12px', marginLeft: 4 }} />
                      </Tooltip>
                    </span>
                  }
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleRoleIds`, {
                    initialValue: visibleRoleIds,
                  })(
                    <MultipleLov
                      allowClear
                      code="SSLM.TENANT.ROLE"
                      textValue={visibleRoleNames}
                      queryParams={{ tenantId }}
                      oldValueField="visibleRoleList"
                      oldValue={visibleRoleList || []}
                    />
                  )}
                  {getFieldDecorator('visibleRoleList', {
                    initialValue: visibleRoleList,
                  })}
                </FormItem>
              </Col>
            )}
            {currentNoticeCategory === 'OGYSGF' && (
              <Col span={8}>
                <FormItem
                  label={
                    <span>
                      {intl.get('spfm.notice.model.notice.visibleSubAccount').d('可见子账户')}
                    </span>
                  }
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleUserIds`, {
                    initialValue: visibleUserIds,
                    rules: [
                      {
                        required: currentNoticeCategory === 'OGYSGF',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('spfm.notice.model.notice.visibleSubAccount')
                            .d('可见子账户'),
                        }),
                      },
                    ],
                  })(
                    <MultipleLov
                      code="HIAM.SUPPLIER.ACCOUNT"
                      textField="visibleUserNames"
                      allowClear
                      hiddenSelected
                      lovOptions={{ displayField: 'realName' }}
                      oldValueField="visibleUserList"
                      oldValue={currentVisibleUserList || []}
                    />
                  )}
                  {getFieldDecorator('visibleUserList', {
                    initialValue: visibleUserList,
                  })}
                  {getFieldDecorator('visibleUserNames', {
                    initialValue: visibleUserNames,
                  })}
                </FormItem>
              </Col>
            )}
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
                    {noticeCategoryList.map(item => {
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
          </Row>
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
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
            <Col span={8}>
              <FormItem
                label={intl.get('hzero.common.view.orderSeq').d('排序号')}
                {...formTitleLayout}
              >
                {getFieldDecorator('lineNum', {
                  initialValue: lineNum,
                })(<InputNumber min={0} step={1} precision={0} max={1999999999} />)}
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
        </Form>
        // </Spin>
      ),
      <Row gutter={24}>
        <Col span={24}>
          {noticeBody !== undefined && !noticeBodyFlag && <RichTextEditor {...staticTextProps} />}
        </Col>
      </Row>,
    ];
    // null
    // )
  }

  render() {
    const {
      updateNoticeLoading,
      createNoticeLoading,
      publicNoticeLoading,
      deleteNoticeLoading,
      notice: {
        noticeDetail,
        // noticeHisotrypagination = []
      },
      tenantId,
      match,
    } = this.props;
    const { attachmentUuid } = this.state;
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

    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.notice.view.message.title.edit').d('公告编辑')}
          backPath="/spfm/notices/list"
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
        </Header>
        <Content>{this.renderForm()}</Content>
      </React.Fragment>
    );
  }
}
