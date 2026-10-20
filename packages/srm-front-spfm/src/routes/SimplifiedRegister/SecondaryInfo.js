/*
 * SimplifiedRegister - 简化供应商注册-次要信息
 * @date: 2020/11/09 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';

import BussinessInfo from './BussinessInfo';
import ContactInfo from './ContactInfo';
import AddressInfo from './AddressInfo';
import BankAccount from './BankAccount';
import InvoiceInfo from './InvoiceInfo';
import FinanceInfo from './FinanceInfo';
import AttachmentInfo from './AttachmentInfo';

import styles from './index.less';

import { queryCompanyBusiness } from '@/services/enterpriseService';
import { queryCompanyBasic } from '@/services/legalService';

export default class SecondaryInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleDefaultValue();
  }

  // 处理默认带值
  async handleDefaultValue() {
    const { companyId, addressDS } = this.props;
    if (companyId) {
      const [basicResp, businessResp] = await Promise.all([
        queryCompanyBasic(),
        queryCompanyBusiness(companyId),
      ]);
      if (getResponse(basicResp) && getResponse(businessResp)) {
        addressDS.setQueryParameter('companyId', companyId);
        const {
          registeredCountryCode,
          registeredCountryId,
          registeredCountryName,
          regionPathName,
          registeredRegionId,
          addressDetail,
        } = basicResp || {};
        addressDS.query().then((address) => {
          if (isEmpty(address) && isEmpty(businessResp)) {
            addressDS.loadData([]);
            addressDS.create({
              countryObj: {
                countryId: registeredCountryId,
                countryCode: registeredCountryCode,
                countryName: registeredCountryName,
              },
              regionId: registeredRegionId,
              regionPathName,
              addressDetail,
            });
          }
        });
      }
    }
  }

  @Bind()
  handleSaveSecondaryData() {
    const payload = {};
    // 业务信息
    if (this.bussinessInfo) {
      const bussinessData = this.bussinessInfo.handleBussinessData() || {};
      payload.bussinessData = bussinessData;
    }
    return payload;
  }

  @Bind()
  handleQuerySecondaryData(bussinessInfoFlag = true) {
    // 业务信息
    if (this.bussinessInfo && bussinessInfoFlag) {
      this.bussinessInfo.handleQueryBussiness();
    }
    // 开票信息
    if (this.invoiceInfo && !bussinessInfoFlag) {
      this.invoiceInfo.handleQueryInvoice(false);
    }
  }

  @Bind()
  handSaveData(data) {
    this.props.handSaveData(data);
  }

  render() {
    const {
      isEdit = true,
      bussinessDS,
      contactDS,
      addressDS,
      bankInfoDS,
      invoiceDS,
      financeDS,
      attachmentDS,
      legalDS,
      domesticFlag,
      companyId,
      personalFlag,
      mustCompanyTabs,
      userInfo,
      readOnly = false,
      defaultBankInfo,
      nextVisable = true,
      handleUpdateState,
    } = this.props;

    return (
      <React.Fragment>
        <Content>
          <Card id="businessInfo" className={styles['simplified-card-title']} bordered={false}>
            <div>{intl.get('spfm.business.view.message.title').d('基础业务信息')}</div>
            <span style={{ display: nextVisable ? 'block' : 'none' }}>
              {intl
                .get('spfm.supplierRegister.view.message.businessInfo')
                .d(
                  '业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易。'
                )}
            </span>
            <BussinessInfo
              dataSet={bussinessDS}
              isEdit={isEdit}
              domesticFlag={domesticFlag}
              personalFlag={personalFlag}
              companyId={companyId}
              readOnly={readOnly}
              onRef={(ref) => {
                this.bussinessInfo = ref;
              }}
              handSaveData={this.handSaveData}
              handleUpdateState={handleUpdateState}
            />
          </Card>
        </Content>
        <Content>
          <Card id="contactInfo" className={styles['simplified-card-title']} bordered={false}>
            <div>
              {intl.get('spfm.supplierRegister.view.title.contactInfo').d('联系人')}
              {nextVisable && (
                <span>
                  {intl
                    .get('spfm.supplierRegister.view.register.contactAtLastOne')
                    .d('请至少填写一条联系人')}
                </span>
              )}
            </div>
            <ContactInfo
              dataSet={contactDS}
              isEdit={isEdit}
              companyId={companyId}
              userInfo={userInfo}
              legalDS={legalDS}
            />
          </Card>
        </Content>
        <Content>
          <Card id="addressInfo" className={styles['simplified-card-title']} bordered={false}>
            <div>
              {intl.get(`spfm.enterprise.view.message.page.addressInfo`).d('地址信息')}
              {mustCompanyTabs.includes('ADDRESS') && nextVisable && (
                <span>
                  {intl
                    .get('spfm.supplierRegister.view.register.addressAtLastOne')
                    .d('请至少填写一条地址信息')}
                </span>
              )}
            </div>
            <AddressInfo
              dataSet={addressDS}
              isEdit={isEdit}
              companyId={companyId}
              legalDS={legalDS}
              defaultBankInfo={defaultBankInfo}
            />
          </Card>
        </Content>
        <Content>
          <Card id="bankInfo" className={styles['simplified-card-title']} bordered={false}>
            <div>
              {intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息')}
              {mustCompanyTabs.includes('BANK') && nextVisable && (
                <span>
                  {intl
                    .get('spfm.supplierRegister.view.register.bankAtLastOne')
                    .d('请至少填写一条银行信息')}
                </span>
              )}
            </div>
            <BankAccount
              dataSet={bankInfoDS}
              isEdit={isEdit}
              companyId={companyId}
              legalDS={legalDS}
              defaultBankInfo={defaultBankInfo}
            />
          </Card>
        </Content>
        <Content>
          <Card id="invoiceInfo" className={styles['simplified-card-title']} bordered={false}>
            <div style={{ marginBottom: 16 }}>
              {intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息')}
              {mustCompanyTabs.includes('INVOICE') && nextVisable && (
                <span>
                  {intl
                    .get('spfm.supplierRegister.view.register.invoiceAtLastOne')
                    .d('请至少填写一条开票信息')}
                </span>
              )}
            </div>
            <InvoiceInfo
              dataSet={invoiceDS}
              isEdit={isEdit}
              companyId={companyId}
              domesticFlag={domesticFlag}
              personalFlag={personalFlag}
              userInfo={userInfo}
              onRef={(ref) => {
                this.invoiceInfo = ref;
              }}
            />
          </Card>
        </Content>
        <Content>
          <Card id="financeInfo" className={styles['simplified-card-title']} bordered={false}>
            <div>
              {intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息')}
              {mustCompanyTabs.includes('FINANCIAL') && nextVisable && (
                <span>
                  {intl
                    .get('spfm.supplierRegister.view.register.financeAtLastOne')
                    .d('请至少填写一条财务信息')}
                </span>
              )}
            </div>
            <FinanceInfo dataSet={financeDS} isEdit={isEdit} companyId={companyId} />
          </Card>
        </Content>
        <Content>
          <Card id="attachmentInfo" className={styles['simplified-card-title']} bordered={false}>
            <div>
              {intl.get(`spfm.supplierRegister.view.title.attachmentInfo`).d('附件信息')}
              {mustCompanyTabs.includes('ATTACHMENT') && nextVisable && (
                <span>
                  {intl
                    .get('spfm.supplierRegister.view.register.attachmentAtLastOne')
                    .d('请至少填写一条附件信息')}
                </span>
              )}
            </div>
            <AttachmentInfo dataSet={attachmentDS} isEdit={isEdit} companyId={companyId} />
          </Card>
        </Content>
      </React.Fragment>
    );
  }
}
