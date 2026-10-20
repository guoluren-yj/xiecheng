import React, { Component, Fragment } from 'react';
import { Table, Select, Lov, SecretField } from 'choerodon-ui/pro';
import { Badge, Popover } from 'choerodon-ui';
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

import { renderCompareColumns, extTextRender, renderStatus } from '@/utils/renderer';
import { fetchExtended } from '@/services/contractControlService';
import { fetchPurchaseExtended } from '@/services/workspaceService';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const { Option } = Select;

// @WithCustomizeC7N({
//   unitCode: [
//     'SPCM.WORKSPACE_DETAIL.PARTNER',
//     'SPCM.WORKSPACE_DETAIL.PARTNER.READONLY',
//     'SPCM.WORKSPACE_DETAIL.PARTNER.BTN_GROUP',
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
      match: { path },
      location: { search },
      custCode,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (custCode) {
      return custCode;
    }
    if (
      path.includes('/spcm/contract-workspace/update') ||
      routerParams.hasChanged === 'true' ||
      path.includes('/spcm/contract-workspace/intelligent/')
    ) {
      return 'SPCM.WORKSPACE_DETAIL.PARTNER';
    } else {
      return 'SPCM.WORKSPACE_DETAIL.PARTNER.READONLY';
    }
  }

  @Bind()
  handleChangePartner(obj, record) {
    const fields = {
      partnerTypeId: obj?.partnerTypeId || '',
      partnerTypeCode: obj?.partnerTypeCode || '',
      partnerTypeName: obj?.partnerTypeName || '',
      defaultRoleFlag: obj?.defaultRoleFlag || '0',
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
    const isPurchaser = ['1', '2'].includes(record?.get('defaultRoleFlag'));
    const { pcHeaderId } = this.props;
    const fetchMethod = isPurchaser ? fetchPurchaseExtended : fetchExtended;
    const response = getResponse(
      await fetchMethod({
        companyId: isPurchaser ? value?.companyId : supplierCompanyId,
        pcHeaderId,
      })
    );
    if (response) {
      const {
        legalRepName,
        address,
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
        companyId: isPurchaser ? value?.companyId : supplierCompanyId,
        companyNum: isPurchaser ? value?.companyNum : value?.supplierCompanyNum,
        companyName: isPurchaser ? value?.companyName : value?.supplierCompanyName,
        legalRepName,
        address,
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
    const { partnerDs } = this.props;
    const selectedRows = partnerDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    partnerDs.remove(newAddRows);
    // 删除线上数据
    const res = await partnerDs.delete(existedRows);
    if (res && !res.failed) {
      // onFetchTableList(partnerDs, 'SPCM.WORKSPACE_DETAIL.PARTNER');
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { partnerDs } = this.props;
    partnerDs.submit().then((res) => {
      if (res) {
        partnerDs.query();
      }
    });
  }

  renderColumns() {
    const {
      editable,
      partnerList,
      currentMode = null,
      differeFlag,
      remoteWorkDetail,
      intelligent,
    } = this.props;
    const showDiff = currentMode === 'current' || currentMode === 'history';
    const columns = [
      differeFlag && {
        name: 'objectFlagMeaning',
        width: 120,
        renderer: ({ record, value }) => renderStatus(record.get('objectFlag'), value, 'change'),
      },
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
        renderer: ({ record = {} }) => (
          <div>
            {showDiff && record.get('objectFlag') === 'CREATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'DELETE' ? (
              <Popover
                content={intl.get('hzero.common.button.deleteLine').d('删除行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'UPDATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {record.get('partnerTypeName')}
          </div>
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
              textValue={record.supplierCompanyNum}
              queryParams={{ enabledFlag: 1, tenantId: organizationId }}
              onChange={(value) => this.handleChangeCompany(value, record)}
            />
          ),
        compareValue: 'companyNum',
      },
      {
        name: 'companyName',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'legalRepName',
        width: 120,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'unifiedSocialCode',
        width: 180,
        editor: editable,
        formType: 'TextField',
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
        formType: 'TextField',
      },
      {
        name: 'contacts',
        width: 150,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'telNum',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'taxRegistrationPhone',
        width: 180,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'faxes',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'mail',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'bankName',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'bankAccountName',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'bankAccountNum',
        width: 200,
        formType: 'SecretField',
        editor: editable && <SecretField name="bankAccountNum" />,
      },
      {
        name: 'bankAddress',
        width: 200,
        editor: editable,
        formType: 'TextField',
      },
      {
        name: 'bankFirm',
        width: 200,
        editor: editable,
        formType: 'TextField',
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
    ].filter(Boolean);

    const modeCoumns = renderCompareColumns(columns, { currentMode, differeFlag, intelligent });
    return remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_PARTNER_COLUMNS', modeCoumns, {
          current: this,
        })
      : modeCoumns;
  }

  render() {
    const {
      editable,
      partnerDs,
      customizeTable,
      currentMode,
      customizeBtnGroup,
      differeFlag,
      remoteWorkDetail,
      namespace,
    } = this.props;

    const cuxCustomFieldPropsIntercept = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_PARTNER_CUSTOM_FIELD_PROPS_INTERCEPT',
          {},
          {
            current: this,
          }
        )
      : {};

    const cuxExtTextRenderIntercept = (extParam, { currentMode, differeFlag }) =>
      remoteWorkDetail
        ? remoteWorkDetail.process(
            'SPCM_WORKSPACE_DETAIL_PARTNER_EXT_TEXT_RENDER_INTERCEPT',
            extTextRender(extParam, { currentMode, differeFlag }),
            { current: this }
          )
        : extTextRender(extParam, { currentMode, differeFlag });

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected || [];
      const buttonCommonProps = {
        color: 'primary',
        funcType: 'flat',
      };

      return (
        <Fragment>
          {customizeBtnGroup(
            {
              code: 'SPCM.WORKSPACE_DETAIL.PARTNER.BTN_GROUP',
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'create',
                  btnType: 'c7n-pro',
                  btnProps: {
                    ...buttonCommonProps,
                    icon: 'playlist_add',
                    color: 'primary',
                    onClick: this.handleCreate,
                  },
                  child: intl.get('hzero.common.btn.add').d('新增'),
                },
                {
                  name: 'delete',
                  btnType: 'c7n-pro',
                  btnProps: {
                    ...buttonCommonProps,
                    icon: 'delete_sweep',
                    disabled: isEmpty(selectedRows),
                    onClick: this.handleDelete,
                  },
                  child: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
                },
                {
                  name: 'save',
                  btnType: 'c7n-pro',
                  btnProps: {
                    ...buttonCommonProps,
                    icon: 'playlist_add',
                    color: 'primary',
                    onClick: this.handleSave,
                  },
                  child: intl.get('hzero.common.button.save').d('保存'),
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
            namespace: namespace || 'ContractPartner',
            customFieldPropsIntercept: cuxCustomFieldPropsIntercept,
            extTextRenderIntercept:
              currentMode || differeFlag
                ? (...extParam) => cuxExtTextRenderIntercept(extParam, { currentMode, differeFlag })
                : null,
          },
          <Table style={{ maxHeight: 430 }} dataSet={partnerDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
