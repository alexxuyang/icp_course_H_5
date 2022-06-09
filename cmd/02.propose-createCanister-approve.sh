#!/usr/bin/ic-repl

identity default "./id1.pem";
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";
call canister.propose(variant {createCanister}, null, null);
let proposal_id1 = _.id;
call canister.approve(proposal_id1);
