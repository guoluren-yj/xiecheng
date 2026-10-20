/**
 * 价格库新
 * @date: 2020-06-16
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Table, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { Popover, Select } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload';
import moment from 'moment';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { deleteCache } from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
  filterNullValueObject,
} from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { EventManager } from '_utils/utils';
import { SRM_SPC } from '_utils/config';

import ExportDynamicExcel from '@/routes/components/ExportDynamicExcel';
import {
  fetchPriceLibHeaderConfig,
  deactivatePriceLib,
  fetchImportToERP,
  fetchScopeTabs,
  fetchViewSwitchData,
  saveViewSwitch,
} from '@/services/priceLibraryNewService';
import { numberIntervalRender } from '@/utils/renderer';
import priceLibNew from '@/assets/priceLibNew.svg';
import ApplicationScope from './ApplicationScope';
import { operationDS } from './operationDS';
import { listLineDS, relevantPriceDS, ladderQuotationDS, scopeTableDS } from './lineDS';
import style from './index.less';


// const { useModal } = ModalProvider;
const organizationId = getCurrentOrganizationId();
const userId = getCurrentUserId();
const modalKey = Modal.key();
let _modal;

@formatterCollections({ code: ['ssrc.priceLibraryNew', 'ssrc.common'] })
export default class priceLibrary extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = this.props.match.params;
    this.state = {
      viewCode: '', // 当前视图
      routerParams,
      columnList: [], // 动态列
      viewSwitchData: [], // 切换视图数据
    };
    deleteCache('/ssrc/price-library-new/:templateCode/update');
  }

  tableDs = new DataSet(listLineDS());

  operationDs = new DataSet(operationDS());

  relevantPriceDs = new DataSet(relevantPriceDS());

  ladderQuotationDs = new DataSet(ladderQuotationDS());

  scopeTableDs = new DataSet(scopeTableDS());

  componentDidMount() {
    // 请求配置头
    this.fetchPriceLibHeaderConfig(this.tableDs);
    // 请求视图配置选项
    // this.fetchViewSwitch();
    // this.props.history.listen((router) => {
    // });
  }

  // 查询视图配置选项
  @Bind()
  async fetchViewSwitch() {
    const { viewCode } = this.state;
    const result = getResponse(
      await fetchViewSwitchData({
        templateCode: this.state.routerParams.templateCode,
        userId,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      this.setState({
        viewSwitchData: result,
        viewCode: viewCode || result.find((item) => item.currentViewFlag).viewCode,
      });
    }
  }

  /**
   * 查询阶梯报价
   */
  @Bind()
  fetchLadderQuotation(record) {
    const { viewCode = '' } = this.state;

    this.ladderQuotationDs.setQueryParameter('priceLibId', record.toData().priceLibId);
    this.ladderQuotationDs.setQueryParameter('viewCode', viewCode);
    this.ladderQuotationDs.query();
  }

  /**
   * 渲染阶梯报价
   */
  renderLadderQuotation() {
    const columns = [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ record }) =>
          numberIntervalRender(record.toData().ladderFrom, record.toData().ladderTo),
      },
      {
        name: 'ladderPrice',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'ladderNetPrice',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'ladderPriceRemark',
        width: 150,
        tooltip: 'overflow',
      },
    ];
    return (
      <Table
        dataSet={this.ladderQuotationDs}
        columns={columns}
        className={style['popover-content']}
      />
    );
  }

  /**
   * 展示相关价格弹框
   */
  @Bind()
  showRelevantPrice(record, field) {
    const data = record.toData();
    this.fetchPriceLibHeaderConfig(this.relevantPriceDs, {
      priceLibId: data.priceLibId,
      dimensionId: field.dimensionId,
    });
    _modal = Modal.open({
      key: modalKey,
      title: intl
        .get('ssrc.priceLibraryNew.view.title.relevantPrice')
        .d(
          `物品编码-${record.itemIdMeaning ? record.itemIdMeaning : ''}（${
            record.supplierIdMeaning ? record.supplierIdMeaning : ''
          }供应商）相关价格`
        ), // to do
      drawer: true,
      style: {
        width: '80%',
      },
      children: <Table dataSet={this.relevantPriceDs} columns={[]} queryFieldsLimit={3} />,
      afterClose: () => this.relevantPriceDs.reset(),
    });
  }

  /**
   * 展示适用范围
   */
  @Bind()
  async showApplicationScope(record) {
    const { viewCode = '' } = this.state;
    const data = record.toData();

    const scopeProps = {
      viewCode,
      tableDs: this.scopeTableDs,
      priceLibId: data.priceLibId,
    };

    // 打开弹框
    const scopeModal = Modal.open({
      key: modalKey,
      title: intl.get('ssrc.priceLibraryNew.view.title.viewScope').d('查看适用范围'),
      drawer: true,
      style: {
        width: '60%',
      },
      children: <ApplicationScope tabsData={[]} {...scopeProps} />,
    });

    // 查询tab标签页
    const params = { priceLibId: data.priceLibId, viewCode };
    const result = getResponse(await fetchScopeTabs(params));
    if (result && !result.failed) {
      // 更新弹框内容
      scopeModal.update({
        children: <ApplicationScope tabsData={result} {...scopeProps} />,
      });
      // 查询第一个tab对应表格的数据
      this.scopeTableDs.setQueryParameter('params', {
        ...params,
        dimensionCode: result[0].dimensionCode,
      });
      this.scopeTableDs.query();
    }
  }

  /**
   * 渲染时间日期渲染格式
   */
  @Bind()
  renderDateFormat(dateFormat) {
    let format;
    switch (dateFormat) {
      case 'yyyy-MM-dd':
        format = 'YYYY-MM-DD';
        break;
      case 'yyyy/MM/dd':
        format = 'YYYY/MM/DD';
        break;
      case 'yyyy-MM-dd hh:mm:ss':
        format = 'YYYY-MM-DD hh:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD hh:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * 渲染组件显示
   */
  @Bind()
  renderDisplay(record, field) {
    const display = record.get(`${field.dimensionCode}`);
    let displayValue;
    switch (field.fieldWidget) {
      case 'SWITCH':
        displayValue = yesOrNoRender(display);
        break;
      case 'UPLOAD':
        displayValue = (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={display}
            filePreview
            viewOnly
          />
        );
        break;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'relevantPrice': // 相关价格
            displayValue = <a onClick={() => this.showRelevantPrice(record, field)}>{display}</a>;
            break;
          case 'ladderQuotation': // 阶梯报价
            displayValue = (
              <Popover
                trigger="click"
                placement="topLeft"
                content={this.renderLadderQuotation()}
              >
                <a onClick={() => this.fetchLadderQuotation(record)}>{display}</a>
              </Popover>
            );
            break;
          case 'applicationScope': // 适用范围
            displayValue = <a onClick={() => this.showApplicationScope(record)}>{display}</a>;
            break;
          default:
            displayValue = (
              <a
                href={record.get(`${field.dimensionCode}Href`)}
                title={record.get(`${field.dimensionCode}Title`)}
                target={Number(record.get(`${field.dimensionCode}NewWindow`)) ? '_blank' : '_self'}
              >
                {display}
              </a>
            );
            break;
        }
        break;
      case 'DATE_PICKER':
        if (display) {
          displayValue = (
            <span style={record.get('highlightFlag') ? { color: 'red' } : {}}>
              {moment(display).format(this.renderDateFormat(field.dateFormat))}
            </span>
          );
        }
        break;
      default:
        break;
    }
    return displayValue;
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
      case 'SELECT':
        fieldConfig = {
          type: 'string',
        };
        break;
      // case 'SELECT':
      //   fieldConfig = {
      //     type: 'string',
      //     lookupCode: field.sourceCode,
      //   };
      //   break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
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
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
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
    const { viewCode } = this.state;
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: this.state.routerParams.templateCode,
        relevantPriceFlag: relevantPriceParams ? 1 : 0,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const queryFromDs = new DataSet();
      const columnList = [];
      list.forEach((item) => {
        const name =
          item.fieldWidget === 'LOV' || item.fieldWidget === 'SELECT'
            ? `${item.dimensionCode}Meaning`
            : item.dimensionCode;
        // const name = item.dimensionCode;
        if (Number(item.fieldVisible)) {
          ds.addField(name, {
            name,
            label: item.dimensionName,
            ...this.renderFieldType(item),
          });
        }
        if (item.queryFlag) {
          // 针对 `LOV` 增加fieldMeaning, 适配导出组件
          if (item.fieldWidget === 'LOV') {
            queryFromDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item),
            });
            queryFromDs.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              bind: `${item.dimensionCode}.${item.displayField}`,
            });
          } else {
            queryFromDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item),
            });
          }
        }
        if (Number(item.fieldVisible)) {
          // 当前日期距离有效期至小于等于30天时，报价有效期从和至标红显示
          if (
            item.fieldWidget === 'UPLOAD' ||
            item.fieldWidget === 'LINK' ||
            item.fieldWidget === 'SWITCH' ||
            item.dimensionCode === 'validDateFrom' ||
            item.dimensionCode === 'validDateTo'
          ) {
            columnList.push({
              name,
              width: item.gridWidth,
              tooltip: 'overflow',
              renderer: ({ record }) => this.renderDisplay(record, item),
            });
          } else {
            columnList.push({
              name,
              width: item.gridWidth,
              tooltip: 'overflow',
            });
          }
        }
      });
      Object.assign(ds, { queryDataSet: queryFromDs });
      if (relevantPriceParams) {
        const relevantColumns = [
          ...columnList,
          {
            header: intl.get('ssrc.priceLibraryNew.model.library.operation').d('操作记录'),
            width: 120,
            renderer: ({ record }) => (
              <a onClick={() => this.showOperation(record)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            ),
          },
        ];
        // 更新相关价格model
        _modal.update({
          children: (
            <Table dataSet={this.relevantPriceDs} columns={relevantColumns} queryFieldsLimit={3} />
          ),
        });
        ds.setQueryParameter('priceLibId', relevantPriceParams.priceLibId);
        ds.setQueryParameter('dimensionId', relevantPriceParams.dimensionId);
        ds.setQueryParameter('viewCode', this.state.viewCode);
      } else {
        this.setState({ columnList });
        // 查询视图配置
        const res = getResponse(
          await fetchViewSwitchData({
            templateCode: this.state.routerParams.templateCode,
            userId,
          })
        );
        if (res && Array.isArray(res) && res.length > 1) {
          const currentViewCode =
            viewCode ||
            (res.find((item) => item.currentViewFlag) &&
              res.find((item) => item.currentViewFlag).viewCode);
          this.setState({
            viewSwitchData: res,
            viewCode: currentViewCode,
          });
          ds.setQueryParameter('viewCode', currentViewCode);
        } else if (res.length === 1) {
          ds.setQueryParameter('viewCode', res[0].viewCode);
        }
      }
      // 设置行查询参数
      ds.setQueryParameter('templateCode', this.state.routerParams.templateCode);
      // 查询行
      ds.query();
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
    this.props.history.push({
      pathname: `/ssrc/price-library-new/${this.state.routerParams.templateCode}/update`,
      search: `?priceLibIds=${selectedRowKeys}&viewCode=${this.state.viewCode}`,
    });
  }

  /**
   * 置为无效
   */
  @Bind()
  async deactivatePriceLib() {
    const { viewCode } = this.state;
    if (!isEmpty(this.tableDs.selected)) {
      const params = this.tableDs.selected.map((item) => item.toData());
      const res = await getResponse(deactivatePriceLib(params, viewCode));
      if (res && !res.failed) {
        // 当价格库状态查询为有效时，勾选置为无效，需要清空当前页勾选项、缓存勾选项，否则无效后查询不到数据，ds仍缓存,造成按钮不可点击的问题
        // 清除视图的缓存勾选项
        this.tableDs.clearCachedSelected();
        // 清除视图的当前页勾选项
        this.tableDs.unSelectAll();
        this.tableDs.query();
      }
    } else {
      notification.warning({
        message: intl
          .get('ssrc.priceLibraryNew.view.notification.chooseOne')
          .d('请至少勾选一条数据'),
      });
    }
  }

  /**
   * 切换视图
   */
  @Bind()
  async handleViewSelectChange(value) {
    const { viewSwitchData = [] } = this.state;
    if (value) {
      const params = viewSwitchData.find((item) => item.viewCode === value);
      const res = await getResponse(saveViewSwitch({ ...params, userId }));
      if (res && !res.failed) {
        this.setState({
          viewCode: value,
        });
        // 清除视图的缓存勾选项
        this.tableDs.clearCachedSelected();
        // 清除视图的当前页勾选项
        this.tableDs.unSelectAll();

        this.tableDs.setQueryParameter('viewCode', value);
        this.tableDs.query();
      }
    }
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record) {
    this.operationDs.setQueryParameter('queryParams', {
      docType: 'MAIN',
      docId: record.toData().priceLibId,
    });

    this.operationDs.query();

    const operateColumns = [
      {
        name: 'actionName',
        width: 120,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: 520,
      },
      children: <Table dataSet={this.operationDs} columns={operateColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
  }

  /**
   * 获取table列
   */
  get columns() {
    return [
      ...this.state.columnList,
      {
        header: intl.get('ssrc.priceLibraryNew.model.library.operation').d('操作记录'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => this.showOperation(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ];
  }

  /**
   * 导入ERP
   */
  @Bind()
  async handleImportERP() {
    const { viewCode } = this.state;
    if (!isEmpty(this.tableDs.selected)) {
      const selectedRowKeys = this.tableDs.selected.map((item) => item.toData().priceLibId);
      const res = await fetchImportToERP({
        viewCode: viewCode || 'ALL_VIEW',
        priceLibIds: selectedRowKeys,
      });
      if (!res) return;
      if (res.code === 'EBS' || res.code === 'SAP') {
        if (res.message) {
          notification.warning({
            message: res.message,
          });
        } else {
          notification.warning({
            message: intl
              .get(`ssrc.priceLibraryNew.message.validation.importFail`)
              .d('导入失败，请补充信息后再次导入'),
          });
        }
        EventManager.emit('REFRESH-PRICE-LIBRARY-IMPORT_TABLE', { from: 'price-library-new' }); // 刷新价格库导入erp下的table
        this.props.history.push({
          pathname: `/ssrc/search-result-import-new/list`,
          search: querystring.stringify({ activeKey: res.code }),
        });
      } else if (res.code === 'SUCCESS') {
        notification.success({
          message: intl.get(`ssrc.priceLibraryNew.message.validation.importScu`).d('导入成功'),
        });
        EventManager.emit('REFRESH-PRICE-LIBRARY-IMPORT_TABLE', { from: 'price-library-new' }); // 刷新价格库导入erp下的table
        this.props.history.push({
          pathname: `/ssrc/search-result-import-new/list`,
          search: querystring.stringify({ activeKey: res.code }),
        });
      } else {
        notification.warning({
          message: res.message,
        });
      }
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibraryNew.message.validation.selectRows`)
          .d('请选择一条或者多条数据后再执行导入操作！'),
      });
    }
  }

  /**
   * 获取勾选行keys
   * @returns {Array} - 勾选行keys
   */
  getSelectedRowKes() {
    let selectedRowKeys = [];
    const selectedRow = this.tableDs.selected;
    if (!isEmpty(selectedRow)) {
      selectedRowKeys = selectedRow.map((item) => item.toData().priceLibId);
    }
    return selectedRowKeys;
  }

  /**
   * 查看历史价格趋势图
   */
  @Bind()
  handleViewPriceChart() {
    const {
      routerParams: { templateCode },
    } = this.state;
    let search = '';
    const selectedRow = this.tableDs.selected; // 勾选数据
    if (!isEmpty(selectedRow)) {
      const {
        itemId = '',
        itemIdMeaning = '',
        supplierCompanyId = '',
        supplierCompanyIdMeaning = '',
      } = selectedRow[0].toData();
      search = `?viewCode=${this.state.viewCode}&itemId=${itemId}&itemIdMeaning=${itemIdMeaning}&supplierCompanyId=${supplierCompanyId}&supplierCompanyIdMeaning=${supplierCompanyIdMeaning}`;
    } else {
      search = `?viewCode=${this.state.viewCode}`;
    }
    this.props.history.push({
      pathname: `/ssrc/price-library-new/${templateCode}/chart`,
      search,
    });
  }

  render() {
    const {
      routerParams: { templateCode },
      viewSwitchData = [],
      viewCode = '',
    } = this.state;
    const DeactivateButtons = observer((props) => {
      const isDisabled = props.dataSet.selected.length === 0;
      const queryData = props.dataSet.queryDataSet.current
        ? filterNullValueObject(props.dataSet.queryDataSet.current.toData())
        : {};
      if (!isEmpty(queryData)) delete queryData.__dirty;
      return (
        <Fragment>
          <Button
            disabled={props.dataSet.selected.length === 0}
            onClick={() => this.deactivatePriceLib()}
          >
            {intl.get(`ssrc.priceLibraryNew.view.button.deactivate`).d('置为无效')}
          </Button>
          <Button disabled={isDisabled} onClick={this.handleImportERP} icon="cloud_download">
            {intl.get(`ssrc.priceLibraryNew.view.button.importERP`).d('导入ERP')}
          </Button>
          <Button icon="show_chart" onClick={this.handleViewPriceChart}>
            {intl.get(`ssrc.priceLibraryNew.view.button.historyAna`).d('历史价格分析')}
          </Button>
          <ExportDynamicExcel
            requestUrl={`${SRM_SPC}/v1/${organizationId}/price-lib-mains/excel/export`}
            queryParams={{
              viewCode,
              queryData,
              templateCode,
              selectedRowKeys: this.getSelectedRowKes(),
            }}
          />
        </Fragment>
      );
    });

    return (
      <Fragment>
        <Header
          className
          title={
            Array.isArray(viewSwitchData) && viewSwitchData.length <= 1 ? (
              intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库')
            ) : (
              <span className={style['view-select-no-border']}>
                {intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库')}
                <Tooltip
                  title={intl.get('ssrc.priceLibraryNew.view.message.switch').d('切换视图')}
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
                  dropdownClassName={style['select-z-index']}
                  allowClear={false}
                >
                  {viewSwitchData.map((item) => (
                    <Select.Option key={item.viewCode} value={item.viewCode}>
                      <Tooltip title={item.viewName} placement="bottom" theme="light">
                        {item.viewName}
                      </Tooltip>
                    </Select.Option>
                  ))}
                </Select>
              </span>
            )
          }
        >
          <PermissionButton
            icon="check"
            color="primary"
            onClick={() => this.jumpPriceLibCreate()}
            type="c7n-pro"
            permissionList={[
              {
                code: `srm.source.result.price.lib.manul-button.ps`,
                type: 'button',
                meaning:
                  intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                  intl.get(`ssrc.priceLibraryNew.view.button.creatAndUpdate`).d('手工创建&更新'),
              },
            ]}
          >
            {intl.get(`ssrc.priceLibraryNew.view.button.creatAndUpdate`).d('手工创建&更新')}
          </PermissionButton>
          <DeactivateButtons dataSet={this.tableDs} />
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={this.columns} queryFieldsLimit={3} />
        </Content>
      </Fragment>
    );
  }
}
