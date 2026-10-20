/*
 * @filename:
 * @Date: 2020-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import ImgIcon from '@/utils/ImgIcon';

import styles from '../index.less';

interface IIndex {
  modelDataObj: model.LogicModelTreeVO;
}
const Index: FC<IIndex> = observer(({ modelDataObj }) => (
  <div className={styles['top-menu']}>
    <div>
      <a
        href="#"
        style={{
          display: 'flex',
        }}
      >
        <ImgIcon
          name="application-2@3x.png"
          size={20}
          style={{
            visibility: 'visible',
            verticalAlign: 'sub',
            marginTop: '3px',
            marginRight: '15px',
          }}
        />
        <span className={styles['top-menu-title']}>{modelDataObj.number}</span>
      </a>
    </div>
  </div>
));
export default Index;
