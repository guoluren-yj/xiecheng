import type { FunctionComponent } from 'react';
import React from 'react';
import type { TransferOperationProps } from 'choerodon-ui/lib/transfer/operation';
import Transfer from 'choerodon-ui/lib/transfer';
import C7NButtonProps from '../button/overwriteProps';

const C7NTransferOperation = Transfer.Operation;

export type {
  TransferOperationProps,
};

const Operation: FunctionComponent<TransferOperationProps> = function Operation(props) {
  return <C7NTransferOperation buttonProps={C7NButtonProps} {...props} />;
};

Operation.displayName = 'TransferOperation<hzeroWithC7n>';

export default Operation;
