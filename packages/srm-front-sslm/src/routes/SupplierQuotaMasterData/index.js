/**
 * Index - 配额主数据
 * @date: 2024-01-02
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import { compose, isEmpty } from 'lodash';
import querystring from 'querystring';
import { getResponse, filterNullValueObject } from 'utils/utils';
import React, { Fragment, useEffect, useCallback, useState } from 'react';
import { DataSet, Select, Icon, SelectBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import MultipleTextField from '@/routes/components/MultipleTextField';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { queryMapIdpValue } from 'services/api';
import { handleEnable, unlock } from '@/services/supplierQuotaService';
import { OperationButtons, getColumns } from './utils';
import { getSupplierQuotaDS, getItemQuotaDS } from './stores/indexDS';
import styles from './index.less';

let searchBarRef; // 筛选器ref
const source = 'masterData'; // 跳转详情页来源页面

const { Option } = SelectBox;

const CusUnitCodeMap = {
  SUPPLIER: {
    tableCode: 'SSLM.SUP_QUOTA_DATA_LIST.SUPPLIER_TABLE',
    searchBarCode: 'SSLM.SUP_QUOTA_DATA_LIST.SUPPLIER_SEARCH',
  },
  ITEM: {
    tableCode: 'SSLM.SUP_QUOTA_DATA_LIST.ITEM_TABLE',
    searchBarCode: 'SSLM.SUP_QUOTA_DATA_LIST.ITEM_SEARCH',
  },
};

const Index = ({
  remote,
  dispatch,
  history,
  custLoading,
  customizeTable,
  customizeBtnGroup,
  quotaMasterList,
  mixObj,
}) => {
  const [quotaDimension, setquotaDimension] = useState(mixObj.quotaDimension);
  const [valueList, setValueList] = useState({}); // 存储值集

  useEffect(() => {
    queryValueList();
  }, []);

  // 列表查询
  const handleQuery = ({ params = {}, currentPage } = {}) => {
    if (quotaMasterList[quotaDimension]?.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = quotaMasterList[quotaDimension].queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty?.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      const reqList = params.multiSelectReqNums;
      clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
      // eslint-disable-next-line no-unused-expressions
      quotaMasterList[quotaDimension]?.queryDataSet?.current?.set({
        ...params,
        ...clearParams,
      });
      quotaMasterList[quotaDimension].query(currentPage);
    } else if (searchBarRef) {
      // 解决初次查询不传个性化参数问题
      searchBarRef.handleQuery(true);
    } else {
      quotaMasterList[quotaDimension].query(currentPage);
    }
  };

  // 查询值集
  const queryValueList = useCallback(() => {
    const lovCode = {
      dimensionList: 'SSLM.SUPPLIER_QUOTA_QUERY_DIMENSION',
    };
    queryMapIdpValue(lovCode).then((response) => {
      const res = getResponse(response);
      if (res) {
        setValueList(res);
      }
    });
  }, []);

  /**
   * 跳转到详情页
   * @params {object} record - 行数据
   * @params {object} 跳转类型 - edit：编辑｜view：查看
   * @params source: 跳转详情页来源页面
   */
  const handleGoDetail = useCallback(
    (record, type) => {
      let curQuotaHeaderId = null;
      if (!isEmpty(record)) {
        if (isEmpty(record.data)) {
          const { quotaHeaderId } = record || {};
          curQuotaHeaderId = quotaHeaderId;
        } else {
          const { quotaHeaderId } = record.data || {};
          curQuotaHeaderId = quotaHeaderId;
        }
      }
      if (curQuotaHeaderId) {
        history.push({
          pathname: `/sslm/supplier-quota-master-data/detail/${curQuotaHeaderId}`,
          search: querystring.stringify({
            type,
            source,
            entranceSource: source,
            sourceQuotaHeaderId: curQuotaHeaderId,
          }),
        });
      }
    },
    [quotaDimension]
  );

  /**
   * 变更回调
   * @params {object} record - 行数据
   */
  const handleChange = (record) => {
    const { quotaHeaderId, evalStatus, quotaAgreementNum } = record.get([
      'quotaHeaderId',
      'evalStatus',
      'quotaAgreementNum',
    ]);
    const params = {
      quotaHeaderId,
    };
    if (['ALREADY_UPDATE'].includes(evalStatus)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sslm.supplierQuotaMasterData.view.check.receipt', {
            num: `${quotaAgreementNum}`,
          })
          .d(`当前配额协议已在变更中，单号【${quotaAgreementNum}】，请勿重复发起`),
      });
    } else {
      unlock(params).then((res) => {
        if (getResponse(res)) {
          const { quotaHeaderId: newQuotaHeaderId } = res;
          if (newQuotaHeaderId) {
            history.push({
              pathname: `/sslm/supplier-quota-master-data/detail/${newQuotaHeaderId}`,
              search: querystring.stringify({
                type: 'edit',
                source,
              }),
            });
          }
        }
      });
    }
  };

  /**
   * 禁用回调
   * @params {object} record - 行数据
   */
  const handleEnableFun = (record) => {
    const { quotaHeaderId, enableFlag } = record.get(['quotaHeaderId', 'enableFlag']);
    const params = {
      quotaHeaderId,
      enableFlag: enableFlag ? 0 : 1,
    };
    handleEnable(params).then((res) => {
      if (getResponse(res)) {
        notification.success();
        handleQuery();
      }
    });
  };

  // 维度切换回调
  const supplierDimensionChange = (value) => {
    const dimension = value || 'SUPPLIER';
    setquotaDimension(dimension);
    // eslint-disable-next-line no-param-reassign
    mixObj.quotaDimension = dimension;
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(
    (_, queryDataSet) => {
      const { dimensionList = [] } = valueList || {};
      return (
        <div>
          <Select
            clearButton={false}
            value={quotaDimension}
            onChange={supplierDimensionChange}
            suffix={<Icon type="expand_more" style={{ marginLeft: -20 }} />}
          >
            {dimensionList.map((item) => (
              <Option value={item.value}>{item.meaning}</Option>
            ))}
          </Select>
          <div className={styles['search-line-division']} />
          <MultipleTextField
            dataSet={queryDataSet}
            name="multiSelectReqNums"
            placeholder={intl
              .get('sslm.common.modal.sample.multiSelectReqNums')
              .d('请输入申请单号')}
          />
        </div>
      );
    },
    [valueList, quotaDimension]
  );

  // 导出参数
  const handleParams = useCallback(() => {
    quotaMasterList[quotaDimension].query();
    const queryData = quotaMasterList[quotaDimension].queryDataSet.current.toData();
    const queryParams = filterNullValueObject(queryData);
    let idList = {};
    if (quotaDimension === 'SUPPLIER') {
      const quotaLineIds = (quotaMasterList[quotaDimension].selected || []).map((r) =>
        r.get('quotaLineId')
      );
      idList = { quotaLineIds };
    } else if (quotaDimension === 'ITEM') {
      const quotaHeaderIds = (quotaMasterList[quotaDimension].selected || []).map((r) =>
        r.get('quotaHeaderId')
      );
      idList = { quotaHeaderIds };
    }
    const { __dirty, ...others } = queryParams;
    return {
      ...others,
      ...idList,
    };
  }, [quotaDimension]);

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.supplierQuotaMasterData.view.title.quotaMasterData').d('配额主数据')}
      >
        <OperationButtons
          remote={remote}
          customizeBtnGroup={customizeBtnGroup}
          customizeBtnGroupCode=""
          quotaDimension={quotaDimension}
          handleQuery={handleQuery}
          handleParams={handleParams}
          dataSet={quotaMasterList[quotaDimension]}
        />
      </Header>
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: CusUnitCodeMap[`${quotaDimension}`].tableCode,
            },
            <SearchBarTable
              key={quotaDimension}
              cacheState
              dataSet={quotaMasterList[quotaDimension]}
              columns={getColumns({
                tabPaneKey: quotaDimension,
                dispatch,
                handleGoDetail,
                handleChange,
                handleEnableFun,
              })}
              custLoading={custLoading}
              searchCode={CusUnitCodeMap[`${quotaDimension}`].searchBarCode}
              searchBarRef={(ref) => {
                searchBarRef = ref;
              }}
              searchBarConfig={{
                onQuery: handleQuery,
                left: {
                  render: renderLeftSearchBar,
                },
              }}
              style={{
                maxHeight: tableMaxHeight.hasGroupTab,
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierQuotaManage', 'sslm.supplierQuotaMasterData'],
  }),
  WithCustomize({
    unitCode: ['SSLM.SUP_QUOTA_DATA_LIST.SUPPLIER_TABLE', 'SSLM.SUP_QUOTA_DATA_LIST.ITEM_TABLE'],
  }),
  remotes({
    code: 'SSLM_SUP_QUOTA_MASTER_DATA_LIST',
  }),
  withProps(
    () => {
      const quotaMasterDS = new DataSet(getSupplierQuotaDS());
      const quotaMasterItemDS = new DataSet(getItemQuotaDS());

      quotaMasterDS.setQueryParameter('queryParam', {
        tableCode: CusUnitCodeMap.SUPPLIER.tableCode,
        searchBarCode: CusUnitCodeMap.SUPPLIER.searchBarCode,
      });
      quotaMasterItemDS.setQueryParameter('queryParam', {
        tableCode: CusUnitCodeMap.ITEM.tableCode,
        searchBarCode: CusUnitCodeMap.ITEM.searchBarCode,
      });

      const mixObj = {
        quotaDimension: 'SUPPLIER', // 供应商+品类物料初始维度
      };

      return {
        quotaMasterList: {
          SUPPLIER: quotaMasterDS,
          ITEM: quotaMasterItemDS,
        },
        mixObj,
      };
    },
    { cacheState: true }
  )
)(Index);
