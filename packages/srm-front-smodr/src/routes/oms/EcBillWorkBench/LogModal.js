import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Output, CodeArea, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import HeadLine from '@/routes/components/HeadLine';
import notification from 'utils/notification';

import { logDS } from './ds';

function LogModal(props) {
  const logDs = useMemo(() => new DataSet(logDS()), []);
  const { type } = props;

  useEffect(() => {
    const { data } = props;
    logDs.loadData([data.recordDetail]);
  }, []);

  const handleCopy = () => {
    const { data } = props;
    const textArea = document.createElement('textarea');
    textArea.value = data.recordDetail?.allParam;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('Copy');
    notification.success({ message: intl.get('smodr.ecBill.view.copySuccess').d('复制成功') });
    document.body.removeChild(textArea);
  };

  const renderItem = () => {
    const list = [
      { name: 'interfaceNameMeaning' },
      { name: 'thirdOrderId', filter: type === '0' || type === '1' || type === '2' },
      { name: 'afsOrderId', filter: type === '3' },
      { name: 'deliveryId', filter: type === '1' || type === '2' },
      { name: 'applicationNo', filter: type === '5' },
      { name: 'billId', filter: type === '4' },
      { name: 'requestTime' },
    ].filter((i) => i.filter !== false);
    const arr = list.map((i) => <Output {...i} />);
    return arr;
  };

  return (
    <React.Fragment>
      <HeadLine title={intl.get('smodr.ecBill.view.baseInfo').d('基本信息')} />
      <Form
        className="c7n-pro-vertical-form-display"
        dataSet={logDs}
        columns={2}
        labelLayout="vertical"
      >
        {renderItem()}
      </Form>
      <HeadLine
        title={intl.get('smodr.ecBill.view.paramInfo').d('参数信息')}
        style={{ marginTop: '32px' }}
      >
        <Button
          color="primary"
          style={{ marginLeft: '16px', height: '24px', fontSize: '12px' }}
          icon="baseline-file_copy"
          funcType="flat"
          onClick={() => handleCopy()}
        >
          {intl.get('smodr.ecBill.view.copy').d('复制')}
        </Button>
      </HeadLine>
      <div style={{ color: 'rgba(0,0,0,0.45)', margin: '0 0 4px 0' }}>
        {intl.get('smodr.ecBill.model.requestParam').d('请求参数')}
      </div>
      <CodeArea disabled dataSet={logDs} name="inParam" />
      <div style={{ color: 'rgba(0,0,0,0.45)', margin: '16px 0 4px 0' }}>
        {intl.get('smodr.ecBill.model.responseParam').d('响应参数')}
      </div>
      <CodeArea disabled dataSet={logDs} name="outParam" />
    </React.Fragment>
  );
}

export default LogModal;
