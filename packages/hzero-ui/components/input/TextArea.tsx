import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type C7NTextAreaType from 'choerodon-ui/lib/input/TextArea';
import type { AutoSizeType, HTMLTextareaProps, TextAreaProps, TextAreaState } from 'choerodon-ui/lib/input/TextArea';
import Input from 'choerodon-ui/lib/input';
import C7NInputProps from './overwriteProps';

const C7NTextArea = Input.TextArea;

export type {
  AutoSizeType, TextAreaProps, TextAreaState, HTMLTextareaProps,
};

const TextArea: ForwardRefExoticComponent<TextAreaProps> = forwardRef<C7NTextAreaType, TextAreaProps>((props, ref) => {
  return <C7NTextArea {...C7NInputProps} {...props} ref={ref} />;
});

TextArea.displayName = 'TextArea<hzeroWithC7n>';

export default TextArea;
