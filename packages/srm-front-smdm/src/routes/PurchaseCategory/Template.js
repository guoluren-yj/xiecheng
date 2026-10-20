import React, { PureComponent } from 'react';
import { Button, Form, Input, Table, Row, Col, Select, Checkbox } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'components/Upload/UploadButton';

import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { getAccessToken, createPagination, getCurrentOrganizationId } from 'utils/utils';

import TemplateForm from './TemplateForm';

const FormItem = Form.Item;
const { Option } = Select;
@Form.create({ fieldNameProp: null })
@connect(({ loading, smdmPurchaseCategory }) => ({
  smdmPurchaseCategory,
  fetchTemplateLoading: loading.effects['smdmPurchaseCategory/fetchTemplate'],
  updateLoading: loading.effects['smdmPurchaseCategory/updateTemplate'],
  createLoading: loading.effects['smdmPurchaseCategory/createTemplate'],
}))
export default class Template extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      attachmentUuid: '',
      templateFormData: {},
    };
  }

  /**
   * componentDidMount - 组件初始化请求数据
   */
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({ type: 'smdmPurchaseCategory/initTemplate' });
    this.initTemplate(match.params.orgId, match.params.categoryId);
  }

  /**
   * initTemplate - 初始化报价模板数据，获取模板头数据后获取行数据、相关附件
   * @param {string} orgId - 组织ID
   * @param {string} categoryId - 品类ID
   */
  initTemplate(orgId, categoryId) {
    const { dispatch } = this.props;
    this.fetchTemplate({
      organizationId: orgId,
      categoryId,
    }).then((res) => {
      this.handleUuid(res);
      if (res && res.templateId) {
        if (res.attachmentUuid) {
          dispatch({
            type: 'smdmPurchaseCategory/queryFileList',
            payload: { attachmentUUID: res.attachmentUuid, bucketName: 'spfm-comp' },
          }).then((response) => {
            if (response && this.uploadButton) {
              this.uploadButton.setFileList(this.changeFileList(response));
            }
          });
        } else {
          this.uploadButton.setFileList([]);
        }
        this.fetchTemplateList({
          templateId: res.templateId,
          categoryId,
          organizationId: orgId,
        });
      }
    });
  }

  /**
   * fetchTemplate - 获取报价模板头数据
   * @param {object} params - 请求参数
   */
  fetchTemplate(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'smdmPurchaseCategory/fetchTemplate',
      payload: params,
    });
  }

  /**
   * fetchTemplateList - 获取报价模板行数据
   * @param {object} params - 请求参数
   */
  fetchTemplateList(params = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/fetchTemplateList',
      payload: {
        body: {
          page: 0,
          size: 10,
        },
        categoryId: match.params.categoryId,
        organizationId: match.params.orgId,
        ...params,
      },
    });
  }

  /**
   * changeFileList - 格式化已经上传的文件列表
   * @param {array} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   */
  @Bind()
  changeFileList(response) {
    return response.map((res, index) => {
      return {
        uid: index,
        name: res.fileName,
        status: 'done',
        url: this.getUrl(res.fileUrl),
      };
    });
  }

  /**
   * 根据fileUrl获取upload需要的url
   * @param {*} url
   * @param {*} [tenantId=getCurrentOrganizationId()]
   * @param {*} bucketDirectory
   * @returns neededUrl
   */
  @Bind()
  getUrl(url, tenantId = this.state.tenantId, bucketDirectory = 'spfm-comp') {
    const accessToken = getAccessToken();
    const bucketName = PRIVATE_BUCKET;
    return `${HZERO_FILE}/v1${!isUndefined(tenantId) ? `/${tenantId}/` : '/'
      }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${!isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
      }url=${url}`;
  }

  /**
   * handleModalVisible - 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/saveReducers',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * showModal - 显示modal
   */
  @Bind()
  showModal() {
    this.setState({
      templateFormData: {},
    });
    this.handleModalVisible(true);
  }

  /**
   * hideModal - 隐藏modal
   * @param {boolean}} flag 是否显示modal
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * handleUpdateTemplate - 编辑模板行数据
   * @param {object}} record - 模板行数据
   */
  @Bind()
  handleUpdateTemplate(record) {
    this.setState({
      templateFormData: record,
    });
    this.handleModalVisible(true);
  }

  /**
   * handleAdd 新增或编辑一条报价模板配置项
   * @param {object} fieldsValue - 操作的配置项
   * @param {string} optionName - 配置项名称
   * @param {string} quantity - 数量
   * @param {string} price - 数量
   * @param {string} remark - 备注
   * @param {string} enabledFlag - 是否启用配置项
   */
  @Bind()
  handleSaveItem(fieldsValue) {
    const { dispatch, smdmPurchaseCategory, match } = this.props;
    const { cateBidOptions } = smdmPurchaseCategory;
    const content = cateBidOptions.content || [];
    const { templateFormData } = this.state;
    if (templateFormData.optionId) {
      content.some((item, index, arr) => {
        if (item.optionId === templateFormData.optionId) {
          // eslint-disable-next-line
          arr[index] = {
            ...templateFormData,
            ...fieldsValue,
            enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
          };
          dispatch({
            type: 'smdmPurchaseCategory/saveReducers',
            payload: {
              cateBidOptions: {
                content: arr,
              },
            },
          });
          return true;
        }
        return false;
      });
    } else {
      dispatch({
        type: 'smdmPurchaseCategory/saveReducers',
        payload: {
          cateBidOptions: {
            content: [
              ...content,
              {
                ...fieldsValue,
                isCreate: true,
                tenantId: match.params.orgId,
                optionId: uuid(),
                enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
              },
            ],
          },
        },
      });
    }
    this.hideModal();
  }

  /**
   * handleUuid - 获取uuid
   * @param {object} data - 报价模板头数据
   *  @param {string} attachmentUuid - 文件上传下载所需的uuid
   */
  @Bind()
  handleUuid(data) {
    const { dispatch } = this.props;
    if (data.attachmentUuid) {
      this.setState({
        attachmentUuid: data.attachmentUuid,
      });
      return data.attachmentUuid;
    } else {
      dispatch({
        type: 'smdmPurchaseCategory/fetchUuid',
        payload: {},
      }).then((res) => {
        if (res) {
          this.setState({
            attachmentUuid: res.content,
          });
        }
      });
    }
  }

  /**
   * handleStandardTableChange - 报价模板行数据分页操作
   * @param {object} pagination - 分页数据
   */
  @Bind()
  handleStandardTableChange(pagination) {
    const {
      smdmPurchaseCategory: { templateData },
    } = this.props;
    const params = {
      body: {
        page: pagination.current - 1,
        size: pagination.pageSize,
      },
      templateId: templateData.templateId,
    };
    if (templateData.templateId) {
      this.fetchTemplateList(params);
    }
  }

  /**
   * handleCopyTemplate - 新建时，复制已有报价模板
   * @param {string} text - 复制的数据
   * @param {object} record - 复制的行数据
   */
  @Bind()
  handleCopyTemplate(text, record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/CopyTemplate',
      payload: {
        organizationId: record.cateBidTemplate.tenantId,
        categoryId: record.cateBidTemplate.categoryId,
        templateId: record.cateBidTemplate.templateId,
      },
    });
  }

  uploadButton;

  @Bind()
  uploadRef(upload) {
    this.uploadButton = upload;
  }

  /**
   * uploadData - 设置文件上传时的请求参数
   * @param {object} data - 模板头数据
   */
  @Bind()
  uploadData(data) {
    return { attachmentUUID: data.attachmentUuid || this.state.attachmentUuid };
  }

  /**
   * removeFile - 删除文件
   * @param {object} file - 删除的文件对象
   */
  @Bind()
  removeFile(file) {
    const {
      dispatch,
      smdmPurchaseCategory: { templateData = {} },
    } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/removeFile',
      payload: {
        bucketName: PRIVATE_BUCKET,
        directory: 'spfm-comp',
        attachmentUUID: this.state.attachmentUuid || templateData.attachmentUuid,
        urls: [file.url],
      },
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * handleSaveTemplate - 保存模板，包括行数据和头数据
   */
  @Bind()
  handleSaveTemplate() {
    const {
      form,
      dispatch,
      smdmPurchaseCategory: { templateData, cateBidOptions },
      match,
    } = this.props;
    const {
      state: { fileList },
    } = this.uploadButton;
    const content = cateBidOptions.content || [];
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        if (fieldsValue.mandatoryAttachmentFlag && isEmpty(fileList)) {
          return notification.warning({
            message: intl.get('smdm.purchaseCategory.view.message.warning.upload').d('请上传附件'),
          });
        }
        if (content.length === 0) {
          return notification.warning({
            message: intl
              .get('smdm.purchaseCategory.view.message.warning.writeConfig')
              .d('请填写配置项'),
          });
        }
        content.forEach((item) => {
          if (item.optionId && item.isCreate) {
            // eslint-disable-next-line
            delete item.optionId;
          }
        });
        dispatch({
          type: `smdmPurchaseCategory/${templateData.templateId ? 'updateTemplate' : 'createTemplate'
            }`,
          payload: {
            ...templateData,
            ...fieldsValue,
            attachmentUuid: this.state.attachmentUuid,
            mandatoryAttachmentFlag: fieldsValue.mandatoryAttachmentFlag ? 1 : 0,
            cateBidOptions: content,
            categoryId: match.params.categoryId,
            tenantId: match.params.orgId,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchTemplate({
              organizationId: match.params.orgId,
              categoryId: match.params.categoryId,
            }).then((response) => {
              if (response && response.templateId) {
                this.fetchTemplateList({
                  templateId: res.templateId,
                });
              }
            });
          }
        });
      }
    });
  }

  /**
   * renderForm - 渲染模板头数据
   */
  renderForm() {
    const {
      smdmPurchaseCategory: { requiredList, templateData },
      form,
    } = this.props;
    const {
      templateName,
      materialPrice,
      laborCost,
      manufacturingCost,
      mandatoryAttachmentFlag,
    } = templateData;
    const { getFieldDecorator } = form;
    const reqList = (
      <Select>
        {requiredList.map((item) => (
          <Option key={item.value} value={item.value}>
            {item.meaning}
          </Option>
        ))}
      </Select>
    );
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={4}>
            <FormItem
              label={intl.get('smdm.purchaseCategory.model.category.templateName').d('模板名称')}
            >
              {getFieldDecorator('templateName', {
                initialValue: templateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.purchaseCategory.model.category.templateName')
                        .d('模板名称'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem
              label={intl.get('smdm.purchaseCategory.model.category.materialPrice').d('材料总价')}
            >
              {getFieldDecorator('materialPrice', {
                initialValue: materialPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.purchaseCategory.model.category.materialPrice')
                        .d('材料总价'),
                    }),
                  },
                ],
              })(reqList)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4}>
            <FormItem
              label={intl.get('smdm.purchaseCategory.model.category.laborCost').d('直接人工费用')}
            >
              {getFieldDecorator('laborCost', {
                initialValue: laborCost,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.purchaseCategory.model.category.laborCost')
                        .d('直接人工费用'),
                    }),
                  },
                ],
              })(reqList)}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem
              label={intl
                .get('smdm.purchaseCategory.model.category.manufacturingCost')
                .d('制造费用')}
            >
              {getFieldDecorator('manufacturingCost', {
                initialValue: manufacturingCost,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.purchaseCategory.model.category.manufacturingCost')
                        .d('制造费用'),
                    }),
                  },
                ],
              })(reqList)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4}>
            <FormItem>
              {getFieldDecorator('mandatoryAttachmentFlag', {
                initialValue: mandatoryAttachmentFlag === 1,
              })(
                <Checkbox>
                  {intl.get('smdm.purchaseCategory.view.message.attachment.notNull').d('附件必输')}
                </Checkbox>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <Upload
                onRef={this.uploadRef}
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="spfm-comp"
                uploadData={() => this.uploadData(templateData)}
                action={`${HZERO_FILE}/v1/files/attachment/multipart`}
                onRemove={this.removeFile}
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      fetchTemplateLoading,
      updateLoading,
      createLoading,
      smdmPurchaseCategory: { templateData, cateBidOptions, modalVisible, requiredList },
    } = this.props;
    const { templateFormData } = this.state;
    const columns = [
      {
        title: intl.get('smdm.purchaseCategory.model.category.optionName').d('配置项'),
        dataIndex: 'optionName',
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.quantity').d('数量'),
        align: 'center',
        width: 120,
        dataIndex: 'quantity',
        render: (text) => {
          const desc = requiredList.find((item) => {
            return item.value === text;
          });
          return (desc && desc.meaning) || '';
        },
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.price').d('单价'),
        align: 'center',
        width: 120,
        dataIndex: 'price',
        render: (text) => {
          const desc = requiredList.find((item) => {
            return item.value === text;
          });
          return (desc && desc.meaning) || '';
        },
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        align: 'center',
        width: 120,
        dataIndex: 'remark',
        render: (text) => {
          const desc = requiredList.find((item) => {
            return item.value === text;
          });
          return (desc && desc.meaning) || '';
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        width: 120,
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 120,
        render: (text, record) => {
          return (
            <a onClick={() => this.handleUpdateTemplate(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('smdm.purchaseCategory.view.message.title.quotationTemplate')
            .d('报价模板')}
          backPath="/smdm/purchase/category"
        >
          {!templateData.templateId && (
            <React.Fragment>
              <span>
                {`${intl.get('smdm.purchaseCategory.view.message.copyTemplate').d('复制模板')}：`}
              </span>
              <Lov
                style={{ width: '150px' }}
                queryParams={{ organizationId: getCurrentOrganizationId() }}
                code="SMDM.CATEGORY.TEMPLATE"
                onChange={(text, record) => this.handleCopyTemplate(text, record)}
              />
            </React.Fragment>
          )}
          <Button
            type="primary"
            icon="save"
            style={{ marginLeft: '8px' }}
            loading={templateData.templateId ? updateLoading : createLoading}
            htmlType="submit"
            onClick={this.handleSaveTemplate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          {this.renderForm()}
          <div className="table-list-operator">
            <Button icon="plus" onClick={this.showModal}>
              {intl
                .get('smdm.purchaseCategory.view.message.modal.createConfiguration')
                .d('新增配置项')}
            </Button>
          </div>
          <Table
            bordered
            rowKey="optionId"
            loading={fetchTemplateLoading}
            dataSource={cateBidOptions.content || []}
            columns={columns}
            pagination={createPagination(cateBidOptions)}
            onChange={this.handleStandardTableChange}
          />
          <TemplateForm
            title={
              templateFormData.optionId
                ? intl
                  .get('smdm.purchaseCategory.view.message.modal.editConfiguration')
                  .d('编辑配置项')
                : intl
                  .get('smdm.purchaseCategory.view.message.modal.createConfiguration')
                  .d('新增配置项')
            }
            modalVisible={modalVisible}
            onCancel={this.hideModal}
            onOk={this.handleSaveItem}
            initData={templateFormData}
            requiredList={requiredList}
          />
        </Content>
      </React.Fragment>
    );
  }
}
