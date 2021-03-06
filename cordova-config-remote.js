const fs = require('fs')
const util = require('util')
// const exec = require('child_process').exec
const exec = util.promisify(require('child_process').exec)

// 0. make directory & make file
//检测文件或者文件夹存在 nodeJS
const fsExistSync = path => {
  try {
    fs.accessSync(path, fs.F_OK)
  } catch (e) {
    return false
  }
  return true
}

if (!fsExistSync('./www')) {
  exec('mkdir www')
}

// if (!fsExistSync('./platforms')) {
//   exec('cordova platform add android')
// }

// 1. check config.xml
if (!fsExistSync('./config.xml')) {
  console.warn('"config.xml" file not found!!!')
  return
}

// 2. copy codrova.js to www/
exec('cp -a platforms/android/platform_www/cordova.js www')

const insertLine = require('insert-line')
const appendContent = (filepath, content, line) => {
  var context = fs.readFileSync(filepath, 'utf8')
  if (context.indexOf(content) < 0) {
    insertLine(filepath)
      .content(content)
      .at(line)
      .then(err => {
        if (err) {
          console.log(err)
        }
      })
  }
}

// 3. add cordova reference to index.html
const indexpath = './node_modules/@things-factory/shell/_index.html'
const cordovajs = '    <script type="text/javascript" src="./cordova.js"></script>'
appendContent(indexpath, cordovajs, 96) // FIXME: line

// 4. add gradle: for cordova-plugin-ssdp
const gradledepends = "    compile group: 'com.google.code.gson', name: 'gson', version: '2.8.5'"
const gradlepath = './platforms/android/app/build.gradle'
appendContent(gradlepath, gradledepends, 269) // FIXME: line

const appendLine = (filepath, content) => {
  var context = fs.readFileSync(filepath, 'utf8')
  if (context.indexOf(content) < 0) {
    insertLine(filepath).appendSync(content)
  }
}

// 5. git ignore
const gitignorepath = './.gitignore'
appendLine(gitignorepath, 'platforms/')
appendLine(gitignorepath, 'plugins/')
appendLine(gitignorepath, 'www/')

const fixfile = (filepath, target, replacement) => {
  var context = fs.readFileSync(filepath, 'utf8')
  var result = context.replace(target, replacement)
  fs.writeFileSync(filepath, result, 'utf8')
}

// 6. fix @things-factory/shell's config public path
const webpackconfigdevpath = './node_modules/@things-factory/shell/webpack.config.dev.js'
// serve:dev를 다시 해줘야 됨.
fixfile(webpackconfigdevpath, "publicPath: '/'", "publicPath: 'http://192.168.1.16:3000/'")
// device-discover-button의 electron api에서 nodejs 라이브러리를 사용함.
appendContent(webpackconfigdevpath, "target: 'electron-renderer',", 36)

// 7. fix @things-factory/shell's js src
fixfile(indexpath, '<base href="/" />', '<base href="./" />')
// const indexpath = './node_modules/@things-factory/shell/_index.html'
// fixfile(
//   indexpath,
//   '<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>',
// )

fixfile(
  './node_modules/@things-factory/i18n-base/client/i18next-config.js',
  "loadPath: '/assets/locales/{lng}.json'",
  "loadPath: './assets/locales/{lng}.json'"
)

// Fetch API cannot load file://authcheck/. URL scheme must be "http" or "https" for CORS request.
fixfile(
  './node_modules/@things-factory/shell/client/reducers/app.js',
  'baseUrl: location.origin,',
  "baseUrl: localStorage.getItem('things-factory.shell.BASE_URL'),"
)

// Fetch API cannot load file:///graphql. URL scheme "file" is not supported.
fixfile(
  './node_modules/@things-factory/shell/client/graphql-client.js',
  '  GRAPHQL_URI,',
  "  uri: localStorage.getItem('things-factory.shell.BASE_URL') + uri,"
)

// static html file: ex: find <setting>
appendContent(
  './node_modules/@things-factory/shell/client/actions/route.js',
  " if (path.indexOf('/android_asset/www/') >= 0) { path = path.replace('/android_asset/www/', '192.168.1.16:3000/') }",
  10
)

var bodyappend = `
    <script>
      function getbaseUrl() {
        return localStorage.getItem('things-factory.shell.BASE_URL');
      }

      if (!document.getElementById('mainjs')) {
        var s = document.createElement('script');
        s.setAttribute('id','mainjs');
        s.setAttribute('type','text/javascript');
        s.setAttribute('src', localStorage.getItem('things-factory.shell.BASE_URL') + '/main.js');
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(s);
      }
    </script>
`

var ssdplogic = `
    <script>
      const BASE_URL = localStorage.getItem('things-factory.shell.BASE_URL');
      if (!BASE_URL) {
        localStorage.setItem('things-factory.shell.BASE_URL', location.origin)
      }

      // 소스가 apk에 내장이 아닐때는 src서버주소도 얻어와야 함.
      // document.addEventListener(
      //   'deviceready',
      //   () => {
      //     if (!ssdp) {
      //       return
      //     }

      //     ssdp.listen(
      //       null,
      //       (message) => {
      //         console.log('listen success:', message)
      //       },
      //       error => {
      //         console.warn('listen error:', error)
      //       }
      //     )

      //     ssdp.search(
      //       this.st,
      //       result => {
      //         console.log('search success:', result)
      //         // TODO: fix app server url reload
      //       },
      //       error => {
      //         console.log('search error:', error)
      //       }
      //     )
      //   },
      //   false
      // );
    </script>
`

// static html file: ex: find <setting>
// appendContent(indexpath, bodyappend + ssdplogic, 97)
appendContent(indexpath, ssdplogic, 96)


