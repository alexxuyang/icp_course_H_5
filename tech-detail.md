motoko合约部分，大多数的逻辑与设计，请参考[课程4的详细描述](https://github.com/alexxuyang/icp_course_H_4) 和 [课程3的详细描述](https://github.com/alexxuyang/icp_course_H_3)

### canister状态自动更新

```javascript
  system func heartbeat() : async () {
    let ic : IC.Self = actor("aaaaa-aa");
    for( canister_id in canisterStatus.keys()) {
      try {
        let result = await ic.canister_status({canister_id});
        canisterStatus.put(canister_id, result.status);
      } catch e {
        Debug.print(debug_show(Error.message(e)));
      }
    }
  };
```

通过系统函数heartbeat，周期性的更新所有的canister的状态，并保存

## 前端程序

前端使用了reactjs框架，大多代码都在[App.jsx](src/icp_course_H_5_assets/src/App.jsx)

### 状态state

```javascript
  const [proposals, setProposals] = useState([]);
  const [team, setTeam] = useState([]);
  const [canisters, setCanisters] = useState([]);
  const [canistersM, setCanistersM] = useState([]);
  const [canistersStatus, setCanistersStatus] = useState([]);
  const [M, setM] = useState('');
  const [N, setN] = useState('');
```

- 提议：proposals
- DAO团队成员：team
- canister列表：canisters
- canister多签状态：canistersM（true，false）
- canister状态：canistersStatus（stopping，running，stopped）
- DAO模式：M，N

这部分数据，会周期性的从后端获取

```javascript
  const [principal, setPrincipal] = useState(null);
  const [logined, setLogined] = useState(false);
```

- principal：已登录用户的principal ID
- logined：是否登录

```javascript
  const [processing, setProcessing] = useState(false);
```

- processing：是否有正在处理的操作，用在禁用按钮、显示loading动画

```javascript
  const [createCanister, setCreateCanister] = useState(false);
  const [startCanister, setStartCanister] = useState(false);
  const [stopCanister, setStopCanister] = useState(false);
  const [deleteCanister, setDeleteCanister] = useState(false);
  const [installCode, setInstallCode] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState(false);
  const [uninstallCode, setUninstallCode] = useState(false);
  const [addPermission, setAddPermission] = useState(false);
  const [removePermission, setRemovePermission] = useState(false);
  const [opCanisterId, setOpCanisterId] = useState(null);

  const [approveProposal, setApproveProposal] = useState(false);
  const [refuseProposal, setRefuseProposal] = useState(false);
  const [proposalId, setProposalId] = useState(null);
```

- 精确控制每个按钮的动画，需要这些state状态

```javascript
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [cp_show, setCPShow] = useState(false);
  const handleCPClose = () => setCPShow(false);
  const handleCPShow = () => setCPShow(true);
  
  // when deal with install / upgrade code, save ID & op
  const [canisterId, setCanisterId] = useState(null);
  const [operation, setOperation] = useState(null);
```

- 模态对话框相关的state状态

***

```javascript
  async function auth() {
    authClient = await AuthClient.create();

    let identity = localStorage.getItem("ic-identity");
    let delegation = localStorage.getItem("ic-delegation");

    if (authClient && identity && delegation) {
      const identity = await authClient.getIdentity();
      if (identity) {
        setupIdentityAndAgent(identity);
      }
    }
  }

  let authClient;
  let agent;
  let webapp;
```

- auth函数，每次页面刷新都会执行
- 从local storage中读取ic相关数据，并恢复authclient、identity
- 设置identity到state中
- 全局变量authClient、agent（http agent）、webapp（actor）

```javascript
  const checkValidOwner = () => {
      ...
  }
```

- 检查是否是有效的登录用户

```javascript
  const handleProposal = async (id, op) => {
    if(!checkValidOwner()) return;

    console.log("handleProposal", id, op);

    setProcessing(true);
    setProposalId(id);
    eval( "set" + op.charAt(0).toUpperCase() + op.slice(1) + "(true)");

    try {
      await sleep(1000 * 3);
      
      let result = op === 'approveProposal'? await webapp.approve(parseInt(id)) : await webapp.refuse(parseInt(id));
    } catch (e) {
      console.log(e);
    } finally {
      setProcessing(false);
      setProposalId(null);
      eval( "set" + op.charAt(0).toUpperCase() + op.slice(1) + "(false)");
    }
  }
```

- 处理用户点击了“同意” 或者 “拒绝”按钮
- 检查用户有效性
- 设置相关状态
- 设置操作按钮状态为true
- 为了达到ic真实网络的效果，这里让操作sleep了3秒
- 调用webapp的approve函数 或者 refuse函数
- webapp即是在authclient中设置的，带有identity身份的actor对象

```javascript
  // final step to process canister's action
  const handleCanisterAction = async (canister_id, op, content) => {
    if(!checkValidOwner()) return;

    setProcessing(true);

    if (op !== 'createCanister' && op != "addMember") {
      setOpCanisterId(canister_id);
    }

    eval( "set" + op.charAt(0).toUpperCase() + op.slice(1) + "(true)");

    let type = {};
    type[op] = null;

    await sleep(1000 * 3);

    try {
      console.log(canister_id, op, type);
      let result = await webapp.propose(type, canister_id? [Principal.fromText(canister_id)] : [], content? [content] : []);
    } catch (e) {
      console.log(e);
    } finally {
      setProcessing(false);
      setOpCanisterId(null);
      eval( "set" + op.charAt(0).toUpperCase() + op.slice(1) + "(false)");
    }
  }
```

- 检查用户有效性
- 设置相关状态
- 设置操作目标canister id
- 设置操作按钮状态为true
- 为了达到ic真实网络的效果，这里让操作sleep了3秒
- 调用webapp的propose函数

```javascript
  const handleCreateCanister = async() => {
    ...
  }
  
  const handleCodeAction = async (canister_id, op) => {
    ...
  }

  const handleCPAction = async (action) => {
    ...
  }  
```

几个辅助函数
- handleCreateCanister：用户点击了创建canister的辅助函数；最终会调用handleCanisterAction函数
- handleCodeAction：用户点击了安装代码 或者 升级代码，显示模态对话框的辅助函数
- handleCPAction：用户关闭了安装代码、升级代码的模态对话框，之后的辅助函数；最终会调用handleCanisterAction函数

***

```javascript
  const handLoginClick = async () => {
    authClient.login({
      identityProvider: IIs_server_url,
      maxTimeToLive: BigInt(24) * BigInt(3_600_000_000_000),
      onSuccess: async () => {
        const identity = await authClient.getIdentity();
        
        setupIdentityAndAgent(identity);
      }
    });
  }
```

- 处理登录的函数，使用authClient打开新网页并授权
- onSuccess回调函数，设置identity和agent

```javascript
  const setupIdentityAndAgent = (identity) => {
    agent = new HttpAgent({ identity });

    if (process.env.NODE_ENV !== "production") {
      agent.fetchRootKey().catch((err) => {
        console.log(err);
      });
    }

    webapp = Actor.createActor(idlFactory, {
      agent,
      canisterId: main_canister_id,
    });

    console.log(identity);

    setPrincipal(identity.getPrincipal().toText());
    setLogined(true);
  }
```

- 创建agent和webapp对象
- 并将这些对象放置于state中
- 在auth 和 handLoginClick中会调用setupIdentityAndAgent函数

```javascript
  const getData = async () => {
    ...
  }
```

- 调用DAO的公共查询接口，获取所有的公开数据，并保存在state中
