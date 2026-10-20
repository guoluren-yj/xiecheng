import React, { useRef, useState, useEffect } from 'react';

export default function HtmlView(props) {
  const { _html, ...iframeProps } = props;
  const iframeRef = useRef();
  const [injectCss, setInjectCss] = useState('');
  const [iframeHeight, setIframeHeight] = useState(100);
  const myCss = 'img{max-width:100%;height:auto;}';
  useEffect(() => {
    const cssurl = _html?.match(/cssurl='(\S*)'>/)?.[1];
    if (cssurl) {
      fetch(`${window.location.protocol}${cssurl}`)
        .then((res) => res.text())
        .then((res) => setInjectCss(res));
    }
    setTimeout(handleChangeIframeHeight, [100]);
  }, [_html, iframeRef.current]);

  function handleChangeIframeHeight() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const iframeWin = iframe?.contentWindow || iframe?.contentDocument?.parentWindow;
    const contentHeight =
      iframeWin?.document?.documentElement?.scrollHeight || iframeWin?.document?.body?.scrollHeight;
    setIframeHeight(contentHeight + 16);
  }

  return (
    <iframe
      ref={iframeRef}
      title="view"
      width="100%"
      frameBorder="none"
      {...iframeProps}
      style={{ border: 'none', height: iframeHeight }}
      onLoad={handleChangeIframeHeight}
      srcDoc={`<style>${myCss}${injectCss || ''}</style>${_html}`}
    />
  );
}
