/**
 * notice - 公告管理-内嵌审批表单的详情页面
 * @date: 2023-3-24
 * @author: xia.shen <xia.shen@hand-china.com>
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
  Divider,
  Icon,
  Tooltip,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';
import WithCustomize from 'srm-front-cuz';
import MultipleLov from '@/routes//components/MultipleLov';
import { DEFAULT_DATE_FORMAT, DETAIL_EDIT_FORM_CLASSNAME } from 'utils/constants';
import { isUndefined } from 'util';
import RecordDrawer from './RecordDrawer';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
@WithCustomize({
  unitCode: ['SPFM.NOTICES.DETAIL.FORM'],
})
@formatterCollections({ code: ['spfm.notice', 'hzero.common', 'entity.attachment'] })
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
      this.queryNoticeDetail({ noticeId }).then((res) => {
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
      children: <RecordDrawer noticeId={noticeId} businessKey={businessKey} organizationId={organizationId} />,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 720 },
      closable: true,
      okText: intl.get(`hzero.common.status.closed`).d('关闭'),
      onOk: this.hiddenModal,
      footer: (okBtn) => (
        <>
          {okBtn}
        </>
      ),
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

  @Bind()
  renderForm() {
    const {
      form,
      notice: { noticeCategory = [], noticeObject = [], noticeDetail = {}, langObject = [] },
      // queryNoticeLoading,
      // match,
      tenantId,
      customizeForm = () => { },
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
    const { getFieldDecorator, getFieldValue } = form;
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
        userName: visibleUserNamesList[index],
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

    return [
      customizeForm(
        {
          code: 'SPFM.NOTICES.DETAIL.FORM', // 必传，和unitCode一一对应
          form, // 无论个性化单元是否只读，均必传
          dataSource: noticeDetail, // 必传，从后端接口获取到的数据
        },
        <Form className={DETAIL_EDIT_FORM_CLASSNAME}>
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
            <Col span={12}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.title').d('公告标题')}
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                className={styles['notice-title']}
              >
                {getFieldDecorator('title', {
                  initialValue: title,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.lang').d('语言')}
                {...formTitleLayout}
              >
                {getFieldDecorator('lang', {
                  initialValue: lang,
                })(
                  <Select disabled>
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
          <Row gutter={48} style={{ paddingBottom: '12px' }}>
            <Col span={8}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.noticeCategoryMeaning').d('公告对象')}
                {...formTitleLayout}
              >
                {getFieldDecorator('noticeCategoryCode', {
                  initialValue: noticeCategoryCode,
                })(
                  <Select disabled>
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
            {getFieldValue('noticeCategoryCode') === 'OGYS' && (
              <Col span={8}>
                <FormItem
                  label={<span>{intl.get('spfm.notice.model.notice.visibleSupplierIds').d('可见供应商')}<Tooltip title={intl.get("spfm.notice.model.notice.visibleSupplierMsg").d("若为空，本公告将展示给所有供应商")}><Icon type="question-circle" style={{fontSize: "12px", marginLeft: 4}} /></Tooltip></span>}
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleSupplierIds`, {
                    initialValue: visibleSupplierIds,
                  })(
                    <MultipleLov
                      disabled
                      code="SPFM.PARTNER_SUPPLIER_WITH_CATEGORY"
                      textValue={visibleSupplierNames}
                      queryParams={{ tenantId }}
                      allowClear
                      lovOptions={{ displayField: 'supplierCompanyName' }}
                      oldValueField="visibleSupplierList"
                      oldValue={visibleSupplierList || []}
                    />
                  )}
                  {getFieldDecorator('visibleSupplierList', {
                    initialValue: visibleSupplierList,
                  })}
                </FormItem>
              </Col>
            )}
            {getFieldValue('noticeCategoryCode') === 'OBUYER' && (
              <Col span={8}>
                <FormItem
                  label={<span>
                    {intl
                    .get('spfm.notice.model.notice.visiblePurchaseAgentIds')
                    .d('可见采购员')}
                    <Tooltip title={intl.get("spfm.notice.model.notice.visibleUserMsg").d("若为空，本公告将展示给采购方下所有采购员")}><Icon type="question-circle" style={{fontSize: "12px", marginLeft: 4}} /></Tooltip>
                  </span>}
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visiblePurchaseAgentIds`, {
                    initialValue: visiblePurchaseAgentIds,
                  })(
                    <MultipleLov
                      disabled
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
            {getFieldValue('noticeCategoryCode') === 'OCGF' && (
              <Col span={8}>
                <FormItem
                  label={<span>
                    {intl.get('spfm.notice.model.notice.visibleUserIds').d('可见子账户')}
                    <Tooltip title={intl.get("spfm.notice.model.notice.visiblePurchaseAgentMsg").d("若为空，本公告将展示给采购方下所有子账户")}><Icon type="question-circle" style={{fontSize: "12px", marginLeft: 4}} /></Tooltip>
                         </span>}
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleUserIds`, {
                    initialValue: visibleUserIds,
                  })(
                    <MultipleLov
                      disabled
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
            {getFieldValue('noticeCategoryCode') === 'OROLES' && (
              <Col span={8}>
                <FormItem
                  label={<span>
                    {intl.get('spfm.notice.model.notice.visibleRoles').d('可见角色')}
                    <Tooltip title={intl.get("spfm.notice.model.notice.visibleRolesMsg").d("若为空，本公告将展示给采购方下所有角色")}><Icon type="question-circle" style={{fontSize: "12px", marginLeft: 4}} /></Tooltip>
                         </span>}
                  {...formTitleLayout}
                >
                  {getFieldDecorator(`visibleRoleIds`, {
                    initialValue: visibleRoleIds,
                  })(
                    <MultipleLov
                      allowClear
                      disabled
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
            <Col span={8}>
              <FormItem
                label={intl.get('spfm.notice.model.notice.receiverTypeMeaning').d('公告类型')}
                {...formItemLayout}
              >
                {getFieldDecorator('noticeTypeCode', {
                  initialValue: noticeTypeCode,
                })(
                  <Select disabled>
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
            <Col span={8}>
              <FormItem
                label={intl.get('hzero.common.date.active.from').d('有效日期从')}
                {...formItemLayout}
              >
                {getFieldDecorator('startDate', {
                  initialValue: startDate && moment(startDate, DEFAULT_DATE_FORMAT),
                })(
                  <DatePicker
                    disabled
                    style={{ width: '100%' }}
                    allowClear
                    placeholder=""
                    format={getDateFormat()}
                    disabledDate={(current) => {
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
                    disabled
                    style={{ width: '100%' }}
                    placeholder=""
                    allowClear
                    format={getDateFormat()}
                    disabledDate={(current) => {
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
                })(<InputNumber min={0} step={1} precision={0} max={1999999999} disabled />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      ),
      <Row gutter={24}>
        <div style={{ textAlign: 'center', fontSize: '24px' }}>
          {intl.get('spfm.notice.view.message.notice.title.detail').d('公告详情')}
        </div>
        <Divider />
        <Col span={24}>{noticeBody !== undefined && <div dangerouslySetInnerHTML={{ __html: noticeBody }} />}</Col>
      </Row>,
    ];
  }

  render() {
    const {
      notice: {
        noticeDetail,
      },
    } = this.props;
    const { attachmentUuid } = this.state;
    const uploadModalProps = {
      filePreview: true,
      btnProps: {
        disabled: false,
        type: 'primary',
      },
      btnText: intl.get(`entity.attachment.tag`).d('附件'),
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'spfm-notice-detail',
      viewOnly: true,
      attachmentUUID:
        isEmpty(noticeDetail.attachmentUuid) || isNull(noticeDetail.attachmentUuid)
          ? attachmentUuid
          : noticeDetail.attachmentUuid,
      onCloseUploadModal: this.handleAttachmentUUID,
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.notice.view.message.notice.title.detail').d('公告详情')}
        >
          <UploadModal {...uploadModalProps} />
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
