/**
 * CacheFilterForm - 缓存查询条件组件
 * @date: 2024-05-20
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';

import { Form } from 'hzero-ui';
import CacheComponent from 'components/CacheComponent';

import FilterForm from './FilterForm';

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sslm/enterprise-inform-confirm/list-tenant' })
export class TenantFilterForm extends Component {
  render() {
    return <FilterForm {...this.props} isTenant />;
  }
}

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sslm/enterprise-inform-confirm/list-platform' })
export class PlatformFilterForm extends Component {
  render() {
    return <FilterForm {...this.props} />;
  }
}
