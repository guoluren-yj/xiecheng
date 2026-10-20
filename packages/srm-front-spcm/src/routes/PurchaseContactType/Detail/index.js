/**
 * index.js - 协议类型管理
 * @date: 2019-05-14
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Row, Col, Modal, Card } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isArray, isNumber, isUndefined, difference, isEmpty } from 'lodash';
import { connect } from 'dva';
import {
  DETAIL_DEFAULT_CLASSNAME,
  DATETIME_MIN,
  DETAIL_CARD_CLASSNAME,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import classnames from 'classnames';
import querystring from 'querystring';

import notification from 'utils/notification';
import uuid from 'uuid/v4';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  addItemsToPagination,
  delItemToPagination,
  delItemsToPagination,
  createPagination,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import hocRemote from 'utils/remote';
import withCustomize from 'srm-front-cuz';
import moment from 'moment';
import ContractStageInfo from './ContractStageInfo';
import ContractPartnerInfo from './ContractPartnerInfo';
import ContractPartnerHeader from './ContractPartnerHeader';
import ContractBusinessTerms from './ContractBusinessTerms';
import ContractAttachmentType from './ContractAttachmentType';
import ContractBasic from './ContractBasic';
import PanelHeader from '../../components/PanelHeader';
import CompanyModal from '../components/CompanyModal';
import LifeCycleModal from '../components/LifeCycleModal';
import AddCompanyModal from '../components/AddCompanyModal';
import styles from './index.less';

const mldelMessagePropt = 'spcm.common.model';

@withCustomize({
  unitCode: ['SPCM.CONTRACT.TYPE.DETAIL'],
})
@connect(({ loading = {}, purchaseContractType, newContract }) => ({
  queryingHeader: loading.effects['purchaseContractType/fetchHeader'],
  queryingStage: loading.effects['purchaseContractType/fetchStage'],
  queryingPartner: loading.effects['purchaseContractType/fetchPartner'],
  queryingfetchTerms: loading.effects['purchaseContractType/fetchTerms'],
  queryingfetchAttachment:
    loading.effects['purchaseContractType/purchaseContractType/fetchAttachment'],
  saving:
    loading.effects['purchaseContractType/update'] || loading.effects['purchaseContractType/add'],
  queryCompanyLoading: loading.effects['purchaseContractType/fetchCompany'],
  queryLifeCycleLoading: loading.effects['purchaseContractType/fetchLifeCycle'],
  addCompanyLoading: loading.effects['purchaseContractType/fetchAddCompany'],
  // deleteHeaderLoading: loading.effects['purchaseContractType/delete'],
  purchaseContractType,
  newContract,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'spcm.purchaseContractType',
    'entity.roles',
    'entity.company',
    'entity.supplier',
    'sodr.orderType',
    'spfm.configServer',
    'spcm.contractSign',
  ],
})
@hocRemote({
  code: 'SPCM_CONTRACT_TYPE_DETAIL',
  name: 'remote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcTypeId } = querystring.parse(search.substr(1));
    this.state = {
      pcTypeId,
      headerInfo: {}, // 头form数据源
      collapseKeys: [
        'contractTypeBasicSet',
        'contractBaseInformation', // 头信息
        'contractPartnerInformation', // 合同伙伴
        'contractBusinessTermsInformation', // 业务条款
        'contractStageInformation', // 协议阶段
        'contractOnlineEdit', // 附件
      ], // 打开的折叠面板key
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
      partnerTypeDataSource: [], // 合作伙伴类型数据
      partnerTypeSelectedRows: [], // 伙伴的Rows
      partnerTypePagination: {},
      stageTypeDataSource: [], // 协议阶段类型数据
      stageTypeSelectedRows: [], // 协议阶段的Rows
      stageTypePagination: {},
      termTypeDataSource: [], // 业务条款数据
      termTypeSelectedRows: [], // 业务条款
      termTypePagination: {},
      attachmentTypeDataSource: [], // 附件协议数据
      attachmentTypeSelectedRows: [], // 附件类型
      attachmentTypePagination: {},
      companyVisible: false, // 公司modal
      addCompanyVisible: false, // 添加公司modal
      lifeCycleVisible: false, // 查询生命周期modal
      companyDataSource: [], // 公司数据
      lifeCycleDataSource: [], // 生命周期
      companyPagination: {}, // 公司分页
      clearCompanyRowsKeys: [], // 公司清除列表key
      clearCompanyRows: [], // 公司清除列
      companyAddDataSource: [], // 新建公司数据
      companyAddPagination: {}, // 新建公司分页
      sureAddCompanyRowsKeys: [], // 新建公司列表key
      sureAddCompanyRows: [], // 新建公司列
      addFlagCompanyRowsKey: [], // 公司flag 取消显示值
    };
    this.headerRef = React.createRef();
    this.headerRefBasic = React.createRef();
  }

  componentDidMount() {
    const { pcTypeId } = this.state;
    if (pcTypeId && isNumber(+pcTypeId)) {
      this.fetchHeader();
      this.fetchList();
    }
    this.fetchEnum();
    this.fetchData(); // 查询值集(新)
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractType/init',
    });
  }

  /**
   * 查询值集(新)
   */
  @Bind()
  fetchData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'newContract/fetchDetailEnum',
    });
  }

  // /**
  //  * 设置选中行 - 协议阶段
  //  * @param {Array} selectedRowKeys
  //  * @param {Array} selectedRows
  //  */
  @Bind()
  onRowSelectChangeStage(selectedRowKeys, stageTypeSelectedRows) {
    this.setState({
      stageTypeSelectedRows,
    });
  }

  /**
   * partnerHandleDeleteLines - 删除采购申请行- 协议阶段
   */
  @Bind()
  stageHandleDeleteLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const rowKey = `${key}Id`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: stageTypeSelectedRows = [],
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContractType.view.message.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = stageTypeSelectedRows.map((item) => item[rowKey]);
        const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
        this.setState({
          [sourceField]: newDataSource,
          [paginationField]: delItemToPagination(newDataSource.length, pagination),
        });
      },
    });
  }

  // /**
  //  * 设置选中行 - 协议伙伴
  //  * @param {Array} selectedRowKeys
  //  * @param {Array} selectedRows
  //  */
  @Bind()
  onRowSelectChangePartner(selectedRowKeys, partnerTypeSelectedRows) {
    this.setState({
      partnerTypeSelectedRows,
    });
  }

  /**
   * partnerHandleDeleteLines - 删除采购申请行- 合作伙伴
   */
  @Bind()
  partnerHandleDeleteLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const rowKey = `${key}Id`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: partnerTypeSelectedRows = [],
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContractType.view.message.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = partnerTypeSelectedRows.map((item) => item[rowKey]);
        const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
        this.setState({
          [sourceField]: newDataSource,
          [paginationField]: delItemToPagination(newDataSource.length, pagination),
        });
      },
    });
  }

  /**
   * 设置选中行 - 业务条款
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChangeTerms(selectedRowKeys, termTypeSelectedRows) {
    this.setState({
      termTypeSelectedRows,
    });
  }

  /**
   * termsHandleDeleteLines - 删除采购申请行- 业务条款
   */
  @Bind()
  termsHandleDeleteLines() {
    const sourceField = `termTypeDataSource`;
    const paginationField = `termTypePagination`;
    const selectedField = `termTypeSelectedRows`;
    const rowKey = `termsId`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: termTypeSelectedRows = [],
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContractType.view.message.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = termTypeSelectedRows.map((item) => item[rowKey]);
        const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
        this.setState({
          [sourceField]: newDataSource,
          [paginationField]: delItemToPagination(newDataSource.length, pagination),
        });
      },
    });
  }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcTypeId } = this.state;
    return dispatch({
      type: 'purchaseContractType/fetchHeader',
      pcTypeId,
    }).then((res) => {
      if (res) {
        this.setState({ headerInfo: res });
      }
    });
  }

  /**
   * 查询列表
   */
  @Bind()
  fetchList() {
    this.fetchStage();
    this.fetchPartner();
    this.fetchTerms();
    this.fetchAttachment({ pageSize: 5 });
  }

  /**
   * fetchPartner - 查询协议阶段
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { pcTypeId, stageTypeDataSource } = this.state;
    const pageOld = { ...page };
    if (pcTypeId) {
      if (stageTypeDataSource.some((item) => item._status === 'create')) {
        pageOld.pageSize = 10;
      }
      dispatch({
        type: 'purchaseContractType/fetchStage',
        payload: {
          page: pageOld,
          pcTypeId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            stageTypeDataSource: res.content.map((n) => ({ ...n, _status: 'update' })) || [], // 协议阶段数据
            stageTypePagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * fetchPartner - 查询合同伙伴
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchPartner() {
    const { dispatch } = this.props;
    const { pcTypeId } = this.state;
    if (pcTypeId) {
      dispatch({
        type: 'purchaseContractType/fetchPartner',
        payload: {
          pcTypeId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            partnerTypeDataSource: res.map((n) => ({ ...n, _status: 'update' })), // 合同伙伴数据
          });
        }
      });
    }
  }

  /**
   * fetchTerms - 查询业务条款
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchTerms(page = {}) {
    const { dispatch } = this.props;
    const { pcTypeId } = this.state;
    if (pcTypeId) {
      dispatch({
        type: 'purchaseContractType/fetchTerms',
        payload: {
          page,
          pcTypeId,
        },
      }).then(async (res) => {
        if (res) {
          const lovCodes = {};
          let termTypeDataSource = res.content.map((n) => {
            if (n.termTypeLov) {
              lovCodes[n.termTypeLov] = n.termTypeLov;
            }
            return { ...n, _status: 'update' };
          });
          if (!isEmpty(lovCodes)) {
            const lovList = await dispatch({
              type: 'purchaseContractType/fetchBatchTermContentDefaultSelect',
              payload: lovCodes,
            });
            if (lovList) {
              termTypeDataSource = termTypeDataSource.map((t) => {
                if (t.termTypeLov && lovList[t.termTypeLov]) {
                  const termContentDefaultObj = lovList[t.termTypeLov].find(
                    (term) => term.value === t.termContentDefault
                  );
                  return {
                    ...t,
                    termTypeList: lovList[t.termTypeLov],
                    termContentDefault: termContentDefaultObj ? termContentDefaultObj.value : '',
                  };
                }
                return t;
              });
            }
          }
          this.setState({
            termTypeDataSource, // 业务条款数据
            termTypePagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * fetchAttachment - 查询附件类型
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchAttachment(page = {}) {
    const { dispatch } = this.props;
    const { pcTypeId } = this.state;
    if (pcTypeId) {
      dispatch({
        type: 'purchaseContractType/fetchAttachment',
        payload: {
          page,
          pcTypeId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            attachmentTypeDataSource: res.content.map((n) => ({ ...n, _status: 'update' })), // 附件类型数据
            attachmentTypePagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]]
   * @param {*} [fields=[]]
   */
  @Bind()
  formatTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          newItem[field] = item[field] ? item[field].format(DATETIME_MIN) : undefined;
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * handleAddLines - 新增行
   * @param {String} key - 新增对应的行数据
   */
  @Bind()
  handleAddLines(key) {
    const sourceField = `${key}DataSource`; // partnerTypeDataSource
    const paginationField = `${key}Pagination`;
    const rowKey = `${key}Id`;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = this.state;
    const newItem = { _status: 'create', [rowKey]: uuid(), nullableFlag: 0 };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length + 1, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * handleAddStageLines - 新增阶段行
   * @param {String} key - 新增对应的行数据
   */
  @Bind()
  handleAddStageLines(key) {
    const sourceField = `${key}DataSource`; // partnerTypeDataSource
    const paginationField = `${key}Pagination`;
    const rowKey = `pcStageId`;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = this.state;
    const newItem = { _status: 'create', [rowKey]: uuid() };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * 验证基础数据
   */
  @Bind()
  validateFieldsHeaderType() {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line
      this.headerRefBasic?.current?.validateFieldsAndScroll((errs, values) => {
        if (errs) {
          reject(errs);
        } else {
          resolve(values);
        }
      });
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  save() {
    const {
      dispatch = (e) => e,
      location: { search },
    } = this.props;
    const {
      headerInfo = {},
      tenantId,
      partnerTypeDataSource = [], // 合作伙伴类型数据
      termTypeDataSource = [], // 业务条款数据
      attachmentTypeDataSource = [], // 附件协议数据
      stageTypeDataSource = [], // 协议阶段
    } = this.state;
    const { pcTypeId = headerInfo.pcTypeId } = querystring.parse(search.substr(1));
    if (this.headerRef && this.headerRef.current) {
      if (!pcTypeId) {
        this.headerRef.current.validateFieldsAndScroll((errs, values) => {
          if (!errs) {
            const { startDateActive, endDateActive } = values;
            const headerData = {
              tenantId,
              ...values,
              startDateActive: startDateActive ? startDateActive.format(DATETIME_MIN) : undefined,
              endDateActive: endDateActive ? endDateActive.format(DATETIME_MIN) : undefined,
            };
            dispatch({
              type: 'purchaseContractType/add',
              payload: headerData,
            }).then((newHeaderInfo) => {
              if (newHeaderInfo) {
                this.setState({ headerInfo: newHeaderInfo, pcTypeId: newHeaderInfo.pcTypeId });
                this.props.history.push({
                  // 保存后重新回到页面
                  pathname: '/spcm/purchase-contract-type/detail',
                  search: `?pcTypeId=${newHeaderInfo.pcTypeId}`,
                });
                this.fetchList();
                this.fetchHeader();
                notification.success();
              }
            });
          }
        });
      } else {
        this.headerRef.current.validateFieldsAndScroll((errs, values) => {
          if (!errs) {
            Promise.all([
              this.validateEditTableDataSource(stageTypeDataSource, ['pcStageId'], {
                force: true,
              }),
              this.validateEditTableDataSource(partnerTypeDataSource, ['partnerTypeId'], {
                force: true,
              }),
              this.validateEditTableDataSource(termTypeDataSource, ['termTypeId'], {
                force: true,
              }),
              this.validateEditTableDataSource(attachmentTypeDataSource, ['attachmentTypeId'], {
                force: true,
              }),
              this.validateFieldsHeaderType(),
            ]).then(
              ([
                pcStageDetailList,
                pcPartnerTypeDetailList,
                pcTermTypeDetailList,
                pcAttachmentTypeDtailList,
                headerTypeBasicValues,
              ]) => {
                const { startDateActive, endDateActive, acceptType, acceptFlag } = values;
                const headerData = {
                  tenantId,
                  ...values,
                  startDateActive: startDateActive
                    ? moment(startDateActive).format(DATETIME_MIN)
                    : undefined,
                  endDateActive: endDateActive
                    ? moment(endDateActive).format(DATETIME_MIN)
                    : undefined,
                  acceptType: acceptFlag === 0 ? null : acceptType,
                  ...headerTypeBasicValues,
                };

                const pcPartnerTypeDTOListFilter = pcPartnerTypeDetailList.map((item) => {
                  return {
                    ...item,
                    pcTypeId: headerInfo.pcTypeId,
                    tenantId,
                  };
                });
                const pcPartnerTypeDTOList = pcPartnerTypeDTOListFilter.filter(
                  (item) => item.edited
                );

                const pcAttachmentTypeDTOListFilter = pcAttachmentTypeDtailList.map((item) => {
                  return {
                    ...item,
                    pcTypeId: headerInfo.pcTypeId,
                    tenantId,
                    nullableFlag: item.nullableFlag ? 0 : 1,
                  };
                });
                const pcAttachmentTypeDTOList = pcAttachmentTypeDTOListFilter.filter(
                  (item) => item.edited
                );

                const dateFormatObj = {
                  DATE: DEFAULT_DATE_FORMAT,
                  DATETIME: DEFAULT_DATETIME_FORMAT,
                };

                const pcTermTypeDTOListFilter = pcTermTypeDetailList.map((item) => {
                  return {
                    ...item,
                    tenantId,
                    pcTypeId: headerInfo.pcTypeId,
                    nullableFlag: item.nullableFlag ? 0 : 1,
                    termContentDefault:
                      item.termType === 'DATE' || item.termType === 'DATETIME'
                        ? (item.termContentDefault &&
                            item.termContentDefault.format(dateFormatObj[item.termType])) ||
                          ''
                        : item.termContentDefault || '',
                  };
                });
                const pcTermTypeDTOList = pcTermTypeDTOListFilter.filter((item) => item.edited);
                const pcType = Object.assign(headerInfo, headerData);
                const pcTypeDTO = { ...pcType };
                // 对于协议基础信息数据处理
                // 场景1 修改某一个，但是
                if (headerTypeBasicValues) {
                  if (!headerTypeBasicValues?.contractValidation) {
                    pcTypeDTO.contractValidation = '';
                  }
                  if (!headerTypeBasicValues?.electricSignOrder) {
                    pcTypeDTO.electricSignOrder = '';
                  }
                }
                // 原有代码，不清楚为何要写死，暂时保留
                // const pcTypeDTO = { ...pcType, enabledFlag: 1 };
                const List = [
                  {
                    ...pcTypeDTO,
                    pcAttachmentTypeDetailDTOList:
                      [...pcAttachmentTypeDTOList].length > 0 ? [...pcAttachmentTypeDTOList] : null,
                    pcPartnerTypeDetailDTOList:
                      [...pcPartnerTypeDTOList].length > 0 ? [...pcPartnerTypeDTOList] : null,
                    pcTermTypeDetailDTOList:
                      [...pcTermTypeDTOList].length > 0 ? [...pcTermTypeDTOList] : null,
                    pcStageDetailList:
                      [...pcStageDetailList].length > 0 ? [...pcStageDetailList] : null,
                  },
                ];
                dispatch({
                  type: 'purchaseContractType/update',
                  payload: List,
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.fetchList();
                    this.fetchHeader();
                  }
                });
              }
            );
          }
        });
      }
    }
  }

  /*
   *合作伙伴 添加edited
   *
   */
  @Bind()
  parHandleRecordChange(record) {
    const {
      partnerTypeDataSource = [], // 合作伙伴类型数据
    } = this.state;
    const newDataSource = partnerTypeDataSource.map((item) => {
      if (item.partnerTypeId === record.partnerTypeId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      partnerTypeDataSource: newDataSource, // 合作伙伴类型数据
    });
  }

  /*
   *协议条款 添加edited
   *
   */
  @Bind()
  terHandleRecordChange(record) {
    const {
      termTypeDataSource = [], // 业务条款数据
      // attachmentTypeDataSource = [], // 附件协议数据
    } = this.state;
    const newDataSource = termTypeDataSource.map((item) => {
      if (item.termTypeId === record.termTypeId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      termTypeDataSource: newDataSource, // 合作伙伴类型数据
    });
  }

  /*
   *附件类型 添加edited
   *
   */
  @Bind()
  attHandleRecordChange(record) {
    const {
      attachmentTypeDataSource = [], // 附件协议数据
    } = this.state;
    const newDataSource = attachmentTypeDataSource.map((item) => {
      if (item.attachmentTypeId === record.attachmentTypeId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      attachmentTypeDataSource: newDataSource, // 合作伙伴类型数据
    });
  }

  /**
   * 行内校验
   */
  @Bind()
  validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}) {
    if (dataSource.length === 0) {
      return Promise.resolve(dataSource);
    }
    return new Promise((resolve, reject) => {
      const validateDataSource = getEditTableData(dataSource, excludeKeys, property);
      if (validateDataSource.length === 0) {
        reject();
      } else {
        resolve(validateDataSource);
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows, field) {
    this.setState({
      [`${field}SelectedRows`]: selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * handleDeleteLines - 删除行
   */
  @Bind()
  handleDeleteLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const rowKey = `${key}Id`;
    const delTypeObj = {
      partnerType: 'pc-partner',
      stageType: 'pc-stage',
      termType: 'pc-term',
      attachmentType: 'pc-attachment',
    };
    const { dispatch } = this.props;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContractType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        const delHasIdRows = selectedRows
          .filter((v) => v._status !== 'create')
          .map((val) => val[rowKey]); // 有id的行
        const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
        this.setState({
          [sourceField]: newDataSource,
          [paginationField]: delItemsToPagination(
            selectedRows.length,
            dataSource.length, // 当前数据长度
            pagination // 原始分页对象
          ),
        });
        if (delHasIdRows && delHasIdRows.length) {
          this.setState({ [selectedField]: [], [paginationField]: [] }, () => {
            dispatch({
              type: 'purchaseContractType/deleteContractType',
              payload: {
                delType: delTypeObj[key],
                ids: delHasIdRows,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.fetchList();
                this.fetchHeader();
              }
            });
          });
        }
      },
    });
  }

  /**
   * handleDeleteStageLines - 删除阶段行
   */
  @Bind()
  handleDeleteStageLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const rowKey = `pcStageId`;
    const delTypeObj = {
      stageType: 'pc-stage',
    };
    const { dispatch } = this.props;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContractType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        const delHasIdRows = selectedRows
          .filter((v) => v._status !== 'create')
          .map((val) => val[rowKey]); // 有id的行
        const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
        this.setState({
          [sourceField]: newDataSource,
          [paginationField]: delItemsToPagination(
            selectedRows.length,
            dataSource.length, // 当前数据长度
            pagination // 原始分页对象
          ),
        });
        if (delHasIdRows && delHasIdRows.length) {
          this.setState({ [selectedField]: [], [paginationField]: [] }, () => {
            dispatch({
              type: 'purchaseContractType/deleteContractType',
              payload: {
                delType: delTypeObj[key],
                ids: delHasIdRows,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.fetchList();
                this.fetchHeader();
              }
            });
          });
        }
      },
    });
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleCompany() {
    this.setState(
      {
        companyVisible: true,
      },
      () => this.fetchCompany()
    );
  }

  /**
   * handleCompany - 查看生命周期
   */
  @Bind()
  handleLifeCycle() {
    this.setState(
      {
        lifeCycleVisible: true,
      },
      () => this.fetchLifeCycle()
    );
  }

  /**
   * fetchAddCompany - 查询需要新增的公司
   */
  @Bind()
  fetchAddCompany(page = {}) {
    const { headerInfo = {}, companyDataSource = [] } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    const companyIds = companyDataSource.map((c) => c.companyId).join(',');
    dispatch({
      type: 'purchaseContractType/fetchAddCompany',
      payload: {
        ...filterValues,
        pcConfigId: headerInfo.pcTypeId,
        companyIds,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyAddDataSource: res.content,
          companyAddPagination: createPagination(res),
        });
      }
    });
  }

  /**
   fetchCompany - 查询公司(子账号权限下的公司)
   */
  @Bind()
  fetchCompany(page = {}) {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'purchaseContractType/fetchCompany',
      payload: {
        pcConfigId: headerInfo.pcTypeId,
        page,
        ...filterValues,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyDataSource: res.content.map((n) => ({ ...n, _status: 'update' })), // 公司列表数据
          companyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   fetchLifeCycle - 查询生命周期定义列表
   */
  @Bind()
  fetchLifeCycle() {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractType/fetchLifeCycle',
      payload: {
        pcTypeId: headerInfo.pcTypeId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          lifeCycleDataSource:
            res.lifeCyclesStages && res.lifeCyclesStages.map((r) => ({ ...r, _status: 'update' })),
        });
        if (res.refreshFlag === 1) {
          Modal.confirm({
            title: intl
              .get(`spcm.purchaseContractType.view.message.coverLifeStage`)
              .d('生命周期阶段发生变更，是否进行覆盖？'),
            onOk: () => {
              // 查询覆盖生命周期列表
              dispatch({
                type: 'purchaseContractType/fetchCoverLifeStage',
                payload: {
                  pcTypeId: headerInfo.pcTypeId,
                  tenantId: this.state.tenantId,
                },
              }).then((newRes) => {
                if (newRes) {
                  this.setState({
                    lifeCycleDataSource: newRes && newRes.map((r) => ({ ...r, _status: 'update' })),
                  });
                }
              });
            },
          });
        }
      }
    });
  }

  /**
   * 关闭公司模态框
   */
  @Bind()
  hideCompanyModal() {
    this.setState({
      companyVisible: false,
      sureAddCompanyRowsKeys: [],
    });
  }

  /**
   * 关闭生命周期模态框
   */
  @Bind()
  hideLiftCyleModal() {
    this.setState({
      lifeCycleVisible: false,
    });
  }

  /**
   * 关闭新增公司模态框
   */
  @Bind()
  handleCloseAddCompany() {
    const { addFlagCompanyRowsKey } = this.state;
    this.setState({
      sureAddCompanyRowsKeys: addFlagCompanyRowsKey,
    });
  }

  /**
   * 删除新建未保存的公司
   */
  @Bind()
  handleClearCompany() {
    const {
      clearCompanyRows,
      companyDataSource,
      companyPagination,
      sureAddCompanyRowsKeys,
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContractType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = clearCompanyRows.map((item) => item.companyId);
        const filtered = companyDataSource.filter(
          (item) => !selectedRowKeys.includes(item.companyId)
        );
        // 获取删除后未保存数据的key
        const differenceKeys = difference(sureAddCompanyRowsKeys, selectedRowKeys);
        // 需要处理什么时候不能删除
        this.setState({
          sureAddCompanyRowsKeys: differenceKeys,
          addFlagCompanyRowsKey: differenceKeys,
          clearCompanyRowsKeys: [],
          companyDataSource: filtered,
          companyPagination: delItemsToPagination(
            selectedRowKeys.length,
            companyDataSource.length,
            companyPagination
          ),
        });
      },
    });
    // 进行清除
  }

  /**
   * 确认添加新建未保存的公司
   */
  @Bind()
  handleSureAddCompany() {
    const {
      companyDataSource,
      companyPagination,
      sureAddCompanyRows,
      sureAddCompanyRowsKeys,
    } = this.state;
    if (sureAddCompanyRows.length > 0) {
      const sureAddCompany =
        sureAddCompanyRows.map((n) => ({ ...n, _status: 'create', enabledFlag: 1 })) || []; // 协议类型确认添加公司
      this.setState({
        companyDataSource: [...companyDataSource, ...sureAddCompany],
        companyPagination: addItemsToPagination(
          sureAddCompany.length,
          companyDataSource.length,
          companyPagination
        ),
        sureAddCompanyRows: [],
        addFlagCompanyRowsKey: sureAddCompanyRowsKeys,
      });
    }
  }

  /**
   * 确认保存新建的公司
   */
  @Bind()
  handleSureSaveCompany() {
    const { companyDataSource, headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    const companyData = getEditTableData(companyDataSource, ['_status']);
    dispatch({
      type: 'purchaseContractType/saveCompany',
      payload: { companyDataSource: companyData, pcTypeId: headerInfo.pcTypeId },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            companyVisible: false,
          },
          notification.success(),
          this.fetchHeader(),
          this.fetchList()
        );
      }
    });
  }

  @Bind()
  saveLifeCycle() {
    const { lifeCycleDataSource, headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    const cycleData = getEditTableData(lifeCycleDataSource, ['_status']);
    dispatch({
      type: 'purchaseContractType/saveLifeCycle',
      payload: { lifeCyclesStagesList: cycleData, pcTypeId: headerInfo.pcTypeId },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            lifeCycleVisible: false,
          },
          notification.success(),
          this.fetchHeader(),
          this.fetchList()
        );
      }
    });
  }

  /**
   * 公司列表清除勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleClearCompanyRows(selectedRowKeys, selectedRows) {
    this.setState({
      clearCompanyRowsKeys: selectedRowKeys,
      clearCompanyRows: selectedRows,
    });
  }

  /**
   * 公司列表新增勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleAddCompanyRows(selectedRowKeys, selectedRows) {
    this.setState({
      sureAddCompanyRowsKeys: selectedRowKeys,
      sureAddCompanyRows: selectedRows,
    });
  }

  /**
   * 是否协议验收勾选回调
   * @param {*}
   * @param {Number} acceptFlagValue - 勾选后的值
   */
  @Bind()
  handleAcceptFlagChange(acceptFlagValue) {
    if (this.headerRef && this.headerRef.current && this.headerRef.current.setFieldsValue) {
      this.headerRef.current.setFieldsValue({
        acceptType: 'none',
      }); // 重置验收类型
    }
    this.setState({
      headerInfo: {
        ...this.state.headerInfo,
        acceptFlag: acceptFlagValue,
      },
    });
  }

  /**
   * 根据值集编码查询下拉内容
   * @param {Object} lovCode - 选中的值集Code
   * @param {Object} record - 当前行记录
   */
  @Bind()
  fetchTermTypeLovSelect(lovCode, record, isClear) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractType/fetchTermContentDefaultSelect',
      payload: lovCode,
    }).then((res) => {
      if (res) {
        if (isClear) {
          record.$form.setFieldsValue({
            termContentDefault: undefined,
          });
        }
        record.$form.setFieldsValue({
          termTypeList: res,
        });
      }
    });
  }

  render() {
    const {
      saving,
      location,
      deletingLines,
      purchaseContractType,
      queryingHeader,
      queryingStage,
      queryingPartner = false,
      queryingfetchTerms = false,
      queryingfetchAttachment = false,
      queryCompanyLoading,
      queryLifeCycleLoading,
      addCompanyLoading,
      form,
      customizeForm,
      newContract,
      remote,
    } = this.props;
    const {
      pcTypeId,
      headerInfo = {},
      collapseKeys = [],
      attachmentTypeSelectedRows = [],
      partnerTypeSelectedRows = [],
      stageTypeSelectedRows = [],
      termTypeSelectedRows = [],
      stageTypeDataSource = [], // 合作伙伴类型数据
      partnerTypeDataSource = [], // 合作伙伴类型数据
      termTypeDataSource = [], // 业务条款数据
      attachmentTypeDataSource = [], // 附件协议数据
      stageTypePagination = [],
      partnerTypePagination = [],
      termTypePagination = [],
      attachmentTypePagination = [],
      companyVisible,
      lifeCycleVisible,
      companyDataSource,
      lifeCycleDataSource,
      companyPagination,
      clearCompanyRowsKeys = [],
      companyAddDataSource = [], // 新建公司数据
      companyAddPagination = {}, // 新建公司分页
      sureAddCompanyRowsKeys = [], // 新建公司列表key
      addCompanyVisible,
      tenantId,
      // sureAddCompanyRows = [], // 新建公司列
    } = this.state;
    const queryingList = queryingPartner || queryingfetchTerms || queryingfetchAttachment;
    const { search = {} } = location;
    const { enumMap = {} } = purchaseContractType;
    const { newEnumMap = {} } = newContract;
    const { prSourcePlatform = headerInfo.prSourcePlatform } = querystring.parse(search.substr(1));
    const editContractType = headerInfo.editFlag === 0; // 是否创建过该类型,为0不可以修改
    // 协议阶段新建方式不为手工新建，展示协议阶段
    const showStageFlag = headerInfo.contractPendingMethod !== '1';
    const headerInfoFormProps = {
      remote,
      customizeForm,
      pcTypeId,
      editContractType,
      prSourcePlatform,
      ref: this.headerRef,
      dataSource: headerInfo,
      onChangeHeader: this.handleChangeHeader,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
      tenantId,
      enumMap,
      newEnumMap,
      handleCompany: this.handleCompany,
      handleLifeCycle: this.handleLifeCycle,
      handleAcceptFlagChange: this.handleAcceptFlagChange, // 是否协议验收勾选回调
    };
    const rowClearCompany = {
      selectedRowKeys: clearCompanyRowsKeys,
      onChange: this.handleClearCompanyRows,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record.companyId, // Column configuration not to be checked
      }),
    };
    const rowAddCompany = {
      selectedRowKeys: sureAddCompanyRowsKeys,
      onChange: this.handleAddCompanyRows,
    };
    const companyProps = {
      dataSource: companyDataSource,
      pagination: companyPagination,
      companyAddDataSource, // 新建公司数据
      companyAddPagination, // 新建公司分页
      visible: companyVisible,
      hideModal: this.hideCompanyModal,
      loading: queryCompanyLoading,
      addCompanyLoading,
      onSearch: this.fetchCompany,
      fetchAddCompany: this.fetchAddCompany,
      handleCompany: this.fetchCompany,
      handleClearCompany: this.handleClearCompany,
      handleSureAddCompany: this.handleSureAddCompany,
      handleSureSaveCompany: this.handleSureSaveCompany,
      handleCloseAddCompany: this.handleCloseAddCompany,
      clearCompanyRowsKeys,
      sureAddCompanyRowsKeys, // 新建公司列表key
      rowSelection: rowClearCompany,
      rowAddCompany,
      onRef: (node) => {
        this.companyForm = node.props.form;
      },
      onAddRef: (node) => {
        this.companyAddForm = node.props.form;
      },
    };
    const lifeCycleProps = {
      form,
      dataSource: lifeCycleDataSource,
      editContractType,
      visible: lifeCycleVisible,
      saveLifeCycle: this.saveLifeCycle,
      hideModal: this.hideLiftCyleModal,
      loading: queryLifeCycleLoading,
      onSearch: this.fetchLifeCycle,
      handleCompany: this.fetchLifeCycle,
      onRef: this.Ref,
    };
    const addCompanyProps = {
      dataSource: companyDataSource,
      pagination: companyPagination,
      companyAddDataSource, // 新建公司数据
      companyAddPagination, // 新建公司分页
      visible: addCompanyVisible,
      hideModal: this.hideCompanyModal,
      loading: queryCompanyLoading,
      addCompanyLoading,
      onSearch: this.fetchCompany,
      fetchAddCompany: this.fetchAddCompany,
      handleCompany: this.fetchCompany,
      handleClearCompany: this.handleClearCompany,
      handleSureAddCompany: this.handleSureAddCompany,
      handleSureSaveCompany: this.handleSureSaveCompany,
      clearCompanyRowsKeys,
      sureAddCompanyRowsKeys, // 新建公司列表key
      rowSelection: rowClearCompany,
      rowAddCompany,
      onRef: (node) => {
        this.companyForm = node.props.form;
      },
      onAddRef: (node) => {
        this.companyAddForm = node.props.form;
      },
    };
    const partnerInfoProps = {
      remote,
      editContractType,
      selectedRows: partnerTypeSelectedRows,
      loading: queryingPartner,
      dataSource: partnerTypeDataSource, // 合同伙伴信息  partnerTypeDataSource
      pagination: partnerTypePagination,
      quoteFlag: headerInfo.quoteFlag,
      newEnumMap,
      onSearch: this.fetchPartner,
      onHandleRecord: this.parHandleRecordChange,
      onAdd: () => this.handleAddLines('partnerType'),
      onDelete: () => this.handleDeleteLines('partnerType'),
      ref: this.partnerRef,
      deletingLines,
      onSelectionChange: this.handleChangeSelection,
    };
    const stageInfoProps = {
      remote,
      editContractType,
      selectedRows: stageTypeSelectedRows,
      loading: queryingStage,
      dataSource: stageTypeDataSource,
      pagination: stageTypePagination,
      quoteFlag: headerInfo.quoteFlag,
      onSearch: this.fetchStage,
      onHandleRecord: this.parHandleRecordChange,
      onAdd: () => this.handleAddStageLines('stageType'),
      onDelete: () => this.handleDeleteStageLines('stageType'),
      ref: this.stageRef,
      deletingLines,
      onSelectionChange: this.handleChangeSelection,
    };
    const businessTermsProps = {
      editContractType,
      enumMap,
      enabledFlag: headerInfo.enabledFlag,
      selectedRows: termTypeSelectedRows,
      loading: queryingfetchTerms, // 业务条款 termTypeDataSource
      pagination: termTypePagination,
      dataSource: termTypeDataSource,
      quoteFlag: headerInfo.quoteFlag,
      onSearch: this.fetchTerms,
      onHandleRecord: this.terHandleRecordChange,
      onSelectionChange: this.handleChangeSelection,
      onAdd: () => this.handleAddLines('termType'),
      onDelete: () => this.handleDeleteLines('termType'),
      ref: this.termTypeRef,
      onRowSelectChangeTerms: this.onRowSelectChangeTerms,
      onFetchTermTypeLovSelect: this.fetchTermTypeLovSelect,
    };
    const attachmentTypeProps = {
      editContractType,
      selectedRows: attachmentTypeSelectedRows,
      loading: queryingfetchAttachment,
      pagination: attachmentTypePagination,
      dataSource: attachmentTypeDataSource, // 附件模板 attachmentTypeDataSource
      quoteFlag: headerInfo.quoteFlag,
      onSearch: this.fetchAttachment,
      onHandleRecord: this.attHandleRecordChange,
      onSelectionChange: this.handleChangeSelection,
      onAdd: () => this.handleAddLines('attachmentType'),
      onDelete: () => this.handleDeleteLines('attachmentType'),
      ref: this.attachmentTypeRef,
      onRowSelectChangeAttachment: this.onRowSelectChangeAttachment,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`${mldelMessagePropt}.pcType`).d('协议类型')}
          backPath="/spcm/purchase-contract-type/list"
        >
          <Button
            loading={
              saving ||
              queryingHeader ||
              queryingStage ||
              queryingPartner ||
              queryingfetchTerms ||
              queryingfetchAttachment
            }
            onClick={this.save}
            icon="save"
            type="primary"
            disabled={saving}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={queryingPartner || queryingList}
            wrapperClassName={classnames(styles['panel-list-wrapper'], DETAIL_DEFAULT_CLASSNAME)}
          >
            <Row gutter={48}>
              <Col span={24}>
                <Card
                  key="zuul-rate-limit-header"
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={
                    <h3>
                      {intl
                        .get(`spcm.purchaseContractType.view.message.basicInformation`)
                        .d('协议类型基础信息')}
                    </h3>
                  }
                >
                  <ContractPartnerHeader {...headerInfoFormProps} />
                </Card>
                <Collapse
                  forceRender
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  {pcTypeId && (
                    <Collapse.Panel
                      showArrow={false}
                      header={
                        <PanelHeader
                          title={intl
                            .get(`spcm.purchaseContractType.view.message.typeBasicSet`)
                            .d('协议基础配置')}
                          collapseKeys={collapseKeys}
                          targetKey="contractTypeBasicSet"
                        />
                      }
                      key="contractTypeBasicSet"
                    >
                      <ContractBasic
                        dataSource={headerInfo}
                        ref={this.headerRefBasic}
                        history={this.props.history}
                        enumMap={enumMap}
                      />
                    </Collapse.Panel>
                  )}
                  {pcTypeId && (
                    <Collapse.Panel
                      showArrow={false}
                      header={
                        <PanelHeader
                          title={intl
                            .get(`spcm.purchaseContractType.view.message.contractPartners`)
                            .d('合同伙伴类型定义')}
                          collapseKeys={collapseKeys}
                          targetKey="contractPartnerInformation"
                        />
                      }
                      key="contractPartnerInformation"
                    >
                      <ContractPartnerInfo {...partnerInfoProps} />
                    </Collapse.Panel>
                  )}

                  {pcTypeId && (
                    <Collapse.Panel
                      style={{ display: showStageFlag ? 'block' : 'none' }} // 避免dom节点没有影响别的校验
                      showArrow={false}
                      header={
                        <PanelHeader
                          title={intl
                            .get(`spcm.purchaseContractType.view.message.contractStageInfo`)
                            .d('协议阶段定义')}
                          collapseKeys={collapseKeys}
                          targetKey="contractStageInformation"
                        />
                      }
                      key="contractStageInformation"
                    >
                      <ContractStageInfo {...stageInfoProps} />
                    </Collapse.Panel>
                  )}
                  {pcTypeId && (
                    <Collapse.Panel
                      showArrow={false}
                      header={
                        <PanelHeader
                          title={intl
                            .get(`spcm.purchaseContractType.view.message.businessTerms`)
                            .d('业务条款定义')}
                          collapseKeys={collapseKeys}
                          targetKey="contractBusinessTermsInformation"
                        />
                      }
                      key="contractBusinessTermsInformation"
                    >
                      <ContractBusinessTerms {...businessTermsProps} />
                    </Collapse.Panel>
                  )}
                  {pcTypeId && (
                    <Collapse.Panel
                      showArrow={false}
                      header={
                        <PanelHeader
                          title={intl
                            .get(`spcm.purchaseContractType.view.message.attachmentDefinition`)
                            .d('附件类型定义')}
                          collapseKeys={collapseKeys}
                          targetKey="contractOnlineEdit"
                        />
                      }
                      key="contractOnlineEdit"
                    >
                      <ContractAttachmentType {...attachmentTypeProps} />
                    </Collapse.Panel>
                  )}
                </Collapse>
              </Col>
            </Row>
          </Spin>
        </Content>
        {companyVisible && <CompanyModal {...companyProps} />}
        {addCompanyVisible && <AddCompanyModal {...addCompanyProps} />}
        {lifeCycleVisible && <LifeCycleModal {...lifeCycleProps} />}
      </Fragment>
    );
  }
}
