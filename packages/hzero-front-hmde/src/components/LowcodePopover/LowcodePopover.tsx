import React, { CSSProperties, useEffect, useState } from 'react';
import { Popover } from 'choerodon-ui';
import { TooltipPlacement } from 'choerodon-ui/lib/tooltip/index.d';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';

interface IIndexProps {
  content?: string | React.ReactElement; // 自定义内容
  // title?: string | React.ReactElement; // 自定义标题
  styleObj?: CSSProperties; // 自定义内敛样式
  hidden?: boolean; // 控制隐藏图标
  name?: string; // 自定义图标名称
  type?: string; // popover类型 警告，备注，注意
  iconSize?: number | string; // 图标大小参数
  isLineWrap?: boolean; // 是否换行 默认不换行（...显示）
  // description?: string;
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';
  funcType?: 'flat' | 'raised' | undefined;
  placement?: TooltipPlacement | undefined;
  children: string | React.ReactElement;
}
const [warningIcon, remarksIcon, carefulIcon] = ['tip-yellow@3x.png', 'beizhu.svg', 'zhuyi.svg']; // 警告，备注，注意
const [warning, remarks, careful] = ['warning', 'remarks', 'careful']; // 警告，备注，注意
export default function Index(props: IIndexProps) {
  const {
    // title,
    content,
    styleObj = {},
    type = warning,
    name = '',
    hidden = false,
    iconSize = 16,
    isLineWrap = false,
    trigger = 'hover',
    placement = 'top',
    children,
  } = props;
  const [iconName, setIconName] = useState(name);
  useEffect(() => {
    switch (type) {
      case 'warning':
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

  // const _title = (
  //   <div className={styles['title-wrapper']}>
  //     <ImgIcon
  //       name={iconName}
  //       size={iconSize}
  //       style={{ margin: '0 12px' }}
  //       hidden={hidden}
  //     />
  //     <div className={styles['title-text']}>{description}</div>
  //   </div>
  // );

  const _content = (
    <div className={styles['content-wrapper']}>
      <div>
        <ImgIcon name={iconName} size={iconSize} style={{ margin: '0 12px' }} hidden={hidden} />
      </div>
      <div className={styles['content-text']}>{content}</div>
    </div>
  );
  return (
    <Popover
      overlayClassName={isLineWrap ? styles['wrap-popover-wrapper'] : styles['popover-wrapper']}
      overlayStyle={styleObj}
      content={_content}
      // title={title || _title}
      trigger={trigger}
      placement={placement}
    >
      {children}
    </Popover>
  );
}
