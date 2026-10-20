/*
 * Detail - 平台级注册企业审批-详情
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Spin,
  Button,
  Modal,
  Form,
  TextArea,
  notification,
  Output,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isEmpty, camelCase } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  getLegalDS,
  getBussinessDS,
  getContactDS,
  getAddressDS,
  getBankInfoDS,
  getInvoiceDS,
  getFinanceDS,
  getAttachmentDS,
} from '@/routes/components/EnterpriseCertification/stores/indexDS';

import RegisterInfo from '@/routes/components/EnterpriseCertification/components/RegisterInfo';
import { operationRecordsModal } from '@/routes/components/OperationRecords';

import { renderStatus } from '@/routes/components/utils';
import {
  REGISTER_IN,
  REGISTER_OUT,
  BUSSINESS,
  BANK_ACCOUNT,
  CONTANT,
  ADDRESS,
  INVOICE,
  FIN,
  ATTACHMENT,
  getConfigKeyByconfigName,
  renderPlatformCardList,
} from '@/routes/components/EnterpriseCertification/utils/getCardList';
import {
  approvalAdopt,
  approvalReject,
  queryCompanyInfo,
  queryTabDataConfig,
  approveAutoCertification,
  querySiteUserAccountLogOff,
} from '@/services/enterpriseCertificationApprovalService';

import { transformFields } from '@/routes/components/EnterpriseCertification/utils/utils';
import { rejectModalDS, approvalResultDS } from './stores/indexDS';

import styles from '../index.less';

/**
 * 认证处理-详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.supplierInvite',
    'spfm.disposeInvite',
    'spfm.attachment',
    'entity.attachment',
    'spfm.enterprise',
    'sslm.investigCorrelat',
    'sslm.certificationApproval',
    'spfm.supplierRegister',
    'entity.company',
    'spfm.certificationApproval',
    'spfm.supplierManage',
    'spfm.contactPerson',
    'spfm.certification',
    'spfm.common',
    'spfm.address',
    'spfm.bank',
    'spfm.finance',
    'spfm.common',
    'sslm.common',
    'sslm.supplierInform',
    'sslm.enterpriseInform',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { changeReqId },
      },
    } = props;
    this.state = {
      changeReqId,
      basic: {},
      business: {},
      adoptLoading: false,
      mainDataTab: [], // 主数据页签字段
      configLoading: false,
      queryLoading: false,
      existFlag: false,
      weakCheckFlag: false, // 提交弱校验弹窗
    };
  }

  registerInfoDs = new DataSet(getLegalDS());

  businessInfoDs = new DataSet(getBussinessDS());

  contactInfoDs = new DataSet(getContactDS());

  addressDs = new DataSet(getAddressDS());

  bankInfoDs = new DataSet(getBankInfoDS());

  financeDs = new DataSet(getFinanceDS());

  invoiceDs = new DataSet(getInvoiceDS());

  attachmentDs = new DataSet(getAttachmentDS());

  approvalResultDs = new DataSet(approvalResultDS());

  componentDidMount() {
    this.handleQueryTabConfig();
  }

  // 查询表格配置
  @Bind()
  handleQueryTabConfig() {
    const { changeReqId } = this.state;
    this.setState({
      configLoading: true,
    });
    const payload = {
      changeReqId,
    };
    Promise.all([queryTabDataConfig(payload), querySiteUserAccountLogOff(payload)])
      .then(res => {
        const [configResp, userCheckResp] = res;
        if (getResponse(configResp)) {
          this.handleTabFields(configResp);
          this.handelCompanyInfo();
        }
        if (getResponse(userCheckResp)) {
          const { weakCheckResult = true } = userCheckResp;
          if (!weakCheckResult) {
            this.setState({
              weakCheckFlag: true,
            });
          }
        }
      })
      .finally(() => {
        this.setState({
          configLoading: false,
        });
      });
  }

  // 处理字段
  @Bind()
  handleTabFields(configList = []) {
    const mainDataTab = [];
    if (!isEmpty(configList)) {
      (configList || []).forEach(item => {
        const { strategyCfLineList, configName } = item;
        const { enableList } = this.handleFields(strategyCfLineList);
        const ds = this.getDataSetByConfigName(configName);
        if (ds) {
          const configInfo = {
            enableFieldList: enableList,
            configName,
          };
          mainDataTab.push({
            dataSet: ds,
            configInfo,
            configName,
          });
        }
      });
    }
    this.setState({
      mainDataTab,
    });
  }

  // 获取页签ds
  @Bind()
  getDataSetByConfigName(configName = '') {
    switch (configName) {
      case REGISTER_IN:
      case REGISTER_OUT:
        return this.registerInfoDs;
      case BUSSINESS:
        return this.businessInfoDs;
      case CONTANT:
        return this.contactInfoDs;
      case ADDRESS:
        return this.addressDs;
      case BANK_ACCOUNT:
        return this.bankInfoDs;
      case INVOICE:
        return this.invoiceDs;
      case FIN:
        return this.financeDs;
      case ATTACHMENT:
        return this.attachmentDs;
      default:
        return null;
    }
  }

  @Bind()
  handleFields(lineList = []) {
    const requiredList = [];
    const enableList = [];
    (lineList || []).forEach(item => {
      // 只传启用的字段
      const { fieldCode, requiredFlag } = item;
      const formatFieldCode = camelCase(fieldCode);
      const transformField = transformFields.find(n => n.name === formatFieldCode) || {};
      const finalFieldCode = transformField.code || formatFieldCode;
      if (requiredFlag) {
        requiredList.push(finalFieldCode);
      }
      enableList.push(finalFieldCode);
    });
    return {
      requiredList,
      enableList,
    };
  }

  /**
   * 公司信息
   */
  @Bind()
  handelCompanyInfo() {
    const { changeReqId } = this.state;
    if (changeReqId) {
      this.setState({
        queryLoading: true,
      });
      queryCompanyInfo({
        changeReqId,
        dataSource: 4,
      })
        .then(res => {
          if (getResponse(res)) {
            const {
              comBasicReq = {},
              comBusinessReq = {},
              comContactsReqs = [],
              comBankAccReqs = [],
              comAddressReqs = [],
              comInvoiceReq = {},
              comFinanceReqs = [],
              comAttachmentReqs = [],
            } = res;
            const {
              certificationStatus,
              certificationStatusMeaning,
              appealReason,
              errorMessage,
              existFlag,
            } = comBasicReq;
            this.approvalResultDs.loadData([
              {
                certificationStatus,
                certificationStatusMeaning,
                appealReason,
                errorMessage,
              },
            ]);
            this.contactInfoDs.loadData(comContactsReqs);
            this.addressDs.loadData(comAddressReqs);
            this.bankInfoDs.loadData(comBankAccReqs);
            this.invoiceDs.loadData([comInvoiceReq]);
            this.financeDs.loadData(comFinanceReqs);
            this.attachmentDs.loadData(comAttachmentReqs);
            this.setState({
              basic: comBasicReq,
              business: comBusinessReq,
              existFlag: !!existFlag,
            });
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    }
  }

  /**
   * 拒绝
   */
  @Bind()
  handleRejectModal() {
    const { changeReqId } = this.state;
    const rejectModalDs = new DataSet(rejectModalDS());
    const currentRecord = rejectModalDs?.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.supplierInvite.model.supplier.rejectReason').d('拒绝理由'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <TextArea name="remark" />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await currentRecord.validate();
          if (validateFlag) {
            const data = currentRecord.toJSONData();
            const { remark } = data;
            approvalReject({ changeReqId, remark }).then(res => {
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.handleGoToList();
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        }),
    });
  }

  /**
   * 返回列表
   */
  @Bind()
  handleGoToList() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/platform-certification-approval/list`,
      })
    );
  }

  @Bind()
  handleWeakModal(type = 'adopt') {
    const { weakCheckFlag } = this.state;
    if (weakCheckFlag) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <Fragment>
            <div>
              {intl
                .get('sslm.common.view.message.accountLogOffTips')
                .d(
                  '因离职或误操作等其他原因，提交此申请单的销售员账号已注销，请确认是否继续审批。'
                )}
            </div>
            <div style={{ marginTop: 2 }}>
              {intl
                .get('sslm.common.view.message.accountLogOffApproval')
                .d(
                  '注意：继续审批通过后只生成供应商企业，如需销售员协同后续业务，请联系供应商重新注册。'
                )}
            </div>
          </Fragment>
        ),
        onOk: () => {
          if (type === 'adopt') {
            this.handleApprovalAdopt();
          } else {
            this.handleCertification();
          }
        },
      });
    } else if (type === 'adopt') {
      this.handleApprovalAdopt();
    } else {
      this.handleCertification();
    }
  }

  /**
   * 审批通过
   */
  @Bind()
  handleApprovalAdopt() {
    const { dispatch } = this.props;
    const { changeReqId } = this.state;
    this.setState({
      adoptLoading: true,
    });
    approvalAdopt({ changeReqId })
      .then(res => {
        if (getResponse(res)) {
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          dispatch(
            routerRedux.push({
              pathname: `/sslm/platform-certification-approval/list`,
            })
          );
        }
      })
      .finally(() => {
        this.setState({
          adoptLoading: false,
        });
      });
  }

  /**
   * 三证验证
   */
  @Bind()
  handleCertification() {
    const { changeReqId } = this.state;
    this.setState({
      adoptLoading: true,
    });
    approveAutoCertification({ changeReqId })
      .then(res => {
        if (getResponse(res)) {
          const { processStatus } = res;
          if (processStatus === 'REJECT') {
            notification.success({
              placement: 'bottomRight',
              message: intl
                .get('spfm.certification.approval.message.CertificationFail')
                .d('认证失败'),
            });
            this.handleGoToList();
          } else {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.handleGoToList();
          }
        }
      })
      .finally(() => {
        this.setState({
          adoptLoading: false,
        });
      });
  }

  // 操作记录
  @Bind()
  handleOperate() {
    const { changeReqId } = this.state;
    operationRecordsModal({
      documentType: 'ENTERPRISE_APPROVAL_PLATFORM',
      changeReqId,
    });
  }

  render() {
    const {
      basic,
      business,
      adoptLoading,
      mainDataTab = [],
      configLoading,
      queryLoading,
      existFlag,
    } = this.state;
    const loading = queryLoading || configLoading || adoptLoading;
    const { reqStatus } = basic;
    // 状态为 SUBMIT，WFL_REJECT 时显示操作按钮
    const isEdit = ['SUBMIT', 'WFL_REJECT'].includes(reqStatus);
    const noNeedCertificationTips = intl
      .get(`sslm.certificationApproval.view.message.noNeedCertificationTips`)
      .d(
        '当前企业已和采购方建立合作伙伴关系，企业信息不支持在认证过程中修改，故不进行三方验证。如企业信息有误，请引导供应商在认证通过后进行企业信息变更。'
      );

    const allComponentProps = {
      [BUSSINESS]: {
        business,
      },
    };

    const commonProps = {
      sourceKey: 'platformApprove',
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.certificationApproval.view.title.certificationApproval')
            .d('注册企业审批（新）')}
          backPath="/sslm/platform-certification-approval/list"
        >
          <Button
            color="green"
            icon="check_circle"
            onClick={() => this.handleWeakModal('adopt')}
            loading={loading}
            hidden={!isEdit}
          >
            {intl.get('hzero.common.button.approvalAdopt').d('审批通过')}
          </Button>
          <Button
            icon="cancel"
            color="red"
            onClick={() => this.handleRejectModal()}
            loading={loading}
            hidden={!isEdit}
          >
            {intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝')}
          </Button>
          <Button
            funcType="flat"
            icon="verified_user"
            loading={loading}
            onClick={() => this.handleWeakModal('certification')}
            hidden={!isEdit || existFlag}
          >
            {intl.get('spfm.certificationApproval.view.button.verify').d('三证验证')}
          </Button>
          <Button
            icon="operation_service_request"
            funcType="flat"
            loading={loading}
            onClick={() => this.handleOperate()}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
        <Content className={styles['invite-certification-detail']}>
          <Spin spinning={loading}>
            <Content>
              <Card bordered={false}>
                <div>
                  {intl
                    .get(`sslm.certificationApproval.view.message.certificationResult`)
                    .d('三方认证结果')}
                </div>
                <Form
                  dataSet={this.approvalResultDs}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output name="certificationStatus" renderer={renderStatus} />
                  <Output
                    name="errorMessage"
                    newLine
                    renderer={({ value, record }) => {
                      const certificationStatus = record && record.get('certificationStatus');
                      const noNeedFlag = certificationStatus === 'NO_NEED';
                      const showText = value || noNeedFlag;
                      const textVlaue = noNeedFlag ? noNeedCertificationTips : value;
                      return showText ? (
                        <div
                          style={{
                            marginTop: 8,
                          }}
                        >
                          {textVlaue}
                        </div>
                      ) : (
                        ' '
                      );
                    }}
                  />
                </Form>
              </Card>
            </Content>
            <Content>
              <Card bordered={false}>
                <div>{intl.get(`spfm.enterprise.view.message.appealReason`).d('申诉原因')}</div>
                <Form
                  dataSet={this.approvalResultDs}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output name="appealReason" />
                </Form>
              </Card>
            </Content>
            <Content>
              <Card bordered={false}>
                <div>{intl.get(`spfm.enterprise.view.message.registerInfo`).d('登记信息')}</div>
                <RegisterInfo
                  dataSet={this.registerInfoDs}
                  basic={basic}
                  mainDataTab={mainDataTab}
                />
              </Card>
            </Content>
            {renderPlatformCardList({ renderTabList: mainDataTab }).map(card => {
              const { component: Com, label = '', dataSet, configName, configInfo = {} } = card;
              const configKey = getConfigKeyByconfigName(configName);
              const componentProps = allComponentProps[configName] || {};
              const comProps = {
                ...commonProps,
                [configKey]: configInfo,
                ...componentProps,
              };
              return (
                <Content>
                  <Card bordered={false}>
                    <div>{label}</div>
                    <Com dataSet={dataSet} {...comProps} />
                  </Card>
                </Content>
              );
            })}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
