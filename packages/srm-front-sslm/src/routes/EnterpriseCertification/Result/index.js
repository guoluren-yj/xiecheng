/*
 * Result - 结果页
 * @Date: 2022-07-02 09:57:53
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { Fragment, Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import { ReactComponent as SuccessImg } from '@/assets/certification/success-new.svg';

import { fetchPublicData } from '@/services/enterpriseCertificationService';

import globalStyles from '@/routes/index.less';
import styles from '../index.less';

/**
 * 结果页
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
export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domesticForeignRelation: '',
      changeReqId: '',
      pageLoading: false,
      firmAttestationStatus: '',
      rejectRemark: '',
    };
  }

  componentDidMount() {
    const { hostname } = window.location;
    this.setState({
      pageLoading: true,
    });
    fetchPublicData(hostname)
      .then(res => {
        if (getResponse(res)) {
          const {
            domesticForeignRelation = 1,
            changeReqId = '',
            firmAttestationStatus,
            remark,
          } = res;
          this.setState({
            domesticForeignRelation,
            changeReqId,
            firmAttestationStatus,
            rejectRemark: remark,
          });
        }
      })
      .finally(() => {
        this.setState({
          pageLoading: false,
        });
      });
  }

  @Bind()
  handleGotoViewCompany() {
    const { history } = this.props;
    const { domesticForeignRelation, changeReqId, firmAttestationStatus } = this.state;
    const goToPreviewPage =
      firmAttestationStatus === 'SUBMIT' ||
      firmAttestationStatus === 'APPROVING' ||
      firmAttestationStatus === 'WFL_REJECT';
    // 关联企业
    if (goToPreviewPage) {
      history.push({
        pathname: `/sslm/enterprise-certification/preview-result`,
        search: querystring.stringify({
          domesticForeignRelation,
          changeReqId,
        }),
      });
    } else {
      history.push({
        pathname: '/sslm/enterprise-certification/affiliated-result',
      });
    }
  }

  render() {
    const { pageLoading, firmAttestationStatus, rejectRemark } = this.state;
    const rejectFlag = firmAttestationStatus === 'REJECT';
    const successFlag = firmAttestationStatus === 'SUCCESS';
    return (
      <Fragment>
        <Header
          title={intl
            .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
            .d('企业认证')}
        />
        <Content>
          <Spin spinning={pageLoading}>
            <div className={styles['certification-content']}>
              <div className={styles['certification-result']}>
                <div className={styles['certification-result-item']}>
                  {/* <img
                    src={successImg}
                    alt={intl
                      .get('spfm.enterpriseCertification.view.title.successSubmit')
                      .d('您已成功提交认证申请')}
                  /> */}
                  <span className={globalStyles['svg-color']}>
                    <SuccessImg />
                  </span>
                  <div className={styles['certification-result-item-title']}>
                    {successFlag
                      ? intl
                          .get('spfm.enterpriseCertification.view.title.auditApproved')
                          .d('您的认证申请审核通过')
                      : rejectFlag
                      ? intl
                          .get('spfm.enterpriseCertification.view.title.auditFailed')
                          .d('您的认证申请审核失败')
                      : intl
                          .get('spfm.enterpriseCertification.view.title.successSubmit')
                          .d('您已成功提交认证申请')}
                  </div>
                  <div className={styles['certification-result-item-help']}>
                    {successFlag
                      ? null
                      : rejectFlag
                      ? intl
                          .get('spfm.enterpriseCertification.view.title.auditFailedMsg', {
                            rejectRemark,
                          })
                          .d(
                            `您的认证申请已被拒绝，拒绝原因：${rejectRemark}。请根据提示修改后重新提交`
                          )
                      : intl
                          .get('spfm.enterpriseCertification.view.title.pendingApproval')
                          .d(
                            '企业认证审批一般在1-3个工作日内完成，请耐心等待。如长时间未审核，可联系您的采购方进行确认'
                          )}
                  </div>
                  <div className={styles['certification-result-item-btn']}>
                    <Button
                      color="primary"
                      hidden={successFlag}
                      onClick={() => {
                        this.handleGotoViewCompany();
                      }}
                    >
                      {successFlag
                        ? intl
                            .get('spfm.enterpriseCertification.view.btn.successInformation')
                            .d('查看我的企业信息')
                        : rejectFlag
                        ? intl
                            .get('spfm.enterpriseCertification.view.btn.failInformation')
                            .d('修改我的企业信息')
                        : intl
                            .get('spfm.enterpriseCertification.view.btn.enterpriseInformation')
                            .d('查看我的企业信息')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
