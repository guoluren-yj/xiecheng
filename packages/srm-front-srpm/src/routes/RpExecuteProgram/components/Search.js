import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Lov } from 'choerodon-ui/pro';
// import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
// import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
// import Style from './index.less';
const commonPrompt = 'srpm.common.model.common';

export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.SearchBarRef = {};
    this.state = {
      mountFlag: true,
    };
  }

  @Bind()
  onQuery(props) {
    const { mountFlag } = this.state;
    const { search = () => {} } = this.props;
    search(props, mountFlag);
    // search(props);
    this.setState({ mountFlag: false });
  }

  @Bind()
  leftRender() {
    const { lovDs, handleChangeLov } = this.props;
    return (
      <Lov
        dataSet={lovDs}
        name="containerLov"
        viewMode="popup"
        showValidation="tooltip"
        required
        placeholder={intl.get(`${commonPrompt}.container`).d('需求计划编码')}
        onChange={handleChangeLov}
      />
    );
  }

  render() {
    const {
      // todoTableDs,
      // pendingTableDs,
      // submittedTableDs,
      // readyTableDs,
      // releasedTableDs,
      // organizationId,
      // onRef,
      lovDs,
      handleChangeLov,
    } = this.props;
    return (
      // <SearchBar
      //   cacheState
      //   clearButton
      //   onRef={(ref) => {
      //     this.SearchBarRef = ref;
      //     onRef(ref);
      //   }}
      //   searchCode="SRPM.RP_EXECUTE_PLATFORM.FILTER_BAR"
      //   dataSet={[todoTableDs, pendingTableDs, submittedTableDs, readyTableDs, releasedTableDs]}
      //   onQuery={this.onQuery}
      //   fieldProps={{
      //     purOrganizationId: {
      //       lovPara: { organizationId },
      //     },
      //     // sourceProjectId: {
      //     //   lovPara: {
      //     //     organizationId,
      //     //     sourceFrom: 'RFX',
      //     //   },
      //     // },
      //     currencyCode: {
      //       lovPara: { organizationId },
      //     },
      //     createdBy: {
      //       lovPara: { organizationId },
      //     },
      //     purchaserId: {
      //       lovPara: { organizationId },
      //     },
      //   }}
      //   left={{
      //     render: this.leftRender,
      //   }}
      //   showLoading={false}
      // />
      <Lov
        dataSet={lovDs}
        name="containerLov"
        showValidation="tooltip"
        viewMode="popup"
        required
        placeholder={intl.get(`${commonPrompt}.container`).d('需求计划编码')}
        onChange={handleChangeLov}
      />
    );
  }
}
