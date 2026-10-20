/**
 * InvestigateTmpl - 供应商360度查询-调查表
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row } from 'hzero-ui';
import { camelCase, pullAll, isEmpty } from 'lodash';
import ComposeForm from '@/routes/components/Compose/ComposeForm';
import ComposeTable from '@/routes/components/Compose/ComposeTable';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

/**
 * 供应商360度查询 - 调查表
 * @extends {Component} - React.Component
 * @reactProps {Object} questionnaireTmpl - 调查表模板数据源
 * @reactProps {Object} tmplDataSource - 调查表数据数据源
 * @return React.element
 */
@formatterCollections({ code: ['sslm.supplierDetail'] })
export default class InvestigateTmpl extends PureComponent {
  render() {
    const { questionnaireTmpl = [], tmplDataSource = {} } = this.props;
    // 接口查出的配置项
    const configNameList = questionnaireTmpl.map(n => n.configName);
    // 要过滤的值
    const filterList = [
      'sslm_investg_contact',
      'sslm_investg_fin',
      'sslm_investg_address',
      'sslm_investg_bank_account',
      'sslm_investg_attachment',
    ];
    const finalyList = pullAll(configNameList, filterList);

    return (
      <Row>
        <div>
          {!isEmpty(finalyList) && (
            <div id="questionnaire_information" className="first-title">
              {intl.get('sslm.supplierDetail.view.message.questionnaireInfo').d('调查表信息')}
            </div>
          )}
        </div>
        <div>
          {!isEmpty(questionnaireTmpl) > 0 &&
            questionnaireTmpl.map(item => {
              const configLines = [];
              (item.investigateConfigLines || []).forEach(line => {
                configLines.push({
                  ...line,
                  fieldCode: camelCase(line.fieldCode),
                  props: line.investigateConfigComponents
                    ? [...line.investigateConfigComponents]
                    : [],
                });
              });
              switch (item.configName) {
                case 'sslm_investg_basic': // 基本信息
                case 'sslm_investg_business': // 业务信息
                case 'sslm_investg_rd': // 研发能力 // 研发与生产能力
                case 'sslm_investg_produce': // 生产能力 // 研发与生产能力
                case 'sslm_investg_qa': // 质保能力 // 质保与售后服务
                case 'sslm_investg_custservice': // 售后服务 // 质保与售后服务
                case 'sslm_investg_reserve3': // 预留表单页签1
                case 'sslm_investg_reserve4': // 预留表单页签2
                case 'sslm_investg_reserve10': // 预留表单页签3
                case 'sslm_investg_reserve11': // 预留表单页签4
                case 'sslm_investg_reserve12': // 预留表单页签5
                case 'sslm_investg_reserve13': // 预留表单页签6
                case 'sslm_investg_reserve14': // 预留表单页签7
                  return (
                    <div key={item.configName}>
                      <Row style={{ marginTop: '40px' }}>
                        <div id={item.configName} className="second-title">
                          {item.configDescription}
                        </div>
                      </Row>
                      <Row>
                        <ComposeForm
                          editable={false}
                          fields={configLines}
                          dataSource={tmplDataSource[item.configName.replace(/_/g, '')] || {}}
                          fieldLabelWidth={150}
                          disableStyle="value"
                          configName={camelCase(item.configName)}
                        />
                      </Row>
                    </div>
                  );
                case 'sslm_investg_proservice': // 产品及服务
                case 'sslm_investg_supplier_cate': // 供应商分类
                case 'sslm_investg_fin_branch': // 分支机构
                case 'sslm_investg_auth': // 资质信息
                case 'sslm_investg_customer': // 主要客户情况
                case 'sslm_investg_sub_supplier': // 分供方情况
                case 'sslm_investg_equipment': // 设备信息
                case 'sslm_investg_reserve1': // 预留表格页签1
                case 'sslm_investg_reserve2': // 预留表格页签2
                case 'sslm_investg_reserve5': // 预留表格页签3
                case 'sslm_investg_reserve6': // 预留表格页签4
                case 'sslm_investg_reserve7': // 预留表格页签5
                case 'sslm_investg_reserve8': // 预留表格页签6
                case 'sslm_investg_reserve9': // 预留表格页签7
                  // case 'sslm_investg_attachment': // 附件信息
                  return (
                    <div key={item.configName}>
                      <Row style={{ marginTop: '40px' }}>
                        <div id={item.configName} className="second-title">
                          {item.configDescription}
                        </div>
                      </Row>
                      <Row>
                        <ComposeTable
                          fields={configLines}
                          dataSource={tmplDataSource[item.configName.replace(/_/g, '')] || []}
                          addable={false}
                          editable={false}
                          removable={false}
                          pagination={false}
                          rowKey="id"
                          fieldLabelWidth={150}
                        />
                      </Row>
                    </div>
                  );
                default:
                  return null;
              }
            })}
        </div>
      </Row>
    );
  }
}
