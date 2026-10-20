import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import { openTab } from 'utils/menuTab';
import qs from 'querystring';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import CommonImport from 'hzero-front/lib/components/Import';
import { Button as PermissionButton } from 'components/Permission';
import { tableDs } from './fieldsInitalValue';
import EditForm from './EditForm';
import { handleSave } from '@/services/budgetAccountService';

const organizationId = getCurrentOrganizationId();
const ModalKey = Modal.key();

@connect()
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
export default class PartsRecDemandPool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  tableDataDs = new DataSet(tableDs());

  ListDSCopy = new DataSet(tableDs());

  // 保存
  @Bind()
  async dataSave() {
    const validFlag = await this.tableDataDs.validate();
    if (validFlag) {
      const response = await this.tableDataDs.submit();
      if (!isEmpty(response) && response.message && response.failed) {
        notification.error({ message: response.message });
      } else {
        this.tableDataDs.query();
      }
    }
  }

  @Bind()
  handleAddModal(flag, data) {
    const record = flag === 'create' ? this.ListDSCopy.create(data) : data;
    Modal.open({
      closable: true,
      drawer: true,
      keyboardClosable: true,
      style: {
        width: 650,
      },
      key: ModalKey,
      title:
        flag === 'create'
          ? intl.get('sprm.common.view.title.budgetCreate').d('预算科目创建')
          : intl.get('sprm.common.view.title.budgetEdit').d('预算科目编辑'),
      children: <EditForm dataRecord={record} create={flag === 'create'} />,
      onOk: () => this.handleCreate(record, flag),
      okProps: { loading: this.state.loading },
      onClose: () => this.handleClose(record, flag),
    });
  }

  @Bind()
  handleClose(record, flag) {
    if (flag === 'create') {
      this.ListDSCopy.remove(record);
    } else {
      record.reset();
    }
  }

  @Bind()
  async handleCreate(record) {
    const validFlag = await record.validate();
    if (validFlag) {
      this.setState({
        loading: true,
      });
      const res = getResponse(
        await handleSave({
          ...record.toData(),
          tenantId: organizationId,
        })
      );
      if (res && !res.failed) {
        notification.success();
        this.tableDataDs.query();
        this.setState({
          loading: false,
        });
      } else {
        this.setState({
          loading: false,
        });
        return false;
      }
    } else {
      return false;
    }
  }

  // 开启和禁止
  @Bind()
  async handleSave(record, updateAction) {
    // 直接调service里面的接口
    try {
      const data = await handleSave(record.data, updateAction);
      if (data.message && data.failed) {
        //  这里需要作出信息提示
        notification({
          message: data.message,
        });
      } else {
        notification.success();
        this.tableDataDs.query();
      }
    } catch (err) {
      notification.error({
        message: `${intl.get('hzero.common.notification.error').d('操作失败')}:${err.message}`,
      });
      this.tableDataDs.query();
    }
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: `/smdm/budget-account/data-import/SMDM.BUDGET_ACCOUNT_IMPORT`,
      title: 'hzero.common.viewtitle.batchImport',
      search: qs.stringify({
        action: 'hzero.common.viewtitle.batchImport',
      }),
    });
  }

  render() {
    const columns = [
      {
        name: 'budgetAccountNum',
        width: 250,
      },
      {
        name: 'budgetAccountName',
        width: 250,
      },
      {
        name: 'companyLov',
        width: 200,
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'openBudgetFlag',
        width: 150,
        align: 'center',
        renderer: ({ text }) => yesOrNoRender(+text),
      },
      {
        name: 'enabledFlag',
        align: 'center',
        width: 150,
        renderer: ({ text }) => enableRender(+text),
      },
      {
        name: 'sourceCode',
        width: 150,
      },
      {
        name: 'externalSystemCode',
        width: 200,
      },
      {
        name: 'option',
        header: intl.get('smdm.common.profitCentent.modal.operating').d('操作'),
        width: 100,
        align: 'center',
        renderer: ({ record }) => (
          <a
            onClick={() => {
              this.handleAddModal('edit', record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    return (
      <Fragment>
        <Header title={intl.get('sprm.common.title.budgetAccount').d('预算科目定义')}>
          <Button color="primary" onClick={() => this.handleAddModal('create', {})}>
            {intl.get(`hzero.common.model.create`).d('新建')}
          </Button>
          <CommonImport
            prefixPatch="/smdm"
            businessObjectTemplateCode="SMDM.BUDGET_ACCOUNT_IMPORT"
            buttonText={intl.get(`hzero.common.import.new`).d('导入-新')}
            buttonProps={{
              permissionList: [
                {
                  code: `srm.fin.budget.account.ps.new.list.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
          />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={this.handleBatchImport}
            permissionList={[
              {
                code: `srm.fin.budget.account.ps.list.import`,
                type: 'button',
                meaning: '导入',
              },
            ]}
          >
            {intl.get(`hzero.common.import`).d('导入')}
          </PermissionButton>
        </Header>
        <Content>
          <Table dataSet={this.tableDataDs} columns={columns} />
        </Content>
      </Fragment>
    );
  }
}
