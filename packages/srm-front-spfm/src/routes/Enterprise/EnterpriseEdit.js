import React from 'react';
import { Form, Card, Modal, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import { isArray } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import LegalForm from './Edit/LegalForm';
import BusinessForm from '../Company/Components/BussinessForm';
import FinanceList from './Edit/FinanceList';
import InvoiceList from '../Company/Components/InvoiceList';
import AddressInfoList from './Edit/AddressInfoList';
import BankInfoList from '../Company/Components/BankInfoList';
import ContactPersonList from './Edit/ContactPersonList';
import AttachmentList from './Edit/AttachmentList';
import './EnterpriseEdit.less';

const { confirm } = Modal;
@formatterCollections({ code: 'spfm.approval' })
@Form.create({ fieldNameProp: null })
@connect((modals) => ({
  modal: modals.enterpriseEdit,
}))
export default class EnterpriseEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      globalFlag: false,
      wholeCountryFlag: false,
      otherFlag: false,
    };
  }

  componentDidMount() {
    const { dispatch, companyId } = this.props;
    if (companyId) {
      dispatch({
        type: 'enterpriseEdit/queryCompanyInfo',
        payload: {
          companyId,
          desensitize: false,
        },
      });
      this.legalForm.fetchProvinceCity();
      dispatch({
        type: 'enterpriseEdit/queryCompanyBusiness',
        payload: companyId,
      }).then((res) => {
        if (res.industryList) {
          this.businessForm.fetchCategories(res.industryList.map((item) => item.industryId));
        }
        if (isArray(res.serviceAreaList)) {
          this.handleAreaChange(res.serviceAreaList.map((i) => i.serviceAreaCode));
        }
      });
    }
  }

  legalForm;

  businessForm;

  @Bind()
  onLegalRef(form) {
    this.legalForm = form;
  }

  @Bind()
  onBusinessRef(form) {
    this.businessForm = form;
  }

  @Bind()
  handleCompanySubmit() {
    const { dispatch, companyId } = this.props;
    confirm({
      title: intl.get('spfm.approval.view.message.title.submitTitle').d('是否要提交审核'),
      content: intl
        .get('spfm.approval.view.message.title.submitContent')
        .d('您修改的信息将于审核通过后生效'),
      onOk() {
        dispatch({
          type: 'attachment/submitApproval',
          payload: { companyId },
        }).then(() => {
          dispatch({
            type: 'enterpriseEdit/queryCompanyInfo',
            payload: {
              companyId,
              desensitize: false,
            },
          });
        });
      },
    });
  }

  buildCardTitle(title, description) {
    return (
      <React.Fragment>
        <span style={{ fontSize: '14px' }}>{title}</span>
        <span style={{ fontSize: '12px', marginLeft: '24px', color: '#999' }}>{description}</span>
      </React.Fragment>
    );
  }

  @Bind()
  renderProcessStatus(status) {
    switch (status) {
      case 'COMPLETE':
        return intl.get('spfm.approval.view.message.processStatus.complete').d('已认证');
      case 'SUBMIT':
        return intl.get('spfm.approval.view.message.processStatus.submit').d('认证中');
      case 'REJECT':
        return intl.get('spfm.approval.view.message.processStatus.reject').d('认证失败');
      default:
        return intl.get('spfm.approval.view.message.processStatus.default').d('未认证');
    }
  }

  @Bind()
  handleAreaChange(value = []) {
    if (value.length !== 0) {
      //  全球
      if (value.includes('0') === true) {
        this.setState({
          globalFlag: false,
          wholeCountryFlag: true,
          otherFlag: true,
        });
      } else if (value.includes('01') === true) {
        this.setState({
          globalFlag: true,
          wholeCountryFlag: false,
          otherFlag: true,
        });
      } else {
        this.setState({
          globalFlag: true,
          wholeCountryFlag: true,
          otherFlag: false,
        });
      }
    } else {
      this.setState({
        globalFlag: false,
        wholeCountryFlag: false,
        otherFlag: false,
      });
    }
  }

  render() {
    const {
      modal: { enterprise = {}, businessInfo },
      companyId,
      callback,
    } = this.props;
    const { basic = {} } = enterprise;
    const { processStatus, companyNum } = basic;
    const domesticForeignRelation = this.legalForm
      ? this.legalForm.props.form.getFieldValue('domesticForeignRelation')
      : null;
    const statusNotPendingReject = !(
      processStatus === 'PENDING' ||
      processStatus === 'REJECT' ||
      (processStatus === 'UPDATE' && !companyNum)
    );
    return (
      <Content
        style={{
          display: 'flex',
          padding: '0px',
          backgroundColor: '#fff',
        }}
      >
        <div
          className="enterprise-content"
          style={{ flex: 'auto', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
        >
          <Content>
            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.legal.title').d('登记信息'),
                intl
                  .get('spfm.approval.view.message.legal.description')
                  .d(
                    '非常重要：请参照贵司营业执照如实填写，否则会影响您的资质审核，无法进行后续正常业务操作。'
                  )
              )}
              extra={
                !statusNotPendingReject && (
                  <Button type="primary" icon="check" onClick={() => this.handleCompanySubmit()}>
                    {intl.get('hzero.common.button.submit').d('提交')}
                  </Button>
                )
              }
            >
              <div className="enterprise-status-info">
                {this.renderProcessStatus(basic.processStatus)}
              </div>
              <LegalForm
                onRef={this.onLegalRef}
                data={basic}
                callback={callback}
                domesticForeignRelation={domesticForeignRelation}
                statusNotPendingReject={statusNotPendingReject}
              />
              {/* {console.log(basic)} */}
            </Card>
            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.business.title').d('业务信息'),
                intl
                  .get('spfm.approval.view.message.business.description')
                  .d(
                    '非常重要：业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易。'
                  )
              )}
            >
              <BusinessForm
                onRef={this.onBusinessRef}
                data={businessInfo}
                companyId={companyId}
                callback={callback}
                globalFlag={this.state.globalFlag}
                wholeCountryFlag={this.state.wholeCountryFlag}
                otherFlag={this.state.otherFlag}
                domesticForeignRelation={domesticForeignRelation}
                handleAreaChange={this.handleAreaChange}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>
            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.contactPerson.title').d('联系人'),
                intl
                  .get('spfm.approval.view.message.contactPerson.description')
                  .d(
                    '非常重要：真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。'
                  )
              )}
            >
              <ContactPersonList
                companyId={companyId}
                callback={callback}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>

            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.address.title').d('地址信息'),
                intl
                  .get('spfm.approval.view.message.address.description')
                  .d('您的企业可能在多地有工厂/分公司，建议维护完整信息，展示贵司规模。')
              )}
            >
              <AddressInfoList
                companyId={companyId}
                callback={callback}
                domesticForeignRelation={domesticForeignRelation}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>

            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.bank.title').d('银行信息'),
                intl
                  .get('spfm.approval.view.message.bank.description')
                  .d('维护账户信息，后续您向合作企业提供付款账号时，可快速复制。')
              )}
            >
              <BankInfoList
                companyId={companyId}
                callback={callback}
                domesticForeignRelation={domesticForeignRelation}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>
            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.invoice.view.message.title').d('开票信息'),
                intl
                  .get('spfm.invoice.view.message.description')
                  .d('非常重要: 开票信息要保证发票真实有效，请维护准确完整的开票信息。')
              )}
            >
              <InvoiceList
                callback={callback}
                companyId={companyId}
                companyName={basic.companyName}
                unifiedSocialCode={basic.unifiedSocialCode}
                domesticForeignRelation={domesticForeignRelation}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>
            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.finance.title').d('财务信息'),
                intl
                  .get('spfm.approval.view.message.finance.description')
                  .d('提供贵司的近三年财务报告，有利于展示您的经营与发展状况。')
              )}
            >
              <FinanceList
                companyId={companyId}
                callback={callback}
                domesticForeignRelation={domesticForeignRelation}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>

            <Card
              className="enterprise-info-group"
              title={this.buildCardTitle(
                intl.get('spfm.approval.view.message.attachment.title').d('附件信息'),
                intl
                  .get('spfm.approval.view.message.attachment.description')
                  .d(
                    '您可在此处上传各类经营/质量及各类许可证信息，便于贵司的资质认可；同类型许可证可在同一行内上传多个附件'
                  )
              )}
            >
              <AttachmentList
                companyId={companyId}
                callback={callback}
                domesticForeignRelation={domesticForeignRelation}
                statusNotPendingReject={statusNotPendingReject}
              />
            </Card>
          </Content>
        </div>
      </Content>
    );
  }
}
