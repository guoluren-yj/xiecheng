import React, { useEffect, useState } from 'react';
import {
  Form,
  TextField,
  Select,
  Output,
  Lov,
  TextArea,
  DatePicker,
  CheckBox,
  Icon,
  Modal,
  Button,
  notification,
  IntlField,
  Spin,
  TelField,
} from 'choerodon-ui/pro';

import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';

import '@/routes/index.less';
import FormField from '@/routes/components/FormField';

import { fetchCompanyFromOcr } from '@/services/supplierEntryService';
import { updateLicenceUrl } from '@/services/enterpriseInformService';

// 境内示例
import registerBusinessLicense from '@/assets/icon-register-business-license.png';
// 个人
import portraitFace from '@/assets/icon-register-personal-face.png';
import nationalEmblem from '@/assets/icon-register-personal-national.png';
import styles from './index.less';
import FileCardByUuid from './components/FileCardByUuid';
import UploadCard from './components/UploadCard';
import UploadModal from './components/UploadModal';

const CompanyBaseInfo = observer(
  ({
    dataSet,
    isEdit,
    disabledObj,
    changeReqId,
    customizeForm,
    customizeUnitCode = '',
    custLoading,
    licenseFormcode = '',
  }) => {
    const currentRecord = dataSet?.current;
    const domesticForeignRelation = currentRecord?.get('domesticForeignRelation');
    const companyTypeVaisable = currentRecord?.get('institutionalType') === 'ICBC';
    const [idNumVisable, setIdNumVisable] = useState(currentRecord?.get('idType') === 'I');
    const { allDisabled } = disabledObj;
    const disabled = allDisabled;
    const fileEditFlag = isEdit && !disabled; // 附件可编辑

    let uploadModal;

    // 境外：0 境内：1 个人：2
    // domesticFlag true(境内和个人注册) false(境外注册)
    const domesticFlag = Number(domesticForeignRelation);
    // 个人注册
    const personalFlag = domesticFlag === 2;

    // 境外附件显示
    const uploadCardVisable = personalFlag ? false : !domesticFlag;
    // 境内
    const domesticVisable = personalFlag ? false : domesticFlag;
    // 境外和个人注册字段隐藏
    const fieldHidden = !domesticFlag || personalFlag;

    const chinaFlag = currentRecord?.get('registeredCountryCode') === 'CN';

    // 处理modal更新
    const handleModalUpdate = (flag = false) => {
      uploadModal.update({
        cancelProps: {
          loading: flag,
        },
        footer: (_okBtn, cancelBtn) => (
          <div>
            {cancelBtn}
            <Button
              loading={flag}
              onClick={() => {
                uploadModal.close();
              }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button type="primary" color="primary" onClick={handleOnOK} loading={flag}>
              {intl.get('sslm.supplierEntryDetail.button.automatic').d('自动识别')}
            </Button>
          </div>
        ),
      });
    };

    const handleOnOK = async () => {
      // ocr识别
      const licenceUrlField = dataSet.getField('licenceUrl', currentRecord);
      const licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);
      if (!licenceUrlValidateFlag) {
        notification.error({
          placement: 'bottomRight',
          message: intl
            .get('spfm.enterprise.view.message.upload.businessLicense')
            .d('请上传营业执照'),
        });
      } else {
        handleModalUpdate(true);
        const url = currentRecord.get('licenceUrl');
        fetchCompanyFromOcr({ url })
          .then(res => {
            if (getResponse(res)) {
              // 重新查询
              // handleQueryLegalInfo(true);
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              uploadModal.close();
            } else {
              currentRecord.set({
                uploadFlag: false,
              });
            }
          })
          .finally(() => {
            handleModalUpdate(false);
          });
      }
    };

    const openUploadModal = () => {
      const dataProps = {
        dataSet,
        changeReqId,
        handleOnOK,
      };
      uploadModal = Modal.open({
        title: intl.get(`sslm.supplierEntryDetail.view.message.businessLicense`).d('上传营业执照'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        closable: true,
        style: { width: 560 },
        movable: false,
        border: false,
        className: styles['register-attachment-modal'],
        children: <UploadModal {...dataProps} />,
        footer: (_okBtn, cancelBtn) => {
          return (
            <div>
              {cancelBtn}
              <Button
                type="primary"
                color="primary"
                onClick={() => {
                  uploadModal.close();
                }}
              >
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
              {/* <Button type="primary" color="primary" onClick={handleOnOK}>
              {intl.get('sslm.supplierEntryDetail.button.automatic').d('自动识别')}
            </Button> */}
            </div>
          );
        },
        afterClose: () => {
          // 更新营业执照
        },
      });
    };

    const handleUpdateLicenceUrl = () => {
      const data = dataSet.current.toJSONData();
      const { licenceUrl } = data;
      const payload = {
        changeReqId,
        licenceUrl: licenceUrl || null,
        dataSource: 3,
        isPlatformFlag: true,
      };
      updateLicenceUrl(payload).then(res => {
        if (getResponse(res)) {
          const { objectVersionNumber: newObjectVersionNumber } = res;
          if (newObjectVersionNumber) {
            dataSet.current.set({
              objectVersionNumber: newObjectVersionNumber,
            });
          }
        }
      });
      // }
    };

    const onUploadRemove = () => {
      dataSet.current.set({
        licenceUrl: null,
        uploadFlag: true,
      });
      handleUpdateLicenceUrl();
    };

    const onUploadSuccess = response => {
      dataSet.current.set({
        licenceUrl: response,
        uploadFlag: true,
      });
      handleUpdateLicenceUrl();
    };

    useEffect(() => {
      setIdNumVisable(currentRecord?.get('idType') === 'I');
    }, [currentRecord]);

    // 渲染境内营业执照
    const renderDomesticLicence = record => {
      if (isEmpty(record)) {
        return null;
      }
      const licenceUrl = isEmpty(record) ? undefined : record.get('licenceUrl');
      const licenceFilename = isEmpty(record) ? undefined : record.get('licenceFilename');
      return fileEditFlag && !licenceUrl ? (
        <div>
          <div className={styles['domestic-attachment-card']} onClick={openUploadModal}>
            <Icon
              type="add"
              style={{
                color: 'rgba(0,0,0,0.25)',
                fontSize: 28,
              }}
            />
            <div className={styles['domestic-attachment-label']}>
              {intl.get('sslm.supplierEntryDetail.view.message.businessLicense').d('上传营业执照')}
            </div>
          </div>
        </div>
      ) : (
        <UploadCard
          fileName={licenceFilename}
          fileUrl={licenceUrl}
          onUploadRemove={onUploadRemove}
          accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
          label={intl
            .get('sslm.supplierEntryDetail.view.message.businessLicense')
            .d('上传营业执照')}
          viewOnly={!fileEditFlag}
          enableImageWatermark={1}
        />
      );
    };

    // 渲染境外营业执照
    const renderAbroadLicence = record => {
      if (isEmpty(record)) {
        return null;
      }
      const licenceUrl = isEmpty(record) ? undefined : record.get('licenceUrl');
      const licenceFilename = isEmpty(record) ? undefined : record.get('licenceFilename');
      return (
        <UploadCard
          fileName={licenceFilename}
          fileUrl={licenceUrl}
          onUploadSuccess={onUploadSuccess}
          onUploadRemove={onUploadRemove}
          accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
          label={intl
            .get('sslm.supplierEntryDetail.view.title.uploadEnterpriseCertificate')
            .d('上传企业注册证书')}
          viewOnly={!fileEditFlag}
          enableImageWatermark={1}
        />
      );
    };

    return (
      <Spin dataSet={dataSet}>
        <div className={styles['legal-basic-form']}>
          {customizeForm(
            {
              code: customizeUnitCode,
              enableCreate: false,
              readOnly: disabled || !isEdit,
              enableReLoad: false,
            },
            <Form
              dataSet={dataSet}
              disabled={disabled}
              columns={2}
              custLoading={custLoading}
              labelLayout={isEdit ? 'float' : 'vertical'}
              className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
              style={{
                width: '50%',
                maxWidth: 1172,
              }}
            >
              {isEdit ? <Select name="certificationType" /> : <Output name="certificationType" />}
              {isEdit ? (
                <Select name="domesticForeignRelation" hidden={isEdit} />
              ) : (
                <Output
                  name="domesticForeignRelation"
                  hidden={Boolean(dataSet?.current?.get('certificationRegionId'))}
                />
              )}
              {isEdit ? (
                <Lov
                  name="certificationRegionId"
                  hidden={dataSet?.current?.get('certificationType') === '2'}
                />
              ) : (
                <Output
                  name="certificationRegionId"
                  hidden={
                    dataSet?.current?.get('certificationType') === '2' ||
                    !dataSet?.current?.get('certificationRegionId')
                  }
                />
              )}
              {isEdit ? (
                <IntlField name="companyName" disabled={!isEdit} />
              ) : (
                <Output name="companyName" />
              )}
              {isEdit ? (
                <TextField name="unifiedSocialCode" hidden={fieldHidden} disabled={!isEdit} />
              ) : (
                <Output name="unifiedSocialCode" hidden={fieldHidden} />
              )}
              {isEdit ? (
                <TextField name="dunsCode" hidden={personalFlag} disabled={!isEdit} />
              ) : (
                <Output name="dunsCode" hidden={personalFlag} />
              )}
              {isEdit ? (
                <TextField
                  name="businessRegistrationNumber"
                  hidden={domesticFlag || personalFlag}
                  disabled={!isEdit}
                />
              ) : (
                <Output name="businessRegistrationNumber" hidden={domesticFlag || personalFlag} />
              )}
              {isEdit ? (
                <Select name="institutionalType" hidden={fieldHidden} disabled={!isEdit} />
              ) : (
                <Output name="institutionalType" hidden={fieldHidden} />
              )}
              {isEdit ? (
                <Select name="companyType" hidden={fieldHidden || !companyTypeVaisable} />
              ) : (
                <Output name="companyType" hidden={fieldHidden || !companyTypeVaisable} />
              )}
              {isEdit ? (
                <Select name="taxpayerType" hidden={fieldHidden} disabled={!isEdit} />
              ) : (
                <Output name="taxpayerType" hidden={fieldHidden} />
              )}
              {isEdit ? (
                <Lov
                  name="registeredCountryObj"
                  disabled={!isEdit}
                  clearButton={false}
                  onChange={countryObj => {
                    const { countryCode: newCountryCode } = countryObj || {};
                    currentRecord.set({
                      regionPathName: undefined,
                      registeredRegionId: undefined,
                    });
                    if (newCountryCode === 'CN') {
                      currentRecord.set({
                        idType: 'I',
                        passport: undefined,
                      });
                      setIdNumVisable(true);
                    } else {
                      const currentIdType = currentRecord.get('idType');
                      setIdNumVisable(currentIdType === 'I');
                    }
                  }}
                />
              ) : (
                <Output name="registeredCountryObj" />
              )}
              <FormField
                isEdit={isEdit}
                name="regionPathName"
                record={dataSet?.current}
                componentType="REGIONCASCADE"
                regionAlias="registeredRegionId"
                countryAlias="registeredCountryId"
                hidden={!chinaFlag}
              />
              {isEdit ? (
                <Select
                  name="idType"
                  hidden={!personalFlag}
                  onChange={value => {
                    if (value === 'I') {
                      currentRecord.set({
                        passport: undefined,
                      });
                    } else {
                      currentRecord.set({
                        idNum: undefined,
                      });
                    }
                    setIdNumVisable(value === 'I');
                  }}
                />
              ) : (
                <Output name="idType" hidden={!personalFlag} />
              )}
              {isEdit ? (
                <TextField name="idNum" hidden={!(personalFlag && idNumVisable)} />
              ) : (
                <Output name="idNum" hidden={!(personalFlag && idNumVisable)} />
              )}
              {isEdit ? (
                <TextField
                  name="passport"
                  hidden={!(personalFlag && !(personalFlag && idNumVisable))}
                  restrict="A-Z,0-9"
                />
              ) : (
                <Output
                  name="passport"
                  hidden={!(personalFlag && !(personalFlag && idNumVisable))}
                />
              )}
              {isEdit ? (
                <DatePicker name="buildDate" disabled={!isEdit} hidden={!personalFlag} />
              ) : (
                <Output name="buildDate" hidden={!personalFlag} />
              )}
              {isEdit ? (
                <DatePicker name="licenceEndDate" hidden={!personalFlag} newLine={personalFlag} />
              ) : (
                <Output name="licenceEndDate" hidden={!personalFlag} newLine={personalFlag} />
              )}
              {isEdit ? (
                <CheckBox
                  name="longTermFlag"
                  hidden={!personalFlag}
                  onChange={value => {
                    if (value) {
                      dataSet.current.set('licenceEndDate', undefined);
                    }
                  }}
                  disabled={!isEdit}
                />
              ) : (
                <Output
                  name="longTermFlag"
                  hidden={!personalFlag}
                  renderer={({ value }) => yesOrNoRender(value)}
                />
              )}
              {isEdit ? (
                <TelField name="phone" hidden={!personalFlag} />
              ) : (
                <Output name="phone" hidden={!personalFlag} />
              )}
              {isEdit ? (
                <TextField name="email" hidden={!personalFlag} />
              ) : (
                <Output name="email" hidden={!personalFlag} />
              )}
              {isEdit ? (
                <IntlField colSpan={2} name="addressDetail" newLine disabled={!isEdit} />
              ) : (
                <Output colSpan={2} name="addressDetail" newLine />
              )}
              {isEdit ? (
                <IntlField name="legalRepName" disabled={!isEdit} hidden={personalFlag} />
              ) : (
                <Output name="legalRepName" disabled={!isEdit} hidden={personalFlag} />
              )}
              {isEdit ? (
                <TextField name="registeredCapital" disabled={!isEdit} hidden={personalFlag} />
              ) : (
                <Output name="registeredCapital" hidden={personalFlag} />
              )}
              {isEdit ? (
                <Lov name="currencyObj" disabled={!isEdit} hidden={personalFlag} />
              ) : (
                <Output name="currencyObj" hidden={personalFlag} />
              )}
              {isEdit ? (
                <DatePicker name="buildDate" disabled={!isEdit} hidden={personalFlag} />
              ) : (
                <Output name="buildDate" hidden={personalFlag} />
              )}
              {isEdit ? (
                <DatePicker name="licenceEndDate" hidden={fieldHidden} />
              ) : (
                <Output name="licenceEndDate" hidden={fieldHidden} />
              )}
              {isEdit ? (
                <CheckBox
                  name="longTermFlag"
                  hidden={fieldHidden}
                  onChange={value => {
                    if (value) {
                      dataSet.current.set('licenceEndDate', undefined);
                    }
                  }}
                  disabled={!isEdit}
                />
              ) : (
                <Output
                  name="longTermFlag"
                  hidden={fieldHidden}
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
              )}
              {isEdit ? (
                <TextArea
                  colSpan={2}
                  newLine
                  name="businessScope"
                  disabled={!isEdit}
                  hidden={personalFlag}
                  resize="both"
                />
              ) : (
                <Output colSpan={2} newLine name="businessScope" hidden={personalFlag} />
              )}
              <FormField isEdit={isEdit} name="localName" hidden={personalFlag} />
              <FormField isEdit={isEdit} name="localAddress" hidden={personalFlag} />
            </Form>
          )}
          {customizeForm(
            {
              code: licenseFormcode,
              enableCreate: false,
              readOnly: true,
              enableReLoad: false,
            },
            <Form
              dataSet={dataSet}
              columns={2}
              labelLayout={fileEditFlag ? 'float' : 'vertical'}
              className={styles['legal-basic-form-second']}
              labelWidth={50}
              style={{
                width: 400,
              }}
            >
              {/* 境内/外附件 */}
              <Output
                name="licenceUrl"
                hidden={personalFlag}
                className={styles['legal-basic-licence-url']}
                renderer={({ record = {} }) => {
                  return domesticVisable
                    ? renderDomesticLicence(record)
                    : uploadCardVisable
                    ? renderAbroadLicence(record)
                    : null;
                }}
              />
              <Output
                name="licenceExample"
                hidden={!(fileEditFlag && domesticFlag && !personalFlag)}
                renderer={() => {
                  return (
                    <div className={styles['register-business-license']}>
                      <div>
                        {intl.get('sslm.supplierEntryDetail.view.title.example').d('示例')}：
                      </div>
                      <img
                        src={registerBusinessLicense}
                        alt={intl
                          .get(`sslm.supplierEntryDetail.view.option.businessLicense`)
                          .d('营业执照')}
                      />
                    </div>
                  );
                }}
              />
              {/* 个人身份证 */}
              <Output
                name="idBackUuid"
                hidden={!personalFlag}
                newLine={!(personalFlag && fileEditFlag)}
                className={styles['legal-basic-licence-url']}
                renderer={({ record = {} }) => {
                  const idBackUuid = isEmpty(record) ? undefined : record.get('idBackUuid');
                  return (
                    <FileCardByUuid
                      record={record}
                      label={intl
                        .get('sslm.supplierEntryDetail.view.title.portraitFace')
                        .d('身份证人像面')}
                      uuid={idBackUuid}
                      viewOnly={!fileEditFlag}
                      fieldName="idBackUuid"
                      enableImageWatermark={1}
                    />
                  );
                }}
              />
              <Output
                name="portraitFace"
                hidden={!(personalFlag && fileEditFlag)}
                renderer={() => {
                  return (
                    <div className={styles['register-business-license']}>
                      <div>
                        {intl.get('sslm.supplierEntryDetail.view.title.example').d('示例')}：
                      </div>
                      <img
                        src={portraitFace}
                        alt={intl
                          .get('sslm.supplierEntryDetail.view.title.portraitFace')
                          .d('身份证人像面')}
                      />
                    </div>
                  );
                }}
              />
              <Output
                name="idFrontUuid"
                hidden={!personalFlag}
                newLine={!(personalFlag && fileEditFlag)}
                className={styles['legal-basic-licence-url']}
                renderer={({ record = {} }) => {
                  const idFrontUuid = isEmpty(record) ? undefined : record.get('idFrontUuid');
                  return (
                    <FileCardByUuid
                      record={record}
                      label={intl
                        .get('sslm.supplierEntryDetail.view.title.nationalEmblem')
                        .d('身份证身份证国徽面')}
                      uuid={idFrontUuid}
                      viewOnly={!fileEditFlag}
                      fieldName="idFrontUuid"
                      enableImageWatermark={1}
                    />
                  );
                }}
              />
              <Output
                name="nationalEmblem"
                hidden={!(personalFlag && fileEditFlag)}
                renderer={() => {
                  return (
                    <div className={styles['register-business-license']}>
                      <div>
                        {intl.get('sslm.supplierEntryDetail.view.title.example').d('示例')}：
                      </div>
                      <img
                        src={nationalEmblem}
                        alt={intl
                          .get('sslm.supplierEntryDetail.view.title.nationalEmblem')
                          .d('身份证身份证国徽面')}
                      />
                    </div>
                  );
                }}
              />
            </Form>
          )}
        </div>
      </Spin>
    );
  }
);

export default CompanyBaseInfo;
