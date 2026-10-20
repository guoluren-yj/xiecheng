/**
 * InvoiceInfo - 企业注册-开票信息
 * @date: 2019-2-14
 * @author: chenjing <jing.chen05@hand-china.com>
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
import InvoiceList from '../Edit/InvoiceList';

import styles from './ProcessInfo.less';

/**
 * 企业注册开票信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invoiceInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: 'spfm.invoice',
})
@connect(({ invoiceInfo, loading }) => ({
  invoiceInfo,
  loading: loading.models.invoiceInfo,
}))
@withRouter
export default class InvoiceInfo extends PureComponent {
  /**
   *Creates an instance of InvoiceInfo.
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
    this.invoiceForm = form;
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
        `/spfm/enterprise/register/finance?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
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
      `${SRM_PLATFORM}/enterprise/register/bank?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const { company } = this.props;
    const { companyId, domesticForeignRelation } = this.state;
    return (
      <React.Fragment>
        <Content>
          <div className={styles['item-wrapper']}>
            <h3 className={styles['item-wrapper-title']}>
              {intl.get('spfm.invoice.view.message.title').d('开票信息')}
            </h3>
            <div>
              {intl
                .get('spfm.invoice.view.message.description')
                .d('非常重要: 开票信息要保证发票真实有效，请维护准确完整的开票信息。')}
            </div>
          </div>
          <InvoiceList
            onRef={this.onRef}
            previousCallback={this.previousCallback}
            backBtnText={intl.get('hzero.common.button.previous').d('上一步')}
            buttonText={intl.get('hzero.common.button.next').d('下一步')}
            domesticForeignRelation={domesticForeignRelation}
            callback={this.callback}
            companyId={companyId}
            company={company}
          />
        </Content>
      </React.Fragment>
    );
  }
}
