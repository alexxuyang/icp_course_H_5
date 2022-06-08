#!/usr/bin/ic-repl

identity default "./id1.pem";
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";

//---------------CREATE CANISTER---------------//

call canister.propose(variant {createCanister}, null, null);
let proposal_id1 = _.id;
call canister.approve(proposal_id1);

let canister_id = _.canister_id?;

//---------------INSTALL CODE---------------//

call canister.propose(variant {installCode}, opt canister_id, opt file "hello.wasm");
let proposal_id2 = _.id;
call canister.approve(proposal_id2);

//---------------START CANISTER---------------//

call canister.propose(variant {startCanister}, opt canister_id, null);
let proposal_id3 = _.id;
call canister.approve(proposal_id3);

//---------------CALL CANISTER---------------//

call canister_id.greet("world");
assert _ == "Hello, world!";
