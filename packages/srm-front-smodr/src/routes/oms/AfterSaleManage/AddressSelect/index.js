import React from 'react';
import { Bind } from 'lodash-decorators';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import intl from 'utils/intl';

import { fetchSupAddress } from '@/services/oms/afterSaleOrderService';
import { ReactComponent as DefaultLocationIcon } from '@/assets/icons/icon-selected.svg';

import styles from './index.less';

export default class AddressSelect extends React.Component {
  constructor(props) {
    super(props);
    const { supplierCompanyId } = props;
    this.state = {
      supAddId: undefined, // 当前选择的地址的id
      supplierCompanyId,
      returnAddress: [], // 所有退货地址
      defaultAddress: [], // 当前选择的地址
    };
  }

  componentDidMount() {
    this.props.modal.update({ okProps: { disabled: true } });
    this.fetchSupAddress(this.state.supplierCompanyId);
  }

  // 获取退货地址
  @Bind()
  async fetchSupAddress(supplierCompanyId) {
    const res = await fetchSupAddress(supplierCompanyId);
    const defaultAddress = res.filter((item) => !!item.addressFlag) || [];
    this.setState({
      returnAddress: res,
      defaultAddress,
      supAddId: defaultAddress?.[0]?.supplierAddressId,
    }, () => {
      this.updateModalOkProps();
    });
  }

  updateModalOkProps = () => {
    const { modal } = this.props;
    const { defaultAddress } = this.state;
    modal.update({
      footer: (okBtn, cancelBtn) => (
        <>
          <Tooltip title={!defaultAddress.length ? intl.get('smodr.afterSaleManage.view.noAddressTip').d('请选择任一退货地址') : ''}>
            {okBtn}
          </Tooltip>
          {cancelBtn}
        </>
      ),
      okProps: { disabled: !defaultAddress.length },
    });
  }

  @Bind()
  selectAdd(i) {
    const initHasDefault = this.state.defaultAddress.length;
    this.props.handleGetValue(i.supplierAddressId);
    this.setState({ supAddId: i.supplierAddressId, defaultAddress: [i] }, () => {
      // 弹窗初初始状态无默认地址时
      if (!initHasDefault) {
        this.updateModalOkProps();
      }
    });
  }

  @Bind()
  handleAdd() {
    if (this.props.changeModal) {
      this.props.changeModal();
    }
  }

  render() {
    const { supAddId, returnAddress } = this.state;
    return (
      <div className={styles['add-select-content']}>
        <div className="add-select-label">
          <div className="add-select-title">
            {intl.get('smodr.afterSaleManage.model.confirmAdd').d('确认退货地址')}
          </div>
          <div className='unfold'>
            <span style={{ cursor: 'pointer' }} onClick={this.handleAdd}>
              <Icon type="playlist_add" />
              <span style={{ marginLeft: 4, fontWeight: 600 }}>
                {intl.get('smodr.afterSaleManage.model.add').d('新建')}
              </span>
            </span>
          </div>
        </div>
        <div className='address-content-wrapper'>
          {returnAddress.map((i) => (
            <div
              className={classNames({
                'address-block': true,
                active: i.supplierAddressId === supAddId,
              })}
              onClick={() => this.selectAdd(i)}
            >
              <div style={{ marginRight: 10 }}>
                {
                  i.supplierAddressId === supAddId ? (
                    <span className='primary-color'>
                      {/* 本地包没更新暂时加载不出来 */}
                      {DefaultLocationIcon && <DefaultLocationIcon />}
                    </span>
                  ) : <Icon type="radio_button_unchecked" style={{ color: '#C9CDD4' }} />
                }
              </div>
              <div className="address-content">
                <div className="contactName">
                  <span>{i?.contactName}</span>
                  {i.addressFlag && (
                    <span className="default-style">
                      {intl.get('smodr.afterSaleManage.model.default').d('默认')}
                    </span>
                  )}
                </div>
                <div className="phoneNumber">
                  {i?.phoneNumber && i?.phone
                    ? `${i?.phoneNumber}/${i?.phone}`
                    : i?.phoneNumber || i?.phone}
                </div>
                <div className="fullAddress">
                  <span>{`${i?.fullAddress}${i?.address}`}</span>
                  {i?.postCode && (
                    <span>
                      ｜{intl.get('smodr.afterSaleManage.model.postCode').d('邮编')}
                      {i?.postCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
          }
        </div>
      </div>
    );
  }
}
