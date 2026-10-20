/*
 * ContactInfo - 联系人信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';

/**
 * 联系人信息
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
export default class ContactInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 处理列
   */
  @Bind()
  handleColumns() {
    const columns = [
      {
        name: 'name',
      },
      {
        name: 'gender',
      },
      {
        name: 'mail',
      },
      {
        name: 'mobilephone',
      },
      {
        name: 'telephone',
      },
      {
        name: 'department',
      },
      {
        name: 'position',
      },
      {
        name: 'description',
      },
      {
        name: 'defaultFlag',
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
    ];
    return columns;
  }

  render() {
    const { dataSet } = this.props;
    return (
      <React.Fragment>
        <Table dataSet={dataSet} columns={this.handleColumns()} />
      </React.Fragment>
    );
  }
}
