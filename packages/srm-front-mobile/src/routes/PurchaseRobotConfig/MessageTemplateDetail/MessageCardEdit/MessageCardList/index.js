import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import { Dropdown, Menu, Icon } from 'choerodon-ui/pro';

import styles from './index.less';

function MessageCardList(props) {
  const {
    activeId,
    readOnly = false,
    editFormDataSet,
    editCard = () => {},
    deleteCard = () => {},
    changeItem = () => {},
  } = props;
  const data = editFormDataSet.toData();

  // 列表编辑下拉菜单
  const listEditMenu = (
    <Menu style={{ width: 110 }}>
      <Menu.Item onClick={() => editCard(true)}>
        {intl.get('smbl.purchaseRobotConfig.button.edit').d('编辑')}
      </Menu.Item>
      <Menu.Item onClick={() => deleteCard()}>
        {intl.get('smbl.purchaseRobotConfig.button.delete').d('删除')}
      </Menu.Item>
    </Menu>
  );

  return data.map((list, index) => (
    <div
      className={
        list.convertId === activeId
          ? `${styles['card-list-item']} ${styles.active}`
          : styles['card-list-item']
      }
      key={list.convertId}
      onClick={() => changeItem(list, index)}
    >
      <div className="card-list-item-title">
        <span className="card-list-item-name">{list.cardName || '-'}</span>
        {!readOnly && (
          <Dropdown overlay={listEditMenu} trigger={['click']}>
            <Icon type="more_horiz" />
          </Dropdown>
        )}
      </div>
      <div className="card-list-item-desc">{list.remark || '-'}</div>
    </div>
  ));
}

export default formatterCollections({
  code: ['smbl.purchaseRobotConfig'],
})(observer(MessageCardList));
