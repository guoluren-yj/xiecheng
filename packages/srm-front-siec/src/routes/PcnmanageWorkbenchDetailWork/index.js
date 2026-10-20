import React, { Component, Fragment } from 'react';
import { Button, DataSet, Spin } from 'choerodon-ui/pro';
import { notification, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { Header } from 'components/Page';
import intl from 'utils/intl';
import classnames from 'classnames';
// import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { headerBtnAffairHandle } from '@/services/pcnmanageWorkbenchService';
import cuxRemote from 'hzero-front/lib/utils/remote';
import PcnHeaderInfo from './components/PcnHeaderInfo/index';
import PcnChangeInfo from './components/PcnChangeInfo/index';
import AttachMentInfo from './components/AttachmentInfo/index';
import ApprovalInfo from './components/ApprovelInfo/index';
import { pcnHeaderInfoDS, pcnChangeInfoDS, attachmentInfoDS } from './components/DataSet';
import styles from './index.less';

const { Panel } = Collapse;
// const SRM_SIEC = '/siec';
// const organizationId = getCurrentOrganizationId();

@withCustomize({
  isTemplate: true,
})
@cuxRemote(
  {
    code: 'SIEC_PRDETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      cuxUpdate: undefined,
    },
    events: {
      approvalPromise(eventProps) {
        const { workFlowApproval } = eventProps || {};
        if (workFlowApproval) return workFlowApproval();
      },
    },
  }
)
@formatterCollections({
  code: ['siec.pcnmanageWorkbench', 'sinv.common', 'sinv.inventoryBench'],
})
export default class PcnmanageWorkbenchDetail extends Component {
  formDs;

  tableDs;

  constructor(props) {
    super(props);
    const {
      location: { search, pathname },
      match: { path = {} },
      remote,
    } = this.props;
    const { activeKey, statusConfigId = '', pcnHeaderId } = qs.parse(search.substr(1));
    const editableFlag = !pcnHeaderId;
    const { cuxUpdate = () => {} } = remote?.props?.process || {};
    this.formDs = new DataSet(pcnHeaderInfoDS(cuxUpdate));
    this.tableDs = new DataSet(pcnChangeInfoDS(cuxUpdate, this.formDs));
    this.attachmentInfoDs = new DataSet(attachmentInfoDS(this.formDs));
    const searchFlag = pathname.includes('/search'); // 查询页面标识
    const approveFlag = pathname.includes('/approve'); // 审批页面标识
    const sqeApproveFlag = pathname.includes('/sqe-approve'); // SQE审批页面标识
    const sourceFromPub = path.includes('pub');
    this.state = {
      tplInfo: {},
      statusConfigId,
      statusCode: '',
      // operationCode,
      editableFlag,
      // detail: {},
      activeKey,
      // pageOperationList: [], // 按钮组
      pcnHeaderId,
      pageFlags: { searchFlag, approveFlag, sqeApproveFlag, sourceFromPub },
    };
  }

