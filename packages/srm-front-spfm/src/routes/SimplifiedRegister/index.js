/*
 * SimplifiedRegister - 简化供应商注册-首页
 * @date: 2020/11/09 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Button, Modal, notification } from 'choerodon-ui/pro';
import { Row, Col, Card, Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse } from 'utils/utils';
import { deleteCache } from 'components/CacheComponent';

import { getLegalDS } from './stores/legalDS';
import UploadModal from './components/UploadModal';
import { getErrorMsg, openChangeCompanyModal } from './utils';


import {
  fetchCompanyFromOcr,
  fetchPortal,
  updateLicenceUrl,
  fetchSettings,
} from '@/services/simplifiedRegisterService';
import { queryCompanyBasic } from '@/services/legalService';

import domesticEnterprises from '@/assets/icon-domestic-enterprises.svg';
import foreignEnterprises from '@/assets/icon-foreign-enterprises.svg';
import personalRegister from '@/assets/icon-personal-register.svg';

import styles from './index.less';

/**
 * 简化供应商注册
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['spfm.supplierRegister', 'spfm.enterprise', 'sslm.common'],
})
export default class SimplifiedRegister extends Component {
  legalDS = new DataSet({
    ...getLegalDS(),
  });

  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      personalFlag: false,
      queryBasicLoading: true,
      fetchPortalLoading: false,
      ocrFlag: false, // 平台征信配置是否开启OCR识别
    };
  }

  componentDidMount() {
    // 清空子页面的缓存
    deleteCache('/spfm/simplified-register/main-info');
    const {
      dispatch,
      location: { state: { _back } = {} },
    } = this.props;
    const { hostname } = window.location;
    queryCompanyBasic().then((res) => {
      if (getResponse(res)) {
        this.setState({
          companyInfo: res,
          queryBasicLoading: false,
        });
        if (!isEmpty(res)) {
          const { processStatus } = res;
          if (
            processStatus === 'SUBMIT' ||
            processStatus === 'COMPLETE' ||
            processStatus === 'APPROVING' ||
            processStatus === 'WFL_REJECT'
          ) {
            dispatch(
              routerRedux.push({
                pathname: `/spfm/simplified-register/result`,
              })
            );
          } else if (processStatus === 'REJECT' && _back !== -1) {
            // 点击子页面返回并且是拒绝可以重写注册，否则跳转到结果页
            dispatch(
              routerRedux.push({
                pathname: `/spfm/simplified-register/result`,
              })
            );
          } else {
            this.setState({
              fetchPortalLoading: true,
            });
            fetchPortal({ domainName: hostname })
              .then((resp) => {
                if (getResponse(resp)) {
                  if (resp && !isEmpty(resp.content)) {
                    const config = resp.content[0];
                    const { personalRegisterFlag } = config || {};
                    // 处理配置开票信息必填
                    this.setState({
                      personalFlag: !!personalRegisterFlag,
                    });
                  }
                }
              })
              .finally(() => {
                this.setState({
                  fetchPortalLoading: false,
                });
              });
          }
        } else {
          this.setState({
            fetchPortalLoading: true,
          });
          fetchPortal({ domainName: hostname })
            .then((resp) => {
              if (getResponse(resp)) {
                if (resp && !isEmpty(resp.content)) {
                  const config = resp.content[0];
                  const { personalRegisterFlag } = config || {};
                  // 处理配置开票信息必填
                  this.setState({
                    personalFlag: !!personalRegisterFlag,
                  });
                }
              }
            })
            .finally(() => {
              this.setState({
                fetchPortalLoading: false,
              });
            });
        }
      }
    });
    this.platformCreditConfig();
  }

  // 查询平台征信配置
  @Bind()
  platformCreditConfig() {
    fetchSettings().then((response) => {
      const res = getResponse(response);
      if (res) {
        this.setState({
          ocrFlag: res['000106'] === '1',
        });
      }
    });
  }

  /**
   *
   * @param {*} domesticFlag 境内/境外/个人
   * @param {*} manualFlag 手工录入 1 手工 0 自动识别
   */
  @Bind()
  handleJumpType(domesticFlag = 1, manualFlag = false) {
    if (manualFlag) {
      this.handleUpdateLicenceUrl(domesticFlag, manualFlag);
    } else {
      this.handleJump(domesticFlag, manualFlag);
    }
  }

  /**
   *
   * @param {*} domesticFlag 境内/境外/个人
   * @param {*} manualFlag 手工录入 1 手工 0 自动识别
   */
  @Bind()
  handleJump(domesticFlag = 1, manualFlag = false) {
    const { dispatch } = this.props;
    const { ocrFlag } = this.state;
    const commonPayload = {
      domesticFlag,
      ocrFlag: ocrFlag ? 1 : 0,
    };
    const payload =
      domesticFlag === 1
        ? {
            manualFlag: manualFlag ? 1 : 0,
            ...commonPayload,
          }
        : {
            ...commonPayload,
          };
    dispatch(
      routerRedux.push({
        pathname: `/spfm/simplified-register/main-info`,
        search: querystring.stringify(payload),
      })
    );
  }

  /**
   * @param {*} firstUploadFlag 区分是否首页上传附件
   */
  @Bind()
  openUploadModal() {
    const { companyInfo = {}, ocrFlag } = this.state;
    const { unifiedSocialCode } = companyInfo || {};
    // 境内统一社会信用代码有值不需要弹窗
    const showModal = isEmpty(companyInfo) || !unifiedSocialCode;
    if (showModal) {
      this.legalDS.create({});
      const dataProps = {
        ocrFlag,
        dataSet: this.legalDS,
        firstUploadFlag: true,
        handleJumpDetail: this.handleJumpType,
        handleOnOK: this.handleOnOK,
      };
      this.uploadModal = Modal.open({
        title: intl.get(`spfm.enterprise.view.message.businessLicense`).d('上传营业执照'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        closable: true,
        movable: false,
        style: { width: 560 },
        border: false,
        className: styles['register-attachment-modal'],
        children: <UploadModal {...dataProps} />,
        footer: (okBtn, cancelBtn) => (
          <div>
            {cancelBtn}
            <Button onClick={() => this.handleJumpType(1, true)}>
              {intl.get('spfm.supplierRegister.button.manualEntry').d('手工录入')}
            </Button>
            <Button type="primary" color="primary" onClick={this.handleOnOK} hidden={!ocrFlag}>
              {intl.get('spfm.supplierRegister.button.automatic').d('自动识别')}
            </Button>
          </div>
        ),
      });
    } else {
      // 直接跳转进详情页
      this.handleJump(1, true);
    }
  }

  // 处理自动识别名称重复
  @Bind()
  handleCompanyNameRepeat(resp) {
    if (resp) {
      // 是否需要前端弹窗提示报错
      const errorFieldName = getErrorMsg(resp.code);
      if (errorFieldName) {
        // 弹窗提示
        this.openModal(errorFieldName);
        return true;
      } else {
        // 其他报错正常抛出
        getResponse(resp);
      }
    }
  }

  @Bind()
  handleAppointError(res) {
    let resultObj = {
      checkFlag: false,
      result: res,
    };
    if(res && res.failed === true){
      resultObj = {
        result: false,
        checkFlag: this.handleCompanyNameRepeat(res),
      };
    }
    return resultObj;
  }

   // 弹窗提示报错信息
   @Bind()
   openModal(fieldName = '') {
     const params = {
       fieldName,
       callBack: () => {
        // 随便调用一个接口，触发退出登录
        queryCompanyBasic();
       },
     };
     openChangeCompanyModal(params);
   }

  /**
   * 处理自动识别
   * @param {Object} info - 上传的文件
   */
  @Bind()
  async handleOnOK() {
    let modalCloseFlag = false;
    const currentRecord = this.legalDS.current;
    const licenceUrlField = this.legalDS.getField('licenceUrl', currentRecord);
    const licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);
    if (!licenceUrlValidateFlag) {
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get('spfm.enterprise.view.message.upload.businessLicense')
          .d('请上传营业执照'),
      });
      return false;
    } else {
      this.handleModalUpdate(true);
      const url = currentRecord.get('licenceUrl');
      fetchCompanyFromOcr({ url })
        .then((res) => {
          if(!isEmpty(res)){
            // 处理特定报错
            const resultObj = this.handleAppointError(res);
            const { result, checkFlag } = resultObj;
            if (result) {
              this.handleModalUpdate(false);
              currentRecord.set({
                uploadFlag: true,
              });
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              modalCloseFlag = true;
              this.handleJumpType(1, false);
            }else if(checkFlag) {
              // 后端识别报错，前端保留图片
              currentRecord.set({
                uploadFlag: true,
              });
            }else {
              currentRecord.set({
                uploadFlag: false,
              });
            }
          } else {
            currentRecord.set({
              uploadFlag: false,
            });
          }
        })
        .finally(() => {
          this.handleModalUpdate(false);
        });
      return modalCloseFlag;
    }
  }

  @Bind()
  handleUpdateLicenceUrl(domesticFlag, manualFlag) {
    const { companyInfo = {} } = this.state;
    const { companyId, companyBasicId, objectVersionNumber } = companyInfo;
    const data = this.legalDS.current.toJSONData();
    const { licenceUrl } = data;
    if (licenceUrl) {
      const payload = {
        companyBasicId,
        companyId,
        objectVersionNumber,
        licenceUrl: licenceUrl || null,
      };
      updateLicenceUrl(payload).then((res) => {
        if (getResponse(res)) {
          this.handleJump(domesticFlag, manualFlag);
        }
      });
    } else {
      this.handleJump(domesticFlag, manualFlag);
    }
  }

  // 处理modal更新
  @Bind()
  handleModalUpdate(flag = false) {
    this.uploadModal.update({
      cancelProps: {
        loading: flag,
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          <Button onClick={() => this.handleJumpType(1, true)} loading={flag}>
            {intl.get('spfm.supplierRegister.button.manualEntry').d('手工录入')}
          </Button>
          <Button type="primary" color="primary" onClick={this.handleOnOK} loading={flag}>
            {intl.get('spfm.supplierRegister.button.automatic').d('自动识别')}
          </Button>
        </div>
      ),
    });
  }

  render() {
    const { personalFlag, queryBasicLoading, fetchPortalLoading } = this.state;
    const pageLoading = queryBasicLoading || fetchPortalLoading;
    const list = [
      {
        src: domesticEnterprises,
        title: intl.get('spfm.supplierRegister.view.title.domesticEnterprises').d('境内机构'),
        tips: intl
          .get('spfm.supplierRegister.view.message.domesticTips')
          .d('中国境内的企业，不含港澳台企业，境内企业可以上传营业执照，并通过OCR识别快速录入相关信息。'),
        onClick: this.openUploadModal,
      },
      {
        src: foreignEnterprises,
        title: intl.get('spfm.supplierRegister.view.title.foreignEnterprises').d('境外机构'),
        tips: intl
          .get('spfm.supplierRegister.view.message.foreignTips')
          .d('中国境外的企业，含港澳台企业，境外企业可以手工录入相关信息，上传合法经营证书。'),
        onClick: () => this.handleJumpType(0),
      },
      personalFlag && {
        src: personalRegister,
        title: intl.get('spfm.supplierRegister.view.title.personalRegister').d('个人注册'),
        tips: intl
          .get('spfm.supplierRegister.view.message.personalTips')
          .d(
            '使用身份证等有效证件进行注册，适用个人用户（非个体工商户和个人独资企业等），租户和账号归属于个人'
          ),
        onClick: () => this.handleJumpType(2),
      },
    ].filter(Boolean);
    return pageLoading ? (
      <Spin />
    ) : (
      <React.Fragment>
        <Header
          title={intl.get(`spfm.supplierRegister.view.title.supplierIdentify`).d('供应商认证')}
        />
        <Content>
          <div className={styles['register-index-title']}>
            {intl.get(`spfm.supplierRegister.view.title.supplierIdentify`).d('供应商认证')}
            <div>
              {personalFlag
                ? intl
                    .get(`spfm.supplierRegister.view.title.personalRegisterMsg`)
                    .d(
                      '企业主体请尽量避免使用个人注册方式，以免企业人员变动或交接引起不必要的纠纷。'
                    )
                : intl
                    .get(`spfm.supplierRegister.view.title.noPersonalRegister`)
                    .d(
                      '请根据企业登记所在地选择合适的入口进入页面维护信息，以便于进行对企业信息的校验。'
                    )}
            </div>
          </div>
          <Row gutter={20} type="flex" justify="center" className={styles['register-index-row']}>
            {list.map((n) => {
              return (
                <Col span={6}>
                  <Card onClick={n.onClick}>
                    <div className={styles['register-index-card']}>
                      <div>
                        <img src={n.src} alt="" />
                      </div>
                      <div>{n.title}</div>
                      <div>{n.tips}</div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Content>
      </React.Fragment>
    );
  }
}
