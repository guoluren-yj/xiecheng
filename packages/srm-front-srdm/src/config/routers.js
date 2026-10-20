module.exports = [
  {
    path: '/srdm/migrate-groups/table/:mgGroupId/:mgGrObjId',
    component: () => import('../routes/MigrateGroupsTable'),
    authorized: true,
  },
  {
    path: '/srdm/migrate-groups/object/:mgGroupId',
    component: () => import('../routes/MigrateGroupsObject'),
    authorized: true,
  },
  {
    path: '/srdm/migrate-groups/list',
    component: () => import('../routes/MigrateGroups'),
    authorized: true,
  },
  {
    path: '/srdm/app-databases/:appEnvId',
    component: () => import('../routes/AppDataBases'),
    authorized: true,
  },
  {
    path: '/srdm/app-env',
    component: () => import('../routes/AppEnv'),
    authorized: true,
  },
  {
    path: '/srdm/extra-param/:routeDsId',
    component: () => import('../routes/ExtraParam'),
    authorized: true,
  },
  {
    path: '/srdm/data-source',
    component: () => import('../routes/DataSource'),
    authorized: true,
  },
  {
    path: '/srdm/deploy-rec/:deployInfoId',
    component: () => import('../routes/DeployRec'),
    authorized: true,
  },
  {
    path: '/srdm/deploy-info',
    component: () => import('../routes/DeployInfo'),
    authorized: true,
  },
  {
    path: '/srdm/deploy-dist/:deployInfoId',
    component: () => import('../routes/DeployInfo/configDataPage'),
    authorized: true,
  },
  {
    path: '/srdm/deploy-dist/:deployInfoId/:deployDistId',
    component: () => import('../routes/DeployDistDetail'),
    authorized: true,
  },
  {
    path: '/srdm/data/distribute',
    component: () => import('../routes/DataDistribute/index.js'),
    authorized: true,
  },
  {
    path: '/srdm/data/distribute/detail/:recId',
    component: () => import('../routes/DataDistributeDetail/index.js'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-compare/:objectCode',
    component: () => import('../routes/ConfigObjectCompare/index'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-field/:objectId/:objectTblId',
    component: () => import('../routes/ConfigObjectField/index.js'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-tbl/:objectId',
    component: () => import('../routes/ConfigObjectTBL/index.js'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-contact/:objectId/:objectTblId',
    component: () => import('../routes/ConfigObjectContact'),
    authorized: true,
  },
  {
    path: '/srdm/config-object',
    component: () => import('../routes/ConfigObject/index.js'),
    authorized: true,
  },
  {
    path: '/srdm/process',
    component: () => import('../routes/Process/index.js'),
    authorized: true,
  },
  {
    path: '/srdm/iteration-config',
    component: () => import('../routes/IterationConfig'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-async',
    component: () => import('../routes/ConfigObjectAsync'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-async/detail/:objectCode/:tableName/:mainTableId/:detailName/:time',
    component: () => import('../routes/ConfigObjectAsync'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-async/diff/:objectCode/:tableName/:time',
    component: () => import('../routes/ConfigObjectAsyncDiff'),
    authorized: true,
  },
  {
    path: '/srdm/config-object-async/env/:groupId',
    component: () => import('../routes/ConfigObjectEnvSync'),
    authorized: true,
  },
  {
    path: '/pub/config-object/help',
    component: () => import('../routes/ObjectHelpManual'),
    authorized: true,
  },
];
