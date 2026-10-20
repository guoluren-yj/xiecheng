import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type C7NTransferListType from 'choerodon-ui/lib/transfer/list';
import type { TransferListProps } from 'choerodon-ui/lib/transfer/list';
import Transfer from 'choerodon-ui/lib/transfer';
import C7NInputProps from '../input/overwriteProps';

const C7NTransferList = Transfer.List;

export type {
  TransferListProps,
};

const TransferList: ForwardRefExoticComponent<TransferListProps> = forwardRef<C7NTransferListType, TransferListProps>((props, ref) => {
  return <C7NTransferList checkboxPrefixCls="ant-checkbox" inputProps={C7NInputProps} {...props} ref={ref} />;
});

TransferList.displayName = 'TransferList<hzeroWithC7n>';

export default TransferList;
