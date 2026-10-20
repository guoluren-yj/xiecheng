import React, { useMemo, useEffect, useCallback, useState, useRef, memo } from 'react';
import { isEmpty, noop, isNil } from 'lodash';
import { Popover } from 'choerodon-ui';
import { useDataSet, Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import SVGIcon from '@/routes/components/SvgIcon';
import configImg from '@/assets/config.svg';

import style from './index.less';

const promptCode = 'ssrc.priceComparison';

const Index = observer((props) => {
  const {
    subItemConfig: { allConfigItemList = [], configItemLists = [], configItemSelected = [] } = {},
    itemGroupData: {
      subRelationName,
      displaySubRelationNum,
      childrenList: subRelationTableList,
    } = {},
    indexKey,
    showConfigModal = noop,
  } = props;
  const itemDS = useMemo(
    () =>
      new DataSet({
        paging: false,
        selection: false,
      }),
    []
  );
  const fixedDS = useDataSet(
    () => ({
      selection: false,
      paging: false,
      data: configItemLists,
      fields: [{ name: 'baseInfo' }],
    }),
    [configItemLists]
  );
  // 滚动位置
  const [startPosition, setStartPosition] = useState(0);
  const tableRef = useRef(null);
  const [showCount, setShowCount] = useState(6); // 需要显示数量
  // 处理后的新数据
  const [newDealData, setNewDealData] = useState([]);

  // 处理数据
  const dealData = useCallback(
    (list) => {
      return configItemLists.map((config) => {
        let newObj = {};
        list.forEach((item, index) => {
          let keyValue = item[config.keyCode];
          if (config.keyCode === 'priceDiffRatio' && !isNil(keyValue)) {
            keyValue += '%';
          }
          newObj = {
            ...newObj,
            [`supplierCompanyName_${index}`]: keyValue,
          };
        });
        return newObj;
      });
    },
    [configItemLists, configItemSelected]
  );

  useEffect(() => {
    if (itemDS?.current) {
      itemDS.forEach((record, index) => {
        if (!isNil(record)) {
          record.init(newDealData[index]);
        }
      });
      return;
    }
    itemDS.loadData(newDealData);
  }, [newDealData]);

  useEffect(() => {
    calculateCount();
    // 在切换配置项的时候执行这个loadData
    itemDS.loadData(newDealData);
  }, [configItemLists, tableRef.current]);

  // 计算需要显示的数量
  const calculateCount = useCallback(() => {
    if (tableRef?.current) {
      const tableWidth = tableRef.current.wrapper?.getElementsByClassName('c7n-pro-table')[0]
        ?.offsetWidth;
      // 根据分辨率的不同 计算当前显示数量
      if (!isNil(tableWidth)) {
        const count = Math.ceil(tableWidth / 200);
        setShowCount(count + 5);
      }
    }
  }, [tableRef.current]);

  // 处理表格动态列
  const getTableColumns = useCallback(() => {
    const tableColumns = [];
    if (isEmpty(subRelationTableList)) return;
    const newListData = dealData(
      subRelationTableList.slice(startPosition, startPosition + showCount)
    );
    if (isEmpty(newListData)) return;
    setNewDealData(newListData);
    const firstListDataMap = new Map(Object.entries(newListData[0]));

    firstListDataMap.forEach((value, key) => {
      itemDS.addField(key, {
        name: key,
        label: value,
      });
      tableColumns.push({ name: key, minWidth: 200 });
    });

    return tableColumns;
  }, [startPosition, subRelationTableList, configItemLists, showCount]);

  // 固定头标题列
  const fixedColumns = useMemo(() => {
    return [
      {
        name: 'baseInfo',
        lock: 'left',
        width: 155,
      },
    ];
  }, []);

  // 右侧内容表格列
  const tableColumns = useMemo(() => {
    const columnList = getTableColumns();
    return [
      {
        header: `${subRelationName}-${displaySubRelationNum}`,
        children: columnList,
      },
    ];
  }, [
    startPosition,
    subRelationTableList,
    subRelationName,
    configItemLists,
    displaySubRelationNum,
  ]);

  // 向左滚动
  const handleTableScrollLeft = useCallback(
    (scrollLeft) => {
      const calculateStartPosition = Math.floor(scrollLeft / 200);
      setStartPosition(calculateStartPosition);
      if (tableRef.current) {
        const tableRefCurrent = tableRef.current;
        tableRefCurrent.wrapper.getElementsByTagName('table')[0].style.marginLeft = `${
          calculateStartPosition * 200
        }px`;
      }
    },
    [startPosition, subRelationTableList]
  );

  return (
    <div className={classNames(style['ssrc-history-price-scroll-table-wrapper'])}>
      <div className={classNames(style['ssrc-history-price-scroll-table-header'])}>
        <div className={classNames(style['header-left'])}>
          {intl.get(`${promptCode}.model.comparison.subRelation.baseInfo`).d('基本信息')}
          {indexKey === 1 && (
            <span
              className={style['quoteInfo-config-icon']}
              onClick={() => showConfigModal(configItemSelected, allConfigItemList)}
            >
              <SVGIcon path={configImg} />
            </span>
          )}
        </div>
        <div className={classNames(style['header-right'])}>
          <Popover content={`${subRelationName} - ${displaySubRelationNum}`}>
            {subRelationName}-{displaySubRelationNum}
          </Popover>
        </div>
      </div>
      <div className={classNames(style['ssrc-history-price-scroll-table-content'])}>
        <Table
          className="left-table"
          dataSet={fixedDS}
          style={{ width: 155 }}
          columns={fixedColumns}
          showHeader={false}
          border
        />
        <Table
          showHeader={false}
          virtual
          virtualCell
          dataSet={itemDS}
          columns={tableColumns}
          headerRowHeight="auto"
          onScrollLeft={handleTableScrollLeft}
          style={{ width: 'calc(100% - 155px)' }}
          ref={tableRef}
        />
      </div>
    </div>
  );
});

export default memo(Index);
