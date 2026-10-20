/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/10
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import {
  DataSet,
  Form,
  TextArea,
  Select,
  Spin,
  Table,
  Output,
  NumberField,
  Row,
  Col,
  Tabs,
  Button,
  Modal,
  Switch,
  TextField,
  CodeArea,
  Upload,
} from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
// TODO: choerodon-ui下的Slider的onChange事件没有触发，故引用hzero-ui的
import { Slider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import {
  getAccessToken,
  getRequestId,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { getMenuId } from 'hzero-front/lib/utils/menuTab';
import { API_HOST, HZERO_HITF } from 'hzero-front/lib/utils/config';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { downloadFile } from 'hzero-front/lib/services/api';
import { mockFormDS, paramTableDS, mockDataDS } from '@/stores/InterfaceMock/InterfaceMockDS';
import getLang from '@/langs/interfaceMockLang';
import {
  MOCK_TAB_KEYS,
  ACTION_TYPE_CONSTANT,
  PARAM_TYPE_CONSTANT,
  TEMPLATE_TYPE_CONSTANT,
  EXECUTIVE_STRATEGY_CONSTANT,
} from '@/constants/constants';
import ParamDrawer from './ParamDrawer';
import ImportDrawer from './ImportDrawer';
import InterfacePreviewer from './InterfacePreviewer';
import styles from './index.less';

const { TabPane } = Tabs;

export default class MockDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mockWeight: 1,
      responseMockTemplate: '',
      responseMockData: '',
      requestMockTemplate: '',
      requestMockData: '',
      collapseKeys: ['basicInfo', 'responseParam'],
      mockId: props.mockId,
      templateType: TEMPLATE_TYPE_CONSTANT.JSON,
    };

    this.mockFormDS = new DataSet(
      mockFormDS({
        mockStrategy: props.mockStrategy,
        onFieldUpdate: this.handleFieldUpdate,
      })
    );

    this.mockDataDS = new DataSet(mockDataDS());

    this.requestHeaderTableDS = new DataSet(paramTableDS());
    this.requestParamTableDS = new DataSet(paramTableDS());
    this.requestPathTableDS = new DataSet(paramTableDS());
    this.requestBodyTableDS = new DataSet(paramTableDS({ defaultExpand: true }));
    this.responseHeaderTableDS = new DataSet(paramTableDS());
    this.responseBodyTableDS = new DataSet(paramTableDS({ defaultExpand: true }));
  }

  componentDidMount() {
    const { mockGroupId, tenantId, firstRecordFlag, newMockCode } = this.props;
    const { mockId } = this.state;
    this.updateDrawerProps();
    if (!isUndefined(mockId)) {
      this.handleFetchDetail(mockId);
    } else {
      this.mockFormDS.create({
        mockGroupId,
        tenantId,
        mockCode: newMockCode,
        defaultExecuteFlag: firstRecordFlag ? 1 : 0,
      });
    }
  }

  /**
   * 根据mockParamList筛选出特定的列表
   * @param {*} type REQ/RESP
   * @param {*} tab 请求参数或者响应参数中的tab
   */
  @Bind()
  getParamsList(type, tab, paramsList = []) {
    return paramsList
      .filter((item) => item.actionType === type)
      .filter((item) => item.httpParamType === tab);
  }

  updateDrawerProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  /**
   * 查询
   */
  @Bind()
  async handleFetchDetail(mockId) {
    this.mockFormDS.setQueryParameter('mockId', mockId);
    await this.mockFormDS.query();
    const {
      templateType,
      mockWeight,
      mockTemplateReq = '',
      mockReqData = '',
      mockTemplateResp = '',
      mockRespData = '',
      mockParamList = [],
    } = this.mockFormDS.current.toData();
    this.requestHeaderTableDS.loadData(
      this.getParamsList(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.HEADER, mockParamList)
    );
    this.requestParamTableDS.loadData(
      this.getParamsList(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.GET, mockParamList)
    );
    this.requestPathTableDS.loadData(
      this.getParamsList(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.PATH, mockParamList)
    );
    this.requestBodyTableDS.loadData(
      this.getParamsList(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.BODY, mockParamList)
    );
    this.responseHeaderTableDS.loadData(
      this.getParamsList(ACTION_TYPE_CONSTANT.RESP, MOCK_TAB_KEYS.HEADER, mockParamList)
    );
    this.responseBodyTableDS.loadData(
      this.getParamsList(ACTION_TYPE_CONSTANT.RESP, MOCK_TAB_KEYS.BODY, mockParamList)
    );
    const uploadFileList = [];
    if (templateType === TEMPLATE_TYPE_CONSTANT.FILE) {
      uploadFileList.push({
        name: mockTemplateReq,
        type: '*',
        url: mockTemplateResp,
      });
    }
    this.setState({
      templateType,
      mockWeight,
      uploadFileList,
      requestMockTemplate: mockTemplateReq,
      requestMockData: mockReqData,
      responseMockTemplate: mockTemplateResp,
      responseMockData: mockRespData,
      mockId: this.mockFormDS.current.get('mockId'),
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const { mockWeight } = this.state;
    const validate = await this.mockFormDS.validate();
    if (mockWeight > 100 || !validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.mockFormDS.submit().then((res) => {
      if (res && res.success) {
        this.handleFetchDetail(res.content[0].mockId);
        this.props.onRefresh();
      }
      return false;
    });
  }

  @Bind()
  handleMockWeightChange(val) {
    this.setState({ mockWeight: val });
    this.mockFormDS.current.set('mockWeight', val);
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'templateType') {
      this.setState({ templateType: value });
    }
  }

  openParamDrawer(actionType, httpParamType, params = {}) {
    const { tenantId } = this.props;
    const { mockId } = this.state;
    const { mockParamId, parentCode, isNew } = params;
    const paramDrawerProps = {
      mockParamId,
      parentCode,
      tenantId,
      httpParamType,
      actionType,
      isNew,
      mockId,
      onRefresh: this.handleFetchDetail,
    };
    Modal.open({
      title: getLang('PARAM_INFO'),
      drawer: true,
      okText: getLang('SAVE'),
      children: <ParamDrawer {...paramDrawerProps} />,
    });
  }

  openImportModal(actionType, httpParamType, actionTypeName) {
    const { tenantId } = this.props;
    const { mockId } = this.state;
    const importModalProps = {
      mockId,
      tenantId,
      actionType,
      httpParamType,
      actionTypeName,
      onRefresh: this.handleFetchDetail,
    };
    Modal.open({
      title: getLang('IMPORT'),
      drawer: true,
      style: {
        width: 800,
      },
      okText: getLang('IMPORT'),
      children: <ImportDrawer {...importModalProps} />,
    });
  }

  @Bind()
  handleBatchDelete(dataSet) {
    const { mockId } = this.state;
    const deleteRecords = dataSet.records.filter((record) => record.get('check'));
    if (isEmpty(deleteRecords)) {
      notification.warning({
        message: getLang('EMPRY_DELETE'),
      });
      return false;
    }
    return dataSet.delete(deleteRecords).then((res) => {
      if (res && res.success) {
        this.handleFetchDetail(mockId);
      }
    });
  }

  getRequestButtons(type, tabKey, dataSet, typeName) {
    const { mockId } = this.state;
    const isNew = isUndefined(mockId);
    switch (tabKey) {
      case MOCK_TAB_KEYS.BODY:
      case MOCK_TAB_KEYS.HEADER:
      case MOCK_TAB_KEYS.GET:
      case MOCK_TAB_KEYS.PATH:
      default:
        return [
          <Button icon="delete" disabled={isNew} onClick={() => this.handleBatchDelete(dataSet)}>
            {getLang('DELETE')}
          </Button>,
          <Button
            icon="get_app"
            disabled={isNew}
            onClick={() => this.openImportModal(type, tabKey, typeName)}
          >
            {getLang('IMPORT')}
          </Button>,
          <Button
            icon="add"
            disabled={isNew}
            onClick={() => this.openParamDrawer(type, tabKey, { isNew: true })}
          >
            {getLang('CREATE')}
          </Button>,
        ];
    }
  }

  @Bind()
  async fetchMockData(type) {
    this.mockDataDS.setQueryParameter('mockData', this.mockFormDS.current.toData());
    await this.mockDataDS.query();
    const {
      mockTemplateReq,
      mockReqData,
      mockTemplateResp,
      mockRespData,
    } = this.mockDataDS.current.toData();
    if (type === 'request') {
      this.setState({ requestMockTemplate: mockTemplateReq, requestMockData: mockReqData });
    } else {
      this.setState({ responseMockTemplate: mockTemplateResp, responseMockData: mockRespData });
    }
  }

  async handleDeleteParam(dataSet, record) {
    const { mockId } = this.state;
    const res = await dataSet.delete(record);
    if (res && res.success) {
      this.handleFetchDetail(mockId);
    }
  }

  @Bind()
  handleCollapseChange(keys) {
    this.setState({ collapseKeys: keys });
  }

  jsonParse(json) {
    if (isEmpty(json)) {
      return null;
    }
    try {
      return JSON.parse(json);
    } catch (error) {
      return error;
    }
  }

  @Bind()
  handleDownLoadFile() {
    const { mockId } = this.state;
    return new Promise((resolve) => {
      downloadFile({
        requestUrl: isTenantRoleLevel()
          ? `${HZERO_HITF}/v1/${getCurrentOrganizationId()}/mocks/download/${mockId}`
          : `${HZERO_HITF}/v1/mocks/download/${mockId}`,
      }).then((res) => {
        if (res) {
          resolve(res);
        }
      });
    });
  }

  @Bind()
  handleFileUploadSuccess(response) {
    try {
      const { fileName, fileUrl } = JSON.parse(response);
      this.mockFormDS.current.set('mockTemplateReq', fileName);
      this.mockFormDS.current.set('mockTemplateResp', fileUrl);
      this.setState({
        uploadFileList: [
          {
            name: fileName,
            type: '*',
            url: fileUrl,
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Bind()
  handleRemoveFile() {
    this.mockFormDS.current.set('mockTemplateReq', null);
    this.mockFormDS.current.set('mockTemplateResp', null);
    this.setState({ uploadFileList: [] });
    return true;
  }

  @Bind()
  paramColumns(type, tabKey) {
    const { path } = this.props;
    const { OBJECT, ARRAY } = PARAM_TYPE_CONSTANT;
    return [
      {
        name: 'paramName',
        width: 150,
      },
      {
        name: 'paramType',
        width: 180,
      },
      {
        name: 'paramRule',
        width: 150,
      },
      {
        name: 'paramValue',
        width: 150,
      },
      {
        name: 'remark',
      },
      {
        name: 'check',
        width: 50,
        editor: true,
      },
      {
        header: getLang('OPERATOR'),
        width: MOCK_TAB_KEYS.BODY === tabKey ? 140 : 100,
        lock: 'right',
        align: 'center',
        renderer: ({ record, dataSet }) => {
          const { mockParamId, mockParamCode: parentCode } = record.toData();
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openParamDrawer(type, tabKey, { mockParamId, isNew: false })}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            MOCK_TAB_KEYS.BODY === tabKey &&
              [OBJECT, ARRAY].includes(record.get('paramType')) && {
                ele: (
                  <ButtonPermission
                    type="text"
                    onClick={() =>
                      this.openParamDrawer(type, tabKey, { mockParamId, parentCode, isNew: true })
                    }
                  >
                    {getLang('CREATE')}
                  </ButtonPermission>
                ),
                key: 'create',
                len: 2,
                title: getLang('CREATE'),
              },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.mock.delete`,
                      type: 'button',
                      meaning: '接口MOCK-删除',
                    },
                  ]}
                  onClick={() => this.handleDeleteParam(dataSet, record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record, { limit: 3 });
        },
      },
    ];
  }

  render() {
    const {
      mockId,
      templateType,
      collapseKeys,
      mockWeight,
      requestMockTemplate,
      requestMockData,
      responseMockTemplate,
      responseMockData,
      uploadFileList,
    } = this.state;

    const { mockStrategy } = this.props;

    const requestInterfacePreviewerProps = {
      label: getLang('REQUEST'),
      template: this.jsonParse(requestMockTemplate),
      data: this.jsonParse(requestMockData),
      onRefresh: () => this.fetchMockData('request'),
    };

    const responseInterfacePreviewerProps = {
      label: getLang('RESPONSE'),
      template: this.jsonParse(responseMockTemplate),
      data: this.jsonParse(responseMockData),
      onRefresh: () => this.fetchMockData('response'),
    };

    const uploadProps = {
      uploadFileList,
      headers: {
        Authorization: `bearer ${getAccessToken()}`,
        'H-Menu-Id': `${getMenuId()}`,
        'H-Request-Id': `${getRequestId()}`,
        'Access-Control-Allow-Origin': '*',
      },
      action: `${API_HOST}${HZERO_HITF}/v1/${
        isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
      }mocks/upload`,
      multiple: false,
      // accept: ['.json'],
      uploadImmediately: true,
      showUploadBtn: false,
      onUploadSuccess: this.handleFileUploadSuccess,
      onRemoveFile: this.handleRemoveFile,
    };

    const isNew = isUndefined(mockId);

    return (
      <Spin dataSet={this.mockFormDS}>
        <div className={styles['hitf-collapse']}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapseKeys}
            onChange={this.handleCollapseChange}
          >
            <Collapse.Panel
              key="basicInfo"
              showArrow={false}
              header={
                <>
                  <h3>{getLang('BASIC_INFO')}</h3>
                  <a>{collapseKeys.includes('basicInfo') ? getLang('UP') : getLang('EXPAND')}</a>
                  <Icon type={collapseKeys.includes('basicInfo') ? 'expand_less' : 'expand_more'} />
                </>
              }
            >
              <Form labelLayout="horizontal" dataSet={this.mockFormDS} columns={2}>
                <TextField name="mockName" />
                <Select name="httpStatusCode" />
                <Select name="templateType" disabled={!isNew} />
                {mockStrategy === EXECUTIVE_STRATEGY_CONSTANT.WEIGHT && (
                  <Output
                    newLine
                    name="mockWeight"
                    renderer={() => (
                      <Row>
                        <Col span={20}>
                          <Slider
                            value={mockWeight}
                            style={{ margin: '6px' }}
                            marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
                            onChange={this.handleMockWeightChange}
                          />
                        </Col>
                        <Col span={4}>
                          <NumberField
                            value={mockWeight}
                            min={0}
                            max={100}
                            step={1}
                            style={{ marginLeft: '6px' }}
                            onChange={this.handleMockWeightChange}
                          />
                        </Col>
                      </Row>
                    )}
                  />
                )}
                {mockStrategy === EXECUTIVE_STRATEGY_CONSTANT.SPECIFIED_INSTANCE && (
                  <Switch name="defaultExecuteFlag" />
                )}
                <TextArea newLine name="remark" colSpan={2} />
                {TEMPLATE_TYPE_CONSTANT.TXT === templateType && (
                  <CodeArea
                    newLine
                    name="mockTemplateResp"
                    colSpan={2}
                    style={{ height: '50vh' }}
                  />
                )}
                {TEMPLATE_TYPE_CONSTANT.FILE === templateType && (
                  <Output
                    name="file"
                    renderer={() => (
                      <>
                        <Upload name="file" {...uploadProps} />
                        {!isEmpty(uploadFileList) && (
                          <Button
                            icon="get_app"
                            funcType="flat"
                            onClick={this.handleDownLoadFile}
                          />
                        )}
                      </>
                    )}
                  />
                )}
              </Form>
            </Collapse.Panel>
            {TEMPLATE_TYPE_CONSTANT.JSON === templateType && (
              <Collapse.Panel
                key="requestParam"
                showArrow={false}
                header={
                  <>
                    <h3>{getLang('REQUEST_PARAM')}</h3>
                    <a>
                      {collapseKeys.includes('requestParam') ? getLang('UP') : getLang('EXPAND')}
                    </a>
                    <Icon
                      type={collapseKeys.includes('requestParam') ? 'expand_less' : 'expand_more'}
                    />
                  </>
                }
              >
                <Tabs>
                  <TabPane key={MOCK_TAB_KEYS.HEADER} tab={getLang('REQUEST_HEADER')}>
                    <Table
                      dataSet={this.requestHeaderTableDS}
                      columns={this.paramColumns(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.HEADER)}
                      buttons={this.getRequestButtons(
                        ACTION_TYPE_CONSTANT.REQ,
                        MOCK_TAB_KEYS.HEADER,
                        this.requestHeaderTableDS,
                        getLang('REQUEST_HEADER')
                      )}
                    />
                  </TabPane>
                  <TabPane key={MOCK_TAB_KEYS.GET} tab={getLang('GET_OR_URL_PARAM')}>
                    <Table
                      dataSet={this.requestParamTableDS}
                      columns={this.paramColumns(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.GET)}
                      buttons={this.getRequestButtons(
                        ACTION_TYPE_CONSTANT.REQ,
                        MOCK_TAB_KEYS.GET,
                        this.requestParamTableDS,
                        getLang('GET_OR_URL_PARAM')
                      )}
                    />
                  </TabPane>
                  {/* <TabPane key={MOCK_TAB_KEYS.PATH} tab={getLang('PATH_PARAM')}>
                  <Table
                    dataSet={this.requestPathTableDS}
                    columns={this.paramColumns(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.PATH)}
                    buttons={this.getRequestButtons(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.PATH, this.requestPathTableDS)}
                  />
                </TabPane> */}
                  <TabPane key={MOCK_TAB_KEYS.BODY} tab={getLang('BODY_PARAM')}>
                    <Table
                      mode="tree"
                      dataSet={this.requestBodyTableDS}
                      columns={this.paramColumns(ACTION_TYPE_CONSTANT.REQ, MOCK_TAB_KEYS.BODY)}
                      buttons={this.getRequestButtons(
                        ACTION_TYPE_CONSTANT.REQ,
                        MOCK_TAB_KEYS.BODY,
                        this.requestBodyTableDS,
                        getLang('BODY_PARAM')
                      )}
                    />
                  </TabPane>
                </Tabs>
                <InterfacePreviewer {...requestInterfacePreviewerProps} />
              </Collapse.Panel>
            )}
            {templateType === TEMPLATE_TYPE_CONSTANT.JSON && (
              <Collapse.Panel
                key="responseParam"
                showArrow={false}
                header={
                  <>
                    <h3>{getLang('RESPONSE_PARAM')}</h3>
                    <a>
                      {collapseKeys.includes('responseParam') ? getLang('UP') : getLang('EXPAND')}
                    </a>
                    <Icon
                      type={collapseKeys.includes('responseParam') ? 'expand_less' : 'expand_more'}
                    />
                  </>
                }
              >
                <Tabs defaultActiveKey={MOCK_TAB_KEYS.BODY}>
                  <TabPane key={MOCK_TAB_KEYS.HEADER} tab={getLang('RESPONSE_HEADER')}>
                    <Table
                      dataSet={this.responseHeaderTableDS}
                      columns={this.paramColumns(ACTION_TYPE_CONSTANT.RESP, MOCK_TAB_KEYS.HEADER)}
                      buttons={this.getRequestButtons(
                        ACTION_TYPE_CONSTANT.RESP,
                        MOCK_TAB_KEYS.HEADER,
                        this.responseHeaderTableDS,
                        getLang('RESPONSE_HEADER')
                      )}
                    />
                  </TabPane>
                  <TabPane key={MOCK_TAB_KEYS.BODY} tab={getLang('RESPONSE_BODY')}>
                    <Table
                      mode="tree"
                      dataSet={this.responseBodyTableDS}
                      columns={this.paramColumns(ACTION_TYPE_CONSTANT.RESP, MOCK_TAB_KEYS.BODY)}
                      buttons={this.getRequestButtons(
                        ACTION_TYPE_CONSTANT.RESP,
                        MOCK_TAB_KEYS.BODY,
                        this.responseBodyTableDS,
                        getLang('RESPONSE_BODY')
                      )}
                    />
                  </TabPane>
                </Tabs>
                <InterfacePreviewer {...responseInterfacePreviewerProps} />
              </Collapse.Panel>
            )}
          </Collapse>
        </div>
      </Spin>
    );
  }
}
