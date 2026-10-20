/**
 * Period - 期间定义（平台级）
 * @date: 2018-7-10
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.5.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Tabs, Button } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Debounce, Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEBOUNCE_TIME } from 'utils/constants';
import {
  getCurrentOrganizationId,
  getDateFormat,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import FilterHeader from './FilterHeader';
import TableHeader from './TableHeader';
import PeriodCreate from './PeriodCreate';
import FilterLine from './FilterLine';
import TableLine from './TableLine';

/**
 * 租户期间定义组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} periodOrg - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 保存操作是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ periodOrg, loading }) => ({
  periodOrg,
  loading: {
    search: loading.effects['periodOrg/searchPeriodHeader'],
    searchLine: loading.effects['periodOrg/searchPeriodLine'],
    save:
      loading.effects['periodOrg/savePeriodHeader'] ||
      loading.effects['periodOrg/searchPeriodHeader'],
    savePeriod: loading.effects['periodOrg/savePeriod'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smdm.period'] })
export default class PeriodOrg extends Component {
  headerForm;

  lineForm;

  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    this.state = {
      periodItem: '',
    };
  }

  /**
   * componentDidMount
   * render后加载页面数据
   */
  componentDidMount() {
    this.handleSearchPeriodHeader();
    this.handleSearchPeriodLine();
  }

  /**
   * 会计期查询
   * @param {Object} fields - 查询参数
   * @param {?Object} fields.page - 分页查询参数
   * @param {String} [fields.periodSetName] - 会计期名称
   * @param {String} [fields.periodSetCode] - 会计期名称
   */
  @Bind()
  handleSearchPeriodHeader(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.headerForm)
      ? {}
      : filterNullValueObject(this.headerForm.getFieldsValue());
    dispatch({
      type: 'periodOrg/searchPeriodHeader',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 期间查询
   * @param {Object} fields - 查询参数
   * @param {?Object} fields.page - 分页查询参数
   * @param {?String} [fields.periodSetCode] - 会计期代码
   * @param {?String} [fields.periodName] - 期间
   * @param {?String} [fields.periodYear] - 年
   */
  @Bind()
  handleSearchPeriodLine(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.lineForm)
      ? {}
      : filterNullValueObject(this.lineForm.getFieldsValue());
    dispatch({
      type: 'periodOrg/searchPeriodLine',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 获取FilterForm中form对象
   * @param {object} ref - FilterForm组件
   */
  @Bind()
  handleBindHeaderRef(ref = {}) {
    this.headerForm = (ref.props || {}).form;
  }

  /**
   * 获取FilterForm中form对象
   * @param {object} ref - FilterForm组件
   */
  @Bind()
  handleBindLineRef(ref = {}) {
    this.lineForm = (ref.props || {}).form;
  }

  /**
   * 引用云级数据
   */
  @Bind()
  handleRefSiteData() {
    const { dispatch, tenantId, periodOrg } = this.props;
    const { pagination = {} } = periodOrg.periodHeader;
    dispatch({
      type: 'periodOrg/searchRefData',
      payload: {
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchPeriodHeader(pagination);
      }
    });
  }

  /**
   * 添加 - 会计期定义
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleAddPeriodHeader() {
    const { dispatch, periodOrg, tenantId } = this.props;
    const { list = [], pagination = {} } = periodOrg.periodHeader;
    dispatch({
      type: 'periodOrg/updateState',
      payload: {
        periodHeader: {
          ...periodOrg.periodHeader,
          list: [
            {
              periodSetId: uuidv4(),
              periodSetCode: '',
              periodSetName: '',
              enabledFlag: 1,
              periodTotalCount: 0,
              _status: 'create', // 新建标记
              tenantId,
            },
            ...list,
          ],
          pagination: addItemToPagination(list.length, pagination),
        },
      },
    });
  }

  /**
   * 保存：新增行保存、编辑行保存
   * 处于编辑状态的行才可进行保存
   */
  @Bind()
  handleSavePeriodHeader() {
    const { dispatch, periodOrg, tenantId } = this.props;
    const { list = [], pagination = {} } = periodOrg.periodHeader;
    const params = getEditTableData(list, ['periodSetId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'periodOrg/savePeriodHeader',
        payload: {
          tenantId,
          saveData: params || [],
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchPeriodHeader(pagination);
        }
      });
    }
  }

  /**
   * 清除新增会计期
   * @param {Object} record  操作对象
   */
  @Bind()
  handleCleanHeader(record) {
    const { dispatch, periodOrg } = this.props;
    const { list = [], pagination = {} } = periodOrg.periodHeader;
    const newList = list.filter((item) => item.periodSetId !== record.periodSetId);
    dispatch({
      type: 'periodOrg/updateState',
      payload: {
        periodHeader: {
          ...periodOrg.periodHeader,
          list: [...newList],
          pagination: delItemToPagination(list.length, pagination),
        },
      },
    });
  }

  /**
   * 变更编辑状态
   * @param {Object} record 操作对象
   * @param {Boolean} flag 可编辑标记
   */
  @Bind()
  handleChangeEditable(record, flag) {
    const { dispatch, periodOrg } = this.props;
    const { list } = periodOrg.periodHeader;
    const newList = list.map((item) =>
      item.periodSetId === record.periodSetId ? { ...item, _status: flag ? 'update' : '' } : item
    );
    dispatch({
      type: 'periodOrg/updateState',
      payload: {
        periodHeader: {
          ...periodOrg.periodHeader,
          list: [...newList],
        },
      },
    });
  }

  /**
   * 会计期的期间维护
   * @param {Object} record 操作对象
   */
  @Bind()
  handleCreateRule(record) {
    const {
      dispatch,
      tenantId,
      periodOrg: { periodHeader },
    } = this.props;
    if (record._status === 'update') {
      notification.warning({
        message: intl.get('smdm.period.view.message.edit').d('会计期处于编辑状态'),
      });
      return;
    }
    dispatch({
      type: 'periodOrg/searchPeriodRule',
      payload: {
        periodSetId: record.periodSetId,
        periodHeader,
        tenantId,
      },
    });
    this.setState({ periodItem: record, ruleModalVisible: true });
  }

  /**
   * 关闭期间维护弹窗
   */
  @Bind()
  handleCloseRuleModal() {
    this.setState({ ruleModalVisible: false });
  }

  /**
   * 期间维护弹窗-添加按钮
   */
  @Bind()
  handleAddPeriod() {
    const {
      dispatch,
      tenantId,
      periodOrg: { periodHeader },
    } = this.props;
    const { periodData = [] } = periodHeader;
    const { periodItem } = this.state;
    dispatch({
      type: 'periodOrg/updateState',
      payload: {
        periodHeader: {
          ...periodHeader,
          periodData: [
            {
              periodId: uuidv4(),
              periodYear: '',
              periodName: '',
              startDate: '',
              endDate: '',
              orderSeq: 0,
              periodQuarter: '',
              periodSetId: periodItem.periodSetId,
              enabledFlag: 1,
              _status: 'create',
              tenantId,
            },
            ...periodData,
          ],
        },
      },
    });
  }

  /**
   * 清除期间维护弹窗中新增的数据
   * @param {Object} record 期间维护行数据
   */
  @Bind()
  handleCleanLine(record) {
    const { dispatch, periodOrg } = this.props;
    const { periodData = [] } = periodOrg.periodHeader;
    const newPeriodData = periodData.filter((item) => item.periodId !== record.periodId);
    dispatch({
      type: 'periodOrg/updateState',
      payload: {
        periodHeader: {
          ...periodOrg.periodHeader,
          periodData: [...newPeriodData],
        },
      },
    });
  }

  /**
   * 更改期间维护弹窗中的行编辑状态
   * @param {Objet} record 期间维护行数据
   * @param {Boolean} flag 编辑标记
   */
  @Bind()
  handleChangeEditFlag(record, flag) {
    const { dispatch, periodOrg } = this.props;
    const { periodData } = periodOrg.periodHeader;
    const newPeriodData = periodData.map((item) =>
      item.periodId === record.periodId ? { ...item, _status: flag ? 'update' : '' } : item
    );
    dispatch({
      type: 'periodOrg/updateState',
      payload: {
        periodHeader: {
          ...periodOrg.periodHeader,
          periodData: [...newPeriodData],
        },
      },
    });
  }

  /**
   * 期间维护弹窗-保存
   * @param {Array} data 保存数据列表
   */
  @Bind()
  handleSavePeriod(data) {
    const {
      dispatch,
      tenantId,
      periodOrg: { periodHeader },
    } = this.props;
    const { periodItem } = this.state;
    dispatch({
      type: 'periodOrg/savePeriod',
      payload: {
        data,
        tenantId,
        // periodHeader,
        periodSetId: periodItem.periodSetId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch({
          type: 'periodOrg/updateState',
          payload: {
            periodHeader: {
              ...periodHeader,
              periodData: [...res],
            },
          },
        });
      }
    });
  }

  /**
   * 切换页面Tab
   * @param {String} activeKey 当前激活tab面板的 key
   */
  @Bind()
  handleChangeTag(activeKey) {
    if (activeKey === 'define') {
      this.setState({ display: 'block' });
    } else {
      this.setState({ display: 'none' });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, periodOrg, loading } = this.props;
    const { periodHeader, periodLine } = periodOrg;
    const { display, ruleModalVisible = false } = this.state;

    const filterHeader = {
      onSearch: this.handleSearchPeriodHeader,
      onRef: this.handleBindHeaderRef,
    };
    const listHeader = {
      form,
      loading: loading.search,
      pagination: periodHeader.pagination,
      dataSource: periodHeader.list,
      onCleanLine: this.handleCleanHeader,
      onChangeFlag: this.handleChangeEditable,
      onCreateRule: this.handleCreateRule,
      onSearch: this.handleSearchPeriodHeader,
    };
    const filterLine = {
      onSearch: this.handleSearchPeriodLine,
      onRef: this.handleBindLineRef,
    };
    const listLine = {
      loading: loading.searchLine,
      pagination: periodLine.pagination,
      dataSource: periodLine.list,
      onSearch: this.handleSearchPeriodLine,
    };
    const periodProps = {
      loading: loading.savePeriod,
      dateFormat: getDateFormat(),
      visible: ruleModalVisible,
      dataSource: periodHeader.periodData,
      onCancel: this.handleCloseRuleModal,
      onAddPeriod: this.handleAddPeriod,
      onCleanLine: this.handleCleanLine,
      onChangeFlag: this.handleChangeEditFlag,
      onSave: this.handleSavePeriod,
    };
    return (
      <Fragment>
        <Header title={intl.get('smdm.period.view.message.title').d('期间定义')}>
          <Button
            icon="plus"
            onClick={this.handleAddPeriodHeader}
            type="primary"
            style={{ display }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="save"
            onClick={this.handleSavePeriodHeader}
            style={{ display }}
            loading={loading.save}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="fork" onClick={this.handleRefSiteData} style={{ display }}>
            {intl.get('smdm.period.view.option.quote').d('引用云级数据')}
          </Button>
        </Header>
        <Content>
          <Tabs defaultActiveKey="define" onChange={this.handleChangeTag} animated={false}>
            <Tabs.TabPane
              tab={intl.get('smdm.period.view.message.tab.define').d('期间定义')}
              key="define"
            >
              <Fragment>
                <div className="table-list-search">
                  <FilterHeader {...filterHeader} />
                </div>
                <TableHeader {...listHeader} />
              </Fragment>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('smdm.period.view.message.tab.search').d('期间查询')}
              key="search"
            >
              <Fragment>
                <div className="table-list-search">
                  <FilterLine {...filterLine} />
                </div>
                <TableLine {...listLine} />
              </Fragment>
            </Tabs.TabPane>
          </Tabs>
        </Content>
        {ruleModalVisible && <PeriodCreate {...periodProps} />}
      </Fragment>
    );
  }
}
