import React, { Component, Fragment } from 'react';
import { Button, DataSet, Spin } from 'choerodon-ui/pro';
import { notification, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { Header } from 'components/Page';
import intl from 'utils/intl';
import classnames from 'classnames';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import {
  headerBtnAffairHandle,
  initialCreateMethod,
  init,
} from '@/services/pcnmanageWorkbenchService';
import cuxRemote from 'hzero-front/lib/utils/remote';
import PcnHeaderInfo from './components/PcnHeaderInfo/index';
import PcnChangeInfo from './components/PcnChangeInfo/index';
import AttachMentInfo from './components/AttachmentInfo/index';
import ApprovalInfo from './components/ApprovelInfo/index';
import { pcnHeaderInfoDS, pcnChangeInfoDS, attachmentInfoDS } from './components/DataSet';
import styles from './index.less';

const { Panel } = Collapse;
const SRM_SIEC = '/siec';
const organizationId = getCurrentOrganizationId();

@withCustomize({
  unitCode: [
    'SIEC.PCN_MANAGEWORK_BENCH_DETAI.HEADER',
    'SIEC.PCN_MANAGEWORK_BENCH_DETAI.LINE',
    'SIEC.PCN_MANAGEWORK_BENCH_DETAI.ATTACHMENT',
    'SIEC.PCN_MANAGEWORK_BENCH_DETAI.BTNS',
  ],
})
@cuxRemote(
  {
    code: 'SIEC_PRDETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      cuxUpdate: undefined,
      renderBtn: undefined,
    },
    events: {
      approvalPromise: () => {},
      setFields(eventProps) {
        const { setFields } = eventProps || {};
        if (setFields) setFields();
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
    const { activeKey, pcnHeaderId = '', statusConfigId = '', operationCode = '' } = qs.parse(
      search.substr(1)
    );
    const editableFlag = !pcnHeaderId;
    const { cuxUpdate = () => {} } = remote?.props?.process || {};
    this.formDs = new DataSet(
      remote
        ? remote.process('SIEC_PRDETAIL_REMOTE_PROCESS_FORM_DS', pcnHeaderInfoDS(cuxUpdate), {
            that: this,
          })
        : pcnHeaderInfoDS(cuxUpdate)
    );
    this.tableDs = new DataSet(pcnChangeInfoDS(cuxUpdate, this.formDs));
    this.attachmentInfoDs = new DataSet(attachmentInfoDS(this.formDs));

    const searchFlag = pathname.includes('/search'); // 查询页面标识
    const approveFlag = pathname.includes('/approve'); // 审批页面标识
    const sqeApproveFlag = pathname.includes('/sqe-approve'); // SQE审批页面标识
    const sourceFromPub = path.includes('pub');
    this.state = {
      pcnHeaderId,
      statusConfigId,
      statusCode: '',
      operationCode,
      editableFlag,
      detail: {},
      activeKey,
      pageOperationList: [], // 按钮组
      pageFlags: { searchFlag, approveFlag, sqeApproveFlag, sourceFromPub },
    };
  }

  componentDidMount() {
    const { pcnHeaderId, statusConfigId, operationCode } = this.state;
    const { onLoad, onFormLoaded, remote } = this.props;
    if (onLoad) {
      onLoad({
        submit: (approveResult) => {
          if (remote?.event) {
            return remote.event.fireEvent('approvalPromise', {
              that: this,
              pcnHeaderId,
              approveResult,
            });
          }
        },
      });
    }
    if (operationCode === 'CREATE') {
      init({ compKey: 'p' }).then((res) => {
        if (getResponse(res)) {
          this.formDs.current.set('companyLOV', {
            companyId: res.companyId,
            companyCode: res.companyCode,
            companyName: res.companyName,
          });
          this.formDs.current.set('companyId', res.companyId);
          this.formDs.current.set('companyCode', res.companyCode);
          this.formDs.current.set('companyName', res.companyName);
          this.formDs.current.set('supplierCompanyLOV', {
            supplierCompanyCode: res.companyNum,
            supplierCompanyId: res.supplierCompanyId,
            supplierCompanyName: res.supplierCompanyName,
            supplierTenantId: res.supplierTenantId,
          });
          this.formDs.current.set('supplierCompanyCode', res.companyNum);
          this.formDs.current.set('supplierCompanyId', res.supplierCompanyId);
          this.formDs.current.set('supplierCompanyName', res.supplierCompanyName);
          this.formDs.current.set('supplierTenantId', res.supplierTenantId);
        }
      });
    }
    if (pcnHeaderId) {
      this.fetchHeader(pcnHeaderId);
      this.fetchLine();
      this.forceUpdate();
    } else {
      initialCreateMethod({ statusConfigId, operationCode }).then((res) => {
        if (res) {
          const { statusList, statusCode } = res;
          const { pageOperationList } = statusList || {};
          this.setState({ pageOperationList, statusCode });
        }
      });
    }
    if (onFormLoaded) onFormLoaded(true);
  }

  /**
   * renderButton - 渲染按钮
   */
  @Bind()
  renderButton(newPageOperationList) {
    const { remote } = this.props;
    const { renderBtn } = remote?.props?.process || {};
    if (newPageOperationList?.length > 0) {
      // 海柔埋点
      if (typeof renderBtn === 'function') {
        return renderBtn(newPageOperationList, this.handleHeaderBtnAffairHandle);
      }
      return newPageOperationList.map((v) => (
        <Button type="c7n-pro" funcType="flat" onClick={() => this.handleHeaderBtnAffairHandle(v)}>
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

  /**
   * 页面跳转
   * @param {Object} relationPageValue
   */
  @Bind()
  changePage(relationPageValue) {
    const { pcnHeaderId = '', statusConfigId = '', pageFlags } = this.state;
    if (pageFlags.sourceFromPub) {
      return;
    }
    if (relationPageValue) {
      this.props.history.push({
        pathname: relationPageValue,
        search: `pcnHeaderId=${pcnHeaderId}&statusConfigId=${statusConfigId}`,
      });
      if (relationPageValue.includes('/search')) {
        this.setState({
          pageFlags: { ...pageFlags, searchFlag: true, approveFlag: false, sqeApproveFlag: false },
        });
      } else if (relationPageValue.includes('/approve')) {
        this.setState({
          pageFlags: { ...pageFlags, searchFlag: false, approveFlag: true, sqeApproveFlag: false },
        });
      } else if (relationPageValue.includes('/sqe-approve')) {
        this.setState({
          pageFlags: { ...pageFlags, searchFlag: false, approveFlag: false, sqeApproveFlag: true },
        });
      } else {
        this.setState({
          pageFlags: {
            ...pageFlags,
            searchFlag: false,
            approveFlag: false,
            sqeApproveFlag: false,
          },
          operationCode: null,
        });
      }

      this.setFieldRequired();
    } else {
      notification.warning({
        message: intl
          .get(`siec.pcnmanageWorkbench.view.message.pcnWorkbench`)
          .d('该状态未配置跳转页面'),
        placement: 'bottomRight',
      });
    }
  }

  @Bind()
  fetchHeader(pcnHeaderId) {
    const { statusConfigId, pageFlags } = this.state;
    this.formDs.setQueryParameter('params', { pcnHeaderId, statusConfigId });
    this.formDs.query().then((res) => {
      if (res) {
        const { statusList = {}, statusCode } = res;
        const { editableFlag = '', relationPageValue = '' } = statusList || {};
        this.attachmentInfoDs.loadData([res]);
        this.setState({
          pcnHeaderId,
          editableFlag: editableFlag !== 0,
          statusCode,
          detail: res,
          pageFlags: {
            ...pageFlags,
            searchFlag:
              location.pathname.includes('/search') ||
              statusList?.relationPageValue.includes('/search'),
            approveFlag:
              location.pathname.includes('/approve') ||
              statusList?.relationPageValue.includes('/approve'),
            sqeApproveFlag: location.pathname.includes('/sqe-approve'),
            // statusList?.relationPageValue.includes('/sqe-approve'),
          },
        });
        if (!pageFlags?.sourceFromPub) {
          this.changePage(relationPageValue);
        }
        this.setFieldRequired();
      }
    });
  }

  @Bind()
  fetchLine() {
    const { pcnHeaderId } = this.state;
    this.tableDs.setQueryParameter('params', { pcnHeaderId });
    this.tableDs.query();
  }

  /**
   * 设置字段必输
   */
  @Bind()
  setFieldRequired() {
    const { remote } = this.props;
    const setFields = () => {
      const { pageFlags } = this.state;
      const { approveFlag, sqeApproveFlag } = pageFlags;
      if (approveFlag) {
        this.formDs.current.getField('approveMessage').set('required', true);
      }
      if (sqeApproveFlag) {
        this.formDs.current.getField('recheckApproveMessage').set('required', true);
        this.formDs.current.getField('evaluationOpinion').set('required', true);
      }
    };
    if (remote?.event) {
      remote.event.fireEvent('setFields', { setFields, that: this });
    } else {
      setFields();
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
      remote,
      customizeForm,
      customizeTable,
      location,
      match: { path = {} },
      customizeBtnGroup,
    } = this.props;
    const {
      pcnHeaderId,
      editableFlag,
      detail,
      pageOperationList,
      pageFlags,
      operationCode,
    } = this.state;
    const { approveFlag, sqeApproveFlag } = pageFlags;
    const newPageOperationList = pcnHeaderId
      ? detail.statusList && detail.statusList.pageOperationList
      : pageOperationList;
    const btns = [
      {
        name: 'print',
        child: (name) =>
          name || intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonProps: {
            disabled: operationCode === 'CREATE',
            funcType: 'flat',
          },
          requestUrl: `${SRM_SIEC}/v1/${organizationId}/pcn-headers/batch-print-token`,
          method: 'POST',
          data: this.formDs.map((item) => item.toData()) || [],
          // buttonText: intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
        },
      },
    ];
    const HeaderButtons = () => {
      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SIEC.PCN_MANAGEWORK_BENCH_DETAI.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={btns} />
          )}
          <Fragment>{this.renderButton(newPageOperationList)}</Fragment>
        </>
      );
    };
    return (
      <Fragment>
        <Spin dataSet={this.formDs}>
          <Header
            title={
              // operationCode === 'CREATE'
              !this.formDs?.current?.get('pcnHeaderId')
                ? intl
                    .get('siec.pcnmanageWorkbench.view.title.createPcnWorkbenchDetail')
                    .d('新建PCN变更申请')
                : intl
                    .get('siec.pcnmanageWorkbench.view.title.pcnWorkbenchDetail')
                    .d('编辑PCN变更申请')
            }
            backPath="/siec/pcnmanage-workbench/list"
            onBack={() => this.onBack()}
          >
            {!path?.includes('/pub') && <HeaderButtons />}
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
                  hidden={
                    remote
                      ? remote.process(
                          'SIEC_PRDETAIL_REMOTE_PROCESS_PANEL_HIDDEN',
                          path.includes('/pub') ? true : !(approveFlag || sqeApproveFlag),
                          { that: this }
                        )
                      : path.includes('/pub')
                      ? true
                      : !(approveFlag || sqeApproveFlag)
                  }
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
                {pcnHeaderId && (
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
                )}
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
