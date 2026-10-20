/*
 * InvestigationWrite - 调查表填写
 * @date: 2018/08/28 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Select, Icon } from 'hzero-ui';
import { isString } from 'lodash';
import { queryIdpValue } from 'services/api';
import { getResponse } from 'utils/utils';

/**
 * 下拉框组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

// Option组件初始化
const { Option } = Select;

export default class FlexSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectOptionsDataSource: [],
      loading: false,
    };
  }

  componentDidMount() {
    const { lovCode } = this.props;
    if (!lovCode) return;
    if (!window.SSLMSELECTCACHE) {
      // 目前用于优化下拉框频繁调用查询接口
      window.SSLMSELECTCACHE = {};
    }
    const cacheOptions = lovCode && window.SSLMSELECTCACHE[lovCode];
    if (!cacheOptions) {
      this.setState({
        loading: true,
      });
      window.SSLMSELECTCACHE[lovCode] = new Promise((resolve, reject) => {
        queryIdpValue(lovCode)
          .then(
            (res = []) => {
              if (getResponse(res)) {
                const options = (!res.failed && res) || [];
                this.setState({ selectOptionsDataSource: options });
                resolve(options);
              }
            },
            () => {
              reject();
            }
          )
          .catch(() => {
            reject();
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      });
    } else if (cacheOptions instanceof Promise) {
      cacheOptions.then((options) => {
        this.setState({ selectOptionsDataSource: options || [] });
      });
    }
  }

  render() {
    const { selectOptionsDataSource = [], loading } = this.state;
    const {
      onChange = () => {},
      disabled = false,
      multipleFlag = false,
      value = undefined,
    } = this.props;
    const multipleConfig = multipleFlag
      ? {
          mode: 'multiple',
        }
      : undefined;
    return (
      <Select
        allowClear
        style={{ width: '100%' }}
        onChange={onChange}
        disabled={disabled}
        {...multipleConfig}
        value={value}
      >
        {loading || isString(selectOptionsDataSource) ? (
          <Option key="loading">
            <Icon type="loading" />
          </Option>
        ) : (
          selectOptionsDataSource.map((n) => <Option value={String(n.value)}>{n.meaning}</Option>)
        )}
      </Select>
    );
  }
}
