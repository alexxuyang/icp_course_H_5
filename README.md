## 说明

以下称本项目为：DAO管理工具

如果你希望在本地跑DAO管理工具，所有依赖工具的版本为：
- dfx：0.9.3
- python: 2.7.18
- nodejs: v14.18.1
- rust: rustc 1.61.0 (fe5b13d68 2022-05-18)

除了本仓库外，还需要[internet identity](https://github.com/dfinity/internet-identity)\
请checkout这个[commit](https://github.com/dfinity/internet-identity/commit/8d160c5a071742d425d02ce46ea347dc3496a620)\

## 启动程序

### 启动DAO管理工具

进入本项目根目录，安装依赖：\
```
npm i
```

启动dfx服务：\
```
dfx start --clean
```
[启动dfx服务](https://github.com/alexxuyang/icp_course_H_5/blob/main/images/001.png)

部署motoko合约：\
```
dfx deploy --with-cycles=5000000000000 --argument '(2, vec {principal "cnh44-cjhoh-yyoqz-tcp2t-yto7n-6vlpk-xw52p-zuo43-rrlge-4ozr5-6ae"; principal "ndb4h-h6tuq-2iudh-j3opo-trbbe-vljdk-7bxgi-t5eyp-744ga-6eqv6-2ae"; principal "lzf3n-nlh22-cyptu-56v52-klerd-chdxu-t62na-viscs-oqr2d-kyl44-rqe"})'
```
[部署motoko合约](https://github.com/alexxuyang/icp_course_H_5/blob/main/images/002.png)

### 启动II服务

进入II服务目录：\
```
cd ./demos/using-dev-build
```

启动II dfx服务：\
```
dfx start --background --clean
```
[启动II dfx服务](https://github.com/alexxuyang/icp_course_H_5/blob/main/images/003.png)

Clean安装npm依赖：\
```
npm i --save @dfinity/agent @dfinity/candid @dfinity/authentication @dfinity/identity @dfinity/principal
npm ci
```

启动II motoko合约：\
```
dfx deploy --no-wallet --argument '(null)'
```
[启动II motoko合约](https://github.com/alexxuyang/icp_course_H_5/blob/main/images/004.png)

## 链接与服务

如果一切正常的话，我们得到了这些服务：
- DAO管理工具的dfx服务 与 II的dfx服务
- DAO管理工具前端服务：http://127.0.0.1:8000/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai
- DAO管理工具Candid服务：http://127.0.0.1:8000/?canisterId=r7inp-6aaaa-aaaaa-aaabq-cai&id=rrkah-fqaaa-aaaaa-aaaaq-cai
- DAO管理工具合约candid ID：rrkah-fqaaa-aaaaa-aaaaq-cai
- II前端服务：http://0.0.0.0:8000/?canisterId=rno2w-sqaaa-aaaaa-aaacq-cai
- II合约candid ID：rkp4c-7iaaa-aaaaa-aaaca-cai

可能你得到的ID和我不一致，请仔细查阅终端的输出并找到相关信息。

