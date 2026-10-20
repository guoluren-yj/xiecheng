import React, { Component } from 'react';
import { connect } from 'dva';
import { debounce } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button } from 'hzero-ui';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import { Button as ButtonPro } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { extraPrintFile } from '@/services/contractCommonService';

@connect(({ loading, contractCommon }) => ({
  loading: loading.effects['contractCommon/printFile'],
  contractCommon,
}))
export default class PrintButton extends Component {
  @Bind()
  handlePrint() {
    const { pcHeaderId, dispatch } = this.props;
    const { userAgent } = window.navigator; // 取得浏览器的userAgent字符串
    const ua = userAgent.toLowerCase();
    const isWeiXin = ua.match(/MicroMessenger/i) === 'micromessenger';
    dispatch({
      type: 'contractCommon/printFile',
      payload: pcHeaderId,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        } else if (isWeiXin) {
          window.location.href = fileURL;
        } else {
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      }
    });
  }

  @Bind()
  handleCheckPrint() {
    const { pcHeaderId } = this.props;
    const flag = checkPrintWindow();
    if (flag) {
      this.handlePrint();
    } else {
      // 请求添加headers，若原来传的responseType 为非 json 的值需增加判断
      extraPrintFile(pcHeaderId).then(async (res) => {
        const { fileUrl, bucketName, fileToken } = res;
        const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
        window.open(url);
      });
    }
  }

  render() {
    const {
      loading,
      disabled = false,
      isBtnPro,
      icon,
      inMenuItem,
      buttonProps,
      ...restProps
    } = this.props;
    const Btn = isBtnPro ? ButtonPro : Button;
    return (
      <Btn
        {...restProps}
        {...buttonProps}
        // funcType={inMenuItem? 'link' : restProps.funcType}
        // icon={inMenuItem ? undefined : icon || 'print'}
        icon={icon || 'print'}
        loading={loading}
        onClick={debounce(this.handleCheckPrint, 500)}
        disabled={disabled}
      >
        {intl.get('spcm.common.option.print').d('打印')}
      </Btn>
    );
  }
}
