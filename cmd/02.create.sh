#!/usr/bin/ic-repl
// assume we already installed the greet canister

// change to id1
identity default "./id1.pem";

// import the default canister, need: dfx start --clean
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";

//---------------CREATE CANISTER---------------//

// propose to create a canister by id1
call canister.propose(variant {createCanister}, null, null);
let proposal_id1 = _.id;

// approve the above proposal by id1
call canister.approve(proposal_id1);
