/**
 * FinanceInfo - 企业注册-附件信息
 * @date: 2018-7-9
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content } from 'components/Page';
import AttachmentList from '../Edit/AttachmentList';

import styles from './ProcessInfo.less';

/**
 * 企业注册附件信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} attachment - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: 'spfm.attachment',
})
@connect(({ attachment, loading }) => ({
  attachment,
  loading: loading.models.attachment,
}))
@withRouter
export default class AttachmentInfo extends PureComponent {
  /**
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
   * @param {object} form
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
      // 前往下一步预览，再进行提交审批
      history.push(
        `/spfm/enterprise/register/preview?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
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
      `/spfm/enterprise/register/finance?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
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
              {intl.get('spfm.attachment.view.message.titlt').d('公司附件')}
            </h3>
            <div>
              {intl
                .get('spfm.attachment.view.message.description')
                .d(
                  '您可在此处上传各类经营/质量及各类许可证信息，便于贵司的资质认可；同类型许可证可在同一行内上传多个附件。'
                )}
            </div>
          </div>
          <AttachmentList
            onRef={this.onRef}
            callback={this.callback}
            previousCallback={this.previousCallback}
            domesticForeignRelation={domesticForeignRelation}
            backBtnText={intl.get('hzero.common.button.previous').d('上一步')}
            buttonText={intl.get('hzero.common.button.next').d('下一步')}
            companyId={companyId}
          />
        </Content>
      </React.Fragment>
    );
  }
}
