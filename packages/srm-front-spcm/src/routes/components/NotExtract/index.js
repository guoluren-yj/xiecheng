/*
 * @Description: 未提取出智能数据
 * @Date: 2025-01-24 11:22:12
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Card } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { ReactComponent as IllustrateNoneSmall } from '@/assets/Illustrate_none_small.svg';

import styles from './index.less';

const NotExtract = ({ onNewLine, title }) => {
  return (
    <Card bordered={false} className={styles['not-extract']}>
      <IllustrateNoneSmall />
      <p>
        {intl
          .get('spcm.common.msg.notExtract', {
            name: title,
          })
          .d(`未提取出${title}，请手动添加`)}
      </p>
      <Button
        style={{ width: 80 }}
        onClick={onNewLine}
        icon="playlist_add"
        funcType="link"
        color="primary"
        block
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>
    </Card>
  );
};

export default NotExtract;
