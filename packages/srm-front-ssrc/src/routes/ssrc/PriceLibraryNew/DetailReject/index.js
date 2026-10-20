/**
 * 价格库审批结果查询（明细）
 * @date: 2020-08-18
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import moment from 'moment';
import qs from 'querystring';
import remote from 'hzero-front/lib/utils/remote';
import {
  isObject,
  isEmpty,
  filter,
  uniqWith,
  isEqual,
  differenceWith,
  isNil,
  noop,
  isArray,
  compose,
} from 'lodash';
import { Bind } from 'lodash-decorators';
import {
  Button,
  Output,
  Form,
  DataSet,
  Table,
  TextField,
  Modal,
  PerformanceTable,
  NumberField,
  Select,
  DateTimePicker,
  DatePicker,
  Lov,
  Tooltip,
  Pagination,
  CheckBox,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { numberSeparatorRender } from '@/utils/renderer';

import {
  // fetchTableInfo,
  saveTableInfo,
  releasePriceAppLib,
  fetchScopeTabs,
  fetchPriceLibHeaderConfig,
  fetchHistoryInfo,
  fetchPriceLibUpdateData,
  deleteApproveLines,
  fetchPriceLibData,
} from '@/services/priceLibraryNewService';
import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';
import { createC7nPagination, getEditPerformanceTableData } from '@/utils/utils';
import { basicFormDS, TableDS, relevantQueryFormDS } from './lineDS';
import ApplicationScope from '../Update/ApplicationScope';
import OperationRecord from '../OperationRecord';
import {
  ladderQuotationTableDS,
  ladderQuotationFormDS,
  scopeTableDS,
  relevantPriceDS,
} from '../Update/lineDS';
import { operationDS } from '../operationDS';
import style from '../index.less';
import commonStyle from '../common.less';
import RelevantPrice from '../RelevantPrice';
import { renderValidStatu, getRuleDefinition, getPriceEditField } from '../util';

const organizationId = getCurrentOrganizationId();
const modalKey = Modal.key();
let scopeModal;
let _modal;

class Detail extends React.Component {
  constructor(props) {
    super(props);
    const routerParams = qs.parse(this.props.location.search.substr(1));
    this.state = {
      routerParams,
      viewCode: routerParams.viewCode || '',
      activeKey: 'approvalHistory', // 默认选中的tab
      historyData: [],
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      queryLoading: false,
      saveLoading: false,
      releaseLoading: false,
      checkData: [], // 选中数据
      checkValues: [], // 选中值
      ladderQuotationFields: [], // 阶梯报价form列
      relevantColumnList: [], // 相关价格动态列
      currentRecord: {}, // 当前操作行
      ruleDefinition: [],
      relevantPriceFieldConfig: {}, // 相关价格field配置
      currencyCodeFlag: true, // 是否有币种
    };
  }

  basicFormDs = new DataSet(
    basicFormDS(
      {
        templateCode: this.props.match.params.templateCode,
        requestId: qs.parse(this.props.location.search.substr(1)).requestId,
      },
      []
    )
  );

  tableDs = new DataSet(
    TableDS(
      {
        requestId: qs.parse(this.props.location.search.substr(1)).requestId,
        templateCode: this.props.match.params.templateCode,
      },
      []
    )
  );

  ladderQuotationFormDs = new DataSet(ladderQuotationFormDS());

  ladderQuotationTableDs = new DataSet(ladderQuotationTableDS());

  relevantPriceDs = new DataSet(
    relevantPriceDS({ requestStatus: qs.parse(this.props.location.search.substr(1)).requestStatus })
  );

  relevantQueryFormDs = new DataSet(relevantQueryFormDS());

  scopeTableDs = new DataSet(scopeTableDS());

  operationDs = new DataSet(operationDS());

  relevantSearchBarRef = null; // 相关价格筛选器ref

  componentDidMount() {
    this.fetchPriceLibHeaderConfig();
    this.basicFormDs.query().then(() => {
      this.queryRuleDefinition();
    });
  }

  componentWillUnmount() {
    this.setState({
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      queryLoading: false,
      checkData: [], // 选中数据
      checkValues: [], // 选中值
      ladderQuotationFields: [],
    });
  }

  @Bind()
  async queryRuleDefinition() {
    getRuleDefinition().then((res) => {
      this.setState({ ruleDefinition: res });
      // 触发fieldType的重新渲染
      this.tableDs.setState({
        ruleDefinition: res,
      });
    });
  }

  /**
   * 查询价格库表格数据
   */
  @Bind()
  async fetchPriceLibData(page = {}) {
    const {
      routerParams: { viewCode = '' },
      checkData = [],
      pagination = {},
    } = this.state;
    const {
      match: { params },
    } = this.props;

    // 当改变pageSize后, 需要手动的更新page
    if (!isEmpty(pagination) && !isEmpty(page)) {
      const { pageSize: prePageSize } = pagination;
      const { pageSize } = page;
      if (prePageSize !== pageSize) {
        Object.assign(page, {
          page: 1,
        });
      }
    }

    const param = {
      viewCode,
      pagination: page,
      templateCode: params.templateCode,
      from: 'APPROVE_REJECT',
      requestId: qs.parse(this.props.location.search.substr(1)).requestId,
    };
    this.setState({ queryLoading: true });
    fetchPriceLibUpdateData(param)
      .then((res) => {
        const result = getResponse(res);
        if (result && Array.isArray(result.content)) {
          // 更新checkData数据,原本编辑数据更新成列表数据，避免列表和checkData数据不一致
          let newCheckData = [];
          if (!isEmpty(checkData)) {
            const priceLibIdList = result?.content?.map((r) => r.priceLibId);
            newCheckData = checkData.map((r) => {
              if (priceLibIdList.includes(r.priceLibId) && r.record && r._status) {
                return result?.content?.find((item) => item.priceLibId === r.priceLibId);
              } else {
                return r;
              }
            });
          }
          this.setState({
            tableData: result.content,
            pagination: createC7nPagination(result),
            checkData: newCheckData,
          });
        }
      })
      .finally(() => {
        this.setState({ queryLoading: false });
      });
  }

  /**
   * 查询价格库相关价格表格数据
   */
  @Bind()
  async fetchPriceLibRelevantData(page = {}) {
    const {
      viewCode,
      relevantColumnList = [],
      currentRecord = {},
      relevantPriceFieldConfig = {},
    } = this.state;
    const { priceLibId, fromPriceLibId } = currentRecord;
    const { dimensionId } = relevantPriceFieldConfig;
    // const queryData = this.relevantQueryFormDs.toData()[0];
    // 获取相关价格筛选器数据
    const queryData = filterNullValueObject(this.relevantSearchBarRef?.getQueryParameter()) || {};
    const { requestStatus } = qs.parse(this.props.location.search.substr(1));
    const queryParams = {};
    let queryLoading = false;
    let result = {};

    const relevantProps = {
      templateCode: this.props.match.params.templateCode,
      onQuery: this.fetchPriceLibRelevantData,
      onRef: this.handleRelevantRef,
      columnList: relevantColumnList,
      onAfterQueryFields: this.handleRelevantAfterQueryFields,
    };

    for (const key in queryData) {
      // 日期数字 特殊处理
      // if (queryData[key]?.start || queryData[key]?.end) {
      if (key.includes('_range')) {
        Object.assign(queryParams, {
          [key.split('_')?.[0]]: JSON.stringify({
            from: queryData[key].split(',')?.[0],
            to: queryData[key].split(',')?.[1],
          }),
        });
      } else if (Array.isArray(queryData[key])) {
        // 下拉框 值集 多选处理
        Object.assign(queryParams, { [key]: queryData[key].toString() });
      } else if (!isObject(queryData[key])) {
        Object.assign(queryParams, { [key]: queryData[key] });
      }
    }
    const params = {
      viewCode,
      priceLibId,
      dimensionId,
      fromPriceLibId,
      pagination: page,
      shieldDimCodes: 'relevantPrice',
      templateCode: this.props.match.params.templateCode,
      from:
        requestStatus === 'APPROVING' || requestStatus === 'APPROVE_SUCCESS'
          ? 'APPROVE_RELEVANT_PRICE'
          : 'RELEVANT_PRICE',
      ...queryParams,
    };
    queryLoading = true;
    fetchPriceLibData(params)
      .then((res) => {
        if (res && Array.isArray(res.content)) {
          result = res;
          // 更新相关价格model
          _modal.update({
            children: (
              <RelevantPrice
                tableData={res.content}
                pagination={createC7nPagination(res)}
                queryLoading={queryLoading}
                {...relevantProps}
              />
            ),
          });
        }
      })
      .finally(() => {
        queryLoading = false;
        // 更新相关价格model
        _modal.update({
          children: (
            <RelevantPrice
              tableData={result.content}
              pagination={createC7nPagination(result)}
              queryLoading={queryLoading}
              {...relevantProps}
            />
          ),
        });
      });
  }

  /**
   * 展示链接页面
   * @param {Object} rowData - 行记录
   * @param {Object} field - 列配置
   */
  @Bind()
  handleShowLinkTargetPage(rowData, field) {
    const title = rowData[field.dimensionCode];
    const iframeUrl = rowData[`${field.dimensionCode}Href`];
    const width = rowData[`${field.dimensionCode}WindowWidth`];
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
   * 删除
   */
  @Bind()
  handleDelete() {
    const { checkValues = [], checkData = [], tableData = [], pagination } = this.state;
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get(`ssrc.priceLibraryNew.view.modal.deleteLineNotification`)
        .d('确定要删除该行吗?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        checkData.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          // 过滤出勾选数据的剩下数据
          const newTableData = filter(tableData, (item) => {
            return checkValues.indexOf(item.priceLibId) < 0;
          });
          this.setState({ tableData: newTableData, checkData: [], checkValues: [] });
        } else {
          // 真数据删除后若存在假数据，查询后会丢失，c7n也是这样的
          const data = checkData.map((item) => {
            const { record, ...otherItem } = item;
            return otherItem;
          });
          deleteApproveLines({
            data,
            requestId: qs.parse(this.props.location.search.substr(1)).requestId,
          }).then((res) => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              // this.fetchPriceLibData(pagination);
              this.setState({ checkData: [], checkValues: [] }, () =>
                this.fetchPriceLibData(pagination)
              );
            }
          });
        }
      },
    });
  }

  /**
   * 编辑
   * record 行信息
   */
  @Bind()
  handelEdit(rowData, rowIndex) {
    const { tableData = [], checkData = [], checkValues = [] } = this.state;
    // 取到所有field的name，LOV,MapList,benchmarkPriceType取defaultValue，其他field给null ，绕开rowData中没有的ds中的field，在create时，field会给到defaultValue
    const fields = this.tableDs.fields.toJS();
    let fieldsValue = {};
    for (const [index] of fields) {
      if (!index.includes('LOV') && !index.includes('MapList') && index !== 'benchmarkPriceType') {
        fieldsValue = { ...fieldsValue, [index]: null };
      }
    }
    const row = { ...fieldsValue, ...rowData };
    let newCheckData = [];
    if (!rowData.record) {
      const record = this.tableDs.create(row, rowIndex);
      Object.assign(rowData, { record });
    }
    // 更新勾选框中的数据
    if (checkValues.includes(rowData.priceLibId)) {
      newCheckData = checkData.map((r) => {
        if (r.priceLibId === rowData.priceLibId) {
          return { ...rowData, _status: 'update' };
        }
        return r;
      });
    }
    const newTableData = tableData;
    newTableData[rowIndex] = { ...rowData, _status: 'update' };
    this.setState(
      {
        tableData: newTableData,
        checkData: newCheckData,
      },
      () => this.forceUpdate()
    );
  }

  /**
   * 取消 - 编辑
   * record 行信息
   */
  @Bind()
  handelCancel(rowData, rowIndex) {
    const { tableData = [], checkData = [], checkValues = [] } = this.state;
    const newTableData = tableData;
    let newCheckData = [];
    // 更新勾选框中的数据
    if (checkValues.includes(rowData.priceLibId)) {
      newCheckData = checkData.map((r) => {
        if (r.priceLibId === rowData.priceLibId) {
          return { ...rowData, _status: undefined };
        }
        return r;
      });
    }
    newTableData[rowIndex] = {
      ...rowData,
      record: undefined,
      _status: undefined,
    };
    // eslint-disable-next-line no-unused-expressions
    rowData.record?.reset();
    this.setState(
      {
        tableData: newTableData,
        checkData: newCheckData,
      },
      () => this.forceUpdate()
    );
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
        format = 'YYYY-MM-DD HH:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD HH:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  @Bind()
  renderTextDisplay(rowData, item, name) {
    const dimensionCode = item?.dimensionCode;
    const rowDataValue = rowData[name];
    let value;
    switch (dimensionCode) {
      case 'netPrice':
      case 'taxIncludedPrice':
      case 'perTaxIncludedPrice':
      case 'perNetPrice':
        value = numberSeparatorRender(rowDataValue);
        break;
      case 'approvalStatus':
      case 'priceLibraryStatus':
        value = renderValidStatu(rowData[dimensionCode], rowDataValue);
        break;
      default:
        value = rowDataValue;
    }
    return isNil(value) || isEmpty(value) ? (
      value
    ) : (
      <Tooltip placement="bottomLeft" title={value}>
        {value}
      </Tooltip>
    );
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
    const newObject = item.newAppointValue; // 处理接口查询值为明文的情况
    switch (item.ruleExpression) {
      case 'EQUAL':
        condition = [object, newObject].includes(subject);
        break;
      case 'NOT_EQUAL':
        condition = ![object, newObject].includes(subject);
        break;
      case 'IS_NULL':
        condition = !subject;
        break;
      case 'NOT_NULL':
        condition = !!subject;
        break;
      case 'BE_CONTAIN':
        condition = object
          ? object.split(',').includes(subject) || newObject?.split(',').includes(subject)
          : false;
        break;
      case 'NOT_CONTAIN':
        condition = !(object
          ? object.split(',').includes(subject) || newObject?.split(',').includes(subject)
          : false);
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
  evalExpression = (fn) => {
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
      return Number(field.fieldEditable) === 0;
    } else if (field?.editPriceLibRuleHeader?.priceLibRuleCombList) {
      // 组合条件有值
      if (field.editPriceLibRuleHeader.priceLibRuleCombList?.[0]?.combExpression) {
        const { combExpression } = field.editPriceLibRuleHeader.priceLibRuleCombList[0];
        const conditionExpression = this.formatCombExpression(
          combExpression,
          field.editPriceLibRuleHeader.priceLibRuleLineList,
          record
        );
        const conditionFlag = this.evalExpression(conditionExpression);
        return (
          (Number(field.fieldEditable) === 0 && conditionFlag) ||
          (Number(field.fieldEditable) === 1 && !conditionFlag)
        );
      } else {
        return Number(field.fieldEditable) === 0;
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
    } else if (field.requiredPriceLibRuleHeader?.priceLibRuleCombList) {
      // 组合条件有值
      if (field.requiredPriceLibRuleHeader.priceLibRuleCombList?.[0]?.combExpression) {
        const { combExpression } = field.requiredPriceLibRuleHeader.priceLibRuleCombList[0];
        const conditionExpression = this.formatCombExpression(
          combExpression,
          field.requiredPriceLibRuleHeader.priceLibRuleLineList,
          record
        );
        const conditionFlag = this.evalExpression(conditionExpression);
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
   * 设置供应商lov props
   */
  @Bind()
  getSupplierLovProps = (field = {}, record) => {
    const queryData = {
      srmFlag: 1,
      ...(this.renderQueryParams(field, record) || {}),
    };

    const supplierLovProps = {
      clearButton: false,
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
      },
    };

    return {
      // queryParams: {}, // 初始化查询参数 url
      queryData, // 初始化查询参数 body payload
      ...supplierLovProps,
    };
  };

  // 渲染编辑组件
  @Bind()
  renderEditorField(field, rowData) {
    const { currencyCodeFlag } = this.state;
    const { fieldWidget, dimensionCode, sourceCode } = field;
    const { record } = rowData;
    const displayValue = rowData[dimensionCode];
    switch (fieldWidget) {
      case 'INPUT_NUMBER':
        // 含税未税，每一含税未税，全球化
        if (
          ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
            dimensionCode
          )
        ) {
          // 如果有币种，用币种的精度，不然就是维度配置的
          const expandProps = currencyCodeFlag
            ? {}
            : {
                precision: field.numberPrecision,
              };
          return (
            <C7nPrecisionInputNumber
              name={dimensionCode}
              record={record}
              currency="currencyCode"
              {...expandProps}
            />
          );
        }
        return <NumberField name={dimensionCode} record={record} />;
      case 'LOV':
        // 供应商组件
        if (
          dimensionCode === 'supplierCompanyId' &&
          ['SSLM.SUPPLIER', 'SPRM.SUPPLIER_FOR_SPC'].includes(sourceCode)
        ) {
          // 固定值
          const { ...resetProps } = this.getSupplierLovProps(field, record);
          return (
            <SupplierLov {...resetProps} name={`${dimensionCode}LOV`} dataSet={this.tableDs} />
          );
        }
        return <Lov name={`${dimensionCode}LOV`} record={record} />;
      case 'SELECT':
        return <Select name={dimensionCode} record={record} />;
      case 'SWITCH':
        return <CheckBox name={dimensionCode} record={record} />;
      case 'DATE_PICKER':
        if (
          field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
        ) {
          return <DateTimePicker name={dimensionCode} record={record} />;
        }
        return <DatePicker name={dimensionCode} record={record} />;
      case 'INPUT':
      case 'LINK':
        switch (dimensionCode) {
          case 'relevantPrice': // 相关价格
            return <a onClick={() => this.showRelevantPrice(rowData, field)}>{displayValue}</a>;
          case 'ladderQuotation': // 阶梯报价
            return <a onClick={() => this.showLadderQuotation(rowData)}>{displayValue}</a>;
          case 'applicationScope': // 适用范围
            return <a onClick={() => this.showApplicationScope(rowData)}>{displayValue}</a>;
          default:
            return <TextField name={dimensionCode} record={record} valueChangeAction="input" />;
        }
      case 'LONG_INPUT':
        return (
          <TextArea
            name={dimensionCode}
            record={record}
            resize
            rows={1}
            valueChangeAction="input"
          />
        );
      case 'UPLOAD':
        return this.renderEditable(field, record) ? (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={rowData[field.dimensionCode]}
            filePreview
            viewOnly
          />
        ) : (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={rowData[field.dimensionCode]}
            afterOpenUploadModal={(attUuid) => {
              record.set(`${field.dimensionCode}`, attUuid);
            }}
            fileSize={FIlESIZE}
            filePreview
          />
        );
      default:
        return <Output name={dimensionCode} record={record} />;
    }
  }

  // 处理显示单元格,9种类型
  @Bind()
  renderEditorDisplay(field, rowData) {
    const { fieldWidget, dimensionCode } = field;
    const { record } = rowData;
    const displayValue = rowData[dimensionCode];
    let display;
    switch (fieldWidget) {
      case 'INPUT_NUMBER':
      case 'SELECT':
      case 'INPUT':
      case 'LONG_INPUT':
        display = <Output name={dimensionCode} record={record} />;
        break;
      case 'LOV':
        display = <Output name={`${dimensionCode}LOV`} record={record} />;
        break;
      case 'SWITCH':
        display = (
          <Output
            name={dimensionCode}
            record={record}
            renderer={({ value }) => yesOrNoRender(value)}
          />
        );
        break;
      case 'DATE_PICKER':
        display = (
          <Output
            name={dimensionCode}
            record={record}
            renderer={({ value }) =>
              value && moment(value).format(this.renderDateFormat(field.dateFormat))
            }
          />
        );
        break;
      case 'UPLOAD':
        display = (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={displayValue}
            filePreview
            viewOnly
          />
        );
        break;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'relevantPrice': // 相关价格
            display = <a onClick={() => this.showRelevantPrice(rowData, field)}>{displayValue}</a>;
            break;
          case 'ladderQuotation': // 阶梯报价
            display = <a onClick={() => this.showLadderQuotation(rowData)}>{displayValue}</a>;
            break;
          case 'applicationScope': // 适用范围
            display = <a onClick={() => this.showApplicationScope(rowData)}>{displayValue}</a>;
            break;
          default:
            if (rowData[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW') {
              // 弹窗
              display = (
                <a onClick={() => this.handleShowLinkTargetPage(rowData, field)}>{displayValue}</a>
              );
            } else {
              display = (
                <a
                  href={rowData[`${field.dimensionCode}Href`]}
                  title={rowData[`${field.dimensionCode}Title`]}
                  target={
                    rowData[`${field.dimensionCode}OpenMethod`] === 'NEW_WINDOW'
                      ? '_blank'
                      : '_self'
                  }
                >
                  {displayValue}
                </a>
              );
            }
            break;
        }
        break;
      default:
        display = <Output name={dimensionCode} record={record} />;
    }
    return display;
  }

  // 处理显示单元格
  @Bind()
  renderDisplay(field, rowData) {
    const { fieldWidget, dimensionCode } = field;
    const displayValue = rowData[dimensionCode];
    let display;
    switch (fieldWidget) {
      case 'LOV':
      case 'SELECT':
        display =
          isNil(rowData[`${dimensionCode}Meaning`]) ||
          isEmpty(rowData[`${dimensionCode}Meaning`]) ? (
            rowData[`${dimensionCode}Meaning`]
          ) : (
            <Tooltip placement="bottomLeft" title={rowData[`${dimensionCode}Meaning`]}>
              {rowData[`${dimensionCode}Meaning`]}
            </Tooltip>
          );
        break;
      case 'SWITCH':
        display = yesOrNoRender(displayValue);
        break;
      case 'DATE_PICKER':
        display =
          isNil(displayValue) || isEmpty(displayValue) ? (
            displayValue
          ) : (
            <Tooltip
              placement="bottomLeft"
              title={moment(displayValue).format(this.renderDateFormat(field.dateFormat))}
            >
              {displayValue && moment(displayValue).format(this.renderDateFormat(field.dateFormat))}
            </Tooltip>
          );
        break;
      case 'UPLOAD':
        display = (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={displayValue}
            filePreview
            viewOnly
          />
        );
        break;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'relevantPrice': // 相关价格
            display = <a onClick={() => this.showRelevantPrice(rowData, field)}>{displayValue}</a>;
            break;
          case 'ladderQuotation': // 阶梯报价
            display = <a onClick={() => this.showLadderQuotation(rowData)}>{displayValue}</a>;
            break;
          case 'applicationScope': // 适用范围
            display = <a onClick={() => this.showApplicationScope(rowData)}>{displayValue}</a>;
            break;
          default:
            if (rowData[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW') {
              // 弹窗
              display = (
                <a onClick={() => this.handleShowLinkTargetPage(rowData, field)}>{displayValue}</a>
              );
            } else {
              display = (
                <a
                  href={rowData[`${field.dimensionCode}Href`]}
                  title={rowData[`${field.dimensionCode}Title`]}
                  target={
                    rowData[`${field.dimensionCode}OpenMethod`] === 'NEW_WINDOW'
                      ? '_blank'
                      : '_self'
                  }
                >
                  {displayValue}
                </a>
              );
            }
            break;
        }
        break;
      default:
        display =
          isNil(displayValue) || isEmpty(displayValue) ? (
            displayValue
          ) : (
            <Tooltip placement="bottomLeft" title={displayValue}>
              {displayValue}
            </Tooltip>
          );
    }
    return display;
  }

  /**
   * 编辑render
   */
  @Bind()
  editCell({ field = {}, rowData = {} }) {
    if (rowData._status === 'create' || rowData._status === 'update') {
      if (rowData.record) {
        return this.renderEditorField(field, rowData);
      } else {
        return this.renderEditorDisplay(field, rowData);
      }
    } else {
      return this.renderDisplay(field, rowData);
    }
  }

  /**
   * 渲染fieldType
   */
  @Bind()
  renderFieldType(field, currencyCodeFlag) {
    let fieldConfig = {};
    const dynamicProps = {
      dynamicProps: {
        required: ({ record }) => this.renderRequired(field, record),
        disabled: ({ record, dataSet }) => {
          const { dimensionCode } = field;
          const ruleDefinition = dataSet.getState('ruleDefinition');
          if (['netPrice', 'taxIncludedPrice'].includes(dimensionCode)) {
            const editField = getPriceEditField(record, ruleDefinition, {
              templateCode: this.props.match.params.templateCode,
            });
            return (
              (dimensionCode === 'netPrice' && editField !== 'NET_PRICE') ||
              (dimensionCode === 'taxIncludedPrice' && editField !== 'TAX_INCLUDED_PRICE')
            );
          }
          return this.renderEditable(field, record);
        },
      },
    };

    const { dimensionCode } = field;

    const displayField = field.priceLibDimMapList?.find(
      (n) => n.targetDimensionCode === dimensionCode
    )?.sourceFromFieldMeaning;
    const valueField = field.priceLibDimMapList?.find(
      (n) => n.targetDimensionCode === dimensionCode
    )?.sourceFromFieldName;

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
            disabled: ({ record }) => this.renderEditable(field, record),
          },
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          textField: displayField || field.displayField,
          valueField: valueField || field.valueField,
          dynamicProps: {
            // 设置lov查询参数
            lovPara: ({ record }) => this.renderQueryParams(field, record),
            required: ({ record }) => this.renderRequired(field, record),
            disabled: ({ record }) => this.renderEditable(field, record),
          },
          // multiple: Number(field.multipleFlag) === 1,
          // transformRequest: value => (isObject(value) ? value[field.valueField] : value),
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
          step:
            currencyCodeFlag &&
            ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
              dimensionCode
            )
              ? null
              : field.numberPrecision || field.numberPrecision === 0
              ? math.div(1, math.pow(10, field.numberPrecision))
              : null,
          min: field.numberMin !== null ? new BigNumber(field.numberMin) : undefined,
          max: field.numberMax !== null ? new BigNumber(field.numberMax) : undefined,
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
          transformResponse: (val) => (isNil(val) ? val : Number(val)),
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
   * 渲染列居左居中居右
   */
  @Bind()
  renderAlign(field) {
    let align = 'left';
    switch (field.fieldWidget) {
      case 'INPUT_NUMBER':
        align = 'right';
        break;
      default:
        align = 'left';
        break;
    }
    return align;
  }

  /**
   * 渲染queryField,查询表单列
   * 链接，上传，不可作查询条件
   */
  @Bind()
  renderQueryField(field) {
    let queryField;
    switch (field.fieldWidget) {
      case 'INPUT':
        queryField = <TextField name={field.dimensionCode} />;
        break;
      case 'INPUT_NUMBER':
        queryField = <NumberField name={field.dimensionCode} />;
        break;
      case 'SELECT':
        queryField = <Select name={field.dimensionCode} />;
        break;
      case 'LOV':
        queryField = <Lov name={field.dimensionCode} />;
        break;
      case 'DATE_PICKER':
        queryField =
          field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          field.dateFormat === 'yyyy-MM-dd hh:mm:ss' ? (
            <DateTimePicker name={field.dimensionCode} />
          ) : (
            <DatePicker name={field.dimensionCode} />
          );
        break;
      case 'SWITCH':
        queryField = <Select name={field.dimensionCode} />;
        break;
      default:
        queryField = <TextField name={field.dimensionCode} />;
        break;
    }
    return queryField;
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
  async fetchPriceLibHeaderConfig(queryDs, relevantPriceParams) {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: params.templateCode,
        from: 'EDIT',
        shieldDimCodes: relevantPriceParams ? 'relevantPrice' : 'priceLibraryStatus',
        relevantPriceFlag: relevantPriceParams ? 1 : 0,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const columnList = [];
      const queryFields = [];
      const ladderQuotationFields = [];
      // 判断是否有币种
      const currencyCodeFlag = list.some(
        (item) => item.dimensionCode === 'currencyCode' && item.fieldVisible
      );
      list.forEach((item) => {
        // 显示或者基准价维度,添加dsField
        if (
          (Number(item.fieldVisible) || item.dimensionCode === 'benchmarkPriceType') &&
          isEmpty(relevantPriceParams)
        ) {
          // 组件类型是lov
          if (item.fieldWidget === 'LOV') {
            const displayField = item.priceLibDimMapList?.find(
              (n) => n.targetDimensionCode === item.dimensionCode
            )?.sourceFromFieldMeaning;
            const valueField = item.priceLibDimMapList?.find(
              (n) => n.targetDimensionCode === item.dimensionCode
            )?.sourceFromFieldName;

            this.tableDs.addField(`${item.dimensionCode}LOV`, {
              name: `${item.dimensionCode}LOV`,
              label: item.dimensionName,
              ignore: 'always',
              ...this.renderFieldType(item, currencyCodeFlag),
            });
            this.tableDs.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${valueField || item.valueField}`,
              defaultValue: item.defaultValue,
            });
            this.tableDs.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${displayField || item.displayField}`,
              defaultValue: item.defaultValueMeaning,
            });
            // 设置值集映射关系
            this.tableDs.addField(`${item.dimensionCode}MapList`, {
              name: `${item.dimensionCode}MapList`,
              defaultValue: item.priceLibDimMapList,
              ignore: 'always',
            });
          } else {
            this.tableDs.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              label: item.dimensionName,
              // required: Number(item.fieldRequired) === 1,
              defaultValue:
                item.fieldWidget === 'SWITCH' ? Number(item.defaultValue) : item.defaultValue,
              ...this.renderFieldType(item, currencyCodeFlag),
            });
          }
          // 阶梯报价动态增加field
          if (
            item.dimensionCode === 'itemId' ||
            item.dimensionCode === 'itemCategoryId' ||
            item.dimensionCode === 'currencyCode'
          ) {
            this.ladderQuotationFormDs.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              label: item.dimensionName,
            });
            ladderQuotationFields.push(<Output name={`${item.dimensionCode}Meaning`} />);
          }
        }
        // 查询条件
        if (item.queryFlag && queryDs) {
          queryDs.addField(item.dimensionCode, {
            name: item.dimensionCode,
            label: item.dimensionName,
            ...this.renderQueryFieldType(item),
          });
          queryFields.push(this.renderQueryField(item));
        }

        // table column
        if (Number(item.fieldVisible)) {
          columnList.push({
            dataIndex:
              item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
            key: item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: this.renderAlign(item),
            hideable: false, // 无法隐藏列
            render: ({ rowData }) => {
              return this.editCell({
                rowData,
                field: item,
              });
            },
          });
        }
      });

      if (!isEmpty(relevantPriceParams)) {
        const relevantColumns = [
          ...columnList,
          {
            title: intl.get('ssrc.priceLibraryNew.model.library.operation').d('操作记录'),
            flexGrow: 1,
            minWidth: 120,
            dataIndex: 'operation',
            key: 'operation',
            render: ({ rowData }) => (
              <a onClick={() => this.showOperation(rowData, 'APPLICATION_SCOPE')}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            ),
          },
        ];
        this.setState({ relevantColumns, relevantQueryFields: queryFields });
        this.fetchPriceLibRelevantData({}, relevantPriceParams);
      } else {
        this.setState({ columnList, queryFields, currencyCodeFlag });
        this.fetchPriceLibData();
      }
    }
  }

  @Bind()
  async operateHistory() {
    const { requestId, businessKey } =
      this.basicFormDs?.current?.get(['businessKey', 'requestId']) || {};
    if (!(requestId && businessKey)) return;
    let filterBarRef = null;
    const modalProps = {
      approvalRecords: await fetchHistoryInfo(businessKey),
      docId: requestId,
      docType: 'MAIN_REQ',
      title: `【${intl.get('ssrc.priceLibraryNew.view.title.priceApproval').d('价格审批')}】`,
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      style: {
        width: '742px',
      },
      drawer: true,
      children: (
        <OperationRecord
          {...modalProps}
          onRef={(ref) => {
            filterBarRef = ref;
          }}
        />
      ),
      footer: (okBtn) => (
        <div>
          {okBtn}
          <ExportBtn
            documentId={requestId}
            documentType="MAIN_REQ"
            getRef={() => filterBarRef} // 直接传递拿不到ref
          />
        </div>
      ),
    });
  }

  /**
   * 展示阶梯报价
   */
  @Bind()
  showLadderQuotation(rowData) {
    const { currencyCodeFlag, ruleDefinition } = this.state;
    // 取头benchmarkPriceType
    // const benchmarkPriceType = this.tableDs.getField('benchmarkPriceType').get('defaultValue');
    // 默认都不可编辑
    let benchmarkPriceType = 'NO_PRICE';
    const { record: rec } = rowData;
    benchmarkPriceType = getPriceEditField(rec || rowData, ruleDefinition, {
      templateCode: this.props.match.params.templateCode,
    });
    this.ladderQuotationFormDs.create(rowData);

    this.ladderQuotationTableDs.setQueryParameter('priceLibId', rowData.priceLibId);
    this.ladderQuotationTableDs.setQueryParameter('benchmarkPriceType', benchmarkPriceType);
    this.ladderQuotationTableDs.setQueryParameter('taxRate', rowData.taxRate);
    this.ladderQuotationTableDs.setQueryParameter('taxIncludedFlag', rowData.taxIncludedFlag);
    this.ladderQuotationTableDs.query();
    this.ladderQuotationTableDs.setState('taxPricePrecision', rowData.taxPricePrecision);
    this.ladderQuotationTableDs.setState('netPricePrecision', rowData.netPricePrecision);

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
        editor: (record) =>
          benchmarkPriceType === 'TAX_INCLUDED_PRICE' ? (
            currencyCodeFlag ? (
              <C7nPrecisionInputNumber
                name="ladderPrice"
                record={record}
                headerRecord={rowData.record || rowData}
                currency="currencyCode"
              />
            ) : (
              true
            )
          ) : (
            false
          ),
        renderer: ({ value, dataSet }) =>
          numberSeparatorRender(value, dataSet.getState('currency_precision')),
      },
      {
        name: 'ladderNetPrice',
        width: 100,
        tooltip: 'overflow',
        editor: (record) =>
          benchmarkPriceType === 'NET_PRICE' ? (
            currencyCodeFlag ? (
              <C7nPrecisionInputNumber
                name="ladderNetPrice"
                record={record}
                headerRecord={rowData.record || rowData}
                currency="currencyCode"
              />
            ) : (
              true
            )
          ) : (
            false
          ),
        renderer: ({ value, dataSet }) =>
          numberSeparatorRender(value, dataSet.getState('currency_precision')),
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
      footer: (_okBtn) => _okBtn,
      closable: true,
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      children: (
        <React.Fragment>
          <Form dataSet={this.ladderQuotationFormDs} columns={2}>
            <Output name="itemIdMeaning" />
            <Output name="itemCategoryIdMeaning" />
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
  async showApplicationScope(rowData) {
    const scopeProps = {
      tableDs: this.scopeTableDs,
      priceLibId: rowData.priceLibId,
      templateId: rowData.templateId,
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
        width: '1090px',
      },
      footer: (_okBtn) => _okBtn,
      closable: true,
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      bodyStyle: { padding: 0 },
      children: <ApplicationScope tabsData={[]} {...scopeProps} />,
      afterClose: () => {
        this.applicationScope.setState({ activeKey: '' });
      },
    });

    // 查询tab页数据
    this.fetchScopeTabs(rowData);
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record, docType) {
    this.operationDs.setQueryParameter('queryParams', {
      docType,
      docId: record.priceLibId,
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
   * 通用列逻辑处理
   * @param {*} list - 查询列集合
   */
  handleCommonColumns(list = []) {
    if (!isArray(list) || isEmpty(list)) return [];
    const columnList = [];
    list.forEach((item) => {
      const name =
        item.fieldWidget === 'LOV' || item.fieldWidget === 'SELECT'
          ? `${item.dimensionCode}Meaning`
          : item.dimensionCode;
      // 表格列
      if (Number(item.fieldVisible)) {
        // 当前日期距离有效期至小于等于30天时，报价有效期从和至标红显示
        if (
          item.fieldWidget === 'UPLOAD' ||
          item.fieldWidget === 'LINK' ||
          item.fieldWidget === 'SWITCH' ||
          item.fieldWidget === 'DATE_PICKER'
          // ||
          // item.dimensionCode === 'validDateFrom' ||
          // item.dimensionCode === 'validDateTo'
        ) {
          columnList.push({
            dataIndex: name,
            key: name,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: this.renderAlign(item),
            render: ({ rowData }) => this.renderDisplay(rowData, item),
          });
        } else {
          columnList.push({
            dataIndex: name,
            key: name,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: this.renderAlign(item),
            render: ({ rowData }) =>
              // 含税单价未税单价，千分位分割
              this.renderTextDisplay(rowData, item, name),
          });
        }
      }
    });
    return columnList;
  }

  @Bind()
  handleRelevantAfterQueryFields(list = []) {
    const columnList = this.handleCommonColumns(list);
    this.setState({
      relevantColumnList: [
        ...columnList,
        {
          title: intl.get('ssrc.priceLibraryNew.model.library.operation').d('操作记录'),
          flexGrow: 1,
          minWidth: 120,
          dataIndex: 'operation',
          key: 'operation',
          render: ({ rowData }) => (
            <a onClick={() => this.showOperation(rowData, 'APPLICATION_SCOPE')}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ),
        },
      ],
    });
  }

  // 相关价格
  @Bind()
  handleRelevantRef(vnode) {
    this.relevantSearchBarRef = vnode;
  }

  /**
   * 展示相关价格弹框
   */
  @Bind()
  showRelevantPrice(record, field) {
    const {
      match: { params },
    } = this.props;
    const { relevantColumnList = [] } = this.state;
    const relevantProps = {
      from: 'EDIT',
      templateCode: params.templateCode,
      onQuery: this.fetchPriceLibRelevantData,
      onRef: this.handleRelevantRef,
      onAfterQueryFields: this.handleRelevantAfterQueryFields,
      columnList: relevantColumnList,
    };
    this.setState(
      {
        currentRecord: record,
        relevantPriceFieldConfig: field,
      },
      () => {
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
          footer: (_okBtn) => _okBtn,
          style: {
            width: '80%',
          },
          closable: true,
          okText: intl.get('ssrc.common.view.button.close').d('关闭'),
          children: <RelevantPrice {...relevantProps} />,
          afterClose: () => {
            this.setState({
              relevantColumnList: [],
              currentRecord: {},
            });
          },
        });
      }
    );

    // this.fetchPriceLibHeaderConfig(this.relevantQueryFormDs, {
    //   priceLibId: record.priceLibId,
    //   dimensionId: field.dimensionId,
    // });
  }

  /**
   * 确认发布
   */
  @Bind()
  async releasePriceLibrary() {
    const {
      history,
      match: { params },
    } = this.props;
    const { viewCode } = this.state;

    const { tableData = [] } = this.state;

    const validateData = tableData;
    // 校验新增或编辑项，绕开用this.tableDs.validate()
    Promise.all(validateData?.map((r) => r?.record?.validate(true, true))).then(async (results) => {
      if (results.every((result) => result || result === undefined)) {
        const dataSource = await getEditPerformanceTableData(validateData, ['priceLibId'], {
          templateCode: params.templateCode,
        });
        if (dataSource.length < 1) {
          notification.warning({
            message: intl
              .get('ssrc.priceLibraryNew.view.messgae.pleaseMaintainOneData')
              .d('请至少维护一条行数据!'),
          });
        } else {
          const headerData = this.basicFormDs.toData()[0];
          this.setState({ releaseLoading: true });
          releasePriceAppLib({
            ...headerData,
            priceLibMainMapList: dataSource,
            customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_REJECT_DETAIL',
          })
            .then((res) => {
              const result = getResponse(res);
              if (result) {
                notification.success();
                history.push(
                  `/ssrc/price-library-new/${params.templateCode}/approval?viewCode=${viewCode}`
                );
              }
            })
            .finally(() => {
              this.setState({ releaseLoading: false });
            });
        }
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  async savePLApproveReject() {
    const {
      match: { params },
    } = this.props;
    const { tableData = [], pagination = {} } = this.state;

    const validateData = tableData;
    // 校验新增或编辑项，绕开用this.tableDs.validate()
    Promise.all(validateData?.map((r) => r?.record?.validate(true, true))).then(async (results) => {
      if (results.every((result) => result || result === undefined)) {
        const dataSource = await getEditPerformanceTableData(validateData, ['priceLibId'], {
          templateCode: params.templateCode,
        });
        if (dataSource.length < 1) {
          notification.warning({
            message: intl
              .get('ssrc.priceLibraryNew.view.messgae.pleaseMaintainOneData')
              .d('请至少维护一条行数据!'),
          });
        } else {
          const headerData = this.basicFormDs.toData()[0];
          this.setState({ saveLoading: true });
          saveTableInfo({
            ...headerData,
            priceLibMainMapList: dataSource,
            from: 'APPROVAL_EDIT_SAVE',
            customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_REJECT_DETAIL',
          })
            .then((res) => {
              const result = getResponse(res);
              if (result) {
                notification.success();
                // this.fetchPriceLibData(pagination); // 由于引用了checkData, 接口回调中的 checkData还是有值的, 导致清空无效
                this.setState({ checkData: [], checkValues: [] }, () =>
                  this.fetchPriceLibData(pagination)
                );
                // FIX 查询头, 避免头版本不一致
                this.basicFormDs.query();
              }
            })
            .finally(() => {
              this.setState({ saveLoading: false });
            });
        }
      }
    });
  }

  /**
   * 全选-反选
   */
  @Bind()
  handleCheckAllChange(value) {
    const { checkValues = [], checkData = [], tableData = [] } = this.state;
    let newCheckValues = [];
    let newCheckData = [];
    if (value) {
      // 去除当前页勾选重复数据
      newCheckValues = uniqWith([...checkValues, ...tableData.map((i) => i.priceLibId)], isEqual);
      newCheckData = uniqWith([...checkData, ...tableData], isEqual);
    } else {
      // 去除当前页全选数据
      newCheckValues = differenceWith(
        checkValues,
        tableData.map((i) => i.priceLibId),
        isEqual
      );
      newCheckData = differenceWith(checkData, tableData, isEqual);
    }
    this.setState({
      checkValues: newCheckValues,
      checkData: newCheckData,
    });
  }

  /**
   * change勾选框
   */
  @Bind()
  handleChange(value, oldValue, rowData) {
    const { checkValues = [], checkData = [] } = this.state;
    let newCheckValues = [];
    let newCheckData = [];
    if (value) {
      newCheckValues = [...checkValues, value];
      newCheckData = [...checkData, rowData];
    } else {
      newCheckValues = checkValues.filter((item) => item !== oldValue);
      newCheckData = checkData.filter((item) => item.priceLibId !== rowData.priceLibId);
    }
    this.setState({
      checkValues: newCheckValues,
      checkData: newCheckData,
    });
    this.forceUpdate();
  }

  /**
   * 获取table列
   */
  get columns() {
    const { checkValues = [], tableData = [], columnList = [] } = this.state;
    const currentPriceLibIds = tableData.map((item) => item.priceLibId);
    return [
      {
        title: () => (
          <CheckBox
            name="controlled"
            checked={
              !isEmpty(currentPriceLibIds) &&
              currentPriceLibIds.every((item) => checkValues.includes(item))
            }
            onChange={this.handleCheckAllChange}
          />
        ),
        dataIndex: 'priceLibId',
        key: 'priceLibId',
        width: 60,
        align: 'center',
        fixed: 'left',
        verticalAlign: 'middle',
        render: ({ rowData }) => {
          return (
            <CheckBox
              name="controlled"
              value={rowData.priceLibId}
              checked={checkValues.indexOf(rowData.priceLibId) !== -1}
              onChange={(value, oldValue) => this.handleChange(value, oldValue, rowData)}
            />
          );
        },
      },
      ...columnList,
      {
        title: intl.get('hzero.common.edit').d('编辑'),
        dataIndex: 'edit',
        key: 'edit',
        width: 100,
        fixed: 'right',
        align: 'left',
        render: ({ rowData, rowIndex }) => {
          if (rowData._status === 'update') {
            return (
              <a onClick={() => this.handelCancel(rowData, rowIndex)}>
                {intl.get('hzero.common.view.button.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a onClick={() => this.handelEdit(rowData, rowIndex)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
  }

  // 凯撒易食二开
  renderExportButton = () => {
    return null;
  };

  /**
   * tab 被点击的回调
   */
  @Bind()
  changeTab(activeKey) {
    const { priceLibId, tableDs } = this.props;
    // 清空上一次查询条件数据
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet.current?.reset();
    // 查询右侧table数据
    tableDs.setQueryParameter('params', { priceLibId, dimensionCode: activeKey });
    tableDs.query();
    this.setState({
      activeKey,
    });
  }

  render() {
    const {
      match: { params },
      // loading = false,
      customizeForm,
      customizeVTable = noop,
      // eslint-disable-next-line no-shadow
      remote,
    } = this.props;
    const {
      // activeKey,
      viewCode,
      // historyData = [],
      tableData = [],
      pagination = {},
      queryLoading = false,
      checkValues = [],
      saveLoading = false,
      releaseLoading = false,
    } = this.state;
    // const historyColumnsList = [
    //   {
    //     name: 'endTime',
    //     width: 150,
    //     tooltip: 'overflow',
    //     renderer: ({ value }) => dateTimeRender(value),
    //   },
    //   {
    //     name: 'action',
    //     width: 150,
    //     tooltip: 'overflow',
    //     renderer: ({ value }) => approveNameRender(value),
    //   },
    //   {
    //     name: 'name',
    //     width: 150,
    //     tooltip: 'overflow',
    //   },
    //   {
    //     name: 'assigneeName',
    //     width: 120,
    //     tooltip: 'overflow',
    //   },
    //   {
    //     name: 'comment',
    //     width: 150,
    //     tooltip: 'overflow',
    //   },
    //   {
    //     name: 'attachmentUuid',
    //     width: 150,
    //     renderer: ({ value }) => {
    //       return (
    //         <Upload
    //           attachmentUUID={value}
    //           name="attachmentUuid"
    //           filePreview
    //           bucketName="private-bucket"
    //           bucketDirectory="hwfp02-price-library"
    //           tenantId={organizationId}
    //           viewOnly
    //         />
    //       );
    //     },
    //   },
    // ];
    const basicFormData = this.basicFormDs.toData()[0];
    const attachmentUuid = basicFormData ? basicFormData.attachmentUuid : undefined;
    const headerButtons = [
      <Button
        icon="icon icon-publish2"
        color="primary"
        onClick={this.releasePriceLibrary}
        loading={releaseLoading}
      >
        {intl.get('hzero.common.button.release').d('发布')}
      </Button>,
      <Button icon="save" onClick={this.savePLApproveReject} loading={saveLoading} funcType="flat">
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <Button icon="operation_service_request" onClick={this.operateHistory} funcType="flat">
        {intl.get('hzero.common.view.message.operateHistory').d('操作记录')}
      </Button>,
    ];
    const backPath = `/ssrc/price-library-new/${params.templateCode}/approval?viewCode=${viewCode}`;
    return (
      <React.Fragment>
        {remote ? (
          remote.render(
            'SSRC_PRICELIB_DETAIL_REJECT_RENDER_HEADER',
            <Header
              title={intl
                .get('ssrc.priceLibraryNew.view.title.priceLibraryARQ')
                .d('价格库审批结果查询(明细)')}
              backPath={backPath}
            >
              {headerButtons}
            </Header>,
            {
              templateCode: params.templateCode,
              basicFormData,
              backPath,
              headerButtons,
            }
          )
        ) : (
          <Header
            title={intl
              .get('ssrc.priceLibraryNew.view.title.priceLibraryARQ')
              .d('价格库审批结果查询(明细)')}
            backPath={backPath}
          >
            {headerButtons}
          </Header>
        )}
        <div className={style.rfxControlContainer}>
          <Content>
            <h3 className={style.title} style={{ 'padding-bottom': 0 }}>
              {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
            </h3>
            {customizeForm(
              {
                code: 'SSRC.PRICE_LIB_NEW.REQ_REJECT_DETAIL',
                dataSet: this.basicFormDs,
              },
              <Form dataSet={this.basicFormDs} columns={3} labelLayout="float">
                <TextField name="requestNum" disabled />
                <TextField name="requestStatus" disabled />
                <TextField name="realName" disabled />
                <TextField name="creationDate" disabled />
                <Attachment
                  name="attachmentUuid"
                  attachmentUUID={attachmentUuid}
                  viewMode="popup"
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="price-library-inform-reject"
                  tenantId={organizationId}
                  dataSet={this.basicFormDs}
                />
                <TextArea name="remark" clearButton colSpan={2} rowSpan={2} newLine resize />
              </Form>
            )}
          </Content>
          <Content>
            <h3 className={style.title} style={{ 'padding-bottom': 0 }}>
              {intl.get('ssrc.priceLibraryNew.model.library.price').d('价格')}
            </h3>
            <div
              style={{ paddingBottom: '10px', display: 'flex', 'justify-content': 'space-between' }}
            >
              <Button
                icon="delete"
                style={{ color: '#29bece' }}
                funcType="flat"
                onClick={() => this.handleDelete()}
                key="delete"
                disabled={isEmpty(checkValues)}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              {this.renderExportButton()}
            </div>
            {customizeVTable(
              {
                code: 'SSRC.PRICE_LIBRARY_NEW.REQ_MAIN_EDIT_LIST',
                dataSet: this.tableDs,
              },
              <PerformanceTable
                virtualized
                cellBordered
                customizable
                columnDraggable
                columnTitleEditable
                bordered={false}
                rowKey="priceLibId"
                customizedCode="SSRC.PRICE_LIBRARY_NEW.REQ_MAIN_EDIT_LIST"
                headerHeight={36}
                height={429}
                loading={queryLoading}
                columns={this.columns}
                data={tableData}
                rowHeight={38}
              />
            )}
            <Pagination
              {...pagination}
              className={style['performanceTable-pagination']}
              onChange={(page, pageSize) => this.fetchPriceLibData({ page, pageSize })}
            />
          </Content>
        </div>
      </React.Fragment>
    );
  }
}

const HOCDetail = (Comp) =>
  compose(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.PRICE_LIB_NEW.REQ_REJECT_DETAIL', // 工作流发布申请页面
        'SSRC.PRICE_LIBRARY_NEW.REQ_MAIN_EDIT_LIST', // 编辑列表
      ],
    }),
    formatterCollections({ code: ['ssrc.priceLibraryNew', 'ssrc.common'] }),
    remote({
      code: 'SSRC_PRICELIB_DETAIL_REJECT', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    })
  )(Comp);

export default HOCDetail(Detail);

export { HOCDetail, Detail };
