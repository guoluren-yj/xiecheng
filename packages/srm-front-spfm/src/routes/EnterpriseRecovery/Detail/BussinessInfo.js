import React from 'react';
import { Output, CheckBox, Form } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import classnames from 'classnames';

export default ({ ds, header, className }) => {
  return (
    <Form
      columns={3}
      header={header}
      dataSet={ds}
      className={classnames(className, 'sslm-c7n-wrap-form')}
      labelLayout="vertical"
    >
      <Output
        name="businessTypeValue"
        renderer={({ record = {} } = {}) => {
          const { data = {} } = record;
          const { business = {} } = data;
          return (
            <>
              {!business.purchaseFlag
                ? ''
                : `${intl.get('spfm.enterprise.view.message.purchase').d('我要采购')}、`}
              {!business.saleFlag
                ? ''
                : intl.get('spfm.enterprise.view.message.sale').d('我要销售')}
            </>
          );
        }}
      />
      <Output
        name="serviceTypeValue"
        renderer={({ record = {} } = {}) => {
          const { data = {} } = record;
          const { business = {} } = data;
          return (
            <>
              {!business.agentFlag
                ? ''
                : `${intl.get('spfm.enterprise.view.message.agent').d('代理商')}、`}
              {!business.servicerFlag
                ? ''
                : `${intl.get('spfm.enterprise.view.message.servicer').d('服务商')}、`}
              {!business.manufacturerFlag
                ? ''
                : `${intl.get('spfm.enterprise.view.message.manufacturer').d('制造商')}、`}
              {!business.traderFlag
                ? ''
                : `${intl.get('spfm.enterprise.view.message.trader').d('贸易商')}、`}
              {!business.integrationFlag
                ? ''
                : `${intl
                    .get('spfm.certificationApproval.model.detailForm.integration')
                    .d('集成商')}、`}
              {!business.contractorFlag
                ? ''
                : `${intl
                    .get('spfm.certificationApproval.model.detailForm.contractor')
                    .d('承包商')}`}
              {!business.dealerFlag
               ? ''
               : `${intl
                .get('spfm.certificationApproval.model.detailForm.dealer')
                .d('经销商')
               }`
              }
            </>
          );
        }}
      />
      <CheckBox name="interBusinessShield" disabled />
      <Output
        name="industryList"
        renderer={({ value }) =>
          value &&
          value
            .map((item) => {
              return item.industryName;
            })
            .join('、')
        }
      />
      <Output
        name="industryCategoryList"
        renderer={({ value }) =>
          value &&
          value
            .map((item) => {
              return item.categoryName;
            })
            .join('、')
        }
      />
      <Output
        name="serviceAreaList"
        renderer={({ value }) =>
          value &&
          value
            .map((item) => {
              return item.serviceAreaMeaning;
            })
            .join('、')
        }
      />
    </Form>
  );
};
