import React, { useEffect, useMemo, useRef } from 'react';

import notification from 'utils/notification';

const Preview = ({ reportType, resp }) => {
  const domRef = useRef();
  const globalWatermarkDiv = useMemo(() => document.querySelectorAll('.mask_mark'), []);
  
  useEffect(() => {
    if (reportType === 'EXCEL') {
      if (resp && typeof resp === 'string') {
        const iframeDom = document.createElement('iframe');
        iframeDom.src = resp;
        iframeDom.style = 'height: 100%;width: 100%;border: none;';
        domRef.current.appendChild(iframeDom);
      }
      return;
    }
    try {
      const fileName = 'preview.pdf';
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        window.navigator.msSaveBlob(resp, decodeURI(fileName));
      } else {
        // 创建新的URL并指向File对象或者Blob对象的地址
        const blobURL = window.URL.createObjectURL(resp);
        // window.open(blobURL);
        const iframeDom = document.createElement('iframe');
        iframeDom.src = blobURL;
        iframeDom.style = 'height: 100%;width: 100%;border: none;';
        domRef.current.appendChild(iframeDom);
        return () => {
          window.URL.revokeObjectURL(blobURL);
        };
      }
      return;
    } catch (e) {
      notification.error();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      let flag = true;
      if (globalWatermarkDiv && globalWatermarkDiv[0] && globalWatermarkDiv[0].style.opacity !== '0') {
        hideGlobalWatermarkOpactiy();
      }
    }, 100);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const hideGlobalWatermarkOpactiy = () => {
    if (globalWatermarkDiv && globalWatermarkDiv.length) {
      globalWatermarkDiv.forEach(el =>  el.style.opacity = '0');
    }
  };

  return (
    <div ref={domRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Preview;
