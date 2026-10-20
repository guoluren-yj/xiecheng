import * as React from 'react';
import classNames from 'classnames';
import { Button, Icon, TextField, Spin } from 'choerodon-ui/pro';
import { List as C7NList, Popover, Tag } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { debounce } from 'lodash';
import intl from 'utils/intl';
import TLoader from './TLoader';
import styles from './index.less';

const ListItem = C7NList.Item;

type stateType = boolean | number | string;

interface ContentType {
  name: string;
  hidden?: boolean;
  render?: (value: any) => React.ReactNode;
}

interface ListProps {
  dataSet: DataSet;
  listKey?: string;
  title: string;
  titleRender?: (value: any) => React.ReactNode;
  stateFiled?: string;
  renderSearchForm?: () => React.ReactNode;
  stateRender?: (flag: stateType) => React.ReactNode;
  content: ContentType[];
  onChange?: ({ value, record, dataSet }) => void;
  className?: string;
  style?: any;
  autoLoadMore?: boolean;
  itemRender?: (record: any, index: number) => React.ReactNode;
  autoQuery?: boolean;
  initKeyword?: string;
}

const List: React.FC<ListProps> = ({
  dataSet,
  listKey = 'id',
  title,
  titleRender,
  stateFiled,
  renderSearchForm,
  stateRender,
  content,
  onChange = () => {},
  className = '',
  style = {},
  autoLoadMore = true,
  itemRender,
  autoQuery = true,
  initKeyword = '',
}) => {
  const [data, setData] = React.useState<Array<any>>([]);
  const [currentId, setCurrentId] = React.useState<string>('');
  const [value, setValue] = React.useState<string>(initKeyword);
  // const [searchVisible, setSearchVisible] = React.useState<boolean>(false);
  const [showLoadingMore, setShowLoadingMore] = React.useState<boolean>(true);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  const TLoaderRef = React.useRef<any>(null);

  React.useEffect(() => {
    // 如果设置了默认数据没用query或者loadData
    if (dataSet.toData().length > 0) {
      setData(dataSet.toData());
      if (dataSet.current) {
        handleSelect({ record: dataSet.current });
        onChange({ value: dataSet.current.get(listKey), record: dataSet.current, dataSet });
      }
    }
  }, []);

  React.useEffect(() => {
    if (autoQuery) {
      handleFetchData();
    }
  }, []);

  const onAppend = React.useCallback(
    ({ dataSet: localDataSet }: { dataSet: DataSet }) => {
      const { pageSize, totalCount } = localDataSet;
      if (localDataSet.current) {
        const flag =
          localDataSet.records.length % pageSize === 0
            ? localDataSet.records.length - pageSize <= totalCount
            : localDataSet.records.length <= totalCount;
        const flag2 = totalCount < pageSize;
        // eslint-disable-next-line no-nested-ternary
        const replacedData = flag2
          ? localDataSet.slice(totalCount - localDataSet.records.length)
          : flag
          ? localDataSet.slice(-pageSize)
          : localDataSet.slice(-(totalCount % pageSize));
        const replacedRecord = replacedData.find(
          (item) =>
            item.get(listKey) === localDataSet.current?.get(listKey) &&
            item.index !== localDataSet.current?.index
        );
        if (replacedRecord) {
          const { _status, __id, ...replacedObj } = replacedRecord.toData();
          const originObj = localDataSet.current?.toData();
          Object.keys(replacedObj).forEach((key) => {
            if (originObj[key] !== replacedObj[key]) {
              if (localDataSet.current) {
                localDataSet.current.set(key, replacedObj[key]);
              }
            }
          });
          const { index = 0 } =
            localDataSet.find((item) => item.get(listKey) === localDataSet.current?.get(listKey)) ||
            {};
          const end = Math.min(Math.ceil((index + 1) / pageSize) * pageSize, totalCount);
          localDataSet.splice(end, replacedData.length);
          onChange({
            value: localDataSet.current.get(listKey),
            record: localDataSet.current,
            dataSet: localDataSet,
          });
          setData(localDataSet.toData());
        } else {
          // 重新查询后没搜到对应数据的情况
          const r = localDataSet.records.find(
            (item) =>
              item.get(listKey) === localDataSet.current?.get(listKey) &&
              item.index !== localDataSet.current?.index
          );
          if (localDataSet.currentPage === Math.ceil((localDataSet.current.index + 1) / 10) && !r) {
            // FIXME: totalCount是错的，我怎么算，我先当-1算了
            const flag3 =
              localDataSet.records.length % pageSize === 0
                ? localDataSet.records.length - pageSize <= totalCount - 1
                : localDataSet.records.length <= totalCount - 1;
            const flag4 = totalCount - 1 < pageSize;
            const replacedDatas =
              // eslint-disable-next-line no-nested-ternary
              flag4 || !flag3
                ? totalCount === localDataSet.records.length
                  ? []
                  : localDataSet.slice(totalCount - localDataSet.records.length)
                : localDataSet.slice(-pageSize);
            const start = Math.floor((localDataSet.current.index + 1) / 10) * 10;
            localDataSet.splice(
              start,
              localDataSet.records.length - Math.floor((localDataSet.current.index + 1) / 10) * 10,
              ...replacedDatas.map((item) => new Record(item.toData(), localDataSet))
            );

            setData(localDataSet.toData());
            const record = localDataSet.get(0);
            if (record) {
              const item = record.toData();
              handleClickListItem(record, item);
            }
            if (TLoaderRef?.current?.panel) {
              TLoaderRef.current.panel.scrollTop = 0;
            }
          }
        }
      }
    },
    [onChange]
  );

  const onload = React.useCallback(
    ({ dataSet: localDataSet }: { dataSet: DataSet }) => {
      if (localDataSet.toData().length === 0) {
        setData([]);
      }
      if (localDataSet.currentPage === 1) {
        // TODO: 为什么要todata,不能直接localDataSet.length吗
        const record = localDataSet.toData().length !== 0 ? localDataSet.get(0) : undefined;
        if (TLoaderRef?.current?.panel) TLoaderRef.current.panel.scrollTop = 0;
        if (record && onChange) {
          setData(localDataSet.toData());
          const _record = record.toData();
          setLoadingMore(false);
          setCurrentId(_record[listKey]);
          // FIXME: 不需要了
          localDataSet.select(0);
          onChange({ value: _record[listKey], record, dataSet: localDataSet });
        }
      }
    },
    [loadingMore, data, currentId, onChange]
  );

  React.useEffect(() => {
    dataSet.addEventListener('load', onload);
    dataSet.addEventListener('append', onAppend);
    dataSet.addEventListener('indexChange', handleSelect);

    return () => {
      dataSet.removeEventListener('load', onload);
      dataSet.removeEventListener('append', onAppend);
      dataSet.removeEventListener('indexChange', handleSelect);
    };
  }, [loadingMore, data, currentId, onChange, dataSet]);

  React.useEffect(() => {
    dataSet.setQueryParameter('keyword', value);
  }, [value]);

  React.useEffect(() => {
    const { currentPage, totalPage } = dataSet;

    if (currentPage < totalPage) {
      setShowLoadingMore(true);
    } else {
      setShowLoadingMore(false);
    }
  }, [data]);

  const handleFetchData = () => {
    dataSet.query().then((res) => {
      if (res && res.content) {
        setData(data.concat(res.content));
      }
    });
  };

  const handleListSearch = React.useCallback(() => {
    handleReSearchData();
  }, [dataSet, data, currentId, showLoadingMore, value]);

  // 获取下一页
  const handleLoadMore = React.useCallback(
    debounce((resolve: () => {}) => {
      setLoadingMore(true);
      dataSet
        .queryMore(dataSet.currentPage + 1)
        .then((res) => {
          if (res) {
            const _data = dataSet.toData();
            if (_data && _data.length) {
              setData(_data);
            }
          }
        })
        .finally(() => {
          setLoadingMore(false);
          resolve();
        });
    }, 500),
    [data, loadingMore]
  );

  // tag渲染函数
  const enabledRender =
    stateRender ||
    React.useCallback((flag: stateType) => {
      let _flag = flag;
      if (typeof flag === 'string') {
        _flag = flag === 'true' || flag === '1';
      }

      if (typeof flag === 'number') {
        _flag = !!flag;
      }

      if (_flag) {
        return <Tag color="green">{intl.get('hzero.common.enable').d('启用')}</Tag>;
      } else {
        return <Tag color="volcano">{intl.get('hzero.common.button.disable').d('禁用')}</Tag>;
      }
    }, []);

  // item 渲染函数
  const renderItem =
    itemRender ||
    React.useCallback(
      (record) => {
        const itemClassName = currentId === record[listKey] ? 'list-item-active' : 'list-item';
        return (
          <ListItem key={record[listKey]}>
            <div
              className={`${styles[itemClassName]} ${
                itemClassName === 'list-item-active' ? itemClassName : ''
              }`}
              onClick={() => {
                const current = dataSet.find((r) => {
                  return r.get(listKey) === record[listKey];
                });
                if (current) {
                  handleClickListItem(current, record);
                  if (onChange) {
                    onChange({ value: record[listKey], record: current, dataSet });
                  }
                }
              }}
            >
              <div className={`${styles['item-header']} item-header`}>
                <span>{titleRender ? titleRender(record[title]) : record[title]}</span>
                {stateFiled && enabledRender(record[stateFiled])}
              </div>
              {content &&
                !!content.length &&
                content
                  .filter((i) => !i?.hidden)
                  .map(
                    (contentItem: ContentType): React.ReactNode => {
                      const { name, render } = contentItem;
                      return (
                        <>
                          <div className={styles['item-content']} key={`${contentItem.name}`}>
                            {render ? render(record[name]) : <span>{record[name]}</span>}
                          </div>
                        </>
                      );
                    }
                  )}
            </div>
          </ListItem>
        );
      },
      [data, currentId, onChange]
    );

  // 点击列表，渲染详情信息
  const handleClickListItem = React.useCallback(
    (record, item) => {
      if (record && dataSet) {
        setCurrentId(item[listKey]);
        // eslint-disable-next-line no-param-reassign
        dataSet.current = record;
      }
    },
    [currentId, data, dataSet]
  );

  // 点击列表，渲染详情信息
  const handleSelect = React.useCallback(
    ({ record }) => {
      if (record) {
        setCurrentId(record.get(listKey));
        dataSet.unSelectAll();
        dataSet.clearCachedSelected();
        dataSet.select(record);
      }
    },
    [currentId, data, dataSet]
  );

  // 下拉刷新
  // const handleRefresh = (resolve?: any) => {
  //   setShowLoadingMore(true);
  //   setData([]);
  //   handleLoadMore(resolve, "reset");
  // };

  const resetSearchForm = () => {
    if (dataSet.queryDataSet) {
      setValue('');
      dataSet.queryDataSet.reset();
      dataSet.queryDataSet.create({});
    }
  };

  // 渲染搜索表单
  const renderForm = () => {
    return (
      <div style={{ width: 300 }}>
        {renderSearchForm && renderSearchForm()}
        <div
          style={{
            width: '100%',
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => {
              resetSearchForm();
            }}
          >
            {intl.get('hzero.common.button.common.reset').d('重置')}
          </Button>
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              handleReSearchData();
            }}
          >
            {intl.get('hzero.common.button.common.query').d('查询')}
          </Button>
        </div>
      </div>
    );
  };

  const handleReSearchData = async () => {
    const flag = await dataSet.queryDataSet?.validate();
    if (flag) {
      dataSet.query().then((res) => {
        if (res && res.content) {
          setData([].concat(res.content));
          // eslint-disable-next-line
          setCurrentId(res.content?.[0]?.[listKey]);
        }
      });
      setShowLoadingMore(false);
      setData([]);
    }
  };

  const handleChange = (val: string) => {
    setValue(val);
  };

  return (
    <>
      <div className={classNames(styles['content-left'], className)} style={style}>
        <div className={styles['search-form']}>
          <div className={styles['text-filed']}>
            <TextField
              prefix={<Icon type="search" style={{ color: '#D0D0D0' }} />}
              placeholder={intl.get('search.message').d('请搜索关键词')}
              value={value}
              onChange={handleChange}
              onEnterDown={handleListSearch}
            />
          </div>
          <div className={styles['more-action']}>
            {renderSearchForm && (
              <Popover
                overlayStyle={{ zIndex: 100 }}
                placement="bottomLeft"
                // visible={searchVisible}
                content={renderForm()}
              >
                <Button
                  funcType={FuncType.raised}
                  icon="filter2"
                  style={{ color: '#202123' }}
                  // onClick={() => {
                  //   setSearchVisible((prevState) => !prevState);
                  // }}
                />
              </Popover>
            )}
            {!renderSearchForm && (
              <Button funcType={FuncType.raised} icon="filter2" style={{ color: '#202123' }} />
            )}
          </div>
        </div>
        <div className={styles['list-area']}>
          <TLoader
            ref={TLoaderRef}
            // onRefresh={handleRefresh}
            hasMore={showLoadingMore}
            onLoadMore={handleLoadMore}
            autoLoadMore={autoLoadMore}
            className={styles['t-loader']}
          >
            <Spin dataSet={dataSet}>
              <C7NList dataSource={data} renderItem={renderItem} />
            </Spin>
          </TLoader>
        </div>
      </div>
    </>
  );
};

export default List;
