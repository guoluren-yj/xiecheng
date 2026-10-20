/*
 * ContactInfo - 联系人信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
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
    const { contactInfo = {}, sourceKey } = this.props;
    const { enableFieldList = [] } = contactInfo;
    const columns = [
      {
        name: 'name',
        width: 150,
      },
      {
        name: 'gender',
        width: 100,
      },
      {
        name: 'idType',
        width: 120,
      },
      {
        name: 'idNum',
        width: 150,
        editor: sourceKey !== 'platformApprove' && <SecretField readOnly displayOutput />,
      },
      {
        name: 'contactType',
        width: 120,
      },
      {
        name: 'mobilephone',
        width: 200,
      },
      {
        name: 'mail',
        width: 200,
      },
      {
        name: 'telephone',
        width: 150,
      },
      {
        name: 'department',
        width: 150,
      },
      {
        name: 'position',
        width: 150,
      },
      {
        name: 'description',
        width: 170,
      },
      {
        name: 'defaultFlag',
        width: 100,
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
    ].filter(item => {
      return enableFieldList.includes(item.name);
    });
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
