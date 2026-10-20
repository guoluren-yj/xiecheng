import React, { forwardRef } from 'react';
import type { ForwardRefExoticComponent } from 'react';
import C7NAffix from 'choerodon-ui/lib/affix';
import type { AffixProps, AffixState } from 'choerodon-ui/lib/affix';

export type { AffixProps, AffixState };

const Affix: ForwardRefExoticComponent<AffixProps> = forwardRef<C7NAffix, AffixProps>((props, ref) => {
  return <C7NAffix prefixCls="ant-affix" {...props} ref={ref} />;
});

Affix.displayName = 'Affix<hzeroWithC7n>';

export default Affix;
