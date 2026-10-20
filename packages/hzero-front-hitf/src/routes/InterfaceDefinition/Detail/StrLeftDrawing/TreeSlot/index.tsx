
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { Icon } from 'choerodon-ui';
import { Tooltip, Dropdown, Menu } from 'choerodon-ui/pro';
import { isNull } from 'lodash';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';
import { Action } from 'choerodon-ui/lib/trigger/enum';

import paramsIcon from '@/assets/paramsIcon.svg';

import { valueList } from '@/utils/enums';
import styles from './index.less';

interface IIndex {
  propsItem: any;
  openModal: Function,
  handleDelete: Function,
}

const {
  MAIN,
  DEPENDENCE,
  RELATION,
} = valueList;

const Index = ({ propsItem = {}, openModal, handleDelete }: IIndex) => {
  const { id } = propsItem;
  const getTitle = type => {
    let title = '';
    let thisClass = '';
    const paramHeaderName = propsItem?.paramHeaderName;
    switch (propsItem.relationType) {
      case MAIN:
        title = intl.get('hmde.boComposition.fieldInfo.relation.master').d('主');
        thisClass = 'zhu';
        break;
      case DEPENDENCE:
        title = intl.get('hmde.boComposition.fieldInfo.relation.masterSlave').d('主从');
        thisClass = 'zhuCong';
        break;
      case RELATION:
        title = intl.get('hmde.boComposition.fieldInfo.relation.link').d('关联');
        thisClass = 'guanLian';
        break;
      default:
        break;
    }
    if (type === 'imgIcon') {
      return (
        <>
          <Tooltip title={paramHeaderName}>
            <div className={styles['source-title']}>{paramHeaderName}</div>
          </Tooltip>
        </>
      );
    } else if (type === 'text') {
      return <span className={styles[thisClass]}>{title}</span>;
    }
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="rename"
        onClick={({ domEvent }) => openModal({ type: 'rename', domEvent, formValue: propsItem })}
      >
        <span>
          {intl.get('hzero.common.button.rename').d('重命名')}
        </span>
      </Menu.Item>
      <Menu.Item
        key="add"
        onClick={({ domEvent }) => openModal({ type: 'add', domEvent, idValue: id })}
      >
        <span>
          {intl.get('hitf.common.button.add.table').d('添加关系表')}
        </span>
      </Menu.Item>
      <Menu.Item
        key="delete"
        onClick={({ domEvent }) => handleDelete(domEvent, id)}
      >
        <span>
          {intl.get('hzero.common.btn.delete').d('删除')}
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles['model-source-tree-slot']}>
      <img
        alt=""
        src={paramsIcon}
        style={{
          margin: '0 0 0 8px',
          width: '20px',
        }}
      />
      <div className={styles['model-source-tree-slot-con']} style={{ alignItems: 'normal' }}>
        <div>
          <div className={styles['title-wrapper']}>
            {getTitle('imgIcon')}
            {getTitle('text')}
          </div>
        </div>
        <span className={styles['relate-bo-code']}>
          {!isNull(propsItem?.paramHeaderCode) ? (
            <span className={styles['bo-code']}>{propsItem?.paramHeaderCode}</span>
          ) : null}
        </span>
      </div>
      {/* 租户级参数维护反馈只读 */}
      <div className={styles['model-source-tree-slot-menu']}>
        <Dropdown overlay={menu} trigger={[Action.hover]}>
          <Icon type="more_vert" />
        </Dropdown>
      </div>
    </div>
  );
};
export default formatterCollections({ code: ['hmde.boComposition'] })(Index);
