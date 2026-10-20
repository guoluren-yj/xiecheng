/* eslint-disable import/no-cycle */
import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/mode/javascript/javascript';

import intl from 'utils/intl';
import HeadLine from '@/routes/components/HeadLine';
// import notification from 'utils/notification';
import CodeAreaPro from '@/routes/components/CodeAreaPro';

import { logDS } from './ds';
import styles from './log.less';

function LogModal(props) {
  const logDs = useMemo(() => new DataSet(logDS()), []);
  const { type, lastData, data } = props;
  useEffect(() => {
    logDs.loadData([{ ...lastData, ...data }]);
  }, []);

  const textList = {
    REQUEST: [intl.get('smodr.ecBill.view.yewu').d('业务调用'), intl.get('smodr.ecBill.view.zhuanfa').d('转发电商')],
    PUSH_REQUEST: [intl.get('smodr.ecBill.model.ecPush').d('电商推送'), intl.get('smodr.ecBill.model.pushDownStream').d('推送下游')],
    PUSH: [intl.get('smodr.ecBill.model.ecPush').d('电商推送'), intl.get('smodr.ecBill.model.pushDownStream').d('推送下游')],
    PULL: [intl.get('smodr.ecBill.view.lunxun').d('消息轮询'), intl.get('smodr.ecBill.model.pushDownStream').d('推送下游')],
  };

  // const handleCopy = (copytype = '') => {
  //   const textArea = document.createElement('textarea');
  //   textArea.value = data[copytype];
  //   document.body.appendChild(textArea);
  //   textArea.select();
  //   document.execCommand('Copy');
  //   notification.success({ message: intl.get('smodr.ecBill.view.copySuccess').d('复制成功') });
  //   document.body.removeChild(textArea);
  // };

  const renderItem = () => {
    const list = [
      { name: 'pullTypeMeaning' },
      { name: 'ecInteractionModeMeaning' },
      { name: 'messageKey', filter: type === 'UPDATE' || type === 'PUTAWAY' },
      { name: 'srmOrderCode', filter: type === 'DELIVERY' || type === 'ECORDER' },
      { name: 'ecOrderCode', filter: type === 'DELIVERY' || type === 'ECORDER' },
      { name: 'ecConsignmentCode', filter: type === 'DELIVERY' },
      { name: 'afsApplyCode', filter: type === 'AFALL' },
      { name: 'ecAfsApplyCode', filter: type === 'AFALL' },
      { name: 'ecSubOrderCode', filter: type === 'DELIVERY' || type === 'AFALL' },
      { name: 'applicationNo', filter: type === 'INVOICE' },
      { name: 'ecBillCode', filter: type === 'STATEMENT' },
      { name: 'creationDate' },
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
      />
      <div className={styles.content}>
        <div className='log-title'>{textList[data.sourceMethod]?.[0]}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <CodeAreaPro
            copy
            value={data.requestMessage}
            copyText={intl.get('smodr.ecBill.view.copy').d('复制')}
            title={intl.get('smodr.ecBill.model.requestParam').d('请求参数')}
            codeProps={{
              disabled: true,
            }}
          />
          <CodeAreaPro
            copy
            value={props.data.requestMessageResult}
            copyText={intl.get('smodr.ecBill.view.copy').d('复制')}
            title={intl.get('smodr.ecBill.model.responseParam').d('响应参数')}
            codeProps={{
              disabled: true,
            }}
          />
        </div>
        <div className='log-title' style={{ marginTop: '16px' }}>{textList[data.sourceMethod]?.[1]}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <CodeAreaPro
            copy
            value={props.data.responseMessage}
            copyText={intl.get('smodr.ecBill.view.copy').d('复制')}
            title={intl.get('smodr.ecBill.model.requestParam').d('请求参数')}
            codeProps={{
              disabled: true,
            }}
          />
          <CodeAreaPro
            copy
            value={props.data.responseMessageResult}
            copyText={intl.get('smodr.ecBill.view.copy').d('复制')}
            title={intl.get('smodr.ecBill.model.responseParam').d('响应参数')}
            codeProps={{
              disabled: true,
            }}
          />
        </div>
      </div>

    </React.Fragment>
  );
}

export default LogModal;
