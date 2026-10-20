/**
 * 供货能力查询（采）
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback, useMemo, useEffect, Fragment } from 'react';
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';

import { SelectBox, Icon, Select, Spin, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import remotes from 'utils/remote';
import SearchBarTable from '_components/SearchBarTable';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';

import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableHeight, tableMaxHeight, useSetState } from '@/routes/components/utils';
import {
  getCommonParams,
  hanldeCountryChange,
  getCommonEditorProps,
} from '@/routes/SupplyAbilityDoc/utils/index';

import getSupplierAbilityDs from './stores/getSupplierAbilityDS';
import getItemAbilityDs from './stores/getItemAbilityDS';
import HeaderBtns from './ListHeaderBtns';

import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

const { Option } = SelectBox;

let supplyAbilitySearchRef = null;

const Index = ({
  remote,
  custLoading,
  customizeTable,
  mixObj,
  abilitySupplierDs,
  abilityItemDs,
  dispatch,
  customizeBtnGroup,
}) => {
  const [state, setState] = useSetState({
    spinning: false,
    valueList: {},
    dimension: mixObj.dimension || 'SUPPLIER',
    supplierPageChacheFlag: true, // 缓存供应商维度分页信息
    itemPageChacheFlag: true, // 缓存物料维度分页信息
  });
  const { spinning, valueList: { dimensionList = [] } = {}, dimension } = state;

  const { dataSet, tableCode, searchCode } = useMemo(() => {
    return dimension === 'SUPPLIER'
      ? {
          dataSet: abilitySupplierDs,
          tableCode: 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_TABLE',
          searchCode: 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_SEARCH',
        }
      : {
          dataSet: abilityItemDs,
          tableCode: 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.ITEM_TABLE',
          searchCode: 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.ITEM_SEARCH',
        };
  }, [dimension]);

  useEffect(() => {
    queryValueList();
  }, []);

  // 查询值集
  const queryValueList = useCallback(() => {
    const lovCode = {
      dimensionList: 'SSLM.SUP.WORK_BENCH_DIMENSION',
    };
    queryMapIdpValue(lovCode).then(response => {
      const res = getResponse(response);
      if (res) {
        setState({
          valueList: res,
        });
      }
    });
  }, []);

  // 供应商维度切换回调
  const supplierDimensionChange = useCallback(value => {
    setState({
      dimension: value,
    });
    // eslint-disable-next-line no-param-reassign
    mixObj.dimension = value;
  }, []);

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(
    (_, queryDataSet) => {
      return (
        <div>
          <Select
            clearButton={false}
            value={dimension}
            onChange={supplierDimensionChange}
            suffix={<Icon type="expand_more" style={{ marginLeft: -20 }} />}
          >
            {dimensionList.map(item => (
              <Option value={item.value}>{item.meaning}</Option>
            ))}
          </Select>
          <div className={styles['search-line']} />
          <MultipleTextField
            dataSet={queryDataSet}
            name="multiSelectReqNums"
            placeholder={intl
              .get('sslm.supplyAbility.view.message.multiReqNumOrName')
              .d('请输入供应商名称、供应商编码查询')}
          />
        </div>
      );
    },
    [dimensionList, dimension]
  );

  // 筛选器查询回调
  const handleQuery = (queryProps = {}) => {
    const { params } = queryProps;
    const pageChacheFlag =
      dimension === 'SUPPLIER' ? state.supplierPageChacheFlag : state.itemPageChacheFlag;
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.multiSelectReqNums;
      clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        dataSet.query(dataSet.currentPage);
      } else {
        dataSet.query();
      }
    } else if (supplyAbilitySearchRef) {
      // handleQuery 内部会触发我们的handleQuery方法
      supplyAbilitySearchRef.handleQuery(true);
    } else if (pageChacheFlag) {
      dataSet.query(dataSet.currentPage);
    } else {
      dataSet.query();
    }
  };

  // 跳转到详情页
  const handleGoDetail = useCallback(record => {
    const supplyAbilityId = record.get('supplyAbilityId');
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supply-ability-query-purchaser/detail/${supplyAbilityId}`,
      })
    );
  }, []);

  const getColumns = useCallback(() => {
    const supplierDimensionHidden = dimension === 'SUPPLIER';
    const cols = [
      {
        name: 'supplierCompanyNum',
        width: 140,
        renderer: ({ value, record }) => <a onClick={() => handleGoDetail(record)}>{value}</a>,
      },
      {
        name: 'supplierCompanyName',
        width: 300,
      },
      {
        name: 'stageDescription',
        width: 120,
      },
      {
        name: 'companyName',
        width: 300,
      },
      {
        name: 'createUserName',
        width: 120,
        hidden: !supplierDimensionHidden,
      },
      {
        width: 120,
        name: 'creationDate',
        renderer: ({ value }) => dateRender(value),
        hidden: !supplierDimensionHidden,
      },
      {
        name: 'itemCode',
        hidden: supplierDimensionHidden,
        width: 80,
      },
      {
        name: 'itemName',
        hidden: supplierDimensionHidden,
        width: 180,
      },
      {
        name: 'itemCategoryCode',
        hidden: supplierDimensionHidden,
        width: 80,
      },
      {
        name: 'itemCategoryName',
        hidden: supplierDimensionHidden,
        width: 180,
      },
      {
        name: 'supplyFlag',
        hidden: supplierDimensionHidden,
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'adapterProducts',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'countryIdMeaning',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'regionIdMeaning',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'cityIdMeaning',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'dateFrom',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'dateTo',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'inventoryOrganizationIdMeaning',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'purchaseOrganizationName',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'manufacturer',
        hidden: supplierDimensionHidden,
      },
      {
        name: 'remark',
        hidden: supplierDimensionHidden,
      },
      {
        width: 120,
        name: 'lastUpdateUserName',
      },
      {
        width: 120,
        name: 'lastUpdateDate',
        renderer: ({ value }) => dateRender(value),
      },
    ].filter(i => !i.hidden);
    const colums = remote.process('SSLM_SUPPLY_ABILITY_MASTER_DATA_PURCHASER_LIST_COLUMNS', cols, {
      dimension,
    });
    return colums;
  }, [dimension]);

  const handleExportParams = () => {
    let exportParams = {};
    if (dataSet) {
      const queryData = dataSet.queryDataSet.current.toData();
      const queryParams = filterNullValueObject(queryData);
      const { __dirty, ...others } = queryParams;
      exportParams = {
        ...others,
      };
    }
    return exportParams;
  };

  // 筛选器组件属性
  const getEditorProps = () => {
    const { itemCategoryId } = getCommonEditorProps() || {};
    const editorProps = {
      itemCategoryIds: itemCategoryId,
    };
    return editorProps;
  };

  // 筛选器字段
  const getFieldProps = () => {
    const { itemCategoryId, ...others } = getCommonParams() || {};
    const fieldProps = {
      ...others,
      companyId: {
        lovPara: { organizationId },
      },
      itemCategoryIds: itemCategoryId,
    };
    return fieldProps;
  };

  // 处理字段变更
  const handleFieldChange = async ({ record, name }) => {
    hanldeCountryChange({ record, name });
    if (dimension === 'SUPPLIER') {
      setState({ supplierPageChacheFlag: false });
    } else {
      setState({ itemPageChacheFlag: false });
    }
    await remote.event.fireEvent('cuxHandleFieldChange', {
      record,
      name,
    });
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.supplyAbility.view.message.title.queryPurchaser')
          .d('供货能力清单查询（采）')}
      >
        <HeaderBtns
          remote={remote}
          dataSet={dataSet}
          dimension={dimension}
          customizeBtnGroup={customizeBtnGroup}
          handleExportParams={handleExportParams}
        />
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <div style={{ height: tableHeight.fixedHeight }}>
            {customizeTable(
              {
                code: tableCode,
              },
              <SearchBarTable
                key={dimension}
                cacheState
                dataSet={dataSet}
                columns={getColumns()}
                custLoading={custLoading}
                style={{ maxHeight: tableMaxHeight.fixedHeight }}
                searchCode={searchCode}
                searchBarRef={ref => {
                  supplyAbilitySearchRef = ref;
                }}
                searchBarConfig={{
                  onQuery: handleQuery,
                  left: {
                    render: renderLeftSearchBar,
                  },
                  editorProps: getEditorProps(),
                  fieldProps: getFieldProps(),
                  onFieldChange: handleFieldChange,
                }}
              />
            )}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbility'],
  }),
  remotes(
    {
      code: 'SSLM_SUPPLY_ABILITY_MASTER_DATA_PURCHASER',
    },
    {
      events: {
        cuxHandleFieldChange() {}, // 筛选器onFieldChange
      },
    }
  ),
  WithCustomize({
    unitCode: [
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_TABLE',
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.ITEM_TABLE',
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_BTNS',
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.ITEM_BTNS',
    ],
  }),
  withProps(
    () => {
      const abilitySupplierDs = new DataSet(getSupplierAbilityDs());
      const abilityItemDs = new DataSet(getItemAbilityDs());
      const mixObj = {
        dimension: 'SUPPLIER', // 供应商初始维度
      };
      return { abilitySupplierDs, abilityItemDs, mixObj };
    },
    { cacheState: true }
  )
)(Index);
