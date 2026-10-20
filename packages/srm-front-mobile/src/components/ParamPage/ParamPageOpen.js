import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ParamPage from './ParamPage';

export default class ParamPageOpen {
  static open(options) {
    const { fieldCode, fieldValue, dataSet } = options;
    const key = Modal.key();
    Modal.open({
      key,
      drawer: true,
      closable: true,
      footer: null,
      title: intl.get('smbl.common.model.paramDef').d('参数定义'),
      children: <ParamPage fieldCode={fieldCode} fieldValue={fieldValue} dataSet={dataSet} />,
      style: {
        height: '100%',
        width: 1000,
      },
      okButton: false,
      cancelButton: false,
    });
  }
}
