import React, { Children, cloneElement, FunctionComponent, isValidElement, memo, ReactNode } from 'react';

const FormVirtualGroup: FunctionComponent<{ children?: ReactNode }> = memo(function (props) {

  const { children, ...otherProps } = props;
  if (children) {
    return (
      <>
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            return cloneElement(child, otherProps);
          }
          return child;
        })}
      </>
    );
  }
  return null;
});

FormVirtualGroup.displayName = 'FormVirtualGroup';

type FormVirtualGroupType = typeof FormVirtualGroup & {
  __PRO_FORM_VIRTUAL_GROUP: boolean;
}

(FormVirtualGroup as FormVirtualGroupType).__PRO_FORM_VIRTUAL_GROUP = true;

export default FormVirtualGroup as FormVirtualGroupType;
