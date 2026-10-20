import type { FunctionComponent } from 'react';
import React from 'react';
import type { CheckableTagProps } from 'choerodon-ui/lib/tag/CheckableTag';
import Tag from 'choerodon-ui/lib/tag';

const C7NCheckableTag = Tag.CheckableTag;

export type {
  CheckableTagProps,
};

const CheckableTag: FunctionComponent<CheckableTagProps> = function CheckableTag(props) {
  return <C7NCheckableTag prefixCls="ant-tag" {...props} />;
};

CheckableTag.displayName = 'CheckableTag';

export default CheckableTag;
