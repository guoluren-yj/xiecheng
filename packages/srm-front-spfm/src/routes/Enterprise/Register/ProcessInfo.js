import React from 'react';
import { isFunction } from 'lodash';
import { Button, Tooltip, Spin } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
// import { queryCompanyBasic } from '@/services/legalService';

import styles from './ProcessInfo.less';

function Tuple({ title, value }) {
  return (
    <div className={styles.tuple}>
      <span className={`${styles['text-overflow']} ${styles['tuple-title']}`}>{title}:</span>
      <Tooltip title={value} placement="right">
        <span className={`${styles['text-overflow']} ${styles['tuple-value']}`}>{value}</span>
      </Tooltip>
    </div>
  );
}

/**
 * ProcessInfo-企业审批进程
 * @reactProps {!Object} result 所有企业什么进程的信息
 * @reactProps {!String} result.companyName 企业名称
 * @reactProps {!String} result.applicantPerson 申请人
 * @reactProps {!String} result.commitDate 提交时间
 */
@formatterCollections({ code: 'spfm.process' })
@connect()
export default class ProcessInfo extends React.PureComponent {
  state = {};

  @Bind()
  handleGotoViewCompany() {
    const { history, isTenant } = this.props;
    const routerParam = querystring.parse(this.props.history.location.search.substr(1));
    history.push(
      isTenant
        ? `/spfm/enterprise/register/preview?companyId=${routerParam.companyId}&domesticForeignRelation=${routerParam.domesticForeignRelation}`
        : '/spfm/enterprise/register/preview'
    );
  }

  render() {
    const { match, dispatch, company } = this.props;
    let stepStatus = '';
    let stepTips = '';
    // eslint-disable-next-line default-case
    switch (company && company.processStatus) {
      // todo REJECT UPDATE ERROR
      case 'PENDING':
        if (match.path === `${SRM_PLATFORM}/enterprise/register/result`) {
          if (isFunction(dispatch)) {
            dispatch(routerRedux.push(`${SRM_PLATFORM}/enterprise/register/legal`));
          }
          return null;
        }
        break;
      case 'SUBMIT':
        stepStatus = intl.get('spfm.process.view.message.step.processTitle').d('审批中');
        stepTips = intl
          .get('spfm.process.view.message.step.successDescription')
          .d('您已提交认证申请，请耐心等待审批');
        break;
      case 'COMPLETE':
        stepStatus = intl.get('spfm.process.view.message.step.completeTitle').d('完成');
        stepTips = intl
          .get('spfm.process.view.message.step.successedDescription')
          .d('您已完成企业认证，请退出重新登录');
        break;
      // default:
      //   // stepStatus = intl.get('spfm.process.view.message.step.initTitle').d('维护企业信息提交');
      //   stepStatus = intl.get('spfm.process.view.message.step.processTitle').d('审批中');
      //   break;
    }
    if (!company) {
      return <Spin size="large" style={{ marginTop: '25%' }} />;
    }
    return (
      <React.Fragment>
        <div className={styles['process-info']}>
          <div className={styles['pending-approval']} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 40 }}>{stepTips}</div>
            <div>
              <Tuple
                title={intl.get('spfm.process.model.company.company').d('企业')}
                value={company.companyName}
              />
              <Tuple
                title={intl.get('spfm.process.model.company.processDate').d('提交时间')}
                value={company.processDate}
              />
              <div>
                <span className={styles['tuple-title']}>
                  {intl.get('spfm.process.view.process.title').d('当前状态：')}
                </span>
                <span style={{ fontSize: 14, color: '#6C8BE0' }}>{stepStatus}</span>
              </div>
              <Button style={{ marginTop: 40 }} type="primary" onClick={this.handleGotoViewCompany}>
                {intl.get('spfm.process.view.option.viewCompanyInfo').d('查看我的企业信息')}
              </Button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
