/**
 * 文本模式头
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Popover } from 'choerodon-ui';
import { Icon, Button } from 'choerodon-ui/pro';
import { debounce } from 'lodash';

import classnames from 'classnames';
import intl from 'utils/intl';
import styles from './index.less';

const getPopoverProps = (isEditMode) => {
  return !isEditMode
    ? {
        placement: 'right',
        className: styles.leftAnchor,
        iconType: 'baseline-arrow_right',
      }
    : {
        title: intl.get('spcm.workspace.view.title.expandTextCompare').d('展开文本对比'),
        textContent: intl
          .get('spcm.workspace.view.title.expandTextCompareInfo')
          .d('点击展开文本对比，用于对比两个版本的修改内容。'),
        placement: 'leftTop',
        className: '',
        iconType: 'baseline-arrow_left',
      };
};

// const bindScrollToTargetDom = (domId, scrollEvent) => {
//   // 绑定监听事件
//   const scrollContentDom = document.getElementById(domId);
//   if (scrollContentDom) {
//     scrollContentDom.addEventListener('scroll', scrollEvent);
//   }
//   return () => {
//     if (scrollContentDom) {
//       scrollContentDom.removeEventListener('scroll', scrollEvent);
//     }
//   };
// };

export default function PopoverCard(props) {
  const { isEditMode, onClickAnchor } = props;
  const [visible, setVisible] = useState(false);
  const popoverProps = getPopoverProps(isEditMode);
  const { title, textContent, placement, className, iconType } = popoverProps;

  // 根据滚动条滚动动态修改top值
  const handleScroll = debounce((e) => {
    if (document?.getElementById('fixedAnchor')) {
      // 滚动的高度
      const scrollTop = e.target?.scrollTop;
      // 去除菜单栏和头部导航高度
      document.getElementById('fixedAnchor').style.top = `calc(50vh - 136px +  ${scrollTop || 0}px)`;
    }
  }, 500);

  useEffect(() => {
    // 第一次进入，触发
    setVisible(true);
    // bindScrollToTargetDom('scrollContent', handleScroll); // bindScrollToTargetDom导致组件销毁的时候return后的滚动解除不生效。
    // 绑定监听事件
    const scrollContentDom = document.getElementById('scrollContent');
    if (scrollContentDom) {
      scrollContentDom.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContentDom) {
        // 解除监听事件
        scrollContentDom.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleClosePopover = () => {
    setVisible(false);
  };

  // 通知wps保存文件,会触发wps的跨域报错
  // const handlePostMessage = () => {
  //     return document.getElementById('leftEditIframe')?.contentWindow?.postMessage('saveDocument');
  // };

  const content = useMemo(
    () => (
      <>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>{textContent}</div>
        <div className={styles.btn}>
          <Button color="primary" onClick={handleClosePopover}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </>
    ),
    [title, textContent]
  );

  const handleClickAnchor = () => {
    if (!visible) {
      // handlePostMessage();
      onClickAnchor();
    }
  };

  return (
    <Popover
      content={content}
      placement={placement}
      visible={visible}
      overlayClassName={styles.popverCard}
      getPopupContainer={() => document.getElementById('fixedAnchor')}
    >
      <div
        id="fixedAnchor"
        className={classnames(className, styles.anchorIcon)}
        onClick={handleClickAnchor}
      >
        <Icon type={iconType} />
      </div>
    </Popover>
  );
}
