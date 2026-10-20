/**
 * index.js - 我发起的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu<xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { Button, Tabs, Modal } from 'hzero-ui';
import { isUndefined, isArray, isEmpty, isFunction, compose } from 'lodash';
import { connect } from 'dva';
import { DATETIME_MIN } from 'utils/constants';
import { downloadFile, queryMapIdpValue } from 'services/api';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';
import { openTab } from 'utils/menuTab';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { SRM_SPCM } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import { Bind, Debounce } from 'lodash-decorators';
import hocRemote from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  createPagination,
  getResponse,
} from 'utils/utils';
import AsyncPagination from '@/routes/components/AsyncPagination';
import { breakOffContract } from '@/services/purchaseContractViewService';
import { querySealType, getRelationDocControl } from '@/services/contractCommonService';
import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';

import Search from './Search';
import SearchContractDetail from './SearchContractDetail';
import LineTable from './LineTable';
import DetailTable from './DetailTable';
import ContractStageModal from './Modal/ContractStageModal';
import ExecutiveDocumentModal from './Modal/ExecutiveDocumentModal';
import AcceptDocModal from './Modal/AcceptDocModal';
import FileModal from './Modal/FileModal';
import ExectModal from './Modal/ExectModal';
import CustomButton from './components/CustomButton';
import showBachFileDownload from '../components/BachFileDownload';

const { TabPane } = Tabs;

const viewMessagePrompt = 'spcm.purchaseContractView.view.message';
const modelPrompt = 'spcm.purchaseContractView.model';

class PurchaseContractView extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      isSureFileContract: false,
      pcHeaderId,
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      organizationId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      stageVisible: false,
      contractModalVisible: false,
      detailRowKeys: [],
      detailRows: [],
      textComparisonVisible: false,
      acceptDocVisible: false, // 是否显示验收单据模态框
      /**
       * 导入模态框
       */
      exectRecordVisible: false,
      recordList: {},
      enumObj: {}, // 新的状态值集。
      sealType: '',
      relationDoc: {},
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      location: { state: { _back } = {}, search },
      // 分页
      purchaseContractView: { pagination = {}, detailPagination = {} },
    } = this.props;
    // 58卡片查询需求 srm-131826
    if (_back !== -1) {
      const { pcStatusSet } = querystring.parse(search.substr(1));
      if (pcStatusSet) {
        this.filterForm.setFieldsValue({ pcStatusSet });
      }
    }
    this.handleSearchList({ pagination, detailPagination });
    // this.fetchList(pagination);
    // this.fetchDetailList(detailPagination);
    this.fetchEnum(); // 查询值集
    this.fetchEnum2(); // 查询状态值集
    this.fetchSealType();
    this.fetchRelationDocControl(); // 查询单据流、执行单据的业务规则
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    const {
      location: { search },
    } = this.props;
    if (pcHeaderId || (prevProps.location.search && prevProps.location.search !== search)) {
      if (prevProps.location.search !== search) {
        const { pcStatusSet } = querystring.parse(search.substr(1));
        this.filterForm.setFieldsValue({ pcStatusSet });
      }
      this.handleSearchList();
    }
  }

  @Bind()
  handleSearchList(params = {}) {
    const { purchaseContractView } = this.props;
    const { pagination, detailPagination } = params;
    const { activeKey = 'contractLine' } = purchaseContractView;
    if (activeKey === 'contractDetail') {
      this.fetchDetailList(detailPagination);
    } else {
      this.fetchList(pagination);
    }
  }

  /**
   * 单据流、执行单据业务规则是否开启
   */
  @Bind()
  async fetchRelationDocControl() {
    const res = getResponse(await getRelationDocControl());
    if (res) {
      this.setState({ relationDoc: res });
    }
  }

  /**
   * 查询签章服务类型
   */
  fetchSealType = async () => {
    const res = await querySealType();
    // 此处不要用getResponse处理，因为‘核企未开通签章套餐’也会作为错误抛出，但是我们不需要将此错误可视化。
    this.setState({ sealType: res?.sealType });
  };

  /**
   * 查询值集
   */
  @Bind()
  async fetchEnum2() {
    const opts = await getResponse(
      queryMapIdpValue({
        statusEnum: 'SPCM.CONTRACT.STATUS.IS.SHOW',
        syncStatusResults: 'SPCM.PUSH.STATUS',
      })
    );
    this.setState({ enumObj: { ...opts } });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    // const takeTime = {};
    const timeArray = [
      'creationDateFrom',
      'creationDateTo',
      'startDateFrom',
      'endDateTo',
      'archiveDateFrom',
      'archiveDateTo',
    ];
    // const takeArray = ['confirmedDateFrom', 'confirmedDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    // takeArray.forEach(item => {
    //   dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    // });
    const { pcTypeId, ...res } = filterValues;
    return {
      ...res,
      pcTypeIds: pcTypeId,
      ...dealTime,
    };
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, selectedRows = []) {
    const {
      tenantId,
      // pcHeaderId
    } = this.state;
    const { dispatch } = this.props;
    const formValue = this.filterForm.getFieldsValue();
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject({
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        });
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows });
    dispatch({
      type: 'purchaseContractView/queryList',
      payload: {
        page,
        // pcHeaderId,
        tenantId,
        ...handleFormValues,
        ...filterNullValueObject({
          asyncCountFlag: 'DEFAULT',
          oldTotalElements: page.total ? page.total : '',
        }),
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_VIEW.LINE_LIST,SPCM.PURCHASE_CONTRACT_VIEW.LIST.FILTER',
      },
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}, selectedRows = []) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    const formValue = this.contractDetailForm.getFieldsValue();
    const filterValues = isUndefined(this.contractDetailForm)
      ? {}
      : filterNullValueObject({
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        });
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows });
    dispatch({
      type: 'purchaseContractView/fetchDetailList',
      payload: {
        page,
        ...handleFormValues,
        tenantId,
        ...filterNullValueObject({
          asyncCountFlag: 'DEFAULT',
          oldTotalElements: page.total ? page.total : '',
        }),
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_VIEW.DETAIL_LIST,SPCM.PURCHASE_CONTRACT_VIEW.DETAIL.FILTER2',
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/init',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
      })
    );
  }

  /**
   * 跳转到固定地方
   * @param {String} pcHeaderId
   */
  @Bind()
  lookUp() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const pcHeaderId = selectedRows.map((item) => item.pcHeaderId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
        hash: `#spcm-contract-approval-detail-contract-online-edit`,
      })
    );
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  @Bind()
  handleDetailSelectChange(detailRowKeys, detailRows) {
    this.setState({
      detailRowKeys,
      detailRows,
    });
  }

  @Bind()
  @Debounce(500)
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  @Bind()
  downloadLogFile() {
    const { selectedRows } = this.state;
    const organizationId = getCurrentOrganizationId();
    const contractFileUrl = selectedRows.map((item) => item.contractFileUrl);
    const api = `${HZERO_FILE}/v1/${organizationId}/files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: PRIVATE_BUCKET },
        { name: 'url', value: selectedRows[0].contractFileUrl },
      ],
    }).then((res) => {
      if (res) {
        this.setState({ selectedRows: [] });
        // this.fetchList();
      }
    });
  }

  /**
   * 归档
   */
  @Bind()
  archiveContract(values) {
    const { dispatch } = this.props;
    if (values.pcHeaderId) {
      dispatch({
        type: 'purchaseContractView/archiveContract',
        payload: values,
      }).then((res) => {
        if (res) {
          this.setState({
            isSureFileContract: false,
            selectedRows: [],
          });
          this.handleContract('contractModalVisible', false);

          notification.success();
          this.fetchList();
        }
      });
    }
  }

  /**
   * 解约
   * @param {Array} selectedRows 选择行
   */
  @Bind()
  handleBreakOffContract(selectedRows) {
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.breakOffContract`).d('确认发起解约吗？'),
      onOk: async () => {
        const res = getResponse(await breakOffContract(selectedRows[0]));
        if (res) {
          notification.success();
          this.fetchList();
        }
      },
    });
  }

  @Bind()
  handleSaveKey(activeKey) {
    this.props.dispatch({
      type: 'purchaseContractView/updateState',
      payload: { activeKey },
    });
    if (activeKey === 'contractDetail') {
      this.fetchDetailList();
    } else {
      this.fetchList();
    }
  }

  @Bind()
  handleControlStageModal(phId) {
    const { stageVisible } = this.state;
    this.setState({ stageVisible: !stageVisible, phId }, () => {
      if (!stageVisible) {
        this.fetchStage();
      } else {
        const { dispatch } = this.props;
        dispatch({
          type: 'purchaseContractView/updateState',
          payload: {
            stageList: [],
            stagePagination: createPagination([]),
          },
        });
      }
    });
  }

  @Bind()
  handleControlDocumentModal(phId) {
    const { documentVisible } = this.state;
    this.setState({ documentVisible: !documentVisible, pcSubjectId: phId }, () => {
      if (!documentVisible) this.fetchDocument();
    });
  }

  // 验收单据模态框
  @Bind()
  handleControlAcceptDocModal(phId, pcSubjectId) {
    const { acceptDocVisible } = this.state;
    this.setState({ acceptDocVisible: !acceptDocVisible, phId, pcSubjectId }, () => {
      if (!acceptDocVisible) this.fetchAcceptDocument();
      else {
        const { dispatch } = this.props;
        dispatch({
          type: 'cuxPurchaseContractView/updateState',
          payload: {
            acceptDocList: [],
            acceptDocPagination: createPagination([]),
          },
        });
      }
    });
  }

  /**
   * 查询协议阶段
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { phId } = this.state;
    dispatch({
      type: 'purchaseContractView/fetchStage',
      payload: {
        page,
        pcHeaderId: phId,
      },
    });
  }

  /**
   * handleVisible - 归档-打开模态框
   */
  @Bind()
  handleContract(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * 查询执行单据
   */
  @Bind()
  fetchDocument(page = {}) {
    const { dispatch } = this.props;
    const { pcSubjectId } = this.state;
    dispatch({
      type: 'purchaseContractView/fetchDocument',
      payload: {
        page,
        pcSubjectId,
      },
    });
  }

  /**
   * 查询验收单据
   */
  @Bind()
  fetchAcceptDocument(page = {}) {
    const {
      dispatch,
      purchaseContractView: { activeKey },
    } = this.props;
    const { phId, pcSubjectId } = this.state;
    const detailFlag = activeKey === 'contractDetail' ? 1 : 0;
    const payload = {
      page,
      detailFlag,
      pcHeaderId: phId,
    };
    if (detailFlag) {
      payload.pcSubjectId = pcSubjectId;
    }
    dispatch({
      type: 'purchaseContractView/fetchAcceptDocument',
      payload,
    });
  }

  /**
   * 根据当前页签的key获取导出参数和归档标识
   */
  @Bind()
  fetchParams(activeKey = 'contractLine') {
    const {
      tenantId,
      selectedRows = [],
      selectedRowKeys = [],
      detailRows = [],
      detailRowKeys = [],
    } = this.state;
    const {
      purchaseContractView: { listQuery },
    } = this.props;
    const pcHeaderIds = selectedRowKeys.join(',');
    const lineQueryParams = selectedRows.length > 0 ? { pcHeaderIds } : listQuery;
    const pcSubjectIds = detailRowKeys.join(',');
    const detailQueryParams = detailRows.length > 0 ? { pcSubjectIds } : listQuery;

    let queryParams;
    let exportRequestUrl;
    let exportRequestUrlPro;
    let tabSelectRows;
    let templateCode;
    let isSureFileContract = false;
    let newExportQuery;
    if (activeKey === 'contractLine') {
      queryParams = lineQueryParams;
      newExportQuery = selectedRows.length > 0 ? { pcHeaderIds: selectedRowKeys } : {
        ...listQuery,
        pcTypeIds: listQuery?.pcTypeIds?.split(','),
      };
      exportRequestUrl = `${SRM_SPCM}/v1/${tenantId}/purchase-contract/purchase-view/excel-export`;
      exportRequestUrlPro = `${SRM_SPCM}/v1/${tenantId}/purchase-contract/purchase-view/excel-export`;
      tabSelectRows = selectedRows;
      templateCode = 'SRM_C_SRM_SPCM_PC_HEADER_EXPORT';
    } else {
      queryParams = detailQueryParams;
      newExportQuery = detailRows.length > 0 ? { pcSubjectIds: detailRowKeys } : {
        ...listQuery,
        pcTypeIds: listQuery?.pcTypeIds?.split(','),
      };
      exportRequestUrl = `${SRM_SPCM}/v1/${tenantId}/contract-report/receiving/excel-details`;
      exportRequestUrlPro = `${SRM_SPCM}/v1/${tenantId}/contract-report/receiving/excel-details-new`;
      tabSelectRows = detailRows;
      templateCode = 'SRM_C_SRM_SPCM_PC_HEADER_EXPORT_DETAILS';
    }

    /**
     * 由于归档操作需要填写归档码；而归档码填写的需求在设计之需初要一对一匹配
     * 若后续需求确定变更，可参考历史修改，进行对应判断逻辑变更
     */

    /**
     * attributeTinyint1 字段说明
     * 功能场景
     * 添加了签署盖章功能
     * 签署后协议状态变成已生效，
     * 由于以前的电签才可以归档，所以添加一个字段非电签且attributeTinyint1等于1的时候也可以归档
     */
    if (tabSelectRows.length === 1) {
      isSureFileContract = tabSelectRows.every(
        (v) =>
          (v.pcStatusCode === 'EFFECTED' && v.electricSignFlag === 1) ||
          (v.pcStatusCode === 'CONFIRMED' && v.electricSignFlag === 0 && v.displayFlag2 !== '1') ||
          (v.pcStatusCode === 'EFFECTED' && v.electricSignFlag === 0 && v.displayFlag3 === '1') ||
          // 已失效、已终止并且归档状态为未归档
          (['TERMINATION', 'EXPIRED'].includes(v.pcStatusCode) && v.archiveFlag === 0)
      );
    }

    return {
      queryParams,
      newExportQuery,
      exportRequestUrl,
      isSureFileContract,
      templateCode,
      tabSelectRows,
      exportRequestUrlPro,
    };
  }

  /**
   * 控制文本对比modal显隐
   * @param {*} pcHeaderId
   */
  @Bind()
  handleControlComparison(params) {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible, ...params });
  }

  /**
   * 协议接口重推
   */
  @Bind()
  reExportContract() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/reExportContract',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });

        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 协议接口重推佣金系统
   */
  @Bind()
  reExportCommission() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/reExportCommission',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 重推契约锁
   */
  @Bind()
  reExportContractLock() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/reExportContractLock',
      payload: { pcHeaderId: selectedRows[0].pcHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 期初导入（协议）
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/spcm/purchase-contract-view/data-import/SCUX.YANKON.PC.IMPORT',
      path: '/spcm/purchase-contract-view/data-import/SCUX.YANKON.PC.IMPORT',
      title: intl.get(`spcm.purchaseContractView.view.button.initialImport`).d('期初导入'),
      search: querystring.stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/purchase-contract-view/list`,
      }),
    });
  }

  /**
   * 协议批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: '/spcm/contract-subject/data-import/SPCM.TEDERIC_CONTRACT_IMPORT',
      path: '/spcm/contract-subject/data-import/SPCM.TEDERIC_CONTRACT_IMPORT',
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: querystring.stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/purchase-contract-view/list`,
      }),
    });
  }

  /**
   * 触发推送
   */
  @Bind()
  handleTriggerPush() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/triggerPush',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 签署盖章
   */
  @Bind()
  handleSignAndSeal({ openModal }) {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    if (openModal) {
      this.setState({
        selectedRows: [],
      });
      notification.success();
      this.fetchList();
    } else {
      dispatch({
        type: 'purchaseContractView/postSignAndSeal',
        payload: selectedRows,
      }).then((res) => {
        if (res) {
          this.setState({
            selectedRows: [],
          });
          notification.success();
          this.fetchList();
        }
      });
    }
  }

  @Bind()
  handlePushSAP() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/contractPushExternalSystemData',
      payload: selectedRows.map((v) => {
        return v.pcHeaderId;
      }),
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 打开同步推送spa
   */
  @Bind()
  @Debounce(500)
  handleExectRecord(record) {
    this.setState({
      exectRecordVisible: true,
      recordList: record || {},
    });
  }

  /**
   * 关闭同步推送spa
   *
   */
  @Bind()
  handleExectVisible() {
    this.setState({
      exectRecordVisible: false,
      recordList: {},
    });
  }

  renderFileModal(contractModalProps) {
    return contractModalProps?.visible && <FileModal {...contractModalProps} />;
  }

  // @overide 锦江
  // isHidden：是否需要隐藏部分按钮(默认false)
  renderHeaderButtons(addtionBtns, isHidden) {
    const { selectedRows = [], fileDownLoading, sealType } = this.state;
    const {
      purchaseContractView,
      postSignAndSealLoading,
      triggerPushLoading,
      contractPushExternalSystemDataLoading,
      customizeBtnGroup,
      remote,
    } = this.props;
    const contractFileUrl = selectedRows.some((item) => item.contractFileUrl === null);
    const { enumMap = [], activeKey = 'contractLine' } = purchaseContractView;
    const pcKindCodeFlag = selectedRows.some((item) =>
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(item.pcKindCode)
    );
    const pcKindCodeNormalFlag =
      selectedRows.filter((item) => item.pcKindCode === 'NORMAL').length === 1;

    const {
      queryParams,
      newExportQuery,
      exportRequestUrl,
      isSureFileContract,
      templateCode,
      tabSelectRows,
      exportRequestUrlPro,
    } = this.fetchParams(activeKey);
    // signSeal
    const { signSeal = [] } = enumMap;
    let headerButtons = [
      <ExcelExportPro
        data-name="newExport"
        method="POST"
        allBody
        buttonText={
          tabSelectRows.length > 0
            ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
            : intl.get(`spcm.common.button.newExport`).d('新版导出')
        }
        templateCode={templateCode}
        requestUrl={exportRequestUrlPro}
        queryParams={newExportQuery}
        otherButtonProps={{
          icon: 'unarchive',
          permissionList: [
            {
              code: 'srm.pc-admin.pc-purchaser.view.ps.export.new',
              type: 'button',
              meaning: '新版导出(协议)',
            },
          ],
        }}
      />,
      <ExcelExport
        data-name="export"
        buttonText={intl.get(`hzero.common.button.export`).d('导出')}
        otherButtonProps={{
          type: 'c7n-pro',
          icon: 'unarchive',
        }}
        requestUrl={exportRequestUrl}
        queryParams={queryParams}
      />,
      <Button
        data-name="look"
        onClick={this.lookUp}
        icon="look-over"
        disabled={
          (isArray(selectedRows) && selectedRows.length !== 1) ||
          pcKindCodeFlag ||
          contractFileUrl ||
          !pcKindCodeNormalFlag
        }
      >
        {intl.get(`${modelPrompt}.look`).d('查阅')}
      </Button>,
      <PermissionButton
        data-name="archive"
        key="archive"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.archive.contract',
            type: 'button',
            meaning: '归档',
          },
        ]}
        onClick={() => this.handleContract('contractModalVisible', true)}
        disabled={!isSureFileContract}
      >
        {intl.get(`${modelPrompt}.file`).d('归档')}
      </PermissionButton>,
      activeKey === 'contractLine' && sealType?.includes('_SAAS') && (
        <PermissionButton
          data-name="breakOff"
          key="breakOff"
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.view.button.terminate',
              type: 'button',
              meaning: '解约',
            },
          ]}
          disabled={
            (isArray(selectedRows) && selectedRows.length !== 1) ||
            !selectedRows.some(
              // 服务编码含“_SaaS”&协议状态=已终止&协议解约签署状态=未解约&电签标识=1
              (i) =>
                i.pcStatusCode === 'TERMINATION' &&
                i.authType?.includes('_SAAS') &&
                i.electricSignFlag === 1 &&
                i.terminateSignStatus === 'NOT_TERMINATED'
            )
          }
          onClick={() => this.handleBreakOffContract(selectedRows)}
        >
          {intl.get(`spcm.common.view.button.breakOffContract`).d('解约')}
        </PermissionButton>
      ),
      <CustomButton
        data-name="signSeal"
        data={signSeal || []}
        headerInfo={Array.isArray(selectedRows) && selectedRows.length === 1 ? selectedRows[0] : {}}
        loading={postSignAndSealLoading}
        handleSubmit={this.handleSignAndSeal}
        isList
        selectedRows={selectedRows}
        disabled={Array.isArray(selectedRows) && selectedRows.every((v) => !v.displayFlag1)}
      />,
      !isHidden && (
        <Button
          data-name="download"
          onClick={this.downloadLogFile}
          icon="download"
          disabled={
            (isArray(selectedRows) && selectedRows.length !== 1) ||
            contractFileUrl ||
            pcKindCodeFlag
          }
        >
          {intl.get(`${modelPrompt}.download`).d('下载文本')}
        </Button>
      ),
      <PermissionButton
        data-name="reExportContract"
        key="reExportContract"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.jinjiang.export.contract',
            type: 'button',
            meaning: '重推',
          },
        ]}
        disabled={
          isEmpty(selectedRows) ||
          selectedRows.some((i) => !['EFFECTED', 'ARCHIVE', 'CONFIRMED'].includes(i.pcStatusCode))
        }
        onClick={this.reExportContract}
      >
        {intl.get('spcm.purchaseContractView.view.message.reExportContract').d('重推')}
      </PermissionButton>,
      <PermissionButton
        data-name="reExportCommission"
        key="reExportCommission"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.jinjiang.export.contract-commission',
            type: 'button',
            meaning: '重推佣金系统',
          },
        ]}
        disabled={
          isEmpty(selectedRows) ||
          selectedRows.some(
            (i) => !['EFFECTED', 'ARCHIVE', 'CONFIRMED', 'TERMINATION'].includes(i.pcStatusCode)
          )
        }
        onClick={this.reExportCommission}
      >
        {intl.get('spcm.purchaseContractView.view.message.reExportCommission').d('重推佣金系统')}
      </PermissionButton>,
      <PermissionButton
        data-name="initialImport"
        key="initialImport"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.yankon.import.button',
            type: 'button',
            meaning: '期初导入',
          },
        ]}
        onClick={this.handleImport}
      >
        {intl.get(`spcm.purchaseContractView.view.button.initialImport`).d('期初导入')}
      </PermissionButton>,
      <PermissionButton
        data-name="triggerPush"
        key="triggerPush"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.sync-joint.button',
            type: 'button',
            meaning: '触发推送',
          },
        ]}
        disabled={isEmpty(selectedRows)}
        onClick={this.handleTriggerPush}
        loading={triggerPushLoading}
      >
        {intl.get(`spcm.purchaseContractView.view.button.triggerPush`).d('触发推送')}
      </PermissionButton>,
      <PermissionButton
        data-name="batchImport"
        key="batchImport"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.tederic-contract-import',
            type: 'button',
            meaning: '批量导入',
          },
        ]}
        onClick={this.handleBatchImport}
      >
        {intl.get('hzero.common.title.batchImport').d('批量导入')}
      </PermissionButton>,
      <PermissionButton
        data-name="reExportContractLock"
        key="reExportContractLock"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.heavy.push',
            type: 'button',
            meaning: '重推契约锁',
          },
        ]}
        disabled={
          isEmpty(selectedRows) ||
          selectedRows.length !== 1 ||
          selectedRows.some((i) => !['PUBLISHED'].includes(i.pcStatusCode))
        }
        onClick={this.reExportContractLock}
      >
        {intl.get('spcm.purchaseContractView.view.message.reExportContractLock').d('重推契约锁')}
      </PermissionButton>,
      <PermissionButton
        data-name="pushsap"
        key="pushsap"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.inter-recrods',
            type: 'button',
            meaning: ' 推送外部系统',
          },
        ]}
        disabled={
          isEmpty(selectedRows) ||
          !selectedRows.every((i) => {
            return (
              Array.isArray(i.interRecords) &&
              i.interRecords.some((v) => v && v.importStatus === '0')
            );
          })
        }
        onClick={this.handlePushSAP}
        loading={contractPushExternalSystemDataLoading}
      >
        {intl.get('spcm.purchaseContractView.view.button.pushsap').d('推送外部系统')}
      </PermissionButton>,
      <PermissionButton
        data-name="fileDownload"
        key="fileDownload"
        disabled={isEmpty(selectedRows)}
        loading={fileDownLoading}
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.batch.download.attachment',
            type: 'button',
            meaning: '批量下载文件',
          },
        ]}
        onClick={() =>
          showBachFileDownload({
            pcHeaderIds: selectedRows.map((item) => item.pcHeaderId),
            setState: this.setState.bind(this),
          })
        }
      >
        {intl.get('spcm.purchaseContractView.view.button.fileDownload').d('下载附件')}
      </PermissionButton>,
      ...(isArray(addtionBtns) ? addtionBtns : []),
    ];
    headerButtons = remote
      ? remote.process('SPCM_PUR_CONTRACT_VIEW_LIST_HEADERBUTTONS', headerButtons, {
          current: this,
        })
      : headerButtons;
    return (
      <Header title={intl.get(`${viewMessagePrompt}.PurchaseContractView`).d('我发起的协议')}>
        {customizeBtnGroup(
          {
            code: 'SPCM.PURCHASE_CONTRACT_VIEW.BTN_GROUP',
          },
          headerButtons
        )}
        {!isArray(addtionBtns) && addtionBtns}
        {this.props.buttonArr ? this.props.buttonArr(selectedRows) : []}
      </Header>
    );
  }

  renderSearch(searchProps) {
    return <Search {...searchProps} />;
  }

  // 58同城 srm-125229
  renderLineTable(lineTableProps) {
    return <LineTable {...lineTableProps} />;
  }

  // 58同城 srm-125229
  renderDetailTable(detailTableProps) {
    return <DetailTable {...detailTableProps} />;
  }

  // 奥雅 srm-124766
  renderOperationRecordDrawer(operationRecordProps) {
    return <OperationRecordDrawer {...operationRecordProps} />;
  }

  render() {
    const {
      selectedRows = [],
      detailRows = [],
      pcHeaderId,
      operationRecordVisible,
      stageVisible,
      documentVisible,
      acceptDocVisible,
      contractModalVisible = false,
      textComparisonVisible,
      exectRecordVisible,
      recordList,
      enumObj,
      sealType,
      relationDoc,
    } = this.state;
    const {
      form,
      purchaseContractView,
      queryListLoading,
      stageLoading,
      documentLoading,
      acceptDocLoading,
      customizeFilterForm,
      customizeTable,
      customizeForm,
      archiveContractLoading,
      loadingExect,
      loadingAsync,
      triggerPushLoading,
      dispatch,
      remote,
    } = this.props;

    const {
      pagination = {},
      dataLineList = [],
      dataDetailList = [],
      detailPagination = {},
      enumMap = [],
      activeKey = 'contractLine',
      stageList = [],
      stagePagination = {},
      documentList = [],
      acceptDocList = [],
      documentPagination = {},
      acceptDocPagination = {},
      paginationLoading,
      detailPaginationLoading,
    } = purchaseContractView;
    const searchProps = {
      activeKey,
      enumMap,
      enumObj,
      customizeFilterForm,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.handleSearchList,
    };
    const lineTableProps = {
      remote,
      sealType,
      form,
      pagination: false,
      dispatch,
      relationDoc,
      selectedRows,
      customizeTable,
      currentPage: pagination,
      onSearch: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: dataLineList.map((o) => ({ ...o, key: o.pcHeaderId })),
      onControlStageModal: this.handleControlStageModal,
      onControlAcceptDocModal: this.handleControlAcceptDocModal,
      onControlTextComparison: this.handleControlComparison,
      handleExectRecord: this.handleExectRecord,
      columnsHook: this.props.columnsLineHook || null,
    };
    const detailTableProps = {
      remote,
      customizeTable,
      dispatch,
      relationDoc,
      selectedRows: detailRows,
      dataSource: dataDetailList,
      pagination: false,
      sealType,
      onSearch: this.fetchDetailList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onDetailSelectChange: this.handleDetailSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      onControlStageModal: this.handleControlStageModal,
      onControlDocumentModal: this.handleControlDocumentModal,
      onControlAcceptDocModal: this.handleControlAcceptDocModal,
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const stageModalProps = {
      title: intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段'),
      visible: stageVisible,
      onCancel: this.handleControlStageModal,
      tableProps: {
        rowKey: 'pcStageId',
        loading: stageLoading,
        dataSource: stageList,
        pagination: stagePagination,
        onChange: this.fetchStage,
      },
    };
    const documentModalProps = {
      title: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
      visible: documentVisible,
      onCancel: this.handleControlDocumentModal,
      tableProps: {
        rowKey: 'seqNum',
        loading: documentLoading,
        dataSource: documentList,
        pagination: documentPagination,
        onChange: this.fetchDocument,
      },
    };
    // 验收单据
    const acceptDocModalProps = {
      title: intl.get('spcm.common.view.message.title.acceptListNum').d('验收单据'),
      visible: acceptDocVisible,
      onCancel: this.handleControlAcceptDocModal,
      tableProps: {
        rowKey: 'seqNum',
        loading: acceptDocLoading,
        dataSource: acceptDocList,
        pagination: acceptDocPagination,
        onChange: this.fetchAcceptDocument,
      },
    };
    const contractModalProps = {
      customizeForm,
      archiveContractLoading,
      headerInfo: selectedRows[0],
      visible: contractModalVisible,
      onOk: this.archiveContract,
      onCancel: () => this.handleContract('contractModalVisible', false),
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    /**
     * 导入模态框
     */
    const exectRecordProps = {
      remote,
      pcHeaderId: recordList && recordList.pcHeaderId,
      recordList,
      loading: loadingExect || loadingAsync || triggerPushLoading,
      visible: exectRecordVisible,
      hideModal: () => this.handleExectVisible(),
      dispatch,
    };

    return (
      <Fragment>
        {this.renderHeaderButtons()}
        <Content>
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
            <TabPane
              tab={intl.get(`${viewMessagePrompt}.contractLine`).d('按协议查询')}
              key="contractLine"
              forceRender
            >
              {this.renderSearch(searchProps)}
              {this.renderLineTable(lineTableProps)}
              <AsyncPagination
                {...pagination}
                loading={paginationLoading}
                onCustChange={(current, pageSize) =>
                  this.fetchList({ ...pagination, current, pageSize })
                }
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${viewMessagePrompt}.contractDetail`).d('按明细查询')}
              key="contractDetail"
              forceRender
            >
              <SearchContractDetail
                {...searchProps}
                onRef={(node) => {
                  this.contractDetailForm = node.props.form;
                }}
                code="SPCM.PURCHASE_CONTRACT_VIEW.DETAIL.FILTER2"
              />
              {this.renderDetailTable(detailTableProps)}
              <AsyncPagination
                {...detailPagination}
                loading={detailPaginationLoading}
                onCustChange={(current, pageSize) =>
                  this.fetchDetailList({ ...detailPagination, current, pageSize })
                }
              />
            </TabPane>
          </Tabs>
        </Content>
        {this.renderFileModal(contractModalProps)}
        {this.renderOperationRecordDrawer(operationRecordProps)}
        <ContractStageModal {...stageModalProps} />
        <ExecutiveDocumentModal {...documentModalProps} />
        <AcceptDocModal {...acceptDocModalProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
        {exectRecordVisible && <ExectModal {...exectRecordProps} />}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  compose(
    connect(({ loading = {}, purchaseContractView = {}, contractCommon = {} }) => ({
      queryListLoading:
        loading.effects['purchaseContractView/queryList'] ||
        loading.effects['purchaseContractView/fetchDetailList'],
      updateStateLoading: loading.effects['purchaseContractView/updateState'],
      intiLoading: loading.effects['purchaseContractView/init'],
      getLineAttachmentUuidLoading: loading.effects['purchaseContractView/getLineAttachmentUuid'],
      fetchOperationRecordListLoading:
        loading.effects['purchaseContractView/fetchOperationRecordList'],
      stageLoading: loading.effects['purchaseContractView/fetchStage'],
      documentLoading: loading.effects['purchaseContractView/fetchDocument'],
      archiveContractLoading: loading.effects['purchaseContractView/archiveContract'],
      acceptDocLoading: loading.effects['purchaseContractView/fetchAcceptDocument'],
      loadingExect: loading.effects['purchaseContractView/queryPushExternalSystemData'],
      loadingAsync: loading.effects['purchaseContractView/againPushExternalSystemData'],
      postSignAndSealLoading: loading.effects['purchaseContractView/postSignAndSeal'],
      triggerPushLoading: loading.effects['purchaseContractView/triggerPush'],
      contractPushExternalSystemDataLoading:
        loading.effects['purchaseContractView/contractPushExternalSystemData'],
      purchaseContractView,
      contractCommon,
    })),
    formatterCollections({
      code: [
        'spcm.common',
        'spcm.purchaseContractView',
        'sodr.common',
        'entity.company',
        'entity.supplier',
        'entity.organization',
        'entity.roles',
        'entity.business',
        'ssrc.inquiryHall',
        'component.docFlow',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPCM.PURCHASE_CONTRACT_VIEW.LINE_LIST',
        'SPCM.PURCHASE_CONTRACT_VIEW.DETAIL_LIST',
        'SPCM.PURCHASE_CONTRACT_VIEW.LIST.FILTER',
        'SPCM.PURCHASE_CONTRACT_VIEW.ARCHIVE',
        'SPCM.PURCHASE_CONTRACT_VIEW.DETAIL.FILTER2',
        'SPCM.PURCHASE_CONTRACT_VIEW.BTN_GROUP',
      ],
    }),
    hocRemote({
      code: 'SPCM_PUR_CONTRACT_VIEW_LIST',
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    })
  )(com);

export { PurchaseContractView, hocFunc };
export default hocFunc(PurchaseContractView);
