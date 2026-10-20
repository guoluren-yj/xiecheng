export default [
  {
    path: '/public/filePreview',
    component: () => import('../routes/FilePreviewPage'),
    authorized: true,
  },
];

