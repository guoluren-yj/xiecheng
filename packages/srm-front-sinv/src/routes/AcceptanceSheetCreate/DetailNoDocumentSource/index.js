import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Collapse, Icon, Button, Spin, Form, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { merge, isArray } from 'lodash';
import Upload from 'components/Upload';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz';

import {
  addItemToPagination,
  getEditTableData,
  createPagination,
  delItemsToPagination,
} from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import classnames from 'classnames';

import DetailHeader from './../DetailHeader';
import List from './List';
import styles from './../index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;
const { confirm } = Modal;
@withCustomize({
  unitCode: ['SINV.ACCEPTANCE_CREATE_DETAIL.HEADER', 'SINV.ACCEPTANCE_CREATE_DETAIL.LINE'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchListLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  saveLoading: loading.effects['acceptanceSheetCreate/updateList'],
  deleteLoading: loading.effects['acceptanceSheetCreate/delete'],
  fetchListsLoading: loading.effects['acceptanceSheetCreate/fetchDetailList'],
  submitLoading: loading.effects['acceptanceSheetCreate/submit'],
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
      dataSourceLoading: true,
    };
    this.ListRef = React.createRef();
    this.HeaderRef = React.createRef();
  }

  componentDidMount() {
    this.handleSearch();
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
        this.setState({ headerInfo: res, dataSourceLoading: false });
      }
    });
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
    const { acceptListHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetCreate/fetchDetailList',
      payload: {
        acceptListHeaderId,
        page,
        customizeUnitCode: 'SINV.ACCEPTANCE_CREATE_DETAIL.LINE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((n) => ({
            ...n,
            _status: 'update',
          })),
          pagination: createPagination(res),
          selectedRowKeys: [],
          selectedRow: [],
        });
      }
    });
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
  update() {
    const { dispatch } = this.props;
    const { headerInfo = {}, dataSource = [], acceptListHeaderId } = this.state;
    if (this.form) {
      this.form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const acceptListLineList = getEditTableData(dataSource, [
            'acceptListLineId',
            '_status',
          ]).map((n) => ({
            ...n,
            acceptListHeaderId,
          }));

          if (
            dataSource.length === 0 ||
            (isArray(acceptListLineList) && acceptListLineList.length !== 0)
          ) {
            const acceptorIds = isArray(values.acceptorId)
              ? values.acceptorId.join()
              : values.acceptorId;
            const headerData = {
              acceptListLineList,
              ...merge(headerInfo, values),
              acceptDate: values.acceptDate ? values.acceptDate.format(DATETIME_MIN) : undefined,
              acceptorName: acceptorIds || headerInfo.acceptorIdList.join(),
            };
            dispatch({
              type: 'acceptanceSheetCreate/updateList',
              payload: { headerData },
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleSearch();
                this.fetchHeader();
              }
            });
          }
        }
      });
    }
  }

  @Bind()
  delete() {
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
  submit() {
    const { headerInfo, dataSource, acceptListHeaderId } = this.state;
    if (this.form) {
      this.form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const acceptListLineList = getEditTableData(dataSource, [
            'acceptListLineId',
            '_status',
          ]).map((n) => ({
            ...n,
            acceptListHeaderId,
          }));
          if (
            dataSource.length === 0 ||
            (isArray(acceptListLineList) && acceptListLineList.length !== 0)
          ) {
            const acceptorIds = isArray(values.acceptorId)
              ? values.acceptorId.join()
              : values.acceptorId;
            const wholeDate = {
              acceptListLineList,
              ...merge(headerInfo, values),
              acceptDate: values.acceptDate ? values.acceptDate.format(DATETIME_MIN) : undefined,
              acceptorName: acceptorIds || headerInfo.acceptorIdList.join(),
            };
            const { dispatch } = this.props;
            Modal.confirm({
              title: intl.get('sinv.acceptanceSheetCreate.message.submit').d('确认提交？'),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              onOk: () => {
                if (isArray(dataSource) && dataSource.length > 0) {
                  dispatch({
                    type: 'acceptanceSheetCreate/submit',
                    payload: { acceptListHeaderCreateDTOList: [wholeDate] },
                  }).then((res) => {
                    if (res) {
                      notification.success();
                      dispatch(
                        routerRedux.push({
                          pathname: `/sinv/acceptance-sheet-create/list`,
                        })
                      );
                    }
                  });
                } else {
                  notification.warning({
                    message: intl
                      .get('sinv.acceptanceSheetCreate.message.submitOk')
                      .d(`验收单未维护行信息，无法提交，请确认！`),
                  });
                }
              },
            });
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
      const newList = { ...dataSource[index], ...newDataSource };
      dataSource[index] = newList;
      this.setState({
        dataSource,
        // pagination: addItemToPagination(dataSource.length, pagination),
      });
    } else {
      this.setState({
        dataSource: [...dataSource, newDataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
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

  render() {
    const {
      dispatch,
      saveLoading,
      deleteLoading,
      fetchListsLoading,
      submitLoading,
      customizeForm,
      customizeTable,
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
      dataSourceLoading,
    } = this.state;
    const listProps = {
      dataSource,
      dispatch,
      pagination,
      acceptListHeaderId,
      tenantId,
      onProject: this.project,
      onUpdateDataSource: this.updateDataSource,
      onDeleteLine: this.deleteLine,
      onRef: (node) => {
        this.ListRef = node;
      },
      selectedRowKeys,
      selectedRow,
      onSelectRow: this.handleSelect,
      onSearch: this.handleSearch,
      fetchHeader: this.fetchHeader,
      loading: fetchListsLoading,
      customizeTable,
    };
    const uploadProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
        disabled: !acceptListHeaderId,
      },
      showFilesNumber: false,
      onUploadSuccess: this.onUploadSuccess,
      onRemoveSuccess: this.onRemoveSuccess,
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
          <Button onClick={this.update} type="primary" icon="save" loading={saveLoading}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button onClick={this.submit} icon="check" loading={submitLoading}>
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button onClick={this.delete} icon="delete" loading={deleteLoading}>
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
                  dataSourceLoading={dataSourceLoading}
                  Ref={(node) => {
                    this.HeaderRef = node;
                  }}
                  onRef={this.handleBindRef}
                  updateState={this.updateState}
                  handleOnChangeFile={this.handerOnChangeFile}
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
