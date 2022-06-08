#!/usr/bin/ic-repl
// assume we already installed the greet canister

// change to id1
identity default "./id1.pem";

// import the default canister, need: dfx start --clean
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";

//---------------CREATE CANISTER---------------//

// propose to add a member
call canister.propose(variant {addMember}, opt principal "dxfds-mjlxo-wvjpg-5g5gi-dj2x6-hxgss-rlozd-rcrei-4cejo-rb3ii-eae", null);
let proposal_id1 = _.id;

// approve the above proposal by id1
call canister.approve(proposal_id1);

// change to id2
identity default "./id2.pem";

// approve the above proposal by id2
call canister.approve(proposal_id1);
