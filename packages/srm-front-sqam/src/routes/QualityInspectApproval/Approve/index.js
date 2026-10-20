import React, { PureComponent, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import classnames from 'classnames';
import { Tabs, Collapse, Spin, Icon } from 'choerodon-ui';
import { DataSet, Form, Tooltip, Output, Table, Button } from 'choerodon-ui/pro';
import UploadModal from '_components/Upload';
import uuid from 'uuid/v4';
import remotes from 'hzero-front/lib/utils/remote';
import { dateRender } from 'utils/renderer';
import { queryIdpValue, queryFileListOrg } from 'services/api';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Style from './index.less';
import { 
  headerDS as headerDs,
  tableDS as tableDs,
  defectTableDS as defectTableDs,
} from '@/stores/IncomingInspectionMaintain';
import { thousandBitSeparator } from '@/routes/utils.js';
import ApproveOperation from '@/routes/components/ApproveOperation';

const promptCode = 'sqam.incomingInspectionQuery';
const { Panel } = Collapse;
const { TabPane } = Tabs;

@remotes({
  code: 'SQAM_QUALITY_INSPECT_APPROVAL',
  name: 'remote',
},{
  cuxBeforeApproval() {}, // 二开审批通过/拒绝前逻辑
})
@withCustomize({
  unitCode: [
    'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.BASIC',
    'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DATA',
    'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.ANALYSIS',
    'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DETECT',
    'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DEFECT',
  ],
})
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.incomingInspectionQuery',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'entity.supplier',
    'himp.commentImport',
  ],
})
export default class Approve extends PureComponent {
  headerDS = new DataSet(headerDs());

  tableDS = new DataSet(tableDs());

