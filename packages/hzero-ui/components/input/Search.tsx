import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type C7NSearchType from 'choerodon-ui/lib/input/Search';
import type { SearchProps } from 'choerodon-ui/lib/input/Search';
import Input from 'choerodon-ui/lib/input';
import { Size } from 'choerodon-ui/lib/_util/enum';
import C7NButtonProps from '../button/overwriteProps';
import C7NInputProps from './overwriteProps';

const C7NSearch = Input.Search;

export type {
  SearchProps,
};

const Search: ForwardRefExoticComponent<SearchProps> = forwardRef<C7NSearchType, SearchProps>((props, ref) => {
  return (
    <C7NSearch
      {...C7NInputProps}
      size={Size.default}
      enterButton={false}
      prefixCls="ant-input-search"
      inputPrefixCls="ant-input"
      buttonProps={C7NButtonProps}
      {...props}
      ref={ref}
    />
  );
});

Search.displayName = 'Search<hzeroWithC7n>';

export default Search;
