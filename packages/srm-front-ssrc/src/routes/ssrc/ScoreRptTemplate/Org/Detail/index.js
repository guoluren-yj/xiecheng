/**
 * 评分报告详情
 * @date: 2020-06-21
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import queryString from 'querystring';

import { Collapse, Icon, Spin, Form, Button, Modal, Upload } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { isNumber, isEmpty, isString, isUndefined } from 'lodash';
import intl from 'utils/intl';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import classnames from 'classnames';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getAccessToken, getEditTableData } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

import { PRIVATE_BUCKET } from '_utils/config';
// import EditorOnline from '@/routes/components/EditorOnline';
import BaseDetail from './BaseDetail';
import ContentInfo from './ContentInfo';

const { Panel } = Collapse;
const { Dragger } = Upload;

@formatterCollections({
  code: ['ssrc.scoreRptTemplate', 'ssrc.bidEventQuery', 'hzero.common'],
})
@Form.create({ fieldNameProp: null })
@connect(({ scoreRptTemplate, loading }) => ({
  scoreRptTemplate,
  saveLoading: loading.effects['scoreRptTemplate/saveDetail'],
  fetchLoading: loading.effects['scoreRptTemplate/fetchDetail'],
  fetchLineLoading: loading.effects['scoreRptTemplate/fetchTemplateLine'],
  deleteLineLoading: loading.effects['scoreRptTemplate/deleteTemplateLine'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'contentInfo', 'peportContent'], // 打开的折叠面板key
      uploadVisible: false,
      // fileList: [],
      currentLine: {}, // 存储当前行的文档
    };
  }

  form;

  editorOnlineRef;

  componentDidMount() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { templateId } = queryString.parse(search.substr(1));
    dispatch({
      type: 'scoreRptTemplate/fetchQueryBatchCode',
      payload: {
        lovCodes: {
          statusList: 'HPFM.ENABLED_FLAG',
          typeList: 'SSRC.SCORE_RPT_TEMPLATE_TYPE',
        },
      },
    });
    if (templateId) {
      this.fetchDetail(templateId);
      this.fetchTemplateLine(templateId);
    }
  }

  // 卸载阶段清空数据
  componentWillUnmount() {
    this.props.dispatch({
      type: 'scoreRptTemplate/updateState',
      payload: {
        baseDetail: {},
        contentTable: [],
      },
    });
  }

  // 查询页面表格信息
  @Bind()
  fetchTemplateLine(templateId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreRptTemplate/fetchTemplateLine',
      payload: {
        templateId,
      },
    });
  }

  /**
   * 查询详情页面行信息
   */
  @Bind()
  fetchDetail(templateId) {
    const { dispatch } = this.props;
    // const { fileList = [] } = this.state;
    dispatch({
      type: 'scoreRptTemplate/fetchDetail',
      payload: {
        templateId,
      },
    });
  }

  /**
   * 获取子组件参数
   * @param ref = {}
   */
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
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
   * 打开上传附件模态框
   */
  @Bind()
  showUploadModal(record) {
    this.setState({
      uploadVisible: true,
      currentLine: record,
    });
  }

  /**
   * 关闭上传附件模态框
   */
  @Bind()
  handleCancel() {
    this.setState({ uploadVisible: false });
  }

  /**
   * 确定-附件上传Modal
   */
  @Bind()
  handleUploadOk() {
    this.setState({ uploadVisible: false });
  }

  /**
   * 将上传列表放到state
   * @param {*} file - <>
   */
  @Bind()
  setFileList(file) {
    const { currentLine = {} } = this.state;
    const {
      dispatch,
      scoreRptTemplate: { contentTable = [] },
    } = this.props;
    this.setState(
      {
        currentLine: {
          ...(currentLine || {}),
          fileList: [...(currentLine?.fileList || []), file],
        },
      },
      () => {
        const newContentTable = contentTable?.map((item) => {
          if (item.scoreRptTemplateLineId === currentLine?.scoreRptTemplateLineId) {
            return {
              ...item,
              ...(this.state.currentLine || {}),
            };
          }
          return item;
        });
        dispatch({
          type: 'scoreRptTemplate/updateState',
          payload: {
            contentTable: newContentTable,
          },
        });
      }
    );
  }

  /**
   * 方法含义？
   * @param {*} file - <>
   */
  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: 'ssrc-scoreRptTemplate',
      fileName: file.name,
    };
  }

  /**
   * 上传change触发事件
   * @param {*} info - <>
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
   * @param {*} file - <>
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { currentLine = {} } = this.state;
    const {
      dispatch,
      scoreRptTemplate: { contentTable = [] },
    } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'scoreRptTemplate/onDraggerUploadRemove',
        payload: {
          bucketName: PRIVATE_BUCKET,
          directory: 'ssrc-scoreRptTemplate',
          urls: [file.response],
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
      this.setState(
        {
          currentLine: {
            ...currentLine,
            fileList: (currentLine.fileList || []).filter((o) => o.uid !== file.uid),
          },
        },
        () => {
          const newContentTable = contentTable.map((item) => {
            if (item.scoreRptTemplateLineId === currentLine?.scoreRptTemplateLineId) {
              return {
                ...item,
                ...this.state.currentLine,
              };
            }
            return item;
          });
          dispatch({
            type: 'scoreRptTemplate/updateState',
            payload: {
              contentTable: newContentTable,
            },
          });
        }
      );
    }
  }

  @Debounce(500)
  @Bind()
  saveScoreRptTemplate() {
    const {
      dispatch,
      location: { search },
      form,
      scoreRptTemplate: { baseDetail = {}, contentTable = [] },
    } = this.props;
    const { templateId } = queryString.parse(search.substr(1));
    // const { fileList } = this.state;
    // const templateFileUrl = !isEmpty(fileList) ? fileList[0].response : undefined;
    // if (isUndefined(templateFileUrl)) {
    //   notification.warning({
    //     message: intl
    //       .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.atLeast')
    //       .d('文档为必传项，请上传一个文档！'),
    //   });
    // } else {
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const newParams = getEditTableData(contentTable);
        // 区分校验不通过和无数据两种情况
        if (isEmpty(contentTable) || !isEmpty(newParams)) {
          dispatch({
            type: 'scoreRptTemplate/saveDetail',
            payload: {
              ...baseDetail,
              ...values,
              templateLines: newParams.map((item) => {
                return {
                  ...item,
                  scoreRptTemplateLineId:
                    item._status === 'create' ? undefined : item.scoreRptTemplateLineId,
                  templateFileUrl:
                    item.templateFileUrl || (item.fileList || [])?.[0]?.response || undefined,
                };
              }),
            },
          }).then((res) => {
            if (res) {
              if (templateId) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: `/ssrc/scoreRptTemplate-org/list`,
                    search,
                  })
                );
              } else {
                dispatch(
                  routerRedux.push({
                    pathname: `/ssrc/scoreRptTemplate-org/detail`,
                    search: queryString.stringify({ templateId: res.templateId }),
                  })
                );
              }
            }
          });
        }
      }
    });
    // }
  }

  // 删除评分表格行
  @Bind()
  deleteTemplateLine(line) {
    const {
      dispatch,
      location: { search },
      scoreRptTemplate: { contentTable = [] },
    } = this.props;
    const { templateId } = queryString.parse(search.substr(1));
    if (line._status === 'create') {
      const newContentTable = contentTable.filter(
        (item) => item.scoreRptTemplateLineId !== line?.scoreRptTemplateLineId
      );
      dispatch({
        type: 'scoreRptTemplate/updateState',
        payload: {
          contentTable: newContentTable,
        },
      });
    } else {
      dispatch({
        type: 'scoreRptTemplate/deleteTemplateLine',
        payload: {
          ...line,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchTemplateLine(templateId);
        }
      });
    }
  }

  // 查看文档内容
  @Bind()
  viewRow(record) {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { lang } = record;
    const { templateId, viewOnly } = queryString.parse(search.substr(1));
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/scoreRptTemplate-org/content/${templateId}`,
        search: queryString.stringify({ lang, viewOnly }),
      })
    );
  }

  render() {
    const {
      scoreRptTemplate: {
        baseDetail = {},
        contentTable = [],
        lovCode: { statusList = [], typeList = [] },
      },
      dispatch,
      location: { search },
      saveLoading,
      fetchLoading,
      fetchLineLoading,
      deleteLineLoading,
      form,
      organizationId,
    } = this.props;
    const { collapseKeys, uploadVisible = false, currentLine = {} } = this.state;
    const { templateId, viewOnly } = queryString.parse(search.substr(1));
    const isEdit = templateId;
    const detailFormProps = {
      form,
      statusList,
      typeList,
      baseDetail,
      showUploadModal: this.showUploadModal,
      onRef: this.handleRef,
      isEdit,
      viewOnly: viewOnly && isNumber(+viewOnly),
    };

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      accept: '.docx',
      data: this.uploadData,
      headers,
      disabled: currentLine?.fileList?.length > 0,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      // beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
      defaultFileList: currentLine?.fileList || [],
    };

    const contentProps = {
      dispatch,
      contentTable,
      fetchLineLoading,
      deleteLineLoading,
      viewRow: this.viewRow,
      viewOnly: viewOnly && isNumber(+viewOnly),
      showUploadModal: this.showUploadModal,
      deleteTemplateLine: this.deleteTemplateLine,
    };

    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/scoreRptTemplate-org/list"
          title={intl
            .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.templateDetail`)
            .d('模版详情')}
        >
          {(isUndefined(viewOnly) || !viewOnly) && (
            <Button
              icon="save"
              loading={saveLoading}
              onClick={() => this.saveScoreRptTemplate()}
              type="default"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content>
          <Spin
            spinning={isEdit ? fetchLoading : false}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                key="baseInfo"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.baseDetail`)
                        .d('基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <BaseDetail {...detailFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                key="contentInfo"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.contentInfo`)
                        .d('文档内容')}
                    </h3>
                    <a>
                      {collapseKeys.includes('contentInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('contentInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ContentInfo {...contentProps} />
              </Panel>
              {/* {isEdit && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.contentdeatil`)
                          .d('文档内容编辑')}
                      </h3>
                      <a>
                        {collapseKeys.includes('peportContent')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('peportContent') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="peportContent"
                >
                  <EditorOnline
                    iframeStyle={{
                      width: '100%',
                      height: `${(document.body.clientHeight - 96) * 0.9}px`,
                    }}
                    templateId={templateId}
                    onRef={(node) => {
                      this.editorOnlineRef = node;
                    }}
                  />
                </Panel>
              )} */}
            </Collapse>
          </Spin>
        </Content>
        <Modal
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          onOk={this.handleUploadOk}
          onCancel={this.handleCancel}
          destroyOnClose
          width={520}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.content`)
                .d('单击或拖动一个文件到此区域进行上传')}
            </p>
            {/* <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p> */}
          </Dragger>
        </Modal>
      </React.Fragment>
    );
  }
}
