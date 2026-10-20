module.exports = [
  {
    path: "/scux/spcm/supplementary-contract-information",
    component: () => import("../routes/scux/SupplementaryContractInformation"),
  },
  {
    path: '/pub/scux/trip/spring-board-page',
    authorized: true,
    component: () => import('../routes/scux/SpringboardPage'),
  },
];
