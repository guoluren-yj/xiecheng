import React, { Component } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Throttle } from 'lodash-decorators';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { SupplierHeaderBaseInfoOpenModal } from './SupplierHeaderBaseInfoOpenModal';

import Styles from '../index.less';

@observer
class SupplierHeaderBaseInfoLink extends Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.state = {
      loading: false,
    };
  }

  toggleLoading = (loading = false) => {
    this.setState({
      loading,
    });
  };

  @Throttle(500)
  viewBaseInfo = async () => {
    const { getHeaderBasicInfoModalReadOnlyFlag } = this.props;
    const { loading } = this.state;

    const disabledAllFields = getHeaderBasicInfoModalReadOnlyFlag();

    SupplierHeaderBaseInfoOpenModal({
      ...this.props,
      loading,
      disabledAllFields,
    });
  };

  getHeaderButtons = () => {
    const { headerInfo, disabledAllFields } = this.props;
    const { fieldsRequiredFlag } = headerInfo || {};

    const IconStyle = {
      fontSize: '14px',
      marginRight: '4px',
    };

    const btns = [
      {
        name: 'info',
        child: (
          <>
            <a className={Styles['ssrc-bidding-supplier-base-info-header-form']}>
              <span className={Styles['ssrc-bidding-supplier-base-info-header-form-divide-line']} />
              <span>
                {!disabledAllFields ? (
                  <Icon type="drive_file_rename_outline" style={IconStyle} />
                ) : (
                  <Icon type="visibility-o" style={IconStyle} />
                )}
                <Badge
                  dot={fieldsRequiredFlag === 1 && !disabledAllFields}
                  style={{ marginLeft: '4px', marginTop: '4px' }}
                >
                  {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
                </Badge>
              </span>
            </a>
          </>
        ),
        btnProps: {
          onClick: this.viewBaseInfo,
          funcType: 'link',
          style: {
            fontSize: '12px',
            marginLeft: '4px',
            display: 'inline-block',
            height: '100%',
            paddingBottom: '4px',
          },
        },
      },
    ];

    return btns;
  };

  render() {
    const { customizeBtnGroup, getCustomizeUnitCode } = this.props;

    return (
      <span className={Styles['ssrc-bidding-supplier-base-info-header-form-link']}>
        <>
          {customizeBtnGroup(
            {
              code: getCustomizeUnitCode('headerBaseInfoBtns'),
              pro: true,
            },
            <DynamicButtons
              // trigger="hover"
              buttons={this.getHeaderButtons()}
              defaultBtnType="c7n-pro"
            />
          )}
        </>
      </span>
    );
  }
}

export default SupplierHeaderBaseInfoLink;
