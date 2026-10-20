/*
 * InvestigateHeader - 调查表头
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { Form, Output } from 'choerodon-ui/pro';

import styles from '../index.less';

/**
 * 调查表头
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
export default class InvestigateHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSet, customizeForm } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUP_INV_MAN_INV_PROCESS.INVESTIGATE_HEADER',
      },
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout="vertical"
        className={classnames(
          'c7n-pro-vertical-form-display',
          styles['card-invite-investigate-form']
        )}
      >
        <Output name="investgNumber" />
        <Output name="processStatusMeaning" />
        <Output name="releaseDate" />
        <Output name="createUserRealName" />
        <Output name="companyNum" />
        <Output name="companyName" />
        <Output name="partnerCompanyNum" />
        <Output name="partnerCompanyName" />
        <Output name="remark" newLine colSpan={2} />
        <Output name="partnerRemark" newLine colSpan={2} />
      </Form>
    );
  }
}
