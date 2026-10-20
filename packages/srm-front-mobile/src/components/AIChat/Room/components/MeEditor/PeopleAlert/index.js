import React, { useRef, useEffect, useState } from 'react';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Icon } from 'choerodon-ui';

import styles from './index.less';

export default function PeopleAlert(props) {
  const { peopleTree = {}, onSelect = () => {}, filterContent = '', position = {} } = props;
  const { purchase = {}, suppliers = [], currentUser = {} } = peopleTree || {};
  const { members = [] } = purchase || {};

  const [typeList, setTypeList] = useState([]);
  const [companyList, setCompanyList] = useState([]); // 可选公司列表
  const [userList, setUserList] = useState([]);

  const [hoverType, setHoverType] = useState(null);
  const [hoverCompany, setHoverCompany] = useState(null);
  const [hoverUser, setHoverUser] = useState(null);

  const cacheRef = useRef({
    allCompanys: [],
    allUsers: [],
  });

  useEffect(() => {
    cacheRef.current.allCompanys = [];
    cacheRef.current.allUsers = [];
  }, []);

  useEffect(() => {
    const selfUserId = currentUser?.userId ?? '';
    const dataArr =
      members && members.length ? members.filter((item) => item.userId !== selfUserId) : [];
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
  }, [peopleTree, filterContent]);

  useEffect(() => {
    formatAllData(peopleTree); // 分别存储所有公司用户
  }, [peopleTree]);

  const formatAllData = (treeData) => {
    cacheRef.current.allCompanys = [];
    cacheRef.current.allUsers = [];

    if (treeData?.purchase) {
      cacheRef.current.allCompanys.push({ ...treeData.purchase });
      if (treeData.purchase?.members?.length) {
        cacheRef.current.allUsers.push(...treeData.purchase?.members);
      }
    }

    if (treeData?.suppliers?.length) {
      treeData.suppliers.forEach((item) => {
        cacheRef.current.allCompanys.push({ ...item });
        if (item?.members?.length) {
          cacheRef.current.allUsers.push(...item?.members);
        }
      });
    }
  };

  /**
   * 选择或去选人员
   */
  const handleChangeUser = (userId, companyId) => {
    const { allCompanys, allUsers } = cacheRef.current;
    let obj = null;
    if (userId === 'all' && companyId) {
      if (allCompanys.length) {
        allCompanys.forEach((item) => {
          if (item.companyId === companyId) {
            obj = { ...item };
          }
        });
      }
    } else if (userId && allUsers.length) {
      allUsers.forEach((item) => {
        if (item.userId === userId) {
          obj = { ...item };
        }
      });
    }

    onSelect(obj);
  };

  /**
   * 选择公司
   * @param {*} companyId
   */
  const handleChangeCompany = (companyId) => {
    const { allCompanys } = cacheRef.current;
    let obj = null;
    if (allCompanys.length && companyId) {
      allCompanys.forEach((item) => {
        if (item.companyId === companyId) {
          obj = { ...item };
        }
      });
    }

    onSelect(obj);
  };

  const handleSelectType = (id, type) => {
    if (type === 'hover') {
      setHoverType(id);
    }

    const obj = {
      userId: 'all',
      hitType: 'ALL',
      treeName: intl.get('smbl.chat.model.sendTo.allUser').d('所有人'),
      userNameSuffix: intl.get('smbl.chat.view.title.selectedAll').d('全选'),
    };
    const companyObj = members.length ? members[0] : {};

    const list = [
      {
        ...obj,
        companyId: companyObj?.companyId ?? '',
      },
      ...(members || []),
    ];

    switch (id) {
      case 'all':
        setCompanyList([]);
        setUserList([]);
        if (type === 'select') {
          onSelect({ ...obj });
        }
        break;
      case 'purchase':
        setCompanyList([]);
        setUserList(list);
        break;
      case 'supplier':
        setCompanyList(suppliers || []);
        setUserList([]);
        break;
      default:
        setCompanyList([]);
        setUserList([]);
    }
  };

  const handleSelectCompany = (companyId, type) => {
    const { allCompanys } = cacheRef.current;
    if (type === 'hover') {
      setHoverCompany(companyId);
    }

    let list = [];

    if (suppliers.length) {
      suppliers.forEach((item) => {
        if (item.companyId === companyId) {
          list = [
            {
              userId: 'all',
              userNameSuffix: intl.get('smbl.chat.view.title.selectedAll').d('全选'),
              companyId,
            },
            ...(item?.members ?? []),
          ];
        }
      });
    }

    if (type === 'select') {
      let obj = null;
      if (companyId) {
        if (allCompanys.length) {
          allCompanys.forEach((item) => {
            if (item.companyId === companyId) {
              obj = { ...item };
            }
          });
        }
      }

      onSelect(obj);
    }
    setUserList(list);
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
        >
          <div>{item.title}</div>
          {item.id !== 'all' ? <Icon type="navigate_next" /> : null}
        </div>
      );
    });
  };

  // 绘制公司列表
  const drawCompanyList = (list = []) => {
    return (list || []).map((item) => {
      const classes = classnames(styles['select-item-style'], {
        [styles['select-item-active']]: hoverCompany === item.companyId,
      });

      return (
        <div
          key={item.companyId}
          className={classes}
          onClick={() => handleSelectCompany(item.companyId, 'select')}
          onMouseEnter={() => handleSelectCompany(item.companyId, 'hover')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '80px',
                marginLeft: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.displayName}
            </div>
          </div>
          <Icon type="navigate_next" />
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
    const selfUserId = currentUser?.userId ?? '';

    const dataArr = list.length ? list.filter((item) => item.userId !== selfUserId) : [];

    const queryList =
      dataArr.length && filterContent
        ? dataArr.filter((user) =>
            (user.userNameSuffix || user.displayName)
              .toLowerCase()
              .includes(filterContent.toLowerCase())
          )
        : dataArr;

    if (!(queryList && queryList.length)) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            marginLeft: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '8px 12px',
          }}
        >
          {intl.get('smbl.chat.view.title.noData').d('暂无数据')}
        </div>
      );
    }

    return queryList.map((item) => {
      const classes = classnames(styles['select-item-style'], {
        [styles['select-item-active']]: hoverUser === item.userId,
      });

      return (
        <div
          key={item.userId}
          className={classes}
          onMouseEnter={() => setHoverUser(item.userId)}
          onMouseLeave={() => setHoverUser(null)}
          onClick={() => handleChangeUser(item.userId, item.companyId)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
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

  const filterListDrawItemList = () => {
    const { allCompanys, allUsers } = cacheRef.current;
    const filterCompany = allCompanys.length
      ? allCompanys.filter((user) =>
          (user.userNameSuffix || user.displayName)
            .toLowerCase()
            .includes(filterContent.toLowerCase())
        )
      : [];

    const filterUsers = allUsers.length
      ? allUsers.filter((user) =>
          (user.userNameSuffix || user.displayName)
            .toLowerCase()
            .includes(filterContent.toLowerCase())
        )
      : [];

    return (
      <>
        {filterCompany.length ? (
          <div>
            <div style={{ color: '#C9CDD4', padding: '8px 12px' }}>
              {intl.get('smbl.chat.view.title.tenantName').d('租户')}
            </div>
            {filterCompany.map((item) => {
              const classes = classnames(styles['select-item-style'], {
                [styles['select-item-active']]: hoverCompany === item.setHoverCompany,
              });
              return (
                <div
                  onMouseEnter={() => setHoverCompany(item.setHoverCompany)}
                  onMouseLeave={() => setHoverCompany(null)}
                  className={classes}
                  key={item.companyId}
                  style={{ width: '120px' }}
                  onClick={() => handleChangeCompany(item.companyId)}
                >
                  {item.userNameSuffix || item.displayName}
                </div>
              );
            })}
          </div>
        ) : null}
        {filterUsers.length ? (
          <div>
            <div style={{ color: '#C9CDD4', padding: '8px 12px' }}>
              {intl.get('smbl.chat.view.title.userList').d('用户')}
            </div>
            {filterUsers.map((item) => {
              const classes = classnames(styles['select-item-style'], {
                [styles['select-item-active']]: hoverUser === item.userId,
              });
              return (
                <div
                  onMouseEnter={() => setHoverUser(item.userId)}
                  onMouseLeave={() => setHoverUser(null)}
                  onClick={() => handleChangeUser(item.userId, item.companyId)}
                  style={{ width: '120px' }}
                  className={classes}
                  key={item.userId}
                >
                  {item.userNameSuffix || item.displayName}
                </div>
              );
            })}
          </div>
        ) : null}

        {!filterCompany.length && !filterUsers.length ? (
          <div className={styles['select-item-style']}>
            {intl.get('smbl.chat.view.title.noData').d('暂无数据')}
          </div>
        ) : null}
      </>
    );
  };

  const getContainerTextWidth = () => {
    const node = document.getElementById('smbl-me-editor-textarea-container');
    const childs = node ? node.childNodes : [];
    const allChilds = [].slice.call(childs);

    let btnSum = 0;

    if (allChilds.length) {
      allChilds.forEach((element) => {
        // 移除现有的所有 button
        if (element.nodeName === 'BUTTON') {
          btnSum += element?.offsetWidth ?? 5;
        }
        if (element.nodeName === '#text') {
          const widthNum = element.offsetWidth ? element.offsetWidth : element.length * 9;
          btnSum += widthNum;
        }
      });
    }

    return btnSum + 25;
  };

  const { x = 0, y = 0, right = 0, bottom = 0 } = position;

  return (
    <>
      {filterContent ? (
        <div
          className={styles['select-tree-row']}
          style={{
            position: 'absolute',
            left:
              isNaN(right) || isNaN(x)
                ? getContainerTextWidth() || '100px'
                : right < -320
                ? `${Number(x) + 20}px`
                : `${Number(x) - Number(right + 320) - 5}px`,
            top:
              isNaN(bottom) || isNaN(y)
                ? '50px'
                : bottom < -30
                ? `${Number(y) + 50}px`
                : `${Number(y) - Number(bottom + 30) - 5}px`,
            overflow: 'auto',
          }}
        >
          {filterListDrawItemList()}
        </div>
      ) : (
        <div
          className={styles['select-tree-row']}
          style={{
            position: 'absolute',
            left:
              isNaN(right) || isNaN(x)
                ? getContainerTextWidth() || '100px'
                : right < -320
                ? `${Number(x) + 20}px`
                : `${Number(x) - Number(right + 320) - 5}px`,
            top:
              isNaN(bottom) || isNaN(y)
                ? '50px'
                : bottom < -30
                ? `${Number(y) + 50}px`
                : `${Number(y) - Number(bottom + 30) - 5}px`,
          }}
        >
          <div className={styles['select-type-col']}>{drawTypeList()}</div>
          <div
            className={styles['select-company-col']}
            style={{ display: companyList.length ? 'block' : 'none' }}
          >
            {drawCompanyList(companyList)}
          </div>
          <div
            className={styles['select-user-col']}
            style={{ display: userList.length ? 'block' : 'none' }}
          >
            {drawUserList(userList)}
          </div>
        </div>
      )}
    </>
  );
}
