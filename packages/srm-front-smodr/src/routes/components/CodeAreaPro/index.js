import React from 'react';
import { CodeArea, Button } from 'choerodon-ui/pro';

import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

function CodeAreaPro(props) {
  const { title, copy, copyText, value, codeProps = {} } = props;
  const handleCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('Copy');
    notification.success({ message: intl.get('smodr.ecBill.view.copySuccess').d('复制成功') });
    document.body.removeChild(textArea);
  };
  return (
    <div className={styles['code-container']}>
      <div className='code-header'>
        <div className='code-title'>{title}</div>
        {copy && <Button onClick={handleCopy} color="primary" funcType="flat" icon="baseline-file_copy">{copyText}</Button>}
      </div>
      <CodeArea value={value} {...codeProps} />
    </div>
  );
}

export default CodeAreaPro;