import React, { Component, Fragment } from 'react';
import { Table, Select, Lov } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import DynamicButtons from '_components/DynamicButtons';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Modal } from 'hzero-ui'; // 暂时未用c7n的，因为该组件没有hzero处理得好
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';

import { fetchExtended } from '@/services/contractControlService';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const { Option } = Select;

// @WithCustomizeC7N({
//   unitCode: [
//     'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
//     'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
//     'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.BTN_GROUP',
//   ],
// })
@withRouter
export default class ContractPartner extends Component {
  @Bind()
  onPreDelete() {
    const { checkModified } = this.props;
    if (checkModified()) {
      this.handleDelete();
    } else {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => {
          this.handleDelete();
        },
      });
    }
  }

  @Bind()
  handleGetCode() {
    const {
      location: { search },
      unitCodeList,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (routerParams.hasChanged === 'true') {
      // 处理个性化缓存机制，不给默认值
      return unitCodeList ? unitCodeList.PARTNER : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER';
    } else {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY';
    }
  }

  @Bind()
  handleChangePartner(obj, record) {
    const fields = {
      partnerTypeId: obj?.partnerTypeId || '',
      partnerTypeCode: obj?.partnerTypeCode || '',
      partnerTypeName: obj?.partnerTypeName || '',
    };
    record.set(fields);

    // 带出说明字段
    if (!record.get('remark') && !isEmpty(obj)) {
      record.set({ remark: obj.remark });
    }
  }

  @Bind()
  async handleChangeCompany(value, record) {
    const { supplierCompanyId } = value || {};
    const { pcHeaderId } = this.props;
    const response = getResponse(
      await fetchExtended({
        companyId: supplierCompanyId,
        pcHeaderId,
      })
    );
    if (response) {
      const {
        legalRepName,
        address,
        companyId,
        contacts,
        telNum,
        taxRegistrationPhone,
        mail,
        bankName,
        bankAccountName,
        bankAccountNum,
        // remark,
        bankFirm,
        unifiedSocialCode,
        businessRegistrationNumber,
        dunsCode,
        intlBankAccountNum,
        postCode,
      } = response;
      record.set({
        legalRepName,
        address,
        companyId,
        contacts,
        telNum,
        taxRegistrationPhone,
        mail,
        bankName,
        bankAccountName,
        bankAccountNum,
        // remark,
        bankFirm,
        unifiedSocialCode,
        businessRegistrationNumber,
        dunsCode,
        intlBankAccountNum,
        postCode,
      });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.props.partnerDs.create({}, 0);
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const { partnerDs, onFetchTableList } = this.props;
    const selectedRows = partnerDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    partnerDs.remove(newAddRows);
    // 删除线上数据
    const res = await partnerDs.delete(existedRows);
    if (res && !res.failed) {
      onFetchTableList(partnerDs, 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER');
    }
  }

  renderColumns() {
    const { editable, partnerList, remote } = this.props;
    const columns = [
      {
        name: 'partnerTypeName',
        width: 150,
        editor: (record) =>
          editable && (
            <Select onChange={(val) => !val && this.handleChangePartner({}, record)}>
              {partnerList
                .filter((item) => item?.enabledFlag === 1)
                .map((s) => (
                  <Option
                    key={s.partnerTypeCode}
                    value={s.partnerTypeName}
                    onClick={() => this.handleChangePartner(s, record)}
                  >
                    {s.partnerTypeName}
                  </Option>
                ))}
            </Select>
          ),
      },
      {
        name: 'partnerTypeCode',
        width: 150,
      },
      {
        name: 'companyIdLov',
        width: 150,
        editor: (record) =>
          editable &&
          record.status === 'add' && (
            <Lov
              code="SPCM.USER_AUTH.SUPPLIER"
              textValue={record.supplierCompanyNum}
              queryParams={{ enabledFlag: 1, tenantId: organizationId }}
              onChange={(value) => this.handleChangeCompany(value, record)}
            />
          ),
      },
      {
        name: 'companyName',
        width: 200,
        editor: editable,
      },
      {
        name: 'legalRepName',
        width: 120,
        editor: editable,
      },
      {
        name: 'unifiedSocialCode',
        width: 180,
        editor: editable,
      },
      {
        name: 'businessRegistrationNumber',
        width: 200,
        editor: editable,
      },
      {
        name: 'dunsCode',
        width: 180,
        editor: editable,
      },
      {
        name: 'postCode',
        width: 150,
        editor: editable,
      },
      {
        name: 'corporateDuty',
        editor: editable,
      },
      {
        name: 'address',
        width: 250,
        editor: editable,
      },
      {
        name: 'contacts',
        width: 150,
        editor: editable,
      },
      {
        name: 'telNum',
        width: 200,
        editor: editable,
      },
      {
        name: 'taxRegistrationPhone',
        width: 180,
        editor: editable,
      },
      {
        name: 'faxes',
        width: 200,
        editor: editable,
      },
      {
        name: 'mail',
        width: 200,
        editor: editable,
      },
      {
        name: 'bankName',
        width: 200,
        editor: editable,
      },
      {
        name: 'bankAccountName',
        width: 200,
        editor: editable,
      },
      {
        name: 'bankAccountNum',
        width: 200,
        editor: editable,
      },
      {
        name: 'bankAddress',
        width: 200,
        editor: editable,
      },
      {
        name: 'bankFirm',
        width: 200,
        editor: editable,
      },
      {
        name: 'intlBankAccountNum',
        width: 200,
        editor: editable,
      },
      {
        name: 'remark',
        width: 240,
        editor: editable,
      },
    ];
    const newCols = remote
      ? remote.process('SPCM_CONTRACT_CONTROL_DETAIL_PARTNER_COLUMN', columns, {
          current: this,
        })
      : columns;
    return newCols;
  }

  render() {
    const { editable, partnerDs, customizeTable, customizeBtnGroup } = this.props;

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected || [];

      return (
        <Fragment>
          {customizeBtnGroup(
            {
              code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.BTN_GROUP',
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'create',
                  btnType: 'c7n-pro',
                  btnProps: {
                    color: 'primary',
                    onClick: this.handleCreate,
                  },
                  child: intl.get(`hzero.common.button.create`).d('新建'),
                },
                {
                  name: 'delete',
                  btnType: 'c7n-pro',
                  btnProps: {
                    disabled: isEmpty(selectedRows),
                    onClick: this.handleDelete,
                  },
                  child: intl.get(`hzero.common.button.delete`).d('删除'),
                },
              ]}
            />
          )}
        </Fragment>
      );
    });
    return (
      <Fragment>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={partnerDs} />
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
          },
          <Table dataSet={partnerDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
