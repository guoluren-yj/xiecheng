/* eslint-disable react/no-danger */
import React, { useMemo, useEffect, useState } from 'react';

import intl from 'hzero-front/lib/utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

/**
 * 可以修改样式svg组件
 * @param path 通过required拿到的base64格式的svg对象
 * @param style style
 * @param className className
 * @returns svg VNode
 */
const SVGIcon = ({ path, className, style }) => {
  const [typeError, setTypeError] = useState(false);

  useEffect(() => {
    if (path.indexOf('base64') === -1) {
      notification.error({
        description: intl.get('ssrc.common.message.error.setBase64Params').d('请传递base64的图片'),
      });
      setTypeError(true);
    }
  }, []);

  const svgCode = useMemo(() => {
    const svgObj = window.atob(path.substring(path.indexOf(',') + 1));
    const obj = svgObj.substring(svgObj.indexOf('<svg'));
    const title = new RegExp(/<title>(.*?)title>/);
    const result = obj.replace(title, '');
    const desc = new RegExp(/<desc>(.*?)desc>/);
    const resultObj = result.replace(desc, '');
    return resultObj;
  }, [path]);

  const getClassName = useMemo(() => {
    return className || styles.svgContainer;
  }, [className]);

  return (
    !typeError && (
      <span style={style} className={getClassName} dangerouslySetInnerHTML={{ __html: svgCode }} />
    )
  );
};

export default formatterCollections({
  code: [['ssrc.common']],
})(SVGIcon);
