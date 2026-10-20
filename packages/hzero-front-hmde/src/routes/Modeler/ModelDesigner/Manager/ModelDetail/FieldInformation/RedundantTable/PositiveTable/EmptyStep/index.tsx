/*
 * 设计荣誉表空tab页
 * @Date: 2020-04-03 10:40:47
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import styles from '../index.less';

const index = ({ createRedundantTable }: { createRedundantTable: () => void }) => (
  <>
    <div style={{ textAlign: 'center', marginTop: '4%' }}>
      <div className={styles['redundant-empty-data']} />
      <h3 style={{ padding: '20px 0 10px 0', color: '#666666' }}>当前模型暂无相关的扩展表信息</h3>
      <div style={{ padding: '10px 0 20px 0' }}>
        您可以选择<span style={{ color: '#8080FF' }}>新建扩展表</span>快速创建扩展表及字段信息
      </div>
      <Button color={ButtonColor.blue} onClick={createRedundantTable}>
        快速创建扩展表
      </Button>
    </div>
  </>
);
export default index;
