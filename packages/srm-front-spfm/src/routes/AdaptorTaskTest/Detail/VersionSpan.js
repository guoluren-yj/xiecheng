/**
 * VersionSpan.js
 * 版本显示
 * @date: 2020-03-30
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import './versionSpan.less';

export default function VersionSpan(props = {}) {
  return (
    <div className="version-span">
      <span className="version-span-desc">{props.description}</span>
      <span className="version-span-value" style={{ background: props.bgColor || '#fff' }}>
        {props.value}
      </span>
    </div>
  );
}
