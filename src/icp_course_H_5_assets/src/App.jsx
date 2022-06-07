import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from "@dfinity/agent";
import { icp_course_H_5, idlFactory, canisterId } from "../../declarations/icp_course_H_5";
import { AuthClient } from "@dfinity/auth-client";
import { Button, Modal } from 'react-bootstrap';

let authClient;
let agent;
let webapp;

const IIs_server_url = process.env.NODE_ENV === "production"? "https://identity.ic0.app/" : "http://localhost:8000/?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai";

function type_to_text(t) {
    return Object.getOwnPropertyNames(t)[0]
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
  const [principal, setPrincipal] = useState('');
  const [logined, setLogined] = useState(false);
  const [M, setM] = useState('');
  const [N, setN] = useState('');

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function handleLogoutClick() {
    agent = null;
    webapp = null;
    setLogined(false);
    setPrincipal('');
  }  

  async function auth() {
    authClient = await AuthClient.create();
  }

  const handleApproveProposal = async (id) => {
    console.log("handleApproveProposal", id);

    if (!logined) {
      handleShow();
      return;
    }

    let result = await webapp.approve(parseInt(id));
  }

  const handleRefuseProposal = async (id) => {
    console.log("handleRefuseProposal", id);

    if (!logined) {
      setShow(true);
      return;
    }

    let result = await webapp.refuse(parseInt(id));
  }

  const handClick = async () => {
    authClient.login({
      identityProvider: IIs_server_url,
      onSuccess: async () => {
        const identity = await authClient.getIdentity();
        agent = new HttpAgent({ identity });

        console.log(agent);

        if (process.env.NODE_ENV !== "production") {
          agent.fetchRootKey().catch((err) => {
            console.log(err);
          });
        }

        webapp = Actor.createActor(idlFactory, {
          agent,
          canisterId: canisterId,
        });

        console.log(identity);
        console.log(agent);
        console.log(webapp);

        setPrincipal(identity.getPrincipal().toText());
        setLogined(true);
      }
    });
  }

  const getData = async () => {
    const team = await icp_course_H_5.get_owner_list();
    setTeam(team);
    // console.log(team);

    const proposals = await icp_course_H_5.get_proposals();
    setProposals(proposals);
    // console.log(proposals);

    const r = await icp_course_H_5.get_model();
    setM(r[0].toString());
    setN(r[1].toString());

    const canisters = await icp_course_H_5.get_owned_canisters_list();
    let canistersM = new Array(canisters.length);
    for(var i = 0; i < canisters.length; i++) {
      canistersM[i] = await icp_course_H_5.get_permission(canisters[i]);
    }

    setCanisters(canisters);
    setCanistersM(canistersM);

    // console.log(canisters);
    // console.log(canistersM);
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
          <Modal.Body><h4>Woohoo, you're reading this text coz you aren't logined!</h4></Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div>
        
        <div>
        {logined
          ? <Button  variant="success" onClick={handleLogoutClick}>Logout</Button>
          : <Button  variant="success" onClick={handClick}>IIs Login</Button> 
        }
        Already logined？{logined? "Yes": "No"}
        <br/>
        </div>
      </div>

      <div style={{ "backgroundColor": "#AAB7B8", "fontSize": "20px" }}>
        <p><b>Logined User Principal：{principal}</b></p>
      </div>

      <div style={{ "backgroundColor": "#e0b0ab", "fontSize": "20px" }}>
        <p><b>DAO controlled cycles wallets! (Model: {M} / {N})</b></p>
      </div>
      
      <div style={{ "backgroundColor": "#d0cb8c", "fontSize": "20px" }}>
        <p><b>DAO Team Members</b></p>
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

      <div style={{ "backgroundColor": "#8eee23", "fontSize": "20px" }}>
        <p><b>Proposals List</b></p>
      </div>
      
        <div  style={{ "fontSize": "20px" }}>
        <table className="table table-striped">
            <thead className="thead-dark">
            <tr>
                <td width="50">ID</td>
                <td width="250">Type</td>
                <td width="250">Canister / Principal</td>
                <td width="300">Proposer</td>
                <td width="300">Approvers</td>
                <td width="300">Refusers</td>
                <td width="100">WasmHash(SHA256)</td>
                <td width="100">Finished</td>
                <td width="100">Actions</td>
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
                            <td width="300">{principal_to_short(data.proposer)}</td>
                            <td width="300">
                                {
                                    data.approvers.map(a => {
                                        return (
                                            <li key={principal_to_short(a)}>{principal_to_short(a)}</li>
                                        )
                                    })
                                }
                            </td>
                            <td width="300">
                                {
                                    data.refusers.map(a => {
                                        return (
                                            <li key={principal_to_short(a)}>{principal_to_short(a)}</li>
                                        )
                                    })
                                }
                            </td>
                            <td width="100">{toHexString(data.wasm_code_hash)}</td>
                            <td width="100">{data.finished.toString()}</td>
                            <td width="100">
                              {data.finished.toString() !== 'true'
                               ?  
                                  <div>
                                  <Button onClick={handleApproveProposal.bind(this, data.id.toString())}>Approve</Button>
                                  <Button onClick={handleRefuseProposal.bind(this, data.id.toString())}>Refuse</Button>
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
        
        <div style={{ "backgroundColor": "#bdbdbd", "fontSize": "20px" }}>
          <p><b>Installed Canisters List</b></p>
        </div>

        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
                <td>Canister</td>
                <td>DAO Managed</td>
            </tr>
            </thead>
          <tbody>
            {
              canisters.map((t,index) => {
                return (
                  <tr key={t.toText()}>
                    <td>{t.toText()}</td>
                    <td>{canistersM[index].toString()}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>

    </div>
  );
}

export default App;