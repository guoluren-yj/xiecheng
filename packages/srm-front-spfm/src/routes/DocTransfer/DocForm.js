/**
 * DocForm.js
 * 单据转交定义-新建和编辑页面
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';
import React, { Component } from 'react';
import { Table, DataSet, Form, TextField, Row, Col, Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_PLATFORM } from '_utils/config';
import { omit } from 'lodash';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { transferDoc } from '@/services/docTransferService';
import DocTableDS from './store/docTableDS';
import RulesDefinitionModal from './RulesDefinitionModal';
import {
  getConditionJsonDs,
  getPolicyConfigDataDs,
  getCustomizeConditionCombinationDs,
  getReturnFieldTableDs,
  getParamTableDs,
} from './store/policyConfigDs';

const modalKey = Modal.key();
export default class DocForm extends Component {
  tableDS = new DataSet({
    ...DocTableDS(),
    transport: {
      read: config => {
        const { params } = config;
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-deliver-records/documents/${
            this.props.userId
          }`,
          method: 'GET',
          ...config,
          params: {
            ...params,
            deliverType: this.props.isAgent ? 'AGENT' : 'USER',
          },
        };
      },
    },
    selection: false,
  });

  paramTableDs = new DataSet(getParamTableDs());

  // 参数表格 ds
  policyConfigDataDs = new DataSet(getPolicyConfigDataDs());

  // 配置行数据 ds
  conditionJsonDs = new DataSet(getConditionJsonDs(this.props.isAgent, this.props.userId));

  // 配置条件 ds
  returnFieldDs = new DataSet(getReturnFieldTableDs(this.props.isAgent));

  // 执行规则Ds
  customizeConditionCombinationDs = new DataSet(getCustomizeConditionCombinationDs());

  @Bind()
  conditionCreate() {
    this.conditionJsonDs.create({});
  }

  @Bind()
  handleTransferModal(record) {
    const { parameters } = record.toData();
    if (parameters) {
      this.paramTableDs.loadData(JSON.parse(parameters));
    }
    this.customizeConditionCombinationDs.create();
    this.policyConfigDataDs.create();
    this.returnFieldDs.create();

    Modal.open({
      key: modalKey,
      title: intl.get('spfm.docTransfer.view.header.title').d('单据转交'),
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 800 },
      onOk: async () => {
        const flag = await this.handleTransferOK(record);
        return flag;
      },
      afterClose: () => this.handleCancel(),
      children: (
        <RulesDefinitionModal
          policyConfigDataDs={this.policyConfigDataDs}
          conditionJsonDs={this.conditionJsonDs}
          paramTableDs={this.paramTableDs}
          conditionCreate={this.conditionCreate}
          isAgent={this.props.isAgent}
          returnFieldDs={this.returnFieldDs}
          customizeConditionCombinationDs={this.customizeConditionCombinationDs}
        />
      ),
    });
  }

  @Bind()
  handleCancel() {
    this.returnFieldDs.loadData([]);
    this.paramTableDs.loadData([]);
    this.conditionJsonDs.loadData([]);
    this.customizeConditionCombinationDs.loadData([]);
    this.policyConfigDataDs.loadData([]);
  }

  @Bind()
  async handleTransferOK(record) {
    const response = await this.policyConfigDataDs.validate();
    const result = await this.returnFieldDs.validate();
    const r = await this.conditionJsonDs.validate();
    const vr = await this.customizeConditionCombinationDs.validate();
    const { dataRecord, userId } = this.props;
    const policyConfigData = this.policyConfigDataDs.current.toData();
    const { conditionType } = policyConfigData;
    const { customizeConditionCombination } = this.customizeConditionCombinationDs.current.toData();
    if (response && result && (conditionType === 'TRUE' || (r && vr))) {
      const returnFieldData = this.returnFieldDs.current.toData();
      const conditionJsonData = this.conditionJsonDs.toData();
      const conditionJson = {
        conditionType,
        customizeConditionCombination:
          conditionType === 'TRUE' ? undefined : customizeConditionCombination,
        conditionLines: conditionType === 'TRUE' ? [] : conditionJsonData,
      };

      const data = record.toData();
      const saveData = {
        ...data,
        ...omit(policyConfigData),
        ...returnFieldData,
        tenantId: getCurrentOrganizationId(),
        conditionJson: JSON.stringify(conditionJson),
        deliverFromId: userId,
        deliverType: this.props.isAgent ? 'AGENT' : 'USER',
        deliverFrom: this.props.isAgent
          ? dataRecord.get('purchaseAgentName')
          : dataRecord.get('loginName'),
      };
      const res = await transferDoc(saveData);
      if (getResponse(res)) {
        notification.success({
          message: intl
            .get('spfm.docTransfer.transfer.dealNum', { num: res.docCount })
            .d('{num} 条单据已处理'),
        });
        this.tableDS.query();
        setTimeout(() => {
          this.handleCancel();
        }, 500);
        return true;
      }
    }
    return false;
  }

  componentDidMount() {
    this.setState({
      nowTime: new Date(),
    });
  }

  render() {
    const columns = [
      {
        name: 'docName',
      },
      {
        name: 'docCode',
      },
      {
        name: 'updateField',
      },
      {
        name: 'docCount',
      },
      {
        name: 'nowTime',
        width: 160,
        renderer: () => <span>{moment(this.state.nowTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) =>
          record.get('docCount') !== 0 ? (
            <a onClick={() => this.handleTransferModal(record)}>
              {intl.get('spfm.docTransfer.model.view.transfer').d('转交')}
            </a>
          ) : (
            '-'
          ),
      },
    ];
    /**
     * 重写renderBar，渲染查询组件
     * @param {object} barProps
     * @returns {JSX.Element}
     */
    const renderBar = () => {
      return (
        <Row className="siteInvestigateReport" style={{ marginBottom: '8px' }}>
          <Col span={16}>
            <Form
              labelWidth={50}
              dataSet={this.tableDS.queryDataSet}
              labelLayout="float"
              onKeyDown={e => {
                if (e.keyCode === 13) return this.tableDS.query();
              }}
            >
              <TextField name="docName" />
            </Form>
          </Col>
          <Col span={8} style={{ textAlign: 'center', marginTop: '1px' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                this.tableDS.queryDataSet.current.reset();
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button color="primary" onClick={() => this.tableDS.query()}>
              {intl.get('hzero.common.button.query').d('查询')}
            </Button>
          </Col>
        </Row>
      );
    };
    return (
      <React.Fragment>
        <Table
          queryBar={renderBar}
          dataSet={this.tableDS}
          columns={columns}
          queryFieldsLimit={3}
          customizable
          customizedCode="SPFM.DOC_TRANSFER.DETAIL.TABLE"
        />
      </React.Fragment>
    );
  }
}
