import React, { PureComponent } from 'react';
import { Form, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import Import from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { isEmpty } from 'lodash';
import { SRM_SQAM } from '_utils/config';
import '@/routes/ClaimStatement/Detail/stateDealFilter.less';

@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM_FILTER'],
// })
export default class StateDealFilter extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { handleSearchLine, form } = this.props;
    if (handleSearchLine) {
      form.validateFields(err => {
        if (!err) {
          handleSearchLine();
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      tenantId,
      customizeFilterForm,
      selectedRowKeys,
      formHeaderId,
      handleSearchLine,
      custConfig = {},
    } = this.props;
    const { fields = [] } = custConfig['SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM_FILTER'] || {};
    const searchShow = fields.some(item => item.visible === 1);
    const searchVal = form?.getFieldsValue() || {};
    return customizeFilterForm(
      {
        code: 'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM_FILTER',
        form,
      },
      <Form layout="inline" className="more-fields-search-form more-fields-search-form-filter">
        <Row gutter={12}>
          <Col span={16}>
            <Row />
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              {searchShow && (
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              )}
              {searchShow && (
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              )}
              <Import
                buttonText={intl.get(`hzero.common.button.addExcel1`).d('新版Excel导入')}
                businessObjectTemplateCode="SQAM.CLAIM_LINE_CONFIRM"
                buttonProps={{
                  funcType: 'raised',
                  type: 'c7n-pro',
                  icon: 'archive',
                  permissionList: [
                    {
                      code: `srm.sqam.business.cliam.feedback.claim-confirm.ps.newdetailimport`,
                      type: 'button',
                    },
                  ],
                }}
                prefixPatch="/sqam"
                successCallBack={() => handleSearchLine()}
                args={{
                  tenantId,
                  templateCode: 'SQAM.CLAIM_LINE_CONFIRM',
                  formHeaderId,
                }}
              />
              <ExcelExportPro
                requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form-lines/detail/export/${formHeaderId}/new`}
                otherButtonProps={{
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  funcType: 'raised',
                  style: {
                    marginRight: '5px',
                  },
                  permissionList: [
                    {
                      code: `srm.sqam.business.cliam.feedback.claim-confirm.ps.newdetailexport`,
                      type: 'button',
                    },
                  ],
                }}
                queryParams={{
                  formLineIds: !isEmpty(selectedRowKeys) ? selectedRowKeys : undefined,
                  customizeUnitCode:
                    'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM_FILTER,SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
                  ...searchVal,
                }}
                buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                templateCode="SQAM_CLAIM_LINE_CONFIRM_EXPORT"
                method="POST"
                allBody
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
