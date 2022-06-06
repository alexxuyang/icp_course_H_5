#!/usr/bin/ic-repl
// assume we already installed the greet canister

// change to id1
identity default "./id1.pem";

// import the default canister, need: dfx start --clean
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";

// setup three Principals, multi-sig model is 2 / 3 
// call canister.init(vec {principal "cnh44-cjhoh-yyoqz-tcp2t-yto7n-6vlpk-xw52p-zuo43-rrlge-4ozr5-6ae"; principal "ndb4h-h6tuq-2iudh-j3opo-trbbe-vljdk-7bxgi-t5eyp-744ga-6eqv6-2ae"; principal "lzf3n-nlh22-cyptu-56v52-klerd-chdxu-t62na-viscs-oqr2d-kyl44-rqe"}, 2);

//---------------CREATE CANISTER---------------//

// propose to create a canister by id1
call canister.propose(variant {createCanister}, null, null);
let proposal_id1 = _.id;

// approve the above proposal by id1
call canister.approve(proposal_id1);

// change to id2
identity default "./id2.pem";

// approve this proposal by id2, and execute the creating canister
call canister.approve(proposal_id1);

let canister_id = _.canister_id?;

//---------------INSTALL CODE---------------//

// change to id1
identity default "./id1.pem";

// propose to install code into above canister by id1
call canister.propose(variant {installCode}, opt canister_id, opt file "hello.wasm");
let proposal_id2 = _.id;

// approve the proposal by id1
call canister.approve(proposal_id2);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call canister.approve(proposal_id2);

//---------------START CANISTER---------------//

// change to id1
identity default "./id1.pem";

// propose to start the canister by id1
call canister.propose(variant {startCanister}, opt canister_id, null);
let proposal_id3 = _.id;

// approve the proposal by id1
call canister.approve(proposal_id3);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call canister.approve(proposal_id3);

//---------------CALL CANISTER---------------//

// call the installed canister
call canister_id.greet("world");

assert _ == "Hello, world!";

//---------------STOP CANISTER---------------//

// change to id3
identity default "./id3.pem";

// propose to stop the canister by id3
call canister.propose(variant {stopCanister}, opt canister_id, null);
let proposal_id4 = _.id;

// approve the proposal by id3
call canister.approve(proposal_id4);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call canister.approve(proposal_id4);

//---------------UPGRADE CODE---------------//

// change to id3
identity default "./id3.pem";

// propose to stop the canister by id3
call canister.propose(variant {upgradeCode}, opt canister_id, opt file "hello_2.wasm");
let proposal_id5 = _.id;

// approve the proposal by id3
call canister.approve(proposal_id5);

// change to id2
identity default "./id2.pem";

// approve the proposal by id2
call canister.approve(proposal_id5);

//---------------START CANISTER---------------//

// change to id1
identity default "./id1.pem";

// propose to start the canister by id1
call canister.propose(variant {startCanister}, opt canister_id, null);
let proposal_id6 = _.id;

// approve the proposal by id1
call canister.approve(proposal_id6);

// change to id3
identity default "./id3.pem";

// approve the proposal by id3
call canister.approve(proposal_id6);

//---------------CALL CANISTER---------------//

// call the installed canister
call canister_id.greet("world");

assert _ == "你好, world!";