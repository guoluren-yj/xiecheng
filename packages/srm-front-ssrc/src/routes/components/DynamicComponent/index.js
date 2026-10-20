/**
 * 动态组件
 * @date: 2021-07-15
 * @author: Goku<xu.pan01@going-linkc.om>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */

import React, { Component } from 'react';
import { isFunction } from 'lodash';

import EmbedPage from '_components/EmbedPage';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

function replace(mappings, targetString, record) {
  let newString = targetString;
  for (let i = 0; i < mappings.length; i++) {
    if (mappings[i] === '{organizationId}' || mappings[i] === '{tenantId}') {
      // eslint-disable-next-line no-continue
      continue;
    }
    const key = mappings[i].match(/{([^{}]*)}/)[1];
    const value = record ? (isFunction(record.get) ? record.get(key) : record[key]) : ''; // 区分取值方式
    newString = newString.replace(`{${key}}`, value);
  }
  newString = newString.replace(/{organizationId}/, organizationId);
  newString = newString.replace(/{tenantId}/, tenantId);
  return newString;
}

export default class DynamicComponent extends Component {
  render() {
    const {
      record, // 数据源
      linkHref, // 链接
    } = this.props;
    let newHref = linkHref || '';
    const mappings = newHref.match(/{([^{}]*)}/g);
    if (mappings) {
      newHref = replace(mappings, newHref, record);
    }
    const pageProps = {
      href: newHref,
      pageData: record,
    };
    return <EmbedPage {...pageProps} />;
  }
}
