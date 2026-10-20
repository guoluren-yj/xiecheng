/**
 * TemplateUpdatePreview - 价格库模板预览
 * @date: 2020-08-04
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { FIlESIZE } from '@/utils/SsrcRegx';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { closeTab, getActiveTabKey } from 'utils/menuTab';

import { listLineDS } from './lineDS';
import commonStyle from './common.less';

import { fetchPriceLibHeaderConfig } from '@/services/priceLibraryNewService';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['ssrc.priceLibrary'] })
export default class TemplateUpdatePreview extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParams,
      columnList: [], // 动态列
      currentTabKey: getActiveTabKey(),
    };
  }

  tableDs = new DataSet(listLineDS({ templateCode: this.props.match.params.templateCode }, []));

  componentDidMount() {
    // 请求配置头
    this.fetchPriceLibHeaderConfig(this.tableDs);
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
        displayValue =
          Number(field.fieldEditable) === 1 &&
          (record.status === 'add' || record.getState('editAble')) ? (
            <Upload
              tenantId={organizationId}
              bucketName={field.bucketName}
              bucketDirectory={field.bucketDirectory}
              attachmentUUID={display}
              afterOpenUploadModal={(attUuid) => {
                record.set(`${field.dimensionCode}`, attUuid);
              }}
              fileSize={FIlESIZE}
              filePreview
            />
          ) : (
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
            displayValue = '';
            break;
          case 'ladderQuotation': // 阶梯报价
            displayValue = '';
            break;
          case 'applicationScope': // 适用范围
            displayValue = '';
            break;
          default:
            if (record.get(`${field.dimensionCode}OpenMethod`) === 'POPUP_WINDOW') {
              // 弹窗
              displayValue = (
                <a onClick={() => this.handleShowLinkTargetPage(record, field)}>{display}</a>
              );
            } else {
              displayValue = (
                <a
                  href={record.get(`${field.dimensionCode}Href`)}
                  title={record.get(`${field.dimensionCode}Title`)}
                  target={
                    record.get(`${field.dimensionCode}OpenMethod`) === 'NEW_WINDOW'
                      ? '_blank'
                      : '_self'
                  }
                >
                  {display}
                </a>
              );
            }
            break;
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
      case 'UPLOAD':
      case 'LINK':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT':
        fieldConfig = {
          type: 'string',
          maxLength: field.textMaxLength,
          minLength: field.textMinLength,
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          // multiple: Number(field.multipleFlag) === 1 ? ',' : false,
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          textField: field.displayField,
          valueField: field.valueField,
          // multiple: Number(field.multipleFlag) === 1,
          // transformRequest: value => (isObject(value) ? value[field.valueField] : value),
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
          step:
            field.numberPrecision || field.numberPrecision === 0
              ? 1 / 10 ** field.numberPrecision
              : null,
          min: field.numberMin !== null ? field.numberMin : undefined,
          max: field.numberMax !== null ? field.numberMax : undefined,
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'YYYY/MM/DD hh:mm:ss' || field.dateFormat === 'YYYY-MM-DD hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: field.dateFormat,
          transformRequest: (val) =>
            val &&
            moment(val).format(
              field.dateFormat === 'YYYY/MM/DD hh:mm:ss' ||
                field.dateFormat === 'YYYY-MM-DD hh:mm:ss'
                ? 'YYYY-MM-DD hh:mm:ss'
                : 'YYYY-MM-DD 00:00:00'
            ),
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
        fieldConfig = {
          type: 'string',
        };
        break;
    }
    return fieldConfig;
  }

  /**
   * 展示链接页面
   * @param {Object} record - 行记录
   * @param {Object} field - 列配置
   */
  @Bind()
  handleShowLinkTargetPage(record, field) {
    const title = record[field.dimensionCode];
    const iframeUrl = record[`${field.dimensionCode}Href`];
    const width = record[`${field.dimensionCode}WindowWidth`];
    const wrapperStyle = {
      border: 'none',
      height: '100%',
      width: '100%',
    };

    if (this.linkModal) {
      this.linkModal.update({
        children: <iframe title={title} style={wrapperStyle} src={iframeUrl} />,
      });
      this.linkModal.open();
    } else {
      // 打开弹框
      this.linkModal = Modal.open({
        key: Modal.key(),
        title,
        drawer: true,
        closable: true,
        maskClosable: true,
        className: commonStyle['c7n-modal-wrapper'],
        style: {
          width: width ? `${width}%` : 'calc(100vw - 520px)',
        },
        children: <iframe title={title} style={wrapperStyle} src={iframeUrl} />,
        footer: null,
      });
    }
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
          multiple: Number(field.multipleFlag) === 1,
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
          range: ['start', 'end'],
          format: field.dateFormat,
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
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: params.templateCode,
        ...this.state.routerParams,
        relevantPriceFlag: relevantPriceParams ? 1 : 0,
        latestFlag: 'P',
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const queryFromDs = new DataSet();
      const columnList = [];
      list.forEach((item) => {
        if (Number(item.fieldVisible)) {
          // 组件类型是lov
          if (item.fieldWidget === 'LOV') {
            ds.addField(`${item.dimensionCode}LOV`, {
              name: `${item.dimensionCode}LOV`,
              label: item.dimensionName,
              required: Number(item.fieldRequired) === 1,
              ignore: 'always',
              defaultValue: item.defaultValue,
              ...this.renderFieldType(item),
            });
            ds.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${item.valueField}`,
            });
            ds.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${item.displayField}`,
            });
          } else {
            ds.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              label: item.dimensionName,
              required: Number(item.fieldRequired) === 1,
              defaultValue: item.defaultValue,
              ...this.renderFieldType(item),
            });
          }
        }
        if (item.queryFlag) {
          queryFromDs.addField(item.dimensionCode, {
            name: item.dimensionCode,
            label: item.dimensionName,
            ...this.renderQueryFieldType(item),
          });
        }
        if (Number(item.fieldVisible)) {
          if (
            item.fieldWidget === 'UPLOAD' ||
            item.fieldWidget === 'LINK' ||
            item.fieldWidget === 'SWITCH'
          ) {
            columnList.push({
              name: `${item.dimensionCode}`,
              width: item.gridWidth,
              tooltip: 'overflow',
              renderer: ({ record }) => this.renderDisplay(record, item),
              editor: (record) =>
                Number(item.fieldEditable) === 1 &&
                (record.status === 'add' || record.getState('editAble')) &&
                item.fieldWidget !== 'UPLOAD',
            });
          } else {
            columnList.push({
              name:
                item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
              // name: `${item.dimensionCode}`,
              width: item.gridWidth,
              tooltip: 'overflow',
              editor: (record) =>
                Number(item.fieldEditable) === 1 &&
                (record.status === 'add' || record.getState('editAble')) &&
                item.fieldWidget !== 'UPLOAD',
            });
          }
        }
      });
      Object.assign(ds, { queryDataSet: queryFromDs });
      this.setState({ columnList });
      // 相关价格
      if (!isEmpty(relevantPriceParams)) {
        ds.setQueryParameter('priceLibId', relevantPriceParams.priceLibId);
        ds.setQueryParameter('dimensionId', relevantPriceParams.dimensionId);
        ds.setQueryParameter('templateCode', params.templateCode);
      } else {
        // 设置行查询参数
        ds.setQueryParameter('routerParams', {
          templateCode: params.templateCode,
          ...this.state.routerParams,
        });
      }
    }
  }

  /**
   * 编辑
   * record 行信息
   */
  @Bind()
  handelEdit(record) {
    record.setState('editAble', true);
  }

  /**
   * 取消
   * record 行信息
   */
  @Bind()
  handelCancel(record) {
    this.tableDs.reset();
    record.setState('editAble', false);
  }

  /**
   * 获取table列
   */
  get columns() {
    if (this.state && this.state.columnList) {
      return [
        ...this.state.columnList,
        {
          name: 'edit',
          width: 80,
          lock: 'right',
          renderer: ({ record }) => {
            if (record.status === 'add') {
              return '';
            } else if (record.getState('editAble')) {
              return (
                <a onClick={() => this.handelCancel(record)}>
                  {intl.get('hzero.common.view.button.cancel').d('取消')}
                </a>
              );
            } else {
              return (
                <a onClick={() => this.handelEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              );
            }
          },
        },
      ];
    }
    return [];
  }

  /**
   * 返回时, 关闭tab页
   */
  @Bind()
  handleBack() {
    const { currentTabKey } = this.state;
    closeTab(currentTabKey);
  }

  render() {
    const {
      match: { params },
    } = this.props;
    const buttons = ['delete', 'add'];
    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceLibrary.view.title.materialPriceMaintenance')
            .d('物料价格信息维护')}
          backPath={`/ssrc/price-lib-dimension-org/preview/${params.templateCode}`}
          onBack={this.handleBack}
        >
          <Button icon="rocket" color="primary" disabled>
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          <Button icon="save" disabled>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Table
            columns={this.columns}
            dataSet={this.tableDs}
            queryFieldsLimit={3}
            buttons={buttons}
          />
        </Content>
      </Fragment>
    );
  }
}
