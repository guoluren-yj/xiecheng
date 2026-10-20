/**
 * 企业信息
 * @date: 2018-8-13
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { getAttachmentUrl, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { sum, round } from 'lodash';
import { Row, Col, Spin, Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
// import Upload from 'srm-front-boot/lib/components/Upload/index';
// import UploadModal from 'components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from './index.less';
import ImgPreview from './ImgPreview';

const bucketDirectory = 'spfm-comp';
// const CheckboxGroup = Checkbox.Group;
const language = getCurrentLanguage();

/**
 * 企业信息
 * @extends {Component} - PureComponent
 * @return React.element
 */

export default class CompanyInformation extends PureComponent {
  setCheckboxGroupValues = (data = []) =>
    data.map((n) => (n.enabledFlag === 1 ? n.key : undefined));

  /**
   * 下载公司logo或者营业执照图片url
   * @param {string} url 公司logo或者营业执照图片url
   */
  @Bind()
  showUrlImgFun(url) {
    const imgUrl = getAttachmentUrl(
      url,
      PRIVATE_BUCKET,
      getCurrentOrganizationId(),
      bucketDirectory
    );
    window.open(imgUrl);
  }

  /**
   * onCell
   * @param {number} maxWidth - 单元格最大宽度
   */
  onCell(maxWidth) {
    return {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: maxWidth || 180,
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const { companyInformation, companyLoading, searchSupplierRemote } = this.props;
    const {
      companyName,
      companyTypeMeaning,
      institutionalTypeMeaning,
      registeredCountryName,
      registeredRegionName,
      addressDetail,
      legalRepName,
      registeredCapital,
      currencyName,
      licenceEndDate,
      buildDate,
      companyNum,
      longTermFlag,
      businessScope,
      domesticForeignRelation,
      // shortName,
      dunsCode,
      organizingInstitutionCode,
      unifiedSocialCode,
      businessRegistrationNumber,
      taxpayerTypeMeaning,
      // licenceUrl,
      industryList = [],
      industryCategoryList = [],
      // saleFlag,
      // purchaseFlag,
      manufacturerFlag,
      traderFlag,
      servicerFlag,
      dealerFlag,
      agentFlag,
      website,
      description,
      logoUrl,
      contactList = [],
      // attachmentList = [],
      integrationFlag,
      contractorFlag,
      phone,
      internationalTelMeaning,
      email,
      regionPathName,
    } = companyInformation;
    const renderProps = { companyInformation };
    // const mainIdentityList = [
    //   saleFlag === 1 ? intl.get(`spfm.enterprise.view.message.sale`).d('我要销售') : false,
    //   purchaseFlag === 1 ? intl.get(`spfm.enterprise.view.message.purchase`).d('我要采购') : false,
    // ];
    const businessNatureList = [
      manufacturerFlag === 1
        ? intl.get(`spfm.enterprise.view.message.manufacturer`).d('制造商')
        : false,
      traderFlag === 1 ? intl.get(`spfm.enterprise.view.message.trader`).d('贸易商') : false,
      servicerFlag === 1 ? intl.get(`spfm.enterprise.view.message.servicer`).d('服务商') : false,
      agentFlag === 1 ? intl.get(`spfm.enterprise.view.message.agent`).d('代理商') : false,
      integrationFlag === 1
        ? intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商')
        : false,
      contractorFlag === 1
        ? intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商')
        : false,
      dealerFlag === 1
      ? intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商')
      : false,
    ];
    const contactTableProps = {
      columns: [
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.name').d('姓名'),
          align: 'left',
          dataIndex: 'name',
          width: 120,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.gender').d('性别'),
          align: 'left',
          dataIndex: 'gender',
          width: 60,
          render: (text) =>
            text === 1
              ? intl.get('hzero.common.gender.male').d('男')
              : text === 0
              ? intl.get('hzero.common.gender.female').d('女')
              : null,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.mail').d('邮箱'),
          dataIndex: 'mail',
          align: 'left',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.contactTable.mobilephone')
            .d('手机号码'),
          align: 'left',
          width: 200,
          dataIndex: 'mobilephone',
          render: (text, record) => `${record.internationalTelMeaning} | ${text}`,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.telephone').d('固定电话'),
          align: 'left',
          dataIndex: 'telephone',
          width: 120,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.department').d('部门'),
          dataIndex: 'department',
          width: 150,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.position').d('职位'),
          dataIndex: 'position',
          width: 150,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get('hzero.common.remark').d('备注'),
          dataIndex: 'description',
          width: 180,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.contactTable.defaultFlag')
            .d('默认联系人'),
          align: 'left',
          dataIndex: 'defaultFlag',
          width: 140,
          render: (text) => yesOrNoRender(text),
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          align: 'left',
          dataIndex: 'enabledFlag',
          width: 90,
          render: (text) => yesOrNoRender(text),
        },
      ],
      pagination: false,
      dataSource: contactList,
      bordered: true,
      rowKey: 'companyContactId',
    };
    contactTableProps.scroll = { x: sum(contactTableProps.columns.map((n) => n.width)) };

    // const attachmentTableProps = {
    //   columns: [
    //     {
    //       title: intl.get('entity.attachment.type').d('附件类型'),
    //       align: 'left',
    //       width: 120,
    //       dataIndex: 'attachmentTypeMeaning',
    //       render: (_, recordData) => {
    //         if (recordData.attachmentTypeMeaning && recordData.subAttachmentMeaning) {
    //           return (
    //             <span>{`${recordData.attachmentTypeMeaning} / ${recordData.subAttachmentMeaning}`}</span>
    //           );
    //         } else {
    //           return (
    //             <span>{recordData.attachmentTypeMeaning || recordData.subAttachmentMeaning}</span>
    //           );
    //         }
    //       },
    //     },
    //     {
    //       title: intl.get('entity.attachment.description').d('附件描述'),
    //       dataIndex: 'description',
    //       width: 180,
    //       onCell: this.onCell,
    //     },
    //     {
    //       title: intl
    //         .get('spfm.certificationApproval.model.attachmentTable.endDate')
    //         .d('文件到期日'),
    //       align: 'left',
    //       dataIndex: 'endDate',
    //       width: 120,
    //     },
    //     {
    //       title: intl
    //         .get('spfm.certificationApproval.model.attachmentTable.uploadDate')
    //         .d('最后上传时间'),
    //       align: 'left',
    //       dataIndex: 'uploadDate',
    //       width: 140,
    //     },
    //     {
    //       title: intl
    //         .get('spfm.certificationApproval.model.attachmentTable.attachment')
    //         .d('附件上传'),
    //       align: 'left',
    //       dataIndex: 'attachmentUrl',
    //       width: 140,
    //       render: (text, rowData) => (
    //         // <UploadModal
    //         //   attachmentUUID={rowData.attachmentUuid}
    //         //   viewOnly
    //         //   filesNumber={rowData.attachmentCount}
    //         //   bucketName={PRIVATE_BUCKET}
    //         //   bucketDirectory="spfm-comp"
    //         // />
    //         <Upload
    //           filePreview
    //           attachmentUUID={rowData.attachmentUuid}
    //           viewOnly
    //           filesNumber={rowData.attachmentCount}
    //           bucketName={PRIVATE_BUCKET}
    //           bucketDirectory="spfm-comp"
    //         />
    //       ),
    //     },
    //     {
    //       title: intl.get('hzero.common.remark').d('备注'),
    //       dataIndex: 'remark',
    //       width: 200,
    //       onCell: this.onCell,
    //     },
    //   ],
    //   pagination: false,
    //   dataSource: attachmentList,
    //   bordered: true,
    //   rowKey: 'companyAttachmentId',
    // };

    const formatValue =
      language === 'en_US'
        ? registeredCapital
          ? round(registeredCapital / 100, 8)
          : registeredCapital
        : registeredCapital;

    return (
      <Spin spinning={companyLoading}>
        <div className={styles['information-container']}>
          <div className={styles['information-title']}>
            {intl.get(`spfm.enterprise.view.message.registerInfo`).d('登记信息')}
          </div>
          {domesticForeignRelation === 2 && (
            <>
              <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                <Col md={8}>
                  <Row>
                    <Col md={9} className={styles['information-item-label']}>
                      {intl.get('spfm.enterprise.model.legal.name').d('姓名')}:
                    </Col>
                    <Col md={15}>{companyName}</Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl
                        .get(`spfm.certificationApproval.model.contactTable.mobilephone`)
                        .d('手机号码')}
                      :
                    </Col>
                    <Col span={15}>
                      {internationalTelMeaning} ｜ {phone}
                    </Col>
                  </Row>
                </Col>
                <Col md={8}>
                  <Row>
                    <Col md={9} className={styles['information-item-label']}>
                      {intl.get('spfm.enterprise.model.legal.mail').d('邮箱')}:
                    </Col>
                    <Col md={15}>{email}</Col>
                  </Row>
                </Col>
              </Row>
              <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl
                        .get(`spfm.enterprise.view.message.registeredCountryRegion`)
                        .d('注册国家/地区')}
                      :
                    </Col>
                    <Col span={15}>{registeredCountryName}</Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('spfm.enterprise.model.legal.registeredRegionId').d('省市地址')}:
                    </Col>
                    <Col span={15}>{regionPathName}</Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`spfm.supplierRegister.model.legal.contactDetail`).d('联系地址')}:
                    </Col>
                    <Col span={15}>{addressDetail}</Col>
                  </Row>
                </Col>
              </Row>
            </>
          )}
          {domesticForeignRelation !== 2 && (
            <>
              <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                <Col md={8}>
                  <Row>
                    <Col md={9} className={styles['information-item-label']}>
                      {intl.get('entity.company.companyName').d('公司名称')}:
                    </Col>
                    <Col md={15}>{companyName}</Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`spfm.disposeInvite.view.message.companyNum`).d('公司编码')}:
                    </Col>
                    <Col span={15}>{companyNum}</Col>
                  </Row>
                </Col>
                <Col md={8}>
                  {domesticForeignRelation === 1 && (
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get('spfm.enterprise.model.legal.unifiedSocialCode')
                          .d('统一社会信用代码号')}
                        :
                      </Col>
                      <Col md={15}>{unifiedSocialCode}</Col>
                    </Row>
                  )}
                  {domesticForeignRelation === 0 && (
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get('spfm.enterprise.model.legal.businessRegistrationNumber')
                          .d('商业注册登记号/税号')}
                        :
                      </Col>
                      <Col md={15}>{businessRegistrationNumber}</Col>
                    </Row>
                  )}
                </Col>
              </Row>
              <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                {domesticForeignRelation === 1 && (
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get('spfm.enterprise.model.legal.organizingInstitutionCode')
                          .d('组织机构代码')}
                        :
                      </Col>
                      <Col md={15}>{organizingInstitutionCode}</Col>
                    </Row>
                  </Col>
                )}
                <Col md={8}>
                  <Row>
                    <Col md={9} className={styles['information-item-label']}>
                      {intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码')}:
                    </Col>
                    <Col md={15}>{dunsCode}</Col>
                  </Row>
                </Col>
                {domesticForeignRelation === 1 && (
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl.get('spfm.enterprise.model.legal.institutionalType').d('机构类型')}:
                      </Col>
                      <Col md={15}>{institutionalTypeMeaning}</Col>
                    </Row>
                  </Col>
                )}
                {domesticForeignRelation === 0 && (
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get(`spfm.enterprise.view.message.registeredCountryName`)
                          .d('注册国家')}
                        :
                      </Col>
                      <Col md={15}>{registeredCountryName}</Col>
                    </Row>
                  </Col>
                )}
                {domesticForeignRelation === 0 && (
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get(`spfm.enterprise.view.message.registeredRegionName`)
                          .d('注册地址')}
                        :
                      </Col>
                      <Col md={15}>
                        {registeredRegionName}
                        {addressDetail}
                      </Col>
                    </Row>
                  </Col>
                )}
              </Row>
              {domesticForeignRelation === 1 && (
                <Row
                  className={styles['information-item']}
                  type="flex"
                  justify="space-between"
                  align="bottom"
                >
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl.get(`spfm.enterprise.view.message.companyTypeMeaning`).d('公司类型')}:
                      </Col>
                      <Col md={15}>{companyTypeMeaning}</Col>
                    </Row>
                  </Col>
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get(`spfm.enterprise.view.message.registeredCountryName`)
                          .d('注册国家')}
                        :
                      </Col>
                      <Col md={15}>{registeredCountryName}</Col>
                    </Row>
                  </Col>
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get(`spfm.enterprise.view.message.registeredRegionName`)
                          .d('注册地址')}
                        :
                      </Col>
                      <Col md={15}>
                        {registeredRegionName}
                        {addressDetail}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
              <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                <Col md={8}>
                  <Row>
                    <Col md={9} className={styles['information-item-label']}>
                      {intl.get(`spfm.enterprise.view.message.legalRepName`).d('法定代表人')}:
                    </Col>
                    <Col md={15}>{legalRepName}</Col>
                  </Row>
                </Col>
                {domesticForeignRelation === 1 && (
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl
                          .get(`spfm.enterprise.view.message.taxpayerTypeMeaning`)
                          .d('纳税人标识')}
                        :
                      </Col>
                      <Col md={15}>{taxpayerTypeMeaning}</Col>
                    </Row>
                  </Col>
                )}
                <Col md={8}>
                  <Row>
                    <Col md={9} className={styles['information-item-label']}>
                      {intl.get(`spfm.companySearch.model.company.capitalRange`).d('注册资本')}:
                    </Col>
                    <Col md={15}>
                      {`${
                        registeredCapital === undefined
                          ? intl.get('hzero.common.currency.none').d('无')
                          : `${formatValue}${
                              currencyName || intl.get('hzero.common.currency.cny').d('人民币')
                            }(${intl.get(`spfm.common.currency.ten.thousand`).d('万')})`
                      }`}
                    </Col>
                  </Row>
                </Col>
                {domesticForeignRelation === 0 && (
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl.get(`spfm.enterprise.view.message.buildDate`).d('成立日期')}:
                      </Col>
                      <Col md={15}>{dateRender(buildDate)}</Col>
                    </Row>
                  </Col>
                )}
              </Row>
              {domesticForeignRelation === 1 && (
                <Row className={styles['information-item']} type="flex" align="bottom">
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl.get(`spfm.enterprise.view.message.buildDate`).d('成立日期')}:
                      </Col>
                      <Col md={15}>{dateRender(buildDate)}</Col>
                    </Row>
                  </Col>
                  <Col md={8}>
                    <Row>
                      <Col md={9} className={styles['information-item-label']}>
                        {intl.get(`spfm.enterprise.view.message.licenceEndDate`).d('营业期限')}:
                      </Col>
                      <Col md={15}>
                        {longTermFlag === 1
                          ? intl.get(`spfm.enterprise.view.message.longTerm`).d('长期')
                          : dateRender(licenceEndDate)}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
              {/* <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                <Col md={24}>
                  <Row>
                    <Col md={3} className={styles['information-item-label']}>
                      {intl.get('spfm.supplierRegister.view.option.businessLicense').d('营业执照')}:
                    </Col>
                    <Col md={21}>
                      <ImgPreview
                        title={intl
                          .get('spfm.certificationApproval.model.detailForm.licenceUrl')
                          .d('营业执照扫描件')}
                        url={licenceUrl}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row> */}
              <Row
                className={styles['information-item']}
                type="flex"
                justify="space-between"
                align="bottom"
              >
                <Col md={24}>
                  <Row>
                    <Col md={3} className={styles['information-item-label']}>
                      {intl.get(`spfm.enterprise.view.message.businessScope`).d('经营范围')}:
                    </Col>
                    <Col md={21}>{businessScope}</Col>
                  </Row>
                </Col>
              </Row>
            </>
          )}
          <div className={styles['information-title']}>
            {intl.get(`spfm.enterprise.view.message.business`).d('基础业务信息')}
          </div>
          <Row className={styles['information-item']} type="flex" align="bottom">
            <Col md={8}>
              <Row>
                <Col md={9} className={styles['information-item-label']}>
                  {intl.get(`spfm.enterprise.view.message.businessNature`).d('经营性质')}:
                </Col>
                <Col md={15}>{businessNatureList.filter((n) => n).join('/')}</Col>
              </Row>
            </Col>
          </Row>
          <Row
            className={styles['information-item']}
            type="flex"
            justify="space-between"
            align="middle"
          >
            <Col md={24}>
              <Row>
                <Col md={3} className={styles['information-item-label']}>
                  {intl.get(`spfm.enterprise.view.message.industryType`).d('行业类型')}:
                </Col>
                <Col md={21}>
                  {industryList.map((n, index) => {
                    if (index === 0) {
                      return <span key={n.industryId}>{n.industryName}</span>;
                    } else {
                      return <span key={n.industryId}>/{n.industryName}</span>;
                    }
                  })}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            className={styles['information-item']}
            type="flex"
            justify="space-between"
            align="middle"
          >
            <Col md={24}>
              <Row>
                <Col md={3} className={styles['information-item-label']}>
                  {intl.get(`spfm.enterprise.view.message.mainCategory`).d('主营品类')}:
                </Col>
                <Col md={21}>
                  {industryCategoryList.map((n, index) => {
                    if (index === 0) {
                      return <span key={n.categoryId}>{n.categoryName}</span>;
                    } else {
                      return <span key={n.categoryId}>/{n.categoryName}</span>;
                    }
                  })}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles['information-item']} type="flex" align="bottom">
            <Col md={8}>
              <Row>
                <Col md={9} className={styles['information-item-label']}>
                  {intl.get(`spfm.enterprise.view.message.website`).d('公司官网')}
                </Col>
                <Col md={15}>{website}</Col>
              </Row>
            </Col>
            <Col md={8}>
              <Row>
                <Col md={9} className={styles['information-item-label']}>
                  {intl.get('spfm.enterprise.view.message.logo').d('公司 Logo')}:
                </Col>
                <Col md={15}>
                  <ImgPreview
                    title={intl.get(`spfm.enterprise.view.message.logo`).d('公司logo')}
                    url={logoUrl}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            className={styles['information-item']}
            type="flex"
            justify="space-between"
            align="middle"
          >
            <Col md={24}>
              <Row>
                <Col md={3} className={styles['information-item-label']}>
                  {intl.get(`spfm.enterprise.view.message.description`).d('公司简介')}:
                </Col>
                <Col md={21}>{description}</Col>
              </Row>
            </Col>
          </Row>
          <div className={styles['information-title']}>
            {intl.get(`spfm.enterprise.view.message.contact`).d('联系人信息')}
          </div>
          <Table {...contactTableProps} />
          {/* <div className={styles['information-title']}>
            {intl.get(`spfm.enterprise.view.message.attachment`).d('附件信息')}
          </div>
          <Table {...attachmentTableProps} /> */}
          {searchSupplierRemote &&
            searchSupplierRemote.render(
              'SSLM_COMPANY_SEARCH_SUPPLIER.COMPANY_INFO_MODAL',
              <></>,
              renderProps
            )}
        </div>
      </Spin>
    );
  }
}
