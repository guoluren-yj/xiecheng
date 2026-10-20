import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import omit from 'lodash/omit';
import type { UrlAttachmentProps } from './UrlAttachment';
import Attachment from './UrlAttachment';

export type DraggerProps = UrlAttachmentProps & { height?: number, children?: ReactNode[] };

const Dragger: FunctionComponent<DraggerProps> = props => {
  const { style, height, children } = props;
  const dragBoxRender = children;
  const omitProps = omit(props, ['children']);
  return <Attachment {...omitProps} dragUpload dragBoxRender={dragBoxRender} style={{ ...style, height }} />;
};

export default Dragger;
