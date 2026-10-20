/*
 * Business - 业务信息
 * @Date: 2023-04-10 17:06:45
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Form, Spin, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from '@/routes/index.less';
import UrlUpload from '@/routes/components/C7nUrlUpload';
import { serviceTypeList } from '@/routes/components/utils/constants';
import { handleExtTextRenderIntercept } from '@/routes/components/utils';

const Business = observer(
  ({
    dataSet,
    custLoading,
    customizeForm,
    handleCompareRender,
    customizeUnitCode,
    handleFieldProp = () => {},
  }) => {
    const fields = [
      {
        name: 'serviceType',
        renderer: ({ record, value }) => {
          if (record) {
            return (
              <span
                className={styles['sslm-text-overflow']}
                style={{
                  color: record && record.get('serviceCheckTypeFlag') === 'UPDATE' && 'red',
                }}
              >
                {serviceTypeList()[value]}
              </span>
            );
          }
        },
      },
      {
        name: 'industryReqList',
        renderer: ({ record }) => {
          if (record) {
            const industryNames = record.get('industryReqListMeaning') || [];
            return industryNames.map(industryName => (
              <span
                title={industryName}
                className={classnames(
                  styles['sslm-text-overflow'],
                  'c7n-pro-output-multiple-block-disabled',
                  'c7n-pro-output-multiple-block'
                )}
                style={{ color: record && record.get('industryFlag') === 'UPDATE' && 'red' }}
              >
                {industryName}
              </span>
            ));
          }
        },
      },
      {
        name: 'industryCategoryReqList',
        renderer: ({ record }) => {
          if (record) {
            const categoryNames = record.get('industryCategoryReqListMeaning') || [];
            return categoryNames.map(categoryName => (
              <span
                title={categoryName}
                className={classnames(
                  styles['sslm-text-overflow'],
                  'c7n-pro-output-multiple-block-disabled',
                  'c7n-pro-output-multiple-block'
                )}
                style={{
                  color: record && record.get('industryCategoryFlag') === 'UPDATE' && 'red',
                }}
              >
                {categoryName}
              </span>
            ));
          }
        },
      },
      {
        name: 'serviceAreaReqList',
        renderer: ({ record }) => {
          if (record) {
            const serviceAreaReqListMeaning = record.get('serviceAreaReqListMeaning');
            return isEmpty(serviceAreaReqListMeaning)
              ? '-'
              : serviceAreaReqListMeaning.map(n => (
                <span
                  className={classnames(
                      styles['sslm-text-overflow'],
                      'c7n-pro-output-multiple-block-disabled',
                      'c7n-pro-output-multiple-block'
                    )}
                  style={{ color: record && record.get('serviceAreaFlag') === 'UPDATE' && 'red' }}
                >
                  {n}
                </span>
                ));
          }
        },
      },
      {
        name: 'website',
      },
      {
        name: 'description',
        colSpan: 2,
        newLine: true,
      },
      {
        name: 'logoUrl',
        newLine: true,
        renderer: ({ value }) => {
          return value ? (
            <UrlUpload
              newLine
              name="logoUrl"
              isEdit={false}
              enableImageWatermark={1}
              fileUrl={value}
              label={intl.get('sslm.enterpriseInform.view.model.business.logoUrl').d('公司 Logo')}
            />
          ) : (
            '-'
          );
        },
      },
    ].map(field => {
      const { name: fileName, hidden } = field;
      return {
        renderer: ({ value, record, name }) => handleCompareRender({ value, record, name }),
        ...handleFieldProp({ currentRecord: dataSet && dataSet.current, fileName, hidden }),
        ...field,
      };
    });

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeUnitCode,
            readOnly: true,
            extTextRenderIntercept: handleExtTextRenderIntercept,
          },
          <Form
            columns={3}
            dataSet={dataSet}
            custLoading={custLoading}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            {fields.map(field => (
              <Output {...field} />
            ))}
          </Form>
        )}
      </Spin>
    );
  }
);

export default Business;
