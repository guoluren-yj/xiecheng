import React, { useMemo, useState } from 'react';
import { DataSet, Row, Col, Spin, Select, TextField } from 'choerodon-ui/pro';
import { Icon, Badge, notification, Menu, Popover } from 'choerodon-ui';
import MyIcon from '@/routes/components/MyIcon';
import intl from 'hzero-front/lib/utils/intl';
import { docMenuIconMap, docImgMap } from '@/routes/utils';
import { getFlexLink } from '@/routes/utils';
import styles from '../../card.less';

const MenuItemGroup = Menu.ItemGroup;

export const DocMenu = ({ docMenuProps }) => {
  const {
    swbhCards = {},
    changeSwbnCardVisible = () => {},
    changeTab = () => {},
    selectedKey = 'TODO',
    swbhMode,
    changeCurrentCarousel = () => {},
    swbnCardVisible,
    showGuide,
  } = docMenuProps;
  const {
    currentCarousel = 'ALL',
    currentDocName = intl.get('swbh.common.model.common.docName.all').d('全部'),
    totalLoading = false,
    docTypeSource = [],
    currentMenuData: { cardDataEntryTypeDTOList = [], cardCode } = {},
    cardDocFastDTOList = [],
    // cardList = [],
    // allCard = {},
    docTotal = {},
    todoDocTotal = {},
    focusDocTotal = {},
    transferTotalElements = [],
  } = swbhCards;
  const { allCard = {}, cardDataDocTypeDTOList = [] } = docTotal;
  const { cardDataDocTypeDTOList: newCardDataDocTypeDTOList = [], allCard: newAllCard } = todoDocTotal;
  const { cardDataDocTypeDTOList: focusCardDataDocTypeDTOList = [], allCard: focusAllCard } = focusDocTotal;
  let todoData = {};
  if (newCardDataDocTypeDTOList) {
    let newMenuData = [];
    if (currentCarousel === 'ALL') {
      newMenuData = newAllCard?.cardDataEntryTypeDTOList;
    } else {
      newMenuData = newCardDataDocTypeDTOList?.filter((item) => item.cardCode === currentCarousel)?.[0]
        ?.cardDataEntryTypeDTOList;
    }
    const upcomingData = newMenuData?.filter((item) => item?.typeCode === 'UPCOMING')?.[0]?.cardDataEntryDTOList;
    todoData = upcomingData?.filter((data) => data?.entryCode === 'TODO')?.[0];
  }

  let focusData = {};
  if (focusCardDataDocTypeDTOList) {
    let newMenuData = [];
    if (currentCarousel === 'ALL') {
      newMenuData = focusAllCard?.cardDataEntryTypeDTOList;
    } else {
      newMenuData = focusCardDataDocTypeDTOList?.filter((item) => item.cardCode === currentCarousel)?.[0]
        ?.cardDataEntryTypeDTOList;
    }

    const upcomingData = newMenuData?.filter((item) => item?.typeCode === 'UPCOMING')?.[0]?.cardDataEntryDTOList;
    focusData = upcomingData?.filter((data) => data?.entryCode === 'FOCUS')?.[0];
  }

  const [cardpopoverContentHidden, setCardpopoverContentHidden] = useState(false);
  const [menuPopoverContentHidden, setMenuPopoverContentHidden] = useState(false);

  const handleFastDto = (item) => {
    const path = item?.route;
    const parameters = item?.parameters ?? {};
    const { params = {}, search = {} } = parameters;
    getFlexLink('', path, { ...params }, { ...search }, false);
  };

  const CardPopoverContent = () => {
    const list = [allCard, ...cardDataDocTypeDTOList];
    return (
      <ul className={styles.popoverList}>
        {list && list?.length !== 0
          ? list.map((item, index) => {
              return (
                <li
                  key={`${item.cardName + item.cardCode}`}
                  className={`${styles.popoverListItem}`}
                  onClick={() => {
                    changeCurrentCarousel(item?.cardCode, item);
                    setCardpopoverContentHidden(false);
                  }}
                >
                  <div className={styles.docName}>
                    <Icon
                      type={docImgMap?.get(item?.cardCode || 'ALL')?.iconType}
                      // style={{ color: docImgMap?.get(data?.cardCode || 'ALL')?.backgroundColor }}
                      className={styles.icon}
                    />
                    <span>{item?.cardName}</span>
                  </div>
                </li>
              );
            })
          : null}
      </ul>
    );
  };

  const PopoverContent = () => {
    return (
      <ul className={styles.popoverList}>
        {cardDocFastDTOList && cardDocFastDTOList?.length !== 0
          ? cardDocFastDTOList.map((item, index) => {
              return (
                <li
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${item.docName + index}doc`}
                  className={`${styles.popoverListItem}`}
                  onClick={() => {
                    setMenuPopoverContentHidden(false);
                    handleFastDto(item);
                  }}
                >
                  {/* <div className={styles.docIcon}>
                    <Icon
                      type={item?.icon ?? 'assignment'}
                      style={{ color: docImgMap?.get(currentCarousel)?.backgroundColor }}
                      className={styles.icon}
                    />
                    <div
                      className={styles.bgBox}
                      style={{ backgroundColor: docImgMap?.get(currentCarousel)?.backgroundColor }}
                    />
                  </div> */}
                  <div className={styles.docName}>
                    <span>{item?.docName}</span>
                  </div>
                </li>
              );
            })
          : null}
      </ul>
    );
  };

  const getMenuIconClass = (selectedKey) => {
    let iconeClass = 'shougongjian';
    switch (selectedKey) {
      case 'TRANSFER': // '待转单'
        iconeClass = 'daizhuandan';
        break;
      case 'PENDING': // '，草稿箱'
        iconeClass = 'caogaoxiang';
        break;
      case 'TODO': // '待处理'
        iconeClass = 'daichuli';
        break;
      case 'FOCUS': // '待阅读'
        iconeClass = 'daiyuedu';
        break;
      case 'INITIATE': // 我发起
        iconeClass = 'wofaqi';
        break;
      case 'HANDLE': // 我经办
        iconeClass = 'wojingban';
        break;
      default:
        iconeClass = 'shougongjian';
    }
    return iconeClass;
  };

  // const defaulSelectKey = 'TODO';
  const defaulOpenKeys = 'UPCOMING';

  const DocTypeTitle = () => {
    return (
      <div
        className={`${styles.currentDocCard} ${showGuide ? 'swbh-card-tab-switch' : ''} `}
        onClick={() => changeSwbnCardVisible()}
      >
        <div className={`${styles.docName} ${swbnCardVisible ? '' : styles.swbnCardHiddenDocName}`}>
          {/* <Icon type={docImgMap?.get(currentCarousel || 'ALL')?.iconType} className={styles.currentDocIcon} /> */}
          <span>{currentDocName}</span>
          <MyIcon type="a-bianzu23" />
        </div>
      </div>
    );
  };

  const currentTransferTotalElements = useMemo(
    () => transferTotalElements.find((i) => i.cardCode === cardCode)?.transferTotalElements,
    [transferTotalElements, cardCode]
  );

  return (
    <>
      {/* <Spin spinning={totalLoading || false}> */}
      <Spin spinning={false}>
        {/* {swbhMode && swbhMode === 'focus' ? (
        <Popover
          overlayClassName={`${styles.popoverContent} ${styles.cardPopoverContent}`}
          placement="bottomLeft"
          content={<CardPopoverContent />}
          trigger="click"
          visible={cardpopoverContentHidden}
          onVisibleChange={(visible) => {
            setCardpopoverContentHidden(visible);
          }}
        >
          <div
            className={`${styles.currentDocCard} swbh-card-tab-switch ${styles.focusModeCurrentDocCard}`}
            onClick={() => {
              setCardpopoverContentHidden(!cardpopoverContentHidden);
            }}
          >
            <div className={styles.docName}>
              <Icon type={docImgMap?.get(currentCarousel || 'ALL')?.iconType} className={styles.currentDocIcon} />
              <span>{currentDocName}</span>
              <Icon type="unfold_more" className={styles.icon} />
            </div>
          </div>
        </Popover>
      ) : (
        <DocTypeTitle />
      )} */}
        <DocTypeTitle />
        <Menu
          className={styles.menu}
          onClick={(value) => {
            changeTab(value);
          }}
          // defaultSelectedKeys={[selectedKey]}
          selectedKeys={[selectedKey]}
          defaultOpenKeys={[defaulOpenKeys]}
          mode="inline"
        >
          {cardDataEntryTypeDTOList.map((item) => {
            return currentCarousel === 'ALL' && item?.typeCode === 'NEW' ? null : (
              <MenuItemGroup
                key={item?.typeCode}
                title={<span>{item?.typeName}</span>}
                className={`${showGuide ? `swbh-menu-group-title-${item?.typeCode?.toLowerCase()}` : ''} ${
                  currentCarousel !== 'ALL' && item?.typeCode === 'NEW' && showGuide ? 'swbh-menu-group-title-new' : ''
                }`}
              >
                {item?.typeCode === 'NEW' ? (
                  <Popover
                    overlayClassName={styles.popoverContent}
                    placement="rightTop"
                    content={<PopoverContent />}
                    trigger="click"
                    visible={menuPopoverContentHidden}
                    onVisibleChange={(visible) => {
                      setMenuPopoverContentHidden(visible);
                    }}
                  >
                    <li
                      className="c7n-menu-item"
                      onClick={() => {
                        setMenuPopoverContentHidden(!menuPopoverContentHidden);
                      }}
                    >
                      <MyIcon type={getMenuIconClass('shougongjian')} />
                      <span>{intl.get('swbh.common.model.common.menu.handBuilt').d('手工建')}</span>
                      <Icon type="navigate_next" className={styles.icon} />
                    </li>
                  </Popover>
                ) : (
                  <></>
                )}
                {item?.cardDataEntryDTOList && item?.cardDataEntryDTOList.length > 0
                  ? item.cardDataEntryDTOList.map((data) => {
                      return (
                        data.entryCode !== 'PROCESSING' && (
                          <Menu.Item
                            key={data?.entryCode}
                            className={showGuide ? `swbh-menu-${data?.entryCode?.toLowerCase()}` : ''}
                          >
                            <MyIcon
                              type={getMenuIconClass(data?.entryCode || 'TODO')}
                              className={styles.icon}
                              isSvg={data?.entryCode !== selectedKey}
                            />
                            {data.entryCode === 'TODO' ? (
                              <>
                                <Badge
                                  count={
                                    (todoData?.totalElements || data?.totalElements) > 99
                                      ? '99+'
                                      : todoData?.totalElements || data?.totalElements
                                    // todoData?.totalElements || data?.totalElements
                                  }
                                  className={styles.badge}
                                >
                                  <span>{data?.entryName}</span>
                                </Badge>
                              </>
                            ) : (
                              <>
                                <span>{data?.entryName}</span>
                                <span className={styles.total}>
                                  {data.entryCode === 'FOCUS'
                                    ? `(${
                                        (focusData?.totalElements || data?.totalElements) > 99
                                          ? '99+'
                                          : focusData?.totalElements || data?.totalElements
                                      })`
                                    : data.entryCode === 'TRANSFER' // 待转单数量单独处理
                                    ? `(${
                                        currentTransferTotalElements > 99
                                          ? '99+'
                                          : currentTransferTotalElements ?? '...'
                                      })`
                                    : `(${data?.totalElements > 99 ? '99+' : data?.totalElements})`}
                                </span>
                              </>
                            )}
                          </Menu.Item>
                        )
                      );
                    })
                  : null}
              </MenuItemGroup>
            );
          })}
        </Menu>
      </Spin>
    </>
  );
};
