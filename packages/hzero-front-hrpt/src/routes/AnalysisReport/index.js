/**
 * AnalysisReport - 采购额分析报表
 * @date: 2020-1-13
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Select } from 'hzero-ui';
import moment from 'moment';
import { createPagination } from 'utils/utils';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import FilterForm from './FilterForm';
import List from './List';

const { Option } = Select;
const modelPrompt = 'hrpt.analysisReport.model.analysisReport';

@connect(({ loading, analysisReport }) => ({
  analysisReport,
  fetchAnalysisReportLoading: loading.effects['analysisReport/fetchAnalysisReport'],
}))
@formatterCollections({ code: ['hrpt.analysisReport'] })
export default class Organization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAll: true,
      reportType: 'company', // 查询维度
      range: 5, // 柱状图范围
      filterValue: null, // 当前查询条件
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'analysisReport/fetchCode',
    });
    this.handleSearch();
  }

  // 报表查询
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const { range } = this.state;
    if (this.form) {
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const formatValues = {
            ...values,
            year: values.year ? moment(values.year).format('YYYY') : undefined,
          };
          dispatch({
            type: 'analysisReport/fetchAnalysisReport',
            payload: {
              page,
              ...formatValues,
            },
          }).then(res => {
            if (res) {
              const dataSource = (res.content || []).map(item => {
                return {
                  ...item,
                  date: this.formatDate(formatValues),
                };
              });
              dispatch({
                type: 'analysisReport/updateState',
                payload: {
                  dataSource,
                  pagination: createPagination(res),
                },
              });
              this.setState(
                {
                  reportType: this.form.getFieldValue('reportType'),
                  filterValue: values,
                },
                () => {
                  this.handleSearchHistogram(range);
                }
              );
            }
          });
        }
      });
    }
  }

  // 查询柱状图数据
  @Bind()
  handleSearchHistogram(range) {
    const { dispatch } = this.props;
    const { filterValue } = this.state;
    const formatValues = {
      ...filterValue,
      year: filterValue.year ? moment(filterValue.year).format('YYYY') : undefined,
    };
    dispatch({
      type: 'analysisReport/fetchAnalysisReportHistogram',
      payload: {
        ...formatValues,
        page: 0,
        size: range,
      },
    }).then(res => {
      if (res) {
        this.setState({ range });
      }
    });
  }

  // 列表时间字段
  @Bind()
  formatDate(formatValues) {
    const { year, month, season, timeDimension } = formatValues;
    const monthList = this.getDropDownList('month');
    const seasonList = this.getDropDownList('season');
    if (this.form) {
      switch (timeDimension) {
        case 'year':
          return `${year}${intl.get(`${modelPrompt}.year`).d('年')}`;
        case 'season':
          return `${year}${intl.get(`${modelPrompt}.year`).d('年')}${this.getMeaning(
            seasonList,
            season
          )}`;
        case 'month':
          return `${year}${intl.get(`${modelPrompt}.year`).d('年')}${this.getMeaning(
            monthList,
            month
          )}`;
        default:
          return null;
      }
    }
  }

  // 获取meaning
  @Bind()
  getMeaning(list = [], value) {
    const record = list.find(item => item.value === value) || {};
    return record.meaning;
  }

  // 获取下拉列表
  @Bind()
  getDropDownList(dimension) {
    const dropDownList = {
      season: [
        {
          value: 1,
          meaning: intl.get(`${modelPrompt}.firstQuarter`).d('第一季度'),
        },
        {
          value: 2,
          meaning: intl.get(`${modelPrompt}.secondQuarter`).d('第二季度'),
        },
        {
          value: 3,
          meaning: intl.get(`${modelPrompt}.thirdQuarter`).d('第三季度'),
        },
        {
          value: 4,
          meaning: intl.get(`${modelPrompt}.fourthQuarter`).d('第四季度'),
        },
      ],
      month: [
        {
          value: 1,
          meaning: intl.get(`${modelPrompt}.January`).d('一月'),
        },
        {
          value: 2,
          meaning: intl.get(`${modelPrompt}.February`).d('二月'),
        },
        {
          value: 3,
          meaning: intl.get(`${modelPrompt}.March`).d('三月'),
        },
        {
          value: 4,
          meaning: intl.get(`${modelPrompt}.April`).d('四月'),
        },
        {
          value: 5,
          meaning: intl.get(`${modelPrompt}.May`).d('五月'),
        },
        {
          value: 6,
          meaning: intl.get(`${modelPrompt}.June`).d('六月'),
        },
        {
          value: 7,
          meaning: intl.get(`${modelPrompt}.July`).d('七月'),
        },
        {
          value: 8,
          meaning: intl.get(`${modelPrompt}.August`).d('八月'),
        },
        {
          value: 9,
          meaning: intl.get(`${modelPrompt}.September`).d('九月'),
        },
        {
          value: 10,
          meaning: intl.get(`${modelPrompt}.October`).d('十月'),
        },
        {
          value: 11,
          meaning: intl.get(`${modelPrompt}.November`).d('十一月'),
        },
        {
          value: 12,
          meaning: intl.get(`${modelPrompt}.December`).d('十二月'),
        },
      ],
    };
    return dropDownList[dimension] || [];
  }

  // 获取柱状图范围下拉框
  @Bind()
  getSelect() {
    const { showAll } = this.state;
    const list = [
      {
        value: 200,
        meaning: intl.get(`${modelPrompt}.whole`).d('全部'),
      },
      {
        value: 5,
        meaning: intl.get(`${modelPrompt}.topFive`).d('前五'),
      },
      {
        value: 10,
        meaning: intl.get(`${modelPrompt}.topTen`).d('前十'),
      },
      {
        value: 20,
        meaning: intl.get(`${modelPrompt}.topTwenty`).d('前二十'),
      },
    ];
    return showAll ? list : list.filter(item => item.value !== 200);
  }

  // 不同维度控制柱状图范围全部项
  @Bind()
  handleChangeSelect(e) {
    const showAll = e === 'company';
    this.setState({
      showAll,
    });
  }

  render() {
    const { reportType, range } = this.state;
    const { analysisReport = {}, fetchAnalysisReportLoading } = this.props;
    const { code } = analysisReport;
    const SelectList = this.getSelect();
    const filterFormProps = {
      code,
      onRef: node => {
        this.form = node;
      },
      handleSearch: this.handleSearch,
      getDropDownList: this.getDropDownList,
      handleChangeSelect: this.handleChangeSelect,
    };
    const listProps = {
      reportType,
      analysisReport,
      getColumns: this.getColumns,
      fetchAnalysisReportLoading,
      handleSearch: this.handleSearch,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${modelPrompt}.reportQuery`).d('报表查询')}>
          <Select
            style={{ width: '80px', marginLeft: '8px' }}
            defaultValue={range}
            onChange={this.handleSearchHistogram}
          >
            {SelectList.map(item => (
              <Option value={item.value}>{item.meaning}</Option>
            ))}
          </Select>
          {intl.get(`${modelPrompt}.histogramRange`).d('柱状图范围')}
        </Header>
        <Content>
          <FilterForm {...filterFormProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
