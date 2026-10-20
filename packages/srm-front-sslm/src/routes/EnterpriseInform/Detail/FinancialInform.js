/**
 * FinancialInform - 财务信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import { isNumber, sum, round, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { getEditTableData, getCurrentLanguage } from 'utils/utils';
import { Input, Form, Button, InputNumber } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const language = getCurrentLanguage();
const locale = language?.replace('_', '-');
@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryCompanyFinance`],
  saveLoading:
    loading.effects[`enterpriseInform/saveFinancialList`] ||
    loading.effects[`enterpriseInform/queryCompanyFinance`],
}))
@Form.create({ fieldNameProp: null })
export default class FinancialInform extends Component {
  constructor(props) {
    super(props);
    const { supplierFlag = 1 } = props;
    this.defaultRowKey = supplierFlag === 0 ? 'comFinanceReqId' : 'financeReqId';
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleCompanyFinance();
  }

  /**
   * 查询平台级银行信息
   */
  @Bind()
  handleCompanyFinance() {
    const {
      dispatch,
      changeReqId,
      companyId,
      supplierCompanyId,
      supplierFlag = 1,
      customizeUnitCode,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryCompanyFinance',
      payload: {
        changeReqId,
        companyId,
        supplierCompanyId,
        supplierFlag,
        customizeUnitCode,
        customizeTenantId,
      },
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const {
      enterpriseInform: { companyFinanceList = [] },
    } = this.props;
    const params = getEditTableData(companyFinanceList, [this.defaultRowKey]);
    const isEditing = !!companyFinanceList.find(
      d => d._status === 'create' || d._status === 'update'
    );

    if (isEditing) {
      if (Array.isArray(params) && params.length !== 0) {
        // 处理语言环境切换
        const newFinanceData = params.map(n => {
          const {
            totalAssets,
            totalLiabilities,
            currentAssets,
            currentLiabilities,
            revenue,
            netProfit,
          } = n;
          const obj = {
            totalAssets: language === 'en_US' ? round(totalAssets * 100, 2) : totalAssets,
            totalLiabilities:
              language === 'en_US' ? round(totalLiabilities * 100, 2) : totalLiabilities,
            currentAssets: language === 'en_US' ? round(currentAssets * 100, 2) : currentAssets,
            currentLiabilities:
              language === 'en_US' ? round(currentLiabilities * 100, 2) : currentLiabilities,
            revenue: language === 'en_US' ? round(revenue * 100, 2) : revenue,
            netProfit: language === 'en_US' ? round(netProfit * 100, 2) : netProfit,
          };
          return {
            ...n,
            ...obj,
          };
        });
        return newFinanceData;
      } else {
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 批量保存数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      changeReqId,
      companyId,
      supplierFlag = 1,
      source = '',
      customizeUnitCode,
    } = this.props;
    const companyFinanceList = this.checkData();

    if (companyFinanceList) {
      dispatch({
        type: 'enterpriseInform/saveFinancialList',
        payload: {
          supplierFlag,
          dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
          changeReqId,
          companyId,
          [supplierFlag === 0 ? 'companyFinanceList' : 'supFinanceReqs']: companyFinanceList,
          customizeUnitCode,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleCompanyFinance();
        }
      });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      enterpriseInform: { companyFinanceList = [] },
      partnerTenantId = '-1',
    } = this.props;
    const newLine =
      partnerTenantId !== '-1'
        ? {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            totalAssets: 0,
            totalLiabilities: 0,
            currentAssets: 0,
            currentLiabilities: 0,
            revenue: 0,
            netProfit: 0,
            currentRatio: 0,
            assetLiabilityRatio: 0,
            totalAssetsEarningsRatio: 0,
            year: '',
            tenantId: partnerTenantId,
          }
        : {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            totalAssets: 0,
            totalLiabilities: 0,
            currentAssets: 0,
            currentLiabilities: 0,
            revenue: 0,
            netProfit: 0,
            currentRatio: 0,
            assetLiabilityRatio: 0,
            totalAssetsEarningsRatio: 0,
            year: '',
          };
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        companyFinanceList: [newLine, ...companyFinanceList],
      },
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const {
      dispatch,
      enterpriseInform: { companyFinanceList = [] },
    } = this.props;
    const newCompanyFinanceList = companyFinanceList.filter(
      n => n[this.defaultRowKey] !== record[this.defaultRowKey]
    );
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        companyFinanceList: newCompanyFinanceList,
      },
    });
  }

  /**
   * 使当前行变成可编辑状态
   * @param {object} record 当前行记录
   * @param {boolean} flag 编辑状态
   */
  @Bind()
  handleEdit(flag, record) {
    const {
      dispatch,
      enterpriseInform: { companyFinanceList = [] },
    } = this.props;
    const newCompanyFinanceList = companyFinanceList.map(item => {
      if (item[this.defaultRowKey] === record[this.defaultRowKey]) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        companyFinanceList: newCompanyFinanceList,
      },
    });
  }

  /**
   * 选中项发生变化时的回调
   */
  // @Bind()
  // handleSelectChange(selectedRowKeys) {
  //   this.setState({ selectedRowKeys });
  // }

  render() {
    // const { selectedRowKeys } = this.state;
    const {
      pubEdit,
      enterpriseInform: { companyFinanceList = [] },
      changFlag,
      queryLoading,
      supplierFlag = 1,
      source = '',
      saveLoading,
      customizeTable,
      customizeUnitCode,
      partnerTenantId = '-1',
    } = this.props;

    const platformFlag = source === 'enterprise' && supplierFlag === 0;
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.handleSelectChange,
    // };
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.year').d('年份'),
        dataIndex: 'year',
        width: 100,
        align: 'left',
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('year', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sslm.enterpriseInform.view.model.financial.year').d('年份'),
                      }),
                    },
                    {
                      pattern: /([1-9])([0-9]{3})/,
                      message: intl
                        .get('sslm.enterpriseInform.view.message.warning')
                        .d('年份格式不正确'),
                    },
                  ],
                  initialValue: record.year,
                })(<Input disabled={changFlag} inputChinese={false} maxLength={4} />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.model.supplierInform.currencyName').d('币种'),
        dataIndex: 'currencyName',
        width: 140,
        align: 'left',
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('currencyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.model.supplierInform.currencyName')
                          .d('币种'),
                      }),
                    },
                  ],
                  initialValue: record.currencyId,
                })(
                  <Lov
                    code={platformFlag ? 'HPFM.CURRENCY' : 'SMDM.CURRENCY'}
                    disabled={changFlag}
                    textValue={record.currencyName}
                    lovOptions={{
                      displayField: 'currencyName',
                      valueField: 'currencyId',
                    }}
                    queryParams={{ tenantId: platformFlag ? undefined : partnerTenantId }}
                  />
                )}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.financial.totalAssets')
          .d('企业总资产(万)'),
        dataIndex: 'totalAssets',
        width: 180,
        align: 'right',
        render: (text, record) => {
          const formatValue = language === 'en_US' ? (text ? round(text / 100, 4) : text) : text;
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('totalAssets', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.financial.totalAssets')
                          .d('企业总资产(万)'),
                      }),
                    },
                  ],
                  initialValue: formatValue,
                })(<InputNumber allowThousandth disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return (
              formatValue &&
              parseFloat(formatValue).toLocaleString(locale, { maximumFractionDigits: 4 })
            );
          }
        },
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.financial.totalLiabilities')
          .d('总负债(万)'),
        dataIndex: 'totalLiabilities',
        width: 180,
        align: 'right',
        render: (text, record) => {
          const formatValue = language === 'en_US' ? (text ? round(text / 100, 4) : text) : text;
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('totalLiabilities', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.financial.totalLiabilities')
                          .d('总负债(万)'),
                      }),
                    },
                  ],
                  initialValue: formatValue,
                })(<InputNumber allowThousandth disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return (
              formatValue &&
              parseFloat(formatValue).toLocaleString(locale, { maximumFractionDigits: 4 })
            );
          }
        },
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.financial.currentAssets')
          .d('流动资产(万)'),
        dataIndex: 'currentAssets',
        width: 180,
        align: 'right',
        render: (text, record) => {
          const formatValue = language === 'en_US' ? (text ? round(text / 100, 4) : text) : text;
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('currentAssets', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.financial.currentAssets')
                          .d('流动资产(万)'),
                      }),
                    },
                  ],
                  initialValue: formatValue,
                })(<InputNumber allowThousandth disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return (
              formatValue &&
              parseFloat(formatValue).toLocaleString(locale, { maximumFractionDigits: 4 })
            );
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.liabilities').d('流动负债(万)'),
        dataIndex: 'currentLiabilities',
        width: 180,
        align: 'right',
        render: (text, record) => {
          const formatValue = language === 'en_US' ? (text ? round(text / 100, 4) : text) : text;
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('currentLiabilities', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.financial.liabilities')
                          .d('流动负债(万)'),
                      }),
                    },
                  ],
                  initialValue: formatValue,
                })(<InputNumber allowThousandth disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return (
              formatValue &&
              parseFloat(formatValue).toLocaleString(locale, { maximumFractionDigits: 4 })
            );
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.revenue').d('营业收入(万)'),
        dataIndex: 'revenue',
        width: 180,
        align: 'right',
        render: (text, record) => {
          const formatValue = language === 'en_US' ? (text ? round(text / 100, 4) : text) : text;
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('revenue', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.financial.revenue')
                          .d('营业收入(万)'),
                      }),
                    },
                  ],
                  initialValue: formatValue,
                })(<InputNumber allowThousandth disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return (
              formatValue &&
              parseFloat(formatValue).toLocaleString(locale, { maximumFractionDigits: 4 })
            );
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.netProfit').d('净利润(万)'),
        dataIndex: 'netProfit',
        width: 180,
        align: 'right',
        render: (text, record) => {
          const formatValue = language === 'en_US' ? (text ? round(text / 100, 4) : text) : text;
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('netProfit', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.financial.netProfit')
                          .d('净利润(万)'),
                      }),
                    },
                  ],
                  initialValue: formatValue,
                })(<InputNumber allowThousandth disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return (
              formatValue &&
              parseFloat(formatValue).toLocaleString(locale, { maximumFractionDigits: 4 })
            );
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.assetRatio').d('资产负债率'),
        dataIndex: 'assetLiabilityRatio',
        width: 180,
        align: 'left',
        render: (text, record) =>
          record.assetLiabilityRatio ? (
            <span>{`${(record.assetLiabilityRatio * 100).toFixed(2)}%`}</span>
          ) : (
            <span>--</span>
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.currentRatio').d('流动比率'),
        dataIndex: 'currentRatio',
        align: 'left',
        width: 180,
        render: (text, record) => {
          return record.currentRatio > 0 ? (
            <div>{`${(record.currentRatio * 100).toFixed(2)}%`}</div>
          ) : (
            <div>--</div>
          );
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.financial.totalRatio').d('总资产收益率'),
        dataIndex: 'totalAssetsEarningsRatio',
        align: 'left',
        width: 180,
        render: (text, record) => {
          return record.totalAssetsEarningsRatio > 0 ? (
            <div>{`${(record.totalAssetsEarningsRatio * 100).toFixed(2)}%`}</div>
          ) : (
            <div>--</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('remark', {
                  initialValue: record.remark,
                })(<Input disabled={changFlag} dbc2sbc={false} />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'options',
        width: 80,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a
                disabled={pubEdit ? !pubEdit : changFlag}
                onClick={() => this.handleEdit(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Fragment>
        <div
          style={{ textAlign: 'right', paddingBottom: 16, display: changFlag ? 'none' : 'block' }}
        >
          <Button onClick={this.handleSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={this.handleAdd}
            loading={saveLoading}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
              clearCache: (a, b, cb) => {
                if (a !== b) cb(a);
              },
              useNewValid: true,
            },
            <EditTable
              bordered
              columns={columns}
              rowKey={this.defaultRowKey}
              // rowSelection={rowSelection}
              dataSource={companyFinanceList}
              scroll={{ x: scrollX }}
              loading={queryLoading}
              pagination={false}
            />
          )
        ) : (
          <EditTable
            bordered
            columns={columns}
            rowKey={this.defaultRowKey}
            // rowSelection={rowSelection}
            dataSource={companyFinanceList}
            scroll={{ x: scrollX }}
            loading={queryLoading}
            pagination={false}
          />
        )}
      </Fragment>
    );
  }
}
