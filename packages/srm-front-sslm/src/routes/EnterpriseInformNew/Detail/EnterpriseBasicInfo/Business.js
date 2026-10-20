/*
 * Business - 业务信息
 * @Date: 2023-08-29 20:54:40
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Form, Spin, Select, Output, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import FormField from '@/routes/components/FormField';
import { fetchIndustries, fetchIndustryCategories } from '@/services/commonService';
import UrlUpload from '@/routes/components/C7nUrlUpload';

import { getToolTipPrefix } from '../../utils';

const { Option, OptGroup } = Select;

const Business = observer(
  ({
    dataSet,
    custLoading,
    customizeForm,
    isEdit,
    countryCode,
    domesticForeignRelation,
    getFieldProps = () => {},
    code = '',
    isAllPlatform,
    custConfig,
  }) => {
    const [industryList, setIndustryList] = useState([]);
    const [serviceAreaValue, setServiceAreaValue] = useState([]);
    const [industryCategoryList, setIndustryCategoryList] = useState([]);

    const { industryReqList = [], serviceAreaReqList = [] } =
      dataSet.current?.get(['industryReqList', 'serviceAreaReqList']) || {};

    // 行业类型数据源
    useEffect(() => {
      const domesticFlag =
        domesticForeignRelation !== 2 ? domesticForeignRelation : countryCode === 'CN' ? 1 : 0;
      fetchIndustries({ domesticFlag }).then(response => {
        const res = getResponse(response);
        if (res) {
          setIndustryList(res);
        }
      });
    }, [countryCode, domesticForeignRelation]);

    // 行业类型下的品类
    useEffect(() => {
      if (!isEmpty(industryReqList)) {
        fetchIndustryCategories({ enabledFlag: 1, industryIdList: industryReqList.join(',') }).then(
          response => {
            const res = getResponse(response);
            if (res) {
              setIndustryCategoryList(res);
            }
          }
        );
      }
    }, [industryReqList]);

    // 下拉框分组渲染
    const hanldeGropOption = useCallback(
      (dataList = [], groupValue, groupMeaning, optValue, optMeaning) => {
        return dataList.map(industry => (
          <OptGroup key={industry[groupValue]} label={industry[groupMeaning]}>
            {(industry.children || []).map(child => (
              <Option key={industry[optValue]} value={child[optValue]}>
                {child[optMeaning]}
              </Option>
            ))}
          </OptGroup>
        ));
      },
      []
    );

    // 处理送货返回下拉框选项禁用
    const handleServiceAreaOption = useCallback(
      ({ record }) => {
        const serviceArea = isEmpty(serviceAreaValue) ? serviceAreaReqList : serviceAreaValue;
        const getDisabled = () => {
          if (serviceArea.includes('0')) {
            // 全球
            return record.get('value') !== '0';
          } else if (serviceArea.includes('01')) {
            // 中国
            return record.get('value') !== '01';
          } else {
            // 大洲
            const continents = ['010', '020', '030', '040', '050', '060', '070'];
            // 中国地区
            const chinaArea = ['0101', '0102', '0103', '0104', '0105', '0106', '0107'];
            let isContinent = false;
            for (const val of serviceArea) {
              if (continents.includes(val)) {
                isContinent = true;
                break;
              }
            }
            if (isContinent) {
              return !continents.includes(record.get('value'));
            } else {
              return isEmpty(serviceArea) ? false : !chinaArea.includes(record.get('value'));
            }
          }
        };
        return {
          disabled: getDisabled(),
        };
      },
      [serviceAreaValue, serviceAreaReqList]
    );

    // 附件上传成功回调
    const onUploadSuccess = useCallback(response => {
      if (dataSet.current) {
        dataSet.current.set({
          logoUrl: response,
        });
      }
    }, []);

    // 附件删除成功回调
    const onUploadRemove = useCallback(() => {
      if (dataSet.current) {
        dataSet.current.set({
          logoUrl: '',
        });
      }
    }, []);

    const handleIndustryListChange = () => {
      const record = dataSet.current;
      if (record) {
        record.set('industryCategoryReqList', []);
      }
    };

    // 处理字段渲染
    const handleFieldRender = useCallback(
      ({ fieldName, type, hidden = false } = {}) => {
        const renderProps = getFieldProps({
          currentRecord: dataSet.current,
          fieldName,
          type,
          hidden,
        });
        return renderProps;
      },
      [dataSet]
    );

    const urlUploadCuzProps = (
      (custConfig['SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BUSINESS_INFO'] || {}).fields || []
    ).find(({ fieldCode }) => fieldCode === 'logoUrl');

    const { editable } = urlUploadCuzProps || {};
    const urlUploadCuzEdit = editable === 1 && isEdit;

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code,
            readOnly: !isEdit,
          },
          <Form
            useWidthPercent
            columns={3}
            dataSet={dataSet}
            custLoading={custLoading}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            <FormField
              name="businessType"
              componentType="SELECT"
              isEdit={isEdit}
              {...handleFieldRender({
                fieldName: 'businessCheckType',
                hidden: !isAllPlatform,
              })}
              renderer={({ record }) => {
                if (record) {
                  const {
                    businessCheckTypeFlag,
                    businessTypeMeaning,
                    businessTypeOldMeaning,
                  } = record.get([
                    'businessCheckTypeFlag',
                    'businessTypeMeaning',
                    'businessTypeOldMeaning',
                  ]);
                  const showTips = businessCheckTypeFlag === 'UPDATE';
                  let renderOldValue = '-';
                  let renderValue = '-';
                  if (!isEmpty(businessTypeOldMeaning)) {
                    renderOldValue = businessTypeOldMeaning.join('、');
                  }
                  if (!isEmpty(businessTypeMeaning)) {
                    renderValue = businessTypeMeaning.join('、');
                  }
                  const toolTipText = showTips ? `${getToolTipPrefix()}${renderOldValue}` : '';
                  return (
                    <Tooltip placement="top" title={toolTipText}>
                      <span style={{ color: showTips && 'red' }}>{renderValue}</span>
                    </Tooltip>
                  );
                }
              }}
            />
            <FormField
              name="serviceType"
              componentType="SELECT"
              isEdit={isEdit}
              {...handleFieldRender({ fieldName: 'serviceCheckType' })}
              renderer={({ record }) => {
                if (record) {
                  const {
                    serviceCheckTypeFlag,
                    serviceTypeMeaning,
                    serviceTypeOldMeaning,
                  } = record.get([
                    'serviceCheckTypeFlag',
                    'serviceTypeMeaning',
                    'serviceTypeOldMeaning',
                  ]);
                  const showTips = serviceCheckTypeFlag === 'UPDATE';
                  let renderOldValue = '-';
                  let renderValue = '-';
                  if (!isEmpty(serviceTypeOldMeaning)) {
                    renderOldValue = serviceTypeOldMeaning.join('、');
                  }
                  if (!isEmpty(serviceTypeMeaning)) {
                    renderValue = serviceTypeMeaning.join('、');
                  }
                  const toolTipText = showTips ? `${getToolTipPrefix()}${renderOldValue}` : '';
                  return (
                    <Tooltip placement="top" title={toolTipText}>
                      <span style={{ color: showTips && 'red' }}>{renderValue}</span>
                    </Tooltip>
                  );
                }
              }}
            />
            <FormField
              name="interBusinessShield"
              componentType="CHECKBOX"
              isEdit={isEdit}
              {...handleFieldRender({
                fieldName: 'interBusinessShield',
                type: 'CHECKBOX',
                hidden: !(isAllPlatform && domesticForeignRelation !== 2),
              })}
            />
            {isEdit ? (
              <Select
                multiple
                searchable
                maxTagCount={2}
                clearButton={false}
                name="industryReqList"
                onChange={handleIndustryListChange}
              >
                {hanldeGropOption(
                  industryList,
                  'industryId',
                  'industryName',
                  'industryId',
                  'industryName'
                )}
              </Select>
            ) : (
              <Output
                name="industryReqList"
                {...handleFieldRender({ fieldName: 'industry' })}
                renderer={({ record }) => {
                  if (record) {
                    const {
                      industryFlag,
                      industryReqListMeaning,
                      industryReqListOldMeaning,
                    } = record.get([
                      'industryFlag',
                      'industryReqListMeaning',
                      'industryReqListOldMeaning',
                    ]);
                    const showTips = industryFlag === 'UPDATE';
                    let renderOldValue = '-';
                    let renderValue = '-';
                    if (!isEmpty(industryReqListOldMeaning)) {
                      renderOldValue = industryReqListOldMeaning.join('、');
                    }
                    if (!isEmpty(industryReqListMeaning)) {
                      renderValue = industryReqListMeaning.join('、');
                    }
                    const toolTipText = showTips ? `${getToolTipPrefix()}${renderOldValue}` : '';
                    return (
                      <Tooltip placement="top" title={toolTipText}>
                        <span style={{ color: showTips && 'red' }}>{renderValue}</span>
                      </Tooltip>
                    );
                  }
                }}
              />
            )}
            {isEdit ? (
              <Select
                multiple
                searchable
                maxTagCount={2}
                clearButton={false}
                name="industryCategoryReqList"
              >
                {hanldeGropOption(
                  industryCategoryList,
                  'industryId',
                  'industryName',
                  'categoryId',
                  'categoryName'
                )}
              </Select>
            ) : (
              <Output
                name="industryCategoryReqList"
                {...handleFieldRender({
                  fieldName: 'industryCategory',
                })}
                renderer={({ record }) => {
                  if (record) {
                    const {
                      industryCategoryFlag,
                      industryCategoryReqListMeaning,
                      industryCategoryReqListOldMeaning,
                    } = record.get([
                      'industryCategoryFlag',
                      'industryCategoryReqListMeaning',
                      'industryCategoryReqListOldMeaning',
                    ]);
                    const showTips = industryCategoryFlag === 'UPDATE';
                    let renderOldValue = '-';
                    let renderValue = '-';
                    if (!isEmpty(industryCategoryReqListOldMeaning)) {
                      renderOldValue = industryCategoryReqListOldMeaning.join('、');
                    }
                    if (!isEmpty(industryCategoryReqListMeaning)) {
                      renderValue = industryCategoryReqListMeaning.join('、');
                    }
                    const toolTipText = showTips ? `${getToolTipPrefix()}${renderOldValue}` : '';
                    return (
                      <Tooltip placement="top" title={toolTipText}>
                        <span style={{ color: showTips && 'red' }}>{renderValue}</span>
                      </Tooltip>
                    );
                  }
                }}
              />
            )}
            <FormField
              searchable
              isEdit={isEdit}
              reverse={false}
              maxTagCount={3}
              selectAllButton={false}
              componentType="SELECT"
              name="serviceAreaReqList"
              onOption={handleServiceAreaOption}
              onChange={value => {
                setServiceAreaValue(value);
              }}
              {...handleFieldRender({
                fieldName: 'serviceArea',
              })}
              renderer={
                isEdit
                  ? null
                  : ({ record }) => {
                      if (record) {
                        const {
                          serviceAreaFlag,
                          serviceAreaReqListMeaning,
                          serviceAreaReqListOldMeaning,
                        } = record.get([
                          'serviceAreaFlag',
                          'serviceAreaReqListMeaning',
                          'serviceAreaReqListOldMeaning',
                        ]);
                        const showTips = serviceAreaFlag === 'UPDATE';
                        let renderOldValue = '-';
                        let renderValue = '-';
                        if (!isEmpty(serviceAreaReqListOldMeaning)) {
                          renderOldValue = serviceAreaReqListOldMeaning.join('、');
                        }
                        if (!isEmpty(serviceAreaReqListMeaning)) {
                          renderValue = serviceAreaReqListMeaning.join('、');
                        }
                        const toolTipText = showTips
                          ? `${getToolTipPrefix()}${renderOldValue}`
                          : '';
                        return (
                          <Tooltip placement="top" title={toolTipText}>
                            <span style={{ color: showTips && 'red' }}>{renderValue}</span>
                          </Tooltip>
                        );
                      }
                    }
              }
            />
            <FormField
              name="website"
              isEdit={isEdit}
              {...handleFieldRender({ fieldName: 'website' })}
            />
            <UrlUpload
              hidden={(handleFieldRender({ fieldName: 'logoUrl' }) || {}).hidden}
              newLine
              name="logoUrl"
              isEdit={isEdit}
              viewOnly={urlUploadCuzEdit ? false : !isEdit || !isAllPlatform}
              enableImageWatermark={1}
              onUploadRemove={onUploadRemove}
              onUploadSuccess={onUploadSuccess}
              fileUrl={dataSet.current?.get('logoUrl')}
              accept="image/jpeg,image/jpg,image/png"
              help={
                isEdit && (
                  <div className="attachment-help">
                    {intl
                      .get('sslm.enterpriseInform.view.message.upload.support')
                      .d('上传格式：*.jpg;*.png;*.jpeg;')}
                  </div>
                )
              }
              label={intl.get('sslm.enterpriseInform.view.model.business.logoUrl').d('公司 Logo')}
            />
            <FormField
              newLine
              rows={3}
              cols={2}
              colSpan={2}
              isEdit={isEdit}
              name="description"
              componentType="TEXTAREA"
              resize="vertical"
              {...handleFieldRender({ fieldName: 'description' })}
            />
          </Form>
        )}
      </Spin>
    );
  }
);

export default Business;
