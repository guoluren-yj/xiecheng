/* eslint-disable prefer-destructuring */
/**
 * 模板选择列表弹窗
 */

import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { queryIdpValue } from 'services/api';
import { Icon, Card } from 'choerodon-ui';
import { TextField, Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { getTemplateList } from '@/services/reportConfigService';

import styles from './index.less';

const noResult = require('@/assets/noResult.svg');

let groupSetList = [];
let mouseTagMap = {};

export default function TemplateSelectModal(props) {
  const { headerId, onSelectTemp = () => {}, cacheLayouts } = props;

  const [searchText, setSearchText] = useState('');
  const [cardArray, setCardArray] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectId, setSelected] = useState('');

  useEffect(() => {
    return () => {
      groupSetList = [];
      mouseTagMap = {};
    };
  }, []);

  useEffect(() => {
    queryIdpValue('SDAT.REPORT_TEMPLATE_GROUP').then((res) => {
      if (getResponse(res)) {
        groupSetList = res || [];
        queryTempList('');
      }
    });
  }, [headerId]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

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
        if (groupSetList.length) {
          groupSetList.forEach((result) => {
            if (result.value === item) {
              groupName = result.meaning;
              orderSeq = result.orderSeq;
            }
          });
        }
        groupArr.push({
          value: item,
          meaning: groupName,
          cardList: [],
          orderSeq,
        });
      });

      if (groupArr.length) {
        groupArr.forEach((item) => {
          data.forEach((item2) => {
            if (item.value === item2.groupCode) {
              item.cardList.push({
                ...item2,
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

      setGroupList(groupArr);
      setRefresh(true);
    }
  };

  /**
   * 查询模板列表
   * @param {*} searchText
   */
  const queryTempList = (text) => {
    getTemplateList({
      name: text,
    }).then((res) => {
      if (getResponse(res) && res && res.length) {
        setCardArray(res || []);
        formatCardList(res || []);
      }
    });
  };

  const handleInputSearch = (e) => {
    setSearchText(e?.target?.value.trim() ?? '');
  };

  const handleClear = () => {
    setSearchText('');
    queryTempList('');
  };

  const handleQuery = () => {
    queryTempList(searchText);
  };

  /**
   * 绘制卡片分组列表
   */
  const drawGroupList = () => {
    return (groupList || []).map((item) => {
      return (
        <Card key={item.value} title={item.meaning} bordered={false}>
          {renderCardList(item?.cardList ?? [])}
        </Card>
      );
    });
  };

  /**
   * 鼠标移入事件
   */
  const handleMouseEnter = (e, flag) => {
    e.stopPropagation();
    e.preventDefault();
    mouseTagMap[flag] = true;
    setRefresh(true);
  };

  /**
   * 鼠标移出事件
   */
  const handleMouseLeave = (e, flag) => {
    e.stopPropagation();
    e.preventDefault();
    mouseTagMap[flag] = false;
    setRefresh(true);
  };

  /**
   * 选择某个模板
   * @param {*} id
   */
  const handleSelectTemp = (e, id, type) => {
    e.stopPropagation();
    e.preventDefault();

    if (type === 'edit') {
      // 编辑现有报表
      if (cacheLayouts && cacheLayouts.length) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>
              {intl
                .get('sdat.reportConfig.view.selectTemp.cover')
                .d('应用模板会替换当前报表所选卡片，是否确认引用？')}
            </div>
          ),
        }).then((button) => {
          if (button === 'ok') {
            setSelected(id);
            onSelectTemp(id, type);
          }
        });
      } else {
        setSelected(id);
        onSelectTemp(id, type);
      }
    } else {
      setSelected(id);
      onSelectTemp(id, type);
    }
  };

  /**
   * 绘制卡片列表
   */
  const renderCardList = (cardList = []) => {
    const dataArr = [...cardList];
    dataArr.sort((a, b) => {
      return b.orderSeq - a.orderSeq;
    });

    return (dataArr || []).map((item) => {
      if (!item) {
        return null;
      }

      return (
        <div
          key={item.templateId}
          className={styles['template-card-panel-parent']}
          onMouseEnter={(e) => handleMouseEnter(e, item.templateId)}
          onMouseLeave={(e) => handleMouseLeave(e, item.templateId)}
          onClick={(e) => handleSelectTemp(e, item.cockpitHeaderId, 'view')}
          style={{ background: selectId === item.cockpitHeaderId ? '#F2F3F5' : '' }}
        >
          <div className={styles['template-card-panel']}>
            <div style={{ lineHeight: '18px', color: '#1D2129' }}>
              <span style={{ fontSize: '14px' }}>{item.name}</span>
            </div>
            <div style={{ lineHeight: '18px', color: '#868D9C', marginTop: '3px' }}>
              {item.description}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={styles['template-list-panel']}>
      <div className={styles['template-list-panel-search']}>
        <TextField
          clearButton
          style={{ width: '100%' }}
          prefix={<Icon type="search" />}
          value={searchText}
          placeholder={intl
            .get('sdat.reportConfig.view.placeholder.searchTempName')
            .d('请输入模板名称或描述查询')}
          onInput={handleInputSearch}
          onClear={handleClear}
          onEnterDown={handleQuery}
        />
      </div>

      <div className={styles['template-box-list']}>
        {cardArray.length ? (
          <div>{drawGroupList()}</div>
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
              {intl.get('sdat.reportConfig.view.message.tempNotFound').d('未找到相关模板')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
