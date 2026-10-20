/*
 * BusinessInfo - 业务信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import PictureCard from '@/routes/components/C7nUrlUpload/PictureCard';

/**
 * 业务信息
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
export default class BusinessInfo extends Component {
  render() {
    const { dataSet } = this.props;
    return (
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        <Output name="serviceType" />
        <Output name="industryList" />
        <Output
          renderer={({ record = {} }) => {
            const logoUrl = isEmpty(record) ? undefined : record.get('logoUrl');
            const logoFilename = isEmpty(record) ? undefined : record.get('logoFilename');
            return <PictureCard fileName={logoFilename} fileUrl={logoUrl} />;
          }}
          rowSpan={3}
        />

        <Output name="industryCategoryList" />
        <Output name="serviceAreaList" />
        <Output name="website" colSpan={2} newLine />
        <Output name="description" colSpan={2} />
      </Form>
    );
  }
}
