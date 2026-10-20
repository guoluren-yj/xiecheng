import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isNumber } from 'lodash';
import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  DetailForm,
  ContactList,
  AddressList,
  AttachmentList,
  FinanceList,
  BankList,
} from './View';
import styles from './EnterpriseView.less';

@formatterCollections({ code: 'spfm.approval' })
@connect(({ loading, certificationApproval }) => ({
  loading,
  certificationApproval,
}))
@Form.create({ fieldNameProp: null })
export default class EnterpriseView extends PureComponent {
  static propTypes = {};

  static defaultProps = {};

  componentDidMount() {
    const { match = {}, location: { state = {} } } = this.props;
    const { params = {} } = match;
    const { processUser } = state;
    if (!isNumber(processUser)) {
      this.handleRedirectList();
    } else {
      this.fetchDetail({ companyId: params.id, processUser });
    }
  }

  @Bind()
  handleRedirectList() {
    // const { dispatch } = this.props;
    // dispatch(routerRedux.push({ pathname: `/spfm/certification-approval/list` }));
  }

  @Bind()
  fetchDetail(payload) {
    const { dispatch } = this.props;
    dispatch({ type: 'certificationApproval/queryDetail', payload });
  }

  render() {
    const { form, loading: { effects }, dataSource = {} } = this.props;
    const {
      attachmentList = [],
      financeList = [],
      bankAccountList = [],
      addressList = [],
      contactList = [],
      business = {},
      basic = {},
    } = dataSource;
    const formProps = {
      form,
      loading: effects[''],
      dataSource: {
        ...business,
        ...basic,
      },
    };

    const contactTableProps = {
      dataSource: contactList,
    };
    const addressTableProps = {
      dataSource: addressList,
    };
    const bankTableProps = {
      dataSource: bankAccountList,
    };
    const financeTableProps = {
      dataSource: financeList,
    };
    const attachmentTableProps = {
      dataSource: attachmentList,
    };

    return (
      <div className={styles['spfm-info-detail']}>
        <Header title={intl.get('spfm.approval.message.title.viewDetail').d('企业信息明细')} />
        <Content>
          <DetailForm {...formProps} />
          <br />
          <h3>{intl.get('spfm.approval.message.title.contactPerson').d('联系人信息')}</h3>
          <ContactList {...contactTableProps} />
          <br />
          <h3>{intl.get('spfm.approval.message.title.address').d('地址信息')}</h3>
          <AddressList {...addressTableProps} />
          <br />
          <h3>{intl.get('spfm.approval.message.title.bank').d('银行信息')}</h3>
          <BankList {...bankTableProps} />
          <br />
          <h3>{intl.get('spfm.approval.message.title.finance').d('财务信息')}</h3>
          <FinanceList {...financeTableProps} />
          <br />
          <h3>{intl.get('spfm.approval.message.title.attachment').d('附件信息')}</h3>
          <AttachmentList {...attachmentTableProps} />
        </Content>
      </div>
    );
  }
}
