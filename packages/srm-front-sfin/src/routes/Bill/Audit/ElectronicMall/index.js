import React, { Component, Fragment } from 'react';
import { Table, DataSet, Button, Tabs, Select, Form, Output } from 'choerodon-ui/pro';
import { Collapse, Icon, Tag } from 'choerodon-ui';
import { Bind, Throttle } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';
import {
  submit,
  save,
  feedbackEcommerce,
  cancel,
  confirm,
  approve,
  synchronousEcommerce,
} from '@/services/billService';
import ActionHistory from '../../Components/ActionHistory';

import styles from './index.less';
import HeaderInfo from './HeaderInfo';
import { automatic, notAutomatic, filterFormDs } from './fieldsInitalValue';

const { Panel } = Collapse;

@formatterCollections({
  code: [
    'sfin.common',
    'entity.supplier',
    'entity.supplier',
    'entity.company',
    'sfin.commom',
    'sfin.view',
  ],
})
export default class Update extends Component {
  constructor(props) {
    super(props);
    const { billHeaderId } = props.match.params;
    this.state = {
      collapsed: true,
      activeKey: 'automatic',
      billHeaderId,
      operateRecordVisible: false,
      loading: false,
    };
  }

  automaticLine = new DataSet(automatic());

  notAutomaticLine = new DataSet(notAutomatic());

  formDs = new DataSet(filterFormDs());

  componentDidMount() {
    const { billHeaderId } = this.state;
    this.automaticLine.setQueryParameter('billHeaderId', billHeaderId);
    this.notAutomaticLine.setQueryParameter('billHeaderId', billHeaderId);
    this.formDs.setQueryParameter('billHeaderId', billHeaderId);
  }

  @Bind()
  handleCollapse() {
    this.setState((state) => ({
      collapsed: !state.collapsed,
    }));
  }

  @Bind()
  handleTabsChange(key) {
    this.setState({ activeKey: key === 'automatic' ? 'automatic' : 'notAutomatic' });
  }

  @Bind()
  handleBackList() {
    const { history } = this.props;
    history.push('/sfin/bill-audit/list');
  }

  @Bind()
  @Throttle(1000)
  async submitData(buttonType) {
    try {
      const validFlag = await this.formDs.validate();
      this.setState({ loading: true });
      // 行ds 也要 校验一下
      const automaticLineValidFlag = await this.automaticLine.validate();
      const notAutomaticLineValidFlag = await this.notAutomaticLine.validate();
      const validAutomaticLine = this.automaticLine.validate();
      const validNotAutomaticLine = this.notAutomaticLine.validate();
      const { billHeaderId } = this.state;
      if (
        automaticLineValidFlag & notAutomaticLineValidFlag & validFlag &&
        validAutomaticLine &&
        validNotAutomaticLine
      ) {
        const formData = this.formDs.toData();
        const autoList = this.automaticLine.toData();
        const notAutoList = this.notAutomaticLine.toData();
        const submitData = {
          billHeaderDTO: formData[0],
          billLineEcList: autoList,
          noBillLineEcList: notAutoList,
        };
        switch (buttonType) {
          case 'save':
            save(submitData).then((res) => {
              if (getResponse(res)) {
                notification.success();
                this.formDs.query();
                this.automaticLine.query();
                this.notAutomaticLine.query();
              }
              this.setState({ loading: false });
            });
            break;
          case 'submitApprove':
            submit(submitData).then((res) => {
              if (getResponse(res)) {
                notification.success();
                this.formDs.query();
                this.automaticLine.query();
                this.notAutomaticLine.query();
                this.handleBackList();
              }
              this.setState({ loading: false });
            });
            break;
          case 'feedbackEcommerce':
            feedbackEcommerce(submitData).then((res) => {
              if (getResponse(res)) {
                notification.success();
                this.formDs.query();
                this.automaticLine.query();
                this.notAutomaticLine.query();
                this.handleBackList();
              }
              this.setState({ loading: false });
            });
            break;
          case 'cancel':
            cancel(billHeaderId).then((res) => {
              if (getResponse(res)) {
                notification.success();
                this.formDs.query();
                this.automaticLine.query();
                this.notAutomaticLine.query();
                this.handleBackList();
              }
              this.setState({ loading: false });
            });
            break;
          case 'confirm':
            confirm(submitData).then((res) => {
              if (getResponse(res)) {
                notification.success();
                this.formDs.query();
                this.automaticLine.query();
                this.notAutomaticLine.query();
                this.handleBackList();
              }
              this.setState({ loading: false });
            });
            break;
          case 'approve':
            approve(billHeaderId).then((res) => {
              if (getResponse(res)) {
                notification.success();
                this.formDs.query();
                this.automaticLine.query();
                this.notAutomaticLine.query();
                this.handleBackList();
              }
              this.setState({ loading: false });
            });
            break;
          default:
            this.setState({ loading: false });
            break;
        }
      } else {
        notification.error({
          message: intl.get('hzero.common.notification.invalid').d('校验不通过'),
        });
      }
    } catch (err) {
      notification.error({
        message: `${intl.get('hzero.common.notification.error').d('操作失败')}:${err.message}`,
      });
      this.setState({ loading: false });
    }
  }

