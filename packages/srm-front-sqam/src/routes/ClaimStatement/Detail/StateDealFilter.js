import React, { PureComponent } from 'react';
import { Form, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Import from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { isEmpty, throttle } from 'lodash';
import { SRM_SQAM } from '_utils/config';
import './stateDealFilter.less';

@Form.create({ fieldNameProp: null })
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
    const { fetchLines, form } = this.props;
    if (fetchLines) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          fetchLines();
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
      isButtonsShow,
      DetailHeadDataSource,
      addLine,
      selectedRowKeys,
      deleteLine,
      fetchLines,
      formHeaderId,
      fetchDetailDataHead,
      custConfig = {},
      deleteLineLoading,
      remoteProps,
      handleSetState,
      fetchHeader,
      selectedRows,
      headerData,
      lineData,
      basicForm,
    } = this.props;
    const unitConfig = custConfig?.['SQAM.CLAIM_STATEMENT_DEATIL.ITEM_FILTER'];
    let searchHide = 0;
    if (unitConfig) {
      const { fields } = unitConfig;
      searchHide = fields.some((item) => item.visible === 1);
    }
    const searchVal = form?.getFieldsValue() || {};
    return customizeFilterForm(
      {
        code: 'SQAM.CLAIM_STATEMENT_DEATIL.ITEM_FILTER',
        form,
      },
      <Form layout="inline" className="more-fields-search-form more-fields-search-form-filter">
        <Row gutter={12}>
          <Col span={16}>
            <Row />
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              {searchHide && (
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              )}
              {isButtonsShow &&
                (DetailHeadDataSource.statusCode !== 'APPEALED' ||
                  DetailHeadDataSource.sourceCode !== 'INSPECTION') && (
                  <Button
                    type="primary"
                    onClick={throttle(addLine, 1500, { trailing: false })}
                    loading={deleteLineLoading}
                  >
                    {intl.get(`hzero.common.button.create`).d('新建')}
                  </Button>
                )}
              {isButtonsShow && (
                <Button
                  disabled={isEmpty(selectedRowKeys)}
                  onClick={throttle(deleteLine, 1500, { trailing: false })}
                  loading={deleteLineLoading}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
              )}
              <Import
                buttonText={intl.get(`hzero.common.button.addExcel1`).d('新版Excel导入')}
                businessObjectTemplateCode="SQAM.CLAIM_LINE_APPEAL"
                buttonProps={{
                  funcType: 'raised',
                  icon: 'archive',
                  permissionList: [
                    {
                      code: `srm.sqam.business.claim.statement.ps.newdetailimport`,
                      type: 'button',
                    },
                  ],
                  loading: deleteLineLoading,
                }}
                prefixPatch="/sqam"
                successCallBack={() => {
                  fetchLines();
                  fetchDetailDataHead();
                }}
                args={{
                  tenantId,
                  templateCode: 'SQAM.CLAIM_LINE_APPEAL',
                  formHeaderId,
                }}
              />
              <ExcelExportPro
                requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form-lines/detail/appeal-export/${formHeaderId}/new`}
                otherButtonProps={{
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  funcType: 'raised',
                  style: {
                    marginRight: '5px',
                  },
                  permissionList: [
                    {
                      code: `srm.sqam.business.claim.statement.ps.export`,
                      type: 'button',
                    },
                  ],
                  loading: deleteLineLoading,
                }}
                queryParams={{
                  formLineIds: !isEmpty(selectedRowKeys) ? selectedRowKeys : undefined,
                  customizeUnitCode:
                    'SQAM.CLAIM_STATEMENT_DEATIL.ITEM,SQAM.CLAIM_STATEMENT_DEATIL.ITEM_FILTER',
                  ...searchVal,
                }}
                buttonText={intl.get('hzero.common.button.priceExport').d('批量导出')}
                templateCode="SQAM_CLAIM_LINE_APPEAL_EXPORT"
                method="POST"
                allBody
              />
              {remoteProps
                ? remoteProps.process('SQAM_CLAIM_STATEMENT_DETAIL_CUX_LINE_BTN', '', {
                    form,
                    headerData,
                    lineData,
                    handleSetState,
                    selectedRowKeys,
                    selectedRows,
                    fetchLines,
                    fetchHeader,
                    basicForm,
                  })
                : null}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
