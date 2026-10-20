import React, { Fragment, useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { Form, Spin, TextField, Icon } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { getResponse, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import BillTable from './BillTable';
import SupplierTable from './SupplierTable';
import MatterTable from './MatterTable';
import { getSearchCustomize } from './superQueryService';
import { Store } from '../stores';

import styles from './index.less';

const { TabPane } = Tabs;

const QueryPanel = (props) => {
  const {
    setSearchCode,
    billDocumentType,
    supplierDocumentType,
    setChecked,
    searchDs,
    billHeaderDs,
    supplierDs,
    matterDs,
    keyword,
    setUseMatter,
    setBillDocType,
    setSupplierDocType,
    handleLocalStorage,
    handleCleanFilter,
    setKeyword,
    searchBarRef,
    linkType,
    docType,
    initFlag,
    setInitFlag,
    setQueryParams,
  } = useContext(Store);
  const { modal, seeMoreKey } = props;
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [activeKey, setActiveKey] = useState(seeMoreKey || 'bill');

  const key = activeKey || seeMoreKey;

  useEffect(() => {
    if (key) {
      handleTabChange(key, true);
    }
  }, []);

  /**
   * 单据
   * @totalElements --单据总数量
   * @esDocDataList --单据类型
   */
  const billQuery = useCallback(() => {
    setLoading(true);
    billHeaderDs
      .query()
      .then((res) => {
        if (getResponse(res)) {
          const { esDocDataList } = res || {};
          setBillDocType(esDocDataList);
          setBillData(res.content);
        }
      })
      .finally(() => setLoading(false));
  }, [billHeaderDs, setBillDocType, setLoading, setBillData]);
  /**
   * 供应商
   * @totalElements --单据总数量
   * @esDocDataList --单据类型
   */
  const supplierQuery = useCallback(() => {
    setLoading(true);
    supplierDs
      .query()
      .then((res) => {
        if (getResponse(res)) {
          const { esDocDataList } = res || {};
          setSupplierDocType(esDocDataList);
          setSupplierData(res.content);
        }
      })
      .finally(() => setLoading(false));
  }, [supplierDs, setSupplierDocType, setLoading, setSupplierData]);
  /**
   * 物料
   * @totalElements --单据总数量
   * @esDocDataList --单据类型
   */
  const matterQuery = useCallback(() => {
    setLoading(true);
    matterDs
      .query()
      .then((res) => {
        if (getResponse(res)) {
          const { esDocDataList, totalElements } = res || {};
          setUseMatter({
            matterData: res.content,
            matterDocType: esDocDataList,
            matterTotal: totalElements,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [matterDs, setUseMatter, setLoading]);

  /**
   * 单据类型个性化编码查询
   * @param {*} value
   */
  const searchCustomize = useCallback(
    async (value) => {
      const res = await getSearchCustomize({ combineCode: value });
      if (res) {
        setSearchCode(res);
        try {
          if (res === undefined) return '';
          const errorResult = JSON.parse(res);
          getResponse(errorResult);
          return res;
        } catch {
          if (isEmpty(res)) {
            return '';
          } else {
            return String(res);
          }
        }
      }
    },
    [setSearchCode]
  );

  /**
   *@keyword --查询条件
   */
  const handleOnSearch = useCallback(
    (value) => {
      const val = value?.trim();
      setChecked({ switchDocument: null, checked: false }, activeKey);
      setKeyword(val);
      handleQuery(activeKey, val);
      handleLocalStorage(val);
    },
    [handleQuery, activeKey, handleLocalStorage, setChecked]
  );

  const dsList = useMemo(
    () => [
      { key: 'bill', ds: billHeaderDs },
      { key: 'supplier', ds: supplierDs },
      { key: 'matter', ds: matterDs },
    ],
    []
  );

  const loadData = (currentDs, allParams, isSetDsParams = false) => {
    if (currentDs?.getState('queryStatus') === 'ready') {
      const params = isSetDsParams
        ? { ...filterNullValueObject(searchBarRef.current.state.queryParameter) }
        : null;
      currentDs.setQueryParameter('params', { ...allParams });
      currentDs.setQueryParameter('searchBarParams', { ...params });
      handleView(key);
    } else {
      const timer = setInterval(() => {
        if (currentDs?.getState('queryStatus') === 'ready') {
          const params = isSetDsParams
            ? { ...filterNullValueObject(searchBarRef.current.state.queryParameter) }
            : null;
          currentDs.setQueryParameter('params', { ...allParams });
          currentDs.setQueryParameter('searchBarParams', { ...params });
          handleView(key);
          clearInterval(timer);
        }
      }, 300);
    }
  };

  /**
   * 查询
   * @param {*} value
   * @docType --单据类型编码
   */
  const handleQuery = useCallback(
    (key, value, params = {}, init = false) => {
      const allParams = {
        keyword: value,
        ...params,
      };
      setQueryParams(allParams);

      const currentDs = dsList.find((i) => i.key === key).ds;
      if (!init && currentDs.getQueryParameter('searchBarParams')) {
        currentDs.setQueryParameter('searchBarParams', null);
      }

      if (init && linkType === 'superQuery' && docType) {
        loadData(currentDs, allParams, true);
      } else {
        currentDs.setQueryParameter('params', allParams);
        handleView(key);
      }
    },
    [dsList, handleView, dsList, billHeaderDs, setQueryParams]
  );
  const handleView = useCallback(
    (key) => {
      switch (key) {
        case 'bill':
          billQuery();
          break;
        case 'supplier':
          supplierQuery();
          break;
        case 'matter':
          matterQuery();
          break;
        default:
          break;
      }
    },
    [billQuery, supplierQuery, matterQuery]
  );
  /**
   * tab页切换
   * @param {*} key
   */
  const handleTabChange = useCallback(
    async (key, init = false) => {
      if (!init && initFlag) {
        setInitFlag(false);
      }
      setActiveKey(key);
      const { switchDocument: billSwitchDocument, checked: billChecked } = billDocumentType;
      const {
        switchDocument: supplierSwitchDocument,
        checked: supplierChecked,
      } = supplierDocumentType;

      let params = {};

      if (key === 'bill' && billChecked) {
        const code = await searchCustomize(billSwitchDocument);
        params = {
          docType: billSwitchDocument ?? null,
          customizeUnitCode: billSwitchDocument ? code : null,
        };
      } else if (key === 'supplier' && supplierChecked) {
        const code = await searchCustomize(supplierSwitchDocument);
        params = {
          docType: supplierSwitchDocument ?? null,
          customizeUnitCode: supplierSwitchDocument ? code : null,
        };
      }

      // setChecked({ checked: false });
      handleQuery(key, keyword, params, init);
    },
    [setActiveKey, setChecked, handleQuery]
  );

  /**
   * 单据类型切换
   * @param {*} value
   */
  const handleChecked = useCallback(
    async (e, value, key) => {
      const docType = e ? value : null;
      let code = '';
      if (docType) {
        code = await searchCustomize(docType);
      } else {
        // 筛选器清空方法
        handleCleanFilter();
      }
      const params = {
        docType,
        customizeUnitCode: docType ? code : null,
      };
      setChecked({ switchDocument: value, checked: e }, activeKey);
      handleQuery(key, keyword, params);
    },
    [setChecked, searchCustomize, handleQuery]
  );
  /**
   * 清空查询参数
   */
  const handleClear = useCallback(() => {
    searchDs.current.reset();
    setKeyword('');
    setChecked({ switchDocument: null, checked: false }, activeKey);
    handleQuery(activeKey, null);
  }, [handleQuery, setChecked]);

  const formationProps = {
    handleChecked,
    modal,
    loading,
    billHeaderDs,
    supplierDs,
    matterDs,
    activeKey,
    billData,
    supplierData,
    setLoading,
    setBillData,
  };
  return (
    <Fragment>
      <Form
        dataSet={searchDs}
        labelLayout="placeholder"
        labelWidth={956}
        className={styles['super-form']}
      >
        <TextField
          ref={(input) => {
            if (input != null) {
              input.focus();
            }
          }}
          onChange={handleOnSearch}
          autofocus="autofocus"
          prefix={<Icon type="search" style={{ marginLeft: 8 }} />}
          name="keyword"
          wait={300}
          suffix={
            <span className={styles['super-input']} onClick={handleClear}>
              {keyword && intl.get('srm.common.view.title.cleanUp').d('清除')}
            </span>
          }
          valueChangeAction="input"
        />
      </Form>
      <Spin spinning={loading}>
        <Tabs
          className={styles['super-tabs-list']}
          tabPosition={TabsPosition.top}
          activeKey={activeKey}
          onChange={handleTabChange}
        >
          <TabPane
            tab={intl.get('srm.common.view.tabPane.bill').d('单据')}
            key="bill"
            count={() => billHeaderDs.totalCount}
          >
            <BillTable {...formationProps} />
          </TabPane>
          <TabPane
            tab={intl.get('srm.common.view.tabPane.supplier').d('供应商')}
            key="supplier"
            count={() => supplierDs.totalCount}
          >
            <SupplierTable {...formationProps} />
          </TabPane>
          <TabPane
            tab={intl.get('srm.common.view.tabPane.matter').d('物料')}
            key="matter"
            count={() => matterDs.totalCount}
          >
            <MatterTable {...formationProps} />
          </TabPane>
        </Tabs>
      </Spin>
    </Fragment>
  );
};
export default observer(QueryPanel);
