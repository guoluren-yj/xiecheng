/**
 * 个人中心 基本信息
 * AccountInfo.js.js
 * @date 2018/11/23
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { Form, Icon, Input, message, Select, Tooltip, Alert } from 'hzero-ui';
import { Text, Tag, Avatar } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { map, some, isFunction } from 'lodash';
import { connect } from 'dva';
import {
  DataSet,
  Button,
  Modal,
  Form as C7NForm,
  TextField,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  isTenantRoleLevel,
  getCurrentRole,
  getUserOrganizationId,
  getEncodeFileUrl,
} from 'utils/utils';

import intl from 'utils/intl';
import AvatarUploadModal from './components/AvatarUploadModal';
import styles from './index.less';
import EditableListItem from './components/EditableListItem';

const editWidthStyle = { width: 240, verticalAlign: 'middle' };
const btnStyle = { marginLeft: 8 };
const isTenantRole = isTenantRoleLevel();
const currentUser = getCurrentRole(); // 获取当前登录用户的角色信息
const { code: currentUserCode } = currentUser;
const currentOrganizationId = getUserOrganizationId();
@connect(
  ({ user = {} }) => ({
    user,
  }),
  (dispatch) => ({
    // 更新当前角色(调接口)
    updateCurrentRole: (payload) =>
      dispatch({
        type: 'user/updateCurrentRole',
        payload,
      }),
    // 更新用户信息
    updateCurrentUser: (payload) =>
      dispatch({
        type: 'user/updateCurrentUser',
        payload,
      }),
  })
)
@Form.create({ fieldNameProp: null })
export default class AccountInfo extends React.Component {
  state = {
    // realNameEditing: false,
    defaultRoleProps: { editing: false },
    defaultCompanyProps: { editing: false },
    userAvatar: undefined,
    showAvatarEdit: false,
  };

  // 管理员申请信息
  applicantManagerFormDs = new DataSet({
    forceValidate: true,
    autoCreate: false,
    autoQuery: false,
    fields: [
      {
        name: 'applicantName',
        type: 'string',
        label: intl.get('hiam.userInfo.model.user.applicantName').d('申请人'),
        required: true,
      },
      {
        name: 'reason',
        type: 'string',
        label: intl.get('hiam.userInfo.model.user.reason').d('申请说明'),
        required: true,
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'spfm-comp',
        label: intl.get('hiam.userInfo.model.user.attachmentUuid').d('申请附件'),
        required: true,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hiam.userInfo.model.user.remark').d('拒绝理由'),
        disabled: true,
      },
    ],
  });

  componentDidMount() {
    const { initRoleDataSource, initCompanyDataSource, onFetchApplicantManagerStatus } = this.props;
    initRoleDataSource();
    initCompanyDataSource();
    onFetchApplicantManagerStatus();
    const userAvatar = this.props.userInfo && this.props.userInfo.imageUrl;
    if (userAvatar) {
      const img = new Image();
      img.onload = this.updateUserAvatar;
      img.onerror = this.setDefaultUserAvatar;
      img.src = getEncodeFileUrl(userAvatar);
    }
  }

  componentDidUpdate(prevProps) {
    const prevUserAvatar = prevProps.userInfo && prevProps.userInfo.imageUrl;
    const nextUserAvatar = this.props.userInfo && this.props.userInfo.imageUrl;
    if (prevUserAvatar !== nextUserAvatar) {
      // 只有当 用户头像存在 才会设置 用户头像
      if (nextUserAvatar) {
        const img = new Image();
        img.onload = this.updateUserAvatar;
        img.onerror = this.setDefaultUserAvatar;
        img.src = getEncodeFileUrl(nextUserAvatar);
      }
    }
  }

  @Bind()
  updateUserAvatar() {
    const nextUserAvatar = this.props.userInfo && this.props.userInfo.imageUrl;
    this.setState({
      userAvatar: nextUserAvatar,
    });
  }

  @Bind()
  setDefaultUserAvatar() {
    this.setState({
      userAvatar: undefined,
    });
  }

  render() {
    const { userInfo = {}, remote } = this.props;
    const { handleAccountInfo = undefined } = remote.props?.process || {};

    const {
      // realNameEditing,
      showAvatarEdit,
      userAvatar,
    } = this.state;
    return (
      <>
        <div className={styles.account}>
          <div className={styles['base-info']}>
            <div className={styles['base-info-item']}>
              <div className={styles['base-info-avatar-wrapper']}>
                <div
                  onMouseEnter={() => {
                    this.setState({ showAvatarEdit: true });
                  }}
                  onMouseLeave={() => {
                    this.setState({ showAvatarEdit: false });
                  }}
                >
                  <Avatar
                    className={styles['base-info-avatar']}
                    src={getEncodeFileUrl(userAvatar)}
                    size="large"
                  >
                    {(userInfo.realName || userInfo.currentRoleName || '').slice(0, 1)}
                  </Avatar>
                </div>
                <div
                  className={styles['base-info-avatar-backend']}
                  style={{ display: showAvatarEdit ? 'block' : 'none' }}
                >
                  <div
                    className={styles['base-info-avatar-edit']}
                    onMouseEnter={() => {
                      this.setState({ showAvatarEdit: true });
                    }}
                    onMouseLeave={() => {
                      this.setState({ showAvatarEdit: false });
                    }}
                  >
                    <Icon type="edit" onClick={this.handleAvatarUploadShow} />
                  </div>
                </div>
              </div>
              <div className={styles['base-info-username']}>
                <div className={styles.text} style={{ maxWidth: '260px' }}>
                  <Text>{userInfo.realName}</Text>
                </div>
                <div className={styles.label} style={{ maxWidth: '260px' }}>
                  <Text>{userInfo.loginName}</Text>
                </div>
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles.text} style={{ maxWidth: '260px' }}>
                <Text>{userInfo.groupName}</Text>
              </div>
              <div className={styles.label}>
                {intl.get('hiam.userInfo.model.user.groupName').d('所属集团')}
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div>
                <span className={styles.text}>{userInfo.startDateActive}</span>
                <span
                  className={styles.text}
                  style={{ color: '#4E5769', margin: '0 10px', fontWeight: 400 }}
                >
                  {intl.get('hzero.common.view.to').d('至')}
                </span>
                <span className={styles.text}>
                  {userInfo.endDateActive || intl.get('hzero.common.noLimit').d('无限')}
                </span>
              </div>
              <div className={styles.label}>
                {intl.get('hzero.common.effectiveTime').d('有效期')}
              </div>
            </div>
          </div>
          <div className={styles['list-content']}>
            {this.renderDefaultRole()}
            {this.renderDefaultCompany()}
            {isFunction(handleAccountInfo) ? handleAccountInfo(userInfo, { ...this.props }) : null}
          </div>
        </div>
      </>
    );
  }

  renderRealNameEdit() {
    const { userInfo, form, updateRealNameLoading } = this.props;
    return (
      <>
        <div className={styles['base-info-real-name-edit']}>
          {form.getFieldDecorator('realName', {
            initialValue: userInfo.realName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.userInfo.model.user.realName').d('昵称'),
                }),
              },
              {
                max: 40,
                message: intl.get('hzero.common.validation.max', { max: 40 }),
              },
            ],
          })(<Input />)}
          <a
            onClick={this.handleRealNameEditCancel}
            style={{ fontSize: '12px', color: '#aaadba', marginLeft: '8px' }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </a>
          <a className={styles['base-info-real-name-edit-save']} onClick={this.handleRealNameSave}>
            {updateRealNameLoading && <Icon type="loading" style={{ marginRight: '2px' }} />}
            {intl.get('hzero.common.button.save').d('保存')}
          </a>
        </div>
      </>
    );
  }

  renderRealName() {
    const { userInfo = {} } = this.props;
    return (
      <>
        <Tooltip
          title={userInfo.realName}
          placement="bottom"
          className={styles['base-info-real-name-content']}
        >
          <span
            className={styles['base-info-real-name-content']}
            style={{ width: '100%', marginRight: 0 }}
          >
            {userInfo.realName}
          </span>
        </Tooltip>
        {/* <a onClick={this.handleRealNameEdit}>
          <img src={editIcon} alt="edit" width="14px" height="14px" />
        </a> */}
      </>
    );
  }

  renderDefaultRole() {
    const {
      userInfo = {},
      roleDataSource = [],
      form,
      updateRoleLoading,
      applicantManagerLoading,
      applicantManagerStatus,
    } = this.props;
    const {
      defaultRoleProps: { editing = false },
    } = this.state;
    let content;
    // 管理员申请是否禁用，当审批通过时，禁用
    let editApplicantManagerflag = true;
    editApplicantManagerflag = !['SUCCESS'].includes(applicantManagerStatus);
    if (editing) {
      const roleOptions = map(roleDataSource, (role) => (
        <Select.Option key={role.id} value={role.id}>
          {role.name}
        </Select.Option>
      ));
      content = (
        <>
          {form.getFieldDecorator('defaultRole', {
            initialValue: userInfo.defaultRoleId,
          })(
            <Select allowClear style={editWidthStyle}>
              {roleOptions}
            </Select>
          )}
          <Button
            color="primary"
            style={btnStyle}
            loading={updateRoleLoading}
            onClick={this.handleDefaultRoleUpdate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button style={btnStyle} onClick={this.handleDefaultRoleEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      // 初始认证角色或者平台0租户不展示管理员申请按钮
      const isCertificationFlag =
        currentUserCode === 'certification' || currentOrganizationId === 0;
      if (isTenantRole && !isCertificationFlag) {
        content = (
          <>
            <Tooltip
              overlayStyle={{ display: editApplicantManagerflag ? 'none' : '' }}
              title={intl
                .get(`hiam.userInfo.view.message.tooltipPrompt`)
                .d('您提交的管理员申请已审批通过，无需再次申请')}
            >
              <Button
                key="applicant"
                onClick={this.handleApplicantManager}
                loading={applicantManagerLoading}
                disabled={!editApplicantManagerflag}
              >
                {intl.get('hiam.userInfo.button.applicantManager').d('管理员申请')}
              </Button>
            </Tooltip>
            <Button key="update" style={btnStyle} onClick={this.handleDefaultRoleEdit}>
              {intl.get('hzero.common.button.update').d('修改')}
            </Button>
          </>
        );
      }
    }
    return (
      <EditableListItem
        key="default-role"
        title={
          <div>
            {userInfo.defaultRoleName && (
              <span style={{ marginRight: '8px' }}>{userInfo.defaultRoleName}</span>
            )}
            <Tag color="geekblue">
              {intl.get('hiam.userInfo.model.user.defaultRole').d('默认角色')}
            </Tag>
          </div>
        }
        description={intl.get('hiam.userInfo.view.message.role').d('登录汉得云时默认使用的角色')}
        content={content}
      />
    );
  }

  renderDefaultCompany() {
    const { userInfo = {}, companyDataSource = [], form, updateCompanyLoading } = this.props;
    const {
      defaultCompanyProps: { editing = false },
    } = this.state;
    const curCompanyCanAssign = some(
      companyDataSource,
      (company) => company.companyId === userInfo.defaultCompanyId
    );
    let content;
    if (editing) {
      const companyOptions = map(companyDataSource, (company) => (
        <Select.Option key={company.companyId} value={company.companyId}>
          {company.companyName}
        </Select.Option>
      ));
      content = (
        <>
          {form.getFieldDecorator('defaultCompany', {
            initialValue: curCompanyCanAssign ? userInfo.defaultCompanyId : undefined,
          })(
            <Select allowClear style={editWidthStyle}>
              {companyOptions}
            </Select>
          )}
          <Button
            color="primary"
            style={btnStyle}
            loading={updateCompanyLoading}
            onClick={this.handleDefaultCompanyUpdate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button style={btnStyle} onClick={this.handleDefaultCompanyEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleDefaultCompanyEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="default-company"
        title={
          <div>
            {curCompanyCanAssign && userInfo.defaultCompanyName && (
              <span style={{ marginRight: '8px' }}>{userInfo.defaultCompanyName}</span>
            )}
            <Tag color="geekblue">
              {intl.get('hiam.userInfo.model.user.defaultCompany').d('默认公司')}
            </Tag>
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.company')
          .d('在汉得云平台内根据权限分配的公司中的默认公司选项')}
        content={content}
      />
    );
  }

  // role
  @Bind()
  handleDefaultRoleEdit() {
    this.setState({
      defaultRoleProps: { editing: true },
    });
  }

  @Bind()
  handleDefaultRoleEditCancel() {
    const { form } = this.props;
    form.resetFields(['defaultRole']);
    this.setState({
      defaultRoleProps: { editing: false },
    });
  }

  @Bind()
  handleApplicantManager() {
    const { onFetchApplicantManagerStatus } = this.props;
    onFetchApplicantManagerStatus().then((res) => {
      // 提交按钮是否展示(当状态为：'APPROVING', 'SUCCESS' 时不可提交)
      let applicantManagerEdit = true;
      // 拒绝理由字段显示标识(状态为"拒绝"时显示)
      let isShowRejectReason = false;
      if (res) {
        isShowRejectReason = ['REJECT'].includes(res.status);
        applicantManagerEdit = !['APPROVING', 'SUCCESS'].includes(res.status);
        this.applicantManagerFormDs.loadData([
          {
            ...res,
          },
        ]);
      }
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: {
          width: 380,
        },
        bodyStyle: { padding: 0 },
        title: intl.get('hiam.userInfo.button.applicantManager').d('管理员申请'),
        okText: intl.get('hzero.common.button.commit').d('提交'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        okFirst: true,
        destroyOnClose: true,
        children: (
          <Fragment>
            {!applicantManagerEdit && (
              <Alert
                banner
                showIcon
                closable
                type="info"
                iconType="help"
                message={intl
                  .get('hiam.userInfo.view.title.hasSubmittedRemark')
                  .d(
                    '您已提交管理员申请，请耐心等待；如长时间未审核，请联系您的项目经理或运维经理'
                  )}
              />
            )}
            <TopSection className={styles['applicant-manager-wrap']}>
              {isShowRejectReason && (
                <SecondSection title={intl.get('hiam.userInfo.model.user.remark').d('拒绝理由')}>
                  <C7NForm dataSet={this.applicantManagerFormDs} labelLayout="float" columns={1}>
                    <TextArea name="remark" />
                  </C7NForm>
                </SecondSection>
              )}
              <SecondSection
                title={intl.get('hiam.userInfo.view.title.subMain.baseInfo').d('基本信息')}
              >
                <C7NForm dataSet={this.applicantManagerFormDs} labelLayout="float" columns={1}>
                  <TextField name="applicantName" disabled={!applicantManagerEdit} />
                  <TextArea name="reason" disabled={!applicantManagerEdit} />
                </C7NForm>
              </SecondSection>
              <SecondSection title={intl.get('hiam.userInfo.view.title.attachmentInfo').d('附件')}>
                <div className={styles['modal-content-help']}>
                  {intl
                    .get('hiam.userInfo.view.message.helpContent')
                    .d('请上传可以证明您在该企业中有管理身份与附件，如名片/组织架构等信息')}
                </div>
                <C7NForm dataSet={this.applicantManagerFormDs} labelLayout="float" columns={1}>
                  <Attachment
                    crossTenant
                    name="attachmentUuid"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="spfm-comp"
                    readOnly={!applicantManagerEdit}
                  />
                </C7NForm>
              </SecondSection>
            </TopSection>
          </Fragment>
        ),
        onOk: this.handleCreateOk,
        okButton: applicantManagerEdit,
        afterClose: () => {
          this.applicantManagerFormDs.reset();
        },
      });
    });
  }

  @Bind()
  async handleCreateOk() {
    const { onHandleApplicantManagerSubmit } = this.props;
    const formValues = this.applicantManagerFormDs.current?.toData() || {};
    const checkResult = await this.applicantManagerFormDs.validate();
    const params = {
      ...formValues,
    };
    if (checkResult) {
      onHandleApplicantManagerSubmit(params).then((res) => {
        if (res) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  }

  @Bind()
  handleDefaultRoleUpdate() {
    const { form, onDefaultRoleSave } = this.props;
    form.validateFields(['defaultRole'], (err, data) => {
      if (!err) {
        onDefaultRoleSave(data.defaultRole).then((res) => {
          if (res) {
            form.resetFields(['defaultRole']);
            this.handleDefaultRoleEditCancel();
          }
        });
      }
    });
  }

  // company
  @Bind()
  handleDefaultCompanyEdit() {
    this.setState({
      defaultCompanyProps: { editing: true },
    });
  }

  @Bind()
  handleDefaultCompanyEditCancel() {
    this.setState({
      defaultCompanyProps: { editing: false },
    });
  }

  @Bind()
  handleDefaultCompanyUpdate() {
    const { form, onDefaultCompanySave, updateCurrentUser, user } = this.props;
    form.validateFields(['defaultCompany'], (err, data) => {
      if (!err) {
        onDefaultCompanySave(data.defaultCompany).then((res) => {
          if (res) {
            form.resetFields(['defaultCompany']);
            this.handleDefaultCompanyEditCancel();
            updateCurrentUser({
              additionInfo: {
                ...(((user || {}).currentUser || {}).additionInfo || {}),
                defaultCompanyId: data.defaultCompany,
              },
            });
          }
        });
      }
    });
  }

  // real-name

  // @Bind()
  // handleRealNameEdit() {
  //   this.setState({
  //     realNameEditing: true,
  //   });
  // }

  // @Bind()
  // handleRealNameEditCancel() {
  //   this.setState({
  //     realNameEditing: false,
  //   });
  // }

  @Bind()
  handleRealNameSave(e) {
    e.preventDefault();
    const { onSaveRealName, form } = this.props;
    form.validateFields(['realName'], (err, data) => {
      if (err) {
        let errorMessage = '';
        err.realName.errors.forEach((er) => {
          errorMessage += er.message;
        });
        message.error(errorMessage);
      } else {
        onSaveRealName(data.realName);
        // onSaveRealName(data.realName).then(res => {
        //   if (res) {
        //     this.setState({
        //       realNameEditing: false,
        //     });
        //   }
        // });
      }
    });
  }

  // avatar

  @Bind()
  handleAvatarUploadShow(e) {
    e.preventDefault();
    const { organizationId } = this.props;
    Modal.open({
      title: intl.get('hiam.userInfo.view.message.changeAvatar').d('更换头像'),
      className: styles['avatar-modal'],
      closable: true,
      drawer: true,
      onClose: this.handleAvatarUploadHidden,
      children: (
        <AvatarUploadModal
          onOk={this.handleAvatarUploadHidden}
          onCancel={this.handleAvatarUploadHidden}
          organizationId={organizationId}
        />
      ),
      footer: null,
    });
  }

  @Bind()
  handleAvatarUploadHidden() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/updateState',
      payload: { uploadImgPreviewUrl: '', uploadImgName: '' },
    });
  }
}
