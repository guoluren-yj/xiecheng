/**
 * 价格库手工创建&更新
 * @date: 2020-06-17
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import moment from 'moment';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty, isObject, isDate } from 'lodash';
import React, { PureComponent, Fragment } from 'react';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Output,
  Form,
  Tabs,
  TextField,
  TextArea,
} from 'choerodon-ui/pro';

import { openTab } from 'utils/menuTab';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';

import {
  fetchPriceLibHeaderConfig,
  releasePriceLib,
  fetchScopeTabs,
  fetchApproveMethod,
} from '@/services/priceLibraryNewService';
import ApplicationScope from './ApplicationScope';
import {
  listLineDS,
  ladderQuotationTableDS,
  ladderQuotationFormDS,
  scopeTableDS,
  lineManualDS,
  releaseConfirmDs,
} from './lineDS';
import commonStyle from '../common.less';

const organizationId = getCurrentOrganizationId();
const modalKey = Modal.key();
let scopeModal;

@formatterCollections({ code: ['ssrc.priceLibraryNew'] })
@cacheComponent({ cacheKey: '/ssrc/price-library-new/:templateCode/update' })
export default class priceLibrary extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParams,
      viewCode: routerParams.viewCode || '',
      priceLibIds: routerParams.priceLibIds || '',
      columnList: [], // 动态列
      saveLoading: false,
      activeKey: 'itemPriceInfoMaint', // 当前激活的tabKey
      newAttachmentUuid: uuid(), // 上传附件UUid
    };
  }

  tableDs = new DataSet(listLineDS({ templateCode: this.props.match.params.templateCode }, []));

  tableManualDs = new DataSet(
    lineManualDS({ templateCode: this.props.match.params.templateCode }, [])
  );

  ladderQuotationFormDs = new DataSet(ladderQuotationFormDS());

  ladderQuotationTableDs = new DataSet(ladderQuotationTableDS());

  scopeTableDs = new DataSet(scopeTableDS());

  releaseConfirm = new DataSet(releaseConfirmDs());

  componentDidMount() {
    // 请求配置头
    this.fetchPriceLibHeaderConfig(this.tableDs);
  }

  /**
   * 展示阶梯报价
   */
  @Bind()
  showLadderQuotation(record) {
    const data = record.toData();
    const benchmarkPriceType = record.getField('benchmarkPriceType').get('defaultValue');

    this.ladderQuotationFormDs.create(data);

    this.ladderQuotationTableDs.setQueryParameter('priceLibId', data.priceLibId);
    this.ladderQuotationTableDs.setQueryParameter('benchmarkPriceType', benchmarkPriceType);
    this.ladderQuotationTableDs.setQueryParameter('taxRate', data.taxRate);
    this.ladderQuotationTableDs.query();

    const columns = [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 100,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'ladderTo',
        width: 100,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'ladderPrice',
        width: 100,
        tooltip: 'overflow',
        editor: benchmarkPriceType === 'TAX_INCLUDED_PRICE',
      },
      {
        name: 'ladderNetPrice',
        width: 100,
        tooltip: 'overflow',
        editor: benchmarkPriceType === 'NET_PRICE',
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        editor: true,
      },
      {
        name: 'ladderPriceRemark',
        width: 150,
        tooltip: 'overflow',
        editor: true,
      },
    ];
    const buttons = [
      'delete',
      'save',
      <Button
        icon="playlist_add"
        onClick={() => this.ladderQuotationTableDs.create({}, this.ladderQuotationTableDs.length)}
        key="add"
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
    ];
    Modal.open({
      key: modalKey,
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 680,
      },
      footer: null,
      closable: true,
      children: (
        <React.Fragment>
          <Form dataSet={this.ladderQuotationFormDs} columns={2}>
            <Output name="itemCode" />
            <Output name="itemName" />
            <Output name="currencyCodeMeaning" />
            <Output name="taxRate" />
          </Form>
          <Table dataSet={this.ladderQuotationTableDs} columns={columns} buttons={buttons} />
        </React.Fragment>
      ),
      afterClose: () => {
        this.ladderQuotationTableDs.loadData([]);
        this.ladderQuotationFormDs.reset();
      },
    });
  }

  /**
   * 查询tab页数据
   */
  @Bind()
  async fetchScopeTabs(params, dimensionCode) {
    const scopeProps = {
      tableDs: this.scopeTableDs,
      priceLibId: params.priceLibId,
      templateId: params.templateId,
      fetchScopeTabs: this.fetchScopeTabs,
      onRef: (node) => {
        this.applicationScope = node;
      },
    };
    // 查询tab标签页
    const param = { priceLibId: params.priceLibId };
    const result = getResponse(await fetchScopeTabs(param));
    if (result && !result.failed) {
      // 设置tab的activeKey
      if (!this.applicationScope.state.activeKey) {
        this.applicationScope.setState({
          activeKey: result[0].dimensionCode,
        });
      }
      // 更新弹框内容
      scopeModal.update({
        children: <ApplicationScope tabsData={result} {...scopeProps} />,
      });
      // 查询第一个tab对应表格的数据
      this.scopeTableDs.setQueryParameter('params', {
        ...params,
        dimensionCode: dimensionCode || (result[0] && result[0].dimensionCode),
      });
      this.scopeTableDs.query();
    }
  }

  /**
   * 展示适用范围
   */
  @Bind()
  async showApplicationScope(record) {
    const data = record.toData();

    const scopeProps = {
      tableDs: this.scopeTableDs,
      priceLibId: data.priceLibId,
      templateId: data.templateId,
      fetchScopeTabs: this.fetchScopeTabs,
      onRef: (node) => {
        this.applicationScope = node;
      },
    };

    // 打开弹框
    scopeModal = Modal.open({
      key: modalKey,
      title: intl.get('ssrc.priceLibraryNew.view.title.maintenanceScope').d('维护适用范围'),
      drawer: true,
      style: {
        width: '60%',
      },
      children: <ApplicationScope tabsData={[]} {...scopeProps} />,
      afterClose: () => {
        this.applicationScope.setState({ activeKey: '' });
      },
    });

    // 查询tab页数据
    this.fetchScopeTabs(data);
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
   * field 编辑必输的条件渲染
   */
  @Bind()
  conditionRender(item = {}, record = {}) {
    let condition = false;
    let subject;
    switch (item.fieldWidget) {
      case 'DATE_PICKER':
        subject =
          record.get(item.dimensionCode) &&
          moment(record.get(item.dimensionCode)).format(this.renderDateFormat(item.dateFormat));
        break;
      default:
        subject =
          record.toData()[item.dimensionCode] || record.toData()[item.dimensionCode] === 0
            ? String(record.toData()[item.dimensionCode])
            : undefined;
        break;
    }

    const object = item.appointValue;
    switch (item.ruleExpression) {
      case 'EQUAL':
        condition = subject === object;
        break;
      case 'NOT_EQUAL':
        condition = subject !== object;
        break;
      case 'IS_NULL':
        condition = !subject;
        break;
      case 'NOT_NULL':
        condition = !!subject;
        break;
      case 'BE_CONTAIN':
        condition = object ? object.split(',').includes(subject) : false;
        break;
      case 'NOT_CONTAIN':
        condition = !(object ? object.split(',').includes(subject) : false);
        break;
      default:
        condition = false;
        break;
    }
    return condition;
  }

  /**
   * 格式化表达式
   */
  @Bind()
  formatCombExpression(combExpression, priceLibRuleLineList, record) {
    let combExpression1 = '';
    combExpression1 = combExpression.replace(/\s/g, '');
    combExpression1 = combExpression.replace(/AND|and/g, '&&');
    combExpression1 = combExpression1.replace(/OR|or/g, '||');
    const arr = combExpression1.split('');
    let newCombExpression = ``;
    arr.forEach((item) => {
      const currentLineNum = item.replace(/\(|\)|/g, '');
      if (currentLineNum && isFinite(currentLineNum)) {
        const currentLineNumObject = priceLibRuleLineList.find(
          (n) => n.lineNum === Number(currentLineNum)
        );
        newCombExpression += item.replace(/\d/, this.conditionRender(currentLineNumObject, record));
      } else {
        newCombExpression += item;
      }
    });
    return newCombExpression;
  }

  /**
   * 执行字符串中的代码
   * @memberof priceLibrary
   */
  @Bind()
  eval = (fn) => {
    const Fn = Function;
    return new Fn(`return  ${fn}`)();
  };

  /**
   * 设置编辑项
   */
  @Bind()
  renderEditable(field, record) {
    // 未设置必填条件
    if (isEmpty(field.editPriceLibRuleHeader)) {
      return Number(field.fieldEditable) === 1;
    } else if (field.editPriceLibRuleHeader.priceLibRuleCombList) {
      // 组合条件有值
      if (
        field.editPriceLibRuleHeader.priceLibRuleCombList[0] &&
        field.editPriceLibRuleHeader.priceLibRuleCombList[0].combExpression
      ) {
        const { combExpression } = field.editPriceLibRuleHeader.priceLibRuleCombList[0];
        const conditionExpression = this.formatCombExpression(
          combExpression,
          field.editPriceLibRuleHeader.priceLibRuleLineList,
          record
        );
        const conditionFlag = this.eval(conditionExpression);
        return Number(field.fieldEditable) === 1 ? conditionFlag : !conditionFlag;
      } else {
        return Number(field.fieldEditable) === 1;
      }
    }
  }

  /**
   * 设置必输项
   */
  @Bind()
  renderRequired(field, record) {
    // 未设置必填条件
    if (isEmpty(field.requiredPriceLibRuleHeader)) {
      return Number(field.fieldRequired) === 1;
    } else if (field.requiredPriceLibRuleHeader.priceLibRuleCombList) {
      // 组合条件有值
      if (
        field.requiredPriceLibRuleHeader.priceLibRuleCombList[0] &&
        field.requiredPriceLibRuleHeader.priceLibRuleCombList[0].combExpression
      ) {
        const { combExpression } = field.requiredPriceLibRuleHeader.priceLibRuleCombList[0];
        const conditionExpression = this.formatCombExpression(
          combExpression,
          field.requiredPriceLibRuleHeader.priceLibRuleLineList,
          record
        );
        const conditionFlag = this.eval(conditionExpression);
        return Number(field.fieldRequired) === 1 ? conditionFlag : !conditionFlag;
      } else {
        return Number(field.fieldRequired) === 1;
      }
    }
  }

  /**
   * 设置lov,select查询参数
   */
  @Bind()
  renderQueryParams(field, record) {
    let queryParams = {};
    if (!isEmpty(field.priceLibLovParamList)) {
      field.priceLibLovParamList.forEach((item) => {
        if (item.paramType === 'FIXED_VALUE') {
          queryParams = { ...queryParams, [item.paramName]: item.paramValue };
        } else if (item.paramType === 'DIMENSION') {
          queryParams = { ...queryParams, [item.paramName]: record.get(`${item.paramValue}`) };
        }
      });
    }
    return queryParams;
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
          this.renderEditable(field, record) &&
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
          case 'ladderQuotation': // 阶梯报价
            displayValue = record.status !== 'add' && (
              <a onClick={() => this.showLadderQuotation(record)}>{display}</a>
            );
            break;
          case 'applicationScope': // 适用范围
            displayValue = record.status !== 'add' && (
              <a onClick={() => this.showApplicationScope(record)}>{display}</a>
            );
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
    const dynamicProps = {
      dynamicProps: {
        required: ({ record }) => this.renderRequired(field, record),
      },
    };
    switch (field.fieldWidget) {
      case 'UPLOAD':
      case 'LINK':
        fieldConfig = {
          type: 'string',
          ...dynamicProps,
        };
        break;
      case 'INPUT':
        fieldConfig = {
          type: 'string',
          maxLength: field.textMaxLength,
          minLength: field.textMinLength,
          ...dynamicProps,
        };
        break;
      case 'LONG_INPUT':
        fieldConfig = {
          type: 'string',
          ...dynamicProps,
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          // multiple: Number(field.multipleFlag) === 1 ? ',' : false,
          dynamicProps: {
            // 设置下拉框查询参数
            lovPara: ({ record }) => this.renderQueryParams(field, record),
            required: ({ record }) => this.renderRequired(field, record),
          },
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          textField: field.displayField,
          valueField: field.valueField,
          dynamicProps: {
            // 设置lov查询参数
            lovPara: ({ record }) => this.renderQueryParams(field, record),
            required: ({ record }) => this.renderRequired(field, record),
          },
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
          ...dynamicProps,
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
          transformRequest: (val) =>
            val &&
            moment(val).format(
              field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                ? 'YYYY-MM-DD hh:mm:ss'
                : 'YYYY-MM-DD 00:00:00'
            ),
          ...dynamicProps,
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => Number(val),
          ...dynamicProps,
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
          ...dynamicProps,
        };
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
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          range: ['start', 'end'],
          format: this.renderDateFormat(field.dateFormat),
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
  async fetchPriceLibHeaderConfig(ds) {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: params.templateCode,
        dimensionType: 'BASIC',
        from: 'EDIT',
        ...this.state.routerParams,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const queryFromDs = new DataSet();
      const columnList = [];
      list.forEach((item) => {
        // 显示或者基准价维度
        if (Number(item.fieldVisible) || item.dimensionCode === 'benchmarkPriceType') {
          // 组件类型是lov
          if (item.fieldWidget === 'LOV') {
            ds.addField(`${item.dimensionCode}LOV`, {
              name: `${item.dimensionCode}LOV`,
              label: item.dimensionName,
              ignore: 'always',
              ...this.renderFieldType(item),
            });
            ds.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${item.valueField}`,
              defaultValue: item.defaultValue,
            });
            ds.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${item.displayField}`,
              defaultValue: item.defaultValueMeaning,
            });
            // 设置值集映射关系
            ds.addField(`${item.dimensionCode}MapList`, {
              name: `${item.dimensionCode}MapList`,
              defaultValue: item.priceLibDimMapList,
              ignore: 'always',
            });
          } else {
            ds.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              label: item.dimensionName,
              // required: Number(item.fieldRequired) === 1,
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
                this.renderEditable(item, record) &&
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
              editor: (record) => {
                if (
                  this.renderEditable(item, record) &&
                  (record.status === 'add' || record.getState('editAble'))
                ) {
                  if (item.fieldWidget === 'LONG_INPUT') {
                    return <TextArea name={item.dimensionCode} resize />;
                  }
                  return true;
                }
              },
            });
          }
        }
      });
      Object.assign(ds, { queryDataSet: queryFromDs });
      this.setState({ columnList });

      // 设置行查询参数
      ds.setQueryParameter('routerParams', {
        templateCode: params.templateCode,
        ...this.state.routerParams,
      });
      // 查询行
      const queryFlag = await ds.query();
      if (queryFlag) {
        // 设置行查询参数, 去掉priceLibIds
        ds.setQueryParameter('routerParams', {
          templateCode: params.templateCode,
          viewCode: this.state.routerParams.viewCode,
        });
      }
    }
  }

  /**
   * 保存
   */
  @Bind()
  async savePriceLibrary() {
    const flag = await this.tableDs.validate();
    if (flag) {
      const res = await this.tableDs.submit();
      if (res && !res.failed) {
        // notification.success();
        // 取消新建勾选项，避免查询数据后出现缓存
        if (!isEmpty(this.tableDs.selected)) {
          const newSelected =
            this.tableDs.selected.filter((item) => !item.toData().priceLibId) || [];
          newSelected.forEach((item) => this.tableDs.unSelect(item));
        }
      }
    }
  }

  /**
   * 发布
   */
  @Bind()
  async releasePriceLibrary() {
    const {
      match: { params },
    } = this.props;
    const { newAttachmentUuid } = this.state;
    if (!isEmpty(this.tableDs.selected)) {
      const flag = await this.tableDs.validate();
      if (flag) {
        const param = this.tableDs.selected.map((item) => {
          const data = item.toData();
          const date = {};
          for (const key in data) {
            if (isObject(data[key])) {
              // 处理日期格式
              // if (isDate(data[key]) && data[key]) {
              //   Object.assign(date, { [key]: moment(data[key]).format('YYYY-MM-DD 00:00:00') });
              // } else {
              // 处理LOV
              // delete data[key];
              // }
            }
          }
          return {
            ...data,
            ...date,
            templateCode: params.templateCode,
          };
        });
        const res = await getResponse(fetchApproveMethod(param));
        if (res && !res.failed && (res.includes('WFL') || res.includes('EXT'))) {
          Modal.open({
            key: modalKey,
            title: intl.get('ssrc.priceLibraryNew.view.message.releaseConfirm').d('发布确认'),
            style: {
              width: 450,
            },
            children: (
              <React.Fragment>
                <Form dataSet={this.releaseConfirm} labelLayout="vertical" columns={1}>
                  <TextField name="remark" dataSet={this.releaseConfirm} />
                </Form>
                <Form
                  labelAlign="left"
                  className="form-upload-style1"
                  dataSet={this.releaseConfirm}
                  columns={1}
                >
                  <Upload
                    attachmentUUID={newAttachmentUuid}
                    name="attachmentUuid"
                    bucketDirectory="price-center"
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    tenantId={organizationId}
                    fileSize={FIlESIZE}
                  />
                </Form>
              </React.Fragment>
            ),
            onOk: () => {
              this.releaseConfirmMethod();
            },
          });
        } else {
          this.releaseConfirmMethod();
        }
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
   * 确认发布
   */
  @Bind()
  async releaseConfirmMethod() {
    const {
      match: { params },
    } = this.props;
    const { newAttachmentUuid } = this.state;
    const headerData = this.releaseConfirm.toData()[0] || {};
    const flag = await this.tableDs.validate();
    if (flag) {
      const param = this.tableDs.selected.map((item) => {
        const data = item.toData();
        const date = {};
        for (const key in data) {
          if (isObject(data[key])) {
            // 处理日期格式
            if (isDate(data[key]) && data[key]) {
              Object.assign(date, { [key]: moment(data[key]).format('YYYY-MM-DD 00:00:00') });
            } else {
              // 处理LOV
              delete data[key];
            }
          }
        }
        return {
          ...data,
          ...date,
          from: 'EDIT_RELEASE',
          templateCode: params.templateCode,
        };
      });
      param[0]._attachmentUuid = newAttachmentUuid;
      param[0]._remark = headerData.remark;
      const res = await getResponse(releasePriceLib(param));
      if (res && !res.failed) {
        notification.success();
        this.setState({ newAttachmentUuid: uuid() });
        // 发布成功后，需要清空当前页勾选项、缓存勾选项，否则勾选项后查询不到数据，ds仍缓存,造成再次发布传参问题
        // 清除视图的缓存勾选项
        this.tableDs.clearCachedSelected();
        // 清除视图的当前页勾选项
        this.tableDs.unSelectAll();
        this.tableDs.query();
        this.tableManualDs.query();
      } else {
        notification.error({ description: res.message });
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
   * 批量创建
   */
  @Bind()
  handleBatchCreate() {
    const {
      match: { params },
    } = this.props;
    const { routerParams } = this.state;
    openTab({
      key: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
      path: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
      title: intl.get('ssrc.priceLibraryNew.view.message.batchCreate').d('批量创建'),
      closable: true,
      search: `?priceLibIds=${routerParams.priceLibIds}&&viewCode=${routerParams.viewCode}`,
    });
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

  @Bind()
  changeTab(activeKey) {
    this.setState({ activeKey });
  }

  @Bind()
  reDirectRFX(record) {
    const {
      match: { params },
      history,
    } = this.props;
    const {
      data: { requestStatus, requestId, requestNum },
    } = record;
    const { viewCode, priceLibIds } = this.state;
    if (requestStatus === 'APPROVING' || requestStatus === 'APPROVE_SUCCESS') {
      history.push({
        pathname: `/ssrc/price-library-new/${params.templateCode}/detail`,
        search: `?requestId=${requestId}&&priceLibIds=${priceLibIds}&&viewCode=${viewCode}&&requestStatus=${requestStatus}&&requestNum=${requestNum}`,
      });
    } else if (requestStatus === 'WITHDRAW' || requestStatus === 'APPROVE_REJECT') {
      history.push({
        pathname: `/ssrc/price-library-new/${params.templateCode}/detail-reject`,
        search: `?requestId=${requestId}&&priceLibIds=${priceLibIds}&&viewCode=${viewCode}&&requestStatus=${requestStatus}&&requestNum=${requestNum}`,
      });
    }
  }

  render() {
    const {
      match: { params },
    } = this.props;
    const { saveLoading = false, activeKey } = this.state;
    const buttons = ['delete', 'add'];
    const manualColumns = [
      {
        name: 'requestStatus',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'requestNum',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          if (
            record.get('requestStatus') === 'NEW' ||
            record.get('requestStatus') === 'APPROVING' ||
            record.get('requestStatus') === 'APPROVE_REJECT' ||
            record.get('requestStatus') === 'APPROVE_SUCCESS' ||
            record.get('requestStatus') === 'WITHDRAW'
          ) {
            return <a onClick={() => this.reDirectRFX(record)}>{value}</a>;
          } else {
            return value;
          }
        },
      },
      {
        name: 'realName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'approveMethod',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'approveDate',
        width: 100,
      },
    ];
    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceLibraryNew.view.title.materialPriceMaintenance')
            .d('物料价格信息维护')}
          backPath={`/ssrc/price-library-new/${params.templateCode}/list`}
        >
          {activeKey === 'itemPriceInfoMaint' && (
            <Button
              icon="rocket"
              color="primary"
              onClick={this.releasePriceLibrary}
              loading={saveLoading}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
          )}
          {activeKey === 'itemPriceInfoMaint' && (
            <Button icon="save" onClick={this.savePriceLibrary} loading={saveLoading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {activeKey === 'itemPriceInfoMaint' && (
            <Button
              type="default"
              icon="vertical_align_bottom"
              onClick={() => this.handleBatchCreate()}
            >
              {intl.get(`ssrc.priceLibraryNew.view.message.batchCreate`).d('批量创建')}
            </Button>
          )}
        </Header>
        <Content>
          <Tabs activeKey={activeKey} onChange={this.changeTab} animated={false}>
            <Tabs.TabPane
              tab={intl
                .get(`ssrc.priceLibraryNew.view.message.title.itemPriceInfoMaint`)
                .d('物料价格信息维护')}
              key="itemPriceInfoMaint"
              forceRender
            >
              <Table
                columns={this.columns}
                dataSet={this.tableDs}
                queryFieldsLimit={3}
                buttons={buttons}
                // rowHeight="auto"
                // autoHeight={{ type: 'maxHeight', diff: 90 }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get(`ssrc.priceLibraryNew.view.message.title.manuallyCreatePAQ`)
                .d('手工创建价格审批查询')}
              key="manuallyCreatePAQ"
            >
              <Table columns={manualColumns} dataSet={this.tableManualDs} queryFieldsLimit={3} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