  defectTableDS = new DataSet(defectTableDs());

  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseinfo', 'detectionAnalysis', 'inspectionData'],
      checkAttachmentUuid: '',
      loading: true,
      showTables: false,
      fileNum: 0,
      inspectionId: '',
      purchaseAttachmentUuid: '',
      operatorRecordVisible: false, // 操作记录模态框是否可见
    };
  }

  async componentDidMount() {
    const { match, remote, onLoad } = this.props;
    const { params = {} } = match;
    const { id, inspectionId: inspectId } = params;
    this.headerDS.setQueryParameter('id', id || inspectId);
    this.tableDS.setQueryParameter('id', id || inspectId);
    this.defectTableDS.setQueryParameter('id', id || inspectId);
    this.setState({ loading: true });

    const lovTagsValue = await this.lovTagValues();
    const res = await this.headerDS.query();
    this.tableDS.query();
    this.defectTableDS.query();
    const { checkAttachmentUuid, dataSource, inspectionId, purchaseAttachmentUuid } = res;
    const showTables = dataSource
      ? dataSource === 'SAP' || lovTagsValue[dataSource] === 'showdetails'
      : false;
    this.fetchFileNum();
    this.setState({
      checkAttachmentUuid,
      loading: false,
      showTables,
      inspectionId,
      purchaseAttachmentUuid,
    });

    remote.event.fireEvent('cuxBeforeApproval', {
      onLoad,
      headerDS: this.headerDS,
      tableDS: this.tableDS,
      defectTableDS: this.defectTableDS,
    });
  }

  @Bind()
  handleModal(visible, flag) {
    this.setState({ [visible]: flag });
  }

  @Bind()
  fetchFileNum() {
    const { purchaseAttachmentUuid } = this.headerDS.current?.toData();
    queryFileListOrg({
      attachmentUUID: purchaseAttachmentUuid || uuid(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    }).then((res) => {
      if (res) {
        this.setState({
          fileNum: res.length,
        });
      }
    });
  }

  @Bind()
  getUuidParams(value) {
    return {
      viewOnly: true,
      btnText: intl.get(`hzero.common.upload.view`).d('查看附件'),
      showFilesNumber: true,
      attachmentUUID: value || uuid(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };
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
  async lovTagValues() {
    const res = await queryIdpValue('SQAM.INSPECTION_SOURCE');
    const lovObj = {};
    if (res) {
      res.forEach((elem) => {
        const { value, tag } = elem;
        lovObj[value] = tag;
      });
    }
    return lovObj;
  }

  render() {
    const {
      collapseKeys,
      checkAttachmentUuid,
      loading,
      showTables,
      fileNum,
      inspectionId,
      purchaseAttachmentUuid,
      operatorRecordVisible,
    } = this.state;

    const detectColumns = [
      {
        name: 'detectWeighting',
        width: 80,
      },
      {
        name: 'defectCategory',
        width: 120,
      },
      {
        name: 'defectExplain',
        width: 150,
      },
      {
        name: 'defectResult',
        width: 120,
      },
      {
        name: 'defectFeatures',
        width: 260,
      },
      {
        name: 'inconformityQuantity',
        width: 120,
      },
      {
        name: 'defectAssessment',
        width: 180,
      },
      {
        name: 'defectEndDate',
        width: 180,
        renderer: ({ value }) => (value ? dateRender(value) : '-'),
      },
      {
        name: 'detectRemark',
      },
    ];
    const defectColumns = [
      {
        name: 'defectProject',
        width: 80,
      },
      {
        name: 'codeGroup',
        width: 120,
      },
      {
        name: 'defectCategory',
        width: 150,
      },
      {
        name: 'defectQuantity',
        width: 120,
      },
      {
        name: 'inspectionFeatures',
        width: 260,
      },
      {
        name: 'problemCode',
        width: 150,
      },
      {
        name: 'sequenceNum',
        width: 120,
      },
      {
        name: 'defectFeatures',
      },
    ];

    const uploadModalProps = {
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${fileNum})`,
      btnProps: {
        icon: 'paper-clip',
        disabled: !inspectionId,
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };
    const { customizeForm, customizeTable } = this.props;
    const operatorRecordProps = {
      inspectionId,
      visible: operatorRecordVisible,
      hideModal: () => this.handleModal('operatorRecordVisible', false),
    };
    return (
      <Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.approveForm`).d('审批表单')}>
          <Button
            icon="watch_later-o"
            funcType="raised"
            color="primary"
            onClick={() => this.setState({ operatorRecordVisible: true })}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <UploadModal {...uploadModalProps} />
        </Header>
        <Content wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}>
          <Spin spinning={loading}>
            <Collapse
              forceRender
              className={['form-collapse', Style['collapse-style']]}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
              bordered={false}
            >
              <Panel
                style={{ border: 0 }}
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.title.baseinfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseinfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon
                      type={collapseKeys.includes('baseinfo') ? 'expand_less' : 'expand_more'}
                    />
                  </Fragment>
                }
                key="baseinfo"
              >
                {customizeForm(
                  {
                    code: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.BASIC',
                  },
                  <Form
                    dataSet={this.headerDS}
                    columns={3}
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                  >
                    <Output name="inspectionNum" />
                    <Output name="creationDate" />
                    <Output name="createdName" />
                    <Output name="inspectionStateMeaning" />
                    <Output name="dataSourceMeaning" />
                    <Output name="inspectionTypeMeaning" />
                    <Output name="companyName" />
                    <Output name="organizationName" />
                    <Output name="supplierName" />
                    <Output
                      name="poNum"
                      renderer={({ value }) => (
                        <Tooltip title={value}>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {value}
                          </div>
                        </Tooltip>
                      )}
                    />
                    <Output
                      name="asnNum"
                      renderer={({ value }) => (
                        <Tooltip title={value}>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {value}
                          </div>
                        </Tooltip>
                      )}
                    />
                    <Output
                      name="transactionNum"
                      renderer={({ value }) => (
                        <Tooltip title={value}>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {value}
                          </div>
                        </Tooltip>
                      )}
                    />
                    <Output name="problemNum" />
                    <Output name="inspectionRemark" />
                    <Output name="purOrganizationName" />
                  </Form>
                )}
              </Panel>
              <Panel
                style={{ border: 0 }}
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.title.inspectionData`).d('检验数据')}
                    </h3>
                    <a>
                      {collapseKeys.includes('detectionAnalysis')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.includes('detectionAnalysis') ? 'expand_less' : 'expand_more'
                      }
                    />
                  </Fragment>
                }
                key="detectionAnalysis"
              >
                {customizeForm(
                  {
                    code: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DATA',
                  },
                  <Form
                    dataSet={this.headerDS}
                    columns={3}
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                  >
                    <Output name="startDate" />
                    <Output name="endDate" />
                    <Output name="responsiblePerson" />
                    <Output name="itemCode" />
                    <Output name="itemName" />
                    <Output name="categoryName" />
                    <Output
                      name="batchQuantity"
                      renderer={({ value }) => thousandBitSeparator(value)}
                    />
                    <Output name="actualQuantity" />
                    <Output name="sampleSize" />
                    <Output name="uomCodeAndName" />
                    <Output
                      name="destroyQuantity"
                      renderer={({ value }) => thousandBitSeparator(value)}
                    />
                    <Output
                      name="badQuantity"
                      renderer={({ value }) => thousandBitSeparator(value)}
                    />
                    <Output
                      name="checkAttachmentUuid"
                      renderer={() => <UploadModal {...this.getUuidParams(checkAttachmentUuid)} />}
                    />
                  </Form>
                )}
              </Panel>
              <Panel
                showArrow={false}
                forceRender
                style={{ border: 0 }}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.title.detectionAnalysis`).d('检测分析')}
                    </h3>
                    <a>
                      {collapseKeys.includes('inspectionData')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon
                      type={collapseKeys.includes('inspectionData') ? 'expand_less' : 'expand_more'}
                    />
                  </Fragment>
                }
                key="inspectionData"
              >
                {customizeForm(
                  {
                    code: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.ANALYSIS',
                  },
                  <Form
                    dataSet={this.headerDS}
                    columns={3}
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                  >
                    <Output name="assessmentResultMeaning" />
                    <Output name="decisionResultMeaning" />
                    <Output name="qualityScore" />
                    <Output name="badCategoryMeaning" />
                    <Output name="badReason" />
                  </Form>
                )}
              </Panel>
            </Collapse>
          </Spin>
          {showTables && (
            <Tabs animated={false}>
              <TabPane
                tab={intl
                  .get(`${promptCode}.view.message.title.detectionDetailedItems`)
                  .d('检测细项')}
                key="1"
              >
                {customizeTable(
                  { code: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DETECT' },
                  <Table
                    selectionMode="none"
                    dataSet={this.tableDS}
                    columns={detectColumns}
                    pagination={false}
                  />
                )}
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.DefectsItems`).d('缺陷细项')}
                key="2"
              >
                {customizeTable(
                  { code: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DEFECT' },
                  <Table
                    selectionMode="none"
                    dataSet={this.defectTableDS}
                    columns={defectColumns}
                    pagination={false}
                  />
                )}
              </TabPane>
            </Tabs>
          )}
        </Content>
        {operatorRecordVisible && <ApproveOperation {...operatorRecordProps} />}
      </Fragment>
    );
  }
}
