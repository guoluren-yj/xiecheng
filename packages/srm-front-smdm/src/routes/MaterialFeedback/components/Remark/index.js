/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-21 17:44:42
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-03 16:01:34
 */
import React, { useImperativeHandle } from 'react';
import { Form, TextArea, useDataSet } from 'choerodon-ui/pro';

import RemarkDs from './RemarkDs';

const Remark = React.forwardRef(
  ({ required = false, remarkLabel, customizeForm, cusCode }, ref) => {
    const remarkInfo = useDataSet(
      () =>
        RemarkDs({
          required,
        }),
      [required]
    );

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));

    const loadCurrentData = (data) => {
      remarkInfo.loadData([data]);
    };

    const handleGetDeatial = (detailField) => remarkInfo.get(detailField);

    const saveCurrentData = () => {
      return remarkInfo;
    };

    return (
      <div>
        {cusCode ? (
          customizeForm(
            {
              code: cusCode,
              __force_record_to_update__: true,
              dataSet: remarkInfo,
            },
            <Form dataSet={remarkInfo} useColon={false} labelLayout="float">
              <TextArea name="operationReason" resize="vertical" label={remarkLabel} />
            </Form>
          )
        ) : (
          <Form dataSet={remarkInfo} useColon={false} labelLayout="float">
            <TextArea name="operationReason" resize="vertical" label={remarkLabel} />
          </Form>
        )}
      </div>
    );
  }
);

export default Remark;
