/**
 * Information - 认证信息展示 - 信息查询
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Table } from 'hzero-ui';
import ComposeForm from 'components/Compose/ComposeForm';
import intl from 'utils/intl';
import './index.less';

/**
 * 信息查询
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class Information extends PureComponent {
  /**
   * 点击行展开行
   */
  onRow() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 220,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { currentTarget } = e;
        if (currentTarget && currentTarget.childNodes && currentTarget.childNodes.length > 0) {
          const nodes = currentTarget.childNodes;
          nodes.forEach(node => {
            // eslint-disable-next-line
            node.style.whiteSpace = node.style.whiteSpace === 'normal' ? 'nowrap' : 'normal';
          });
        }
      },
    };
  }
  render() {
    const { informationData, changeRecordData, shareholderData, abnormalItemData } = this.props;
    // 工商基本信息
    const fields = [
      {
        colspan: 1,
        fieldCode: 'enterpriseName',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.enterpriseName`).d('企业名称'),
      },
      {
        colspan: 2,
        fieldCode: 'enterpriseType',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.enterpriseType`).d('企业类型'),
      },
      {
        colspan: 3,
        fieldCode: 'enterpriseAddress',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.enterpriseAddress`)
          .d('企业地址'),
      },
      {
        colspan: 1,
        fieldCode: 'registeredNumber',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.registeredNumber`).d('注册号'),
      },
      {
        colspan: 1,
        fieldCode: 'legalRepName',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.legalRepName`).d('法定代表人'),
      },
      {
        colspan: 3,
        fieldCode: 'businessScope',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.businessScope`).d('经营范围'),
        componentType: 'TextArea',
      },
      {
        colspan: 1,
        fieldCode: 'termStartDate',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.termStartDate`)
          .d('营业开始日期'),
      },
      {
        colspan: 1,
        fieldCode: 'termEndDate',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.termEndDate`)
          .d('营业结束日期'),
      },
      {
        colspan: 1,
        fieldCode: 'belongCommerceIndustry',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.belongCommerceIndustry`)
          .d('所属工商局'),
      },
      {
        colspan: 1,
        fieldCode: 'approvedDate',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.approvedDate`).d('核准日期'),
      },
      {
        colspan: 1,
        fieldCode: 'startDate',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.startDate`).d('成立日期'),
      },
      {
        colspan: 1,
        fieldCode: 'endDate',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.endDate`).d('注销日期'),
      },
      {
        colspan: 1,
        fieldCode: 'businessStatus',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.businessStatus`).d('在业'),
      },
      {
        colspan: 1,
        fieldCode: 'orgInstitutionNumber',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.orgInstitutionNumber`)
          .d('组织机构号'),
      },
      {
        colspan: 1,
        fieldCode: 'unifiedSocialCode',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.unifiedSocialCode`)
          .d('统一社会信用代码'),
      },
      {
        colspan: 1,
        fieldCode: 'province',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.province`).d('省份缩写'),
      },
      {
        colspan: 1,
        fieldCode: 'city',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.city`).d('城市编码'),
      },
      {
        colspan: 1,
        fieldCode: 'industries',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.industries`).d('行业类型'),
      },
      {
        colspan: 1,
        fieldCode: 'webName',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.webName`).d('企业网站名称'),
      },
      {
        colspan: 1,
        fieldCode: 'webType',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.webType`).d('网址类型'),
      },
      {
        colspan: 3,
        fieldCode: 'webUrl',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.webUrl`).d('公司官网'),
      },
      {
        colspan: 1,
        fieldCode: 'webSource',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.webSource`).d('网址来源'),
      },
      {
        colspan: 1,
        fieldCode: 'webSeqNumber',
        fieldDescription: intl.get(`seci.creditInfo.model.creditInfo.webSeqNumber`).d('编号'),
      },
      {
        colspan: 1,
        fieldCode: 'webApprovedDate',
        fieldDescription: intl
          .get(`seci.creditInfo.model.creditInfo.webApprovedDate`)
          .d('审核时间'),
      },
    ];
    const dataSource = informationData;
    // 工商变更
    const changeRecordColumns = [
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.changeItem`).d('变更项目'),
        dataIndex: 'changeItem',
        width: 200,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.changeDate`).d('变更日期'),
        dataIndex: 'changeDate',
        align: 'center',
        width: 100,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.beforeContent`).d('变更前内容'),
        dataIndex: 'beforeContent',
        width: 200,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.afterContent`).d('变更后内容'),
        dataIndex: 'afterContent',
        width: 200,
      },
    ];
    // 股东信息
    const shareholderColumns = [
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.shareholderName`).d('股东姓名'),
        dataIndex: 'shareholderName',
        width: 120,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.shareholderType`).d('股东类型'),
        dataIndex: 'shareholderType',
        width: 100,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.identifyType`).d('证件类型'),
        dataIndex: 'identifyType',
        width: 120,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.identifyNo`).d('证件号码'),
        dataIndex: 'identifyNo',
        width: 120,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.shouldSubscribedCapital`).d('认缴出资额'),
        dataIndex: 'shouldSubscribedCapital',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.shouldCapitalType`).d('出资方式'),
        dataIndex: 'shouldCapitalType',
        width: 100,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.shouldCapitalDate`).d('出资时间'),
        dataIndex: 'shouldCapitalDate',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.realSubscribedCapital`).d('实际缴出资额'),
        dataIndex: 'realSubscribedCapital',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.realCapitalType`).d('实际出资方式'),
        dataIndex: 'realCapitalType',
        width: 100,
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.realCapitalDate`).d('实缴时间'),
        dataIndex: 'realCapitalDate',
        width: 120,
        align: 'center',
      },
    ];
    // 经营异常
    const abnormalItemColumns = [
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.inReason`).d('经营异常列入原因'),
        dataIndex: 'inReason',
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.inDate`).d('列入日期'),
        dataIndex: 'inDate',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.outReason`).d('移出原因'),
        dataIndex: 'outReason',
        width: 150,
        align: 'right',
      },
      {
        title: intl.get(`seci.creditInfo.model.creditInfo.outDate`).d('移出时间'),
        dataIndex: 'outDate',
        width: 150,
        align: 'center',
      },
    ];
    return (
      <React.Fragment>
        <Row gutter={24}>
          <Col span={24} className="credit-company-name">
            {informationData.enterpriseName}
          </Col>
        </Row>
        <Row gutter={24} className="company-title" style={{ marginTop: '24px' }}>
          <Col span={24}>
            <span className="first-title-mark" />
            <span id="company-information" className="credit-company-first-title">
              1-{intl.get(`seci.creditInfo.view.message.meun.companyInformation`).d('工商基本信息')}
            </span>
          </Col>
        </Row>
        <Row>
          <ComposeForm
            editable={false}
            fields={fields}
            dataSource={dataSource || {}}
            fieldLabelWidth={150}
            disableStyle="value"
          />
        </Row>
        <Row gutter={24} className="company-title">
          <Col span={24}>
            <span className="first-title-mark" />
            <span id="change-recordn" className="credit-company-first-title">
              2-{intl.get(`seci.creditInfo.view.message.meun.change`).d('工商变更')}
            </span>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Table
              rowKey="changeRecordId"
              dataSource={changeRecordData}
              columns={changeRecordColumns}
              pagination={false}
              onRow={this.onRow.bind(this)}
              bordered
            />
          </Col>
        </Row>
        <Row gutter={24} className="company-title">
          <Col span={24}>
            <span className="first-title-mark" />
            <span id="shareholder-information" className="credit-company-first-title">
              3-{intl.get(`seci.creditInfo.view.message.meun.shareholder`).d('股东信息')}
            </span>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Table
              rowKey="shareholderId"
              dataSource={shareholderData}
              columns={shareholderColumns}
              pagination={false}
              bordered
            />
          </Col>
        </Row>
        <Row gutter={24} className="company-title">
          <Col span={24}>
            <span className="first-title-mark" />
            <span id="abnormal-item" className="credit-company-first-title">
              4-{intl.get(`seci.creditInfo.view.message.meun.abnormal`).d('经营异常')}
            </span>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Table
              rowKey="enterpriseId"
              dataSource={abnormalItemData}
              columns={abnormalItemColumns}
              pagination={false}
              bordered
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
