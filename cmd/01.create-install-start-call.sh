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