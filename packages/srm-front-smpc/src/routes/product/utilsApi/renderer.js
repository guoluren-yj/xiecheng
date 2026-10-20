import React from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

const customTag = (value, yesText, noText) => {
  return (
    <Tag
      color={value === 1 ? 'rgba(71,184,129,0.10)' : '#E5E5E5'}
      style={{ color: value === 1 ? 'rgba(71,184,129,1)' : 'rgba(0,0,0,0.85)' }}
    >
      {value === 1 ? yesText : noText}
    </Tag>
  );
};

const custom2StatusTag = (value, yesText, noText) => {
  return (
    <Tag color={value === 1 ? 'green' : 'red'} border={false}>
      {value === 1 ? yesText : noText}
    </Tag>
  );
};

export function ynRenderer({ value }) {
  return customTag(
    value,
    intl.get('smpc.product.model.effective').d('有效'),
    intl.get('smpc.product.model.invalid').d('无效')
  );
}

export function enabledRenderer({ value }) {
  return custom2StatusTag(
    value,
    intl.get('smpc.product.status.enable').d('启用'),
    intl.get('smpc.product.status.disable').d('禁用')
  );
}

export function mappingStatusRenderer({ value }) {
  return customTag(
    value,
    intl.get('smpc.product.model.hadMapping').d('已映射'),
    intl.get('smpc.product.model.noMapping').d('未映射')
  );
}

export function yesOrNoRenderer({ value }) {
  return customTag(
    value,
    intl.get('smpc.product.model.yes').d('是'),
    intl.get('smpc.product.model.no').d('否')
  );
}

export function supportFlagRenderer({ value }) {
  return customTag(
    value,
    intl.get('smpc.product.model.support').d('支持'),
    intl.get('smpc.product.model.unSupport').d('不支持')
  );
}

export function createMethodRenderer({ value }) {
  return customTag(
    value,
    intl.get('smpc.product.model.agreementCreation').d('协议创建'),
    intl.get('smpc.product.model.manualCreation').d('手工创建')
  );
}
