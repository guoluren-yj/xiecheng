const libPattern = /^hzero-ui$/;

function rewriteSource(t, path, libDir) {
  if (libDir === 'dist') {
    if (path.node.source.value.match(libPattern)) {
      path.node.source.value = '../../../dist/hzero-ui';
    }
  }
}

module.exports = rewriteSource;
