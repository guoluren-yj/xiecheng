import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Table, Button, DataSet } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { Modal, Icon } from 'choerodon-ui';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { saveSubscribeTopic } from '@/services/dataDictionaryService';

import './index.less';

const { Sidebar } = Modal;

let dsTree = {}; // 存储属性数据每一行的 DS
let selectList = []; // 选择的数据列表
let continueKey = 1;

const TopicSubscriptionModal = (props) => {
  const {
    visible,
    onCancel = () => {},
    lovDS,
    onSelect = () => {},
    // openPending = () => {},
  } = props;

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

    lovDS.query();

    return () => {
      dsTree = {};
      selectList = [];
      lovDS.data = [];
      lovDS.queryDataSet.data = [];
      lovDS.queryDataSet.reset();
      lovDS.reset();
      lovDS.removeEventListener('load', lovLoadEvent);
      lovDS.removeEventListener('select', lovSelectEvent);
      lovDS.removeEventListener('unSelect', lovUnSelectEvent);
      lovDS.removeEventListener('selectAll', lovSelectAllEvent);
      lovDS.removeEventListener('unSelectAll', lovSelectAllEvent);
      continueKey = 1;
    };
  }, []);

  const lovSelectAllEvent = ({ dataSet }) => {
    if (dataSet.selected.length) {
      dataSet.selected.forEach((item) => {
        if (dsTree[item.get('topicNum')]) {
          // 选中树节点，手动选中相应的子节点
          dsTree[item.get('topicNum')].selectAll();
        }
      });
    } else {
      Object.keys(dsTree).forEach((item) => {
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
    if (dsTree[record.get('topicNum')]) {
      dsTree[record.get('topicNum')].unSelectAll();
    }
  };

  /**
   * 选中事件
   * @param {*} param
   */
  const lovSelectEvent = ({ record }) => {
    if (dsTree[record.get('topicNum')]) {
      dsTree[record.get('topicNum')].selectAll();
    }
  };

  /**
   * lov 事件监听
   * @param {*} param
   */
  const lovLoadEvent = ({ dataSet }) => {
    dataSet.forEach((record) => {
      const list = record?.get('tableList') ?? [];
      const keyVal = record?.get('topicNum') ?? uuid();

      if (!dsTree[keyVal]) {
        // 存在当前树，不进行更新
        const ds = new DataSet({
          primaryKey: 'metaId',
          paging: false,
          selection: 'multiple',
          fields: [
            {
              name: 'name',
            },
            {
              name: 'description',
            },
          ],
        });
        dsTree[keyVal] = ds; // ds 树赋值
      }

      dsTree[keyVal].addEventListener('batchSelect', (e) => childDsSelectEvent(e, keyVal));
      dsTree[keyVal].addEventListener('batchUnSelect', (e) => childDsSelectEvent(e, keyVal));
      dsTree[keyVal].data = [...list];
    });

    if (selectList.length) {
      selectList.forEach((item) => {
        if (item.topicNum && dsTree[item.topicNum]) {
          const ds = dsTree[item.topicNum];
          ds.forEach((record) => {
            if (record.get('metaId') === item.metaId) {
              ds.select(record);
            }
          });
        }
      });
    }
  };

  const handleCloseModal = () => {
    // setList([]);
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
    const record = lovDS.filter((item) => item.get('topicNum') === key);
    if (dataSet.selected.length === dataSet.length) {
      // 全部选择的状态下 选中对应的父节点
      lovDS.select(record[0]);
    } else {
      // if (!dataSet.selected.length)
      const list = dataSet.selected;
      lovDS.unSelect(record[0]); // 父级取消选择
      list.forEach((item) => {
        // 子级重新选择
        dataSet.select(item);
      });
    }

    const selectedList = [];
    Object.keys(dsTree).forEach((item) => {
      if (dsTree[item] && dsTree[item].selected && dsTree[item].selected.length) {
        dsTree[item].selected.forEach((result) => {
          selectedList.push({
            ...result.toData(),
          });
        });
      }
    });

    // setList(selectedList);
    selectList = selectedList;
    setRefresh(true);
  };

  /**
   * 展开表树形数据
   * @param {*} param
   * @returns
   */
  const renderExpandRowTable = ({ record }) => {
    const keyVal = record.get('topicNum');
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
        header: intl.get('sdps.dataDictionary.model.tableNum').d('表编码'),
        name: 'name',
      },
      {
        header: intl.get('sdps.dataDictionary.model.tableName').d('表名称'),
        name: 'description',
      },
    ];
  };

  /**
   * 确定选择数据
   */
  const handleSelect = () => {
    if (selectList.length && continueKey) {
      continueKey = 0;
      saveSubscribeTopic(selectList).then((res) => {
        continueKey = 1;
        // if (
        //   res.failed &&
        //   res.code === 'sdps.data.collection.is.being.performed.in.the.background'
        // ) {
        //   // 正在执行
        //   // openPending();
        //   selectList = [];
        //   setRefresh(true);
        //   lovDS.query();
        //   return;
        // }
        if (getResponse(res)) {
          notification.success();
          onSelect(selectList);
        }
      });
    }
  };

  const columns = () => {
    return [{ name: 'topicNum' }, { name: 'topicName' }];
  };

  /**
   * 删除列表中的某条数据
   */
  const handeRemoveItem = (item = {}) => {
    const records = dsTree[item.topicNum].filter((record) => record.get('metaId') === item.metaId);
    if (records.length) {
      dsTree[item.topicNum].unSelect(records[0]);
    }
  };

  /**
   * 绘制选择的数据列表
   */
  const drawSelectItem = () => {
    if (!selectList.length) {
      return (
        <div style={{ lineHeight: '38px', color: 'rgba(0, 0, 0, 0.45)', textAlign: 'center' }}>
          {intl.get('sdps.dataDictionary.view.message.selectLeftList').d('请选择左侧列表数据')}
        </div>
      );
    }
    if (selectList.length) {
      const formatList = formatTreeList(selectList);
      return formatList.map((item) => {
        return (
          <>
            {item.metaId ? (
              <div className="select-item-row">
                <span
                  style={{
                    display: 'inline-block',
                    width: '230px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {`${item?.name ?? ''} ${item?.description ?? ''}`}
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
                className="select-item-row-title"
                style={{
                  lineHeight: '38px',
                  fontWeight: 500,
                  paddingLeft: '16px',
                  display: item.topicName ? 'block' : 'none',
                  cursor: 'pointer',
                }}
              >
                {item.topicName || ''}
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
    list.forEach((item) => {
      obj[item.topicNum] = item.topicName;
    });

    Object.keys(obj).forEach((item) => {
      rtnArr.push({
        topicNum: item,
        topicName: obj[item],
      });
      list.forEach((result) => {
        if (result.topicNum === item) {
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
    autoHeight: { type: 'maxHeight', diff: 20 },
  };

  const formatList = formatTreeList(selectList);

  return (
    <Sidebar
      title={intl.get('sdps.dataDictionary.view.title.themeSubscription').d('按主题订阅')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className="topic-subscribe-modal"
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
      <div className="topic-subscribe-modal-content">
        <div className="topic-modal-left-table">
          <div className="add-subscribe-modal">
            <Table {...tableProps} />
          </div>
        </div>
        <div className="topic-modal-select-list">
          {formatList.length ? (
            <div style={{ color: 'rgba(0, 0, 0, 0.3)', paddingLeft: '16px' }}>
              {intl.get('sdps.dataDictionary.view.title.hasSelected').d('已选择')}
              <span style={{ color: '#36C2CF' }}>
                {formatList.filter((item) => !item.metaId).length}
              </span>
              {intl.get('sdps.dataDictionary.view.title.hasSelectedTopic').d('个主题，')}
              <span style={{ color: '#36C2CF' }}>
                {formatList.filter((item) => item.metaId).length}
              </span>
              {intl.get('sdps.dataDictionary.view.title.selectedLast').d('张表')}
            </div>
          ) : null}
          {drawSelectItem()}
        </div>
      </div>
    </Sidebar>
  );
};

export default TopicSubscriptionModal;