  componentDidMount() {
    const { pcnHeaderId } = this.state;
    const {
      onLoad,
      queryTemplateConfig,
      workflowTemplateProps = {},
      onFormLoaded,
      remote,
    } = this.props;
    this.setState(
      {
        tplInfo: {
          cuszTplStageCode: 'WORKFLOW',
          cuszTplPageCode: 'PCN_WORKBENCH.DETAIL_WORKS',
          templateCode: workflowTemplateProps?.templateCode,
          templateVersion: workflowTemplateProps?.templateVersion,
        },
      },
      () => {
        const workflowParams = {
          stageCode: workflowTemplateProps?.stageCode,
          pageCode: workflowTemplateProps?.pageCode,
          templateCode: workflowTemplateProps?.templateCode,
          templateVersion: workflowTemplateProps?.templateVersion,
        };
        queryTemplateConfig(
          Promise.resolve({
            templateVersion: workflowTemplateProps?.templateVersion,
            templateCode: workflowTemplateProps?.templateCode,
          }),
          workflowParams
        ).then(() => {
          this.fetchHeader(pcnHeaderId);
          this.fetchLine();
          this.forceUpdate();
        });
      }
    );
    // 二开工作流提供保存接口
    if (onLoad) {
      onLoad({
        submit: (approveResult) => {
          if (remote?.event) {
            return remote.event.fireEvent('approvalPromise', {
              that: this,
              pcnHeaderId,
              approveResult,
              workFlowApproval: this.workFlowApproval,
            });
          } else {
            return this.workFlowApproval();
          }
        },
      });
      /**
       1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
      2.注册了submit回调函数的话，onFormLoaded必传
      3.onFormLoaded应在表单加载完成后调用
      4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
      */
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  workFlowApproval() {
    return new Promise(async (resolve, reject) => {
      let formDsFlag = true;
      let tableDsFlag = true;
      let attrDsFlag = true;
      const { statusConfigId, statusCode } = this.state;
      attrDsFlag = await this?.attachmentInfoDs?.validate();
      formDsFlag = await this?.formDs?.validate();
      tableDsFlag = await this?.tableDs?.validate();
      console.log('getValidationErrors', this?.formDs?.getValidationErrors());
      if (attrDsFlag && formDsFlag && tableDsFlag) {
        const newData = this.formDs?.current?.toJSONData();
        const attrData = this.attachmentInfoDs?.current?.toJSONData();
        const pcnLineList = this.tableDs?.toJSONData();
        const headerInfo = { ...this.formDs?.current?.toData(), ...newData, ...attrData };
        const response = await headerBtnAffairHandle(
          {
            ...headerInfo,
            statusConfigId,
            statusCode,
            enabledFlag: 1,
            pcnLineList,
            sellerFLag: 0,
          },
          1
        );
        if (response) {
          if (response.failed) {
            notification.error({ description: response.message });
            reject();
            return;
          }
          resolve();
        }
      } else {
        reject();
      }
    });
  }

  /**
   * renderButton - 渲染按钮
   */
  @Bind()
  renderButton(newPageOperationList) {
    if (newPageOperationList?.length > 0) {
      return newPageOperationList.map((v) => (
        <Button style={{ border: 'none' }} onClick={() => this.handleHeaderBtnAffairHandle(v)}>
          {v.operationDesc}
        </Button>
      ));
    }
  }

  @Bind()
  async handleHeaderBtnAffairHandle(item = {}) {
    const { statusConfigId, statusCode } = this.state;
    const { operationCode, operationDesc } = item;
    if (
      (await this?.attachmentInfoDs?.validate()) &&
      (await this?.formDs?.validate()) &&
      (await this?.tableDs?.validate()) &&
      this.formDs?.current
    ) {
      const newData = this.formDs?.current?.toJSONData();
      const attrData = this.attachmentInfoDs?.current?.toJSONData();
      const pcnLineList = this.tableDs?.toJSONData();
      const headerInfo = { ...this.formDs?.current?.toData(), ...newData, ...attrData };
      const response = await headerBtnAffairHandle([
        {
          ...headerInfo,
          statusConfigId,
          statusCode,
          operationCode,
          operationDesc,
          enabledFlag: 1,
          pcnLineList,
          sellerFLag: 0,
        },
      ]);
      if (response) {
        if (response.failed) {
          notification.error({ description: response.message });
          return;
        }
        const { pcnHeaderId = '' } = response[0];
        if (pcnHeaderId) {
          notification.success({
            message: intl.get(`siec.pcnmanageWorkbench.view.message.saveSuccess`).d('操作成功!'),
            placement: 'bottomRight',
          });
          this.fetchHeader(pcnHeaderId);
          this.tableDs.setQueryParameter('params', { pcnHeaderId });
          this.tableDs.query();
        }
      }
    } else {
      notification.warning({
        message: intl.get(`siec.pcnmanageWorkbench.view.message.warning`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
    }
  }

  @Bind()
  fetchHeader(pcnHeaderId) {
    const { statusConfigId, pageFlags, tplInfo } = this.state;
    this.formDs.setQueryParameter('params', { pcnHeaderId, statusConfigId });
    this.formDs.setQueryParameter('tplInfo', tplInfo);
    this.formDs.query().then((res) => {
      if (res) {
        const { statusList = {}, statusCode } = res;
        const { editableFlag = '' } = statusList || {};
        this.attachmentInfoDs.loadData([res]);
        this.setState({
          pcnHeaderId,
          editableFlag: editableFlag !== 0,
          statusCode,
          // detail: res,
          pageFlags: {
            ...pageFlags,
            searchFlag: statusList?.relationPageValue.includes('/search'),
            approveFlag: statusList?.relationPageValue.includes('/approve'),
            sqeApproveFlag: statusList?.relationPageValue.includes('/sqe-approve'),
          },
        });
      }
    });
  }

  @Bind()
  fetchLine() {
    const { pcnHeaderId, tplInfo } = this.state;
    this.tableDs.setQueryParameter('params', { pcnHeaderId });
    this.tableDs.setQueryParameter('tplInfo', tplInfo);
    this.tableDs.query();
  }

  /**
   * 设置字段必输
   */
  @Bind()
  setFieldRequired() {
    const { pageFlags } = this.state;
    const { approveFlag, sqeApproveFlag } = pageFlags;
    if (approveFlag) {
      this.formDs.current.getField('approveMessage').set('required', true);
    }
    if (sqeApproveFlag) {
      this.formDs.current.getField('recheckApproveMessage').set('required', true);
      this.formDs.current.getField('evaluationOpinion').set('required', true);
    }
  }

  @Bind()
  onBack() {
    const { activeKey } = this.state;
    this.props.history.replace({
      activeKey,
    });
  }

  render() {
    const {
      customizeForm,
      customizeTable,
      location,
      match: { path = {} },
      customizeBtnGroup,
    } = this.props;
    const {
      pcnHeaderId,
      editableFlag,
      // detail,
      // pageOperationList,
      pageFlags,
    } = this.state;
    const { approveFlag, sqeApproveFlag } = pageFlags;
    // const newPageOperationList = pcnHeaderId
    //   ? detail.statusList && detail.statusList.pageOperationList
    //   : pageOperationList;
    const btns = [];
    const HeaderButtons = () => {
      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SIEC.PCN_MANAGEWORK_BENCH_DETAI.WORKS.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={btns} />
          )}
          {/* <Fragment>{this.renderButton(newPageOperationList)}</Fragment> */}
        </>
      );
    };
    return (
      <Fragment>
        <Spin dataSet={this.formDs}>
          <Header
            title={intl
              .get('siec.pcnmanageWorkbench.view.title.pcnWorkbenchDetailWork')
              .d('变更申请')}
            // backPath="/siec/pcnmanage-workbench/list"
            // onBack={() => this.onBack()}
          >
            {<HeaderButtons />}
          </Header>
          <div style={{ overflowY: 'auto' }}>
            <div className={classnames(styles['siec-new-detail-content'])}>
              <Collapse
                trigger="text-icon"
                ghost
                expandIconPosition="text-right"
                defaultActiveKey={[
                  'PcnApprovelInfo',
                  'PcnHeaderInfo',
                  'PcnChangeInfo',
                  'PcnAttachmentInfo',
                ]}
              >
                <Panel
                  forceRender
                  key="PcnApprovelInfo"
                  className="form-collapse-siec"
                  header={intl
                    .get('siec.pcnmanageWorkbench.view.message.pcnApprovelBill')
                    .d('审批信息')}
                  hidden={path.includes('/pub') ? true : !(approveFlag || sqeApproveFlag)}
                >
                  <ApprovalInfo
                    approvalInfoDs={this.formDs}
                    pcnHeaderId={pcnHeaderId}
                    editableFlag={editableFlag}
                    pageFlags={pageFlags}
                    customizeForm={customizeForm}
                    location={location}
                  />
                </Panel>
                <Panel
                  forceRender
                  key="PcnHeaderInfo"
                  className="form-collapse-siec"
                  header={intl
                    .get('siec.pcnmanageWorkbench.view.message.pcnHeaderBill')
                    .d('单据头信息')}
                >
                  <PcnHeaderInfo
                    formDs={this.formDs}
                    pcnHeaderId={pcnHeaderId}
                    editableFlag={editableFlag}
                    pageFlags={pageFlags}
                    customizeForm={customizeForm}
                    location={location}
                    attachmentInfoDs={this.attachmentInfoDs}
                  />
                </Panel>
                <Panel
                  forceRender
                  key="PcnChangeInfo"
                  className="form-collapse-siec"
                  header={intl
                    .get('siec.pcnmanageWorkbench.view.message.pcnLineBill')
                    .d('单据行信息')}
                >
                  <PcnChangeInfo
                    pcnHeaderId={pcnHeaderId}
                    tableDs={this.tableDs}
                    editableFlag={editableFlag}
                    pageFlags={pageFlags}
                    customizeTable={customizeTable}
                  />
                </Panel>
                <Panel
                  forceRender
                  key="PcnAttachmentInfo"
                  className="form-collapse-siec"
                  header={intl
                    .get('siec.pcnmanageWorkbench.view.message.attachmentBill')
                    .d('附件信息')}
                >
                  <AttachMentInfo
                    attachmentInfoDs={this.attachmentInfoDs}
                    pcnHeaderId={pcnHeaderId}
                    editableFlag={editableFlag}
                    pageFlags={pageFlags}
                    customizeForm={customizeForm}
                    location={location}
                  />
                </Panel>
              </Collapse>
            </div>
          </div>
        </Spin>
      </Fragment>
    );
  }
}
