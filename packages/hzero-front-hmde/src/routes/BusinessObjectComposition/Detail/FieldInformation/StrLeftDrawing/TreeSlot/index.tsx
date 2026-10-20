/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import React, { useContext, useState } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Text, Icon } from 'choerodon-ui';
import { isNull } from 'lodash';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';

import ImgIcon from '@/utils/ImgIcon';

import { valueList } from '../../enums';
import { Store } from '../../index';
import styles from './index.less';

interface IIndex {
  propsItem: boModel.combine.IBusinessObject;
}
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
const Index = ({ propsItem }: IIndex) => {
  const { history } = useContext(Store);
  const [showJumObj, setShowJumpObj] = useState<boModel.combine.IBusinessObject>();
  const getTitle = type => {
    let iconName = '';
    let title = '';
    let thisClass = '';
    const preTitle = `${intl.get('hmde.boComposition.advancedRelationship').d('高级关系')}-`;
    let relBusinessObjectName = propsItem?.relBusinessObjectName;
    const relBusinessObjectAssociateName = propsItem?.relBusinessObjectAssociateName;
    switch (propsItem.relateType) {
      case MASTER:
        iconName = 'bocZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.master').d('主');
        thisClass = 'zhu';
        break;
      case SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.slaveMaster').d('从主');
        thisClass = 'congZhu';
        break;
      case LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.link').d('关联');
        thisClass = 'guanLian';
        break;
      case MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.masterSlave').d('主从');
        thisClass = 'zhuCong';
        break;
      case REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.reverseLink').d('反向关联');
        thisClass = 'zhuCong';
        break;
      case REL_SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.slaveMaster').d('从主');
        thisClass = 'congZhu';
        relBusinessObjectName = `${preTitle}${relBusinessObjectAssociateName}`;
        break;
      case REL_LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.link').d('关联');
        thisClass = 'guanLian';
        relBusinessObjectName = `${preTitle}${relBusinessObjectAssociateName}`;
        break;
      case REL_MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.masterSlave').d('主从');
        thisClass = 'zhuCong';
        relBusinessObjectName = `${preTitle}${relBusinessObjectAssociateName}`;
        break;
      case REL_REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.reverseLink').d('反向关联');
        thisClass = 'zhuCong';
        relBusinessObjectName = `${preTitle}${relBusinessObjectAssociateName}`;
        break;
      default:
        // iconName = 'bocZhu.svg';
        // title = intl.get('hmde.boComposition.fieldInfo.relation.master').d('主');
        // thisClass = 'zhu';
        break;
    }
    if (type === 'imgIcon') {
      return (
        <>
          <ImgIcon name={iconName} size={16} />
          <Tooltip title={relBusinessObjectName}>
            <div className={styles['source-title']}>{relBusinessObjectName}</div>
          </Tooltip>
        </>
      );
    } else if (type === 'text') {
      return <span className={styles[thisClass]}>{title}</span>;
    }
  };
  return (
    <div
      className={styles['model-source-tree-slot']}
      onMouseEnter={() => setShowJumpObj(propsItem)}
      onMouseLeave={() => setShowJumpObj(undefined)}
    >
      <div className={styles['model-source-tree-slot-con']} style={{ alignItems: 'normal' }}>
        <div>
          <div className={styles['title-wrapper']}>
            {getTitle('imgIcon')}
            {/* <div className={styles['source-title']}>{propsItem?.relBusinessObjectName}</div> */}
          </div>
          {showJumObj?.businessObjectId === propsItem?.businessObjectId ? (
            <a
              className={styles['link-to-bo']}
              href="###"
              onClick={e => {
                e.stopPropagation();
                history.push({
                  pathname: `/hmde/business-object/detail/${propsItem?.relBusinessObjectId}`,
                  state: {
                    originKey: 'fieldList',
                    relBusinessObjectId: propsItem?.relBusinessObjectId,
                  },
                });
              }}
            >
              <Text style={{ maxWidth: '48px' }}>{intl.get('hmde.boComposition.view.message.header.businessObject').d('业务对象')}</Text>
              <Icon type="navigate_next" style={{ fontSize: '14px' }} />
            </a>
          ) : null}
        </div>
        <span className={styles['relate-bo-code']}>
          <Text>{getTitle('text')}</Text>
          {!isNull(propsItem?.relateBusinessObjectCode) ? (
            <Text className={styles['bo-code']}>{propsItem?.relateBusinessObjectCode}</Text>
          ) : null}
        </span>
      </div>
    </div>
  );
};
export default formatterCollections({ code: ['hmde.boComposition'] })(Index);
