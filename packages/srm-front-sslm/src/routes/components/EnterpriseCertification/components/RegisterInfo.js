/*
 * RegisterInfo - 登记信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import UploadCard from './UploadCard';
import FileCardByUuid from '../components/FileCardByUuid';

/**
 * 登记信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class RegisterInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      basic: {},
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const { basic = {} } = nextProps;
    if (!isEmpty(basic) && isEmpty(prevState.basic)) {
      nextState.basic = basic;
    }
    return nextState;
  }

  componentDidUpdate(prevProps, prevState) {
    const { basic } = this.state;
    if (!isEmpty(basic) && isEmpty(prevState.basic)) {
      this.handleBasicInfo();
    }
  }

  @Bind()
  handleBasicInfo() {
    const { dataSet } = this.props;
    const { basic } = this.state;
    dataSet.loadData([basic]);
  }

  /**
   * 处理境内/境外
   */
  @Bind()
  renderForm() {
    const { basic = {} } = this.state;
    const { remote, isTenantApprove = false, mainDataTab } = this.props;
    const {
      domesticForeignRelation,
      longTermFlag,
      licenceEndDate,
      licenceUrl,
      licenceFilename,
      idType,
      certificationType,
    } = basic;
    const configName =
      domesticForeignRelation === 1
        ? 'spfm_company_basic_in'
        : domesticForeignRelation === 0
        ? 'spfm_company_basic_out'
        : null;
    const { enableFieldList = [] } =
      mainDataTab.find(item => item.configName === configName)?.configInfo || {};
    // 显示身份证标识
    const idNumVisable = idType === 'I';
    // domesticForeignFlag 境内-1，境外-0，个人-2
    // 企业本土字段显隐
    const localInfoFlag = remote
      ? remote.process('SSLM_CERTIFICATIONDEAL_DEFINITION_REGISTER_INFO_LOCAL_INFO_FLAG', true, {
          basic,
        })
      : true;
    const dom =
      domesticForeignRelation === 1 ? (
        <React.Fragment>
          <Output name="companyName" />
          <Output name="companyNum" />
          <Output
            renderer={() => {
              return (
                <UploadCard
                  fileName={licenceFilename}
                  fileUrl={licenceUrl}
                  enableImageWatermark={1}
                />
              );
            }}
            rowSpan={6}
          />
          <Output name="unifiedSocialCode" />

          <Output name="dunsCode" />
          <Output name="institutionalType" />

          <Output name="companyType" />
          <Output name="registeredCountryName" />
          <Output name="registeredRegionName" />
          <Output name="addressDetail" />

          <Output name="legalRepName" />
          <Output name="taxpayerType" />

          <Output name="registeredCapital" />
          <Output name="currencyName" />
          <Output name="buildDate" />
          <Output
            name="licenceEndDate"
            renderer={() => {
              return longTermFlag === 1
                ? intl.get(`spfm.enterprise.view.message.longTerm`).d('长期')
                : licenceEndDate;
            }}
          />

          <Output name="businessScope" newLine />
          {localInfoFlag && (
            <>
              <Output name="localName" hidden={!enableFieldList.includes('localName')} />
              <Output name="localAddress" hidden={!enableFieldList.includes('localAddress')} />
            </>
          )}
        </React.Fragment>
      ) : domesticForeignRelation === 2 ? (
        isTenantApprove ? (
          <React.Fragment>
            <Output name="domesticForeignRelation" hidden={!!certificationType} />
            <Output name="certificationType" hidden={!certificationType} />
            <Output
              name="certificationRegionId"
              hidden={!certificationType || certificationType === '2'}
            />
            <Output name="companyName" colSpan={2} />
            <Output name="registeredCountryName" />
            <Output name="regionPathName" />
            <Output name="addressDetail" />
            <Output name="phone" />
            <Output name="email" />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Output name="domesticForeignRelation" hidden={!!certificationType} />
            <Output name="certificationType" hidden={!certificationType} />
            <Output
              name="certificationRegionId"
              hidden={!certificationType || certificationType === '2'}
            />
            <Output name="companyName" />
            <Output
              name="idFrontUuid"
              rowSpan={4}
              renderer={({ record = {} }) => {
                const idFrontUuid = isEmpty(record) ? undefined : record.get('idFrontUuid');
                return (
                  <FileCardByUuid
                    record={record}
                    label={intl
                      .get('spfm.supplierRegister.view.title.nationalEmblem')
                      .d('身份证身份证国徽面')}
                    uuid={idFrontUuid}
                    viewOnly
                    fieldName="idFrontUuid"
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output name="registeredCountryName" />
            <Output name="regionPathName" />
            <Output name="idType" />
            <Output name="idNum" hidden={!idNumVisable} />
            <Output name="passport" hidden={idNumVisable} />
            <Output name="phone" />
            <Output name="email" />
            <Output name="buildDate" colSpan={2} />
            <Output
              name="idBackUuid"
              rowSpan={4}
              renderer={({ record = {} }) => {
                const idBackUuid = isEmpty(record) ? undefined : record.get('idBackUuid');
                return (
                  <FileCardByUuid
                    record={record}
                    label={intl
                      .get('spfm.supplierRegister.view.title.portraitFace')
                      .d('身份证人像面')}
                    uuid={idBackUuid}
                    viewOnly
                    fieldName="idFrontUuid"
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output name="licenceEndDate" />
            <Output name="longTermFlag" renderer={({ value }) => yesOrNoRender(value)} />
            <Output name="addressDetail" />
          </React.Fragment>
        )
      ) : (
        <React.Fragment>
          <Output name="companyName" />
          <Output name="companyNum" />
          <Output
            renderer={() => {
              return (
                <UploadCard
                  fileName={licenceFilename}
                  fileUrl={licenceUrl}
                  enableImageWatermark={1}
                />
              );
            }}
            rowSpan={4}
            hidden={!enableFieldList.includes('licenceUrl')}
          />
          <Output name="businessRegistrationNumber" />
          <Output name="dunsCode" />
          <Output name="registeredCountryName" />
          <Output name="registeredRegionName" />
          <Output name="addressDetail" />

          <Output name="legalRepName" hidden={!enableFieldList.includes('legalRepName')} />
          <Output
            name="registeredCapital"
            hidden={!enableFieldList.includes('registeredCapital')}
          />
          <Output name="currencyName" hidden={!enableFieldList.includes('currencyObj')} />
          <Output name="buildDate" />

          <Output
            name="businessScope"
            newLine
            hidden={!enableFieldList.includes('businessScope')}
          />
          {localInfoFlag && (
            <>
              <Output name="localName" hidden={!enableFieldList.includes('localName')} />
              <Output name="localAddress" hidden={!enableFieldList.includes('localAddress')} />
            </>
          )}
        </React.Fragment>
      );
    return dom;
  }

  render() {
    const { dataSet } = this.props;

    return (
      <Fragment>
        <Form
          dataSet={dataSet}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          style={{
            width: '75%',
          }}
        >
          {this.renderForm()}
        </Form>
      </Fragment>
    );
  }
}
