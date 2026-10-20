/* EnterpriseTags - 企业标签
 * @Date: 2024-10-21 10:48:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import classNames from 'classnames';
import { Tag } from 'choerodon-ui';
import { forOwn, add, isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import { Tooltip, Icon, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import sesameIcon from '@/assets/memberExpansion/sesame-icon.svg';

import commonStyles from '@/routes/index.less';
import styles from './styles.less';

const Index = ({
  parentId = '',
  tagList = [],
  showHelp = false,
  tagClassName = '',
  labelObtainMethod = 'ZHIMA_LABEL',
}) => {
  const [maxNum, setMaxNum] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    calculateTagMaxNum();
  }, [parentId, tagClassName, labelObtainMethod, JSON.stringify(tagList)]);

  // 更多
  const handleShowMore = () => {
    setMaxNum(tagList.length);
    setShowMore(true);
  };

  // 收起
  const handleExpandLess = () => {
    calculateTagMaxNum();
    setShowMore(false);
  };

  // 计算标签的最大展示个数
  const calculateTagMaxNum = () => {
    // 父级元素宽度
    const parentWidth = document.getElementById(parentId)?.offsetWidth || 0;
    const tagsDom = document.getElementsByClassName(tagClassName);
    // tag宽度集合
    const tagsWidthArr = [];
    // tag总宽度
    let allTagsWidth = 0;
    // 最终展示的tag个数
    let newMaxNum = 0;
    forOwn(tagsDom, item => {
      tagsWidthArr.push(item.offsetWidth + 8); // 8为每个tag的外边距
    });
    tagsWidthArr.forEach((width, index) => {
      allTagsWidth = add(allTagsWidth, width);
      if (parentWidth * 2 > allTagsWidth) {
        newMaxNum = index + 1;
      }
    });
    setMaxNum(newMaxNum);
  };

  // 芝麻信用标签
  const isZhima = labelObtainMethod === 'ZHIMA_LABEL';
  // 展示的页签个数不等于总页签数时，展示页签数-1，防止”更多“展示不下
  const newTagList =
    maxNum !== tagList.length ? tagList.slice(0, maxNum - 1) : tagList.slice(0, maxNum);

  return !isEmpty(tagList) ? (
    <div className={styles['enterprise-tags-wrap']}>
      <div id={parentId} className={styles['tags-container']}>
        <div className={styles['assist-tag']}>
          {/* 辅助tag,用于计算tag的宽度，页面不展示 */}
          {tagList.map(n => (
            <Tag border={false} className={tagClassName}>
              {n.labelName}
            </Tag>
          ))}
        </div>
        {newTagList.map(n => (
          <Tooltip title={n.labelDefinition}>
            <Tag
              border={false}
              color={!isZhima && 'blue'}
              className={classNames(styles['enterprise-tags'], {
                [styles['sesame-tags']]: isZhima,
              })}
            >
              {n.labelCode && <img src={n.labelCode} alt="" />}
              {n.labelName}
            </Tag>
          </Tooltip>
        ))}
        {maxNum !== tagList.length && (
          <Button funcType="link" onClick={handleShowMore} className={styles['more-btn']}>
            <span>{intl.get('hzero.common.button.more').d('更多')}</span>
            <Icon type="expand_more" style={{ fontSize: 16, marginRight: 0 }} />
          </Button>
        )}
        {showMore && (
          <Button funcType="link" onClick={handleExpandLess} className={styles['more-btn']}>
            <span>{intl.get('hzero.common.button.up').d('收起')}</span>
            <Icon type="expand_less" style={{ fontSize: 16, marginRight: 0 }} />
          </Button>
        )}
      </div>
      {/* 芝麻信息标签显示芝麻信用log */}
      {isZhima && <img src={sesameIcon} alt="" key={parentId} className={styles['zhima-logo']} />}
      {isZhima && showHelp && (
        <Tooltip
          title={intl
            .get('sslm.common.view.enterpriseTags.help')
            .d('企业实力标由芝麻企业信用提供，将向合作的采购方公开展示')}
        >
          <Icon type="help" className={commonStyles['btn-help']} />
        </Tooltip>
      )}
    </div>
  ) : null;
};

export default Index;
