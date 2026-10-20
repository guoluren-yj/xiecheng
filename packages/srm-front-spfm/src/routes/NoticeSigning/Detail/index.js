/**
 * MessageTemplate - 消息模板明细维护
 * @date: 2018-7-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Form, Button, Row, Col, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import UploadModal from '_components/Upload';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { isFunction } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import OperatorRecordModal from './RecordModel';
import { dateTimeRender } from 'utils/renderer';

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@withCustomize({
  unitCode: [
    'SPFM.PORTAL.NOTICESIGN.PUBLISH.DETAIL.BTNS',
    'SPFM.PORTAL.NOTICESIGN.PUBLISH.DETAIL.HEADER',
  ],
})
@connect(({ noticeSign, loading }) => ({
  noticeSign,
  fetchDetailLoading: loading.effects['noticeSign/fetchDetail'],
  recordLoading: loading.effects['noticeSign/fetchOperationRecord'],
  signLoading: loading.effects['noticeSign/batchSignFor'],
}))
@cuxRemote(
  {
    code: 'SPFM_NOTICESIGN_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      cuxSignValidate: undefined,
    },
  }
)
@formatterCollections({
  code: [
    'spfm.common',
    'entity.customer',
    'hzero.common',
    'entity.business',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'spfm.notice',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      headerInfo: {},
      recordVisible: false,
      operationRecordList: [],
    };
  }

  componentDidMount() {
    this.fetchDetail();
  }

  @Bind()
  fetchDetail() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch({
      type: 'noticeSign/fetchDetail',
      payload: {
        notificationReceiveId: id,
        customizeUnitCode: 'SPFM.PORTAL.NOTICESIGN.PUBLISH.DETAIL.HEADER',
      },
    }).then((res) => {
      if (res) {
        const { receivesAttachmentUuid } = res;
        if (!receivesAttachmentUuid) {
          this.setState({ uuid: uuidv4() });
        }
        this.setState({ headerInfo: res });
      }
    });
  }

  @Bind()
  fetchOperationRecord() {
    const { headerInfo } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'noticeSign/fetchOperationRecord',
      payload: { notificationId: headerInfo.notificationId },
    }).then((res) => {
      if (res) {
        this.setState({ operationRecordList: res.content });
      }
    });
  }

  @Bind()
  handleSign() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    const { cuxSignValidate } = this.props?.remote?.props?.process || {};
    const checkMsg = isFunction(cuxSignValidate)
      ? cuxSignValidate({ uploadModalRef: this.uploadModal })
      : undefined;
    if (checkMsg) {
      notification.error({ message: checkMsg });
    } else {
      dispatch({
        type: 'noticeSign/batchSignFor',
        payload: [{ notificationReceiveId: id }],
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchDetail();
        }
      });
    }
  }

  @Bind()
  setRecordVisible(recordVisible) {
    this.setState({ recordVisible });
  }

  @Bind()
  afterOpenUploadModal() {
    const { dispatch } = this.props;
    const { headerInfo = {}, uuid } = this.state;
    const { receivesAttachmentUuid } = headerInfo;
    if (!receivesAttachmentUuid) {
      dispatch({
        type: 'noticeSign/receivesAttachmentUuidSave',
        payload: { ...headerInfo, receivesAttachmentUuid: uuid },
      }).then(res => {
        if (res) {
          this.fetchDetail();
        };
      });
    } else {
      this.fetchDetail();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dispatch,
      signLoading,
      recordLoading,
      fetchDetailLoading,
      customizeBtnGroup,
      customizeForm,
      form,
    } = this.props;

    const { headerInfo, recordVisible, operationRecordList, uuid } = this.state;
    const {
      notificationTitle,
      tenantName,
      notificationType,
      notificationTypeMeaning,
      notificationNum,
      notificationStatus,
      notificationStatusMeaning,
      realName,
      createdBy,
      creationDate,
      attachmentUuid,
      notificationContent,
      notificationId,
      receivesAttachmentUuid,
    } = headerInfo;
    const { getFieldDecorator } = form;
    const { cuxAttachcheck } = this.props?.remote?.props?.process || {};
    const cuxAttachcheckDisabled = isFunction(cuxAttachcheck)
      ? cuxAttachcheck({ notificationStatus })
      : false;
    const uploadModalProps = {
      // btnText: intl.get('spfm.common.model.viewFile').d('查看采购方附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      viewOnly: true,
      showFilesNumber: true,
      attachmentUUID: attachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-business-order',
    };
    const upUploadModalProps = {
      tenantId: getCurrentOrganizationId(),
      btnProps: {
        icon: 'upload',
        disabled: isFunction(cuxAttachcheck)
          ? cuxAttachcheckDisabled
          : false,
      },
      viewOnly: notificationStatus === 'ALL_RECEIVE',
      // btnText: intl.get(`spfm.notice.view.message.title.attachment`).d('上传附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-business-order',
      attachmentUUID: receivesAttachmentUuid || uuid,
      onUploadSuccess: this.afterOpenUploadModal,
      showFilesNumber: false,
      fileSize: 500 * 1024 * 1024,
    };
    const OperationRecordProps = {
      dispatch,
      loading: recordLoading,
      notificationId,
      dataSource: operationRecordList,
      onCancel: () => this.setRecordVisible(false),
      visible: recordVisible,
      fetchOperationRecord: this.fetchOperationRecord,
    };
    const attachBtnText = notificationStatus === 'ALL_RECEIVE' ? intl.get('hzero.common.upload.view').d('查看附件') : intl.get(`spfm.notice.view.message.title.attachment`).d('上传附件');
    const headerButtons = [
      {
        name: 'sign',
        noNest: true,
        btnProps: { onClick: this.handleSign },
        child: (text) => (
          <Button
            type="primary"
            onClick={this.handleSign}
            loading={signLoading}
            disabled={notificationStatus === 'ALL_RECEIVE'}
          >
            {text || intl.get('spfm.common.view.button.sign').d('签收')}
          </Button>
        ),
      },
      {
        name: 'attachment',
        noNest: true,
        child: (text) => (
          <UploadModal
            {...upUploadModalProps}
            ref={(ref) => {
              this.uploadModal = ref;
            }}
            btnText={text || attachBtnText}
          />
        ),
      },
      {
        name: 'viewFile',
        noNest: true,
        child: (text) => (
          <UploadModal
            {...uploadModalProps}
            btnText={text || intl.get('spfm.common.model.viewFile').d('查看采购方附件')}
          />
        ),
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl.get(`spfm.common.view.title.noticeDetail`).d('业务通知单')}
          backPath="/spfm/notice-sign/list"
        >
          {/* <Button
            type="primary"
            onClick={this.handleSign}
            loading={signLoading}
            disabled={notificationStatus === 'ALL_RECEIVE'}
          >
            {intl.get('spfm.common.view.button.sign').d('签收')}
          </Button>
          <UploadModal {...upUploadModalProps} />
          <UploadModal {...uploadModalProps} /> */}
          {/* <Button
            onClick={() => this.setRecordVisible(true)}
            icon="clock-circle-o"
            disabled={!notificationId}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button> */}

          {customizeBtnGroup(
            {
              code: 'SPFM.PORTAL.NOTICESIGN.PUBLISH.DETAIL.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerButtons} />
          )}
        </Header>
        <Content>
          <Spin spinning={fetchDetailLoading}>
            <Fragment>
              {customizeForm(
                {
                  code: 'SPFM.PORTAL.NOTICESIGN.PUBLISH.DETAIL.HEADER',
                  form: this.props.form,
                  dataSource: headerInfo,
                },
                <Form>
                  <Row gutter={48} className="inclusion-row">
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get(`spfm.common.model.noticeTitle`).d('通知单标题')}
                      >
                        {getFieldDecorator('notificationTitle', {
                          initialValue: notificationTitle,
                        })(<span>{notificationTitle}</span>)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get(`entity.customer.tag`).d('客户')}
                      >
                        {getFieldDecorator('tenantName', { initialValue: tenantName })(
                          <span>{tenantName}</span>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get(`spfm.common.model.noticeType`).d('通知单类型')}
                      >
                        {getFieldDecorator('notificationType', { initialValue: notificationType })(
                          <span>{notificationTypeMeaning}</span>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={48} className="inclusion-row">
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get(`spfm.common.model.noticeCode`).d('通知单编号')}
                      >
                        {getFieldDecorator('notificationNum', { initialValue: notificationNum })(
                          <span>{notificationNum}</span>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get(`hzero.common.status`).d('状态')}
                      >
                        {getFieldDecorator('notificationStatus', {
                          initialValue: notificationStatus,
                        })(<span>{notificationStatusMeaning}</span>)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get(`entity.roles.creator`).d('创建人')}
                      >
                        {getFieldDecorator('createdBy', { initialValue: createdBy })(
                          <span>{realName}</span>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={48} className="inclusion-row">
                    <Col span={8}>
                      <Form.Item
                        {...formItemLayout}
                        label={intl.get('hzero.common.date.creation').d('创建日期')}
                      >
                        {getFieldDecorator('creationDate', { initialValue: creationDate })(
                          <span>{dateTimeRender(creationDate)}</span>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={48}>
                    <Col span={24}>
                      <Form.Item>
                        {getFieldDecorator('notificationContent', {
                          initialValue: notificationContent,
                        })(
                          <div
                            style={{
                              border: '1px black solid',
                              width: '1000px',
                              margin: '30px auto 0',
                              height: '400px',
                              paddingTop: '30px',
                              overflow: 'auto',
                            }}
                            dangerouslySetInnerHTML={{ __html: notificationContent }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            </Fragment>
          </Spin>
        </Content>
        {recordVisible && <OperatorRecordModal {...OperationRecordProps} />}
      </Fragment>
    );
  }
}
