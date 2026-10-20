import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NTag from 'choerodon-ui/lib/tag';
import type { CheckableTagProps, TagProps, TagState } from 'choerodon-ui/lib/tag';
import CheckableTag from './CheckableTag';

export type { TagProps, TagState, CheckableTagProps };

const Tag: ForwardRefExoticComponent<TagProps> = forwardRef<C7NTag, TagProps>((props, ref) => {
  return <C7NTag prefixCls="ant-tag" {...props} ref={ref} />;
});

Tag.displayName = 'Tag<hzeroWithC7n>';

type TagType = typeof Tag & { CheckableTag: typeof CheckableTag };

(Tag as TagType).CheckableTag = CheckableTag;

export default Tag as TagType;
