/**
 * 企业信息 - 业务信息
 * @date: 2018-6-30
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import qs from 'querystring';
import { isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_PLATFORM } from '_utils/config';
import { Content } from 'components/Page';
import { Spin } from 'hzero-ui';
import BusinessForm from '../Edit/BussinessForm';
import styles from './ProcessInfo.less';

const NAME_SPACE = 'enterpriseBusiness';

@connect((modal) => ({
  business: modal[NAME_SPACE],
  queryLoading: modal.loading.effects[`${NAME_SPACE}/queryCompanyBusiness`],
}))
@withRouter
@formatterCollections({ code: ['spfm.enterprise', 'spfm.business', 'hptl.portalAssign'] })
export default class BusinessInfoBase extends PureComponent {
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.history.location.search.substr(1));
    this.state = {
      companyId: routerParam.companyId,
      domesticForeignRelation: routerParam.domesticForeignRelation,
      globalFlag: false,
      chinaFlag: false,
      continentsFlag: false,
      otherFlag: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { companyId } = this.state;
    if (companyId && companyId !== 'undefined') {
      dispatch({
        type: `${NAME_SPACE}/queryCompanyBusiness`,
        payload: companyId,
      }).then(() => {
        const {
          business: { businessInfo },
        } = this.props;

        this.businessForm.businessLoadData(businessInfo);

        if (businessInfo.industryList) {
          this.businessForm.fetchIndustryCategories(
            businessInfo.industryList.map((item) => item.industryId)
          );
        }
        if (isArray(businessInfo.serviceAreaList)) {
          this.handleAreaChange(businessInfo.serviceAreaList.map((i) => i.serviceAreaCode));
        }
      });
    }
  }

  businessForm;

  @Bind()
  onRef(form) {
    this.businessForm = form;
  }

  @Bind()
  callback(res) {
    const { history, fetchPreviewDetail } = this.props;
    const { domesticForeignRelation } = this.state;
    fetchPreviewDetail(res.companyId).then(() => {
      if (res) {
        history.push(
          `${SRM_PLATFORM}/enterprise/register/contact?companyId=${res.companyId}&domesticForeignRelation=${domesticForeignRelation}`
        );
      }
    });
  }

  /**
   * 返回上一步回调方法
   */
  @Bind()
  previousCallback() {
    const { history } = this.props;
    const { domesticForeignRelation, companyId } = this.state;
    history.push(
      `${SRM_PLATFORM}/enterprise/register/legal?companyId=${companyId}&&domesticForeignRelation=${domesticForeignRelation}`
    );
  }

  @Bind()
  handleAreaChange(value = []) {
    if (value.length !== 0) {
      //  全球
      if (value.includes('0') === true) {
        this.setState({
          globalFlag: false,
          chinaFlag: true,
          otherFlag: true,
          continentsFlag: true,
        });
      } else if (value.includes('01') === true) {
        this.setState({
          globalFlag: true,
          chinaFlag: false,
          otherFlag: true,
          continentsFlag: true,
        });
      } else {
        const continents = ['010', '020', '030', '040', '050', '060', '070'];
        let isContinent = false;
        for (const val of value) {
          if (continents.includes(val)) {
            isContinent = true;
            break;
          }
        }
        if (isContinent) {
          this.setState({
            globalFlag: true,
            chinaFlag: true,
            otherFlag: true,
            continentsFlag: false,
          });
        } else {
          this.setState({
            globalFlag: true,
            chinaFlag: true,
            otherFlag: false,
            continentsFlag: true,
          });
        }
      }
    } else {
      this.setState({
        globalFlag: false,
        chinaFlag: false,
        otherFlag: false,
        continentsFlag: false,
      });
    }
  }

  render() {
    const {
      business: { businessInfo = {} },
      queryLoading,
    } = this.props;
    const { companyId, domesticForeignRelation } = this.state;

    return (
      <React.Fragment>
        <Content>
          <Spin spinning={queryLoading}>
            <div className={styles['item-wrapper']}>
              <h3 className={styles['item-wrapper-title']}>
                {intl.get('spfm.business.view.message.title').d('基础业务信息')}
              </h3>
              <div>
                {intl
                  .get('spfm.business.view.message.description')
                  .d(
                    '提示: 业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易'
                  )}
              </div>
            </div>
            <BusinessForm
              onRef={this.onRef}
              data={businessInfo}
              previousCallback={this.previousCallback}
              backBtnText={intl.get('hzero.common.button.previous').d('上一步')}
              callback={this.callback}
              buttonText={intl.get('hzero.common.button.next').d('下一步')}
              companyId={companyId}
              globalFlag={this.state.globalFlag}
              chinaFlag={this.state.chinaFlag}
              otherFlag={this.state.otherFlag}
              continentsFlag={this.state.continentsFlag}
              handleAreaChange={this.handleAreaChange}
              domesticForeignRelation={domesticForeignRelation}
            />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
