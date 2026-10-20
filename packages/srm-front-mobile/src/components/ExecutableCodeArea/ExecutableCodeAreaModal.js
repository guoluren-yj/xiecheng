import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import ExecutableCodeArea from '@/components/ExecutableCodeArea';

export default class ExecutableCodeAreaModal {
  static open(options, codeAreaOptions) {
    const { onOk, onCancel } = options;
    Modal.open({
      ...options,
      onOk: undefined,
      onCancel: undefined,
      children: (
        <ExecutableCodeArea
          style={codeAreaOptions.style}
          readOnly={codeAreaOptions.readOnly}
          record={codeAreaOptions.record}
          dataSet={codeAreaOptions.dataSet}
          name={codeAreaOptions.name}
          autoSaveId={options.autoSaveId}
          onOk={onOk}
          onCancel={onCancel}
        />
      ),
    });
  }

  static isPromiss = (val) => {
    return (
      val &&
      (typeof val === 'function' || typeof val === 'object') &&
      typeof val.then === 'function'
    );
  };
}
