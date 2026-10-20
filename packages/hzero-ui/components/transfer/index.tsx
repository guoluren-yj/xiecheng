import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NTransfer from 'choerodon-ui/lib/transfer';
import type {
  TransferDirection,
  TransferItem,
  TransferListProps,
  TransferLocale,
  TransferOperationProps,
  TransferProps,
  TransferSearchProps,
} from 'choerodon-ui/lib/transfer';
import List from './list';
import Operation from './operation';
import Search from './search';
import C7NButtonProps from '../button/overwriteProps';
import C7NInputProps from '../input/overwriteProps';

export type {
  TransferListProps,
  TransferOperationProps,
  TransferSearchProps,
  TransferItem,
  TransferLocale,
  TransferProps,
  TransferDirection,
};

const Transfer: ForwardRefExoticComponent<TransferProps> = forwardRef<C7NTransfer, TransferProps>((props, ref) => {
  return (
    <C7NTransfer
      prefixCls="ant-transfer"
      checkboxPrefixCls="ant-checkbox"
      buttonProps={C7NButtonProps}
      inputProps={C7NInputProps}
      {...props}
      ref={ref}
    />
  );
});

Transfer.displayName = 'Transfer<hzeroWithC7n>';

type TransferType = typeof Transfer & {
  List: typeof List;
  Operation: typeof Operation;
  Search: typeof Search;
}
(Transfer as TransferType).List = List;
(Transfer as TransferType).Operation = Operation;
(Transfer as TransferType).Search = Search;

export default Transfer as TransferType;
