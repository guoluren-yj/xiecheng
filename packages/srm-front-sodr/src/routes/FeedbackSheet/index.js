/* eslint-disable no-shadow */
/**
 * 反馈单-订单进度反馈
 * @date: 2021-1-18
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { SRM_SIEC } from '_utils/config';
import {
  DataSet,
  Table,
  Button,
  TextArea,
  TextField,
  NumberField,
  Switch,
  Select,
  CheckBox,
  Lov,
  DatePicker,
  Spin,
  Tabs,
  Modal,
} from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { openTab } from 'utils/menuTab';
import { Bind, Throttle } from 'lodash-decorators';
import moment from 'moment';
import { connect } from 'dva';
import { observer } from 'mobx-react-lite';
import { isEmpty, isArray } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import {
  getResponse,
  getCurrentOrganizationId,
  getUserOrganizationId,
  getCurrentRole,
} from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import Upload from '_components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import remotes from 'utils/remote';
// import { DEBOUNCE_TIME } from 'utils/constants';
// import ExcelExport from 'components/ExcelExport';

import {
  fetchConfig,
  getStatusConfigId,
  fetchConfigReferencing,
  getImportButton,
} from '@/services/feedbackSheetService';
import qs from 'querystring';
import { lineDs, queryDs, referencingLineDs, referenceQueryDs } from './store/feedbackSheetDs';
import ExportDynamicExcel from '@/routes/components/ExportDynamicExcel';
import { BUCKET_NAME } from '../components/utils/constant';
import remoteConfig from './remote';
import styles from './index.less';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const isSupplier = getUserOrganizationId() !== organizationId;
const roleInfo = getCurrentRole();
const code = isSupplier ? 'SUPPLIER' : 'COMPANY';
const bucketName = BUCKET_NAME;
const bucketDirectory = 'sodr-order';

const DATE_TIME_FORMAT = [
  'yyyy/MM/dd hh:mm:ss',
  'yyyy/MM/dd HH:mm:ss',
  'yyyy-MM-dd hh:mm:ss',
  'yyyy-MM-dd HH:mm:ss',
];
@remotes(...remoteConfig)
@connect(({ feedbackSheet }) => ({
  // fetchLineLoading: loading.effects['feedbackSheet/fetchFeedbackLine'],
  feedbackSheet,
}))
@formatterCollections({ code: ['sodr.feedbackSheet', 'sodr.common'] })
export default class FeedbackSheet extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
      location: { search, pathname },
    } = this.props;
    const { displaySourceNum, haveSearchParams } = qs.parse(search.substr(1));
    const { templateCode } = params;
    this.state = {
      pathname,
      templateCode,
      columns: [],
      columnsReferencing: [],
      queryFields: {},
      referenceQueryFields: {},
      loading: true,
      statusConfigId: '',
      operationCode: '',
      templateName: '',
      referenceOperationList: [],
      searchType: 'TO_BE_EXECUTE',
      isButtonLoading: false,
      displaySourceNum,
      haveSearchParams,
      importFlag: 0, // 0 1表示是否显示导入按钮
    };
    this.queryDs = new DataSet(queryDs());

    this.referenceQueryDs = new DataSet(referenceQueryDs());

    this.lineDs = new DataSet({
      ...lineDs(this.queryDs),
      transport: {
        read: ({ data }) => {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/list`,
            method: 'GET',
            data: {
              ...data,
              templateCode,
            },
          };
        },
        submit: () => {
          const { statusConfigId, operationCode } = this.state;
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/save?templateCode=${templateCode}&statusConfigId=${statusConfigId}&operationCode=${operationCode}`,
            method: 'POST',
          };
        },
        destroy: () => {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data`,
            method: 'DELETE',
          };
        },
      },
    });

    this.toBeImplementedLineDs = new DataSet({
      ...lineDs(this.queryDs),
      transport: {
        read: ({ data }) => {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/list`,
            method: 'GET',
            data: {
              ...data,
              templateCode,
            },
          };
        },
        submit: () => {
          const { statusConfigId, operationCode } = this.state;
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/save?templateCode=${templateCode}&statusConfigId=${statusConfigId}&operationCode=${operationCode}`,
            method: 'POST',
          };
        },
        destroy: () => {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data`,
            method: 'DELETE',
          };
        },
      },
    });
    this.referencingLineDs = new DataSet({
      ...referencingLineDs(this.referenceQueryDs),
      transport: {
        read: ({ data }) => {
          return {
            // url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/reference-list`,
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/reference-list-new`,
            method: 'GET',
            data: {
              ...data,
              templateCode,
            },
          };
        },
        submit: () => {
          const { statusConfigId, operationCode } = this.state;
          return {
            // url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/save?templateCode=${templateCode}&statusConfigId=${statusConfigId}&operationCode=${operationCode}`,
            url: `${SRM_SIEC}/v1/${organizationId}/feedback-data/reference-save?templateCode=${templateCode}&statusConfigId=${statusConfigId}&operationCode=${operationCode}`,
            method: 'POST',
          };
        },
      },
    });
    this.configResult = [];
  }

  componentDidMount() {
    const { templateCode } = this.state;
    getStatusConfigId({ moduleCode: templateCode }).then((res) => {
      if (getResponse(res) && res && res.statusConfigId) {
        this.setState({ statusConfigId: res.statusConfigId });
        this.lineDs.setQueryParameter('statusConfigId', res.statusConfigId);
        this.toBeImplementedLineDs.setQueryParameter('statusConfigId', res.statusConfigId);
        this.referencingLineDs.setQueryParameter('statusConfigId', res.statusConfigId);
        this.getImportButton(res.statusConfigId);
      }
      this.fetchConfig('fetchConfigType').then((rec) => {
        if (rec === 'REFERENCING_DOC') {
          this.fetchConfig('fetchConfigTypeReferencing');
        }
      });
    });
    // 待执行需要，全部不需要
    this.toBeImplementedLineDs.addEventListener('update', this.handleChange);
  }

  componentWillUnmount() {
    this.toBeImplementedLineDs.removeEventListener('update', this.handleChange);
  }

  @Bind()
  handleChange({ record, name, value }) {
    // 维度
    if (name.includes('LOV')) {
      this.configResult.forEach((field) => {
        field.feedbackTemplateFieldLovMapList.forEach((item) => {
          record.set(item.targetFieldCode, value?.[item.sourceFromField]);
        });
      });
    }
  }

  @Bind()
  async getImportButton(statusConfigId) {
    const { templateCode } = this.state;
    const res = getResponse(
      await getImportButton({
        templateCode,
        statusConfigId,
      })
    );
    if (res) {
      this.setState({ importFlag: res });
    }
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchCreate() {
    const { templateCode, statusConfigId, pathname } = this.state;
    //  const {history}=this.props;
    //  console.log('history', history);
    // const { history }=this.props;

    // history.push({
    //   pathname: isSupplier? `/sodr/feedback-sheet-supplier/${templateCode}/comment-import`: `/sodr/feedback-sheet/${templateCode}/comment-import`,
    //   search: qs.stringify({
    //     statusConfigId,
    //   }),
    // });
    openTab({
      key: `/sodr/feedback-sheet/${templateCode}/comment-import`,
      path: `/sodr/feedback-sheet/${templateCode}/comment-import`,
      title: 'hzero.common.viewtitle.batchImport',
      closable: true,
      search: `statusConfigId=${statusConfigId}&pathname=${pathname}`,
      // search: querystring.stringify({
      //   key: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
      //   title: 'hzero.common.button.priceImport',
      //   action: intl.get('hzero.common.button.priceImport').d('批量创建'),
      //   args: JSON.stringify({
      //     priceLibIds: routerParams.priceLibIds,
      //     viewCode: routerParams.viewCode,
      //   }),
      // }),
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: { search },
    } = nextProps;
    const { displaySourceNum } = qs.parse(search.substr(1));
    if (this.state.haveSearchParams === '1' && this.state.displaySourceNum !== displaySourceNum) {
      this.urlSearch(displaySourceNum);
    }
  }

  @Bind()
  async fetchConfig(fetchConfigType) {
    const { templateCode, statusConfigId } = this.state;
    const columns = [];
    const queryFields = {};
    const result =
      fetchConfigType === 'fetchConfigTypeReferencing'
        ? getResponse(await fetchConfigReferencing({ templateCode, statusConfigId }))
        : getResponse(await fetchConfig({ templateCode, statusConfigId }));
    // 待执行的表格需要关联字段映射
    this.configResult =
      fetchConfigType === 'fetchConfigTypeReferencing' ? this.configResult : result;
    const {
      splitFlag,
      splitLocation,
      splitName,
      splitCamp,
      templateCreateType,
      referenceOperationList,
    } = (result && result[0]) || {};
    // 拆行/附件阵营
    const splitPermission = (splitCamp || '').includes(code);
    if (isArray(result)) {
      if (fetchConfigType === 'fetchConfigType') {
        this.setState({
          templateName: result[0]?.templateName,
          referenceOperationList:
            templateCreateType === 'REFERENCING_DOC' && isArray(referenceOperationList)
              ? referenceOperationList
              : [],
        });
      }
      result
        .sort((a, b) => a.fieldLocation - b.fieldLocation)
        .forEach((field) => {
          // 显示阵营
          const displayPermission = (field.displayCamp || '').includes(code);
          // 启用的字段
          if (field.enabledFlag) {
            if (field.componentType === 'LOV') {
              if (fetchConfigType === 'fetchConfigType') {
                this.lineDs.addField(`${field.fieldCode}LOV`, {
                  name: `${field.fieldCode}LOV`,
                  label: field.fieldName,
                  ignore: 'always',
                  dynamicProps: {
                    defaultValue: ({ record }) => {
                      return record.get('parentId') ? undefined : field.defaultValue;
                    },
                    required: ({ record }) => {
                      return record.get('parentId')
                        ? false
                        : this.getRequiredPermission(field, record);
                    },
                  },
                  ...this.renderDsConfig(field),
                });
                this.toBeImplementedLineDs.addField(`${field.fieldCode}LOV`, {
                  name: `${field.fieldCode}LOV`,
                  label: field.fieldName,
                  ignore: 'always',
                  dynamicProps: {
                    defaultValue: ({ record }) => {
                      return record.get('parentId') ? undefined : field.defaultValue;
                    },
                    required: ({ record }) => {
                      return record.get('parentId')
                        ? false
                        : this.getRequiredPermission(field, record);
                    },
                  },
                  ...this.renderDsConfig(field),
                });
                this.lineDs.addField(field.fieldCode, {
                  name: field.fieldCode,
                  label: field.fieldName,
                  type: 'string',
                  // defaultValue: item.defaultValue,
                  multiple: field.multipleFlag ? ',' : false,
                  bind: field.valueField && `${field.fieldCode}LOV.${field.valueField}`,
                });
                this.toBeImplementedLineDs.addField(field.fieldCode, {
                  name: field.fieldCode,
                  label: field.fieldName,
                  type: 'string',
                  // defaultValue: item.defaultValue,
                  multiple: field.multipleFlag ? ',' : false,
                  bind: field.valueField && `${field.fieldCode}LOV.${field.valueField}`,
                });
                this.lineDs.addField(`${field.fieldCode}Meaning`, {
                  name: `${field.fieldCode}Meaning`,
                  label: field.fieldName,
                  type: 'string',
                  // defaultValue: item.defaultValueMeaning,
                  multiple: field.multipleFlag ? ',' : false,
                  bind: field.displayField && `${field.fieldCode}LOV.${field.displayField}`,
                });
                this.toBeImplementedLineDs.addField(`${field.fieldCode}Meaning`, {
                  name: `${field.fieldCode}Meaning`,
                  label: field.fieldName,
                  type: 'string',
                  // defaultValue: item.defaultValueMeaning,
                  multiple: field.multipleFlag ? ',' : false,
                  bind: field.displayField && `${field.fieldCode}LOV.${field.displayField}`,
                });
              } else {
                this.referencingLineDs.addField(`${field.fieldCode}LOV`, {
                  name: `${field.fieldCode}LOV`,
                  label: field.fieldName,
                  ignore: 'always',
                  dynamicProps: {
                    defaultValue: ({ record }) => {
                      return record.get('parentId') ? undefined : field.defaultValue;
                    },
                    required: ({ record }) => {
                      return record.get('parentId')
                        ? false
                        : this.getRequiredPermission(field, record);
                    },
                  },
                  ...this.renderDsConfig(field),
                });
                this.referencingLineDs.addField(field.fieldCode, {
                  name: field.fieldCode,
                  label: field.fieldName,
                  type: 'string',
                  // defaultValue: item.defaultValue,
                  multiple: field.multipleFlag ? ',' : false,
                  bind: field.valueField && `${field.fieldCode}LOV.${field.valueField}`,
                });
                this.referencingLineDs.addField(`${field.fieldCode}Meaning`, {
                  name: `${field.fieldCode}Meaning`,
                  label: field.fieldName,
                  type: 'string',
                  // defaultValue: item.defaultValueMeaning,
                  multiple: field.multipleFlag ? ',' : false,
                  bind: field.displayField && `${field.fieldCode}LOV.${field.displayField}`,
                });
              }
            } else if (fetchConfigType === 'fetchConfigType') {
              this.lineDs.addField(field.fieldCode, {
                name: field.fieldCode,
                label: field.fieldName,
                dynamicProps: {
                  defaultValue: ({ record }) => {
                    return record.get('parentId') ? undefined : field.defaultValue;
                  },
                  required: ({ record }) => {
                    return record.get('parentId')
                      ? false
                      : this.getRequiredPermission(field, record);
                  },
                },
                ...this.renderDsConfig(field),
              });
              this.toBeImplementedLineDs.addField(field.fieldCode, {
                name: field.fieldCode,
                label: field.fieldName,
                dynamicProps: {
                  defaultValue: ({ record }) => {
                    return record.get('parentId') ? undefined : field.defaultValue;
                  },
                  required: ({ record }) => {
                    return record.get('parentId')
                      ? false
                      : this.getRequiredPermission(field, record);
                  },
                },
                ...this.renderDsConfig(field),
              });
            } else {
              this.referencingLineDs.addField(field.fieldCode, {
                name: field.fieldCode,
                label: field.fieldName,
                dynamicProps: {
                  defaultValue: ({ record }) => {
                    return record.get('parentId') ? undefined : field.defaultValue;
                  },
                  required: ({ record }) => {
                    return record.get('parentId')
                      ? false
                      : this.getRequiredPermission(field, record);
                  },
                },
                ...this.renderDsConfig(field),
              });
            }
            // 显示的字段
            if (displayPermission && field.displayFlag) {
              const renderDisplayFlag =
                (field.componentType === 'LOV' && !field.editorFlag) ||
                field.componentType === 'UPLOAD' ||
                field.componentType === 'LINK' ||
                (field.componentType === 'SELECT' && !field.editorFlag) ||
                (field.componentType === 'SWITCH' && !field.editorFlag);
              const columnsConfig = Object.assign({
                name: field.componentType === 'LOV' ? `${field.fieldCode}LOV` : field.fieldCode,
                width: field.fieldWidth || 200,
                minWidth: 80,
                tooltip: 'overflow',
                editor: (record) => {
                  const parentId = record.get('parentId');
                  let isEditor = this.handleCanEdit(field, parentId);
                  if (!record.data.editableFlag) isEditor = false;
                  return isEditor && !renderDisplayFlag ? (
                    field.componentType === 'LONG_INPUT' ? (
                      <TextArea name={field.fieldCode} resize="both" />
                    ) : (
                      true
                    )
                  ) : (
                    false
                  );
                },
                renderer: ({ record, text }) => {
                  if (!field.splitDisplayFlag && record.get('parentId')) {
                    return false;
                  } else if (renderDisplayFlag) {
                    return this.renderDisplay(field, record);
                  } else {
                    return text;
                  }
                },
              });
              columns.push(columnsConfig);
            }
            // 作为查询条件的字段
            if (field.searchFlag) {
              if (fetchConfigType === 'fetchConfigType') {
                queryFields[field.fieldCode] = this.getComponent(field.componentType)(
                  {
                    label: field.fieldName,
                  },
                  { dateFormat: field.dateFormat }
                );
                this.queryDs.addField(field.fieldCode, {
                  label: field.fieldName,
                  multiple: field.multipleFlag ? ',' : false,
                  transformRequest:
                    field.componentType === 'LOV'
                      ? (value) =>
                          field.multipleFlag && isArray(value)
                            ? String(value.map((i) => i[field.valueField]))
                            : value && value[field.valueField]
                      : (value) => value,
                  ...this.renderDsConfig(field),
                });
              } else {
                queryFields[field.fieldCode] = this.getComponent(field.componentType)({
                  label: field.fieldName,
                });
                this.referenceQueryDs.addField(field.fieldCode, {
                  label: field.fieldName,
                  multiple: field.multipleFlag,
                  transformRequest:
                    field.componentType === 'LOV'
                      ? (value) =>
                          field.multipleFlag && isArray(value)
                            ? String(value.map((i) => i[field.valueField]))
                            : value && value[field.valueField]
                      : (value) => value,
                  ...this.renderDsConfig(field),
                });
              }
            }
          }
        });
    }
    if (splitFlag && splitLocation === 'FIRST') {
      columns.unshift({
        name: 'split',
        width: 150,
        lock: 'left',
        header: splitName,
        renderer: ({ record }) => {
          return record.get('parentId') ? (
            false
          ) : (
            <a
              disabled={!record.get('editableFlag') || !splitPermission}
              onClick={() => this.breakUp(record)}
            >
              {splitName}
            </a>
          );
        },
      });
    }
    if (fetchConfigType === 'fetchConfigType') {
      columns.push({
        name: 'action',
        width: 150,
        lock: 'right',
        renderer: ({ record }) => {
          return (
            <span className={styles['right-column']}>
              <Upload
                btnText={intl.get('hzero.common.upload.modal.title').d('附件')}
                icon={false}
                tenantId={organizationId}
                bucketName={bucketName}
                bucketDirectory={bucketDirectory}
                attachmentUUID={record.get('feedbackUuid')}
                afterOpenUploadModal={(attUuid) => {
                  record.set(`feedbackUuid`, attUuid);
                }}
                filePreview
                viewOnly={!record.get('editableFlag') || !splitPermission}
              />
              {!!record.get('parentId') && splitPermission && (
                <a
                  disabled={!record.get('editableFlag')}
                  onClick={() => this.handleDelete([record])}
                >
                  {intl.get('hzero.common.button.enter').d('删除')}
                </a>
              )}
              {!!splitFlag && splitLocation === 'LAST' && !record.get('parentId') && (
                <a
                  disabled={!record.get('editableFlag') || !splitPermission}
                  onClick={() => this.breakUp(record)}
                >
                  {splitName}
                </a>
              )}
            </span>
          );
        },
      });
    }
    if (fetchConfigType === 'fetchConfigType') {
      if (this.state.haveSearchParams === '1') {
        this.lineDs.setQueryParameter('displaySourceNum', this.state.displaySourceNum);
        this.toBeImplementedLineDs.setQueryParameter(
          'displaySourceNum',
          this.state.displaySourceNum
        );
        this.setState({ searchType: 'ALL' });
      }
      this.lineDs.setQueryParameter('searchType', 'ALL');
      this.lineDs.query();
      this.toBeImplementedLineDs.setQueryParameter('searchType', 'TO_BE_EXECUTE');
      this.toBeImplementedLineDs.query();
      this.setState({
        columns,
        queryFields,
        loading: false,
      });
    } else {
      this.referencingLineDs.query();
      this.setState({
        columnsReferencing: columns,
        referenceQueryFields: queryFields,
        loading: false,
      });
    }
    return templateCreateType;
  }

  /**
   * 获取字段是否可编辑配置
   * @param {*} field 字段配置信息
   * @param {*} parentId 父级数据主键
   * @returns 字段是否配置可编辑
   */
  @Bind()
  handleCanEdit(field, parentId) {
    const editFlag = parentId ? 'splitEditorFlag' : 'editorFlag';
    const editPermission = this.getEditPermission(field);
    return field[editFlag] === 1 && editPermission;
    // return item[editFlag] === 1 && item.componentType === 'LONG_INPUT' ? (
    //   <TextArea name={item.fieldCode} resize="both" />
    // ) : (
    //   item[editFlag] === 1
    // );
  }

  /**
   * 获取编辑阵营权限
   * @param {*} field 字段配置
   * @returns editPermission
   */
  @Bind()
  getEditPermission(field) {
    return isArray(field.editAuthorityNameList) && !isEmpty(field.editAuthorityNameList)
      ? field.editAuthorityNameList.map((i) => i.id).includes(roleInfo.id)
      : (field.editCamp || '').includes(code);
  }

  /**
   * 获取字段必输配置（前置为可编辑）
   * @param {*} field 字段配置信息
   * @param {*} record 行记录
   */
  @Bind()
  getRequiredPermission(field, record) {
    return (
      this.getEditPermission(field) &&
      this.handleCanEdit(field, record.get('parentId')) &&
      field.requiredFlag
    );
  }

  @Bind()
  handleDelete(lines) {
    const { searchType } = this.state;
    if (searchType === 'TO_BE_EXECUTE') {
      this.toBeImplementedLineDs.delete(lines);
    } else if (searchType === 'ALL') {
      this.lineDs.delete(lines);
    }
  }

  @Bind()
  breakUp(createLineDs) {
    const defaultLine = createLineDs.toJSONData();
    const { feedbackId, hasChildFlag, ...others } = defaultLine;
    const record = this.lineDs.current;
    const toBeImplementedRecord = this.toBeImplementedLineDs.current;
    if (record.get('hasChildFlag') && !record.children) {
      this.handleExpand(false);
    } else if (!record.get('isExpand')) {
      record.set('isExpand', true);
    }
    this.lineDs.create({ ...others, parentId: this.lineDs.current.get('feedbackId') });
    // 判断父级是否被选中
    if (this.lineDs.filter((i) => i.data.parentId === record.data.feedbackId)[0].isSelected) {
      this.lineDs
        .filter((i) => i.data.parentId === record.data.feedbackId)
        .forEach((i) => this.lineDs.select(i));
    }

    if (toBeImplementedRecord.get('hasChildFlag') && !toBeImplementedRecord.children) {
      this.handleExpandtoBeImplemented(false);
    } else if (!toBeImplementedRecord.get('isExpand')) {
      toBeImplementedRecord.set('isExpand', true);
    }
    this.toBeImplementedLineDs.create({
      ...others,
      parentId: this.toBeImplementedLineDs.current.get('feedbackId'),
    });
    // 判断父级是否被选中
    if (
      this.toBeImplementedLineDs.filter(
        (i) => i.data.parentId === toBeImplementedRecord.data.feedbackId
      )[0].isSelected
    ) {
      this.toBeImplementedLineDs
        .filter((i) => i.data.parentId === toBeImplementedRecord.data.feedbackId)
        .forEach((i) => this.toBeImplementedLineDs.select(i));
    }
  }

  @Bind()
  renderDsConfig(field = {}) {
    const { remote } = this.props;
    const { templateCode } = this.state;
    let fieldConfig = {};
    switch (field.componentType) {
      case 'INPUT':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.valueSet,
          multiple: field.multipleFlag ? ',' : false,
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.valueSet,
          textField: field.displayField,
          valueField: field.valueField,
          multiple: field.multipleFlag,
          dynamicProps: {
            lovPara: ({ record }) => {
              const param = { tenantId: organizationId };
              field.feedbackTemplateFieldLovParamList.forEach((item) => {
                if (item.paramType === 'DIMENSION' && item.applyQueryFlag === 1) {
                  // 模版维度
                  param[item.paramValue] = record.get(item.paramValue);
                } else if (item.paramType === 'FIXED_VALUE' && item.applyQueryFlag === 1) {
                  param[item.paramName] = item.paramValue;
                }
              });
              return param;
            },
          },
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type: DATE_TIME_FORMAT.includes(field.dateFormat) ? 'dateTime' : 'date',
          format: this.renderDateFormat(field.dateFormat),
          transformRequest: (val) =>
            val &&
            moment(val).format(
              DATE_TIME_FORMAT.includes(field.dateFormat)
                ? 'YYYY-MM-DD HH:mm:ss'
                : 'YYYY-MM-DD 00:00:00'
            ),
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => Number(val),
        };
        break;
      case 'UPLOAD':
        break;
      default:
        break;
    }
    return remote
      ? remote.process('SODR.FEEDBACK_SHEET_PROCESS_FIELD_CONFIG', fieldConfig, {
          field,
          templateCode,
        })
      : fieldConfig;
  }

  @Bind()
  onHref(field) {
    const { history } = this.props;
    if (field.linkType === 'OUTSIDE') {
      window.open(field.linkUrl);
    } else {
      history.push({
        pathname: field.linkUrl,
      });
    }
  }

  @Bind()
  renderDisplay(field = {}, record) {
    let displayValue;
    const value = record.get(field.fieldCode);
    const parentId = record.get('parentId');
    let isEditor = this.handleCanEdit(field, parentId);
    if (!record.data.editableFlag) isEditor = false;
    switch (field.componentType) {
      case 'UPLOAD':
        displayValue = (
          <Upload
            // btnText={intl.get('hzero.common.upload.modal.title').d('附件')}
            btnText={field.fieldName}
            icon={false}
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.directoryName}
            attachmentUUID={value}
            afterOpenUploadModal={(attUuid) => {
              record.set(`${field.fieldCode}`, attUuid);
            }}
            filePreview
            viewOnly={!isEditor}
          />
        );
        break;
      case 'LINK':
        displayValue = (
          <a disabled={!record.get('editableFlag') || !isEditor} onClick={() => this.onHref(field)}>
            {field.linkTitle}
          </a>
        );
        break;
      case 'SWITCH':
        displayValue = yesOrNoRender(value);
        break;
      case 'SELECT':
        displayValue = record.get(`${field.fieldCode}Meaning`);
        break;
      case 'LOV':
        displayValue = record.get(`${field.fieldCode}Meaning`);
        break;
      default:
        break;
    }
    return displayValue;
  }

  @Bind()
  getComponent(type) {
    let Component = null;
    switch (type) {
      case 'EMPTY':
        Component = () => <div />;
        break;
      case 'INPUT':
        Component = (props) => <TextField {...props} />;
        break;
      case 'INPUT_NUMBER':
        Component = (props) => <NumberField {...props} />;
        break;
      case 'SELECT':
        Component = (props) => <Select {...props} />;
        break;
      // case 'RADIO_GROUP':
      //   Component = props => <FlexRadioGroup {...props} />;
      //   break;
      case 'CHECKBOX':
        Component = (props) => <CheckBox {...props} unCheckedValue={0} checkedValue={1} />;
        break;
      case 'SWITCH':
        Component = (props) => <Switch {...props} unCheckedValue={0} checkedValue={1} />;
        break;
      case 'LOV':
        Component = (props) => <Lov {...props} />;
        break;
      case 'DATE_PICKER':
        Component = (props, { dateFormat } = {}) => {
          const mode = dateFormat && DATE_TIME_FORMAT.includes(dateFormat) ? 'dateTime' : 'date';
          return <DatePicker mode={mode} {...props} />;
        };
        break;
      case 'UPLOAD':
        Component = ({ uploadProps, ...props }) => (
          <span {...props} style={{ lineHeight: '32px' }}>
            <Upload {...uploadProps} />
          </span>
        );
        break;
      case 'TEXT_AREA':
        Component = (props) => <TextArea {...props} />;
        break;
      default:
        Component = (props) => <TextField {...props} />;
    }
    return (options, other) => Component(options, other);
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
      case 'yyyy-MM-dd HH:mm:ss':
        format = 'YYYY-MM-DD HH:mm:ss';
        break;
      case 'yyyy/MM/dd HH:mm:ss':
        format = 'YYYY/MM/DD HH:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * 渲染展开图标
   * @param {}
   * @returns
   */
  @Bind()
  expandIcon({ expanded, record }, searchType) {
    const {
      feedbackSheet: { onLoadList = [] },
    } = this.props;
    const { feedbackId, hasChildFlag } = record.toData();
    const loading = onLoadList.includes(feedbackId);
    return (
      <Icon
        style={hasChildFlag || record.children ? undefined : { display: 'none' }}
        className={styles[`expand-icon${loading ? '-loading' : ''}`]}
        type={loading ? 'loading' : expanded ? 'minus-square-o' : 'plus-square-o'}
        onClick={
          loading
            ? undefined
            : () => {
                return searchType === 'ALL'
                  ? this.handleExpand(expanded)
                  : this.handleExpandtoBeImplemented(expanded);
              }
        }
      />
    );
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleExpand(expanded) {
    const { dispatch } = this.props;
    const { templateCode, statusConfigId } = this.state;
    const record = this.lineDs.current;
    const { feedbackId } = record.toData();
    const params = {
      templateCode,
      feedbackId,
      statusConfigId,
      searchType: 'ALL',
    };
    if (!record.children && !expanded) {
      dispatch({
        type: 'feedbackSheet/fetchFeedbackLine',
        payload: params,
      }).then((res) => {
        if (res && res.content) {
          // (res.content || []).forEach(i => {
          //   this.lineDs.create({ ...i, parentId: feedbackId });
          // });
          this.lineDs.appendData(res.content, res.content.length);
        }
      });
    }
    record.set('isExpand', !expanded);
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleExpandtoBeImplemented(expanded) {
    const { dispatch } = this.props;
    const { templateCode, statusConfigId } = this.state;

    const toBeImplementedLineDsRecord = this.toBeImplementedLineDs.current;
    const { feedbackId } = toBeImplementedLineDsRecord.toData();
    const toBeImplementedLineDsParams = {
      templateCode,
      feedbackId,
      statusConfigId,
      searchType: 'TO_BE_EXECUTE',
    };
    if (!toBeImplementedLineDsRecord.children && !expanded) {
      dispatch({
        type: 'feedbackSheet/fetchFeedbackLine',
        payload: toBeImplementedLineDsParams,
      }).then((res) => {
        if (res && res.content) {
          this.toBeImplementedLineDs.appendData(res.content, res.content.length);
        }
      });
    }
    toBeImplementedLineDsRecord.set('isExpand', !expanded);
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleSave(operationCode) {
    this.setState({ operationCode });
    this.setState({ isButtonLoading: true });
    this.toBeImplementedLineDs.validate().then((res) => {
      if (res) {
        this.toBeImplementedLineDs.submit().finally(() => {
          this.setState({ isButtonLoading: false });
        });
      } else {
        this.setState({ isButtonLoading: false });
      }
    });
  }

  @Bind()
  openReferenceDocCreationModal(operationCode) {
    if (isEmpty(this.state.columnsReferencing)) return;
    const width = this.state.columnsReferencing.reduce((prev, cur) => {
      return prev + cur.width;
    }, this.state.columnsReferencing[0].width);
    this.referencingLineDs.query();
    Modal.open({
      children: (
        <Table
          dataSet={this.referencingLineDs}
          queryFields={this.state.referenceQueryFields}
          columns={this.state.columnsReferencing}
          queryFieldsLimit={1}
          // mode="tree"
        />
      ),
      closable: true,
      onOk: () => this.comfined(operationCode, this.state.searchType),
      // className: styles['referencing-modal'],
      style: {
        // maxWidth: '800px',
        width: `${width}px`,
        minWidth: `400px`,
      },
      // contentStyle: {
      //   // maxHeight: '700px',
      //   // maxWidth: '800px',
      // },
    });
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  async comfined(operationCode, searchType) {
    this.setState({ operationCode });
    // 引用页面不调用模版的必输属性，所有字段都为不必输，点击确定按钮不校验引用页面的属性信息
    const res = await this.referencingLineDs.forceSubmit();
    if (res) {
      this.referencingLineDs.query();
      (searchType === 'all' ? this.lineDs : this.toBeImplementedLineDs).query();
    }
  }

  @Bind()
  getTabTotalCount() {}

  @Bind()
  renderBtns() {
    const referenceDocCreationBtns = () => {
      return this.state.referenceOperationList.length > 0 ? (
        this.state.referenceOperationList.map((item) => (
          <Button onClick={() => this.openReferenceDocCreationModal(item.operationCode)}>
            {intl.get(`sodr.common.view.button.${item.operationCode}`).d(`${item.operationDesc}`)}
          </Button>
        ))
      ) : (
        <Fragment />
      );
    };
    const Btns = observer(({ dataSet }) => {
      return dataSet.toData().length > 0 && isArray(dataSet.toData()[0].allPageOperationList) ? (
        dataSet.toData()[0].allPageOperationList.map((item) => {
          const selectBtns =
            dataSet.selected.length > 0 &&
            dataSet.selected.filter((n) => {
              return (
                isArray(n.toData().pageOperationList) &&
                !!n.toData().pageOperationList.filter((nn) => {
                  return nn.operationCode === item.operationCode;
                }).length
              );
            });
          return (
            <Button
              onClick={() => this.handleSave(item.operationCode)}
              disabled={
                dataSet.selected.length === 0 || selectBtns === false || selectBtns.length === 0
              }
              loading={this.state.isButtonLoading}
            >
              {intl
                .get(`sodr.common.view.button.select.${item.operationCode}`)
                .d(`${item.operationDesc}`)}
            </Button>
          );
        })
      ) : (
        <Fragment />
      );
    });
    return this.state.searchType === 'TO_BE_EXECUTE' ? (
      [<Btns dataSet={this.toBeImplementedLineDs} />, referenceDocCreationBtns()]
    ) : (
      <Fragment />
    );
  }

  @Bind()
  getTab(searchType, loading, queryFields, columns) {
    const { remote } = this.props;
    const { templateCode } = this.state;
    const newColumns = remote
      ? remote.process('SODR.FEEDBACK_SHEET_PROCESS_COLUMNS', columns, { searchType, templateCode })
      : columns;
    switch (searchType) {
      case 'ALL':
        return (
          <Spin spinning={loading}>
            <Table
              customizedCode={
                isSupplier
                  ? 'SODR.FEEDBACK_SHEET_SUPPLIER.ALL.LIST'
                  : 'SODR.FEEDBACK_SHEET.ALL.LIST'
              }
              queryFields={queryFields}
              dataSet={this.lineDs}
              columns={newColumns}
              queryFieldsLimit={3}
              mode="tree"
              expandIcon={(e) => this.expandIcon(e, searchType)}
            />
          </Spin>
        );
      case 'TO_BE_EXECUTE':
        return (
          <Spin spinning={loading}>
            <Table
              customizedCode={
                isSupplier
                  ? 'SODR.FEEDBACK_SHEET_SUPPLIER.TO_BE_EXECUTE.LIST'
                  : 'SODR.FEEDBACK_SHEET.TO_BE_EXECUTE.LIST'
              }
              queryFields={queryFields}
              dataSet={this.toBeImplementedLineDs}
              columns={newColumns}
              queryFieldsLimit={3}
              mode="tree"
              expandIcon={(e) => this.expandIcon(e, searchType)}
            />
          </Spin>
        );
      default:
    }
  }

  @Bind()
  searchTable(searchType) {
    switch (searchType) {
      case 'ALL':
        this.lineDs.setQueryParameter('searchType', 'ALL');
        this.lineDs.setQueryParameter('statusConfigId', this.state.statusConfigId);
        this.lineDs.query();
        this.setState({
          loading: false,
          searchType,
        });
        break;
      case 'TO_BE_EXECUTE':
        this.toBeImplementedLineDs.setQueryParameter('searchType', 'TO_BE_EXECUTE');
        this.toBeImplementedLineDs.setQueryParameter('statusConfigId', this.state.statusConfigId);
        this.toBeImplementedLineDs.query();
        this.setState({
          loading: false,
          searchType,
        });
        break;
      default:
    }
  }

  @Bind()
  async urlSearch(displaySourceNum) {
    await this.setState({ displaySourceNum });
    this.lineDs.setQueryParameter('displaySourceNum', displaySourceNum);
    this.toBeImplementedLineDs.setQueryParameter('displaySourceNum', displaySourceNum);
    this.setState({ searchType: 'ALL' });
    this.lineDs.setQueryParameter('searchType', 'ALL');
    this.lineDs.query();
    this.toBeImplementedLineDs.setQueryParameter('searchType', 'TO_BE_EXECUTE');
    this.toBeImplementedLineDs.query();
  }

  render() {
    const {
      templateCode,
      columns = [],
      queryFields = {},
      loading,
      templateName,
      searchType,
      importFlag,
      statusConfigId,
    } = this.state;
    const ExportBtn = observer(({ dataSet, ds }) => {
      const { selected } = ds;
      const feedbackId = ds.selected.map((item) => item.get('feedbackId')).join();
      return (
        <ExportDynamicExcel
          requestUrl={`${SRM_SIEC}/v1/${organizationId}/feedback-data/excel/export`}
          queryParams={{
            params: dataSet.toData()[0],
            templateCode,
            searchType,
            statusConfigId,
          }}
          feedbackIds={feedbackId}
          btnText={
            !isEmpty(selected)
              ? intl.get('sodr.common.view.message.button.checkExport').d('勾选导出')
              : intl.get('sodr.common.view.message.button.batchExport').d('批量导出')
          }
        />
      );
    });
    return (
      <Fragment>
        <Header
          title={`${intl
            .get('sodr.feedbackSheet.view.title.templateName')
            .d('反馈单-')}${templateName}`}
        >
          {this.renderBtns()}
          <ExportBtn
            dataSet={this.lineDs.queryDataSet}
            ds={searchType === 'ALL' ? this.lineDs : this.toBeImplementedLineDs}
          />
          {importFlag && searchType === 'TO_BE_EXECUTE' ? (
            <Button onClick={() => this.handleBatchCreate()} type="c7n-pro" icon="archive">
              {intl.get('sodr.common.viewtitle.batchUpdateImport').d('批量更新导入')}
            </Button>
          ) : (
            <Fragment />
          )}
          {this.props.remote.process('additionalButtons', {
            templateCode,
            searchType,
            toBeImplementedLineDs: this.toBeImplementedLineDs,
            lineDs: this.lineDs,
            props: this.props,
          })}
        </Header>
        <Content>
          {/* <Spin spinning={loading}> */}
          <Tabs onChange={(searchType) => this.searchTable(searchType)} activeKey={searchType}>
            <TabPane
              tab={intl.get('sodr.common.title.executeTab').d('待执行')}
              key="TO_BE_EXECUTE"
              count={() => this.toBeImplementedLineDs.totalCount}
            >
              {this.getTab('TO_BE_EXECUTE', loading, queryFields, columns)}
            </TabPane>
            <TabPane
              tab={intl.get('sodr.common.view.message.title.all').d('全部')}
              count={() => this.lineDs.totalCount}
              key="ALL"
            >
              {this.getTab('ALL', loading, queryFields, columns)}
            </TabPane>
          </Tabs>
          {/* </Spin> */}
        </Content>
      </Fragment>
    );
  }
}
