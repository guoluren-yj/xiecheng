import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Collapse, Icon, Button, Spin, Form, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, merge } from 'lodash';
import uuid from 'uuid/v4';
import Upload from 'components/Upload';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  addItemsToPagination,
  getEditTableData,
  createPagination,
  delItemsToPagination,
} from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import classnames from 'classnames';

import DetailHeader from '../DetailHeader';
import List from './List';
import styles from './../index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;
const { confirm } = Modal;
@withCustomize({
  unitCode: [
    'SINV.ACCEPTANCE_CREATE_DETAIL.HEADER',
    'SINV.ACCEPTANCE_CREATE_DETAIL.AGREEMENT',
    'SINV.ACCEPTANCE_CREATE_DETAIL.ORDER',
    'SINV.ACCEPTANCE_CREATE_DETAIL.LINE',
  ],
})
@formatterCollections({
  code: [
    'sinv.acceptanceSheetCreate',
    'entity.attachment',
    'sinv.acceptanceApproved',
    'sinv.acceptance',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchListLoading: loading.effects['deliveryApproved/queryDeliveryApprovedList'],
  fetchBasePcLineListLoading: loading.effects['acceptanceSheetCreate/fetchBasePcLineList'],
  updateListLoading: loading.effects['acceptanceSheetCreate/updateList'],
  submitLoading: loading.effects['acceptanceSheetCreate/submit'],
  fetchHeaderLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  acceptanceSheetCreate,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const acceptListHeaderId = params.id;
    this.state = {
      collapseKeys: ['acceptanceHeaderInfo', 'acceptanceLineInfo'], // 打开的折叠面板key
      acceptListHeaderId,
      selectedRowKeys: [], // 勾选数组
      selectedRow: [],
      dataSource: [],
      pagination: {},
      headerInfo: {},
      updateFlag: false, // 是否修改行信息
      hcuzListFlag: true,
      customizeCode: '', // 行个性化编码
    };
    this.ListRef = React.createRef();
    this.HeaderRef = React.createRef();
  }

  componentDidMount() {
    this.fetchHeader();
  }

  // 查询
  @Bind()
  fetchHeader() {
    const { acceptListHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetCreate/fetchHeader',
      payload: {
        acceptListHeaderId,
        customizeUnitCode: 'SINV.ACCEPTANCE_CREATE_DETAIL.HEADER',
      },
    }).then((res) => {
      if (res) {
        const { sourceCode } = res;
        this.setState({ headerInfo: res });
        this.setCustomizeCode(sourceCode);
        this.handleSearch();
        this.setState({ hcuzListFlag: false });
      }
    });
  }

  @Bind()
  setCustomizeCode(sourceCode) {
    if (sourceCode === 'ORDER') {
      this.setState({ customizeCode: 'SINV.ACCEPTANCE_CREATE_DETAIL.ORDER' });
    } else if (sourceCode === 'CONTRACT') {
      this.setState({ customizeCode: 'SINV.ACCEPTANCE_CREATE_DETAIL.AGREEMENT' });
    } else {
      this.setState({ customizeCode: 'SINV.ACCEPTANCE_CREATE_DETAIL.LINE' });
    }
  }

  @Bind()
  updateState(val, userId) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        acceptorName: val,
        acceptorIdList: userId,
        acceptorNameList: val,
      },
    });
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      headerInfo: { acceptListHeaderId },
    } = this.state;
    dispatch({
      type: 'acceptanceSheetCreate/bindHeaderAttachmentUuid',
      payload: {
        acceptListHeaderId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  // 查询
  @Bind()
  handleSearch(page = {}) {
    const { acceptListHeaderId, updateFlag, customizeCode } = this.state;
    const { dispatch } = this.props;
    if (updateFlag) {
      notification.warning({
        message: intl.get(`sinv.acceptanceSheetCreate.message.saveMesg`).d('当前页面有数据未保存'),
      });
    } else {
      dispatch({
        type: 'acceptanceSheetCreate/fetchDetailList',
        payload: {
          acceptListHeaderId,
          page,
          customizeUnitCode: customizeCode,
        },
      }).then((res) => {
        if (res) {
          this.setState(
            {
              dataSource: res.content.map((n) => ({
                ...n,
                _status: 'update',
              })),
              pagination: createPagination(res),
              selectedRowKeys: [],
              selectedRow: [],
            },
            () => {
              this.form.resetFields();
            }
          );
        }
      });
    }
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   *
   * @param {object} ref - Search子组件对象
   */

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 勾选按钮
  @Bind()
  handleSelect(selectedRowKeys, selectedRow) {
    this.setState({ selectedRowKeys, selectedRow });
  }

  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { headerInfo = {}, dataSource = [], acceptListHeaderId } = this.state;
    this.setState({ updateFlag: false });
    if (this.form) {
      this.form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const acceptListLineList = getEditTableData(dataSource, [
            'pcSubjectId',
            'acceptListLineId',
            '_status',
          ]).map((n) => ({
            ...n,
            acceptListHeaderId,
            acceptStageId: n.pcStageId,
          }));
          const acceptorIds = isArray(values.acceptorId)
            ? values.acceptorId.join()
            : values.acceptorId;
          if (
            dataSource.length === 0 ||
            (isArray(acceptListLineList) && acceptListLineList.length !== 0)
          ) {
            const headerData = {
              acceptListLineList,
              ...merge(headerInfo, values),
              acceptDate: values.acceptDate ? values.acceptDate.format(DATETIME_MIN) : undefined,
              // acceptorName: isArray(values.acceptorName)
              //   ? values.acceptorName.join()
              //   : values.acceptorName,
              acceptorName:
                acceptorIds || (headerInfo.acceptorIdList && headerInfo.acceptorIdList.join()),
            };
            const newDs = [];
            const ds = [];
            acceptListLineList.forEach((i) => {
              const {
                pcSubjectId,
                sourceLineId,
                acceptStageId,
                acceptQuantity,
                canAcceptQuantity,
                pcNum,
                itemName,
              } = i;
              ds.push({
                pcSubjectId: pcSubjectId || sourceLineId,
                pcNum,
                acceptStageId,
                acceptQuantity,
                itemName,
                canAcceptQuantity,
              });
              newDs.push(pcSubjectId || sourceLineId);
            });
            let continueFlag = true;
            for (let i = 0; i < ds.length; i++) {
              const el = ds[i];
              for (let y = i + 1; y < ds.length; y++) {
                const val = ds[y];
                if (el.pcSubjectId === val.pcSubjectId && el.acceptStageId === val.acceptStageId) {
                  if (el.acceptQuantity + val.acceptQuantity > el.canAcceptQuantity) {
                    notification.warning({
                      message: intl
                        .get('sinv.acceptanceSheetCreate.message.max')
                        .d(
                          `协议：${el.pcNum}，物料：${el.itemName}，本次验收数量超过可验收数量，请修改本次验收数量！`
                        ),
                    });
                    continueFlag = false;
                  }
                }
              }
            }
            if (continueFlag) {
              dispatch({
                type: 'acceptanceSheetCreate/updateList',
                payload: {
                  headerData,
                  customizeUnitCode: `SINV.ACCEPTANCE_CREATE_DETAIL.HEADER,${
                    headerInfo.sourceCode === 'ORDER'
                      ? 'SINV.ACCEPTANCE_CREATE_DETAIL.ORDER'
                      : 'SINV.ACCEPTANCE_CREATE_DETAIL.AGREEMENT'
                  }`,
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.fetchHeader();
                }
              });
            }
          }
        }
      });
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { headerInfo, dataSource } = this.state;
    const { dispatch } = this.props;
    confirm({
      title: intl.get('sinv.acceptanceSheetCreate.message.delete').d('确认删除？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'acceptanceSheetCreate/delete',
          payload: {
            ...headerInfo,
            acceptListLineList: dataSource.map((p) => {
              if (typeof p.acceptListLineId === 'string') {
                return { ...p, acceptListLineId: '' };
              } else {
                return { ...p };
              }
            }),
          },
        }).then((res) => {
          if (res) {
            dispatch(
              routerRedux.push({
                pathname: `/sinv/acceptance-sheet-create/list`,
              })
            );
          }
        });
      },
    });
  }

  @Bind()
  handleSubmit() {
    const { dispatch } = this.props;
    const { headerInfo = {}, dataSource = [], acceptListHeaderId } = this.state;
    if (this.form) {
      this.form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const acceptListLineList = getEditTableData(dataSource, [
            'pcSubject',
            'acceptListLineId',
            '_status',
          ]).map((n) => ({
            ...n,
            acceptListHeaderId,
            acceptStageId: n.pcStageId,
          }));
          const acceptorIds = isArray(values.acceptorId)
            ? values.acceptorId.join()
            : values.acceptorId;
          if (
            dataSource.length === 0 ||
            (isArray(acceptListLineList) && acceptListLineList.length !== 0)
          ) {
            const wholeDate = {
              acceptListLineList,
              ...merge(headerInfo, values),
              acceptDate: values.acceptDate ? values.acceptDate.format(DATETIME_MIN) : undefined,
              // acceptorName: isArray(values.acceptorName)
              //   ? values.acceptorName.join()
              //   : values.acceptorName,
              acceptorName:
                acceptorIds || (headerInfo.acceptorIdList && headerInfo.acceptorIdList.join()),
            };
            const newDs = [];
            const ds = [];
            acceptListLineList.forEach((i) => {
              const {
                pcSubjectId,
                sourceLineId,
                acceptQuantity,
                canAcceptQuantity,
                pcNum,
                itemName,
                acceptStageId,
              } = i;
              ds.push({
                pcSubjectId: pcSubjectId || sourceLineId,
                pcNum,
                acceptStageId,
                acceptQuantity,
                itemName,
                canAcceptQuantity,
              });
              newDs.push(pcSubjectId || sourceLineId);
            });
            let continueFlag = true;
            for (let i = 0; i < ds.length; i++) {
              const el = ds[i];
              for (let y = i + 1; y < ds.length; y++) {
                const val = ds[y];
                if (el.pcSubjectId === val.pcSubjectId && el.acceptStageId === val.acceptStageId) {
                  if (el.acceptQuantity + val.acceptQuantity > el.canAcceptQuantity) {
                    notification.warning({
                      message: intl
                        .get('sinv.acceptanceSheetCreate.message.max')
                        .d(
                          `协议：${el.pcNum}，物料：${el.itemName}，本次验收数量超过可验收数量，请修改本次验收数量！`
                        ),
                    });
                    continueFlag = false;
                  }
                }
              }
            }
            if (continueFlag) {
              // dispatch({
              //   type: 'acceptanceSheetCreate/updateList',
              //   payload: { acceptListHeaderCreateDTOList: [wholeDate] },
              // }).then(res => {
              //   if (res) {
              //     notification.success();
              //     this.fetchHeader();
              //     dispatch({
              //       type: 'acceptanceSheetCreate/fetchHeader',
              //       payload: { acceptListHeaderId },
              //     }).then(r => {
              //       if (r) {
              //         this.setState({ headerInfo: r }, () => {
              //           const valueList = [{ ...this.state.headerInfo }];
              dispatch({
                type: 'acceptanceSheetCreate/submit',
                payload: {
                  acceptListHeaderCreateDTOList: [wholeDate],
                  customizeUnitCode: `SINV.ACCEPTANCE_CREATE_DETAIL.HEADER,${
                    headerInfo.sourceCode === 'ORDER'
                      ? 'SINV.ACCEPTANCE_CREATE_DETAIL.ORDER'
                      : 'SINV.ACCEPTANCE_CREATE_DETAIL.AGREEMENT'
                  }`,
                },
              }).then((re) => {
                if (re) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: `/sinv/acceptance-sheet-create/list`,
                    })
                  );
                }
              });
              //   });
              // }
              // });
              // }
              // });
            }
          }
        }
      });
    }
  }

  /**
   *
   *新建
   * @param {*} newDataSource
   * @memberof Detail
   */
  @Bind()
  project(newDataSource) {
    const { dataSource = [], pagination = {} } = this.state;
    const index = dataSource.findIndex(
      (ele) => ele.acceptListLineId === newDataSource.acceptListLineId
    );
    if (index > -1) {
      dataSource[index] = newDataSource;
      this.setState({
        dataSource,
        pagination: addItemsToPagination(dataSource.length, pagination),
      });
    } else {
      this.setState({
        dataSource: [...dataSource, newDataSource],
        pagination: addItemsToPagination(dataSource.length, pagination),
      });
    }
  }

  // 重置dataSource的值
  @Bind()
  updateDataSource(newDataSource) {
    const { pagination, dataSource } = this.state;
    this.setState({
      dataSource: newDataSource,
      selectedRowKeys: [],
      selectedRow: [],
      pagination: delItemsToPagination(
        dataSource.length - newDataSource.length,
        dataSource.length,
        pagination
      ),
    });
  }

  // 过滤dataSource的值
  @Bind()
  filterDataSource(newDataSource) {
    const { pagination, dataSource } = this.state;
    const ds = dataSource.filter((item) => !newDataSource.includes(item));
    this.setState({
      dataSource: ds,
      selectedRowKeys: [],
      selectedRow: [],
      pagination: delItemsToPagination(
        dataSource.length - ds.length,
        dataSource.length,
        pagination
      ),
    });
  }

  // 更新数据源
  @Bind()
  changeDataSource(dataSource) {
    this.setState(dataSource);
  }

  @Bind()
  handleUpload(attachmentUuid, record) {
    this.props.dispatch({
      type: 'acceptanceSheetCreate/handleUpload',
      payload: {
        attachmentUuid,
        acceptListLineId: record.acceptListLineId,
      },
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { headerInfo = {} } = this.state;
    if (!headerInfo.attachmentUuid) {
      this.bindHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * 获取可添加的验收单行列表数据
   * @param {*} params
   * @param {*} page
   */
  @Bind()
  handleFetchCreate(params = {}, page = {}) {
    const {
      headerInfo: { acceptListHeaderId, sourceCode },
      dataSource,
    } = this.state;
    const {
      dispatch,
      acceptanceSheetCreate: { pcLinePagination = {} },
    } = this.props;
    this.handleRefresh();
    if (sourceCode === 'ORDER') {
      const poLineIds = [];
      dataSource.forEach((i) => {
        const { poLineId, sourceLineId, sourceId } = i;
        poLineIds.push(poLineId || sourceLineId || sourceId);
      });
      dispatch({
        type: 'acceptanceSheetCreate/fetchBasePcLineList',
        payload: {
          ...params,
          sourceCode,
          acHeaderId: acceptListHeaderId,
          poLineIds,
          page: page || pcLinePagination,
        },
      });
    } else {
      const newDs = [];
      dataSource.forEach((i) => {
        const { pcSubjectId, sourceLineId } = i;
        newDs.push(pcSubjectId || sourceLineId);
      });
      const ids = [];
      newDs.forEach((item) => {
        if (newDs.indexOf(item) !== newDs.lastIndexOf(item) && ids.indexOf(item) === -1) {
          ids.push(item);
        }
      });
      dispatch({
        type: 'acceptanceSheetCreate/fetchBasePcLineList',
        payload: {
          ...params,
          sourceCode,
          acHeaderId: acceptListHeaderId,
          selectPcSubIds: ids,
          page: page || pcLinePagination,
        },
      });
    }
  }

  /**
   * 添加验收单行-确认后回调 - 更新dataSource
   * @param {*} selectedAddRow
   */
  @Bind()
  handleUpdateList(selectedAddRow) {
    const { dataSource, pagination } = this.state;
    const newDataSource = [...dataSource, ...selectedAddRow].map((item) => {
      return {
        ...item,
        acceptListLineId: item.acceptListLineId || uuid(),
        _status: item.lineNum !== undefined ? 'update' : 'create',
      };
    });
    this.setState({
      dataSource: newDataSource,
      pagination: addItemsToPagination(selectedAddRow.length, dataSource.length, pagination),
    });
    this.handleRefresh();
  }

  /**
   * 清除缓存
   */
  @Bind()
  handleRefresh() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetCreate/updateState',
      payload: {
        pcLineList: [],
      },
    });
  }

  /**
   * 添加验收单行-列表查询
   * @param {*} fieldsValue
   */
  @Bind()
  handleFormSearch(fieldsValue = {}) {
    this.handleFetchCreate(fieldsValue);
  }

  /**
   * 添加验收单行-列表分页
   * @param {*} pagination
   * @param {*} fieldsValue
   */
  @Bind()
  handleAddPageChange(pagination = {}, fieldsValue = {}) {
    this.handleFetchCreate(fieldsValue, pagination);
  }

  @Bind()
  handleChangeList(flag) {
    this.setState({ updateFlag: flag });
  }

  /**
   * 计算本次验收数量
   * @param flag
   * @param val
   * @param record
   */
  @Bind()
  handleChangeAcceptQuantity(flag, val, record) {
    const { dataSource, headerInfo } = this.state;
    let newDataSource = [];
    // costQuantity 阶段费用, taxIncludeAmount 协议总额, purchaseTaxIncludedPrice 标的本币含税单价, financialPrecision 币种精度
    const {
      purchaseCostQuantity,
      taxIncludeAmount,
      purchaseTaxIncludedPrice,
      financialPrecision,
    } = record;
    // 计算费用
    if (headerInfo.acceptBaseCode === 'STAGE') {
      if (purchaseCostQuantity && taxIncludeAmount && purchaseTaxIncludedPrice) {
        const acceptAmount = (
          purchaseTaxIncludedPrice *
          (val || 0) *
          (purchaseCostQuantity / taxIncludeAmount)
        ).toFixed(financialPrecision || 2);
        newDataSource = [...dataSource].map((item) => {
          if (item.acceptListLineId === record.acceptListLineId) {
            return { ...item, acceptAmount };
          }
          return item;
        });
        this.setState({ updateFlag: flag, dataSource: newDataSource });
      } else {
        this.setState({ updateFlag: flag });
      }
    } else {
      this.setState({ updateFlag: flag });
    }
  }

  @Bind()
  handerOnChangeFile(test, lovRecord) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        templateAttachmentUuid: lovRecord.templateAttachmentUuid,
      },
    });
  }

  render() {
    const {
      dispatch,
      acceptanceSheetCreate: { pcLineList = [], pcLinePagination = {} },
      fetchBasePcLineListLoading,
      updateListLoading,
      submitLoading,
      customizeTable,
      customizeForm,
      fetchHeaderLoading,
    } = this.props;
    const {
      collapseKeys,
      headerInfo,
      acceptListHeaderId,
      tenantId,
      selectedRowKeys,
      selectedRow = [],
      dataSource,
      pagination,
      customizeCode,
      hcuzListFlag,
    } = this.state;
    const listProps = {
      headerInfo,
      dataSource,
      dispatch,
      pagination,
      acceptListHeaderId,
      tenantId,
      hcuzListFlag,
      customizeTable,
      customizeCode,
      onProject: this.project,
      onUpdateDataSource: this.updateDataSource,
      onFilterDataSource: this.filterDataSource,
      onHandleChangeList: this.handleChangeList,
      onHandleChangeAcceptQuantity: this.handleChangeAcceptQuantity,
      onChangeDataSource: this.changeDataSource,
      onHandleUpload: this.handleUpload,
      onDeleteLine: this.deleteLine,
      onRef: (node) => {
        this.ListRef = node;
      },
      selectedRowKeys,
      selectedRow,
      onSelectRow: this.handleSelect,
      onSelectedAddRows: this.handleSelectAdd,
      onSearch: this.handleSearch,
      fetchHeader: this.fetchHeader,
      onFetchCreate: this.handleFetchCreate,
      pcLineList,
      pcLinePagination,
      onUpdateList: this.handleUpdateList,
      onRefresh: this.handleRefresh,
      fetchBasePcLineListLoading,
      onFormSearch: this.handleFormSearch,
      onAddPageChange: this.handleAddPageChange,
      onFetchLine: this.handleSearch,
    };
    const uploadProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
        disabled: !acceptListHeaderId,
      },
      showFilesNumber: false,
      attachmentUUID: headerInfo.attachmentUuid ? headerInfo.attachmentUuid : '',
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-acceptance',
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sinv.acceptanceSheetCreate.title.acceptanceDetail`).d('验收单明细')}
          backPath="/sinv/acceptance-sheet-create/list"
        >
          <Button
            onClick={this.handleSave}
            type="primary"
            icon="save"
            loading={fetchHeaderLoading || updateListLoading || submitLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            onClick={this.handleSubmit}
            icon="check"
            disabled={isArray(dataSource) && dataSource.length === 0}
            loading={updateListLoading || submitLoading}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button onClick={this.handleDelete} icon="delete">
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Upload {...uploadProps} />
        </Header>
        <Content>
          <Spin
            spinning={false}
            wrapperClassName={classnames(
              styles['purchase-requisition-creation-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            <Collapse
              className={styles['form-collapse']}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {intl
                        .get(`sinv.acceptanceSheetCreate.title.acceptanceHeaderInfo`)
                        .d('验收单头信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('acceptanceHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('acceptanceHeaderInfo') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="acceptanceHeaderInfo"
              >
                <DetailHeader
                  Ref={(node) => {
                    this.HeaderRef = node;
                  }}
                  onRef={this.handleBindRef}
                  handleOnChangeFile={this.handerOnChangeFile}
                  updateState={this.updateState}
                  headerInfo={headerInfo}
                  editable={1}
                  maintainEditable={1}
                  customizeForm={customizeForm}
                />
              </Panel>
            </Collapse>
            <Collapse
              className={styles['form-collapse']}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {' '}
                      {intl
                        .get(`sinv.acceptanceSheetCreate.title.acceptanceLineInfo`)
                        .d('验收单行信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('acceptanceLineInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('acceptanceLineInfo') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="acceptanceLineInfo"
              >
                <List {...listProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
