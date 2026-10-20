/**
 * FinanceInfo - 企业注册-财务信息
 * @date: 2018-7-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Icon } from 'hzero-ui';
import { Table, DataSet, TextField } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import financeDS from '../store/financeDS';

const language = getCurrentLanguage();

/**
 * 企业注册财务信息列表
 * @extends {Component} - React.Component
 * @reactProps {Object} financeInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['spfm.finance', 'spfm.common'],
})
@connect(({ financeInfo, loading }) => ({
  financeInfo,
  fetchLoading: loading.effects['financeInfo/fetchFinanceInfo'],
}))
@withRouter
export default class FinanceList extends PureComponent {
  /**
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
    };
  }

  financeDS = new DataSet({
    ...financeDS(),
    autoQuery: false,
    transport: {
      destroy: ({ data }) => {
        this.remove(data);
      },
      submit: ({ dataSet, data }) => {
        if (!dataSet.destroyed.length) {
          this.saveAllData(data);
        }
      },
    },
  });

  /**
   * 挂载后执行方法
   */
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.refresh();
  }

  /**
   * 刷新数据
   */
  @Bind()
  refresh() {
    const { dispatch, companyId } = this.props;
    if (companyId && companyId !== 'undefined') {
      const payload = {
        companyId,
      };
      dispatch({
        type: 'financeInfo/fetchFinanceInfo',
        payload,
      }).then(() => {
        const {
          financeInfo: { data = [] },
        } = this.props;
        this.financeDS.loadData(data);
      });
    }
  }

  /**
   * 删除
   */
  @Bind()
  remove(deleteRows) {
    const { dispatch, companyId } = this.props;
    if (deleteRows.length > 0) {
      dispatch({
        type: 'financeInfo/deleteFinanceInfo',
        payload: {
          deleteRows,
          companyId,
        },
      }).then((response) => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    } else {
      this.refresh();
      notification.success();
    }
  }

  /**
   * 批量保存数据
   */
  @Bind()
  async saveAllData(params) {
    const { dispatch, companyId } = this.props;
    const flag = await this.financeDS.validate();
    if (Array.isArray(params) && params.length !== 0 && flag) {
      // 处理语言环境切换
      const newParams = params.map((n) => {
        const {
          totalAssets,
          totalLiabilities,
          currentAssets,
          currentLiabilities,
          revenue,
          netProfit,
        } = n;
        const obj = {
          totalAssets: language === 'en_US' ? totalAssets * 100 : totalAssets,
          totalLiabilities: language === 'en_US' ? totalLiabilities * 100 : totalLiabilities,
          currentAssets: language === 'en_US' ? currentAssets * 100 : currentAssets,
          currentLiabilities: language === 'en_US' ? currentLiabilities * 100 : currentLiabilities,
          revenue: language === 'en_US' ? revenue * 100 : revenue,
          netProfit: language === 'en_US' ? netProfit * 100 : netProfit,
        };
        return {
          ...n,
          ...obj,
        };
      });
      dispatch({
        type: 'financeInfo/addFinanceInfo',
        payload: {
          companyId,
          arr: newParams,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.refresh();
        }
      });
    }
  }

  @Bind()
  async handleNext() {
    const { callback, dispatch, companyId } = this.props;
    const flag = await this.financeDS.validate();
    const financeList = this.financeDS.toJSONData();
    // 处理语言环境切换
    const newFinanceData = financeList.map((n) => {
      const {
        totalAssets,
        totalLiabilities,
        currentAssets,
        currentLiabilities,
        revenue,
        netProfit,
      } = n;
      const obj = {
        totalAssets: language === 'en_US' ? totalAssets * 100 : totalAssets,
        totalLiabilities: language === 'en_US' ? totalLiabilities * 100 : totalLiabilities,
        currentAssets: language === 'en_US' ? currentAssets * 100 : currentAssets,
        currentLiabilities: language === 'en_US' ? currentLiabilities * 100 : currentLiabilities,
        revenue: language === 'en_US' ? revenue * 100 : revenue,
        netProfit: language === 'en_US' ? netProfit * 100 : netProfit,
      };
      return {
        ...n,
        ...obj,
      };
    });
    if (flag) {
      if (this.financeDS.created.length || this.financeDS.updated.length) {
        if (Array.isArray(financeList) && financeList.length !== 0) {
          dispatch({
            type: 'financeInfo/addFinanceInfo',
            payload: {
              companyId,
              arr: newFinanceData,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              if (callback) {
                callback();
              }
            }
          });
        }
      } else if (callback) {
        callback();
      }
    }
  }

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      fetchLoading,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      showButton = true,
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
    } = this.props;
    const { saving } = this.state;
    const columns = [
      {
        name: 'year',
        width: 120,
        align: 'left',
        editor: true && <TextField restrict="0-9" />,
      },
      {
        name: 'currencyLov',
        width: 140,
        editor: true,
      },
      {
        name: 'totalAssets',
        width: 180,
        align: 'left',
        editor: true,
      },
      {
        name: 'totalLiabilities',
        width: 180,
        align: 'left',
        editor: true,
      },
      {
        name: 'currentAssets',
        width: 180,
        align: 'left',
        editor: true,
      },
      {
        name: 'currentLiabilities',
        width: 180,
        align: 'left',
        editor: true,
      },
      {
        name: 'revenue',
        width: 180,
        align: 'left',
        editor: true,
      },
      {
        name: 'netProfit',
        width: 180,
        align: 'left',
        editor: true,
      },
      {
        name: 'assetLiabilityRatio',
        width: 180,
        align: 'left',
        renderer: ({ value }) =>
          value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
      },
      {
        name: 'currentRatio',
        align: 'left',
        width: 180,
        renderer: ({ value }) =>
          value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
      },
      {
        name: 'totalAssetsEarningsRatio',
        align: 'left',
        width: 180,
        renderer: ({ value }) =>
          value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
      },
      {
        name: 'remark',
        width: 200,
        align: 'left',
        editor: true,
      },
    ];
    return (
      <React.Fragment>
        <Table
          rowHeight={40}
          loading={fetchLoading}
          buttons={['add', 'save', 'delete']}
          dataSet={this.financeDS}
          columns={columns}
          pagination={false}
        />
        <div style={{ marginTop: 40, textAlign: 'right' }}>
          {previousCallback && (
            <Button type="primary" ghost onClick={this.handlePrevious} style={{ marginRight: 16 }}>
              {backBtnText}
            </Button>
          )}
          {showButton && (
            <Button type="primary" onClick={() => this.handleNext()}>
              {saving && <Icon type="loading" />}
              {buttonText}
            </Button>
          )}
        </div>
      </React.Fragment>
    );
  }
}
