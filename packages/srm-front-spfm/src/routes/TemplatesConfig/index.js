// import React from 'react';
// import { connect } from 'dva';
// import formatterCollections from 'utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'utils/utils';

// @connect(({ loading, group, templatesConfig }) => ({
//   group,
//   templatesConfig,
//   fetchTemplateLoading: loading.effects['templatesConfig/fetchTemplatesConfigData'],
// }))
// @formatterCollections({
//   code: [
//     'hptl.common',
//     'hzero.common',
//     'entity.group',
//     'entity.company',
//     'entity.template',
//     'spfm.portalAssign',
//     'spfm.common',
//   ],
// })
// export default class TemplateConfig extends React.PureComponent {
//   constructor(props) {
//     super(props);
//     this.state = {
//       organizationId: getCurrentOrganizationId(),
//     };
//   }

//   componentDidMount() {
//     const { dispatch } = this.props;
//     dispatch({
//       type: 'group/fetchGroup',
//       payload: { organizationId: this.state.organizationId },
//     }).then(res => {
//       if (res) {
//         this.fetchTemplate({ groupId: res[0] && res[0].groupId, companyId: -1 });
//       }
//     });
//   }

//   fetchTemplate(params = {}) {
//     const {
//       dispatch,
//       group: { groupData = [] },
//       history,
//     } = this.props;
//     const { organizationId } = this.state;
//     const { groupId } = groupData[0] || {};
//     dispatch({
//       type: 'templatesConfig/fetchTemplatesConfigData',
//       payload: { groupId, organizationId, ...params },
//     }).then(res => {
//       console.log(res)
//       if (res && res.assignId) {
//         this.fetchTemplateList({ assignId: res.assignId });
//       } else {
//         dispatch({
//           type: 'templatesConfig/updateState',
//           payload: { templatesConfigList: [] },
//         });
//         history.push(`/spfm/templates-config/edit`)
//       }
//     });
//   }

//   /**
//    * @function 获取模板数据
//    * @param {Object} params - 请求参数
//    */
//   fetchTemplateList(params = {}) {
//     const { dispatch, history } = this.props;
//     dispatch({
//       type: 'templatesConfig/fetchTemplateConfigList',
//       payload: params,
//     }).then(res => {
//       if (res) {
//         history.push(`/spfm/templates-config/edit`);
//       }
//     });
//   }

//   // /**
//   //  * @function handleEnabledTemplate - 设置
//   //  * @param {string} data.configId - 配置ID
//   //  */
//   // @Bind()
//   // handleEnabledTemplate(data) {
//   //   const { dispatch } = this.props;
//   //   const { companyId, organizationId } = this.state;
//   //   dispatch({
//   //     type: 'templatesConfig/enableTemplate',
//   //     payload: { ...data, organizationId },
//   //   }).then(() => {
//   //     notification.success();
//   //     this.fetchTemplate({ companyId });
//   //   });
//   // }
//   render() {
//     return null;
//   }
// }
