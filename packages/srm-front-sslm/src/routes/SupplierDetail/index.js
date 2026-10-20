/**
 * SupplierDetail - 供应商360度查询
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import SupplierDetail from './SupplierDetail';

/**
 * 供应商360度查询
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierDetail - 数据源
 * @return React.element
 */
@connect(({ supplierDetail, loading }) => ({
  supplierDetail,
  detailLoading:
    loading.effects[`supplierDetail/fetchCompanyInfo`] ||
    loading.effects[`supplierDetail/fetchSupplierInfo`] ||
    loading.effects[`supplierDetail/fetchSupplierLifeCycle`] ||
    loading.effects[`supplierDetail/fetchCatalog`] ||
    loading.effects[`supplierDetail/editedInfo`] ||
    loading.effects[`supplierDetail/fetchPurchaseList`] ||
    loading.effects[`supplierDetail/fetchAddressList`],
  detailOuListLoading: loading.effects[`supplierDetail/fetchOuList`],
  buttonLoading: loading.effects[`supplierDetail/fetchPurchaseFormList`],
  queryOtherLoading: loading.effects[`supplierDetail/fetchOtherInfo`],
  fetchCompanyIdReserveLoading: loading.effects[`supplierDetail/fetchCompanyIdReserve`],
  printLoading: loading.effects[`supplierDetail/handlePrint`],
}))
export default class Main extends SupplierDetail {}
