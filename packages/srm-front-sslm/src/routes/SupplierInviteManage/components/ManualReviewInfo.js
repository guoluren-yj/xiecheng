/*
 * ManualReviewInfo - 企业认证-人工材料
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
// import classnames from 'classnames';
import { Form, Output, Attachment } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

/**
 * 企业认证-人工材料
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
export default class ManualReviewInfo extends Component {
  render() {
    const { dataSet } = this.props;
    return (
      <div>
        <Form
          dataSet={dataSet}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          style={{
            width: '75%',
          }}
        >
          <Output name="proposerName" />
          <Output name="reason" />
          <Attachment
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-common"
            funcType="link"
            viewMode="list"
            readOnly
          />
        </Form>
      </div>
    );
  }
}
