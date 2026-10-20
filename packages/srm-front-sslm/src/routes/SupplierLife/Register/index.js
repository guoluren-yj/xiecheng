/**
 * Standered - 供应商生命周期配置 - 注册申请界面
 * @date: 2018-9-11
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import qs from 'querystring';
import Bind from 'lodash-decorators/bind';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import InvestigationTab from '@/routes/Investigation/Component/Investigation';
import { Button as PerButton } from 'components/Permission';
import RegisterHeader from './Header';
import OperationsRecordModal from '../Components/OperationsRecordModal';

@connect(({ user, loading, registerApplication, commonApplication }) => ({
  registerApplication,
  commonApplication,
  organizationId: getCurrentOrganizationId(),
  isCreateUser: user.currentUser.id === registerApplication.registerInfo.createdBy,
  detailLoading:
    loading.effects['registerApplication/queryRegisterDetail'] ||
    loading.effects['commonApplication/queryLifecycleInfo'],
  saving: loading.effects['registerApplication/saveRegister'],
  deleting: loading.effects['registerApplication/deleteRegister'],
  releasing: loading.effects['registerApplication/releaseRegister'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.commonApplication', 'sslm.investigationReceived', 'sslm.common'],
})
export default class Register extends PureComponent {
  constructor(props) {
    super(props);
    const { location, match } = props;
    const readOnly = location.pathname.match('/register-view');
    const basePath = match.path.substring(0, match.path.indexOf('/register'));
    const queryParams = qs.parse(location.search.substr(1)); // 是否从列表跳转
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
    } = queryParams;
    const returnPath = match.path.substring(0, match.path.indexOf('/register-view'));
    const backPath = queryParams.gradeCode
      ? `${returnPath}/supplier-detail?${qs.stringify({
          tenantId,
          companyId,
          partnerCompanyId,
          partnerTenantId,
          supplierCompanyId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          changeReqId,
        })}`
      : queryParams.requisitionId
      ? `${basePath}/stage/${queryParams.toStageId}`
      : basePath;
    this.state = {
      readOnly,
      backPath,
      investigateTemplateId: undefined, // 调查表模板 id
      operationsRecordVisible: false,
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { supplierCompanyId, requisitionId } = qs.parse(prevProps.location.search.substr(1));
    const { supplierCompanyId: newSupplierCompanyId, requisitionId: newRequisitionId } = qs.parse(
      this.props.location.search.substr(1)
    );
    const changeFlag =
      supplierCompanyId !== newSupplierCompanyId || requisitionId !== newRequisitionId;
    return changeFlag;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.clearData();
      this.loadData();
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 初始化，查询值集
    dispatch({
      type: 'registerApplication/init',
    });
    this.loadData();
  }

  componentWillUnmount() {
    this.clearData();
  }

  /**
   * 清空model
   */
  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerApplication/updateState',
      payload: {
        registerInfo: {},
        previewConfig: [],
        investigateTypes: [],
      },
    });
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        lifecycleInfo: {},
      },
    });
  }

  /**
   * 查询页面初始数据
   * @param {Object} queryParams - 从路由上获取的查询对象
   */
  @Bind()
  loadData() {
    const { dispatch, location } = this.props;
    const queryParams = qs.parse(location.search.substr(1));
    const { requisitionId } = queryParams;
    if (requisitionId || requisitionId === 0) {
      this.queryDetail(requisitionId);
    } else {
      // 查询申请单所需供应商信息
      dispatch({
        type: 'commonApplication/queryLifecycleInfo',
        payload: queryParams,
      }).then(res => {
        if (!isEmpty(res)) {
          if (res.requisitionId || res.requisitionId === 0) {
            this.queryDetail(res.requisitionId);
          }
        }
      });
    }
  }

  /**
   * 查询申请单详情
   * @param {Number} requisitionId - 申请单 id
   */
  @Bind()
  queryDetail(requisitionId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerApplication/queryRegisterDetail',
      payload: {
        requisitionId,
      },
    }).then(response => {
      const { investigateHeaderSearchDTO = {} } = response;

      const { investigateTemplateId } = investigateHeaderSearchDTO || {};
      this.setState({
        investigateTemplateId,
      });
    });
  }

  /**
   * 查询调查表模板信息
   * @param {Number} investigateTemplateId - 调查表模板 id
   */
  @Bind()
  fetchTemplateConfig(investigateTemplateId) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'registerApplication/queryPreviewConfig',
      payload: {
        investigateTemplateId,
        organizationId,
      },
    });
  }

  @Bind()
  setTemplateId(investigateTemplateId) {
    this.setState({
      investigateTemplateId,
    });
  }

  /**
   * 保存注册申请
   */
  @Bind()
  saveRegister() {
    const {
      form,
      dispatch,
      registerApplication: { registerInfo = {} },
      commonApplication: {
        lifecycleInfo: {
          dimensionCode, // 维度 code
          lifeCycleId, // 供应商生命周期 id
          configId, // 生命周期配置 id
          stageId: fromStageId, // 当前阶段
          toStageId, // 目标阶段
          supplierTenantId,
          supplierCompanyId,
        } = {},
      },
    } = this.props;
    form.validateFields((error, fieldsValue) => {
      if (error) return;
      const {
        remark,
        processStatus,
        processDate,
        companyId,
        ...investigateHeaderSearchDTO
      } = fieldsValue;
      const { companyId: oldCompanyId } = registerInfo.investigateHeaderSearchDTO || {};
      const payload = registerInfo.documentNumber
        ? {
            ...registerInfo,
            remark,
            processStatus,
            processDate,
            companyId: companyId || oldCompanyId,
            investigateHeaderSearchDTO: {
              ...registerInfo.investigateHeaderSearchDTO,
              ...investigateHeaderSearchDTO,
            },
          }
        : {
            dimensionCode,
            lifeCycleId,
            configId,
            fromStageId,
            toStageId,
            remark,
            companyId,
            supplierTenantId,
            supplierCompanyId,
            investigateHeaderSearchDTO: {
              ...investigateHeaderSearchDTO,
            },
          };
      dispatch({
        type: 'registerApplication/saveRegister',
        payload,
      }).then(res => {
        if (res) {
          const { requisitionId } = res;
          if (requisitionId || requisitionId === 0) {
            // 查询注册申请页面详情
            dispatch({
              type: 'registerApplication/queryRegisterDetail',
              payload: {
                requisitionId,
              },
            }).then(response => {
              const {
                investigateHeaderSearchDTO: { investigateTemplateId },
              } = response;

              // 查询调查表模板预览配置
              if (investigateTemplateId) {
                dispatch({
                  type: 'registerApplication/queryPreviewConfig',
                  payload: {
                    investigateTemplateId,
                    organizationId: 1,
                  },
                });
              }
            });
          }
          notification.success();
        }
      });
    });
  }

  /**
   * 删除注册申请单
   */
  @Bind()
  deleteRegister() {
    const { backPath } = this.state;
    const {
      registerApplication: { registerInfo = {} },
      dispatch,
      history,
    } = this.props;
    const { requisitionId } = registerInfo;
    dispatch({
      type: 'registerApplication/deleteRegister',
      payload: { requisitionId },
    }).then(res => {
      if (res) {
        history.push(backPath);
        notification.success();
      }
    });
  }

  /**
   * 发布注册申请单
   */
  @Bind()
  releaseRegister() {
    const { backPath } = this.state;
    const {
      registerApplication: { registerInfo = {} },
      dispatch,
      history,
      form,
    } = this.props;

    form.validateFields((error, fieldsValue) => {
      if (error) return;
      const {
        remark,
        processStatus,
        processDate,
        companyId,
        ...investigateHeaderSearchDTO
      } = fieldsValue;
      const { companyId: oldCompanyId } = registerInfo.investigateHeaderSearchDTO || {};
      const payload = {
        ...registerInfo,
        remark,
        processStatus,
        processDate,
        companyId: companyId || oldCompanyId,
        investigateHeaderSearchDTO: {
          ...registerInfo.investigateHeaderSearchDTO,
          ...investigateHeaderSearchDTO,
        },
      };
      dispatch({
        type: 'registerApplication/releaseRegister',
        payload,
      }).then(res => {
        if (res) {
          history.push(backPath);
          notification.success();
        }
      });
    });
  }

  @Bind()
  openOperationsRecordModal() {
    this.setState({ operationsRecordVisible: true });
  }

  render() {
    const { readOnly, investigateTemplateId, backPath, operationsRecordVisible } = this.state;
    const {
      detailLoading,
      saving,
      deleting,
      releasing,
      form,
      organizationId,
      isCreateUser,
      registerApplication: { previewConfig, investigateTypes, registerInfo = {} },
      commonApplication: { lifecycleInfo = {} },
    } = this.props;
    const { investgHeaderId } = registerInfo.investigateHeaderSearchDTO || {};
    const { requisitionId, processStatus } = registerInfo;
    const hasId = requisitionId || requisitionId === 0;
    const info = hasId ? registerInfo : lifecycleInfo;
    // const spinning = hasId ? detailLoading : false;
    const titleType = info.toStageDescription || info.targetStageDescription;
    // 获取头信息
    const headerInfo = hasId ? registerInfo.investigateHeaderSearchDTO : lifecycleInfo;
    const allLoading = detailLoading || saving || deleting || releasing;
    return (
      <Fragment>
        <Header
          title={`${titleType}${intl.get(`sslm.commonApplication.view.title.apply`).d('申请')}`}
          backPath={backPath}
        >
          {!readOnly && !(hasId && !isCreateUser) && (
            <Fragment>
              <Button
                type="primary"
                icon="save"
                onClick={this.saveRegister}
                loading={allLoading}
                disabled={!(info.processStatus === 'NEW' || info.processStatus === undefined)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <PerButton
                icon="delete"
                loading={allLoading}
                permissionList={[
                  {
                    code: `srm.partner.suplier-lifecycle.management.ps.button.register.delete`,
                    type: 'button',
                    meaning: '注册申请单-删除',
                  },
                ]}
                onClick={this.deleteRegister}
                disabled={info.processStatus !== 'NEW'}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </PerButton>
              <Button
                icon="rocket"
                loading={allLoading}
                onClick={this.releaseRegister}
                disabled={info.processStatus !== 'NEW'}
              >
                {intl.get('hzero.common.button.release').d('发布')}
              </Button>
            </Fragment>
          )}
          <Button
            icon="file-text"
            onClick={this.openOperationsRecordModal}
            disabled={info.processStatus === undefined}
            loading={allLoading}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            <div className="table-list-search" style={{ marginLeft: 16 }}>
              <RegisterHeader
                form={form}
                readOnly={readOnly || (hasId && !isCreateUser)}
                investigateTypes={investigateTypes}
                registerInfo={headerInfo}
                setTemplateId={this.setTemplateId}
              />
            </div>
            {investigateTemplateId && (
              <InvestigationTab
                config={previewConfig}
                isQueryData={
                  processStatus === 'SUBMITTED' ||
                  processStatus === 'APPROVED' ||
                  processStatus === 'REJECTED'
                }
                investgHeaderId={investgHeaderId}
                organizationId={organizationId}
                investigateTemplateId={investigateTemplateId}
                tabPosition="left"
                key={investigateTemplateId}
                isEdit={false}
              />
            )}
          </Spin>
          {/* 操作记录-抽屉 */}
          <OperationsRecordModal
            visible={operationsRecordVisible}
            onClose={() => this.setState({ operationsRecordVisible: false })}
            processType="register"
            requisitionId={requisitionId}
          />
        </Content>
      </Fragment>
    );
  }
}
