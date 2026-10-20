import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'hzero-ui';
import { queryToolTip } from 'hzero-front/lib/services/api';
import RichTextEditor from 'hzero-front/lib/components/RichTextEditor';
import uuid from 'uuid/v4';
import styles from './index.less';

const Tips = (props) => {
  const { code, lang, title, children, ...others } = props;

  const [prevContent, setPrevContent] = useState('');
  const [prevTitle, setPrevTitle] = useState('');

  const staticTextEditor = useRef();

  useEffect(() => {
    queryToolTip({ textCode: code, lang }).then((res) => {
      if (res) {
        setPrevContent(res.text);
        setPrevTitle(res.title);
      } else {
        setPrevContent('');
        setPrevTitle('');
      }
    });
  }, [code]);

  const renderRichEditor = () => {
    return (
      <>
        <div style={{ textAlign: 'center' }}>{title || prevTitle}</div>
        <RichTextEditor
          readOnly
          key={uuid()}
          ref={staticTextEditor}
          content={prevContent}
          config={{
            height: 200,
            resize_dir: 'both',
            resize_maxWidth: 2000,
            toolbar: [
              {
                name: 'tooltip',
                items: ['Preview'],
              },
            ],
          }}
        />
      </>
    );
  };

  return (
    <Tooltip
      key={code}
      trigger="click"
      overlayClassName={styles['editor-tooltip']}
      {...others}
      title={renderRichEditor()}
    >
      {children}
    </Tooltip>
  );
};

export default Tips;
