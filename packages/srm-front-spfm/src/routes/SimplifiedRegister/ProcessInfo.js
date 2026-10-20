import React, { PureComponent } from 'react';
import { isFunction, isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { deleteCache } from 'components/CacheComponent';

import { queryCompanyBasic } from '@/services/legalService';

import styles from './ProcessInfo.less';

/**
 * ProcessInfo-企业审批进程
 * @reactProps {!Object} result 所有企业什么进程的信息
 * @reactProps {!String} result.companyName 企业名称
 * @reactProps {!String} result.applicantPerson 申请人
 * @reactProps {!String} result.commitDate 提交时间
 */
@formatterCollections({
  code: ['spfm.supplierRegister', 'spfm.process'],
})
export default class ProcessInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      company: {},
      orcLoading: false,
      pageLoading: false,
    };
  }

  componentDidMount() {
    // 清空子页面的缓存
    deleteCache('/spfm/simplified-register/main-info');
    this.setState({
      orcLoading: true,
    });
    queryCompanyBasic().then((res) => {
      if (getResponse(res)) {
        this.setState({
          company: res,
          orcLoading: false,
        });
      }
    });
  }

  @Bind()
  handleGotoViewCompany() {
    const { history } = this.props;
    const { company: { domesticForeignRelation } = {} } = this.state;
    history.push({
      pathname: `/spfm/simplified-register/main-info`,
      search: querystring.stringify({
        domesticFlag: domesticForeignRelation,
      }),
    });
  }

  render() {
    const { match, dispatch } = this.props;
    const { company = {}, orcLoading, pageLoading } = this.state;
    let stepStatus = '';
    let stepTips = '';
    const status = company && company.processStatus;
    const loading = pageLoading || orcLoading;
    // eslint-disable-next-line default-case
    switch (status) {
      case 'PENDING':
        if (match.path === `/spfm/simplified-register/result`) {
          if (isFunction(dispatch)) {
            dispatch(
              routerRedux.push({
                pathname: `/spfm/simplified-register/main-info`,
                search: querystring.stringify({
                  domesticFlag: company.domesticForeignRelation,
                }),
              })
            );
          }
          return null;
        }
        break;
      case 'SUBMIT':
      case 'APPROVING':
      case 'WFL_REJECT':
        stepStatus = intl.get('spfm.process.view.message.step.processTitle').d('审批中');
        stepTips = intl
          .get('spfm.process.view.message.step.successSubmitMsg')
          .d('已提交审批，请耐心等待。审批结果一般将在工作日24小时内发送至您的手机或邮箱，24小时后也可直接登录进行查看。如超过三个工作日仍未审核，可重新登录该页面获取客服电话进行咨询');
        break;
      case 'REJECT':
        stepStatus = intl.get('spfm.supplierRegister.view.message.step.rejectTitle').d('已拒绝');
        stepTips = intl
          .get('spfm.process.view.message.step.rejectDescription')
          .d('您的认证申请已被拒绝，请根据系统消息或邮件提示修改后重新提交');
        break;
      case 'COMPLETE':
        stepStatus = intl.get('spfm.process.view.message.step.completeTitle').d('完成');
        stepTips = intl
          .get('spfm.process.view.message.step.successedDescription')
          .d('您已完成企业认证，请退出重新登录');
        break;
    }
    if (isEmpty(company)) {
      return <Spin size="large" style={{ marginTop: '25%' }} />;
    }

    return (
      <React.Fragment>
        <Spin spinning={loading} wrapperClassName={styles['result-spin']}>
          <div className={styles['process-info']}>
            <div className={styles['pending-approval']} />
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 24, width: "60%", textAlign: "center" }}>
              {stepTips}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={styles['result-text-title']}>
                {intl.get('spfm.process.model.company.company').d('企业')}：
              </span>
              <span className={styles['result-text-context']}>{company.companyName}</span>
              <span className={styles['result-text-title']}>
                {intl.get('spfm.process.model.company.processDate').d('提交时间')}：
              </span>
              <span className={styles['result-text-context']}>{company.processDate}</span>
              <span className={styles['result-text-title']}>
                {intl.get('spfm.process.view.process.title').d('当前状态：')}：
              </span>
              <span style={{ fontSize: 14, color: '#00B8CC ' }}>{stepStatus}</span>
            </div>
            <div>
              {status !== 'COMPLETE' && (
                <Button
                  style={{ marginTop: 24 }}
                  type="primary"
                  color="primary"
                  onClick={this.handleGotoViewCompany}
                >
                  {intl.get('spfm.process.view.option.viewCompanyInfo').d('查看我的企业信息')}
                </Button>
              )}
            </div>
          </div>
        </Spin>
      </React.Fragment>
    );
  }
}
