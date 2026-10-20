import { getContext, Symbols } from 'choerodon-ui/shared';

if (!Symbols.H0TreeSelectContext) {
  Symbols.H0TreeSelectContext = Symbol('H0TreeSelectContext');
}

const TreeSelectContext = getContext(Symbols.H0TreeSelectContext, {});

export default TreeSelectContext;
