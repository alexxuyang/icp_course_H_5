import React, { useState, useEffect } from 'react';
import { icp_course_H_5 } from "../../declarations/icp_course_H_5";
import { AuthClient } from "@dfinity/auth-client";

let authClient;

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

  async function auth() {
    authClient = await AuthClient.create();
  }

  function handClick() {
    authClient.login({
      identityProvider: "https://identity.ic0.app/",
      onSuccess: () => {
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal().toText());
      }
    });
  }

  async function getProposals() {
    const proposals = await icp_course_H_5.get_proposals();
    setProposals(proposals);
    console.log(proposals);
  }

  async function getTeam() {
    const team = await icp_course_H_5.get_owner_list();
    setTeam(team);
    console.log(team);
  }

  async function getCanisters() {
    const canisters = await icp_course_H_5.get_owned_canisters_list();
    
    let canistersM = new Array(canisters.length);

    for(var i = 0; i < canisters.length; i++) {
      canistersM[i] = await icp_course_H_5.get_permission(canisters[i]);
    }

    setCanisters(canisters);
    setCanistersM(canistersM);

    console.log(canisters);
    console.log(canistersM);
  }

  useEffect(() => {
    auth();

    getProposals();
    getTeam();
    getCanisters();

    const interval = setInterval(() => {
      getProposals();
      getTeam();
      getCanisters();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ "fontSize": "20px" }}>
      
      <button type="button" className=".btn-primary" onClick={handClick}>登录</button>

      <div style={{ "backgroundColor": "#AAB7B8", "fontSize": "30px" }}>
        <p>已登录用户Principal：<b>{principal}</b></p>
      </div>

      <div style={{ "backgroundColor": "#e0b0ab", "fontSize": "30px" }}>
        <p><b>DAO controlled cycles wallets!</b></p>
      </div>
      
      <div style={{ "backgroundColor": "#d0cb8c", "fontSize": "30px" }}>
        <p><b>DAO Team Members</b></p>
      </div>
        <table className="table table-striped">
          <tbody>
            {
              team.map(t => {
                return (
                  <tr key={t.toString()}><td>{t.toString()}</td></tr>
                )
              })
            }
          </tbody>
        </table>

      <div style={{ "backgroundColor": "#8eee23", "fontSize": "30px" }}>
        <p><b>Proposals List</b></p>
      </div>
      
        <div  style={{ "fontSize": "20px" }}>
        <table className="table table-striped">
            <thead className="thead-dark">
            <tr>
                <td width="50">ID</td>
                <td width="250">Type</td>
                <td width="250">CanisterID</td>
                <td width="300">Proposer</td>
                <td width="300">Approvers</td>
                <td width="300">Refusers</td>
                <td width="100">WasmHash(SHA256)</td>
                <td width="100">Finished</td>
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
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
        </div>
        
        <div style={{ "backgroundColor": "#bdbdbd", "fontSize": "30px" }}>
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