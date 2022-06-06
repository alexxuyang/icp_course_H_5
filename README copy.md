# icp_course_H_5

安装依赖包
`npm install`


启动服务
`dfx start --clean`


安装canister
```rust
dfx deploy --with-cycles=5000000000000 --argument '(2, vec {principal "cnh44-cjhoh-yyoqz-tcp2t-yto7n-6vlpk-xw52p-zuo43-rrlge-4ozr5-6ae"; principal "ndb4h-h6tuq-2iudh-j3opo-trbbe-vljdk-7bxgi-t5eyp-744ga-6eqv6-2ae"; principal "lzf3n-nlh22-cyptu-56v52-klerd-chdxu-t62na-viscs-oqr2d-kyl44-rqe"})'
```

启动前端本地服务
`npm start`


打开本地网页：http://localhost:8080/


前端的实现，使用了reactjs框架。页面中有几个板块：

- IIs登录
- 多签team member列表
- Proposal提议列表
    - 提议ID
    - 提议类型（添加限权、去除限权、安装代码、升级代码、卸载代码、创建Canister、启动Canister、停止Canister、删除Canister）
    - 议题人Principal
    - 审批人
    - 拒绝人
    - Wasm Code Hash （SHA256）
    - 是否已经完成
- 已安装canister列表


![图片](https://github.com/alexxuyang/icp_course_H_4/blob/main/images/002.png)


执行自动测试脚本
`ic-repl ./create-install-start-call-stop-upgrade-start-call.sh`


并同时观察前端页面的实时变化


该自动测试脚本测试以下流程：


1. 创建canister A
2. 在A上安装代码X（有SHA256生成）
3. 启动canister A
4. 调用canister的greet方法，输出为：“hello, xxx!”
5. 停止canister A
6. 升级代码为Y （有SHA256生成）
7. 启动canister A
8. 调用canister的greet方法，输出为：“你好, xxx!”


以上步骤1、2、3、5、6、7都是通过2/3多签方式

自动测试的过程，可以参见这个[视频](https://youtu.be/Rnbikpvwb9Q)  

注意该演示过程中，由于第2、6步骤将wasm code上传到服务端并实时在服务端计算wasm code的SHA256值。

该步骤非常耗时，第一次 0:48 到 1:18 半分钟时间，第二次 1:40 到 2:08 28秒的时间。看上去像是视频没有反应，实际上是后台在计算SHA256🤣🤣

如果使用Base库中的hash算法（非常快），可以参见这个[视频](https://youtu.be/_-YO9iXb3KM)

同时也实现了集成IIs的功能，参见这个[视频](https://youtu.be/oNFTLreH0eM)
