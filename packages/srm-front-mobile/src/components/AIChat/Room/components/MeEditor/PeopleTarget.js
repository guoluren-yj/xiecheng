import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui';
import { CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import classnames from 'classnames';
import _ from 'lodash';

import styles from './index.less';

export default function PeopleTarget(props) {
  const { peopleTree = {}, onSelect = () => {}, selected = [] } = props;
  const { purchase = {}, suppliers = [], currentUser = {} } = peopleTree || {};
  const { members = [] } = purchase || {};
  const cacheRef = useRef({
    allCompanys: [],
    allUsers: [],
    allItem: {
      userId: 'all',
      hitType: 'ALL',
      treeName: intl.get('smbl.chat.model.sendTo.allUser').d('所有人'),
      userNameSuffix: intl.get('smbl.chat.view.title.selectedAll').d('全选'),
    },
  });

  const [typeList, setTypeList] = useState([]);
  const [hoverType, setHoverType] = useState(null);
  const [hoverCompany, setHoverCompany] = useState(null);
  const [hoverUser, setHoverUser] = useState(null);

  // 入参selectList转组件内部selectList
  const translateToLocalData = () => {
    const { allCompanys, allUsers } = cacheRef.current;
    const all = selected.find((select) => select.userId === 'all');
    if (all) {
      return [...allCompanys, ...allUsers];
    }
    const selectedList = [];
    const selfUserId = currentUser?.userId;
    selected.forEach((select) => {
      selectedList.push(select);
      if (select.hitType === 'TENANT') {
        const list = select.members?.filter((member) => member.userId !== selfUserId) || [];
        selectedList.push(...list);
      }
    });
    return selectedList;
  };

  // 组件内部selectList转入参selectList
  const translateToSelecedData = (localSelected = []) => {
    const { allCompanys } = cacheRef.current;
    const selectedList = [];
    const companyMap = {};
    const selfUserId = currentUser?.userId;
    localSelected.forEach((select) => {
      if (select.hitType === 'USER') {
        if (!companyMap[select.companyId]) {
          companyMap[select.companyId] = { count: 1, list: [select] };
        } else {
          companyMap[select.companyId].count++;
          companyMap[select.companyId].list.push(select);
        }
      }
    });
    Object.keys(companyMap).forEach((key) => {
      const companyData = allCompanys.find((company) => company.companyId === key);
      if (!companyData) return;
      const list = companyData.members?.filter((member) => member.userId !== selfUserId) || [];
      if (list.length === companyMap[key].count) {
        selectedList.push(companyData);
      } else {
        selectedList.push(...companyMap[key].list);
      }
    });
    return selectedList;
  };

  const { selectedCompany, selectedUser, localSelected } = useMemo(() => {
    const _selectedCompany = []; // 当前已选择的公司
    const _selectedUser = []; // 当前已选择的人
    const _selected = translateToLocalData(); // 组件内已经选择列表
    _selected.forEach((select) => {
      if (select.hitType === 'TENANT') {
        _selectedCompany.push(select.userId);
      } else if (select.hitType === 'USER') {
        _selectedUser.push(select.userId);
      }
    });
    return {
      selectedCompany: _selectedCompany,
      selectedUser: _selectedUser,
      localSelected: _selected,
    };
  }, [peopleTree, selected]);

  const { userList, companyList } = useMemo(() => {
    const { allCompanys, allUsers, allItem } = cacheRef.current;
    let _companyList = []; // 可选择公司列表
    let _userList = []; // 可选择人列列表
    if (hoverType === 'purchase') {
      _userList = allUsers.filter((user) => user.belongType === 'purchase');
    } else if (hoverType === 'supplier') {
      const hoverCompanyData = allCompanys.find((company) => company.companyId === hoverCompany);
      _companyList = allCompanys.filter((company) => company.belongType === 'supplier');
      _userList = allUsers.filter((user) => user.companyId === hoverCompanyData?.companyId);
    }
    if (_userList.length) {
      _userList.unshift(allItem);
    }
    return {
      userList: _userList,
      companyList: _companyList,
    };
  }, [peopleTree, hoverType, hoverCompany]);

  useEffect(() => {
    formatAllData();
    initTypeList();
  }, [peopleTree]);

  // 处理房间信息
  const formatAllData = () => {
    const selfUserId = currentUser?.userId;
    const allCompanys = [];
    const allUsers = [];
    if (peopleTree?.purchase) {
      allCompanys.push({ ...peopleTree.purchase });
      if (peopleTree.purchase?.members?.length) {
        allUsers.push(
          ...peopleTree.purchase.members.filter((member) => member.userId !== selfUserId)
        );
      }
    }
    if (peopleTree?.suppliers?.length) {
      peopleTree.suppliers.forEach((item) => {
        allCompanys.push({ ...item });
        if (item?.members?.length) {
          allUsers.push(...item.members.filter((member) => member.userId !== selfUserId));
        }
      });
    }
    cacheRef.current.allCompanys = allCompanys;
    cacheRef.current.allUsers = allUsers;
  };

  // 初始化选择项
  const initTypeList = () => {
    const selfUserId = currentUser?.userId ?? '';
    const dataArr = members?.length ? members.filter((item) => item.userId !== selfUserId) : [];
    const list = [
      {
        id: 'all',
        title: intl.get('smbl.chat.model.sendTo.allUser').d('所有人'),
      },
    ];
    if (dataArr?.length) {
      list.push({
        id: 'purchase',
        title: intl.get('smbl.chat.view.title.purchase').d('采购方'),
      });
    }
    if (suppliers?.length) {
      list.push({
        id: 'supplier',
        title: intl.get('smbl.chat.view.title.supplier').d('供应商'),
      });
    }
    setTypeList(list);
  };

  const handleSelectType = (id, type) => {
    const { allItem } = cacheRef.current;
    if (type === 'hover') {
      return setHoverType(id);
    }
    if (id === 'all') {
      onSelect([allItem]);
    }
  };

  const handleSelectCompany = (companyId, type) => {
    if (type === 'hover') {
      return setHoverCompany(companyId);
    }
  };

  const handleChangeCompany = (value, company) => {
    let _localSelected = localSelected.slice();
    if (value) {
      _localSelected.push(...(company.members || []), company);
    } else {
      _localSelected = _localSelected.filter((select) => select.companyId !== company.companyId);
    }
    _localSelected = _.uniqBy(_localSelected, 'id');
    onSelect(translateToSelecedData(_localSelected));
  };

  const handleChangeUser = (value, user) => {
    let _localSelected = localSelected.slice();
    if (value) {
      if (user.userId === 'all') {
        const list = userList.filter((item) => item.userId !== 'all');
        _localSelected = _.uniqBy([..._localSelected, ...list], 'id');
      } else {
        _localSelected.push(user);
      }
    } else if (user.userId === 'all') {
      _localSelected = _localSelected.filter(
        (select) => !userList.some((item) => item.userId === select.userId)
      );
    } else {
      _localSelected = _localSelected.filter((select) => select.userId !== user.userId);
    }
    onSelect(translateToSelecedData(_localSelected));
  };

  // 获取全选状态
  const getSelectedAllStatus = (children = []) => {
    const selectList = []; // 人员列表是否在选中列表内
    const originList = [...children]; // 当前选项的所有人员列表

    if (originList.length) {
      originList.forEach((item) => {
        if (selectedUser.length && selectedUser.includes(item.userId)) {
          // 已选中
          selectList.push(item.userId);
        }
      });
    }

    const indeterminate =
      originList.length && selectList.length && selectList.length !== originList.length;
    const checkedAll =
      originList.length && selectList.length && selectList.length === originList.length;

    return {
      indeterminate,
      checkedAll,
    };
  };

  // 清空
  const handleClearSelected = () => {
    setHoverType('');
    setHoverCompany('');
    setHoverUser('');
    onSelect([]);
  };

  /**
   * 绘制第一列类型列表
   * @returns
   */
  const drawTypeList = () => {
    return (typeList || []).map((item) => {
      const classes = classnames(styles['select-item-style'], {
        [styles['select-item-active']]: hoverType === item.id,
      });

      return (
        <div
          key={item.id}
          className={classes}
          onClick={() => handleSelectType(item.id, 'select')}
          onMouseEnter={() => handleSelectType(item.id, 'hover')}
          // onMouseLeave={() => handleSelectType(null, 'hover')}
        >
          <div>{item.title}</div>
          {item.id !== 'all' ? <Icon type="navigate_before" /> : null}
        </div>
      );
    });
  };

  // 绘制公司列表
  const drawCompanyList = (list = []) => {
    return (list || []).map((company) => {
      const classes = classnames(styles['select-item-style'], {
        [styles['select-item-active']]: hoverCompany === company.companyId,
      });

      const { indeterminate = false, checkedAll = false } = getSelectedAllStatus(company.members);

      return (
        <div
          key={company.companyId}
          className={classes}
          onClick={() => handleSelectCompany(company.companyId, 'select')}
          onMouseEnter={() => handleSelectCompany(company.companyId, 'hover')}
          // onMouseLeave={() => handleSelectCompany(null, 'hover')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckBox
              indeterminate={indeterminate}
              checked={checkedAll}
              onChange={(e) => handleChangeCompany(e, company)}
            />
            <div
              style={{
                width: '114px',
                marginLeft: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {company.displayName}
            </div>
          </div>
          <Icon type="navigate_before" />
        </div>
      );
    });
  };

  /**
   * 绘制人员列表
   * @param {*} list
   * @returns
   */
  const drawUserList = (list = []) => {
    const children = userList.filter((item) => item.userId !== 'all') || []; // 当前选项的所有人员列表
    const { indeterminate = false, checkedAll = false } = getSelectedAllStatus(children);
    const selfUserId = currentUser?.userId ?? '';

    const dataArr = list.length ? list.filter((item) => item.userId !== selfUserId) : [];

    return (dataArr || []).map((item) => {
      const classes = classnames(styles['select-item-style'], {
        [styles['select-item-active']]: hoverUser === item.userId,
      });

      return (
        <div
          key={item.userId}
          className={classes}
          onMouseEnter={() => setHoverUser(item.userId)}
          onMouseLeave={() => setHoverUser(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckBox
              indeterminate={item.userId === 'all' ? indeterminate : false}
              checked={item.userId === 'all' ? checkedAll : selectedUser.includes(item.userId)}
              onChange={(e) => handleChangeUser(e, item)}
            />
            <div
              style={{
                width: '80px',
                marginLeft: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: item.userId === 'all' ? '#868D9C' : '#101319',
              }}
            >
              {item.userNameSuffix || item.displayName}
            </div>
          </div>
        </div>
      );
    });
  };

  const getSelectCount = () => {
    const { allCompanys, allUsers } = cacheRef.current;
    const list = []; // 要发送的列表

    if (selectedCompany.length) {
      allCompanys.forEach((item) => {
        if (selectedCompany.includes(item.companyId)) {
          list.push(item);
        }
      });
    }

    if (selectedUser.length) {
      allUsers.forEach((item) => {
        // 存在公司 不存对应公司下的用户
        if (selectedUser.includes(item.userId) && !selectedCompany.includes(item.companyId)) {
          list.push(item);
        }
      });
    }

    return list.length;
  };

  return (
    <div className={styles['people-target-panel']}>
      <div className={styles['select-tree-row']}>
        <div
          className={styles['select-user-col']}
          style={{ display: userList.length ? 'block' : 'none' }}
        >
          {drawUserList(userList)}
        </div>
        <div
          className={styles['select-company-col']}
          style={{ display: companyList.length ? 'block' : 'none' }}
        >
          {drawCompanyList(companyList)}
        </div>
        <div className={styles['select-type-col']}>{drawTypeList()}</div>
      </div>
      <div className={styles['select-count-row']}>
        <div style={{ display: 'flex' }}>
          <div style={{ color: '#868D9C' }}>
            {intl.get('smbl.chat.view.title.hasSelected').d('已选')}
          </div>
          <span style={{ color: '#101319', margin: '0 4px' }}>{getSelectCount()}</span>
          <div style={{ color: '#868D9C' }}>
            {intl.get('smbl.chat.view.title.selectItem').d('项')}
          </div>
        </div>
        <a onClick={handleClearSelected}>{intl.get('hzero.common.button.clear').d('清空')}</a>
      </div>
    </div>
  );
}
