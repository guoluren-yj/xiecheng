import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { SRM_PLATFORM } from '_utils/config';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import ContactPersonList from '../Edit/ContactPersonList';
import styles from './ProcessInfo.less';

@formatterCollections({ code: 'spfm.contactPerson' })
@connect((models) => ({
  contactPerson: models.enterpriseContactPerson,
}))
@withRouter
export default class ContactPerson extends PureComponent {
  /**
   * 获取当前编辑的公司id
   */
  getCurrentCompanyId() {
    const {
      history: { location },
    } = this.props;
    const { companyId } = qs.parse(location.search.substr(1));
    return companyId;
  }

  /**
   * 获取当前编辑的公司id
   */
  getDomesticForeignRelation() {
    const {
      history: { location },
    } = this.props;
    const { domesticForeignRelation } = qs.parse(location.search.substr(1));
    return domesticForeignRelation;
  }

  @Bind()
  saveAndNext() {
    const { history, fetchPreviewDetail } = this.props;
    fetchPreviewDetail(this.getCurrentCompanyId()).then(() => {
      history.push(
        `/spfm/enterprise/register/address?companyId=${this.getCurrentCompanyId()}&domesticForeignRelation=${this.getDomesticForeignRelation()}`
      );
    });
  }

  /**
   * 返回上一步回调方法
   */
  @Bind()
  previousCallback() {
    const { history } = this.props;
    history.push(
      `${SRM_PLATFORM}/enterprise/register/business?companyId=${this.getCurrentCompanyId()}&domesticForeignRelation=${this.getDomesticForeignRelation()}`
    );
  }

  render() {
    const companyId = this.getCurrentCompanyId();
    const domesticForeignRelation = this.getDomesticForeignRelation();
    return (
      <React.Fragment>
        <Content>
          <div className={styles['item-wrapper']}>
            <h3 className={styles['item-wrapper-title']}>
              {intl.get('spfm.contactPerson.view.message.title').d('联系人信息')}
            </h3>
            <div>
              {intl
                .get('spfm.contactPerson.view.message.description')
                .d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。')}
            </div>
          </div>
          <ContactPersonList
            onRef={this.onRef}
            callback={this.saveAndNext}
            previousCallback={this.previousCallback}
            backBtnText={intl.get('hzero.common.button.previous').d('上一步')}
            buttonText={intl.get('hzero.common.button.next').d('下一步')}
            showButton
            companyId={companyId}
            domesticForeignRelation={domesticForeignRelation}
          />
        </Content>
      </React.Fragment>
    );
  }
}
