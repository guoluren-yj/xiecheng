/* eslint-disable jsx-a11y/label-has-for */
/**
 * 广域寻源也页面
 * @author: qingxiang.luo@going-link.com
 * @data: 2021-08-13
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, DataSet } from 'choerodon-ui/pro';
import { Rate, Tooltip, message } from 'choerodon-ui';
import { Select } from 'hzero-ui';
import classNames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getResponse, getCurrentUser } from 'utils/utils';
import { WideAreaListDS } from '@/stores/wideAreaDS';
import { getUrlParam } from '@/utils/utils';
import { fetchGoodsList } from '@/services/wideAreaService';
import AutoComplete from '@/components/AutoComplete';
import ListTable from './ListTable';
import SortSelector from './SortSelector';
import DropDownSelect from './DropDownSelect';

import './index.less';

const { Option } = Select;

@formatterCollections({
  code: ['spfm.wideArea', 'srm.filterBar'],
})
@connect(({ wideAreaSource, loading }) => ({
  wideAreaSource,
  propsInputMsg: wideAreaSource.inputMsg,
  goodsList: wideAreaSource.goodsList,
  pagination: wideAreaSource.pagination,
  dataSource: wideAreaSource.dataSource,
  bestSellingGoods: wideAreaSource.bestSellingGoods,
  areaCodeList: wideAreaSource.areaCodeList,
  capitalTypeList: wideAreaSource.capitalTypeList,
  listLoading: loading.effects['wideAreaSource/fetchList'],
}))
@withProps(
  () => {
    const wideAreaListDS = new DataSet({ ...WideAreaListDS() });
    return { wideAreaListDS };
  },
  { cacheState: true }
)
class WideAreaSourcing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowCount: false, // 是否展示查询数据总数
      inputMsg: '',
      selectedItem: null,
      loginName: getCurrentUser()?.loginName ?? '',
      sortType: 'DESC',
    };
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  async componentDidMount() {
    const { dataSource, propsInputMsg, goodsList, dispatch } = this.props;

    document.addEventListener('keydown', this.handleKeyDown);

    // 查询值集列表
    const codeParam = {
      bestSellingGoods: 'SPFM.BEST_SELLING_GOODS.LIST',
      areaCodeList: 'SPFM.WIDE_AREA_LIST',
      capitalTypeList: 'SPFM.REGISTERED_CAPITAL',
    };

    dispatch({
      type: 'wideAreaSource/initFilterValuesJson',
      payload: {
        ...codeParam,
      },
    });

    const params = getUrlParam();

    // 查询列表
    if (params.goodsName && params.goodsName !== 'text' && propsInputMsg) {
      this.setState({ inputMsg: params.goodsName ?? '' });

      if (dataSource.length) {
        // 缓存内有数据 不需要重新查询
        this.setState({
          isShowCount: true,
        });
      } else {
        const paramObj = {
          searchName: params.goodsName,
          contentSearch: params.goodsName,
          loginName: this.state.loginName,
          realName: getCurrentUser()?.realName ?? '',
          type: goodsList.length > 0 ? 1 : 0,
          sortType: this.state.sortType,
          customerName: getCurrentUser()?.tenantName || '',
        };

        this.fetchDsList(paramObj);
      }

      this.handleSaveGoodsName('');
    } else {
      // 非详情返回页面情况下 清空缓存的数据
      this.props.dispatch({
        type: 'wideAreaSource/updateState',
        payload: {
          dataSource: [],
          pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: true,
            total: 0,
          },
        },
      });
    }
  }

  /**
   * 进入供应商详情页面
   * @param {object} record
   */
  @Bind()
  handleOpenDetail(record) {
    const { inputMsg } = this.state;

    this.handleSaveGoodsName(inputMsg);
    this.handleSaveDataList();

    if (record.xsfnsrsbh) {
      this.props.history.push(
        `/spfm/wide-area-sourcing/detail/${record.xsfnsrsbh}/${record.xsfmc}/${inputMsg || 'text'}`
      );
    }
  }

  get columns() {
    return [
      {
        title: intl.get(`spfm.wideArea.modal.companyName`).d('公司名称'),
        dataIndex: 'xsfmc',
        width: 400,
        render: (text, record) => {
          return <a onClick={() => this.handleOpenDetail(record)}>{text}</a>;
        },
      },
      {
        title: intl.get(`spfm.wideArea.modal.operatingIndexScore`).d('经营指数评分'),
        dataIndex: 'final_score',
        align: 'right',
        width: 200,
        render: (text) => {
          const sum = parseFloat(text || 0);
          const count = sum <= 550 ? 1 : sum <= 650 && sum > 550 ? 2 : 3;

          const title =
            count === 3
              ? intl.get('spfm.wideArea.view.tag.well').d('优秀')
              : count === 2
              ? intl.get('spfm.wideArea.view.tag.normal').d('良好')
              : intl.get('spfm.wideArea.view.tag.serious').d('一般');

          return sum > 0 ? (
            <Tooltip title={title}>
              <span
                style={{
                  display: 'inline-block',
                  width: '160px',
                  textAlign: 'right',
                  lineHeight: '15px',
                  paddingBottom: '5px',
                }}
              >
                <span style={{ display: 'inline-block', width: '80px' }}>
                  <Rate
                    style={{ color: count === 1 ? '#F56349' : count === 2 ? '#FCA000' : '#47B881' }}
                    count={count}
                    value={count}
                    disabled
                  />
                </span>
                <span style={{ display: 'inline-block', width: '70px', paddingRight: '5px' }}>
                  {text}
                </span>
              </span>
            </Tooltip>
          ) : null;
        },
      },
      {
        title: intl.get(`spfm.wideArea.modal.localArea`).d('所在地区'),
        dataIndex: 'province_code',
        width: 200,
        render: (_, record) => {
          return this.handleGetArea(record.province_code);
        },
      },
      {
        title: intl.get(`spfm.wideArea.modal.registeredCapitalWithUnit`).d('注册资本'),
        dataIndex: 'regist_capi',
        align: 'right',
        width: 200,
        render: (text) => {
          return parseFloat(text) > 0 ? `${(parseFloat(text) / 10000)?.toFixed(2)}万` : '-';
        },
      },
      {
        title: intl.get(`spfm.wideArea.modal.creationDate`).d('成立日期'),
        dataIndex: 'start_date',
        align: 'center',
      },
    ];
  }

  /**
   * 根据地区编码 获取含义
   * @param {string} areaCode
   */
  @Bind()
  handleGetArea(areaCode = '') {
    const { areaCodeList = [] } = this.props;
    let areaName = '';
    areaCodeList.forEach((item) => {
      if (item.value === areaCode) {
        areaName = item.meaning;
      }
    });
    return areaName;
  }

  @Bind()
  drawTagList(record) {
    const { inputMsg } = this.state;
    const top5List = record?.get('goodClassTop5')?.split(',') ?? [];
    const highlightList = [];
    const normalList = [];

    if (top5List.length) {
      top5List.forEach((item) => {
        if (inputMsg && item.includes(inputMsg)) {
          highlightList.push({
            value: item,
            highlight: true,
          });
        } else {
          normalList.push({
            value: item,
          });
        }
      });
    }

    const tagList = highlightList.concat(normalList); // 拼接作排序

    return tagList.map((item, index) => {
      const highLightClass = item.highlight ? 'tag-item-1' : 'tag-item-3';
      return (
        <span className={classNames('tag-item', highLightClass)} key={index.toString()}>
          {item.value}
        </span>
      );
    });
  }

  @Bind()
  handleSelected(item) {
    const queryParams = this.props.wideAreaListDS.queryDataSet.toData()[0];
    const { capitalType = '', areaCode = '' } = queryParams;

    const params = {
      loginName: this.state.loginName,
      realName: getCurrentUser()?.realName ?? '',
      searchName: item.value,
      contentSearch: this.state.inputMsg,
      type: this.props.goodsList.length > 0 ? 1 : 0,
      customerName: getCurrentUser()?.tenantName || '',
      sortType: this.state.sortType,
      areaCode,
      capitalType,
    };

    this.setState({ selectedItem: item });
    this.fetchDsList(params);
  }

  /**
   * 选择商品提示列表进行查询
   * @param {*} item
   */
  @Bind()
  handlePromptSelected(item) {
    const queryParams = this.props.wideAreaListDS.queryDataSet.toData()[0];
    const { capitalType = '', areaCode = '' } = queryParams;

    const params = {
      loginName: this.state.loginName,
      realName: getCurrentUser()?.realName ?? '',
      searchName: item.value,
      contentSearch: item.value,
      type: this.props.goodsList.length > 0 ? 1 : 0,
      customerName: getCurrentUser()?.tenantName || '',
      sortType: this.state.sortType,
      areaCode,
      capitalType,
    };

    this.setState({ selectedItem: item });
    this.fetchDsList(params);
  }

  @Bind()
  handleSaveGoodsName(inputMsg) {
    this.props.dispatch({
      type: 'wideAreaSource/updateState',
      payload: {
        inputMsg,
      },
    });
  }

  /**
   * 进入详情缓存当前页数据
   */
  @Bind()
  handleSaveDataList() {
    const { wideAreaListDS, dispatch } = this.props;
    const list = wideAreaListDS.toData();

    dispatch({
      type: 'wideAreaSource/updateState',
      payload: {
        cacheList: list,
      },
    });
  }

  @Bind()
  handleSaveGoodsList(list) {
    this.props.dispatch({
      type: 'wideAreaSource/updateState',
      payload: {
        goodsList: list,
      },
    });
  }

  /**
   * 执行查询操作
   * @param {*} params
   */
  @Bind()
  fetchDsList(params, page = {}) {
    this.props
      .dispatch({
        type: 'wideAreaSource/fetchList',
        payload: {
          ...params,
          ...page,
        },
      })
      .then((res) => {
        if (getResponse(res)) {
          message.success(
            intl.get('spfm.wideArea.view.select.count', {
              name: res.totalElements || 0,
            }),
            undefined,
            undefined,
            'top'
          );
        }
        this.setState({
          isShowCount: true,
        });
      });
  }

  /**
   * 自动补全列表查询
   * @param {*} str
   * @returns
   */
  @Bind()
  async fetchSuggestions(str) {
    const list = [];
    this.setState({
      selectedItem: null,
    });

    if (!str) {
      this.handleSaveGoodsList([]);
      return [];
    }

    const result = await fetchGoodsList({
      keyword: str,
      limit: 13,
      customerName: getCurrentUser()?.tenantName || '',
    });

    if (result && result.code === '00000') {
      const dataSrr = result?.data ?? [];

      dataSrr.forEach((item) => {
        list.push({
          value: item?.sp_name_search?.replace(/<[^>]+>/g, '') ?? '',
          originalValue: item?.sp_name_search ?? '',
          count: item?.xf_count ?? 0,
        });
      });
    } else {
      notification.error({
        message: result?.message ?? intl.get('hzero.common.notification.error').d('操作失败'),
      });
    }

    this.handleSaveGoodsList(list);
    return list;
  }

  /**
   * 回车查询
   * @param {*} sortType
   */
  @Bind()
  handleQuery(sortType, pageParams) {
    const { inputMsg, loginName, selectedItem } = this.state;
    const queryParams = this.props.wideAreaListDS.queryDataSet.toData()[0];
    const { capitalType = '', areaCode = '' } = queryParams;

    if (inputMsg) {
      const params = {
        loginName,
        realName: getCurrentUser()?.realName ?? '',
        searchName: selectedItem?.value ?? inputMsg,
        contentSearch: inputMsg,
        type: this.props.goodsList.length > 0 ? 1 : 0,
        customerName: getCurrentUser()?.tenantName || '',
        sortType,
        areaCode,
        capitalType,
      };
      this.fetchDsList(params, pageParams);
    }
  }

  @Bind()
  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.handleQuery(this.state.sortType);
    }
  }

  /**
   * 输入内容改变
   * @param {*} value
   * 文本框内容为空时 清空查询条件中的数据
   */
  @Bind()
  handleInput(value) {
    if (!value) {
      this.handleSaveGoodsList([]);
    }
    this.handleSaveGoodsName(value);
    this.setState({ inputMsg: value });
  }

  @Bind()
  handleQuerySort(sortFieldCode, sortType) {
    this.setState({
      sortType,
    });
    // 排序查询
    this.handleQuery(sortType);
  }

  @Bind()
  getQueryOptions(optionList = []) {
    return optionList.length
      ? optionList.map((item) => {
          return (
            <Option key={item.value} value={item.value}>
              {item.meaning}
            </Option>
          );
        })
      : null;
  }

  /**
   * 切换地区
   * @param {string} value
   */
  @Bind()
  handleChangeArea(value = '') {
    const { sortType } = this.state;
    const { wideAreaListDS } = this.props;
    if (wideAreaListDS.queryDataSet.current) {
      wideAreaListDS.queryDataSet.current.set('areaCode', value);
    }
    this.handleQuery(sortType);
  }

  /**
   * 切换注册资本
   * @param {string} value
   */
  @Bind()
  handleChangeCapital(value = '') {
    const { sortType } = this.state;
    const { wideAreaListDS } = this.props;
    if (wideAreaListDS.queryDataSet.current) {
      wideAreaListDS.queryDataSet.current.set('capitalType', value);
    }
    this.handleQuery(sortType);
  }

  @Bind()
  listTableProps() {
    const { pagination, dataSource, listLoading } = this.props;

    return {
      loading: listLoading,
      columns: this.columns,
      dataSource,
      pagination: {
        ...pagination,
        onChange: (current, pageSize) => {
          this.handleQuery(this.state.sortType, { page: current, size: pageSize });
        },
        onShowSizeChange: (_, pageSize) => {
          this.handleQuery(this.state.sortType, { page: 1, size: pageSize });
        },
      },
    };
  }

  /**
   * 获取缓存的查询条件数据，用于详情页面返回数据的回填
   * 组件的 keyIndex 必须与查询条件字段名一致
   * @param {string} type
   * @returns
   */
  @Bind()
  getQueryParam(type) {
    const { areaCodeList, capitalTypeList } = this.props;
    let dataList = [];
    const rtnObj = {};

    const queryDataList = this.props.wideAreaListDS.queryDataSet.toData();
    const queryParam = queryDataList.length ? queryDataList[0] : {};

    if (type === 'areaCode') {
      dataList = [].concat(areaCodeList);
    } else {
      dataList = [].concat(capitalTypeList);
    }

    Object.keys(queryParam).forEach((item) => {
      dataList.forEach((item2) => {
        if (item2.value === queryParam[item]) {
          rtnObj[item] = item2.meaning;
        }
      });
    });

    return rtnObj[type] || '';
  }

  render() {
    const { areaCodeList, capitalTypeList, pagination } = this.props;
    const { sortType } = this.state;
    const fields = [
      {
        name: 'indexScore',
        label: intl.get('spfm.wideArea.view.title.operatingIndexScore').d('经营指数评分'),
      },
    ];

    return (
      <div>
        <Header title={intl.get('spfm.wideArea.view.title.wideAreaSource').d('广域寻源')} />
        <Content className="wide-area-content" style={{ minHeight: '650px' }}>
          <div className="banner-top">
            <div style={{ display: 'inline-block' }}>
              <AutoComplete
                width={860}
                value={this.state.inputMsg}
                fetchSuggestions={this.fetchSuggestions}
                onSelect={this.handleSelected}
                onPromptSelect={this.handlePromptSelected}
                onChange={this.handleInput}
                // promptList={bestSellingGoods}
                placeholder={intl
                  .get('spfm.wideArea.view.placeholder.productName')
                  .d('请输入商品名称查询')}
                suffix={
                  <Icon
                    type="search"
                    className="icon-search"
                    onClick={() => this.handleQuery(sortType)}
                  />
                }
              />
            </div>
          </div>
          <div className="search-count">
            {this.state.isShowCount && (
              <div style={{ paddingLeft: '5px' }}>
                {intl.get('spfm.wideArea.view.message.hasSearched').d('已为你找到')}
                <span>{pagination?.total ?? 0}</span>
                {intl.get('spfm.wideArea.view.message.countCompany').d('家公司')}
              </div>
            )}
          </div>

          <div className="search-bar">
            <DropDownSelect
              keyIndex="areaCode"
              allowClear
              label={intl.get(`spfm.wideArea.modal.localArea`).d('所在地区')}
              defaultValue={this.getQueryParam('areaCode')}
              optionList={areaCodeList}
              onSelect={this.handleChangeArea}
            />

            <DropDownSelect
              keyIndex="capitalType"
              allowClear
              label={intl.get(`spfm.wideArea.modal.registeredCapital`).d('注册资本')}
              defaultValue={this.getQueryParam('capitalType')}
              optionList={capitalTypeList}
              onSelect={this.handleChangeCapital}
              style={{ marginLeft: '20px' }}
            />

            <div className="wide-area-content-sort">
              <SortSelector
                sortFieldCode="indexScore"
                onSortQuery={this.handleQuerySort}
                fields={fields}
              />
            </div>
          </div>

          <ListTable {...this.listTableProps()} />
        </Content>
      </div>
    );
  }
}

export default WideAreaSourcing;
