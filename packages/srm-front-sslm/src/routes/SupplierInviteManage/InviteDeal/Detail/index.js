/*
 * Detail - 认证及邀约处理-详情
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment, createRef } from 'react';
import {
  DataSet,
  Spin,
  Modal,
  Form,
  TextArea,
  notification,
  Select,
  Lov,
  TextField,
  CheckBox,
} from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TopSection, SecondSection } from '_components/Section';
import { Header, Content } from 'components/Page';
import { Bind, Debounce } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isNumber, isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import remote from 'utils/remote';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';

import { batchCheckBlackListSupplier } from '@/routes/components/utils/commonCheckUtils/blackListSupplier';
import {
  inviteReject,
  investigateReject,
  approveCooperate,
  sendInvestigate,
  handleAgree,
  queryInvitingInformation,
  fetchHeaderInfo,
  queryInviteCompanyInfo,
  inviteInvestigateReject,
  queryCompanyOtherInfo,
} from '@/services/supplierInviteManageServices';
import Investigation from '@/routes/components/Investigation';
import { enterpriseTagsConfig } from '@/services/commonService';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { queryCurrentUserPurchaseAgent } from '@/services/supplierEntryService';
import {
  inviteRejectModalDS,
  supplementInvestigModalDS,
  investigateRejectModalDS,
  inviteHeaderDS,
  investigateHeaderDS,
} from './stores/indexDS';
import {
  registerInfoDS,
  businessInfoDS,
  contactInfoDS,
  attachmentDS,
} from '../../stores/supplierInfoDS';
import HeaderBtns from './HeaderBtns';
import RegisterInfo from '../../components/RegisterInfo';
import BusinessInfo from '../../components/BusinessInfo';
import ContactInfo from '../../components/ContactInfo';
import AttachmentInfo from '../../components/AttachmentInfo';
import InviteHeader from '../../components/InviteHeader';
import SupplementModal from '../../components/SupplementModal';
import InvestigateHeader from '../../components/InvestigateHeader';

import styles from '../../index.less';

const organizationId = getCurrentOrganizationId();
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

/**
 * 认证及邀约处理-详情
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
    'spfm.companySearch',
    'entity.customer',
    'entity.supplier',
    'entity.company',
    'spfm.supplierRegister',
    'spfm.contactPerson',
    'spfm.enterpriseCertification',
    'spfm.supplierInvite',
    'sslm.common',
    'spfm.common',
    'spfm.invitationRegister',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUP_INV_MAN_INV_PROCESS.INVITE_INFO_CARDS', // 企业邀约审批信息-页签
    'SSLM.SUP_INV_MAN_INV_PROCESS.INVESTIGATE_HEADER',
    'SSLM.SUP_INV_MAN_INV_PROCESS.SURVEY_REJECTED',
    'SSLM.SUP_INV_MAN_INV_PROCESS.INVITE_INFO', // 邀请信息
  ],
})
@remote({
  code: 'SSLM.SUPPLIER_INVITE_MANAGE_DETAIL.INVITE_DEAL',
  name: 'inviteDealRemote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { inviteId },
      },
    } = props;
    this.investgRef = createRef();
    this.state = {
      inviteId,
      investgHeaderId: '',
      investigateTemplateId: '',
      basic: {},
      business: {},
      isEdit: false,
      queryInviteLoading: false,
      buttonLoading: false,
      purchaseSelectedRows: [],
      purchaserCompanyOtherInfo: {}, // 采购方公司其他信息
      inviteType: null, // 邀约类型
      showTagFlag: true, // 默认展示企业标签
    };
  }

  componentDidMount() {
    this.handelInviteInfo();
    // 查询当前登陆人对应的采购员
    this.handleCurrentUserPurchaseAgent();
    this.handleEnterpriseTags();
  }

  @Bind()
  handleCurrentUserPurchaseAgent() {
    queryCurrentUserPurchaseAgent().then(res => {
      if (getResponse(res)) {
        this.setState({ purchaseSelectedRows: res });
      }
    });
  }

  // 处理非法进入
  @Bind()
  handleIllegalEntry() {
    notification.info({
      placement: 'bottomRight',
      message: intl
        .get('sslm.common.view.message.pleaseRefresh')
        .d('数据已发生变更，请刷新页面重试'),
    });
    this.handleJumpList();
  }

  /**
   * 邀约头
   */
  @Bind()
  handelInviteInfo() {
    const { inviteId } = this.state;
    this.setState({
      queryInviteLoading: true,
    });
    queryInvitingInformation({ inviteId, code: 'SSLM.SUP_INV_MAN_INV_PROCESS.INVITE_INFO' })
      .then(async res => {
        if (getResponse(res)) {
          let isEdit = false;
          const {
            investigateTemplateId,
            inviteSourceKey,
            levelTypeFlag,
            inviteType,
            sourceKey,
            processStatus,
          } = res;
          // 校验单据是否合法，返回列表页
          if (inviteType === 'CUSTOMER') {
            const processStatusFlag = processStatus === 'PENDING';
            if (processStatusFlag) {
              isEdit = true;
            }
            const statusFlag = processStatus === 'SUBMIT' || processStatusFlag;
            if (!statusFlag) {
              // 返回列表页
              this.handleIllegalEntry();
              return;
            }
          } else if (inviteType === 'SUPPLIER') {
            const statusFlag = processStatus === 'SUBMIT';
            if (!statusFlag) {
              // 返回列表页
              this.handleIllegalEntry();
              return;
            }
          }
          const finalLevelTypeFlag = isNumber(levelTypeFlag)
            ? levelTypeFlag === 1
              ? '0'
              : '1'
            : null;
          const data = {
            ...res,
            levelTypeFlag: finalLevelTypeFlag,
          };
          this.inviteHeaderDs.loadData([data]);
          if (investigateTemplateId) {
            await this.handelInvestigHeaderInfo();
          }
          if (inviteType === 'SUPPLIER') {
            await this.handelCompanyInfo(inviteSourceKey);
          } else {
            await this.handelCompanyInfo(sourceKey);
            // 邀请客户类型，查询采购方其他信息页签字段
            await Promise.all([this.handelCompanyInfo(sourceKey), this.handelCompanyOtherInfo()]);
          }
          this.setState({
            isEdit,
            inviteType,
          });
        }
      })
      .finally(() => {
        this.setState({
          queryInviteLoading: false,
        });
      });
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

  /**
   * 调查表头
   */
  @Bind()
  handelInvestigHeaderInfo() {
    const { inviteId } = this.state;
    return fetchHeaderInfo({
      triggerById: inviteId,
      triggerByCode: 'INVITE',
      customizeUnitCode: 'SSLM.SUP_INV_MAN_INV_PROCESS.INVESTIGATE_HEADER',
    }).then(res => {
      if (getResponse(res)) {
        const { investgHeaderId, investigateTemplateId } = res;
        // todo 展示邀约按钮
        this.investigateHeaderDs.loadData([res]);
        this.setState({
          investgHeaderId,
          investigateTemplateId,
        });
      }
    });
  }

  /**
   * 公司信息
   */
  @Bind()
  handelCompanyInfo(companyId) {
    const { inviteId } = this.state;
    if (companyId) {
      return queryInviteCompanyInfo({
        companyId,
        inviteId,
      }).then(res => {
        if (getResponse(res)) {
          const { basic = {}, business = {}, contactList = [], attachmentList = [] } = res;
          this.contactInfoDs.loadData(contactList);
          this.attachmentDs.loadData(attachmentList);
          this.setState({
            basic,
            business,
          });
        }
      });
    }
  }

  // 查询采购方公司其他信息
  @Bind()
  handelCompanyOtherInfo() {
    const { inviteId } = this.state;
    return queryCompanyOtherInfo({
      inviteId,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          purchaserCompanyOtherInfo: res,
        });
      }
    });
  }

  inviteHeaderDsProps = this.props.inviteDealRemote.process(
    'SSLM.SUPPLIER_INVITE_MANAGE_DETAIL.INVITE_DEAL.INVITE_HEADER',
    inviteHeaderDS()
  );

  inviteHeaderDs = new DataSet(this.inviteHeaderDsProps);

  registerInfoDs = new DataSet(registerInfoDS());

  businessInfoDs = new DataSet(businessInfoDS());

  contactInfoDs = new DataSet(contactInfoDS());

  attachmentDs = new DataSet(attachmentDS());

  investigateHeaderDs = new DataSet(investigateHeaderDS());

  /**
   * 调查表拒绝
   */
  @Bind()
  handleInvestigateReject() {
    const { investgHeaderId } = this.state;
    const { customizeForm } = this.props;
    const inviteInfo = this.inviteHeaderDs.current?.toData(); // 邀约信息
    const investigateRejectDs = new DataSet(investigateRejectModalDS({ inviteInfo }));
    const currentRecord = investigateRejectDs?.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 430 },
      title: intl.get(`spfm.disposeInvite.view.button.investigateReject`).d('调查表拒绝'),
      children: customizeForm(
        {
          code: 'SSLM.SUP_INV_MAN_INV_PROCESS.SURVEY_REJECTED',
        },
        <Form dataSet={investigateRejectDs} labelLayout="float">
          <CheckBox name="flag" />
          <Select name="investigateType" />
          <Lov name="investigateTemplateLov" />
          <TextField name="remark" />
          <TextArea name="rejectRemark" resize="vertical" rows={16} />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await currentRecord.validate();
          if (validateFlag) {
            const data = currentRecord.toJSONData();
            const payload = {
              ...data,
              investgHeaderId,
              customizeUnitCode: 'SSLM.SUP_INV_MAN_INV_PROCESS.SURVEY_REJECTED',
            };
            const res = await investigateReject(payload);
            if (getResponse(res)) {
              resolve();
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              // 返回列表
              this.handleJumpList();
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }),
    });
  }

  /**
   * 补充调查
   */
  @Debounce(200)
  @Bind()
  openSupplementModal() {
    const { inviteDealRemote } = this.props;
    const { inviteId, purchaseSelectedRows, purchaserCompanyOtherInfo } = this.state;
    // 埋点改变ds属性
    const supplementDsProps = {
      ...supplementInvestigModalDS({
        purchaseSelectedRows,
      }),
    };
    // 埋点修改后的ds属性
    const newDsProps = inviteDealRemote
      ? inviteDealRemote.process(
          'SSLM_SUPPLIER_INVITE_DEAL_SUPPLEMENT_PROCESS',
          supplementDsProps,
          { headerDs: this.inviteHeaderDs }
        )
      : supplementDsProps;
    const supplementDs = new DataSet(newDsProps);
    Modal.open({
      title: intl.get('spfm.disposeInvite.view.message.title.modal.supplement').d('补充调查'),
      drawer: true,
      okText: intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作'),
      children: <SupplementModal dataSet={supplementDs} otherInfo={purchaserCompanyOtherInfo} />,
      style: { width: 850 },
      onOk: () =>
        new Promise(async resolve => {
          const currentRecord = supplementDs.current || {};
          // 校验邀约头必填
          const headerValidateFlag = await (this.inviteHeaderDs.current &&
            this.inviteHeaderDs.current.validate(true));
          let validateFlag = false;
          if (!isEmpty(currentRecord)) {
            validateFlag = await currentRecord.validate();
          }
          if (validateFlag && headerValidateFlag) {
            const data = currentRecord.toJSONData();
            const { flag, multiSupplierCategoryId } = data;
            const { levelTypeFlag, objectVersionNumber, inviteType, inviteCompanyIds } =
              this.inviteHeaderDs.current.toData() || {};
            // finalLevelTypeFlag = 0 勾选的集团级
            const finalLevelTypeFlag = Number(levelTypeFlag) === 1 ? 0 : 1;
            const inviteCompanyIdList = inviteCompanyIds && inviteCompanyIds.split(',');
            const inviteCompanyId = inviteCompanyIdList && inviteCompanyIdList[0];
            // 勾选发送调查表
            if (flag) {
              const payload = {
                organizationId,
                ...data,
                inviteId,
                levelTypeFlag: finalLevelTypeFlag,
                objectVersionNumber,
                inviteType,
                inviteCompanyIds,
                inviteCompanyId,
                customizeUnitCode: 'SSLM.SUP_INV_MAN_INV_PROCESS.SUP_MODAL_FORM',
              };
              const res = await sendInvestigate(payload);
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.handleJumpList();
              } else {
                resolve(false);
              }
            } else {
              // 同意合作
              const payload = {
                ...data,
                organizationId,
                inviteId,
                supplierCategoryIdList: multiSupplierCategoryId
                  ? multiSupplierCategoryId.split(',')
                  : [],
                levelTypeFlag: finalLevelTypeFlag, // 邀约头
                inviteType,
                inviteCompanyIds,
                inviteCompanyId,
                customizeUnitCode: 'SSLM.SUP_INV_MAN_INV_PROCESS.SUP_MODAL_FORM',
              };
              const res = await approveCooperate(payload);
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl
                    .get(`spfm.disposeInvite.message.agreeToInvite`)
                    .d('您已同意该合作邀约'),
                });
                this.handleJumpList();
              } else {
                resolve(false);
              }
            }
          } else {
            resolve(false);
            notification.warning({
              placement: 'bottomRight',
              message: intl
                .get('sslm.common.view.message.requiredMsg')
                .d('请检查是否有必填项未填写！'),
            });
          }
        }),
    });
  }

  /**
   * 有调查表邀约同意
   */
  @Bind()
  async handleAgree() {
    const blackListRes = await this.handleCheckBlackListSupplier();
    if (!blackListRes) {
      return;
    }
    const { investgHeaderId } = this.state;
    const investigateHeaderData = this.investigateHeaderDs.current?.toData();
    const investigateData = await this.investgRef?.current?.handleSaveParams();
    // 带调查表,直接合作
    const payload = {
      // 调查表头所有数据
      ...investigateHeaderData,
      ...investigateData, // 调查表页签数据
      investgHeaderId,
      customizeUnitCode: 'SSLM.SUP_INV_MAN_INV_PROCESS.INVESTIGATE_HEADER',
    };
    // 校验必填等
    const headerValidateFlag = await (this.investigateHeaderDs.current &&
      this.investigateHeaderDs.current.validate(true));
    if (headerValidateFlag && !isEmpty(investigateData)) {
      this.setState({
        buttonLoading: true,
      });
      return handleAgree(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.handleJumpList();
          }
        })
        .finally(() => {
          this.setState({
            buttonLoading: false,
          });
        });
    } else if (!headerValidateFlag) {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.requiredMsg').d('请检查是否有必填项未填写！'),
      });
    }
  }

  /**
   * 无调查表
   */
  @Bind()
  async handleAgreeCooperate() {
    const res = await this.handleCheckBlackListSupplier();
    if (!res) {
      return;
    }
    this.openSupplementModal();
  }

  /**
   * 成为客户，校验黑名单供应商
   */
  @Bind()
  async handleCheckBlackListSupplier() {
    const { inviteType, basic = {} } = this.state;
    const payload = {
      supplierInfoList: [{ ...basic }],
      effectiveType: 'supplierActiveInvite',
    };
    if (inviteType === 'CUSTOMER') {
      const blackListRes = await batchCheckBlackListSupplier(payload);
      return blackListRes;
    } else {
      return true;
    }
  }

  /**
   * 邀约拒绝
   */
  @Bind()
  handleInviteReject() {
    const { investgHeaderId, inviteId } = this.state;
    const rejectModalDs = new DataSet(inviteRejectModalDS());
    const currentRecord = rejectModalDs?.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 430 },
      title: intl.get(`spfm.disposeInvite.view.message.title.modal.refuse`).d('拒绝原因'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <TextArea name="refuseReason" resize="vertical" rows={16} />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await currentRecord.validate();
          const data = currentRecord.toJSONData();
          if (validateFlag) {
            const { refuseReason } = data;
            // 带调查表
            if (investgHeaderId) {
              const payload = {
                investgHeaderId,
                rejectRemark: refuseReason,
              };
              const res = await inviteInvestigateReject(payload);
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.handleJumpList();
              } else {
                resolve(false);
              }
            } else {
              const payload = {
                processMsg: refuseReason,
                inviteId,
              };
              const res = await inviteReject(payload);
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl
                    .get(`spfm.disposeInvite.message.refuseToInvite`)
                    .d('您已拒绝该合作邀约'),
                });
                this.handleJumpList();
              } else {
                resolve(false);
              }
            }
          } else {
            resolve(false);
          }
        }),
    });
  }

  // 返回列表
  @Bind()
  handleJumpList() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-invite-manage/list`,
      })
    );
  }

  render() {
    const {
      getHocInstance = () => {},
      customizeForm,
      custLoading = false,
      inviteDealRemote,
    } = this.props;
    const {
      // inviteId,
      showTagFlag,
      investgHeaderId,
      basic,
      business,
      isEdit,
      investigateTemplateId,
      queryInviteLoading,
      buttonLoading,
      inviteType,
    } = this.state;
    // const { location } = this.props;
    const loading = queryInviteLoading || buttonLoading;
    // 邀请客户
    const inviteCustomerFlag = inviteType === 'CUSTOMER';
    const { companyName, zhimaLabels } = basic;
    const tagShowFlag = !isEmpty(zhimaLabels) && showTagFlag && isChinese;

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.supplierInvite.model.invite.invitationApprova').d('企业邀约审批')}
          backPath="/sslm/supplier-invite-manage/list"
        >
          <HeaderBtns
            loading={loading}
            remote={inviteDealRemote}
            onAgree={this.handleAgree}
            investgHeaderId={investgHeaderId}
            onAgreeCooperate={this.handleAgreeCooperate}
            onInviteReject={this.handleInviteReject}
            onInvestigateReject={this.handleInvestigateReject}
          />
        </Header>
        <Content style={{ overflow: 'hidden', border: 0 }}>
          <Spin spinning={loading}>
            {tagShowFlag && (
              <div className={styles['enterprise-tags-card']}>
                <div className={styles['enterprise-tags-content']}>
                  <div className={styles['enterprise-name']}>{companyName}</div>
                  <EnterpriseTags
                    key="INVITE_DEAL"
                    tagList={zhimaLabels}
                    parentId="sslmInviteDeal"
                    tagClassName="sslm-invite-deal"
                  />
                </div>
              </div>
            )}
            <TopSection
              code="SSLM.SUP_INV_MAN_INV_PROCESS.INVITE_INFO_CARDS"
              getHocInstance={getHocInstance}
              className={styles['invite-process-top-section']}
            >
              <SecondSection
                title={intl.get('sslm.supplierInvite.view.title.inviteInfo').d('邀约信息')}
                code="invite"
              >
                <InviteHeader
                  dataSet={this.inviteHeaderDs}
                  isEdit={isEdit}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  code={inviteCustomerFlag ? 'SSLM.SUP_INV_MAN_INV_PROCESS.INVITE_INFO' : ''}
                />
              </SecondSection>
              <SecondSection
                title={intl.get('spfm.enterprise.view.message.registerInfo').d('登记信息')}
                code="register"
              >
                <RegisterInfo dataSet={this.registerInfoDs} basic={basic} useWidthPercent />
              </SecondSection>
              <SecondSection
                title={intl.get('spfm.enterprise.view.message.business').d('基础业务信息')}
                code="business"
              >
                <BusinessInfo dataSet={this.businessInfoDs} business={business} useWidthPercent />
              </SecondSection>
              <SecondSection
                title={intl.get('spfm.enterprise.view.message.contact').d('联系人信息')}
                code="contact"
              >
                <ContactInfo dataSet={this.contactInfoDs} />
              </SecondSection>
              <SecondSection
                title={intl.get('spfm.enterprise.view.message.attachment').d('附件信息')}
                code="attachment"
              >
                <AttachmentInfo dataSet={this.attachmentDs} />
              </SecondSection>
              {investgHeaderId && (
                <SecondSection
                  title={intl.get('spfm.supplierInvite.model.invite.investigate').d('调查表')}
                  code="investigate"
                >
                  <InvestigateHeader
                    dataSet={this.investigateHeaderDs}
                    customizeForm={customizeForm}
                  />
                  <Investigation
                    editable={false}
                    investgHeaderId={investgHeaderId}
                    investigateTemplateId={investigateTemplateId}
                    organizationId={organizationId}
                    _status="approval"
                    source="INVITE_DEAL"
                    ref={this.investgRef}
                    investgRemote={inviteDealRemote}
                    otherRemoteProps={{
                      inviteHeaderDs: this.inviteHeaderDs,
                    }}
                  />
                </SecondSection>
              )}
            </TopSection>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
