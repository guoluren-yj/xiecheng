import React, { memo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';

import styles from './index.less';

const [
  SLAVE_MASTER, // 从主
  LINK, // 关联
] = ['SLAVE_MASTER', 'LINK'];
interface IRelationTypeRender {
  associateType?: string;
}
function RelationTypeRender({ associateType }: IRelationTypeRender) {
  const getComponentTypeIcon = () => {
    let title = '';
    let className = '';
    if (associateType) {
      switch (associateType) {
        case SLAVE_MASTER:
          className = 'masterRelation';
          title = intl.get('hmde.bo.view.messages.masterRelation').d('从主');
          break;
        case LINK:
          className = 'link';
          title = intl.get('hmde.bo.view.messages.link').d('关联');
          break;
        default:
          break;
      }
    }
    return <div className={styles[className]}>{title}</div>;
  };
  return <div className={styles['relation-content']}>{getComponentTypeIcon()}</div>;
}
export default memo(RelationTypeRender);
