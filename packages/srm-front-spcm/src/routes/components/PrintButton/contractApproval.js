import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';

@connect(({ loading, contractCommon }) => ({
  loading: loading.effects['contractCommon/printContractApproval'],
  contractCommon,
}))
export default class ContractApprovalButton extends Component {
  @Bind()
  @Debounce(1000)
  handlePrint() {
    const { pcHeaderId, dispatch } = this.props;
    dispatch({
      type: 'contractCommon/printContractApproval',
      payload: pcHeaderId,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window?.open(fileURL);
        if (printWindow?.print) {
          printWindow.print();
        }
      }
    });
  }

  render() {
    const { loading, disabled = false, ...restProps } = this.props;
    return (
      <PermissionButton
        {...restProps}
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.print.contract',
            type: 'button',
            meaning: '合同报批表',
          },
        ]}
        loading={loading}
        style={{ paddingRight: '1em' }}
        disabled={disabled}
        onClick={this.handlePrint}
      >
        {intl.get('spcm.common.option.contractApproval').d('合同报批表')}
      </PermissionButton>
    );
  }
}
