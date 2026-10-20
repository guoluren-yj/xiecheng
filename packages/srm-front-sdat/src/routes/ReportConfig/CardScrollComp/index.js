/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-unknown-property */
/**
 * 卡片配置列表
 */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { Icon, Popover, Collapse } from 'choerodon-ui';
import { TextField } from 'choerodon-ui/pro';
import { getCurrentUser } from 'utils/utils';

import { ReactComponent as IconList } from '@/assets/icon_list.svg';
import { ReactComponent as IconCard } from '@/assets/icon_card.svg';

import SourceBox from '../SourceBox';
import { CardTypes } from '../CardTypes';

import styles from './index.less';

const noCard = require('@/assets/noCard.svg');
const noResult = require('@/assets/noResult.svg');

const { themeConfigVO = {} } = getCurrentUser();

const {
  colorCode = '#29BECE', // 主题色
} = themeConfigVO;

const { Panel } = Collapse;

let groupList = [];
let originalGroup = [];

export default function CardScrollComp(props) {
  const {
    setting,
    headerId,
    queryCardTextList = () => {},
    basicGroupList = [],
    readCards = [],
    onDragStart = () => {},
  } = props;

  const [aggregation, setAggregation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [activeKey, setActiveKey] = useState('');
  const [cardArray, setCardArray] = useState([]);

  useEffect(() => {
    queryCardTextList('', headerId);
    return () => {
      groupList = [];
      originalGroup = [];
    };
  }, []);

  useEffect(() => {
    groupList = basicGroupList;
    originalGroup = basicGroupList;
    let keys = [];
    if (groupList && groupList.length) {
      keys = groupList.map((item) => {
        return item.value;
      });
    }

    setActiveKey(keys);
    setRefresh(true);
  }, [basicGroupList]);

  useEffect(() => {
    setCardArray(readCards);
    formatCardList(readCards);
  }, [readCards]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const changeAggregation = () => {
    setAggregation(!aggregation);
  };

  const handleInputSearch = (e) => {
    setSearchText(e?.target?.value.trim() ?? '');
  };

  const handleClear = () => {
    setSearchText('');
    queryCardTextList('', headerId);
  };

  const handleQuery = () => {
    queryCardTextList(searchText, headerId);
  };

  const formatCardList = (data = []) => {
    const groupMap = {};
    if (data.length) {
      data.forEach((item, index) => {
        groupMap[item.groupCode] = index;
      });

      const groupArr = [];
      Object.keys(groupMap).forEach((item) => {
        let groupName = '';
        let orderSeq = '';
        if (originalGroup.length) {
          originalGroup.forEach((result) => {
            if (result.value === item) {
              groupName = result.meaning;
              orderSeq = result.orderSeq;
            }
          });
        }
        groupArr.push({
          value: item,
          meaning: groupName,
          orderSeq,
          cardList: [],
        });
      });

      if (groupArr.length) {
        groupArr.forEach((item) => {
          data.forEach((item2) => {
            if (item.value === item2.groupCode) {
              item.cardList.push({
                ...item2,
                dragType: CardTypes.REPORT_CARD,
              });
            }
          });

          item.cardList.sort((a, b) => {
            return b.orderSeq - a.orderSeq;
          });
        });
      }

      groupArr.sort((a, b) => {
        return a.orderSeq - b.orderSeq;
      });

      groupList = groupArr;
      setRefresh(true);
    }
  };

  /**
   * 绘制卡片分组列表
   */
  const drawGroupList = () => {
    return (groupList || []).map((item) => {
      return (
        <Panel
          className={styles['source-box-group']}
          key={item.value}
          header={item.meaning}
          style={{
            backgroundColor: aggregation ? '#fff' : '',
          }}
        >
          {renderCardList(item?.cardList ?? [])}
        </Panel>
      );
    });
  };

  const handleDragStart = React.useCallback(
    (isDrapStart) => {
      onDragStart(isDrapStart);
    },
    [onDragStart]
  );

  /**
   * 绘制卡片列表
   */
  const renderCardList = (cardList = []) => {
    const dataArr = [...cardList];
    dataArr.sort((a, b) => {
      return b.orderSeq - a.orderSeq;
    });

    return (dataArr || []).map((item) => {
      return (
        <SourceBox
          key={item.cardId}
          forbidDrag={setting}
          record={item}
          aggregation={aggregation}
          onDragStart={handleDragStart}
        />
      );
    });
  };

  /**
   * 展开对应的分组
   * @param {*} e
   */
  const handleChangeSpan = (e) => {
    setActiveKey(e);
  };

  return (
    <div className={styles['card-list-panel']}>
      <div className={styles['card-list-panel-title']}>
        <div
          style={{
            display: 'inline-block',
          }}
        >
          {intl.get('sdat.reportConfig.view.title.selectCard').d('选择卡片')}
        </div>
        <div className={styles.search}>
          <Popover content={intl.get('sdat.reportConfig.view.title.cardMode').d('卡片模式')}>
            <div
              className={aggregation ? styles.active : styles['change-table']}
              onClick={changeAggregation}
              style={{ marginRight: '8px' }}
            >
              <span
                className={styles['card-list-icon-card']}
                style={{
                  color: aggregation ? colorCode || '#29BECE' : '#868D9C',
                  verticalAlign: 'middle',
                }}
              >
                <IconCard />
              </span>
            </div>
          </Popover>
          <Popover content={intl.get('sdat.reportConfig.view.title.normalListMode').d('列表模式')}>
            <div
              className={!aggregation ? styles.active : styles['change-table']}
              onClick={changeAggregation}
            >
              <span
                className={styles['card-list-icon-list']}
                style={{
                  color: !aggregation ? colorCode || '#29BECE' : '#868D9C',
                  verticalAlign: 'middle',
                }}
              >
                <IconList />
              </span>
            </div>
          </Popover>
        </div>
      </div>

      <div className={styles['card-list-panel-search']}>
        <TextField
          clearButton
          style={{ width: '100%' }}
          prefix={<Icon type="search" />}
          value={searchText}
          placeholder={intl
            .get('sdat.reportConfig.view.placeholder.searchCardName')
            .d('请输入卡片名称或描述查询')}
          onInput={handleInputSearch}
          onClear={handleClear}
          onEnterDown={handleQuery}
        />
      </div>

      <div className={aggregation ? styles['source-card-list'] : styles['source-box-list']}>
        {cardArray.length ? (
          <Collapse
            activeKey={activeKey}
            expandIcon=""
            expandIconPosition="text-right"
            onChange={handleChangeSpan}
          >
            {drawGroupList()}
          </Collapse>
        ) : !searchText ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '136px',
                height: '100px',
              }}
            >
              <img src={noCard} style={{ width: '136px', height: '99px' }} alt="noCard" />
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#1D2129' }}>
              {intl.get('sdat.reportConfig.view.message.handAddedAll').d('已添加所有卡片')}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '45px',
              }}
            >
              <img src={noResult} style={{ width: '38px' }} alt="noResult" />
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#1D2129' }}>
              {intl.get('sdat.reportConfig.view.message.notFound').d('未找到相关卡片')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
