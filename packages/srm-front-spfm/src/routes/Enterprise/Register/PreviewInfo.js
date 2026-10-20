import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isUndefined, isEmpty } from 'lodash';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import { getResponse, getCurrentLanguage } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import EnterpriseTags from 'srm-front-sslm/lib/routes/components/MemberSupplier/EnterpriseTags';

import { queryMenuPermissions, enterpriseTagsConfig } from '@/services/companyService';

import Preview from '../Preview/index';
import styles from '../EnterpriseView.less';

const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

@connect(({ loading, approvalPreview }) => ({
  approvalPreview,
  approvalLoading:
    loading.effects['attachment/submitApproval'] ||
    loading.effects['enterpriseLegal/validateUnifiedSocialCode'] ||
    loading.effects['enterpriseLegal/validateCompanyName'] ||
    loading.effects['approvalPreview/checkBankAccount'],
  buttonLoading: loading.effects['approvalPreview/handleEnterpriseChange'],
}))
@formatterCollections({
  code: [
    'spfm.enterprise',
    'spfm.attachment',
    'entity.attachment',
    'spfm.contactPerson',
    'spfm.enterprise',
    'spfm.certificationApproval',
    'spfm.approval',
    'spfm.finance',
    'spfm.common',
    'hpfm.enterprise',
    'spfm.bank',
    'hpfm.company',
    'sslm.common',
  ],
})
export default class PreviewInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.history.location.search.substr(1));
    const { changFlag } = routerParam;
    this.state = {
      companyId: routerParam.companyId || '',
      domesticForeignRelation: routerParam.domesticForeignRelation,
      changFlag: !!Number(changFlag),
      menuCode: {},
      showTagFlag: true,
    };
  }

  componentDidMount() {
    this.handleMenuPermissions();
    this.handleEnterpriseTags();
  }

  // 查询企业信息变更新菜单
  @Bind()
  handleMenuPermissions() {
    queryMenuPermissions({
      code: ['srm.mdm.firm-info-change-new'].join(),
    }).then((response) => {
      const res = getResponse(response);
      if (res) {
        this.setState({
          menuCode: res,
        });
      }
    });
  }

  // 查询当前功能是否开启企业标签功能
  @Bind()
  handleEnterpriseTags() {
    enterpriseTagsConfig({ menuNum: '3' }).then((response) => {
      const res = getResponse(response);
      if (res === 0) {
        this.setState({ showTagFlag: false });
      }
    });
  }

  @Bind()
  handleBack() {
    const { history, isTenant } = this.props;
    const { companyId, domesticForeignRelation } = this.state;
    if (companyId) {
      history.push(
        `/spfm/enterprise/register/attachment?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
      );
    } else {
      history.push(
        isTenant
          ? `/spfm/enterprise/register/result?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
          : '/spfm/enterprise/register/result'
      );
    }
  }

  @Bind()
  handleSubmit() {
    const { dispatch, isTenant } = this.props;
    const { companyId, domesticForeignRelation } = this.state;
    const { hostname } = window.location;
    dispatch({
      type: 'attachment/submitApproval',
      payload: {
        companyId,
        webUrl: hostname,
      },
    }).then((data) => {
      if (data) {
        const { history } = this.props;
        // 需要触发 register 页面的 company 信息 更新
        this.props.updateCompanyInfo();
        history.push(
          isTenant
            ? `/spfm/enterprise/register/preview?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
            : '/spfm/enterprise/register/result'
        ); // 跳转到 result 页面
      }
    });
  }

  @Bind()
  handleApproval() {
    const {
      dispatch,
      approvalPreview: { previewDetail = {} },
    } = this.props;
    const { basic: { unifiedSocialCode, companyName } = {}, bankAccountList = [] } = previewDetail;
    const { companyId } = this.state;
    if (unifiedSocialCode) {
      // 校验银行主账号
      const isOnlyMasterFlag = bankAccountList.filter((b) => b.masterFlag).length;
      if (isOnlyMasterFlag !== 1 && bankAccountList.length > 0) {
        notification.warning({
          message: intl
            .get(`spfm.bank.view.message.warn.onlyMasterFlag`)
            .d('必须有且仅有一条银行主账户信息'),
        });
      } else {
        dispatch({
          type: `enterpriseLegal/validateUnifiedSocialCode`,
          payload: {
            companyId,
            unifiedSocialCode,
          },
        }).then((res) => {
          if (!(isUndefined(res) || (res && res.failed === true))) {
            this.validateSubmit(companyName);
          }
        });
      }
    } else {
      this.validateSubmit(companyName);
    }
  }

  @Bind()
  validateSubmit(companyName) {
    const { dispatch } = this.props;
    const { companyId } = this.state;
    dispatch({
      type: `enterpriseLegal/validateCompanyName`,
      payload: {
        companyId,
        companyName,
      },
    }).then((res) => {
      if (!(isUndefined(res) || (res && res.failed === true))) {
        // 校验银行信息账户名称
        dispatch({
          type: 'approvalPreview/checkBankAccount',
          payload: {
            companyId,
          },
        }).then((resp) => {
          if (!isUndefined(resp)) {
            if (!resp) {
              Modal.confirm({
                title: intl
                  .get('spfm.enterprise.view.message.bankToolTips')
                  .d('银行账户名称与公司名称不一致，请确认是否继续提交！'),
                onOk: () => {
                  this.handleSubmit();
                },
              });
            } else {
              this.handleSubmit();
            }
          }
        });
      }
    });
  }

  @Bind()
  handleEnterpriseChange() {
    const { company, dispatch } = this.props;
    const { companyNum, hpfmCompanyId } = company;
    dispatch({
      type: `approvalPreview/handleEnterpriseChange`,
      payload: {
        changeContent: 'PUBLIC',
        companyId: hpfmCompanyId,
        companyNum,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleDetails(res);
      }
    });
  }

  /**
   * 跳转至企业信息变更详情
   */
  @Bind()
  handleDetails(record) {
    const { history } = this.props;
    const { menuCode } = this.state;
    const { changeReqId, companyId, partnerTenantId, domesticForeignRelation } = record;
    // 有新企业信息变更菜单
    const enterpriseFlag = menuCode['srm.mdm.firm-info-change-new'];
    const pathname = enterpriseFlag
      ? '/sslm/enterprise-inform-change-new/detail/edit'
      : `/sslm/enterprise-inform-change/detail/${changeReqId}`;
    history.push({
      pathname,
      search: qs.stringify({
        companyId,
        partnerTenantId,
        domesticForeignRelation,
        tenantId: partnerTenantId,
        changeReqId,
      }),
    });
  }

  render() {
    const { approvalLoading = false, company, isTenant, buttonLoading } = this.props;
    const { processStatus = 'NEW', companyName, zhimaLabels } = company;
    const { changFlag, showTagFlag } = this.state;

    const enterpriseTagsFlag =
      processStatus === 'COMPLETE' && !isEmpty(zhimaLabels) && showTagFlag && isChinese;

    return (
      <Fragment>
        <Header title={intl.get('hpfm.company.model.company.enterpriseEdit').d('公司信息')}>
          {changFlag && (
            <PermissionButton
              icon="edit"
              type="primary"
              loading={buttonLoading}
              onClick={this.handleEnterpriseChange}
              permissionList={[
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.company.change',
                  type: 'button',
                  meaning: '变更',
                },
              ]}
            >
              {intl.get('hzero.common.button.change').d('变更')}
            </PermissionButton>
          )}
        </Header>
        <Content>
          {enterpriseTagsFlag && (
            <div className={styles['enterprise-tags-card']}>
              <div className={styles['enterprise-tags-content']}>
                <div className={styles['enterprise-name']}>{companyName}</div>
                <EnterpriseTags
                  tagList={zhimaLabels}
                  key="ENTERPRISE_PREVIEW"
                  parentId="sslmEnterprisePreview"
                  tagClassName="sslm-enterprise-preview"
                />
              </div>
            </div>
          )}
          <Preview companyId={company.companyId} />
          <div style={{ marginTop: 40, textAlign: 'right' }}>
            {isTenant ? (
              processStatus !== 'SUBMIT' &&
              processStatus !== 'COMPLETE' && (
                <Button type="primary" onClick={this.handleBack}>
                  {intl.get('hzero.common.button.previous').d('上一步')}
                </Button>
              )
            ) : (
              <Button type="primary" onClick={this.handleBack}>
                {processStatus !== 'SUBMIT' && processStatus !== 'COMPLETE'
                  ? intl.get('hzero.common.button.previous').d('上一步')
                  : intl.get('hzero.common.button.back').d('返回')}
              </Button>
            )}

            {processStatus !== 'SUBMIT' && processStatus !== 'COMPLETE' && (
              <Button
                style={{ marginLeft: 16 }}
                type="primary"
                loading={approvalLoading || false}
                onClick={this.handleApproval}
              >
                {intl.get('spfm.enterprise.button.confirmCommit').d('确认提交')}
              </Button>
            )}
          </div>
        </Content>
      </Fragment>
    );
  }
}
