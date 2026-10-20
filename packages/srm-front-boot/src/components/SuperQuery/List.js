import React, { Fragment, useEffect, useContext, useState, useCallback } from 'react';
import { TextField, Spin, Dropdown, useModal, Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import noData from '@/assets/none.svg';

import QueryPanel from './components/QueryPanel';
import Synthesize from './components/synthesize';
import { getAccessQuery, getAccessDelete } from './components/superQueryService';
import { getEmbedPageLink } from './components/utils';

import { Store } from './stores';
import styles from './index.less';

/**
 * 超级搜索入口:
 * @returns
 */
const List = () => {
  const {
    loading,
    searchDs,
    setChecked,
    historyRecord,
    handleSearch,
    keyword,
    seeMore,
    setSeeMore,
    userRequest,
    searchActive,
    searchDropDownHidden,
    handleSearchActiveChange,
    handleHiddenChange,
    handleCleanFilter,
    handleHistoryQuery,
    handleDeleteHistory,
    isFromSSO,
    setIsFromSSO,
    setKeyword,
    queryParams,
    billHeaderDs,
    supplierDs,
    matterDs,
    searchBarRef,
  } = useContext(Store);
  const modal = useModal();
  const activeKeyRef = React.useRef();
  const containerRef = React.useRef();
  const [accessHistory, setAccessHistory] = useState([]);
  const { billData, supplierData, itemData } = userRequest;
  const data = !isEmpty(billData) || !isEmpty(supplierData) || !isEmpty(itemData);

  /**
   * @searchActive input焦点
   */
  useEffect(() => {
    if (searchActive) {
      handleAccessHistory();
    }
  }, [searchActive]);

  /**
   * @isFromSSO 单点登陆
   */
  useEffect(() => {
    if (isFromSSO) {
      setIsFromSSO(false);
      const { tab = 'DOC', docType, searchValue } = queryParams;

      let currentTab = 'bill';

      switch (tab) {
        case 'DOC': // '单据'
          currentTab = 'bill';
          break;
        case 'SUPPLIER': // '供应商'
          currentTab = 'supplier';
          break;
        case 'ITEM': // '物料'
          currentTab = 'item';
          break;
        default:
          currentTab = 'bill';
      }

      searchDs.current.set('keyword', searchValue);
      setKeyword(searchValue);
      setChecked({ switchDocument: docType, checked: !!docType }, currentTab);
      handleQueryPanel(currentTab, isFromSSO);
    }
  }, [isFromSSO]);

  /**
   * 查询面板
   * @key 综合单据类型
   * @setSeeMore 打开查询面板 - 浮窗隐藏
   */
  const handleQueryPanel = useCallback(
    (key, deleteKey = false) => {
      setSeeMore(false);
      modal.open({
        title: intl.get('srm.common.view.title.search').d('搜索'),
        mask: true,
        closable: true,
        destroyOnClose: true,
        maskClosable: false,
        drawer: true,
        customizedCode: 'SWBH.ROLE_WORKBENCH.SEARCH',
        style: { maxWidth: 996, minWidth: 996 },
        className: styles['super-container-modal'],
        children: <QueryPanel seeMoreKey={key} activeKeyRef={activeKeyRef} />,
        afterClose: () => {
          setChecked({ checked: false }, 'bill');
          setChecked({ checked: false }, 'supplier');
          setSeeMore(true);
          handleCleanFilter(deleteKey);
        },
        footer: null,
      });
    },
    [modal, setSeeMore, activeKeyRef, handleCleanFilter]
  );
  /**
   * 访问历史查询
   */
  const handleAccessHistory = useCallback(async () => {
    const res = getResponse(await getAccessQuery());
    if (res) {
      setAccessHistory(res);
    }
  }, [setAccessHistory]);
  /**
   * 删除访问历史
   */
  const handleDeleteAccess = useCallback(async () => {
    const res = getResponse(await getAccessDelete());
    if (res) {
      setAccessHistory([]);
    }
  }, [setAccessHistory]);

  function floatWindow(type) {
    return (
      <div className={styles['search-history']}>
        <Spin spinning={type ? loading : false}>
          <>
            {!isEmpty(historyRecord) && (
              <>
                <div className={styles['search-history-wrapper']}>
                  <span>{intl.get('srm.common.view.title.searchHistory').d('搜索历史')}</span>
                  <Icon
                    type="delete"
                    className={styles['search-history-mouse']}
                    onClick={() => handleDeleteHistory([])}
                  />
                </div>
                <ul className={styles['search-history-list']}>
                  {historyRecord.map((item) => {
                    return (
                      <Tag
                        closable
                        key={item.id}
                        onClick={() => handleHistoryQuery(item.textValue)}
                        onClose={(e) => {
                          handleDeleteHistory(historyRecord.filter((i) => i.id !== item.id));
                          e.stopPropagation();
                        }}
                      >
                        {item.textValue}
                      </Tag>
                    );
                  })}
                </ul>
              </>
            )}
            {!isEmpty(accessHistory) && (
              <>
                <div className={styles['search-history-wrapper']}>
                  <span>{intl.get('srm.common.view.title.accessHistory').d('访问历史')}</span>
                  <Icon
                    type="delete"
                    className={styles['search-history-mouse']}
                    onClick={() => handleDeleteAccess()}
                  />
                </div>
                <ul className={styles['search-history-list']}>
                  {accessHistory.map((item) => {
                    const { params = {}, search = {} } = item.detailParameters || {};
                    if (!item.name || !item.code) return;
                    return (
                      <Tag
                        key={item.code}
                        onClick={() =>
                          getEmbedPageLink(
                            'workBench',
                            item.link,
                            { ...params },
                            { ...search },
                            setSeeMore
                          )
                        }
                      >
                        {item.name}-{item.code}
                      </Tag>
                    );
                  })}
                </ul>
              </>
            )}
            <div
              className={`${styles['search-history-panel']} ${styles['search-history-mouse']}`}
              onClick={() => handleQueryPanel()}
            >
              <span> {intl.get('srm.common.view.title.enterSearchPanel').d('进入搜索面板')}</span>
            </div>
          </>
        </Spin>
      </div>
    );
  }
  function dataResult() {
    return (
      <Fragment>
        {!loading ? (
          <div className={`${styles['search-history']} ${styles['search-no-data']}`}>
            <div>
              <img src={noData} alt="no-data" width={56} height={64} />
              <p>
                {intl
                  .get('srm.common.view.title.enterKeyNodata')
                  .d('未查询到相关数据，请换个关键词查询，或')}
                <a onClick={() => handleQueryPanel()}>
                  {intl.get('srm.common.view.title.enterSearchPanel').d('进入搜索面板')}
                </a>
              </p>
            </div>
          </div>
        ) : (
          floatWindow('dataResult')
        )}
      </Fragment>
    );
  }
  function synthCard() {
    return (
      <div className={styles['search-history']}>
        <Synthesize handleQueryPanel={handleQueryPanel} />
      </div>
    );
  }

  const getPopupContainer = () => {
    const dom = document.getElementById('root');
    return dom;
  };
  const input = (
    <TextField
      className={classNames(
        styles[keyword || searchActive ? 'super-focus-input' : 'super-blue-input']
      )}
      dataSet={searchDs}
      name="keyword"
      onFocus={() => handleSearchActiveChange(true)}
      onBlur={() => handleSearchActiveChange(false)}
      onChange={handleSearch}
      prefix={<Icon type="search" style={{ marginLeft: 8 }} />}
      placeholder={
        searchActive
          ? intl
              .get('srm.common.view.placeholder.KeywordSearch')
              .d('请输入单号、标题、供应商、创建人等关键词搜索')
          : intl.get('srm.common.view.title.superSearch').d('超级搜索')
      }
      clearButton
      wait={300}
      valueChangeAction="input"
    />
  );

  const trigger = ['focus'];
  const options =
    data && seeMore && keyword
      ? synthCard()
      : !data && seeMore && keyword
      ? dataResult()
      : searchActive
      ? floatWindow()
      : null;

  return (
    <div className={styles['super-container']} ref={containerRef}>
      <Dropdown
        hidden={searchDropDownHidden}
        onHiddenChange={handleHiddenChange}
        overlay={options}
        trigger={trigger}
        getPopupContainer={getPopupContainer}
      >
        {input}
      </Dropdown>
    </div>
  );
};
export default observer(List);
