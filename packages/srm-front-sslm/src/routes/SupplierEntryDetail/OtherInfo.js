import React, { useEffect, useMemo } from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import '@/routes/index.less';

const OtherInfo = ({
  type = '',
  dataSet,
  isEdit,
  pubEditFlag,
  customizeForm,
  custLoading,
  customizeUnitCode,
}) => {
  useEffect(() => {
    // 工作流-信息补录不处理
    if (type !== 'APPROVAL_SUPPLEMENT') {
      dataSet.query();
    }
  }, [dataSet, type]);

  const styleFlag = useMemo(() => isEdit && type !== 'APPROVAL_SUPPLEMENT', [isEdit, type]);

  return (
    <div style={styleFlag ? { minHeight: 'calc(100vh - 680px)' } : {}}>
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeUnitCode,
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !(isEdit || pubEditFlag),
            enableReLoad: false,
          },
          <Form
            dataSet={dataSet}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            custLoading={custLoading}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
            useWidthPercent={!['history', 'APPROVAL_SUPPLEMENT'].includes(type)}
          />
        )}
      </Spin>
    </div>
  );
};

export default OtherInfo;
