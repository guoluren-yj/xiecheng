import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isNull } from 'lodash';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';

// import ImgIcon from '@/utils/ImgIcon';

import { valueList } from '../enums';
import styles from './index.less';

const {
  MASTER,
  SLAVE_MASTER,
  LINK,
  MASTER_SLAVE,
  REVERSE_LINK,
  REL_LINK,
  REL_REVERSE_LINK,
  REL_MASTER_SLAVE,
  REL_SLAVE_MASTER,
} = valueList;
const Index = ({ propsItem }) => {
  const getTitle = (type) => {
    // eslint-disable-next-line no-unused-vars
    let iconName = '';
    let title = '';
    let thisClass = '';
    // const preTitle = `${intl.get('sdps.boComposition.advancedRelationship').d('高级关系')}-`;
    let relBusinessObjectName = propsItem?.relBusinessObjectName;
    // const relBusinessObjectAssociateName = propsItem?.relBusinessObjectAssociateName ?? '';
    switch (propsItem.relateType) {
      case MASTER:
        iconName = 'bocZhu.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.master').d('主');
        thisClass = 'zhu';
        break;
      case SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.slaveMaster').d('从主');
        thisClass = 'congZhu';
        break;
      case LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.link').d('关联');
        thisClass = 'guanLian';
        break;
      case MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.masterSlave').d('主从');
        thisClass = 'zhuCong';
        break;
      case REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.reverseLink').d('反向关联');
        thisClass = 'zhuCong';
        break;
      case REL_SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.slaveMaster').d('从主');
        thisClass = 'congZhu';
        relBusinessObjectName = `${relBusinessObjectName}`;
        break;
      case REL_LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.link').d('关联');
        thisClass = 'guanLian';
        relBusinessObjectName = `${relBusinessObjectName}`;
        break;
      case REL_MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.masterSlave').d('主从');
        thisClass = 'zhuCong';
        relBusinessObjectName = `${relBusinessObjectName}`;
        break;
      case REL_REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('sdps.boComposition.fieldInfo.relation.reverseLink').d('反向关联');
        thisClass = 'zhuCong';
        relBusinessObjectName = `${relBusinessObjectName}`;
        break;
      default:
        break;
    }
    if (type === 'imgIcon') {
      return (
        <>
          {/* <ImgIcon name={iconName} size={16} /> */}
          <Tooltip title={relBusinessObjectName}>
            <div className={styles['source-title']}>{relBusinessObjectName}</div>
          </Tooltip>
        </>
      );
    } else if (type === 'text') {
      return <span className={styles[thisClass]}>{title}</span>;
    }
  };

  const linkStr = `${propsItem?.dstColumn ?? ''}=${propsItem?.srcColumn ?? ''}`.toLowerCase();

  const lineHeightSum = propsItem && propsItem.dstColumn && propsItem.srcColumn ? 22 : 25;

  return (
    <div className={styles['model-source-tree-slot']}>
      <div className={styles['model-source-tree-slot-con']} style={{ alignItems: 'normal' }}>
        <div style={{ justifyContent: 'flex-start' }}>
          {/* <div style={{ display: 'inline-block', minWidth: '40px' }}>{getTitle('text')}</div> */}
          <span style={{ display: 'inline-block' }}>
            <div className={styles['title-wrapper']} style={{ lineHeight: `${lineHeightSum}px` }}>
              {getTitle('imgIcon')}
            </div>
            <div className={styles['relate-bo-code']} style={{ lineHeight: `${lineHeightSum}px` }}>
              {!isNull(propsItem?.dstTable) ? (
                <Tooltip title={propsItem?.dstTable ?? ''} placement="bottom">
                  <span className={styles['bo-code']}>{propsItem?.dstTable}</span>
                </Tooltip>
              ) : null}
            </div>
          </span>
        </div>
        {propsItem && propsItem.dstColumn && propsItem.srcColumn && (
          <div style={{ border: '0.5px dashed rgba(0,0,0,0.2)', margin: '5px 0' }} />
        )}
        {propsItem && propsItem.dstColumn && propsItem.srcColumn && (
          <div
            style={{
              justifyContent: 'flex-start',
              color: 'rgba(0,0,0,0.45)',
              overflow: 'hidden',
            }}
          >
            <Tooltip
              title={intl.get('sdps.boComposition.tooltip.tableLink').d('当前表字段=关联表字段')}
              placement="bottom"
            >
              <Icon type="link" />
            </Tooltip>
            &nbsp;
            <Tooltip title={linkStr} placement="bottom">
              {linkStr}
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
export default formatterCollections({ code: ['sdps.boComposition'] })(Index);
