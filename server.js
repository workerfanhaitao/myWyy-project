const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const app = express();
const PORT = 8080;
app.use(express.static('dist'));

// 路径以'/api'的配置
// const apiProxy = ('/api/**', createProxyMiddleware({
//   target: "http://localhost:3000",
//   changeOrigin: true,
//   pathRewrite: {
//     "^/api": ""
//   }
// }));

// 路径以'/'的配置
const apiProxy = ('/**', createProxyMiddleware({
  target: "http://localhost:3000",
  changeOrigin: true,
}));


app.use(apiProxy);
app.listen(PORT, (err) => {
  if (err) {
    console.log('err :', err);
  } else {
    console.log('listen at http://localhost:' + PORT);
  }
});