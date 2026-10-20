import * as React from 'react';
import classNames from 'classnames';
import { Button, Icon, TextField, Spin } from 'choerodon-ui/pro';
import { List as C7NList, Popover, Tag } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import { debounce } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import TLoader from './TLoader';
import styles from './index.less';

const ListItem = C7NList.Item;

type stateType = boolean | number | string;

interface contentType {
  name: string;
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
  content: Array<contentType>;
  onChange?: ({ value, record, dataSet }) => void;
  className?: string;
  style?: any;
  autoLoadMore?: boolean;
  itemRender?: (record: any, index: number | string) => React.ReactNode;
  showMore?: boolean;
  searchProps?: object;
  listRef?: any;
  firstLoad?: any;
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
  showMore = true,
  searchProps = {},
  listRef,
  firstLoad,
}) => {
  const [data, setData] = React.useState<Array<any>>([]);
  const [currentId, setCurrentId] = React.useState<string>('');
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [searchVisible, setSearchVisible] = React.useState<boolean>(false);
  const [showLoadingMore, setShowLoadingMore] = React.useState<boolean>(true);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  const TLoaderRef = React.useRef<any>(null);

  React.useEffect(() => {
    setData([]);
    setSearchValue('');
  }, [dataSet]);

  React.useEffect(() => {
    handleFetchData();
  }, []);

  const onload = React.useCallback(
    ({ dataSet: localDataSet }: { dataSet: DataSet }) => {
      if (localDataSet.currentPage === 1) {
        const record = localDataSet.get(0);
        if (TLoaderRef?.current?.panel) TLoaderRef.current.panel.scrollTop = 0;
        if (record && onChange) {
          const tagretRecord = record.toData();
          setLoadingMore(false);
          setData(localDataSet.toData());
          const customInitFlag =
            firstLoad &&
            typeof firstLoad === 'function' &&
            firstLoad({ setCurrentId, dataSet: localDataSet });
          if (customInitFlag) return;
          setCurrentId(tagretRecord[listKey]);
          localDataSet.select(0);
          onChange({ value: tagretRecord[listKey], record, dataSet: localDataSet });
        }
      }
    },
    [loadingMore, data, currentId, onChange]
  );

  React.useEffect(() => {
    dataSet.addEventListener('load', onload);

    return () => {
      dataSet.removeEventListener('load', onload);
    };
  }, [dataSet]);

  React.useEffect(() => {
    const { currentPage, totalPage } = dataSet;

    if (currentPage < totalPage) {
      setShowLoadingMore(true);
    } else {
      setShowLoadingMore(false);
    }
  }, [data]);

  const handleFetchData = () => {
    dataSet.query().then(res => {
      if (res && res.content) {
        setData(data.concat(res.content));
      }
    });
  };

  const handleListSearch = React.useCallback(() => {
    const { onTextChange = () => {} } = searchProps as any;
    onTextChange();
    dataSet.setQueryParameter('keyword', searchValue);
    dataSet.query().then(res => {
      if (res && res.content) {
        setData([].concat(res.content));
      }
    });
    setShowLoadingMore(false);
    setData([]);
  }, [dataSet, data, currentId, showLoadingMore, searchValue]);

  React.useImperativeHandle(listRef, () => ({
    handleListSearch,
  }));

  // 获取下一页
  const handleLoadMore = React.useCallback(
    debounce((resolve: () => {}) => {
      setLoadingMore(true);
      dataSet
        .queryMore(dataSet.currentPage + 1)
        .then(res => {
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
        return <Tag color="green">{intl.get('hzero.common.button.enable').d('启用')}</Tag>;
      } else {
        return <Tag color="volcano">{intl.get('hzero.common.button.disable').d('禁用')}</Tag>;
      }
    }, []);

  // item 渲染函数
  const renderItem = itemRender
    ? record => (
        <ListItem key={record[listKey]}>
          <div
            style={{ width: '100%' }}
            onClick={() => {
              const current = dataSet.find(r => {
                return r.get(listKey) === record[listKey];
              });
              handleClickListItem(current, record);
              if (onChange) {
                onChange({ value: record[listKey], record: current, dataSet });
              }
            }}
          >
            {itemRender(record, currentId)}
          </div>
        </ListItem>
      )
    : React.useCallback(
        record => {
          const itemClassName = currentId === record[listKey] ? 'list-item-active' : 'list-item';
          return (
            <ListItem key={record[listKey]}>
              <div
                className={styles[itemClassName]}
                onClick={() => {
                  const current = dataSet.find(r => {
                    return r.get(listKey) === record[listKey];
                  });
                  handleClickListItem(current, record);
                  if (onChange) {
                    onChange({ value: record[listKey], record: current, dataSet });
                  }
                }}
              >
                <div className={styles['item-header']}>
                  <span>
                    {titleRender ? titleRender({ value: record[title], record }) : record[title]}
                  </span>
                  {stateFiled && enabledRender(record[stateFiled])}
                </div>
                {content &&
                  !!content.length &&
                  content.map(
                    (contentItem: contentType): React.ReactNode => {
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
      setCurrentId(item[listKey]);
      dataSet.unSelectAll();
      dataSet.clearCachedSelected();
      dataSet.select(record);
      dataSet.locate(record);
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
      dataSet.query().then(res => {
        if (res && res.content) {
          setData([].concat(res.content));
          setCurrentId('');
        }
      });
      setShowLoadingMore(false);
      setData([]);
    }
  };

  return (
    <>
      <div className={classNames(styles['content-left'], className)} style={style}>
        <div className={styles['search-form']}>
          <div className={styles['text-filed']}>
            <TextField
              prefix={<Icon type="search" style={{ color: '#D0D0D0' }} />}
              placeholder={intl.get('hmde.domain.view.message.search.keywords').d('请搜索关键词')}
              onEnterDown={handleListSearch}
              value={searchValue}
              onInput={(e: any) => setSearchValue((e.target as any).value)}
              {...searchProps}
            />
          </div>
          {showMore && (
            <div className={styles['more-action']}>
              {renderSearchForm && (
                <Popover
                  overlayStyle={{ zIndex: 100 }}
                  trigger="click"
                  placement="bottomLeft"
                  visible={searchVisible}
                  content={renderForm()}
                >
                  <Button
                    funcType={FuncType.raised}
                    icon="filter2"
                    style={{ color: '#202123' }}
                    onClick={() => {
                      setSearchVisible(prevState => !prevState);
                    }}
                  />
                </Popover>
              )}
              {!renderSearchForm && (
                <Button funcType={FuncType.raised} icon="filter2" style={{ color: '#202123' }} />
              )}
            </div>
          )}
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

export default formatterCollections({ code: ['hzero.common', 'hmde.domain'] })(List);
