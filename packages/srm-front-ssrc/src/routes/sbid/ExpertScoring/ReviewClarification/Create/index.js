/**
 * ExpertScoring - 专家评分/专家提疑
 * @date: 2019-08-15
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
/*eslint-disable*/
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { compose } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Button, Form, Collapse, Icon, Input, Spin, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getEditTableData,
  getCurrentUserId,
  addItemToPagination,
  delItemsToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
// import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import InfoForm from './InfoForm';
import common from '@/routes/sbid/common.less';
import styles from './../index.less';

const { Panel } = Collapse;
const promptCode = 'ssrc.expertScoring';
const FormItem = Form.Item;

class Update extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const { backPath = '' } = routerParams;
    this.state = {
      backPath,
      selectedRows: [],
      selectedRowKeys: [],
      collapseKeys: ['baseInfos', 'editTable'],
    };
  }

  componentDidMount() {
    this.queryClarifyNotifyHeader();
  }

  componentWillUnmount() {}

  /**
   * 查询头信息
   * @param {*}
   */
  @Bind()
  queryClarifyNotifyHeader() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      location,
      [modelName]: { notifyQuestionListPagenation },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId, shuldLoad } = routerParams;
    const payload = {
      sourceFrom,
      sourceHeaderId,
      currentFlag: 0,
      quotationHeaderId,
    };
    dispatch({
      type: `${modelName}/queryClarifyNotifyHeader`,
      payload,
    }).then((res) => {
      if (res) {
        if (Number(shuldLoad) === 1) {
          this.queryClarifyNotifyQuestionList(notifyQuestionListPagenation, 1);
        } else {
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              selectedRowKeys: [],
            },
          });
        }
      }
    });
  }

  /**
   * 页码变换时回调
   * @param {*} page
   */
  @Bind()
  pageOnChange(page) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      location,
      [modelName]: { notifyQuestionListPagenationPageSize, clarifyNotifyQuestionList },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParams;
    const edited = clarifyNotifyQuestionList.some((item) => item.$form);
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`${promptCode}.model.expertScoring.confirmYesOrNot`)
          .d('该操作将会丢失未保存数据，是否确认?'),
        onOk: () => {
          const payload = {
            sourceFrom,
            sourceHeaderId,
            quotationHeaderId,
            page: { ...page, ...{ pageSize: notifyQuestionListPagenationPageSize } },
          };
          dispatch({
            type: `${modelName}/queryClarifyNotifyQuestionList`,
            payload,
          });
        },
      });
    } else {
      const payload = {
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
        page,
      };
      dispatch({
        type: `${modelName}/queryClarifyNotifyQuestionList`,
        payload,
      });
    }
  }

  /**
   * 查询列表信息
   * @param {*}
   */
  @Bind()
  queryClarifyNotifyQuestionList(page = {}, flag) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      location,
      [modelName]: { selectedRowKeys },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParams;
    let payload;
    if (flag === 1) {
      payload = {
        page,
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
        clarifyIssueIds: selectedRowKeys,
      };
    } else {
      payload = {
        page,
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
      };
    }
    // return;
    dispatch({
      type: `${modelName}/queryClarifyNotifyQuestionList`,
      payload,
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

  /**
   * addItem - 添加数据
   */
  @Bind()
  addItem() {
    const item = {
      _status: 'create',
      issueFrom: 'EXPERT',
      attachmentUuid: undefined,
      clarifyIssueId: uuidv4(),
    };
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { clarifyNotifyQuestionList, notifyQuestionListPagenation },
    } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        clarifyNotifyQuestionList: [item, ...clarifyNotifyQuestionList],
        notifyQuestionListPagenation: addItemToPagination(
          clarifyNotifyQuestionList.length,
          notifyQuestionListPagenation
        ),
      },
    });
  }

  /**
   * handleSave - 保存
   */
  @Bind()
  handleSave(dataSource) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      location,
      [modelName]: { clarifyNotifyQuestionList },
    } = this.props;
    const datas = getEditTableData(dataSource, ['clarifyIssueId', '_status']);

    if (clarifyNotifyQuestionList.length === 0 && datas.length === 0) {
      notification.warning({
        message: intl
          .get(`${promptCode}.model.expertScoring.createAgainSave`)
          .d('请创建问题后再保存'),
      });
      return;
    } else if (clarifyNotifyQuestionList.length !== 0 && datas.length === 0) {
      notification.warning({
        message: intl.get(`${promptCode}.model.expertScoring.nothingSave`).d('没有需要保存的数据'),
      });
      return;
    }

    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParams;
    dispatch({
      type: `${modelName}/createClarifyNotifyQuestionList`,
      payload: {
        datas,
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();

        const {
          [modelName]: { notifyQuestionListPagenation = {} },
        } = this.props;
        notifyQuestionListPagenation.pageSize = 10;
        const payload = {
          sourceFrom,
          sourceHeaderId,
          quotationHeaderId,
          page: notifyQuestionListPagenation,
        };
        dispatch({
          type: `${modelName}/queryClarifyNotifyQuestionList`,
          payload,
        });
      }
    });
  }

  /**
   * handleSubmit - 提交
   */
  @Bind()
  handleSubmit(dataSource) {
    const forms = dataSource.filter((item) => item.$form).map((item) => item.$form);
    if (forms.length > 0) {
      const err = getEditTableData(dataSource);
      if (err.length === 0) {
        return;
      }
    }
    const sendList = dataSource.map((item) => {
      let newItem = item;
      if (newItem.$form) {
        newItem = Object.assign(item, item.$form.getFieldsValue());
        if (item._status === 'create') {
          delete newItem.$form;
          delete newItem.clarifyIssueId;
        }
      }
      return newItem;
    });
    if (sendList.length === 0) {
      notification.warning({
        message: intl
          .get(`${promptCode}.model.expertScoring.createAgainSubmit`)
          .d('请创建问题后再提交'),
      });
      return;
    }
    const { dispatch, location, modelName = 'expertScoring' } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParams;

    dispatch({
      type: `${modelName}/submitClarifyNotifyQuestionList`,
      payload: {
        sourceFrom,
        sourceHeaderId,
        datas: sendList,
        quotationHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        const { history } = this.props;
        const { backPath } = this.state;

        history.push({
          pathname: backPath.split('?')[0],
          search: backPath.split('?')[1],
        });
      }
    });
  }

  /**
   * deleteRecords - 删除记录
   */
  @Bind()
  deleteRecords() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { clarifyNotifyQuestionList, notifyQuestionListPagenation },
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    // 剩下的数据
    const newOriginal = clarifyNotifyQuestionList.filter(
      (item) => !selectedRowKeys.includes(item.clarifyIssueId)
    );
    // 需要调接口删除的数据id确定删除选中数据
    const deleteIds = selectedRows
      .filter((item) => item._status !== 'create')
      .map((item) => item.clarifyIssueId);
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        if (deleteIds.length === 0) {
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              clarifyNotifyQuestionList: newOriginal,
              notifyQuestionListPagenation: delItemsToPagination(
                selectedRowKeys.length,
                clarifyNotifyQuestionList.length,
                notifyQuestionListPagenation
              ),
            },
          });
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          });
          notification.success();
        } else {
          dispatch({
            type: `${modelName}/deleteQuestionRows`,
            payload: {
              deleteIds,
            },
          }).then((res) => {
            if (res) {
              dispatch({
                type: `${modelName}/updateState`,
                payload: {
                  clarifyNotifyQuestionList: newOriginal,
                  notifyQuestionListPagenation: delItemsToPagination(
                    selectedRowKeys.length,
                    clarifyNotifyQuestionList.length,
                    notifyQuestionListPagenation
                  ),
                },
              });
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
              notification.success();
            }
          });
        }
      },
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel(record) {
    const { _status } = record;
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { clarifyNotifyQuestionList = [] },
    } = this.props;
    if (_status === 'create') {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          clarifyNotifyQuestionList: clarifyNotifyQuestionList.filter(
            (item) => item.clarifyIssueId !== record.clarifyIssueId
          ),
        },
      });
    } else {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          clarifyNotifyQuestionList: clarifyNotifyQuestionList.map((item) => {
            const newItem = item;
            if (newItem.clarifyIssueId === record.clarifyIssueId) {
              delete newItem._status;
              delete newItem.$form;
            }
            return newItem;
          }),
        },
      });
    }
  }

  /**
   * 编辑
   * @param {*} record 记录
   */
  @Bind()
  handleEdit(record) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { clarifyNotifyQuestionList },
    } = this.props;
    const newClarifyNotifyQuestionList = clarifyNotifyQuestionList.map((item) => {
      const newItem = item;
      if (newItem.clarifyIssueId === record.clarifyIssueId) {
        newItem._status = 'update';
      }
      return newItem;
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        clarifyNotifyQuestionList: newClarifyNotifyQuestionList,
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCheckedChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 渲染按钮
   */
  @Bind()
  renderButton() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      loadingDelete,
      loadingSave,
      [modelName]: { clarifyNotifyQuestionList },
    } = this.props;
    const { selectedRowKeys } = this.state;
    return (
      <div className={styles.btns}>
        <Button
          type="default"
          onClick={this.deleteRecords}
          loading={loadingDelete}
          disabled={selectedRowKeys.length === 0}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <Button onClick={() => this.handleSave(clarifyNotifyQuestionList)} loading={loadingSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button type="primary" onClick={this.addItem}>
          {intl.get(`${promptCode}.model.expertScoring.create.`).d('新增')}
        </Button>
      </div>
    );
  }

  @Bind()
  onRow(record) {
    this.setState({
      clarifyIssueId: record.clarifyIssueId,
    });
  }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUuid) {
    this.setState({
      attachmentUuid,
    });
  }

  @Bind()
  uploadSuccess() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { clarifyNotifyQuestionList = [] },
    } = this.props;
    const { clarifyIssueId, attachmentUuid } = this.state;
    let priceInfo = null;
    clarifyNotifyQuestionList.forEach((item, index) => {
      if (item.clarifyIssueId === clarifyIssueId) {
        priceInfo = index;
      }
    });
    // const index = clarifyNotifyQuestionList.findIndex(item => item[clarifyIssueId] === clarifyIssueId);
    const newDataSourceList = [
      ...clarifyNotifyQuestionList.slice(0, priceInfo),
      {
        ...clarifyNotifyQuestionList[priceInfo],
        attachmentUuid,
      },
      ...clarifyNotifyQuestionList.slice(priceInfo + 1),
    ];
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        clarifyNotifyQuestionList: newDataSourceList,
      },
    });
  }

  /**
   * 渲染表格操作列
   */
  @Bind()
  renderOpr(val, record) {
    if (record._status === 'create' || record._status === 'update') {
      return (
        <React.Fragment>
          <a className={styles.marR} onClick={() => this.handleCancel(record)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </a>
          <Upload
            filePreview
            bucketName={PRIVATE_BUCKET}
            fileSize={FIlESIZE}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={record.attachmentUuid}
            afterOpenUploadModal={this.afterOpenUploadModal}
            uploadSuccess={this.uploadSuccess}
            {...ChunkUploadProps}
          />
        </React.Fragment>
      );
    }
    // else if (record._status === 'update') {
    //   return (
    //     <React.Fragment>
    //       <a onClick={() => this.handleCancel(record)}>取消</a>
    //       <UploadModal bucketName="ssrc-clarify" attachmentUUID={record.attachmentUuid} />
    //     </React.Fragment>
    //   );
    // }
    else {
      return (
        <React.Fragment>
          <a className={styles.marR} onClick={() => this.handleEdit(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={record.attachmentUuid}
            viewOnly
            filePreview
          />
        </React.Fragment>
      );
    }
  }

  /**
   * 渲染表格操作列
   */
  renderDescription(val, record) {
    if (record._status === 'update' || record._status === 'create') {
      const { getFieldDecorator } = record.$form;
      return (
        <FormItem>
          {getFieldDecorator('description', {
            initialValue: val,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.expertScoring.questionDesc`).d('问题描述'),
                }),
              },
              {
                max: 160,
                message: intl.get('hzero.common.validation.max', {
                  name: intl
                    .get(`${promptCode}.model.expertScoring.numMoreThanLimit`)
                    .d('问题描述超过字数限制'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
      );
    } else {
      return val;
    }
  }

  /**
   * 问题列表列配置
   */
  renderColumns() {
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expertScoring.clarifyIssueNum`).d('问题编号'),
        dataIndex: 'clarifyIssueNum',
        width: 150,
        key: 'clarifyIssueNum',
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.description`).d('问题描述'),
        dataIndex: 'description',
        key: 'description',
        render: this.renderDescription,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.operation`).d('操作'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: this.renderOpr,
      },
    ];

    return columns;
  }

  render() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      form,
      loadingTable,
      loadingSubmit,
      loadingHeader,
      [modelName]: {
        clarifyNotifyQuestionList,
        notifyQuestionListPagenation,
        clarifyNotifyHeader: createHeader = {},
      },
    } = this.props;

    const { collapseKeys, selectedRowKeys, selectedRows } = this.state;

    // 基本信息props
    const infoProps = {
      form,
      createHeader,
    };
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onCheckedChange,
    };
    // 行内编辑props
    const editTableProps = {
      rowSelection,
      bordered: true,
      loading: loadingTable,
      rowKey: 'clarifyIssueId',
      columns: this.renderColumns(),
      dataSource: clarifyNotifyQuestionList,
      pagination: notifyQuestionListPagenation,
      onChange: (page) => this.pageOnChange(page),
      onRow: (record) => {
        return {
          onClick: () => this.onRow(record),
        };
      },
    };
    return (
      <React.Fragment>
        <Header
          backPath={this.state.backPath}
          title={intl.get(`${promptCode}.view.message.title.expertAsk`).d('专家提问')}
        >
          <Button
            icon="check"
            type="default"
            loading={loadingSubmit}
            onClick={() => this.handleSubmit(clarifyNotifyQuestionList)}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        </Header>
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Collapse
            className="form-collapse"
            onChange={this.onCollapseChange}
            defaultActiveKey={['baseInfos', 'editTable']}
          >
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>
                    {intl.get(`${promptCode}.view.message.panel.QuesBasicInfo`).d('问题基本信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('baseInfos')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="baseInfos"
            >
              <Spin spinning={loadingHeader}>
                <InfoForm {...infoProps} />
              </Spin>
            </Panel>
            <Panel
              className={styles.listcontent}
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>{intl.get(`${promptCode}.view.message.panel.myQuestion`).d('我的问题')}</h3>
                  <a>
                    {collapseKeys.includes('editTable')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('editTable') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="editTable"
            >
              {this.renderButton()}
              <div style={{ zIndex: -1 }}>
                <EditTable {...editTableProps} />
              </div>
            </Panel>
          </Collapse>
        </Content>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return compose(
    Form.create({ fieldNameProp: null }),
    formatterCollections({ code: ['ssrc.expertScoring'] }),
    connect(({ expertScoring, loading, user }) => ({
      user,
      expertScoring,
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
      loadingSave: loading.effects['expertScoring/createClarifyNotifyQuestionList'],
      loadingDelete: loading.effects['expertScoring/deleteQuestionRows'],
      loadingTable: loading.effects['expertScoring/queryClarifyNotifyQuestionList'],
      loadingHeader: loading.effects['expertScoring/queryClarifyNotifyHeader'],
      loadingSubmit: loading.effects['expertScoring/submitClarifyNotifyQuestionList'],
    }))
  )(Comp);
};

export default HOCComponent(Update);
export { HOCComponent, Update };
