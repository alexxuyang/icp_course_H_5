由于牵涉很多自动化操作，我们要测试DAO管理工具并不容易

好在我们有[ic-repl](https://github.com/chenyan2002/ic-repl)工具，可以自动执行测试脚本，切换principal身份，调用motoko合约，并做简单的assertion

./cmd目录上，包括了：
- 所有和ic-repl相关的脚本
- 三个principal identity pem文件，id1.pem、id2.pem、id3.pem
- 在做代码操作时，需要的两个wasm文件，hello.wasm、hello_2.wasm

我们来分析一下这个文件 [01.create-install-start-call.sh](cmd/01.create-install-start-call.sh)

```shell
#!/usr/bin/ic-repl

//---------------SETUP---------------//

import DAO = "rrkah-fqaaa-aaaaa-aaaaq-cai";
let wasm_code = opt file "hello.wasm";

//---------------CREATE CANISTER---------------//

// change to id1
identity default "./id1.pem";

// propose to create canister
call DAO.propose(variant {createCanister}, null, null);
let proposal_id1 = _.id;

// approve the proposal
call DAO.approve(proposal_id1);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call DAO.approve(proposal_id1);

let canister_id = _.canister_id?;

//---------------INSTALL CODE---------------//

// change to id1
identity default "./id1.pem";

// propose to install code
call DAO.propose(variant {installCode}, opt canister_id, wasm_code);
let proposal_id2 = _.id;

// approve the proposal
call DAO.approve(proposal_id2);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call DAO.approve(proposal_id2);

//---------------START CANISTER---------------//

// change to id1
identity default "./id1.pem";

// propose to start the canister
call DAO.propose(variant {startCanister}, opt canister_id, null);
let proposal_id3 = _.id;

// approve the proposal
call DAO.approve(proposal_id3);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call DAO.approve(proposal_id3);

//---------------CALL CANISTER---------------//

// call the installed canister
call canister_id.greet("world");

assert _ == "Hello, world!";
```

它其实非常的stright forward
- import导入某个canister
- call调用canister的方法
- identity default 切换调用者identity身份

这个脚本包括五个部分
- 基本参数setup
- 创建canister
- 安装代码
- 启动canister
- 调用新创建的canister接口，并做assertion

进入cmd目录后，这样执行：

```
ic-repl ./01.create-install-start-call.sh
```

其它几个脚本文件分别为：
- [02.propose-addMember-approve-approve.sh](cmd/02.propose-addMember-approve-approve.sh)：添加新成员到管理员中，需要在代码中更新新成员的principal ID
- [03.propose-createCanister-approve.sh](cmd/03.propose-createCanister-approve.sh)：新建一个“创建canister”提议，并批准它
- [04.propose-installCanister-approve.sh](cmd/04.propose-installCanister-approve.sh)：新建一个“安装代码”提议，并批准它，需要在代码中更新目标canister ID
