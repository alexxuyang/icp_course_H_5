import { icp_course_H_5, idlFactory, canisterId as main_canister_id } from "../../declarations/icp_course_H_5";

import React, { useState, useEffect } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';

import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

import sleep from 'await-sleep';
import { useFilePicker } from 'use-file-picker';
import { sha256 } from 'js-sha256';
import _ from 'lodash';

let authClient;
let agent;
let webapp;

const IIs_server_url = process.env.NODE_ENV === "production"? "https://identity.ic0.app/" : "http://localhost:8000/?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai";

function type_to_text(t) {
  return Object.getOwnPropertyNames(t)[0];
}

function principal_to_short(t) {
  if (!t) return "";
  
  return t.toText().substr(0,11) + "..."
}

function toHexString(byteArray) {
  if (byteArray.length === 0) return;

  let result = Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  return result.substr(0, 4) + "...." + result.substr(-4);
}

function App() {
  const [proposals, setProposals] = useState([]);
  const [team, setTeam] = useState([]);
  const [canisters, setCanisters] = useState([]);
  const [canistersM, setCanistersM] = useState([]);
  const [canistersStatus, setCanistersStatus] = useState([]);
  const [M, setM] = useState('');
  const [N, setN] = useState('');

  const [principal, setPrincipal] = useState(null);
  const [logined, setLogined] = useState(false);

  const [processing, setProcessing] = useState(false);

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

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [cp_show, setCPShow] = useState(false);
  const handleCPClose = () => setCPShow(false);
  const handleCPShow = () => setCPShow(true);
  
  // when deal with install / upgrade code, save ID & op
  const [canisterId, setCanisterId] = useState(null);
  const [operation, setOperation] = useState(null);

  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    accept: '.wasm',
    multiple: false,
    readAs: "ArrayBuffer"
  });

  function handleLogoutClick() {
    agent = null;
    webapp = null;
    setLogined(false);
    setPrincipal(null);
    localStorage.removeItem("ic-identity");
    localStorage.removeItem("ic-delegation");
  }

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

  // check user is a valid owner and logined
  const checkValidOwner = () => {
    if (!logined || 
      !webapp ||
      !(principal && team.some(e => e.toString() == principal))
    ) {
      handleShow();
      return false;
    }

    return true;
  }
  
  const isApproverOrRefuser = (id) => {
    let proposal;
    for (let p of proposals) {
      if (p.id.toString() === id) {
        proposal = p;
        break;
      }
    }

    if (!proposal) return;

    if (proposal) {
      return proposal.approvers.some(e => e.toText() === principal) ||
            proposal.refusers.some(e => e.toText() === principal)
    }

    return false;
  }

  // user click proposal action: approve / refuse
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

  // user click create canister button
  const handleCreateCanister = async() => {
    await handleCanisterAction(null, "createCanister", null);
  }

  // when user close code's model dialog
  const handleCPAction = async (action) => {
    handleCPClose();

    // click cancel or no valid info in state
    if (action === 'cancel' || !canisterId || !operation) {
      setCanisterId(null);
      setOperation(null);
      return;
    };

    // no valid file content selected
    if (!filesContent || !filesContent[0] || !filesContent[0].content) {
      setCanisterId(null);
      setOperation(null);
      return;
    };

    try {
      console.log("sha256 of the file", sha256(new Uint8Array(filesContent[0].content)));

      await handleCanisterAction(canisterId, operation, new Uint8Array(filesContent[0].content));
    } catch (e) {
      console.log(e);
    } finally {
      // set canisterId & operation to null
      setCanisterId(null);
      setOperation(null);
    }
  }

  // when user click install / upgrade button
  const handleCodeAction = async (canister_id, op) => {
    if(!checkValidOwner()) return;
    
    setCanisterId(canister_id)
    setOperation(op);

    handleCPShow();
  }

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

  const getData = async () => {
    try {
      let team = await icp_course_H_5.get_owner_list();
      setTeam(team);
  
      let proposals = await icp_course_H_5.get_proposals();
      proposals.sort((x,y) => {
        let m = parseInt(x.id);
        let n = parseInt(y.id);
        if (m < n) return 1;
        if (m > n) return -1;
        return 0;
      });
      setProposals(proposals);
  
      let r = await icp_course_H_5.get_model();
      setM(r[0].toString());
      setN(r[1].toString());
  
      let canisters = await icp_course_H_5.get_owned_canisters_list();
      let canistersM = new Array(canisters.length);
      let canistersStatus = new Array(canisters.length);
      for(var i = 0; i < canisters.length; i++) {
        canistersM[i] = await icp_course_H_5.get_permission(canisters[i]);
        canistersStatus[i] = await icp_course_H_5.get_status(canisters[i]);
      }
  
      setCanisters(canisters);
      setCanistersM(canistersM);
      setCanistersStatus(canistersStatus);
    } catch (e) {
      console.log(e);
    } finally {
    }
  }

  useEffect(() => {
    auth();
    getData();

    const interval = setInterval(() => {
      getData();
    }, 1000);
    return () => {
      clearInterval(interval);
    };

  }, []);

  return (
    <div style={{ "fontSize": "20px" }}>
      
      <div>
        <Modal show={show} onHide={handleClose}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title><h4>Hey, It's You ^_^</h4></Modal.Title>
          </Modal.Header>
          <Modal.Body><h4>请登录或者您不是管理员！</h4></Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              关闭
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div>
        <Modal show={cp_show} // todo: remove right-upper close button
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title><h4>
              {
                operation === 'installCode'?
                "Install Code on Canister" :
                "Upgrade Code on Canister"
              }
            </h4></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <button onClick={() => openFileSelector()}>选择WASM文件</button>
              <br />
              {filesContent.map((file) => (
                <div key={file.name}>
                  <h2>{file.name} SHA256</h2>
                  <div>{sha256(file.content)}</div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={handleCPAction.bind(this, "cancel")}>
              取消
            </Button>
            <Button variant="primary" onClick={handleCPAction.bind(this, "confirm")}>
              确认
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div style={{ "backgroundColor": "#AAB7B8", "fontSize": "20px" }}>
        <p align="right"><b>
        {logined? "已登录用户Principal：": "尚未登录 "}
        {principal} {''}
        {
          logined
          ? <Button variant="success" onClick={handleLogoutClick}>退出</Button>
          : <Button variant="success" onClick={handLoginClick}>IIs登录</Button>
        }
        </b></p>
      </div>

      <div style={{ "backgroundColor": "#e0b0ab", "fontSize": "20px" }}>
        <p><b>DAO管理的Canisters工具! (模式: {M} / {N})</b></p>
      </div>

        <div>
          <Button disabled={processing} variant="success" onClick={handleCreateCanister}>
            { createCanister ?
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              /> :
              <div/>
            }
            新建Canister
          </Button>
        </div>

        {/* <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner> */}

        <div style={{ "backgroundColor": "#bdbdbd", "fontSize": "20px" }}>
          <p><b>已创建Canisters列表</b></p>
        </div>

        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
                <td>Canister</td>
                <td>DAO Managed</td>
                <td>状态</td>
                <td>操作</td>
            </tr>
            </thead>
          <tbody>
            {
              canisters.map((t,index) => {
                return (
                  <tr key={t.toText()}>
                    <td>{t.toText()}</td>
                    <td>{canistersM[index].toString()}</td>
                    <td>{type_to_text(canistersStatus[index][0])}</td>
                    <td>
                      <div>
                        <Button disabled={processing} variant="danger" onClick={handleCanisterAction.bind(this, t.toText(), "startCanister", null)}>
                          { startCanister && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          启
                        </Button>{' '}
                        <Button disabled={processing} variant="danger" onClick={handleCanisterAction.bind(this, t.toText(), "stopCanister", null)}>
                          { stopCanister && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          停
                        </Button>{' '}
                        <Button disabled={processing} variant="danger" onClick={handleCanisterAction.bind(this, t.toText(), "deleteCanister", null)}>
                          { deleteCanister && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          删
                        </Button>{' '}
                        <Button disabled={processing} variant="warning" onClick={handleCodeAction.bind(this, t.toText(), "installCode")}>
                          { installCode && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          装
                        </Button>{' '}
                        <Button disabled={processing} variant="warning" onClick={handleCodeAction.bind(this, t.toText(), "upgradeCode")}>
                          { upgradeCode && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          升
                        </Button>{' '}
                        <Button disabled={processing} variant="warning" onClick={handleCanisterAction.bind(this, t.toText(), "uninstallCode", null)}>
                          { uninstallCode && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          卸
                        </Button>{' '}
                        <Button disabled={processing} variant="secondary" onClick={handleCanisterAction.bind(this, t.toText(), "addPermission", null)}>
                          { addPermission && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          加
                        </Button>{' '}
                        <Button disabled={processing} variant="secondary" onClick={handleCanisterAction.bind(this, t.toText(), "removePermission", null)}>
                          { removePermission && t.toText() == opCanisterId ?
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            /> :
                            <div/>
                          }
                          减
                        </Button>{' '}
                      </div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>

      <div style={{ "backgroundColor": "#8eee23", "fontSize": "20px" }}>
        <p><b>Proposals List</b></p>
      </div>
      
        <div  style={{ "fontSize": "20px" }}>
        <table className="table table-striped">
            <thead className="thead-dark">
            <tr>
                <td width="50">ID</td>
                <td width="250">类型</td>
                <td width="250">Canister / Principal</td>
                <td width="300">发起人</td>
                <td width="300">审批人</td>
                <td width="300">拒绝人</td>
                <td width="100">Wasm SHA256</td>
                <td width="100">已完成</td>
                <td width="200">操作</td>
            </tr>
            </thead>
            <tbody>
            {
                proposals.map(data => {
                    return (
                        <tr key={data.id.toString()}>
                            <td width="50">{data.id.toString()}</td>
                            <td width="250">{type_to_text(data.ptype)}</td>
                            <td width="250">{principal_to_short(data.canister_id[0])}</td>
                            <td width="300">
                            {
                              principal === data.proposer.toText() ? "我自己": principal_to_short(data.proposer)
                            }
                            </td>
                            <td width="300">
                                {
                                    data.approvers.map(a => {
                                        return (
                                            <li key={principal_to_short(a)}>
                                              {
                                                principal === a.toText() ? "我自己": principal_to_short(a)
                                              }
                                            </li>
                                        )
                                    })
                                }
                            </td>
                            <td width="300">
                                {
                                    data.refusers.map(a => {
                                        return (
                                            <li key={principal_to_short(a)}>
                                              {
                                                principal === a.toText() ? "我自己": principal_to_short(a)
                                              }
                                            </li>
                                        )
                                    })
                                }
                            </td>
                            <td width="100">{toHexString(data.wasm_code_hash)}</td>
                            <td width="100">{data.finished.toString()}</td>
                            <td width="200">
                              {data.finished.toString() !== 'true' && !isApproverOrRefuser(data.id.toString())
                               ?
                                  <div>
                                  <Button disabled={processing} onClick={handleProposal.bind(this, data.id.toString(), 'approveProposal')}>
                                    { approveProposal && proposalId === data.id.toString() ?
                                      <Spinner
                                        as="span"
                                        animation="grow"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                      /> :
                                      <div/>
                                    }
                                    同意
                                  </Button>{' '}
                                  <Button disabled={processing} onClick={handleProposal.bind(this, data.id.toString(), 'refuseProposal')}>
                                    { refuseProposal && proposalId === data.id.toString() ?
                                      <Spinner
                                        as="span"
                                        animation="grow"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                      /> :
                                      <div/>
                                    }
                                    拒绝
                                  </Button>
                                  </div>
                                : <div></div>
                            }
                            </td>
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
        </div>

        <div style={{ "backgroundColor": "#d0cb8c", "fontSize": "20px" }}>
        <p><b>DAO管理员列表</b></p>
        </div>
        <table className="table table-striped">
          <tbody>
            {
              team.map(t => {
                return (
                  <tr style={{color:principal === t.toString() ? "red": ""}} key={t.toString()}><td>{t.toString()} {principal === t.toString() ? "（我自己）": ""}</td></tr>
                )
              })
            }
          </tbody>
        </table>

    </div>
  );
}

export default App;