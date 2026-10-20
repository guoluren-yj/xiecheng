import type { FunctionComponent } from 'react';
import React from 'react';
import type { TransferSearchProps } from 'choerodon-ui/lib/transfer/search';
import Transfer from 'choerodon-ui/lib/transfer';
import C7NInputProps from '../input/overwriteProps';

const C7NTransferSearch = Transfer.Search;

export type {
  TransferSearchProps,
};

const Search: FunctionComponent<TransferSearchProps> = function Search(props) {
  return <C7NTransferSearch inputProps={C7NInputProps} {...props} />;
};

Search.displayName = 'TransferSearch<hzeroWithC7n>';

export default Search;
