/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Table, Button, DataSet } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { Modal, Icon } from 'choerodon-ui';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';

// import { SRM_DATA_SDAT } from '@/utils/config';
import { fetchAllocateTables, fetchAllCards } from '@/services/cardsDistributionService';

import styles from './index.less';

const { Sidebar } = Modal;

let dsTree = {}; // 存储属性数据每一行的 DS
let selectList = []; // 选择的数据列表
let continueKey = 1;
let groupList = [];

const AddCardModal = props => {
  const { visible, onCancel = () => {}, lovDS, onSelect = () => {}, localRecord } = props;

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    lovDS.addEventListener('load', lovLoadEvent);
    lovDS.addEventListener('select', lovSelectEvent);
    lovDS.addEventListener('unSelect', lovUnSelectEvent);
    lovDS.addEventListener('selectAll', lovSelectAllEvent);
    lovDS.addEventListener('unSelectAll', lovSelectAllEvent);

    lovDS.addEventListener('query', lovQueryEvent);

    querySetList();

    return () => {
      dsTree = {};
      selectList = [];
      groupList = [];
      lovDS.data = [];
      lovDS.queryDataSet.data = [];
      lovDS.queryDataSet.reset();
      lovDS.reset();
      lovDS.removeEventListener('query', lovQueryEvent);
      lovDS.removeEventListener('load', lovLoadEvent);
      lovDS.removeEventListener('select', lovSelectEvent);
      lovDS.removeEventListener('unSelect', lovUnSelectEvent);
      lovDS.removeEventListener('selectAll', lovSelectAllEvent);
      lovDS.removeEventListener('unSelectAll', lovSelectAllEvent);
      continueKey = 1;
    };
  }, []);

  const querySetList = () => {
    queryIdpValue('SDAT.REPORT_CARD_GROUP').then(res => {
      if (getResponse(res)) {
        groupList = res || [];
      }
    });

    fetchAllCards({
      tenantId: localRecord?.tenantId ?? '',
    }).then(res => {
      if (getResponse(res)) {
        initCardDs(res?.content ?? []);
      }
    });
  };

  /**
   * 根据卡片列表初始化ds
   * @param {*} cardList
   */
  const initCardDs = (cardList = []) => {
    const cardMap = {};

    if (cardList.length) {
      cardList.forEach((item, index) => {
        cardMap[item.groupCode] = index;
      });
    }

    const dataArr = [];
    Object.keys(cardMap).forEach(item => {
      if (groupList.length) {
        groupList.forEach(item2 => {
          if (item === item2.value) {
            dataArr.push({
              groupNum: item2.value,
              groupName: item2.meaning,
              description: item2.description,
              id: item2.value,
            });
          }
        });
      }
    });

    if (dataArr.length) {
      dataArr.forEach(item => {
        item.childs = [];
        cardList.forEach(item2 => {
          if (item.groupNum === item2.groupCode) {
            item.childs.push({
              ...item2,
            });
          }
        });
      });
    }

    lovDS.loadData(dataArr);
  };

  /**
   * 查询事件监听
   */
  const lovQueryEvent = ({ data }) => {
    fetchAllCards({
      tenantId: localRecord?.tenantId ?? '',
      ...data,
    }).then(res => {
      if (getResponse(res)) {
        initCardDs(res?.content ?? []);
      }
    });

    return false;
  };

  const lovSelectAllEvent = ({ dataSet }) => {
    if (dataSet.selected.length) {
      dataSet.selected.forEach(item => {
        if (dsTree[item.get('groupNum')]) {
          // 选中树节点，手动选中相应的子节点
          dsTree[item.get('groupNum')].selectAll();
        }
      });
    } else {
      Object.keys(dsTree).forEach(item => {
        if (dsTree[item]) {
          dsTree[item].unSelectAll();
        }
      });
    }
  };

  /**
   * 取消选中事件
   * @param {*} param
   */
  const lovUnSelectEvent = ({ record }) => {
    if (dsTree[record.get('groupNum')]) {
      dsTree[record.get('groupNum')].unSelectAll();
    }
  };

  /**
   * 选中事件
   * @param {*} param
   */
  const lovSelectEvent = ({ record }) => {
    if (dsTree[record.get('groupNum')]) {
      dsTree[record.get('groupNum')].selectAll();
    }
  };

  /**
   * lov 事件监听
   * @param {*} param
   */
  const lovLoadEvent = ({ dataSet }) => {
    dataSet.forEach(record => {
      const keyVal = record?.get('groupNum') ?? uuid();
      const list = record?.get('childs') ?? [];
      record.set('keyVal', keyVal);

      if (!dsTree[keyVal]) {
        // 存在当前树，不进行更新
        const ds = new DataSet({
          primaryKey: 'cardId',
          paging: false,
          selection: 'multiple',
          fields: [
            {
              name: 'code',
            },
            {
              name: 'name',
            },
          ],
          // transport: {
          //   read: ({ data, params }) => {
          //     return {
          //       url: `${SRM_DATA_SDAT}/v1/report-card-distributions/absent-card-list?page=-1`,
          //       params: {
          //         ...data,
          //         ...params,
          //       },
          //       method: 'GET',
          //     };
          //   },
          // },
        });
        dsTree[keyVal] = ds; // ds 树赋值
      }

      dsTree[keyVal].addEventListener('batchSelect', e => childDsSelectEvent(e, keyVal));
      dsTree[keyVal].addEventListener('batchUnSelect', e => childDsSelectEvent(e, keyVal));
      dsTree[keyVal].data = [...list];
    });

    if (selectList.length) {
      selectList.forEach(item => {
        if (item.groupNum && dsTree[item.groupNum]) {
          const ds = dsTree[item.groupNum];
          ds.forEach(record => {
            if (record.get('cardId') === item.cardId) {
              ds.select(record);
            }
          });
        }
      });
    }
  };

  /**
   * 图标展开时触发
   * @param {*} expanded
   * @param {*} record
   */
  const handleExpand = (expanded, record) => {
    lovDS.forEach(item => {
      // 关闭全部的项
      item.isExpanded = false;
    });
    if (expanded) {
      // 如果是展开展开当前项
      record.isExpanded = true;
    }
  };

  const handleCloseModal = () => {
    selectList = [];
    dsTree = {};
    lovDS.data = [];
    lovDS.queryDataSet.data = [];
    lovDS.queryDataSet.reset();
    lovDS.reset();
    onCancel();
  };

  /**
   * 子节点选择事件监听事件
   * @param {*} event
   */
  const childDsSelectEvent = ({ dataSet }, key) => {
    const record = lovDS.filter(item => item.get('groupNum') === key);
    if (dataSet.selected.length === dataSet.length) {
      // 全部选择的状态下 选中对应的父节点
      lovDS.select(record[0]);
    } else {
      const list = dataSet.selected;
      lovDS.unSelect(record[0]); // 父级取消选择
      list.forEach(item => {
        // 子级重新选择
        dataSet.select(item);
      });
    }

    const selectedList = [];
    Object.keys(dsTree).forEach(item => {
      if (dsTree[item] && dsTree[item].selected && dsTree[item].selected.length) {
        dsTree[item].selected.forEach(result => {
          selectedList.push({
            ...result.toData(),
          });
        });
      }
    });

    selectList = selectedList;
    setRefresh(true);
  };

  /**
   * 展开表树形数据
   * @param {*} param
   * @returns
   */
  const renderExpandRowTable = ({ record }) => {
    const keyVal = record.get('groupNum');
    return (
      <div>
        <Table
          highLightRow={false}
          dataSet={dsTree[keyVal]}
          columns={expandedColomns()}
          queryBar="none"
        />
      </div>
    );
  };

  const expandedColomns = () => {
    return [
      {
        header: intl.get('sdat.cardsDistribution.model.cardNum').d('卡片编码'),
        name: 'code',
      },
      {
        header: intl.get('sdat.cardsDistribution.model.cardName').d('卡片名称'),
        name: 'name',
      },
    ];
  };

  /**
   * 确定选择数据
   */
  const handleSelect = () => {
    if (selectList.length && continueKey) {
      continueKey = 0;

      const list = [];

      selectList.forEach(item => {
        list.push({
          tenantId: localRecord.tenantId >= 0 ? localRecord.tenantId : '',
          cardId: item.cardId || '',
        });
      });

      fetchAllocateTables(list).then(res => {
        continueKey = 1;
        if (getResponse(res)) {
          notification.success();
          onSelect(selectList);
        }
      });
    }
  };

  const columns = () => {
    return [{ name: 'groupNum' }, { name: 'groupName' }];
  };

  /**
   * 删除列表中的某条数据
   */
  const handeRemoveItem = (item = {}) => {
    const records = dsTree[item.groupCode].filter(record => record.get('cardId') === item.cardId);
    if (records.length) {
      dsTree[item.groupCode].unSelect(records[0]);
    }
  };

  /**
   * 绘制选择的数据列表
   */
  const drawSelectItem = () => {
    if (!selectList.length) {
      return (
        <div style={{ lineHeight: '38px', color: 'rgba(0, 0, 0, 0.45)', textAlign: 'center' }}>
          {intl.get('sdat.cardsDistribution.view.message.selectLeftList').d('请选择左侧列表数据')}
        </div>
      );
    }
    if (selectList.length) {
      const formatList = formatTreeList(selectList);

      return formatList.map(item => {
        return (
          <>
            {item.cardId ? (
              <div className={styles['select-item-row']}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '230px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {`${item?.code ?? ''} ${item?.name ?? ''}`}
                </span>
                <Icon
                  type="cancel"
                  style={{
                    fontSize: '16px',
                    color: 'rgb(140, 140, 140)',
                    float: 'right',
                    marginTop: '10px',
                    marginRight: '16px',
                  }}
                  onClick={() => handeRemoveItem(item)}
                />
              </div>
            ) : (
              <span
                className={styles['select-item-row-title']}
                style={{
                  lineHeight: '38px',
                  fontWeight: 500,
                  paddingLeft: '16px',
                  display: item.groupName ? 'block' : 'none',
                  cursor: 'pointer',
                }}
              >
                {item.groupName || ''}
              </span>
            )}
          </>
        );
      });
    }
  };

  /**
   * 把选择的表列表 按主题分组
   */
  const formatTreeList = (list = []) => {
    const rtnArr = [];
    const obj = {};

    list.forEach(item => {
      let groupName = '';
      lovDS.forEach(result => {
        if (result.get('id') === item.groupCode) {
          groupName = result.get('groupName');
        }
      });

      obj[item.groupCode] = groupName;
    });

    Object.keys(obj).forEach(item => {
      rtnArr.push({
        groupNum: item,
        groupName: obj[item],
      });
      list.forEach(result => {
        if (result.groupCode === item) {
          rtnArr.push({
            ...result,
          });
        }
      });
    });

    return rtnArr;
  };

  const tableProps = {
    dataSet: lovDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    columns: columns(),
    expandedRowRenderer: renderExpandRowTable,
    onExpand: handleExpand,
    autoHeight: { type: 'maxHeight', diff: 20 },
  };

  const formatList = formatTreeList(selectList);

  return (
    <Sidebar
      title={intl.get('sdat.cardsDistribution.view.title.addCard').d('添加卡片')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={styles['topic-subscribe-modal']}
      width={980}
      footer={
        <div>
          <Button color="primary" onClick={handleSelect}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      }
    >
      <div className={styles['topic-subscribe-modal-content']}>
        <div className={styles['topic-modal-left-table']}>
          <div className={styles['add-subscribe-modal']}>
            <Table {...tableProps} />
          </div>
        </div>
        <div className={styles['topic-modal-select-list']}>
          {formatList.length ? (
            <div style={{ color: 'rgba(0, 0, 0, 0.3)', paddingLeft: '16px' }}>
              {intl.get('sdat.cardsDistribution.view.title.hasSelected').d('已选择')}
              <span style={{ color: '#36C2CF' }}>
                {formatList.filter(item => !item.cardId).length}
              </span>
              {intl.get('sdat.cardsDistribution.view.title.hasSelectedTopic').d('个主题，')}
              <span style={{ color: '#36C2CF' }}>
                {formatList.filter(item => item.cardId).length}
              </span>
              {intl.get('sdat.cardsDistribution.view.title.selectedLast').d('张表')}
            </div>
          ) : null}
          {drawSelectItem()}
        </div>
      </div>
    </Sidebar>
  );
};

export default AddCardModal;