  @Bind()
  operateRecord() {
    const { operateRecordVisible } = this.state;
    this.setState({ operateRecordVisible: !operateRecordVisible }, () => {
      this.historyModal.handleSearch();
    });
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  batchApprove(tableDs) {
    if (tableDs) {
      const selectedIds = tableDs.selected
        .map((item) => item.toData())
        .map((item) => item.ecLineId);
      const { confirmStatus } = this.formDs.toData() && this.formDs.toData()[0];
      const newList = tableDs.toData().map((item) => {
        if (selectedIds.indexOf(item.ecLineId) !== -1) {
          return { ...item, confirmStatus };
        } else {
          return item;
        }
      });
      tableDs.loadData(newList);
    }
  }

  @Bind()
  @Throttle(1000)
  synchronousEcommerce() {
    const { billHeaderId } = this.state;
    this.setState({ loading: true });
    synchronousEcommerce(billHeaderId).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.setState({ loading: false });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  render() {
    const { dispatch } = this.props;
    const {
      uuid,
      ouNameDisable,
      invOrganizatainDisabled,
      purchaseOrgDisable,
      activeKey,
      operateRecordVisible,
      loading = false,
    } = this.state;
    const columns = [
      {
        name: 'ecLineNum',
        width: 80,
      },
      {
        name: 'confirmStatus',
        width: 150,
        editor: () => <Select name="confirmStatus" />,
      },
      {
        name: 'lineRemark',
        width: 150,
        editor: true,
      },
      {
        name: 'matchResultMeaning',
        width: 150,
        renderer: ({ record, value }) => {
          const { matchResult } = record.toData();
          if (matchResult === 'NORMAL') {
            return <Tag color="green">{value}</Tag>;
          } else {
            return <Tag color="red">{value}</Tag>;
          }
        },
      },
      {
        name: 'ecPoNum',
        width: 150,
      },
      {
        name: 'ecPoSubNum',
        width: 150,
      },
      {
        name: 'poNumLineNum',
        width: 150,
      },
      {
        name: 'ecProductNum',
        width: 150,
      },
      {
        name: 'ecProductName',
        width: 150,
      },
      {
        name: 'ecProductQuantity',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'nakedPrice',
        width: 150,
      },
      {
        name: 'taxRate',
        width: 150,
      },
      {
        name: 'taxPrice',
        width: 150,
      },
      {
        name: 'taxLineAmount',
        width: 150,
        renderer: ({ record, value }) => {
          const { matchResult } = record.toData();
          if (matchResult === 'AMOUNT_DISCREPANCY') {
            return <div style={{ color: 'red' }}>{value}</div>;
          } else {
            return <div>{value}</div>;
          }
        },
      },
      {
        name: 'autoNakedPrice',
        width: 150,
      },
      {
        name: 'autoTaxRate',
        width: 150,
      },
      {
        name: 'autoActualPrice',
        width: 150,
      },
      {
        name: 'autoTaxLineAmount',
        width: 150,
      },
      {
        name: 'poQuantity',
        width: 150,
        renderer: ({ record, value }) => {
          const { matchResult } = record.toData();
          if (matchResult === 'QUANTITY_DISCREPANCY') {
            return <div style={{ color: 'red' }}>{value}</div>;
          } else {
            return <div>{value}</div>;
          }
        },
      },
      {
        name: 'deliverQuantity',
        width: 150,
      },
      {
        name: 'quantityAccepted',
        width: 150,
        renderer: ({ record, value }) => {
          const { matchResult } = record.toData();
          if (matchResult === 'QUANTITY_DISCREPANCY') {
            return <div style={{ color: 'red' }}>{value}</div>;
          } else {
            return value;
          }
        },
      },
      {
        name: 'quantityReturned',
        width: 150,
      },
      {
        name: 'deliverTime',
        width: 150,
      },
      {
        name: 'asnNumLineNum',
        width: 150,
      },
      {
        name: 'trvNumLineNum',
        width: 150,
      },
      {
        name: 'syncStatusMeaning',
        width: 150,
      },
      {
        name: 'syncMsg',
        width: 150,
      },
    ];

    // if (activeKey !== 'automatic') {
    //   columns.splice(-2, 2);
    // }

    const { billStatus } = this.formDs.toData().length !== 0 && this.formDs.toData()[0];

    const headerInfoProps = {
      formDs: this.formDs,
      openUpload: this.handleOpenUpload,
      uuid,
      lovChange: this.handleChange,
      ouNameDisable,
      ouNameChange: this.handleOuNameChange,
      invOrganizatainDisabled,
      purchaseOrgDisable,
    };

    const operationRecordProps = {
      dispatch,
      visible: operateRecordVisible,
      onRef: this.onRef,
      hideModal: this.operateRecord,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`sfin.view.message.title.billAudit.electronicDetail`).d('电商开票单明细')}
          backPath="/sfin/bill-audit/list"
        >
          <PermissionButton
            loading={loading}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.save`,
                type: 'button',
              },
            ]}
            onClick={() => this.submitData('save')}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </PermissionButton>
          <PermissionButton
            loading={loading}
            onClick={() => this.submitData('confirm')}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.confirm`,
                type: 'button',
              },
            ]}
          >
            {intl.get('sfin.common.view.button.confirm').d('确认')}
          </PermissionButton>
          <PermissionButton
            loading={loading}
            onClick={() => this.submitData('approve')}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.approve`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.approve').d('通过')}
          </PermissionButton>
          <PermissionButton
            loading={loading}
            onClick={() => this.submitData('submitApprove')}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.submitapprove`,
                type: 'button',
              },
            ]}
          >
            {intl.get('sfin.common.view.button.submit').d('提交审批')}
          </PermissionButton>
          <PermissionButton
            loading={loading}
            onClick={() => this.submitData('feedbackEcommerce')}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.feedbackecommerce`,
                type: 'button',
              },
            ]}
          >
            {/* 标准按钮名称为退回，立讯租户为反馈电商 */}
            {intl.get('sfin.common.view.button.feedbackEcommerce').d('退回')}
          </PermissionButton>
          <PermissionButton
            loading={loading}
            onClick={() => this.submitData('cancel')}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.cancel`,
                type: 'button',
              },
            ]}
          >
            {intl.get('sfin.common.view.button.cancel').d('取消')}
          </PermissionButton>
          <PermissionButton
            onClick={() => this.operateRecord()}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.approve.ps.sfin.bill-audit.electronic-mall.button.operaterecord`,
                type: 'button',
              },
            ]}
          >
            {intl.get('sfin.common.view.button.operateRecord').d('操作记录')}
          </PermissionButton>
          {billStatus === 'CONFIRM_FAILS' && (
            <Button loading={loading} onClick={() => this.synchronousEcommerce()}>
              {intl.get('sfin.common.view.button.synchronous').d('同步电商')}
            </Button>
          )}
        </Header>
        <Content>
          <div className={styles['detail-form']}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['queryFormKey']}
              onChange={this.handleCollapse}
            >
              <Panel
                forceRender
                key="queryFormKey"
                showArrow={false}
                header={
                  <Fragment>
                    <span>{intl.get(`sfin.common.model.archive.baseInfo`).d('基本信息')}</span>
                    <a style={{ marginLeft: 20 }}>
                      {this.state.collapsed
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={this.state.collapsed ? 'expand_less' : 'expand_more'} />}
                    </a>
                  </Fragment>
                }
              >
                <HeaderInfo {...headerInfoProps} />
              </Panel>
            </Collapse>
          </div>
          <Tabs defaultActiveKey={activeKey} onChange={this.handleTabsChange} animated={false}>
            <Tabs.TabPane
              tab={intl.get(`sfin.common.model.accountSuccess`).d('自动对账成功')}
              key="automatic"
            >
              <div style={{ textAlign: 'right', marginTop: '16px', marginBottom: '8px' }}>
                <Form dataSet={this.formDs}>
                  <Output
                    name="confirmStatus"
                    renderer={() => {
                      return (
                        <>
                          <Select name="confirmStatus" />
                          <Button
                            style={{ marginLeft: '8px' }}
                            onClick={() => this.batchApprove(this.automaticLine)}
                          >
                            {intl.get('sfin.common.model.batchOpinions').d('批量维护审核意见')}
                          </Button>
                        </>
                      );
                    }}
                  />
                </Form>
              </div>
              <Table
                dataSet={this.automaticLine}
                columns={columns}
                queryFieldsLimit={3}
                data={[]}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sfin.common.model.accountFail`).d('自动对账失败')}
              key="notAutomatic"
            >
              <div style={{ textAlign: 'right', marginTop: '16px', marginBottom: '8px' }}>
                <Form dataSet={this.formDs}>
                  <Output
                    name="confirmStatus"
                    renderer={() => {
                      return (
                        <>
                          <Select name="confirmStatus" />
                          <Button
                            style={{ marginLeft: '8px' }}
                            onClick={() => this.batchApprove(this.notAutomaticLine)}
                          >
                            {intl.get('sfin.common.model.confirmStatus').d('批量维护审核意见')}
                          </Button>
                        </>
                      );
                    }}
                  />
                </Form>
              </div>
              <Table
                dataSet={this.notAutomaticLine}
                columns={columns}
                queryFieldsLimit={3}
                data={[]}
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
        <ActionHistory {...operationRecordProps} />
      </Fragment>
    );
  }
}
