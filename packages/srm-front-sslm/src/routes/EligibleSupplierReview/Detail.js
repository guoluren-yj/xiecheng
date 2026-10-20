/**
 * SupplierReviewDetail - 合格供应商评审
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';
import qs from 'querystring';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { isEmpty, isString, isUndefined, every, map } from 'lodash';
import { Form, Tabs, Button, Modal, Upload, Icon, Spin, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { defaultMaxFileSize } from '@/routes/components/utils';

import OperationsRecordModal from '@/routes/SupplierLife/Components/OperationsRecordModal';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { fetchRemoteFileSizeLimit } from '@/services/commonService';
import HeaderInfo from './HeaderInfo';
import EnclosureTable from './EnclosureTable';
import ScoreInformationTable from './ScoreInformationTable';
import SupplierCapacityTable from '../SupplierLife/Components/Detail/SupplyAbilityTable';
import SupplierClassificationTable from '../SupplierLife/Components/Detail/SupplierClassificationTable';
import CategoryMaterialTable from '../SupplierLife/Components/Detail/CategoryMaterialTable';

const { Dragger } = Upload;
const organizationId = getCurrentOrganizationId();
const bucketDirectory = 'sslm-lifecycle';

// const getCustomizeCode = (stageCode) => {};

/**
 * 合格供应商评审明细
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierReview - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplierReview, loading, user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    supplierReview,
    user,
    allLoading:
      loading.effects['supplierReview/queryDetail'] ||
      loading.effects['supplierReview/queryReviewDetail'] ||
      loading.effects['supplierReview/saveSupplierReview'] ||
      loading.effects['supplierReview/submitSupplierReview'] ||
      loading.effects['supplierReview/querySupplierClassification'] ||
      loading.effects['supplierReview/queryMaterialsCategories'],
    ...themeConfig,
  };
})
@formatterCollections({
  code: ['sslm.supplierReview', 'sslm.commonApplication', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_ITEM_FORM',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_FORM',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_FORM',
    // 供应商评审头
    'SSLM.SUPPLIER_REVIEWED.DETAIL.RECOMMEND_HEADER',
    'SSLM.SUPPLIER_UNREVIEW.DETAIL.RECOMMEND_HEADER',
    'SSLM.SUPPLIER_REVIEWED.DETAIL.QUALIFIED_HEADER',
    'SSLM.SUPPLIER_UNREVIEW.DETAIL.QUALIFIED_HEADER',
    'SSLM.SUPPLIER_REVIEWED.DETAIL.POTENTIAL_HEADER',
    'SSLM.SUPPLIER_UNREVIEW.DETAIL.POTENTIAL_HEADER',
    'SSLM.SUPPLIER_REVIEWED.DETAIL.RESERVED_HEADER',
    'SSLM.SUPPLIER_UNREVIEW.DETAIL.RESERVED_HEADER',
    // 个性化标签页
    'SSLM.SUPPLIER_REVIEW.DETAIL.POTENTIAL_TABPANE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.PREPARE_TABPANE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.QUALIFIED_TABPANE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.RECOMMEND_TABPANE',
    // 评分信息
    'SSLM.SUPPLIER_REVIEW.DETAIL.RECOMMEND_SCORE_TABLE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.RECOMMEND_SCORE_TABLE_VIEW',
    'SSLM.SUPPLIER_REVIEW.DETAIL.QUALIFIED_SCORE_TABLE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.QUALIFIED_SCORE_TABLE_VIEW',
    'SSLM.SUPPLIER_REVIEW.DETAIL.POTENTIAL_SCORE_TABLE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.POTENTIAL_SCORE_TABLE_VIEW',
    'SSLM.SUPPLIER_REVIEW.DETAIL.RESERVED_SCORE_TABLE',
    'SSLM.SUPPLIER_REVIEW.DETAIL.RESERVED_SCORE_TABLE_VIEW',
  ],
})
export default class SupplierReviewDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = props;
    const parame = qs.parse(props.location.search.substr(1));
    const readOnly = parame.pageType === 'view';
    const { stageCode } = parame;
    let code = '';
    // 评分信息个性化-已评审
    const viewTableCode = `SSLM.SUPPLIER_REVIEW.DETAIL.${stageCode}_SCORE_TABLE_VIEW`;
    // 评分信息个性化-未评审
    const tableCode = `SSLM.SUPPLIER_REVIEW.DETAIL.${stageCode}_SCORE_TABLE`;

    let tabPaneCode = '';
    let customizeUnitCode = '';

    if (readOnly) {
      code = `SSLM.SUPPLIER_REVIEWED.DETAIL.${stageCode}_HEADER`;
      customizeUnitCode = [code, viewTableCode].join(',');
    } else {
      code = `SSLM.SUPPLIER_UNREVIEW.DETAIL.${stageCode}_HEADER`;
      customizeUnitCode = [code, tableCode].join(',');
    }

    // 个性化标签页
    switch (stageCode) {
      case 'RECOMMEND':
        tabPaneCode = 'SSLM.SUPPLIER_REVIEW.DETAIL.RECOMMEND_TABPANE';
        break;
      case 'QUALIFIED':
        tabPaneCode = 'SSLM.SUPPLIER_REVIEW.DETAIL.QUALIFIED_TABPANE';
        break;
      case 'POTENTIAL':
        tabPaneCode = 'SSLM.SUPPLIER_REVIEW.DETAIL.POTENTIAL_TABPANE';
        break;
      default:
        tabPaneCode = 'SSLM.SUPPLIER_REVIEW.DETAIL.PREPARE_TABPANE';
        break;
    }
    this.state = {
      requisitionId: params.requisitionId,
      stageCode,
      uploadVisible: false, // 是否打开上传模态框
      fileList: [],
      readOnly,
      code,
      tableCode,
      viewTableCode,
      tabPaneCode,
      operationsRecordVisible: false,
      customizeUnitCode,
    };
  }

  componentDidMount() {
    const { requisitionId } = this.state;
    if (requisitionId) {
      this.loadData();
    }
  }

  /**
   * 查询页面初始数据
   */
  @Bind()
  loadData() {
    const { dispatch } = this.props;
    const { requisitionId, stageCode, readOnly, customizeUnitCode: code } = this.state;
    dispatch({
      type: 'supplierReview/queryDetail',
      payload: {
        requisitionId,
        stageCode,
        reviewedFlag: readOnly ? 1 : undefined,
        customizeUnitCode: code,
      },
    }).then(data => {
      if (!isEmpty(data)) {
        const { supplierCompanyId, dimensionCode, companyId } = data;
        this.querySupplierClassification();
        if (stageCode === 'RECOMMEND') {
          this.handleMaterialsCategories();
        }
        if (stageCode === 'POTENTIAL' || stageCode === 'QUALIFIED') {
          const params =
            dimensionCode === 'GROUP' ? { supplierCompanyId } : { supplierCompanyId, companyId };
          this.queryReviewDetail({ page: 0, size: 10 }, params);
        }
      }
    });
  }

  /**
   * 查询供应商分类数据
   * @param {number} supplierCompanyId - 供应商公司Id
   * @param {number} supplierTenantId - 供应商租户Id
   * @param {object} pagination - 分页查询参数
   */
  @Bind()
  querySupplierClassification() {
    const { requisitionId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierReview/querySupplierClassification',
      payload: { requisitionId },
    });
  }

  /**
   * 查询供货能力清单
   * @function queryReviewDetail
   * @param {Number} params.organizationId 租户Id
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  queryReviewDetail(page = {}, params) {
    const { dispatch } = this.props;
    const { requisitionId, stageCode } = this.state;
    dispatch({
      type: 'supplierReview/queryReviewDetail',
      payload: {
        ...params,
        page,
        requisitionId,
        stageCode,
        customizeUnitCode:
          stageCode === 'POTENTIAL'
            ? 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE'
            : 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
      },
    });
  }

  /**
   *供货能力清单分页
   * @function handleReviewTableChange
   * @param {Number} [pagination.page = 0] - 数据页码
   * @param {Number} [pagination.size = 10] - 分页大小
   * @memberof SupplierReviewDetail
   */
  @Bind()
  handleReviewTableChange(pagination) {
    const {
      supplierReview: { headerInfo = {} },
    } = this.props;
    const { supplierCompanyId, dimensionCode, companyId } = headerInfo;
    const params =
      dimensionCode === 'GROUP' ? { supplierCompanyId } : { supplierCompanyId, companyId };
    this.queryReviewDetail(pagination, params);
  }

  /**
   * 查询推荐物料/品类
   */
  @Bind()
  handleMaterialsCategories() {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    dispatch({
      type: 'supplierReview/queryMaterialsCategories',
      payload: {
        requisitionId,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_ITEM_TABLE',
      },
    });
  }

  /**
   * 更新附件表
   * @function updateEnclosure
   * @param {Array} data - 更新后的数组
   */
  @Bind()
  updateEnclosure(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierReview/updateState',
      payload: {
        enclosureDataSource: data,
      },
    });
  }

  /**
   * 删除状态树中的数据
   * @function updateEnclosure
   * @param {Array} localRows 删除的数据
   */
  @Bind()
  deleteEnclosure(localRows, attachmentLineIdList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(attachmentLineIdList)) {
      dispatch({
        type: 'supplierReview/deleteEnclosureData',
        payload: {
          attachmentLineIdList,
          requisitionId,
        },
      }).then(res => {
        if (res) {
          this.clearRows();
          notification.success();
        }
      });
    }
    dispatch({
      type: 'supplierReview/updateState',
      payload: {
        enclosureDataSource: localRows,
      },
    });
  }

  /**
   * 保存改变过的行
   * @param {Object} record - 表中对象
   */
  @Bind()
  changeDataSoruce(record, flag) {
    const {
      supplierReview: { scoreInforDataSoruce },
      dispatch,
    } = this.props;
    const newScoreInforDataSoruce = scoreInforDataSoruce.map(item => {
      if (item.scorerLineId === record.scorerLineId) {
        return { ...item, isVeto: !!flag };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierReview/updateState',
      payload: {
        scoreInforDataSoruce: newScoreInforDataSoruce,
      },
    });
  }

  /**
   *移除对象中的某个属性
   *
   * @param {Object} obj 需要移除属性的对象
   * @param {String} paramsArr 对象里的key
   * @returns
   * @memberof ProducerConfig
   */
  handleRemoveProps(obj, paramsArr) {
    const newItem = { ...obj };
    paramsArr.forEach(item => {
      if (newItem[item]) {
        delete newItem[item];
      }
    });
    return newItem;
  }

  /**
   * 提交并保存数据或者保存数据
   * @param {*} flag true - 提交并保存
   */
  @Bind()
  handleSaveAndSubmit(flag) {
    const {
      form,
      dispatch,
      history,
      supplierReview: { scoreInforDataSoruce = [], headerInfo, enclosureDataSource = [] },
    } = this.props;
    const { requisitionId, customizeUnitCode: code } = this.state;
    const newEnclosureDataSource = !isEmpty(enclosureDataSource)
      ? enclosureDataSource.map(item => {
          if (item.isLocal) {
            const { attachmentLineId, isLocal, ...other } = item;
            return other;
          } else {
            return item;
          }
        })
      : [];
    form.validateFields({ force: true }, (err, fieldsValues) => {
      if (!err) {
        const value = fieldsValues;
        const fieldsArr = ['score', 'remark', 'isStandard', 'isVeto', 'evalTplIndOptId'];
        const payloadData = scoreInforDataSoruce.map(item => {
          let targetItem = item;
          fieldsArr.forEach(_item => {
            const _itemValue = value[`${_item}#${item.scorerLineId}`];
            targetItem[`${_item}`] = isUndefined(_itemValue) ? null : _itemValue;
          });
          targetItem = this.handleRemoveProps(targetItem, ['isEdit']);
          return targetItem;
        });
        if (flag) {
          // 提交保存
          dispatch({
            type: 'supplierReview/submitSupplierReview',
            payload: {
              requisitionId,
              data: {
                ...headerInfo,
                scoreLines: payloadData,
                qualifiedAttachmentLines: newEnclosureDataSource,
              },
              customizeUnitCode: code,
            },
          }).then(res => {
            if (res) {
              notification.success();
              history.push('/sslm/eligible-supplier-review/list');
            }
          });
        } else {
          // 保存
          dispatch({
            type: 'supplierReview/saveSupplierReview',
            payload: {
              requisitionId,
              data: {
                ...headerInfo,
                scoreLines: payloadData,
                qualifiedAttachmentLines: newEnclosureDataSource,
              },
              customizeUnitCode: code,
            },
          }).then(res => {
            if (res) {
              this.loadData();
              notification.success();
            }
          });
        }
      } else {
        this.handleSaveKey('scoreInformation');
      }
    });
  }

  /**
   * 打开上传附件模态框
   */
  @Bind()
  showUploadModal() {
    this.setState({ uploadVisible: true });
  }

  /**
   * 关闭上传附件模态框
   */
  @Bind()
  handleCancel() {
    this.setState({ uploadVisible: false });
    this.setState({
      fileList: [],
    });
  }

  /**
   * 上传modal确定按钮
   */
  @Bind()
  handleUploadOk() {
    const {
      dispatch,
      user: {
        currentUser: { id, loginName, realName },
      },
      supplierReview: { enclosureDataSource = [] },
    } = this.props;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          loginName,
          realName,
          attachmentLineId: uuid(),
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          uploadUserId: id,
          remark: '',
          tenantId: organizationId,
          isLocal: true,
        }))
      : [];
    dispatch({
      type: 'supplierReview/updateState',
      payload: {
        enclosureDataSource: [...enclosureDataSource, ...fileData],
      },
    });
    this.setState({ uploadVisible: false, fileList: [] });
  }

  /**
   * 将上传列表放到state
   * @param {Object} file - 上传的文件
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 上传前的校验
   * @param {Object} file - 上传的文件
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 500 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  @Bind()
  async beforeUploadFiles(files) {
    const { fileSize: defaultFileSize = defaultMaxFileSize } = this.props;
    const remoteFileSize = await fetchRemoteFileSizeLimit(PRIVATE_BUCKET, bucketDirectory);
    const fileSize = remoteFileSize || defaultFileSize;
    const fileSizeValidate = every(
      map(files, file => {
        if (fileSize && file.size > fileSize) {
          file.status = 'error'; // eslint-disable-line
          notification.error({
            message: intl.get('hzero.common.upload.status.error').d('上传失败'),
            description: intl
              .get('hzero.common.upload.error.size', {
                fileSize: fileSize / (1024 * 1024),
              })
              .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
          });
          return false;
        }
        return true;
      })
    );
    return fileSizeValidate;
  }

  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
    };
  }

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        this.setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'supplierReview/onDraggerUploadRemove',
        payload: {
          bucketName: PRIVATE_BUCKET,
          directory: bucketDirectory,
          urls: [file.response],
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
      this.setState({
        fileList: fileList.filter(o => o.uid !== file.uid),
      });
    }
  }

  @Bind()
  openOperationsRecordModal() {
    this.setState({ operationsRecordVisible: true });
  }

  render() {
    const {
      uploadVisible,
      stageCode,
      readOnly,
      code,
      tableCode,
      viewTableCode,
      tabPaneCode,
      operationsRecordVisible,
    } = this.state;
    const {
      form,
      allLoading,
      linkColor,
      supplierReview: {
        enclosureDataSource,
        headerInfo,
        reviewMaterialPagination = {},
        scoreInforDataSoruce = [],
        supplierClassificationData = [],
        reviewMaterialData = {},
        materialsCategoriesList = [],
      },
      user: { currentUser = {} },
      custLoading,
      customizeForm,
      customizeTable,
      customizeTabPane,
      tabsPrimaryColor,
    } = this.props;

    const { processStatus } = isEmpty(scoreInforDataSoruce) ? {} : scoreInforDataSoruce[0];

    // 评分信息
    const ScoreInformationTableProps = {
      form,
      dataSource: scoreInforDataSoruce,
      isVeto: isEmpty(scoreInforDataSoruce.filter(n => n.isVeto)),
      onUpdateState: this.changeDataSoruce,
      customizeTable,
      custLoading,
      tableCode,
      viewTableCode,
    };
    // 物料品类
    const categoryMaterialTableProps = {
      linkColor,
      customizeForm,
      customizeTable,
      dataSource: materialsCategoriesList,
    };
    // 供货能力
    const supplierCapacityTableProps = {
      isSupplyFlag: false,
      isOperate: false,
      isEdit: false,
      pagination: reviewMaterialPagination,
      dataSource: reviewMaterialData.content || [],
      onTableChange: this.handleReviewTableChange,
      customizeForm,
      customizeTable,
      formCode:
        stageCode === 'POTENTIAL'
          ? 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_FORM'
          : 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_FORM',
      tableCode:
        stageCode === 'POTENTIAL'
          ? 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE'
          : 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
    };

    // 供应商分类
    const supplierClassificationTableProps = {
      dataSource: supplierClassificationData,
    };
    // 附件
    const enclosureTableProps = {
      currentUser,
      dataSource: enclosureDataSource,
      onUpdateRow: this.updateEnclosure,
      onDeleteRows: this.deleteEnclosure,
      onClearRows: ref => {
        this.clearRows = ref;
      },
    };
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      headers,
      name: 'file',
      multiple: true,
      // accept: 'image/*',
      data: this.uploadData,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
      beforeUploadFiles: this.beforeUploadFiles,
    };

    const processType = {
      RECOMMEND: 'recommend',
      POTENTIAL: 'potential',
      QUALIFIED: 'qualified',
      RESERVED: 'prepare',
    };

    // 评分信息行状态为新建、退回时可编辑
    const editFlag = ['NEW', 'BACK'].includes(processStatus) && !readOnly;

    return (
      <React.Fragment>
        <Header
          title={`${headerInfo.targetStageDescription}${intl
            .get('sslm.supplierReview.view.title.supplierReview')
            .d('供应商评审')}`}
          backPath="/sslm/eligible-supplier-review/list"
        >
          {editFlag && (
            <React.Fragment>
              <Button
                type="primary"
                icon="save"
                loading={allLoading}
                onClick={() => this.handleSaveAndSubmit(false)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="check"
                loading={allLoading}
                onClick={() => this.handleSaveAndSubmit(true)}
              >
                {intl.get(`hzero.common.button.submit`).d('提交')}
              </Button>
              <Button icon="upload" loading={allLoading} onClick={this.showUploadModal}>
                {intl.get('hzero.common.upload.text').d('上传附件')}
              </Button>
              <Button
                icon="file-text"
                loading={allLoading}
                onClick={() => handleSupplierDetail(headerInfo)}
              >
                {intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息')}
              </Button>
            </React.Fragment>
          )}
          <Button
            icon="file-text"
            loading={allLoading}
            onClick={this.openOperationsRecordModal}
            disabled={headerInfo.processStatus === undefined}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            <div style={{ marginLeft: 16 }}>
              <HeaderInfo
                isReviewed={readOnly}
                form={form}
                headerInfo={headerInfo}
                stageCode={stageCode}
                code={code}
                custLoading={custLoading}
                customizeForm={customizeForm}
              />
            </div>
            {customizeTabPane(
              {
                code: tabPaneCode,
              },
              <Tabs animated={false} custLoading={custLoading}>
                <Tabs.TabPane
                  tab={intl
                    .get(`sslm.supplierReview.view.message.tab.scoreInformation`)
                    .d('评分信息')}
                  key="scoreInformation"
                >
                  <ScoreInformationTable
                    isEdit={editFlag}
                    tableProps={ScoreInformationTableProps}
                  />
                </Tabs.TabPane>
                {stageCode === 'RECOMMEND' && (
                  <Tabs.TabPane
                    tab={intl
                      .get(`sslm.supplierReview.view.message.tab.categoryMaterial`)
                      .d('推荐物料/品类')}
                    key="categoryMaterial"
                  >
                    <CategoryMaterialTable isEdit={false} tableProps={categoryMaterialTableProps} />
                  </Tabs.TabPane>
                )}
                {!(stageCode === 'RECOMMEND' || stageCode === 'RESERVED') && (
                  <Tabs.TabPane
                    tab={intl
                      .get(`sslm.supplierReview.view.message.tab.supplierCapacity`)
                      .d('供货能力清单')}
                    key="supplierCapacity"
                  >
                    <SupplierCapacityTable {...supplierCapacityTableProps} />
                  </Tabs.TabPane>
                )}
                <Tabs.TabPane
                  tab={intl
                    .get(`sslm.supplierReview.view.message.tab.supplierClassify`)
                    .d('供应商分类')}
                  key="supplierClassification"
                >
                  <SupplierClassificationTable {...supplierClassificationTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="enclosure"
                  tab={
                    <span>
                      {intl.get('hzero.common.upload.modal.title').d('附件')}
                      <Tag
                        color={tabsPrimaryColor || '#108ee9'}
                        style={{
                          height: 'auto',
                          lineHeight: '15px',
                          marginLeft: '4px',
                        }}
                      >
                        {enclosureDataSource && Array.isArray(enclosureDataSource)
                          ? enclosureDataSource.length
                          : 0}
                      </Tag>
                    </span>
                  }
                >
                  <EnclosureTable isEdit={editFlag} tableProps={enclosureTableProps} />
                </Tabs.TabPane>
              </Tabs>
            )}
          </Spin>
        </Content>
        <Modal
          destroyOnClose
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          onOk={this.handleUploadOk}
          onCancel={this.handleCancel}
          width={520}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`sslm.common.upload.content`)
                .d('单击或拖动附件(500MB以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>

        {/* 操作记录-抽屉 */}
        <OperationsRecordModal
          visible={operationsRecordVisible}
          onClose={() => this.setState({ operationsRecordVisible: false })}
          processType={processType[headerInfo.stageCode]}
          requisitionId={headerInfo.requisitionId}
        />
      </React.Fragment>
    );
  }
}
