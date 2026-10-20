/**
 * 企业信息 - 工商注册登记
 * @date: 2018-6-30
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';
import { Spin } from 'hzero-ui';
import { updateTab } from 'utils/menuTab';

import LegalForm from '../Edit/LegalForm';
import styles from './ProcessInfo.less';
// import '../EnterpriseEdit.less';

const NAME_SPACE = 'enterpriseLegal';

@connect((modal) => ({
  legal: modal.enterpriseLegal,
  queryLoading: modal.loading.effects[`${NAME_SPACE}/queryCompanyBasic`],
}))
@formatterCollections({
  code: ['spfm.enterprise', 'spfm.supplierManage', 'hzero.hzeroUI', 'sslm.common'],
})
export default class LegalInfo extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${NAME_SPACE}/queryCompanyBasic`,
    });
  }

  legalForm;

  @Bind()
  onRef(form) {
    this.legalForm = form;
  }

  @Bind()
  callback(res) {
    const { history, updateCompanyInfo } = this.props;
    if (res) {
      // 更新openTab- key 处理来回切换问题
      updateTab({
        key: `/spfm/enterprise/register`,
        title: intl.get('hpfm.company.model.company.enterpriseCreate').d('公司信息新建'),
        search: {
          companyId: res.companyId,
          domesticForeignRelation: res.domesticForeignRelation,
          pageSource: 'legal',
        },
      });
      history.push(
        `${SRM_PLATFORM}/enterprise/register/business?companyId=${res.companyId}&domesticForeignRelation=${res.domesticForeignRelation}`
      );
      updateCompanyInfo();
    }
  }

  @Bind()
  renderProcessStatus(status) {
    switch (status) {
      case 'COMPLETE':
        return intl.get('spfm.approval.view.message.processStatus.complete').d('已认证');
      case 'SUBMIT':
      case 'APPROVING':
      case 'WFL_REJECT':
        return intl.get('spfm.approval.view.message.processStatus.submit').d('认证中');
      case 'REJECT':
        return intl.get('spfm.approval.view.message.processStatus.reject').d('认证失败');
      default:
        return intl.get('spfm.approval.view.message.processStatus.default').d('未认证');
    }
  }

  render() {
    const { queryLoading, company, companyId } = this.props;

    return (
      <Content>
        <Spin spinning={queryLoading}>
          <div className={styles['item-wrapper']}>
            <h3 className={styles['item-wrapper-title']}>
              {intl.get('spfm.enterprise.view.message.companyInfo').d('企业信息')}
            </h3>
            <div>
              {intl
                .get('spfm.enterprise.view.legalInfo.description')
                .d('适用于企业、个体工商户、事业单位等，通过营业执照等相关资质进行认证。')}
            </div>
          </div>
          <div className={styles['enterprise-status-info']}>
            {this.renderProcessStatus(company.processStatus)}
          </div>
          <LegalForm
            onRef={this.onRef}
            companyId={companyId}
            data={company}
            callback={this.callback}
            buttonText={intl.get('hzero.common.button.next').d('下一步')}
          />
        </Spin>
      </Content>
    );
  }
}
