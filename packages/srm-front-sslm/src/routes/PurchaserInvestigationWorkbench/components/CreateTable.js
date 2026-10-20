/**
 * CreateTable - 行信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import intl from 'utils/intl';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { uniqBy, isEmpty } from 'lodash';
import SupplierLov from '_components/SupplierLov';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId } from 'utils/utils';

import { riskScan } from '@/routes/LifeCycleManage/utils';
import { downLoadFile } from '@/routes/components/utils';

@observer
export default class CreateTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchBarProps: {},
    };
  }

  componentDidMount() {
    this.handleFetchSearchBarParams().then(res => {
      this.setState({searchBarProps: {...res}});
    });
  }

  supplierModalDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'selectedField',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
        multiple: true,
      },
    ],
  });

  @Bind()
 async handleFetchSearchBarParams() {
    const {investigationCreateRemote, headerDs } = this.props;
    const searBarParams = investigationCreateRemote ? await investigationCreateRemote.process("SSLM_PURCHASER_INVESTIGATION_CREATE.SUPPLIER_LOV_SEARCH_BAR_PROPS", {headerDs}) : {};

    return searBarParams;
  }

  @Bind()
  handleRiskReport(record) {
    const { fileUrl } = record.get(['fileUrl']);
    const url = downLoadFile({ tenantId: getCurrentOrganizationId(), attachmentUrl: fileUrl });
    window.open(url);
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'companyNum',
      },
      {
        name: 'companyName',
      },
      {
        name: 'riskScan',
        renderer: ({ record }) => {
          const { companyName, supplierCompanyId } = record.get([
            'companyName',
            'supplierCompanyId',
          ]);
          record.init({
            riskScanCompanyName: companyName,
            riskScanCompanyId: supplierCompanyId,
          });
          return (
            <a
              onClick={() => {
                riskScan(record, false, true);
              }}
            >
              {intl.get('sslm.common.view.button.isScan').d('风险扫描')}
            </a>
          );
        },
      },
      {
        name: 'riskScanDate',
        width: 160,
      },
      {
        name: 'riskLevelMeaning',
      },
      {
        name: 'fileUrl',
        renderer: ({ record }) => {
          const { fileUrl } = record.get(['fileUrl']);
          if (!fileUrl) {
            return '-';
          }
          return (
            <a
              onClick={() => {
                this.handleRiskReport(record);
              }}
            >
              {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
            </a>
          );
        },
      },
      {
        name: 'business',
        renderer: ({ record }) => {
          const {
            manufacturerFlag,
            servicerFlag,
            traderFlag,
            agentFlag,
            integrationFlag,
            contractorFlag,
            dealerFlag,
          } = record.get([
            'manufacturerFlag',
            'servicerFlag',
            'traderFlag',
            'agentFlag',
            'integrationFlag',
            'contractorFlag',
            'dealerFlag',
          ]);
          const businessList = [];
          if (manufacturerFlag) {
            businessList.push(
              intl.get('sslm.investMaintain.model.investMaintain.manufacturerFlag').d('制造商')
            );
          }
          if (servicerFlag) {
            businessList.push(
              intl.get('sslm.investMaintain.model.investMaintain.servicerFlag').d('服务商')
            );
          }
          if (traderFlag) {
            businessList.push(
              intl.get('sslm.investMaintain.model.investMaintain.traderFlag').d('贸易商')
            );
          }
          if (agentFlag) {
            businessList.push(intl.get('sslm.enterpriseInform.model.business.agent').d('代理商'));
          }
          if (integrationFlag) {
            businessList.push(
              intl.get('sslm.enterpriseInform.view.model.business.integration').d('集成商')
            );
          }
          if (contractorFlag) {
            businessList.push(
              intl.get('sslm.enterpriseInform.view.model.business.contractor').d('承包商')
            );
            if (dealerFlag) {
              businessList.push(
                intl.get('sslm.enterpriseInform.view.model.business.dealer').d('经销商')
              );
            }
          }
          return businessList.join('，');
        },
      },
      {
        name: 'taxpayerType',
      },
      {
        name: 'partnerContactor',
        editor: true,
      },
      {
        name: 'partnerContactPhone',
        width: 240,
        editor: true,
      },
      {
        name: 'partnerContactMail',
        editor: true,
      },
      {
        name: 'buildDate',
      },
    ];
    return columns;
  }

  @Bind()
  saveRecordRows() {
    const { onSaveRecordRows = () => {} } = this.props;
    const currentData = this.supplierModalDs.current.toData();
    const { selectedField } = currentData;
    const selectedRecord = (selectedField || []).map(item => {
      const { supplierCompanyName, supplierCompanyNum, mail, mobilephone, name, ...others } = item;
      return {
        ...others,
        companyName: supplierCompanyName,
        companyNum: supplierCompanyNum,
        partnerContactMail: mail,
        partnerContactPhone: mobilephone,
        partnerContactor: {
          name,
          mobilephone,
          internationalTelCode: item.internationalTelCode,
          mail,
        },
      };
    });
    // 过滤重复的供应商
    const uniqData = uniqBy(selectedRecord, 'companyNum');
    onSaveRecordRows(uniqData);
    this.supplierModalDs.current.set('selectedField', undefined);
  }

  render() {
    const {
      tableDs,
      headerDs,
      isAmktClient,
      investigationCreateRemote,
      customizeTable,
      custLoading,
    } = this.props;
    const {searchBarProps} = this.state;

    const standardProps = {
      srmFlag: 1,
      companyId: headerDs.current && headerDs.current.get('companyId'),
      pageSource: 'Investg',
    };
    const remoteProps = {
      headerDs,
    };
    const supplierLovQueryParams = investigationCreateRemote.process(
      'SSLM_PURCHASER_INVESTIGATION_CREATE.SUPPLIER_LOV_QUERY_PARAMS',
      standardProps,
      remoteProps
    );

    const modalProps = {
      dataSet: this.supplierModalDs,
      name: 'selectedField',
      mode: 'button',
      funcType: 'flat',
      icon: 'playlist_add',
      clearButton: false,
      color: 'primary',
      modalProps: {
        onOk: this.saveRecordRows,
      },
      queryData: supplierLovQueryParams,
      searchBarProps,
    };

    const buttons = isAmktClient
      ? []
      : [
        <SupplierLov {...modalProps}>
          {intl.get('hzero.common.button.add').d('新增')}
        </SupplierLov>,
        <Button
          icon="delete_sweep"
          disabled={isEmpty(tableDs.selected)}
          onClick={() => {
              tableDs.delete(tableDs.selected, false);
            }}
        >
          {intl.get('hzero.common.button.batchdelete').d('批量删除')}
        </Button>,
        ];

    return customizeTable(
      {
        code: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_TABLE',
      },
      <Table
        dataSet={tableDs}
        columns={this.getColumns()}
        data={[]}
        buttons={buttons}
        custLoading={custLoading}
        style={{ maxHeight: 340 }}
        customizable
        customizedCode="sslm-purchaser-investigation-wait-release-create" // 没有个性化编码用这种方式实现配置
      />
    );
  }
}
