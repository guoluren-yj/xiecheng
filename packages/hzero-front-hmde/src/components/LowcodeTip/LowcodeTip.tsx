import React, { CSSProperties, useEffect, useState } from 'react';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';

interface IIndexProps {
  text?: string; // 展示文本
  styleObj?: CSSProperties; // 自定义内敛样式
  hidden?: boolean; // 控制隐藏图标
  name?: string; // 自定义图标名称
  type?: string; // alert类型 警告，备注，注意
  iconSize?: number | string; // 图标大小参数
  isLineWrap?: boolean; // 是否换行 默认不换行（...显示）
}
const [warningIcon, remarksIcon, carefulIcon] = ['tip-yellow@3x.png', 'beizhu.svg', 'zhuyi.svg']; // 警告，备注，注意
const [warning, remarks, careful] = ['warning', 'remarks', 'careful']; // 警告，备注，注意
export default function index(props: IIndexProps) {
  const {
    text,
    styleObj = {},
    type = warning,
    name = '',
    hidden = false,
    iconSize = null,
    isLineWrap = false,
  } = props;
  const [iconName, setIconName] = useState(name);
  useEffect(() => {
    switch (type) {
      case warning:
        setIconName(name || warningIcon);
        break;
      case remarks:
        setIconName(name || remarksIcon);
        break;
      case careful:
        setIconName(name || carefulIcon);
        break;
      default:
        break;
    }
  }, [type, name]);
  return (
    <div
      className={isLineWrap ? styles['wrap-top-warning'] : styles['top-warning']}
      style={styleObj}
    >
      <div>
        <ImgIcon
          name={iconName}
          size={iconSize || 16}
          style={{ margin: '0 12px' }}
          hidden={hidden}
        />
      </div>
      <span className={styles['top-warning-text']}>{text}</span>
    </div>
  );
}
