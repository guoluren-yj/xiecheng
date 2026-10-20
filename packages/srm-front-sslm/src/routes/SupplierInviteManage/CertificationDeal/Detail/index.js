/*
 * Detail - 认证及邀约处理-详情
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment, createRef } from 'react';
import { DataSet, Spin, Modal, Form, TextArea, notification, Output } from 'choerodon-ui/pro';
import remote from 'utils/remote';
import { Card } from 'choerodon-ui';
import queryString from 'querystring';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isEmpty, camelCase } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TopSection, SecondSection } from '_components/Section';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';

import RegisterInfo from '@/routes/components/EnterpriseCertification/components/RegisterInfo';
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
import { renderStatus } from '@/routes/components/utils';
import { aiApprove, enterpriseTagsConfig, fetchApproveStatus } from '@/services/commonService';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import Investigation from '@/routes/components/Investigation';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import {
  approvalAdopt,
  approvalReject,
  queryTabDataConfig,
  approveAutoCertification,
  saveData,
  queryTenantUserAccountLogOff,
} from '@/services/supplierInviteManageServices';
import {
  queryCompanyBasic,
  queryBussiness,
  queryContactInfo,
  queryAttachmentInfo,
  queryAddressInfo,
  queryBankInfo,
  queryInvoiceInfo,
  queryFinanceInfo,
  fetchAiApproveData,
} from '@/services/enterpriseCertificationService';
import { transformFields } from '@/routes/components/EnterpriseCertification/utils/utils';
import {
  queryAllApprovalData,
  handleRevokeApprova,
  handleApprove,
} from '@/routes/components/WorkFlowApproval';
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
  OTHERINFO,
  getConfigKeyByconfigName,
} from '@/routes/components/EnterpriseCertification/utils/getCardList';
import { RiskProfile } from '@/routes/components/EnterpriseRelationSearch';

import RegisterInviteInfo from './components/RegisterInviteInfo';
import ManualReviewInfo from '../../components/ManualReviewInfo';
import InviteInfo from '../../components/InviteInfo';

import HeaderBtn from './components/HeaderBtn';
import {
  approvalModalDS,
  inviteHeaderDS,
  otherInfoDS,
  approvalResultDS,
  getManualReviewDS,
} from './stores/indexDS';
import { inviteInfoDS } from '../../InviteQuery/stores/indexDS';
import { getCardList } from './utils/getCardList';
import styles from '../../index.less';

const organizationId = getCurrentOrganizationId();
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

const sourceKey = 'CERTIFICATION_DEAL';

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

@remote({
  code: 'SSLM_CERTIFICATIONDEAL_DEFINITION', // 对应二开模块暴露的Expose的编码
  name: 'certificationDealRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@formatterCollections({
  code: [
    'sslm.supplierInvite',
    'spfm.disposeInvite',
    'spfm.attachment',
    'entity.attachment',
    'spfm.enterprise',
    'sslm.investigCorrelat',
    'spfm.enterpriseCertification',
    'entity.company',
    'spfm.contactPerson',
    'spfm.supplierManage',
    'spfm.supplierRegister',
    'spfm.enterpriseCertification',
    'sslm.certificationApproval',
    'spfm.certificationApproval',
    'spfm.bank',
    'spfm.address',
    'spfm.finance',
    'spfm.common',
    'sslm.supplierInform',
    'sslm.common',
    'sslm.registerPolicy',
    'spfm.invitationRegister',
    'spfm.companySearch',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.ENT_CER_PRO.OTHER_INFO',
    'SSLM.ENT_CER_PRO.HEADER_BTNS',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_SUP_SAL_FORM',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OFFER_INFO',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_INV_PUR',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OTHERINFO',
    'SSLM.ENT_CER_PRO.DETAIL.CARDS',
    'SSLM.ENT_CER_PRO.DETAIL.POLICY_INVITE_INFO', // 注册策略邀约信息
    'SSLM.ENT_CER_PRO.DETAIL_APPROVAL_ADOPT_MODAL',
    'SSLM.ENT_CER_PRO.DETAIL_APPROVAL_REJECT_MODAL',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { changeReqId },
      },
      certificationDealRemote,
    } = props;
    const isPub = props.location.pathname.includes('/pub/');
    const routerParam = queryString.parse(props.location.search.substr(1));
    const {
      investigateTemplateId,
      investgHeaderId,
      // dimensionCode,
      allowSupplierInvite,
    } = routerParam;
    this.state = {
      changeReqId,
      investigateTemplateId,
      investgHeaderId,
      basic: {},
      business: {},
      adoptLoading: false,
      showTagFlag: true, // 默认展示企业标签
      // dimensionCode,
      // configNameList: [], // 展示页签
      allowSupplierInviteFlag: !!Number(allowSupplierInvite),
      showManualReviewFlag: false,
      mainDataTab: [], // 主数据页签字段
      configLoading: false,
      queryLoading: false,
      isPub,
      weakCheckFlag: false, // 提交弱校验弹窗
      approvalDataMap: {},
      revokeDataMap: {},
      manualReview: {}, // 注册策略-关联企业-人工审核信息
      aiApproveDTOList: [],
      aiApproveStatus: null,
      reviewIsClick: false, // 记录【智能预审】按钮是否点击了
    };
    const inviteHeaderDsProps = inviteHeaderDS();
    // 埋点修改后的ds属性
    const newInviteHeaderDsProps = certificationDealRemote
      ? certificationDealRemote.process(
          'SSLM_CERTIFICATIONDEAL_POLICY_INVITE_DS_PROCESS',
          inviteHeaderDsProps,
          {}
        )
      : inviteHeaderDsProps;
    this.inviteHeaderDs = new DataSet(newInviteHeaderDsProps);
    const otherInfoDsProps = certificationDealRemote.process(
      'SSLM_CERTIFICATIONDEAL_DEFINITION_OTHER_DS_PROCESS',
      otherInfoDS(),
      {}
    );
    this.otherInfoDs = new DataSet(otherInfoDsProps);
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

  manualReviewDs = new DataSet(getManualReviewDS());

  inviteInfoDs = new DataSet(inviteInfoDS({ inviteSupplierFlag: false }));

  timerRef = createRef(null); // 定时器

  timerTime = createRef(0); // 记录轮询次数

  componentDidMount() {
    this.handleQueryTabConfig();
    this.handleEnterpriseTags();
    this.handleAiApproveData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { reviewIsClick } = this.state;
    const { reviewIsClick: prevReviewIsClick } = prevState;
    if (reviewIsClick !== prevReviewIsClick) {
      this.timerRef.current = setInterval(() => this.getAiApproveResult(), 5000);
    }
  }

  // 查询当前功能是否开启企业标签功能
  @Bind()
  handleEnterpriseTags() {
    enterpriseTagsConfig({ menuNum: '1' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        this.setState({ showTagFlag: false });
      }
    });
  }

  // 查询智能审核相关数据
  @Bind()
  handleAiApproveData() {
    const { changeReqId } = this.state;
    fetchAiApproveData({
      documentType: 'REGISTER',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({ aiApproveDTOList: res });
      }
    });
    fetchApproveStatus({
      documentType: 'REGISTER',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({ aiApproveStatus: res.status });
      }
    });
  }

  /**
   * 公司信息
   */
  @Bind()
  handelCompanyInfo() {
    const { changeReqId, allowSupplierInviteFlag } = this.state;
    this.inviteHeaderDs.setQueryParameter('queryParams', {
      changeReqId,
      customizeUnitCode: 'SSLM.ENT_CER_PRO.DETAIL.POLICY_INVITE_INFO',
    });
    this.manualReviewDs.setQueryParameter('changeReqId', changeReqId);
    // 协鑫二开埋点查询参数，勿删
    this.otherInfoDs.setQueryParameter('queryParam', {
      customizeUnitCode: 'SSLM.ENT_CER_PRO.OTHER_INFO',
      changeReqId,
    });

    const payload = {
      changeReqId,
      dataSource: 4,
    };
    this.setState({
      queryLoading: true,
    });
    Promise.all([
      // 登记信息
      queryCompanyBasic(payload),
      // 业务信息
      queryBussiness(payload),
      // 联系人
      queryContactInfo(payload),
      // 地址
      queryAddressInfo(payload),
      // 银行
      queryBankInfo(payload),
      // 开票
      queryInvoiceInfo(payload),
      // 财务
      queryFinanceInfo(payload),
      // 附件
      queryAttachmentInfo(payload),
      this.manualReviewDs.query(),
      queryTenantUserAccountLogOff({
        changeReqId,
      }),
      // 邀约
      this.inviteHeaderDs.query(),
      this.otherInfoDs.query(),
    ])
      .then(res => {
        const [
          basicInfo,
          businessInfo,
          contactInfo,
          addressInfo,
          bankInfo,
          invoiceInfo,
          financeInfo,
          attachmentInfo,
          manualReviewInfo,
          userCheckResp,
        ] = res;
        let basic = {};
        let business = {};
        let manualReview = {}; // 注册策略-关联企业-人工审核信息
        let showManualReviewFlag = false;
        let weakCheckFlag = false;
        let inviteRegister = false;
        if (getResponse(basicInfo)) {
          basic = basicInfo;
          const {
            certificationStatus,
            certificationStatusMeaning,
            appealReason,
            errorMessage,
            supRegisteredSource,
          } = basicInfo;
          this.approvalResultDs.loadData([
            {
              certificationStatus,
              certificationStatusMeaning,
              appealReason,
              errorMessage,
            },
          ]);
          this.inviteInfoDs.setState('inviteType', supRegisteredSource);
          // 处理审批/撤销审批
          this.handleQueryAllApprovalData(basicInfo);
        }
        if (getResponse(businessInfo)) {
          business = businessInfo;
        }
        if (getResponse(contactInfo)) {
          this.contactInfoDs.loadData(contactInfo);
        }
        if (getResponse(addressInfo)) {
          this.addressDs.loadData(addressInfo);
        }
        if (getResponse(bankInfo)) {
          this.bankInfoDs.loadData(bankInfo);
        }
        if (getResponse(invoiceInfo)) {
          this.invoiceDs.loadData([invoiceInfo]);
        }
        if (getResponse(financeInfo)) {
          this.financeDs.loadData(financeInfo);
        }
        if (getResponse(attachmentInfo)) {
          this.attachmentDs.loadData(attachmentInfo);
        }
        if (getResponse(manualReviewInfo)) {
          manualReview = manualReviewInfo;
          const { attestationType, invitationCode } = manualReviewInfo;
          showManualReviewFlag = attestationType === 'MANPOWER';
          inviteRegister = !!invitationCode;
        }
        if (getResponse(userCheckResp)) {
          const { weakCheckResult = true } = userCheckResp;
          if (!weakCheckResult) {
            weakCheckFlag = true;
          }
        }
        this.setState({
          basic,
          business,
          showManualReviewFlag,
          weakCheckFlag,
          allowSupplierInviteFlag: inviteRegister ? false : allowSupplierInviteFlag,
          manualReview,
        });
      })
      .finally(() => {
        this.setState({
          queryLoading: false,
        });
      });
  }

  // 查询表格配置
  @Bind()
  handleQueryTabConfig() {
    const { changeReqId } = this.state;
    this.setState({
      configLoading: true,
    });
    queryTabDataConfig({
      changeReqId,
    })
      .then(res => {
        if (getResponse(res)) {
          this.handleTabFields(res);
          // todo 查询数据
          this.handelCompanyInfo();
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
      case OTHERINFO:
        return this.otherInfoDs;
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

  @Bind()
  handleQueryAllApprovalData(params = {}) {
    const { businessKey } = params;
    if (businessKey) {
      queryAllApprovalData({ businessKeys: [businessKey], queryHistoryFlag: false }).then(res => {
        if (res) {
          const { approvalDataMap, revokeDataMap } = res;
          this.setState({
            approvalDataMap,
            revokeDataMap,
          });
        }
      });
    } else {
      this.setState({
        approvalDataMap: {},
        revokeDataMap: {},
      });
    }
  }

  /**
   * 拒绝
   */
  @Bind()
  handleRejectModal() {
    const { dispatch, customizeForm } = this.props;
    const { changeReqId } = this.state;
    const rejectModalDs = new DataSet(approvalModalDS('reject'));
    const currentRecord = rejectModalDs?.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.supplierInvite.model.supplier.rejectReason').d('拒绝理由'),
      children: customizeForm(
        {
          code: 'SSLM.ENT_CER_PRO.DETAIL_APPROVAL_REJECT_MODAL',
        },
        <Form dataSet={rejectModalDs} labelLayout="float" columns={1}>
          <TextArea name="remark" resize="vertical" rows={16} />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await currentRecord.validate(true);
          if (validateFlag) {
            const data = currentRecord.toJSONData();
            const { remark } = data;
            approvalReject({
              changeReqId,
              remark,
              customizeUnitCode: 'SSLM.ENT_CER_PRO.DETAIL_APPROVAL_REJECT_MODAL',
            }).then(res => {
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                dispatch(
                  routerRedux.push({
                    pathname: `/sslm/supplier-invite-manage/list`,
                  })
                );
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
   * 审批通过
   * 分两次调用一次保存其他信息页签数据，另一次是调用审批通过（ps：后端说是两个服务，所以没用一个接口）
   */
  @Bind()
  handleApprovalAdopt() {
    const { dispatch, customizeForm } = this.props;
    const { changeReqId } = this.state;
    const adoptModalDs = new DataSet(approvalModalDS());
    const currentRecord = adoptModalDs?.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.supplierInvite.model.supplier.approveRemark').d('审批意见'),
      children: customizeForm(
        {
          code: 'SSLM.ENT_CER_PRO.DETAIL_APPROVAL_ADOPT_MODAL',
        },
        <Form dataSet={adoptModalDs} labelLayout="float" columns={1}>
          <TextArea name="approveRemark" />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          // 校验其他信息
          const payload = await this.getSaveParam();
          if (payload) {
            const validateFlag = await currentRecord.validate(true);
            if (validateFlag) {
              // 保存邀约，其他信息
              saveData(payload).then(otherResp => {
                if (getResponse(otherResp)) {
                  // 审批通过
                  const data = currentRecord.toJSONData();
                  const { approveRemark } = data;
                  approvalAdopt({
                    changeReqId,
                    approveRemark,
                    customizeUnitCode: 'SSLM.ENT_CER_PRO.DETAIL_APPROVAL_ADOPT_MODAL',
                  }).then(res => {
                    if (getResponse(res)) {
                      resolve();
                      notification.success({
                        placement: 'bottomRight',
                        message: intl.get('hzero.common.notification.success').d('操作成功'),
                      });
                      dispatch(
                        routerRedux.push({
                          pathname: `/sslm/supplier-invite-manage/list`,
                        })
                      );
                    } else {
                      resolve(false);
                    }
                  });
                } else {
                  resolve(false);
                }
              });
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
            notification.error({
              placement: 'bottomRight',
              message: intl.get('sslm.common.view.message.maintainInfo').d('请填写相关信息！'),
            });
          }
        }),
    });
  }

  // 操作记录
  @Bind()
  handleOperate() {
    const { changeReqId } = this.state;
    operationRecordsModal({
      documentType: 'ENTERPRISE_APPROVAL_TENANT',
      changeReqId,
      documentId: changeReqId,
    });
  }

  /**
   * 三证验证
   * 分两次调用一次保存其他信息页签数据，另一次是调用三证验证（ps：后端说是两个服务，所以没用一个接口）
   */
  @Bind()
  handleCertification() {
    const { changeReqId } = this.state;
    return new Promise(async resolve => {
      // 校验其他信息
      const payload = await this.getSaveParam();
      if (payload) {
        this.setState({
          queryLoading: true,
        });
        // 保存其他信息
        saveData(payload)
          .then(otherResp => {
            if (getResponse(otherResp)) {
              // 三证验证
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
                    } else {
                      notification.success({
                        placement: 'bottomRight',
                        message: intl.get('hzero.common.notification.success').d('操作成功'),
                      });
                    }
                    // 刷新数据
                    resolve();
                    this.handelCompanyInfo();
                  } else {
                    resolve(false);
                  }
                })
                .finally(() => {
                  this.setState({
                    adoptLoading: false,
                  });
                });
            } else {
              resolve(false);
            }
          })
          .finally(() => {
            this.setState({
              queryLoading: false,
            });
          });
      } else {
        resolve(false);
        notification.error({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请填写相关信息！'),
        });
      }
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
        pathname: `/sslm/supplier-invite-manage/list`,
      })
    );
  }

  // 保存
  @Bind()
  async handleSave() {
    const payload = await this.getSaveParam();
    if (payload) {
      this.setState({
        queryLoading: true,
      });
      return saveData(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            // 刷新数据
            this.handelCompanyInfo();
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    }
  }

  @Bind
  async getSaveParam() {
    const { changeReqId, allowSupplierInviteFlag } = this.state;
    const otherInfoValidateFlag = await this.otherInfoDs?.current.validate(true);
    const inviteValidateFlag = allowSupplierInviteFlag
      ? await this.inviteHeaderDs?.current.validate(true)
      : true;
    if (otherInfoValidateFlag && inviteValidateFlag) {
      const otherInfoData = this.otherInfoDs?.current.toData() || {};
      const inviteData = this.inviteHeaderDs?.current.toData() || {};
      const firmEnteringParent = allowSupplierInviteFlag ? inviteData : null;
      const supChangeOther = otherInfoData;
      return {
        firmEnteringParent,
        supChangeOther,
        changeReqId,
        customizeUnitCode: 'SSLM.ENT_CER_PRO.OTHER_INFO,SSLM.ENT_CER_PRO.DETAIL.POLICY_INVITE_INFO',
        dataSource: 4,
      };
    } else {
      return false;
    }
  }

  @Bind()
  handleWeakModal() {
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
          this.handleApprovalAdopt();
        },
      });
    } else {
      this.handleApprovalAdopt();
    }
  }

  @Bind()
  handleReqApprove() {
    const { approvalDataMap, basic } = this.state;
    const { businessKey } = basic || {};
    // 审批
    const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
    handleApprove({
      approveProps: {
        ...approvalBtnProps,
        onSuccess: this.handelCompanyInfo,
      },
    });
  }

  @Bind()
  handleReqRevokeApprova() {
    const { basic } = this.state;
    const { businessKey } = basic || {};
    handleRevokeApprova({
      businessKey,
      onSuccess: this.handelCompanyInfo,
    });
  }

  @Bind()
  handleSetLoading(flag = false) {
    this.setState({
      queryLoading: flag,
    });
  }

  // 处理埋点
  @Bind()
  handleBurialPoint() {
    const { basic } = this.state;
    const result = {
      type: 'tenantCertificationDeal',
      otherProps: {
        basicInfo: { ...basic },
      },
    };
    return result;
  }

  // 清除轮循计时器
  @Bind()
  clearTimerRef() {
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
    }
  }

  // 轮询【智能审核】结果
  @Bind()
  async getAiApproveResult() {
    const { changeReqId } = this.state;
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'REGISTER', documentId: changeReqId })
    );
    if (res) {
      this.setState({ aiApproveStatus: res.status });
      this.timerTime.current++;
      if (this.timerTime.current > 4 || res.status !== 'APPROVING') {
        this.timerTime.current = 0;
        this.clearTimerRef();
        this.setState({ reviewIsClick: false });
      }
    } else {
      this.clearTimerRef();
    }
  }

  // 【智能审核】回调
  @Bind()
  async handleIntelligentReview() {
    const { changeReqId } = this.state;
    const payload = await this.getSaveParam();
    if (payload) {
      this.setState({
        queryLoading: true,
      });
      return saveData(payload)
        .then(async res => {
          if (getResponse(res)) {
            await aiApprove({
              documentType: 'REGISTER',
              documentId: changeReqId,
            }).then(response => {
              if (getResponse(response)) {
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.setState({ reviewIsClick: true });
              }
            });
          }
        })
        .finally(() => {
          this.handelCompanyInfo();
          this.handleAiApproveData();
          this.setState({
            queryLoading: false,
          });
        });
    }
  }

  render() {
    const {
      changeReqId,
      basic,
      business,
      adoptLoading,
      investigateTemplateId,
      investgHeaderId,
      // dimensionCode,
      // configNameList = [],
      mainDataTab = [],
      configLoading,
      queryLoading,
      allowSupplierInviteFlag,
      isPub,
      showTagFlag,
      showManualReviewFlag,
      approvalDataMap,
      revokeDataMap,
      manualReview,
      aiApproveStatus,
      aiApproveDTOList,
    } = this.state;
    const {
      customizeForm,
      customizeBtnGroup,
      certificationDealRemote,
      getHocInstance,
    } = this.props;

    // const hiddenFlag = dimensionCode === 'GROUP';
    const loading = queryLoading || configLoading || adoptLoading;
    const { reqStatus, appealReason, inviteId, supRegisteredSource } = basic || {};
    // 邀请注册展示邀约信息
    const showInviteInfo = supRegisteredSource === 'REGISTER';
    // 状态为 SUBMIT，WFL_REJECT 时显示操作按钮
    const isEdit = ['SUBMIT', 'WFL_REJECT'].includes(reqStatus);
    const isDisable = isPub || !isEdit;
    const noNeedCertificationTips = intl
      .get(`sslm.certificationApproval.view.message.noNeedCertificationTips`)
      .d(
        '当前企业已和采购方建立合作伙伴关系，企业信息不支持在认证过程中修改，故不进行三方验证。如企业信息有误，请引导供应商在认证通过后进行企业信息变更。'
      );
    const remoteParams = {
      investgHeaderId,
      changeReqId,
      investigateTemplateId,
    };
    // 头按钮埋点参数
    const remoteBtnProps = {
      manualReview,
    };

    const headerBtnProps = {
      loading,
      customizeBtnGroup,
      isPub,
      basic,
      aiApproveStatus,
      approvalDataMap,
      revokeDataMap,
      handleWeakModal: this.handleWeakModal,
      handleRejectModal: this.handleRejectModal,
      handleCertification: this.handleCertification,
      handleSave: this.handleSave,
      handleOperate: this.handleOperate,
      handleApprove: this.handleReqApprove,
      handleRevokeApprova: this.handleReqRevokeApprova,
      setLoading: this.handleSetLoading,
      onIntelligentReview: this.handleIntelligentReview,
      certificationDealRemote,
      remoteBtnProps,
    };

    const tagShowFlag = !isEmpty(basic?.zhimaLabels) && showTagFlag && isChinese;

    const allComponentProps = {
      [BUSSINESS]: {
        business,
      },
      [OTHERINFO]: {
        changeReqId,
        customizeForm,
        isDisable,
      },
      [BANK_ACCOUNT]: {
        bankInfoRemote: certificationDealRemote,
        remoteParams: this.handleBurialPoint(),
      },
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.supplierInvite.model.invite.certificationApprova')
            .d('企业认证审批')}
          backPath="/sslm/supplier-invite-manage/list"
        >
          <HeaderBtn {...headerBtnProps} />
          {/* 按钮埋点 */}
          {certificationDealRemote &&
            certificationDealRemote.render(
              'SSLM_CERTIFICATIONDEAL_DEFINITION_CUSTOMER_BUTTONS',
              <></>,
              remoteParams
            )}
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content className={styles['invite-certification-detail']}>
          <Spin spinning={loading}>
            {tagShowFlag && (
              <Content>
                <Card bordered={false}>
                  <div>{basic?.companyName}</div>
                  <EnterpriseTags
                    key={sourceKey}
                    tagList={basic?.zhimaLabels}
                    parentId="sslmCertificationDeal"
                    tagClassName="sslm-certification-deal"
                  />
                </Card>
              </Content>
            )}
            <Content>
              <Card bordered={false}>
                <div>
                  {intl
                    .get(`sslm.certificationApproval.view.message.certificationResult`)
                    .d('三方认证结果')}
                </div>
                <Form
                  dataSet={this.approvalResultDs}
                  columns={1}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output
                    name="certificationStatus"
                    renderer={({ value, name, record }) => {
                      return value ? renderStatus({ value, name, record }) : ' ';
                    }}
                  />
                  <Output
                    name="errorMessage"
                    newLine
                    renderer={({ value, record }) => {
                      // eslint-disable-next-line no-shadow
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
            {appealReason && (
              <Content>
                <Card bordered={false}>
                  <div>
                    {intl.get(`spfm.enterprise.view.message.appealReason`).d('申诉原因')}
                    <div className={styles['appeal-title-tips']}>
                      {intl
                        .get('spfm.enterprise.view.message.appealReasonTips')
                        .d(
                          '如果供应商填写的某些企业信息无法通过征信的自动校验，且销售员对自动拒绝的原因有疑义，会提交申诉转至人工审批；您需参考供应商的申诉原因人工判断校验结果是否有误。'
                        )}
                    </div>
                  </div>
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
            )}
            {showManualReviewFlag && (
              <Content>
                <Card bordered={false}>
                  <div>
                    {intl.get(`spfm.enterprise.view.message.manualReview`).d('企业验证-人工材料')}
                  </div>
                  <ManualReviewInfo dataSet={this.manualReviewDs} />
                </Card>
              </Content>
            )}
            <TopSection
              code="SSLM.ENT_CER_PRO.DETAIL.CARDS"
              getHocInstance={getHocInstance}
              className={styles['detail-cuz-card']}
            >
              {/* 供应商关系排查 */}
              <SecondSection code="riskProfile">
                <RiskProfile params={{ companyName: basic.companyName, organizationId }} />
              </SecondSection>
              {/* 邀约注册tab页 */}
              {showInviteInfo && (
                <SecondSection
                  code="inviteRegisterInfo"
                  title={intl
                    .get('spfm.enterprise.view.message.inviteRegisterInfo')
                    .d('邀请注册信息')}
                >
                  <div className={styles['cuz-card-second-card']}>
                    <InviteInfo
                      dataSet={this.inviteInfoDs}
                      customizeForm={customizeForm}
                      inviteType="REGISTER"
                      inviteId={inviteId}
                    />
                  </div>
                </SecondSection>
              )}
            </TopSection>
            <Content>
              <Card bordered={false}>
                <div>{intl.get(`spfm.enterprise.view.message.registerInfo`).d('登记信息')}</div>
                <RegisterInfo
                  dataSet={this.registerInfoDs}
                  basic={basic}
                  isTenantApprove
                  mainDataTab={mainDataTab}
                  remote={certificationDealRemote}
                />
              </Card>
            </Content>
            {getCardList({ renderTabList: mainDataTab }).map(card => {
              const { component: Com, label = '', dataSet, configName, configInfo = {} } = card;
              const configKey = getConfigKeyByconfigName(configName);
              const componentProps = allComponentProps[configName] || {};
              const comProps = {
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
            {allowSupplierInviteFlag && (
              <Content>
                <Card bordered={false}>
                  <div>{intl.get(`sslm.supplierInvite.view.title.inviteInfo`).d('邀约信息')}</div>
                  <RegisterInviteInfo
                    dataSet={this.inviteHeaderDs}
                    isEdit={!isDisable}
                    customizeForm={customizeForm}
                    code="SSLM.ENT_CER_PRO.DETAIL.POLICY_INVITE_INFO"
                  />
                </Card>
              </Content>
            )}
            {investgHeaderId && (
              <Content>
                <Investigation
                  editable={false}
                  investgHeaderId={investgHeaderId}
                  investigateTemplateId={investigateTemplateId}
                  organizationId={organizationId}
                  _status="approval"
                  investgRemote={certificationDealRemote}
                  otherRemoteProps={this.handleBurialPoint()}
                />
              </Content>
            )}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
