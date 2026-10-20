/**
 * FinanceInfo - 企业注册-财务信息
 * @date: 2018-7-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import { SRM_PLATFORM } from '_utils/config';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FinanceList from '../Edit/FinanceList';

import styles from './ProcessInfo.less';

/**
 * 企业注册财务信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} financeInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: 'spfm.finance',
})
@connect(({ financeInfo, loading }) => ({
  financeInfo,
  loading: loading.models.financeInfo,
}))
@withRouter
export default class FinanceInfo extends PureComponent {
  /**
   *Creates an instance of FinanceInfo.
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.history.location.search.substr(1));
    this.state = {
      companyId: routerParam.companyId,
      domesticForeignRelation: routerParam.domesticForeignRelation,
    };
  }

  /**
   * ref方法
   * @param {object} form 表单
   */
  @Bind()
  onRef(form) {
    this.businessForm = form;
  }

  /**
   * 回调方法
   */
  @Bind()
  callback() {
    const { history, fetchPreviewDetail } = this.props;
    const { companyId, domesticForeignRelation } = this.state;
    fetchPreviewDetail(companyId).then(() => {
      history.push(
        `/spfm/enterprise/register/attachment?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
      );
    });
  }

  /**
   * 返回上一步回调方法
   */
  @Bind()
  previousCallback() {
    const { history } = this.props;
    const { companyId, domesticForeignRelation } = this.state;
    history.push(
      `${SRM_PLATFORM}/enterprise/register/invoice?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const { companyId, domesticForeignRelation } = this.state;

    return (
      <React.Fragment>
        <Content>
          <div className={styles['item-wrapper']}>
            <h3 className={styles['item-wrapper-title']}>
              {intl.get('spfm.finance.view.message.titlt').d('财务信息')}
            </h3>
            <div>
              {intl
                .get('spfm.finance.view.message.description')
                .d('非常重要: 提供贵司的近三年财务报告，有利于展示您的经营与发展状况。')}
            </div>
          </div>
          <FinanceList
            onRef={this.onRef}
            previousCallback={this.previousCallback}
            backBtnText={intl.get('hzero.common.button.previous').d('上一步')}
            buttonText={intl.get('hzero.common.button.next').d('下一步')}
            domesticForeignRelation={domesticForeignRelation}
            callback={this.callback}
            companyId={companyId}
          />
        </Content>
      </React.Fragment>
    );
  }
}
