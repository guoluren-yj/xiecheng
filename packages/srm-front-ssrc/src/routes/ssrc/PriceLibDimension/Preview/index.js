/**
 * TemplatePreview - 价格库模板预览
 * @date: 2020-08-04
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { DataSet, Table, Button, Tooltip } from 'choerodon-ui/pro';
import { Select } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { openTab, getTabFromKey, getActiveTabKey } from 'utils/menuTab';

import priceLibNew from '@/assets/priceLibNew.svg';
import { listLineDS } from './lineDS';
import style from './index.less';

import { fetchPriceLibHeaderConfig, fetchViewSwitchData } from '@/services/priceLibraryNewService';

@formatterCollections({ code: ['ssrc.priceLibrary', 'ssrc.common'] })
export default class TemplatePreview extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = this.props.match.params;
    this.state = {
      routerParams,
      columnList: [], // 动态列
      viewSwitchData: [], // 切换视图数据
      viewCode: '', // 当前视图
    };
  }

  tableDs = new DataSet(listLineDS());

  componentDidMount() {
    // 请求配置头
    this.fetchPriceLibHeaderConfig(this.tableDs);
  }

  // 查询视图配置选项
  @Bind()
  async fetchViewSwitch() {
    const result = getResponse(
      await fetchViewSwitchData({
        templateCode: this.state.routerParams.templateCode,
        latestFlag: 'P',
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      this.setState({
        viewSwitchData: result,
        viewCode: result[1] && result[1].viewCode,
      });
    }
  }

  /**
   * 渲染fieldType
   */
  @Bind()
  renderFieldType(field) {
    let fieldConfig = {};
    switch (field.fieldWidget) {
      case 'INPUT':
      case 'UPLOAD':
      case 'LINK':
      case 'LOV':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'YYYY/MM/DD hh:mm:ss' || field.dateFormat === 'YYYY-MM-DD hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: field.dateFormat,
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
        };
        break;
      default:
        break;
    }
    return fieldConfig;
  }

  /**
   * 渲染queryFieldType
   * 链接，上传，不可作查询条件
   */
  @Bind()
  renderQueryFieldType(field) {
    let queryFieldConfig = {};
    switch (field.fieldWidget) {
      case 'INPUT':
        queryFieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT_NUMBER':
        queryFieldConfig = {
          type: 'number',
          range: ['start', 'end'],
        };
        break;
      case 'SELECT':
        queryFieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1 ? ',' : false,
        };
        break;
      case 'LOV':
        queryFieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1,
          transformRequest: (value) =>
            value &&
            (Number(field.multipleFlag) === 1
              ? value.map((item) => item[field.valueField])
              : value[field.valueField]),
        };
        break;
      case 'DATE_PICKER':
        queryFieldConfig = {
          type:
            field.dateFormat === 'YYYY/MM/DD hh:mm:ss' || field.dateFormat === 'YYYY-MM-DD hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: field.dateFormat,
          range: ['start', 'end'],
          transformRequest: (val) => {
            if (val) {
              Object.assign(val, {
                start: val.start && moment(val.start).format('YYYY-MM-DD 00:00:00'),
                end: val.end && moment(val.end).format('YYYY-MM-DD 23:59:59'),
              });
            }
            return val;
          },
        };
        break;
      case 'SWITCH':
        queryFieldConfig = {
          type: 'string',
          lookupCode: 'HPFM.FLAG',
        };
        break;
      default:
        queryFieldConfig = {
          type: 'string',
        };
        break;
    }
    return queryFieldConfig;
  }

  /**
   * 查询头
   */
  @Bind()
  async fetchPriceLibHeaderConfig(ds, relevantPriceParams) {
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: this.state.routerParams.templateCode,
        relevantPriceFlag: relevantPriceParams ? 1 : 0,
        latestFlag: 'P',
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const queryFromDs = new DataSet();
      const columnList = [];
      list.forEach((item) => {
        const name =
          item.fieldWidget === 'LOV' ? `${item.dimensionCode}Meaning` : item.dimensionCode;
        // const name = item.dimensionCode;
        if (Number(item.fieldVisible)) {
          ds.addField(name, {
            name,
            label: item.dimensionName,
            ...this.renderFieldType(item),
          });
        }
        if (item.queryFlag) {
          queryFromDs.addField(item.dimensionCode, {
            name: item.dimensionCode,
            label: item.dimensionName,
            ...this.renderQueryFieldType(item),
          });
        }
        if (Number(item.fieldVisible)) {
          // 当前日期距离有效期至小于等于30天时，报价有效期从和至标红显示
          columnList.push({
            name,
            width: item.gridWidth,
            tooltip: 'overflow',
          });
        }
      });
      Object.assign(ds, { queryDataSet: queryFromDs });
      this.setState({ columnList });
      // 查询视图配置
      const res = getResponse(
        await fetchViewSwitchData({
          templateCode: this.state.routerParams.templateCode,
          latestFlag: 'P',
        })
      );
      if (res && Array.isArray(res) && res.length > 1) {
        this.setState({
          viewSwitchData: res,
          viewCode: res[1] && res[1].viewCode,
        });
        ds.setQueryParameter('viewCode', res[1] && res[1].viewCode);
      } else if (res.length === 1) {
        ds.setQueryParameter('viewCode', res[0].viewCode);
        if (ds.queryDataSet.current && ds.queryDataSet.getField('priceLibraryStatus')) {
          ds.queryDataSet.current.set('priceLibraryStatus', 'VALID');
        }
      }
    }
  }

  /**
   * 跳转手工创建&更新页面
   */
  @Bind()
  jumpPriceLibCreate() {
    let selectedRowKeys = [];
    if (!isEmpty(this.tableDs.selected)) {
      selectedRowKeys = this.tableDs.selected.map((item) => item.toData().priceLibId);
    }

    // 根据tab key获取tab信息
    const tab = getTabFromKey(getActiveTabKey());
    const tempArr = tab.title ? tab.title.split('-') : [];
    tempArr.pop();
    const prefixTitle = tempArr.join('-');
    // this.props.history.push({
    //   key: tab.key,
    //   path: `/ssrc/price-lib-dimension-org/update-preview/${this.state.routerParams.templateCode}`,
    //   search: `?priceLibIds=${selectedRowKeys}`,
    // });
    openTab({
      key: `/ssrc/price-lib-dimension-org/update-preview/${this.state.routerParams.templateCode}`,
      path: `/ssrc/price-lib-dimension-org/update-preview/${this.state.routerParams.templateCode}`,
      title: `${prefixTitle}
      -${intl.get('ssrc.common.view.message.tab.maintainPreview').d('维护预览')}`,
      search: `?priceLibIds=${selectedRowKeys}`,
    });
  }

  /**
   * 获取table列
   */
  get columns() {
    return [
      ...this.state.columnList,
      // {
      //   name: 'operation',
      //   width: 120,
      //   renderer: ({ record }) => (
      //     <a onClick={() => this.showOperation(record)}>
      //       {intl.get('hzero.common.button.view').d('查看')}
      //     </a>
      //   ),
      // },
    ];
  }

  /**
   * 切换视图
   */
  @Bind()
  handleViewSelectChange(value) {
    this.setState({
      viewCode: value,
    });
    // 全量视图下，价格库状态查询条件，默认为有效
    if (value === 'ALL_VIEW' && this.tableDs.queryDataSet.current) {
      this.tableDs.queryDataSet.current.set('priceLibraryStatus', 'VALID');
    } else if (value !== 'ALL_VIEW' && this.tableDs.queryDataSet.current) {
      this.tableDs.queryDataSet.current.set('priceLibraryStatus', undefined);
    }
    this.tableDs.setQueryParameter('viewCode', value);
    this.tableDs.query();
  }

  render() {
    const { viewSwitchData = [], viewCode = '' } = this.state;
    return (
      <Fragment>
        <Header
          title={
            Array.isArray(viewSwitchData) && viewSwitchData.length <= 1 ? (
              intl.get('ssrc.priceLibrary.view.title.priceLibrary').d('价格库')
            ) : (
              <span className={style['view-select-no-border']}>
                {intl.get('ssrc.priceLibrary.view.title.priceLibrary').d('价格库')}
                <Tooltip
                  title={intl.get('ssrc.priceLibrary.view.message.switch').d('切换视图')}
                  placement="top"
                  theme="light"
                >
                  <img
                    src={priceLibNew}
                    alt=""
                    style={{ marginLeft: '24px', height: '16px', width: '16px' }}
                  />
                </Tooltip>
                <Select
                  size="small"
                  value={viewCode}
                  onChange={this.handleViewSelectChange}
                  allowClear={false}
                >
                  {viewSwitchData.map((item) => (
                    <Select.Option key={item.viewCode} value={item.viewCode}>
                      {item.viewName}
                    </Select.Option>
                  ))}
                </Select>
              </span>
            )
          }
        >
          <Button icon="check" color="primary" onClick={() => this.jumpPriceLibCreate()}>
            {intl
              .get(`ssrc.priceLibrary.view.message.button.creatAndUpdateManually`)
              .d('手工创建&更新')}
          </Button>
          <Button disabled>
            {intl.get(`ssrc.priceLibrary.view.message.button.deactivate`).d('置为无效')}
          </Button>
          <Button disabled icon="cloud_download">
            {intl.get(`ssrc.priceLibrary.view.message.button.importERP`).d('导入ERP')}
          </Button>
          <Button disabled icon="download">
            {intl.get(`ssrc.priceLibrary.view.message.button.batchExport`).d('批量导出')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={this.columns} queryFieldsLimit={3} />
        </Content>
      </Fragment>
    );
  }
}
