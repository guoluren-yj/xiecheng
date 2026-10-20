import React, { useContext, useMemo } from 'react';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import { replacePrivateBucket } from '@/utils/utils';

import { StoreContext } from '../store/StoreProvider';
import style from '../index.less';

const ClarifyText = observer(() => {
  const {
    commonDs: { headerDs },
  } = useContext(StoreContext);

  // 富文本编辑内容
  const context = headerDs?.current?.get('context');

  // 处理后的富文本内容
  const newContext = useMemo(() => {
    return replacePrivateBucket(context);
  }, [context]);

  return (
    <Collapse
      ghost
      trigger="icon"
      expandIconPosition="text-right"
      defaultActiveKey={['clarifyText']}
    >
      <Collapse.Panel
        header={intl.get('ssrc.clarify.view.title.clarifyText').d('澄清函正文')}
        key="clarifyText"
      >
        <div className={style['context-style']} dangerouslySetInnerHTML={{ __html: newContext }} />
      </Collapse.Panel>
    </Collapse>
  );
});

export default ClarifyText;
